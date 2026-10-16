// 지역별(조사도시) 판정 사전계산 — '지역 오늘가 vs 지역 최근 평균' 한 기준.
//
// 왜 '평년'이 아니라 '최근 평균'인가 (2026-10-11 라이브 확인):
//   dailyPriceByCategoryList에 p_country_code를 줘도 dpr7(평년)은 어느 지역이든 '전국 단일값'이다
//   (오이: 서울·부산·대구 모두 평년 16,252). 그래서 지역 오늘가를 전국 평년과 비교하면
//   구조적으로 싼 지역(부산 등)이 늘 '싸요'로 치우친다 — build-verdicts.mjs:119의 그 함정.
//   지역엔 지역 기준선이 필요한데, KAMIS가 주는 유일한 지역 기준은 '그 지역의 최근 시세'다.
//
// 데이터 수집 (지역코드 매핑 불필요):
//   periodProductList를 p_countycode 없이 부르면 24개 조사지점(평균·평년 포함)의 시계열이 한 응답에 온다.
//   countyname으로 묶어 도시별 today(최신 조사가)·recentAvg(창 평균)·level을 만든다.
//   KAMIS 응답 1000행 상한 → 24지점×일수 < 1000 이어야 해서 창을 WINDOW_DAYS(기본 28일)로 둔다.
//   도매·유기농 지역값은 여기서 안 만든다 — 상세에만 나와서 상세가 그 도시 시계열을 라이브로 받아 계산한다.
//
// 산출물: mobile/public/verdicts-regional.json
//   { date, windowDays, regions: { "<도시명>": { "<itemCode-kindCode>": { level, today, recentAvg } } } }
//   앱: 지역≠전국일 때 이 파일을 읽어 홈·상세의 판정과 '오늘 가격'을 그 도시 값으로 덮는다.
//   파일/도시/품목이 없으면 기존 전국 verdicts로 자동 폴백(깨지지 않음).
//
// 실행(워커 프록시 — 로컬 KAMIS 키 불필요):
//   KAMIS_PROXY=https://igeobissa-recipes.designerxyzi.workers.dev/kamis node scripts/build-verdicts-regional.mjs
import fs from 'node:fs';
import path from 'node:path';

// mobile/src/data/regions.ts 의 22개 조사도시와 동기화. (전국은 기존 verdicts.json이 담당)
const CITIES = new Set([
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '수원', '성남', '고양', '용인', '춘천', '강릉', '청주', '천안',
  '전주', '순천', '포항', '안동', '창원', '제주',
]);

let envFile = '';
try { envFile = fs.readFileSync(new URL('../.env', import.meta.url), 'utf8'); } catch {}
const getEnv = (k) => (envFile.match(new RegExp(`${k}=(.*)`)) || [])[1]?.trim() || '';
const KEY = getEnv('EXPO_PUBLIC_KAMIS_KEY');
const ID = getEnv('EXPO_PUBLIC_KAMIS_ID');
const BASE = process.env.KAMIS_PROXY || 'https://www.kamis.or.kr/service/price/xml.do';
const CATEGORIES = ['100', '200', '400', '500'];
const THRESHOLD = 0.01; // 앱 kamis.ts·build-verdicts.mjs와 동일(±1%)
// 28일 = 24지점×~35행 ≈ 832행. 40일은 ~1300행이라 1000행 상한에서 일부 도시가 잘린다(2026-10-11 실측).
const WINDOW_DAYS = Number(process.env.WINDOW_DAYS || 28);

const qs = (p) =>
  Object.entries({ p_cert_key: KEY, p_cert_id: ID, p_returntype: 'json', ...p })
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
const fmtDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fetchT = async (url, ms = 15000) => {
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 1000 * attempt));
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), ms);
    try {
      const res = await fetch(url, {
        signal: ac.signal,
        headers: { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36' },
      });
      if (res.status >= 500) throw new Error(`upstream ${res.status}`);
      return res;
    } catch (e) { lastErr = e; } finally { clearTimeout(t); }
  }
  throw lastErr;
};
const parsePrice = (v) => {
  if (typeof v !== 'string' || v === '-' || v === '' || v === '0') return null;
  const n = Number(v.replace(/,/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
};
const judge = (today, base) => {
  if (today == null || base == null) return null;
  const r = (today - base) / base;
  if (r <= -THRESHOLD) return 'cheap';
  if (r >= THRESHOLD) return 'expensive';
  return 'fair';
};

// ── 대표 품목(item-kind) 목록 — build-verdicts.mjs의 ③ 대표 선정과 같게, 오늘(없으면 최근 영업일) 기준 ──
async function fetchCategory(categoryCode, regday) {
  const url = `${BASE}?${qs({ action: 'dailyPriceByCategoryList', p_product_cls_code: '01', p_regday: regday, p_convert_kg_yn: 'N', p_item_category_code: categoryCode })}`;
  const rows = (await (await fetchT(url)).json())?.data?.item ?? [];
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((r) => r.item_name && r.item_code)
    .map((r) => {
      const today = [r.dpr1, r.dpr2, r.dpr3, r.dpr4].map(parsePrice).find((v) => v != null) ?? null;
      return {
        categoryCode,
        itemCode: String(r.item_code),
        kindCode: String(r.kind_code ?? '00'),
        rankCode: String(r.rank_code ?? '04'),
        today,
      };
    });
}
async function fetchReps() {
  const load = async (regday) => (await Promise.allSettled(CATEGORIES.map((c) => fetchCategory(c, regday))))
    .flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  const withToday = (arr) => arr.filter((i) => i.today != null).length;
  let priceDate = fmtDate(new Date());
  let today = await load(priceDate);
  for (let back = 1; back <= 7 && withToday(today) < 30; back++) {
    const d = new Date(); d.setDate(d.getDate() - back);
    const cand = fmtDate(d); const next = await load(cand);
    if (withToday(next) > withToday(today)) { today = next; priceDate = cand; }
  }
  const seen = new Set();
  const reps = today.filter((i) => {
    const k = `${i.itemCode}-${i.kindCode}`;
    if (seen.has(k)) return false; seen.add(k); return true;
  });
  return { reps, priceDate };
}

// ── 지역별 시계열 (p_countycode 생략 = 전 도시) ──
let maxRows = 0;
async function fetchRegionalRows(item, cls = '01') {
  const end = new Date();
  const s = new Date(); s.setDate(end.getDate() - WINDOW_DAYS);
  const ranks = item.categoryCode === '500' ? ['1', '2'] : [item.rankCode, '04', '05'];
  for (const rank of [...new Set(ranks)]) {
    const url = `${BASE}?${qs({
      action: 'periodProductList', p_productclscode: cls,
      p_startday: fmtDate(s), p_endday: fmtDate(end),
      p_itemcategorycode: item.categoryCode, p_itemcode: item.itemCode,
      p_kindcode: item.kindCode, p_productrankcode: rank, p_convert_kg_yn: 'N',
    })}`;
    try {
      const rows = (await (await fetchT(url)).json())?.data?.item ?? [];
      if (Array.isArray(rows) && rows.length) { if (rows.length > maxRows) maxRows = rows.length; return rows; }
    } catch {}
  }
  return [];
}

// ── 고기(축산) 지역값 — 축산물품질평가원 '일자별 축산물소비자가격'(17개 시·도) ──
//
// 왜 따로인가 (2026-10-16 실측): KAMIS periodProductList는 축산을 '평균·평년·전국' 3행으로만 준다.
// 도시를 고르면 고기는 늘 전국값+'조사 안 함' 안내였다. 축평원 API는 같은 조사의 시·도 값을 준다
// (전국 평균이 KAMIS와 일치: 등심 1+ 14,104 · 삼겹살 2,864 · 호주산 갈비 4,300).
//
// 기준은 다른 품목과 같다 — 그 지역 오늘가 vs 지난 WINDOW_DAYS일 평균. 축평원의 지역 '평년'은 KAMIS 평년과
// 숫자가 달라(등심 1+ 11,929 vs 11,646) 한 앱에 섞으면 같은 말에 다른 숫자가 된다. 그래서 쓰지 않는다.
//
// 호출: 축종 하나 × 하루 = 1회(그날 전 부위·등급·17개 시·도). 축종 7 × 28일 ≈ 200회. 개발계정 하루 1,000회.
// 1++등급은 이 API에 없다 → 그 키는 지역 파일에 없고, 앱이 전국값+안내로 폴백한다.
// 산출: regions[도시][키] = { level, today, recentAvg, s: 가격열, sido?: 빌려 쓴 시·도 } + meatDates(가격열의 날짜).
//   s는 상세 '최근 시세' 차트용 — 고기는 KAMIS에서 그 도시 시계열을 라이브로 받을 수 없다.
const EKAPE_BASE = 'http://data.ekape.or.kr/openapi-data/service/user/grade/consumerPriceDaily';
const MEAT_KINDS = ['4301', '4304', '4401', '4402', '9901', '9903', '9908'];
// 응답의 regionPrc1~17 순서(활용가이드 v2.9)
const SIDO = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
// 22개 조사도시 → 그 도시가 속한 시·도. 광역시·세종·제주는 자기 이름 그대로.
const CITY_SIDO = {
  수원: '경기', 성남: '경기', 고양: '경기', 용인: '경기', 춘천: '강원', 강릉: '강원',
  청주: '충북', 천안: '충남', 전주: '전북', 순천: '전남', 포항: '경북', 안동: '경북', 창원: '경남',
};
// 축평원 grdNm → 우리 키의 rankCode(kamis.ts GRADED). 등급·원산지 없는 품목은 '구분없음'·'일반란'.
const MEAT_RANK = { '1++등급': '01', '1+등급': '02', '1등급': '03', 미국산: '81', 호주산: '82' };

function ekapeKey() {
  if (process.env.EKAPE_KEY) return process.env.EKAPE_KEY.trim();
  try { return fs.readFileSync(new URL('../ekape-key.txt', import.meta.url), 'utf8').trim(); } catch { return ''; }
}

async function addMeat(regions, knownKeys) {
  const key = ekapeKey();
  if (!key) throw new Error('EKAPE_KEY 없음');
  const { itemKeyOf } = await import(new URL('../src/api/kamis.ts', import.meta.url).href);
  const field = (xml, f) => (xml.match(new RegExp(`<${f}>([^<]*)</${f}>`)) || [])[1];

  // byKey[키][시·도][YYYY-MM-DD] = 가격
  const byKey = {};
  const dates = new Set();
  let calls = 0;
  for (let back = WINDOW_DAYS - 1; back >= 0; back--) {
    const d = new Date(); d.setDate(d.getDate() - back);
    const ymd = fmtDate(d).replace(/-/g, '');
    for (const jk of MEAT_KINDS) {
      calls += 1;
      const xml = await (await fetchT(`${EKAPE_BASE}?serviceKey=${encodeURIComponent(key)}&standYmd=${ymd}&judgeKind=${jk}`)).text();
      const code = field(xml, 'resultCode');
      if (code && code !== '00') throw new Error(`축평원 응답 ${code} ${field(xml, 'resultMsg') ?? ''}`);
      for (const [, row] of xml.matchAll(/<item>(.*?)<\/item>/gs)) {
        const day = field(row, 'standYmd') ?? '';
        if (!/^\d{8}$/.test(day)) continue; // '평년' 행은 버린다
        const k = itemKeyOf({ itemCode: jk, kindCode: field(row, 'itemCd') ?? '', rankCode: MEAT_RANK[field(row, 'grdNm')] ?? '' });
        if (!knownKeys.has(k.split('-').slice(0, 2).join('-'))) continue; // 앱에 없는 부위(척아이롤 등)
        const date = `${day.slice(0, 4)}-${day.slice(4, 6)}-${day.slice(6)}`;
        SIDO.forEach((sido, i) => {
          const p = parsePrice(field(row, `regionPrc${i + 1}`));
          if (p == null) return;
          ((byKey[k] ??= {})[sido] ??= {})[date] = p;
          dates.add(date);
        });
      }
    }
  }
  const meatDates = [...dates].sort();
  let n = 0;
  for (const city of CITIES) {
    const sido = CITY_SIDO[city] ?? city;
    for (const [k, bySido] of Object.entries(byKey)) {
      const pts = bySido[sido];
      if (!pts) continue;
      const s = meatDates.map((dt) => pts[dt] ?? null);
      const vals = s.filter((v) => v != null);
      const today = vals[vals.length - 1];
      const recentAvg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      const level = judge(today, recentAvg);
      if (!level) continue;
      regions[city][k] = { level, today, recentAvg, s, ...(sido !== city ? { sido } : {}) };
      n += 1;
    }
  }
  console.log(`  고기 지역값: ${Object.keys(byKey).length}개 품목 × 22개 도시 = ${n}건 (축평원 호출 ${calls}회, ${meatDates.length}일)`);
  return meatDates;
}

(async () => {
  if (!process.env.KAMIS_PROXY && (!KEY || !ID)) throw new Error('KAMIS 키 없음 (.env 또는 KAMIS_PROXY)');
  const { reps, priceDate } = await fetchReps();
  console.log(`대표 ${reps.length}개 품목 × ${CITIES.size}개 도시 — 창 ${WINDOW_DAYS}일로 지역 판정 계산...`);

  const regions = {}; // cityName → { itemKey → {level,today,recentAvg} }
  for (const c of CITIES) regions[c] = {};
  let done = 0;
  for (const it of reps) {
    const key = `${it.itemCode}-${it.kindCode}`;
    const rows = await fetchRegionalRows(it);
    // countyname 별로 { 최신가(today), 가격합/개수(recentAvg) }
    const byCity = new Map();
    for (const r of rows) {
      const city = String(r.countyname ?? '');
      if (!CITIES.has(city)) continue;
      const p = parsePrice(r.price);
      if (p == null) continue;
      const day = String(r.regday ?? '');
      const cur = byCity.get(city) ?? { sum: 0, n: 0, latestDay: '', today: null };
      cur.sum += p; cur.n += 1;
      if (day >= cur.latestDay) { cur.latestDay = day; cur.today = p; }
      byCity.set(city, cur);
    }
    for (const [city, v] of byCity) {
      const recentAvg = Math.round(v.sum / v.n);
      const level = judge(v.today, recentAvg);
      if (level) regions[city][key] = { level, today: v.today, recentAvg };
    }
    done += 1;
    if (done % 15 === 0) console.log(`  ${done}/${reps.length} (최대 응답 ${maxRows}행)`);
  }

  // 수집량 점검 — 1000행 상한에 닿았으면 창을 줄여야 한다(일부 도시 데이터가 잘림)
  if (maxRows >= 1000) console.warn(`⚠ 응답이 ${maxRows}행 — 1000 상한에 근접/도달. WINDOW_DAYS를 줄여라(일부 도시 잘림 가능).`);

  const filled = Object.values(regions).reduce((n, m) => n + Object.keys(m).length, 0);
  if (filled === 0) { console.error('지역 판정 0건 — KAMIS 응답 확인. 기존 파일 보존.'); process.exit(1); }

  // 고기는 KAMIS가 도시별로 안 준다 — 축산물품질평가원 시·도 값으로 채운다. 실패해도 나머지는 그대로 낸다.
  const meatDates = await addMeat(regions, new Set(reps.map((r) => `${r.itemCode}-${r.kindCode}`))).catch((e) => {
    console.warn(`  고기 지역값 건너뜀 — ${e.message}`);
    return null;
  });

  const payload = {
    generatedAt: new Date().toISOString(), date: priceDate, windowDays: WINDOW_DAYS, regions,
    ...(meatDates ? { meatDates } : {}),
  };
  const dir = new URL('../public/', import.meta.url);
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir.pathname, 'verdicts-regional.json');
  fs.writeFileSync(out, JSON.stringify(payload));
  const perCity = Object.entries(regions).map(([c, m]) => `${c} ${Object.keys(m).length}`).join(', ');
  console.log(`완료 → public/verdicts-regional.json (${Math.round(fs.statSync(out).size / 1024)}KB, 최대응답 ${maxRows}행)`);
  console.log(`  도시별 품목 수: ${perCity}`);
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
