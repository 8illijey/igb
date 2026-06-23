// 진단 — 대표 품목별로 365일 시계열을 받아 '데이터 없는 달'을 보고한다.
// 실행: cd mobile && node scripts/check-missing-months.mjs
import fs from 'node:fs';

const env = fs.readFileSync(new URL('../.env', import.meta.url), 'utf8');
const getEnv = (k) => (env.match(new RegExp(`${k}=(.*)`)) || [])[1]?.trim() || '';
const KEY = getEnv('EXPO_PUBLIC_KAMIS_KEY');
const ID = getEnv('EXPO_PUBLIC_KAMIS_ID');
const BASE = 'https://www.kamis.or.kr/service/price/xml.do';
const CATEGORIES = ['100', '200', '400', '500'];

const qs = (p) =>
  Object.entries({ p_cert_key: KEY, p_cert_id: ID, p_returntype: 'json', ...p })
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
const fmtDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parsePrice = (v) => {
  if (typeof v !== 'string' || v === '-' || v === '' || v === '0') return null;
  const n = Number(v.replace(/,/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
};

async function fetchCategory(categoryCode, regday) {
  const url = `${BASE}?${qs({
    action: 'dailyPriceByCategoryList',
    p_product_cls_code: '01',
    p_country_code: '1101',
    p_regday: regday,
    p_convert_kg_yn: 'N',
    p_item_category_code: categoryCode,
  })}`;
  const r = await fetch(url);
  if (!r.ok) return [];
  const rows = (await r.json())?.data?.item ?? [];
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((x) => x.item_name && x.item_code)
    .map((x) => {
      const ladder = [x.dpr1, x.dpr2, x.dpr3, x.dpr4].map(parsePrice);
      return {
        categoryCode,
        itemName: String(x.item_name),
        itemCode: String(x.item_code),
        kindCode: String(x.kind_code ?? '00'),
        rankCode: String(x.rank_code ?? '04'),
        today: ladder.find((v) => v != null) ?? null,
      };
    });
}

async function fetchAllItems() {
  const load = async (regday) => {
    const res = await Promise.allSettled(CATEGORIES.map((c) => fetchCategory(c, regday)));
    return res.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  };
  const withToday = (arr) => arr.filter((i) => i.today != null).length;
  let items = await load(fmtDate(new Date()));
  for (let back = 1; back <= 7 && withToday(items) < 30; back++) {
    const d = new Date();
    d.setDate(d.getDate() - back);
    const next = await load(fmtDate(d));
    if (withToday(next) > withToday(items)) items = next;
  }
  const seen = new Set();
  return items.filter((i) => {
    const k = `${i.itemCode}-${i.kindCode}`;
    if (seen.has(k) || i.today == null) return false;
    seen.add(k);
    return true;
  });
}

async function monthCoverage(item) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 365);
  const ranks = item.categoryCode === '500' ? ['1', '2'] : [item.rankCode, '04', '05'];
  for (const rank of [...new Set(ranks)]) {
    const url = `${BASE}?${qs({
      action: 'periodProductList',
      p_productclscode: '01',
      p_startday: fmtDate(start),
      p_endday: fmtDate(end),
      p_itemcategorycode: item.categoryCode,
      p_itemcode: item.itemCode,
      p_kindcode: item.kindCode,
      p_productrankcode: rank,
      p_countycode: '1101',
      p_convert_kg_yn: 'N',
    })}`;
    const r = await fetch(url);
    if (!r.ok) continue;
    const rows = (await r.json())?.data?.item ?? [];
    if (!Array.isArray(rows) || rows.length === 0) continue;
    const cnt = Array(12).fill(0);
    for (const row of rows) {
      if (row.countyname !== '평균') continue;
      if (parsePrice(row.price) == null) continue;
      const mm = parseInt(String(row.regday).split('/')[0], 10) - 1;
      if (mm >= 0 && mm < 12) cnt[mm] += 1;
    }
    return cnt;
  }
  return Array(12).fill(0);
}

(async () => {
  const items = await fetchAllItems();
  console.log(`대표 품목 ${items.length}개 점검...\n`);
  const report = [];
  for (const it of items) {
    const cnt = await monthCoverage(it).catch(() => Array(12).fill(0));
    const missing = cnt.map((c, m) => (c === 0 ? m + 1 : null)).filter((m) => m != null);
    if (missing.length) report.push({ name: it.itemName, missing, filled: 12 - missing.length });
  }
  report.sort((a, b) => b.missing.length - a.missing.length);
  console.log(`데이터 빈 달이 있는 품목: ${report.length}/${items.length}\n`);
  for (const r of report) {
    console.log(`  ${r.name.padEnd(10)} 빈달[${r.missing.join(',')}]  (있는 달 ${r.filled}/12)`);
  }
})().catch((e) => console.error('ERR', e.message));
