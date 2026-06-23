// 마지막 확인 — 과거 '연도별 창'이 실제 그 연도 데이터를 주는지(다년 보강 가능 여부).
// 실행: cd mobile && node scripts/kamis-multiyear-check.mjs
import fs from 'node:fs';

const env = fs.readFileSync(new URL('../.env', import.meta.url), 'utf8');
const get = (k) => (env.match(new RegExp(k + '=(.*)')) || [])[1]?.trim() || '';
const KEY = get('EXPO_PUBLIC_KAMIS_KEY');
const ID = get('EXPO_PUBLIC_KAMIS_ID');
const BASE = 'https://www.kamis.or.kr/service/price/xml.do';
const qs = (p) =>
  Object.entries({ p_cert_key: KEY, p_cert_id: ID, p_returntype: 'json', ...p })
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');

async function yearWindow(y) {
  const url = `${BASE}?${qs({
    action: 'periodProductList',
    p_productclscode: '01',
    p_startday: `${y}-01-01`,
    p_endday: `${y}-12-31`,
    p_itemcategorycode: '200',
    p_itemcode: '245',
    p_kindcode: '00',
    p_productrankcode: '04',
    p_countycode: '1101',
    p_convert_kg_yn: 'N',
  })}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    const j = await r.json();
    const avg = (j?.data?.item || []).filter((x) => x.countyname === '평균' && x.price && x.price !== '-');
    // regday 에 연도가 들어오는지, 값 표본도 같이
    const sample = avg.slice(0, 2).map((x) => `${x.regday}=${x.price}`);
    const last = avg.slice(-1).map((x) => `${x.regday}=${x.price}`);
    return { y, n: avg.length, sample, last, error: j?.data?.error_code };
  } catch (e) {
    return { y, n: 0, error: e.name === 'AbortError' ? 'TIMEOUT' : e.message };
  } finally {
    clearTimeout(t);
  }
}

(async () => {
  console.log('=== 양파(245) 연도별 창 — 과거 데이터가 실제 그 연도로 오는지 ===\n');
  for (const y of [2025, 2024, 2023, 2022]) {
    const r = await yearWindow(y);
    console.log(
      `${y}: 평균행 ${r.n}개 error=${JSON.stringify(r.error)} | 처음 ${JSON.stringify(r.sample)} 끝 ${JSON.stringify(r.last)}`,
    );
  }
  console.log('\n해석: 각 연도가 서로 다른 값으로, regday에 해당 연도가 찍혀 수백 개 오면 → 다년 보강 OK.');
  console.log('      전부 같은(최근) 값이거나 과거 연도가 0개면 → 1년치만 가능, 평년 앵커 모델로.');
})().catch((e) => console.error('ERR', e.message));
