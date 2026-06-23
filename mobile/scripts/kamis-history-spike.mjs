// 예측 모델 타당성 점검 — KAMIS가 과거 시계열을 몇 년치, 얼마나 촘촘히 주는지 확인.
// 모델(SARIMAX/Prophet)은 최소 2~3년 계절성이 필요. 이 출력으로 가능 여부가 갈린다.
// 실행: cd mobile && node scripts/kamis-history-spike.mjs
import fs from 'node:fs';

const env = fs.readFileSync(new URL('../.env', import.meta.url), 'utf8');
const get = (k) => (env.match(new RegExp(k + '=(.*)')) || [])[1]?.trim() || '';
const KEY = get('EXPO_PUBLIC_KAMIS_KEY');
const ID = get('EXPO_PUBLIC_KAMIS_ID');
const BASE = 'https://www.kamis.or.kr/service/price/xml.do';

const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const qs = (p) =>
  Object.entries({ p_cert_key: KEY, p_cert_id: ID, p_returntype: 'json', ...p })
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');

// 요청별 타임아웃 — KAMIS가 큰 범위에 매달리는 걸 방지(12초 후 끊고 다음으로).
async function fetchT(url, ms = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

// 양파(245), 채소(200), 소매(01), 평균행. rank 후보 순차 시도.
async function period(startday, endday, rank) {
  const url = `${BASE}?${qs({
    action: 'periodProductList',
    p_productclscode: '01',
    p_startday: startday,
    p_endday: endday,
    p_itemcategorycode: '200',
    p_itemcode: '245',
    p_kindcode: '00',
    p_productrankcode: rank,
    p_countycode: '1101',
    p_convert_kg_yn: 'N',
  })}`;
  let j;
  try {
    j = await fetchT(url);
  } catch (e) {
    return { error: e.name === 'AbortError' ? 'TIMEOUT(12s)' : e.message, total: 0, avg: [] };
  }
  const rows = Array.isArray(j?.data?.item) ? j.data.item : [];
  const avg = rows.filter((x) => x.countyname === '평균' && x.price && x.price !== '-');
  return { error: j?.data?.error_code, total: rows.length, avg };
}

async function monthly() {
  // 월별 동향(연간 흐름용) — 최근 3년
  const url = `${BASE}?${qs({
    action: 'monthlyPriceTrendList',
    p_productclscode: '01',
    p_itemcategorycode: '200',
    p_itemcode: '245',
    p_kindcode: '00',
    p_productrankcode: '04',
    p_countrycode: '1101',
    p_convert_kg_yn: 'N',
  })}`;
  const r = await fetch(url);
  const t = await r.text();
  return t.slice(0, 600);
}

(async () => {
  console.log('=== 양파(245) 소매 일별 시계열 — 과거 깊이 테스트 ===\n');
  const today = new Date();
  for (const years of [1, 2, 3, 5]) {
    const start = new Date(today);
    start.setFullYear(today.getFullYear() - years);
    process.stdout.write(`[${years}년 요청] 조회 중…`);
    let best = null;
    for (const rank of ['04', '05', '01']) {
      const res = await period(fmt(start), fmt(today), rank);
      if (res.avg.length > 0) { best = { rank, ...res }; break; }
      if (!best) best = { rank, ...res };
    }
    process.stdout.write('\r');
    const dates = best.avg.map((x) => x.regday).sort();
    console.log(
      `[${years}년 요청] error=${JSON.stringify(best.error)} rank=${best.rank} | 평균행 ${best.avg.length}개` +
        (dates.length ? ` | 최초 ${dates[0]} ~ 최후 ${dates[dates.length - 1]}` : ' | (빈 응답)'),
    );
  }

  console.log('\n=== 월별 동향(연간 흐름용) 원응답 앞부분 ===');
  console.log(await monthly());
  console.log('\n해석: 일별 "최초" 날짜가 2~3년 전 이상이고 평균행이 수백 개면 모델 가능.');
  console.log('      1년 안쪽만 오거나 구멍이 많으면 계절성 학습이 어려워 설계 재고 필요.');
})().catch((e) => console.error('ERR', e.message));
