/**
 * 평년(이맘때 평균) 사전계산 — KAMIS와 같은 정의로 우리가 직접 만든다.
 *
 * 왜 필요한가
 *  KAMIS 원본은 데이터센터 IP를 막아서(2026-07~) 워커·CI가 직접 못 받는다. 그래서 공공데이터포털
 *  미러로 도는데, 미러는 '조사된 원천 가격'만 주고 KAMIS가 얹어주던 파생값(dpr7 평년)이 없다.
 *  임시로 워커가 verdicts의 months[이번달]을 dpr7에 주입해왔는데, 그 verdicts는 다시 워커를 통해
 *  만들어지므로 순환이었다 — 2026-08-18 확인 결과 56개 품목 중 50개에서 normal === months[이번달].
 *  즉 앱이 '평년'이라 부르던 값은 실은 자체 최근 1년 그 달 평균이었다.
 *
 *  미러는 2020년치까지 원천 가격을 정상적으로 준다. 그래서 평년을 KAMIS 정의 그대로 계산할 수 있고,
 *  그러면 KAMIS 원본 의존과 순환이 동시에 사라진다.
 *
 *  실측 정확도(2026-08-18, 15품목을 KAMIS 실제 dpr7과 대조):
 *    이 방식 절대오차 중앙값 3.2%, 5% 이내 67%
 *    기존 순환값        절대오차 중앙값 8.1%, 5% 이내 33%   (찹쌀 +41%, 오이 +34%, 양배추 -21%)
 *
 * 정의 (KAMIS·농업관측통계시스템 표기)
 *  "평년 = 해당일 최근 5년 가격 중 최고값과 최소값을 제외한 3년의 평균값"
 *  날짜별 365칸을 만든다. 조사 공백(주말·휴일)이 많아 각 연도의 '해당일 ±WINDOW일' 평균을
 *  그해 대표값으로 삼고, 연도 대표값을 최대 5개 모아 최고·최저를 제외한 나머지를 평균한다.
 *  주 단위(52칸)도 시도했으나 고정 달력주에 묶이면 오늘이 주 경계에 걸릴 때 기준이 밀린다
 *  (시금치 대조 오차 주단위 -6.1% vs 일단위 -0.6%).
 *
 * 실행:  cd mobile && node scripts/build-baselines.mjs
 *   옵션  --only=245,211   특정 itemCode만
 *         --cls=01,02      소매만/도매만 (기본 둘 다)
 *         --window=3       해당일 ±N일 창 (기본 3)
 *         --dry-run        파일 미기록
 * 산출물: mobile/public/baselines.json
 *
 * 갱신 주기: 과거 5년 기반이라 하루 사이 거의 안 변한다 → 주 1회 CI면 충분.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(process.argv[1]), '..');
const OUT = path.join(ROOT, 'public', 'baselines.json');

let envFile = '';
try {
  envFile = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
} catch {
  // CI는 .env 없이 KAMIS_PROXY로 돈다.
}
const getEnv = (k) => (envFile.match(new RegExp(`^${k}=(.*)$`, 'm')) || [])[1]?.trim() || '';
const KEY = getEnv('EXPO_PUBLIC_KAMIS_KEY');
const ID = getEnv('EXPO_PUBLIC_KAMIS_ID');
const BASE = process.env.KAMIS_PROXY || 'https://igeobissa-recipes.designerxyzi.workers.dev/kamis';

const CATEGORIES = ['100', '200', '400', '500'];
const DAYS = 365;
/** 표본으로 쓸 과거 연도 수. KAMIS 정의가 5년. */
const PAST_YEARS = 5;
/** 5년을 온전히 채우려면 6년치를 받아야 한다(올해는 표본에서 빠지므로). */
const FETCH_YEARS = PAST_YEARS + 1;
/** 최고·최저를 걷어내려면 최소 이만큼의 연도 표본이 필요. 미만이면 단순 평균. */
const MIN_YEARS_FOR_TRIM = 3;

const arg = (n) => (process.argv.find((a) => a.startsWith(`--${n}=`)) || '').split('=')[1];
const DRY = process.argv.includes('--dry-run');
const WINDOW = Number(arg('window')) || 3;
const ONLY = arg('only') ? arg('only').split(',').map((s) => s.trim()) : null;
const CLS_LIST = (arg('cls') || '01,02').split(',').map((s) => s.trim());

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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// UA 필수 — KAMIS 방화벽이 브라우저 UA 없는 요청을 막는다(2026-07-17). 프록시 경유든 직접이든 무해.
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36';
async function fetchT(url, ms = 20000) {
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await sleep(800 * attempt);
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), ms);
    try {
      const res = await fetch(url, { signal: ac.signal, headers: { 'user-agent': UA } });
      if (res.status >= 500) throw new Error(`upstream ${res.status}`);
      return res;
    } catch (e) {
      lastErr = e;
    } finally {
      clearTimeout(t);
    }
  }
  throw lastErr;
}

/** 월/일 → 0~364. 2/29는 2/28과 같은 칸으로 접힌다(윤년 보정). */
const CUM = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
const dayOfYear = (m, d) => Math.min(DAYS - 1, CUM[m - 1] + (d - 1));
/** 연말↔연초를 잇는 원형 거리 */
const circDist = (a, b) => {
  const d = Math.abs(a - b);
  return Math.min(d, DAYS - d);
};

/** 오늘 기준 카탈로그 — 평년을 만들 대상 품목·품종 목록. */
async function fetchCatalog(cls) {
  const rows = [];
  for (let back = 0; back <= 7 && rows.length === 0; back++) {
    const d = new Date();
    d.setDate(d.getDate() - back);
    for (const cat of CATEGORIES) {
      const url = `${BASE}?${qs({
        action: 'dailyPriceByCategoryList',
        p_product_cls_code: cls,
        p_country_code: '1101',
        p_regday: fmtDate(d),
        p_convert_kg_yn: 'N',
        p_item_category_code: cat,
      })}`;
      try {
        const j = await (await fetchT(url)).json();
        for (const r of j?.data?.item ?? []) {
          if (!r.item_name || !r.item_code) continue;
          rows.push({
            categoryCode: cat,
            itemCode: String(r.item_code),
            kindCode: String(r.kind_code ?? '00'),
            rankCode: String(r.rank_code ?? '04'),
            itemName: String(r.item_name),
            kindName: String(r.kind_name ?? ''),
            unit: String(r.unit ?? ''),
          });
        }
      } catch {
        // 부류 하나 실패는 넘어간다
      }
    }
  }
  const seen = new Set();
  return rows.filter((r) => {
    const k = `${r.itemCode}-${r.kindCode}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/**
 * 품목 하나의 N년치 일별 가격을 연 단위로 나눠 받는다.
 * 5~6년을 한 번에 요청하면 미러 게이트웨이의 1000행 상한에 걸려 최근 구간이 통째로 잘린다
 * (2026-08-18 확인: 1825일 요청이 2021~2023만 반환). 그래서 반드시 연 단위로 쪼갠다.
 */
async function fetchYears(item, cls) {
  const ranks = item.categoryCode === '500' ? ['1', '2'] : [item.rankCode, '04', '05'];
  for (const rank of [...new Set(ranks)]) {
    const pts = [];
    for (let y = 0; y < FETCH_YEARS; y++) {
      const end = new Date();
      end.setFullYear(end.getFullYear() - y);
      const start = new Date(end);
      start.setFullYear(start.getFullYear() - 1);
      start.setDate(start.getDate() + 1);
      const url = `${BASE}?${qs({
        action: 'periodProductList',
        p_productclscode: cls,
        p_startday: fmtDate(start),
        p_endday: fmtDate(end),
        p_itemcategorycode: item.categoryCode,
        p_itemcode: item.itemCode,
        p_kindcode: item.kindCode,
        p_productrankcode: rank,
        p_countycode: '1101',
        p_convert_kg_yn: 'N',
      })}`;
      try {
        const j = await (await fetchT(url)).json();
        for (const r of j?.data?.item ?? []) {
          if (r.countyname !== '평균') continue;
          const price = parsePrice(String(r.price));
          const [mm, dd] = String(r.regday).split('/').map((x) => parseInt(x, 10));
          const yr = parseInt(String(r.yyyy), 10);
          if (price == null || !mm || !dd || !yr) continue;
          pts.push({ yr, doy: dayOfYear(mm, dd), price });
        }
      } catch {
        // 이 해는 건너뛴다 — 남은 해로도 평년은 만들어진다
      }
      await sleep(420); // 미러 게이트웨이 배려
    }
    if (pts.length) return pts;
  }
  return [];
}

/**
 * 날짜별 평년 365칸.
 * 올해는 표본에서 뺀다 — '올해가 평년보다 싼가'를 물어야 하는데 올해가 기준에 섞이면 질문이 무너진다.
 */
function baselineDays(pts, thisYear) {
  // 연도별로 미리 쪼개 두면 날짜 365번 순회에서 매번 전체를 훑지 않아도 된다.
  const byYear = new Map();
  for (const p of pts) {
    if (p.yr >= thisYear) continue;
    (byYear.get(p.yr) ?? byYear.set(p.yr, []).get(p.yr)).push(p);
  }
  // 최근 5년만 사용 (KAMIS 정의)
  const years = [...byYear.keys()].sort((a, b) => b - a).slice(0, PAST_YEARS);
  const days = new Array(DAYS).fill(null);
  const samples = new Array(DAYS).fill(0);
  for (let d = 0; d < DAYS; d++) {
    const perYear = [];
    for (const y of years) {
      let sum = 0;
      let cnt = 0;
      for (const p of byYear.get(y)) {
        if (circDist(p.doy, d) <= WINDOW) {
          sum += p.price;
          cnt++;
        }
      }
      if (cnt > 0) perYear.push(sum / cnt);
    }
    if (perYear.length === 0) continue;
    perYear.sort((a, b) => a - b);
    const used = perYear.length >= MIN_YEARS_FOR_TRIM ? perYear.slice(1, -1) : perYear;
    days[d] = Math.round(used.reduce((a, b) => a + b, 0) / used.length);
    samples[d] = perYear.length;
  }
  return { days, samples };
}

/** 조사 공백으로 빈 날은 가장 가까운 값으로 메운다 — 특정 날짜만 기준이 사라지지 않게. */
function fillGaps(days) {
  const known = days.map((v, i) => (v != null ? i : -1)).filter((i) => i >= 0);
  if (known.length === 0) return days;
  return days.map((v, i) => {
    if (v != null) return v;
    let best = null;
    let bestD = Infinity;
    for (const j of known) {
      const d = circDist(i, j);
      if (d < bestD) {
        bestD = d;
        best = days[j];
      }
    }
    return best;
  });
}

(async () => {
  if (!process.env.KAMIS_PROXY && (!KEY || !ID)) {
    throw new Error('KAMIS 키 없음 (.env EXPO_PUBLIC_KAMIS_KEY / _ID) 또는 KAMIS_PROXY 미설정');
  }
  const thisYear = new Date().getFullYear();
  const out = {
    generatedAt: new Date().toISOString(),
    definition: `해당일 ±${WINDOW}일 창으로 최근 ${PAST_YEARS}년(올해 제외) 연도별 대표값을 만들고, 최고·최저를 제외한 나머지의 평균 — KAMIS 평년 정의`,
    days: DAYS,
    items: {},
  };

  for (const cls of CLS_LIST) {
    const catalog = (await fetchCatalog(cls)).filter((i) => !ONLY || ONLY.includes(i.itemCode));
    console.log(`[${cls === '01' ? '소매' : '도매'}] 대상 ${catalog.length}종`);
    let done = 0;
    for (const item of catalog) {
      const key = `${item.itemCode}-${item.kindCode}`;
      const pts = await fetchYears(item, cls);
      done++;
      if (!pts.length) {
        console.log(`  · ${key} ${item.itemName} — 데이터 없음 [${done}/${catalog.length}]`);
        continue;
      }
      const { days, samples } = baselineDays(pts, thisYear);
      const covered = days.filter((v) => v != null).length;
      if (covered === 0) {
        console.log(`  · ${key} ${item.itemName} — 과거 표본 없음 [${done}/${catalog.length}]`);
        continue;
      }
      const filled = fillGaps(days);
      const avgSamples = samples.filter((s) => s > 0);
      const meanYears = (avgSamples.reduce((a, b) => a + b, 0) / avgSamples.length).toFixed(1);
      const slot = (out.items[key] ??= { itemName: item.itemName, kindName: item.kindName });
      if (cls === '01') {
        slot.unit = item.unit;
        slot.days = filled;
        slot.coverage = covered;
        slot.yearsPerDay = Number(meanYears);
      } else {
        slot.wsUnit = item.unit;
        slot.wsDays = filled;
        slot.wsCoverage = covered;
      }
      console.log(
        `  ✓ ${key} ${item.itemName}${item.kindName ? ' ' + item.kindName : ''} — ${pts.length}점, ${covered}/365일, 연도표본 ${meanYears} [${done}/${catalog.length}]`,
      );
    }
  }

  const n = Object.keys(out.items).length;
  if (DRY) {
    console.log(`--dry-run: ${n}종 계산 완료, 파일 미기록`);
  } else {
    fs.writeFileSync(OUT, JSON.stringify(out) + '\n');
    console.log(`기록 완료 → ${OUT} (${n}종, ${(fs.statSync(OUT).size / 1024).toFixed(0)}KB)`);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
