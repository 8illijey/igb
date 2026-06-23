// KAMIS 응답 진단 — 가격이 안 뜨는 8개 품목이 실제로 어떤 값으로 오는지 그대로 출력.
// 실행: cd mobile && node scripts/kamis-debug.mjs
import fs from 'node:fs';

const env = fs.readFileSync(new URL('../.env', import.meta.url), 'utf8');
const get = (k) => (env.match(new RegExp(k + '=(.*)')) || [])[1]?.trim() || '';
const KEY = get('EXPO_PUBLIC_KAMIS_KEY');
const ID = get('EXPO_PUBLIC_KAMIS_ID');
const BASE = 'https://www.kamis.or.kr/service/price/xml.do';
const CATS = ['100', '200', '400', '500'];
const WANT = ['양파', '양배추', '미나리', '팥', '피망', '망고', '생강', '수박'];

const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const qs = (p) =>
  Object.entries({ p_cert_key: KEY, p_cert_id: ID, p_returntype: 'json', ...p })
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');

async function cat(code, regday) {
  const url = `${BASE}?${qs({
    action: 'dailyPriceByCategoryList',
    p_product_cls_code: '01',
    p_country_code: '1101',
    p_regday: regday,
    p_convert_kg_yn: 'N',
    p_item_category_code: code,
  })}`;
  const r = await fetch(url);
  const j = await r.json();
  return { code, error: j?.data?.error_code, rows: Array.isArray(j?.data?.item) ? j.data.item : [] };
}

(async () => {
  console.log('KEY len', KEY.length, '| ID', ID);
  const today = fmt(new Date());
  console.log('기준일(당일):', today, '\n');

  for (const c of CATS) {
    const { code, error, rows } = await cat(c, today);
    console.log(`=== category ${code} | error_code=${JSON.stringify(error)} | rows=${rows.length} ===`);
    const hits = rows.filter((r) => WANT.some((w) => String(r.item_name || '').includes(w)));
    if (hits.length === 0) {
      console.log('  (이 카테고리엔 대상 품목 없음)');
    }
    for (const r of hits) {
      console.log(
        `  ${String(r.item_name).padEnd(8)} code=${r.item_code} kind=${r.kind_code}/${r.kind_name ?? ''} unit=${r.unit ?? ''}\n` +
        `      dpr1=${r.dpr1}  dpr2=${r.dpr2}  dpr3=${r.dpr3}  dpr4=${r.dpr4}  dpr5=${r.dpr5}  dpr6=${r.dpr6}  dpr7=${r.dpr7}`,
      );
    }
    console.log('');
  }
})().catch((e) => console.error('ERR', e.message));
