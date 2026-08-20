// 서버 사전계산 — 모든 품목의 '평년+최근1년 평균' 두 기준 판정(싸/적정/비싸) + 연간 월별 흐름(months).
// 앱(홈·상세)은 결과 JSON 1개만 읽어, 60+개 품목의 365일을 기기에서 받지 않아도 된다.
// 배추·무·감자처럼 KAMIS가 계절 품종으로 쪼개 조사하는 품목은, 같은 단위의 다른 품종을 받아
// 빈 달을 채워 '한 해 흐름'을 복원한다(다품종 병합).
// 실행: cd mobile && node scripts/build-verdicts.mjs   (KAMIS 접속 필요)
// 산출물: mobile/public/verdicts.json  (Expo web가 /verdicts.json 으로 서빙)
import fs from 'node:fs';
import path from 'node:path';

let envFile = '';
try {
  envFile = fs.readFileSync(new URL('../.env', import.meta.url), 'utf8');
} catch {
  // CI(GitHub 러너)는 .env 없이 KAMIS_PROXY로 돈다.
}
const getEnv = (k) => (envFile.match(new RegExp(`${k}=(.*)`)) || [])[1]?.trim() || '';
const KEY = getEnv('EXPO_PUBLIC_KAMIS_KEY');
const ID = getEnv('EXPO_PUBLIC_KAMIS_ID');

// KAMIS는 해외 IP를 차단할 수 있어 CI에선 워커 프록시 경유(KAMIS_PROXY) — 프록시가 서버측 키를 주입하므로 로컬 키 불필요.
const BASE = process.env.KAMIS_PROXY || 'https://www.kamis.or.kr/service/price/xml.do';
const CATEGORIES = ['100', '200', '400', '500'];
const THRESHOLD = 0.01; // 앱 kamis.ts와 동일(±1%)
const FULL_YEAR_MIN = 10; // 대표 품종이 이만큼 달이 차면 병합 불필요
// 대표 품종이 이 미만(연중 절반 미만)일 때만 = '진짜 계절 품종'일 때만 다른 계절품종과 병합.
// 파(대파/쪽파)·고춧가루(국산/중국)처럼 연중 조사되는 '다른 품목'은 자기 흐름만 쓰고 섞지 않는다.
const SEASONAL_MAX = 6;

const qs = (p) =>
  Object.entries({ p_cert_key: KEY, p_cert_id: ID, p_returntype: 'json', ...p })
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
const fmtDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
// timeout 있는 fetch — 느린 KAMIS 요청 하나가 빌드 전체를 영영 막는 hang 방지.
// 프록시(KAMIS_PROXY) 경유 시 간헐 실패로 품목이 조용히 빠지는 문제가 있어 3회 재시도.
const fetchT = async (url, ms = 15000) => {
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 1000 * attempt));
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), ms);
    try {
      // UA 필수: KAMIS 방화벽이 브라우저 UA 없는 요청을 차단(2026-07-17 확인). 프록시 경유든 직접이든 무해.
      const res = await fetch(url, {
        signal: ac.signal,
        headers: { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36' },
      });
      if (res.status >= 500) throw new Error(`upstream ${res.status}`);
      return res;
    } catch (e) {
      lastErr = e;
    } finally {
      clearTimeout(t);
    }
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
const recommendLevel = (today, normal, recentAvg) => {
  const nv = judge(today, normal);
  const rv = recentAvg != null ? judge(today, recentAvg) : null;
  if (rv == null) return nv ?? 'fair';
  if (nv === 'cheap' && rv === 'cheap') return 'cheap';
  if (nv === 'expensive' && rv === 'expensive') return 'expensive';
  return 'fair';
};
const lvRank = (lv) => (lv === 'cheap' ? 0 : lv === 'fair' ? 1 : lv === 'expensive' ? 2 : 3);
const pct = (a, b) => (a == null || b == null ? null : Math.round(((a - b) / b) * 100));
// 품종명 — kindName 맨 끝 괄호(단위)만 떼고 품목명 붙임.
//  "봄(1포기)"→"봄배추",  "수미(노지)(100g)"→"수미(노지)감자" (노지/시설 구분 유지),  "여름(고랭지)(1포기)"→"여름(고랭지)배추"
// 길면 띄어쓴다 — 앞선 무조건 붙여서 '햇산화건'+'건고추' = "햇산화건건고추" 같은 말이 나왔다
// (2026-08-20 연간흐름 캐션에서 발견). 앱 kamis.ts의 kindLabel과 같은 규칙을 쓴다.
const varietyName = (kindName, itemName) => {
  const v = String(kindName).replace(/\([^)]*\)\s*$/, '').trim();
  if (!v || v === itemName) return itemName;
  if (v.includes(itemName)) return v; // 대파·쪽파 → 그대로
  // 붙이는 게 기본(봄무·고랭지무·여름(고랭지)배추). 단, 품종명 끝글자와 품목명 첫글자가
  // 같으면 붙여서 읽힐 말이 된다 — '햇산화건'+'건고추' = "햇산화건건고추". 그때만 띄운다.
  return v.slice(-1) === itemName.slice(0, 1) ? `${itemName} ${v}` : `${v}${itemName}`;
};

// ---- 당일 카테고리 시세 (앱 fetchCategory와 동일 파싱) ----
async function fetchCategory(categoryCode, regday) {
  const url = `${BASE}?${qs({
    action: 'dailyPriceByCategoryList',
    p_product_cls_code: '01',
    // p_country_code 생략 = 전국 평균. 앱 kamis.ts fetchCategory와 반드시 같은 기준이어야 한다 —
    // 여기서 나오는 today·normal이 홈 카드와 상세의 판정 근거다(2026-08-20).
    p_regday: regday,
    p_convert_kg_yn: 'N',
    p_item_category_code: categoryCode,
  })}`;
  const res = await fetchT(url);
  if (!res.ok) throw new Error(`KAMIS HTTP ${res.status}`);
  const rows = (await res.json())?.data?.item ?? [];
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((r) => r.item_name && r.item_code)
    .map((r) => {
      const ladder = [r.dpr1, r.dpr2, r.dpr3, r.dpr4].map(parsePrice);
      const ti = ladder.findIndex((v) => v != null);
      const today = ti === -1 ? null : ladder[ti];
      const normal = parsePrice(r.dpr7);
      return {
        categoryCode,
        itemName: String(r.item_name),
        itemCode: String(r.item_code),
        kindCode: String(r.kind_code ?? '00'),
        rankCode: String(r.rank_code ?? '04'),
        kindName: String(r.kind_name ?? ''),
        unit: String(r.unit ?? ''),
        today,
        normal,
        level: judge(today, normal),
        vsNormalPct: pct(today, normal),
      };
    });
}

// 대표 품목 선정(앱과 동일) + 품목코드별 전체 품종 목록(병합용) 반환
async function fetchAll() {
  const load = async (regday) => {
    const res = await Promise.allSettled(CATEGORIES.map((c) => fetchCategory(c, regday)));
    return res.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  };
  // ① 대표 선정용 — 오늘(없으면 최근 영업일) 목록 (현재 가격·신호 필요)
  const withToday = (arr) => arr.filter((i) => i.today != null).length;
  let today = await load(fmtDate(new Date()));
  for (let back = 1; back <= 7 && withToday(today) < 30; back++) {
    const d = new Date();
    d.setDate(d.getDate() - back);
    const next = await load(fmtDate(d));
    if (withToday(next) > withToday(today)) today = next;
  }
  // ② 품종 발굴용 — 1년에 걸쳐 4계절 표본 목록을 합쳐, 비철 품종(가을·월동배추 등)까지 포함
  const kindMap = new Map(); // itemCode → Map<kindCode,row>
  const addKinds = (rows) => {
    for (const r of rows) {
      if (!kindMap.has(r.itemCode)) kindMap.set(r.itemCode, new Map());
      const km = kindMap.get(r.itemCode);
      if (!km.has(r.kindCode)) km.set(r.kindCode, r); // unit·rank 포함, 첫 등장 보존
    }
  };
  addKinds(today);
  for (const days of [90, 180, 270]) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    addKinds(await load(fmtDate(d)).catch(() => []));
  }
  const kindsByItem = new Map();
  for (const [code, km] of kindMap) kindsByItem.set(code, [...km.values()]);

  // ③ 대표 선정: 품목·품종 1행 dedup → 표시명별 신호 좋은 단위 (오늘 목록 기준)
  const seen = new Set();
  const unique = today.filter((i) => {
    const k = `${i.itemCode}-${i.kindCode}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  // 품종을 접지 않고 모두 계산한다. 앱이 품종을 각각 독립 항목으로 보여주게 바뀌었으므로
  // (kamis.ts 참조) 여기서 대표 하나만 만들면 나머지 품종 상세는 사전계산이 없어
  // 365일 라이브 호출(≈27s)로 떨어진다.
  return { reps: unique, kindsByItem };
}

// ---- 365일 시계열 → 월별 데이터 포인트 (앱 fetchSeries와 동일 rank 후보·파싱) ----
async function fetchYearPoints(item, cls = '01') {
  const end = new Date();
  const ranks = item.categoryCode === '500' ? ['1', '2'] : [item.rankCode, '04', '05'];
  // 1년 범위 단일 호출은 ~16s라 fetchT(15s) 타임아웃에 걸려 빈 데이터가 됨(시금치·토마토 등 0개월 원인).
  // → 분기(92일) 4개로 쪼개 병렬 fetch(각 ~6s). months는 regday 월버킷이라 순서 무관.
  const per = 92;
  const ranges = [0, 1, 2, 3].map((i) => {
    const s = new Date();
    s.setDate(end.getDate() - Math.min(365, per * (i + 1)));
    const e = new Date();
    e.setDate(end.getDate() - per * i);
    return [s, e];
  });
  for (const rank of [...new Set(ranks)]) {
    const parts = await Promise.all(
      ranges.map(async ([s, e]) => {
        const url = `${BASE}?${qs({
          action: 'periodProductList',
          p_productclscode: cls,
          p_startday: fmtDate(s),
          p_endday: fmtDate(e),
          p_itemcategorycode: item.categoryCode,
          p_itemcode: item.itemCode,
          p_kindcode: item.kindCode,
          p_productrankcode: rank,
          p_countycode: '1101',
          p_convert_kg_yn: 'N',
        })}`;
        try {
          const res = await fetchT(url);
          if (!res.ok) return [];
          const rows = (await res.json())?.data?.item ?? [];
          return Array.isArray(rows) ? rows : [];
        } catch {
          return [];
        }
      }),
    );
    const pts = parts
      .flat()
      .filter((r) => r.countyname === '평균')
      .map((r) => ({
        m: parseInt(String(r.regday).split('/')[0], 10) - 1,
        price: parsePrice(r.price),
        // 일자도 남긴다 — 상세 '최근 시세' 차트용 일별 시계열(series.json)을 같이 만들기 위해.
        // 예전엔 월 버킷만 쓰고 버렸는데, 그 탓에 앱이 상세를 열 때마다
        // 같은 1년치를 KAMIS에서 다시 받았다(분할 4회 × 3~7초).
        y: r.yyyy != null ? String(r.yyyy) : null,
        d: String(r.regday),
      }))
      .filter((p) => p.price != null && p.m >= 0 && p.m < 12);
    if (pts.length) return pts;
  }
  return [];
}

const addPts = (sums, cnts, pts) => {
  for (const p of pts) {
    sums[p.m] += p.price;
    cnts[p.m] += 1;
  }
};
const monthlyFrom = (sums, cnts) => sums.map((s, m) => (cnts[m] > 0 ? Math.round(s / cnts[m]) : null));

(async () => {
  // 프록시 모드는 워커가 키를 주입하므로 로컬 키 불필요.
  if (!process.env.KAMIS_PROXY && (!KEY || !ID)) throw new Error('KAMIS 키 없음 (.env EXPO_PUBLIC_KAMIS_KEY / _ID)');
  const { reps, kindsByItem } = await fetchAll();
  console.log(`대표 품목 ${reps.length}개 — 연간 흐름·최근 1년 평균 계산 중...`);

  // ── 탭 표시 여부 ──
  // 데이터가 없는 탭을 열어보면 빈 안내문이 뜨는게 버그처럼 보인다(2026-08-20 사용자 지적).
  // 앱이 탭을 그리기 전에 알아야 하므로 여기서 미리 판정해 넣는다.
  //
  // 도매: 축산은 KAMIS가 도매를 조사하지 않는데 cls=02 요청에 소매 응답을 그대로 돌려준다.
  //   앱과 똑같이 '가격 AND 단위가 모두 같으면 도매 없음'으로 본다.
  const wsDaily = new Map();
  const rtDaily = new Map();
  for (const cat of CATEGORIES) {
    for (const [cls, m] of [['01', rtDaily], ['02', wsDaily]]) {
      const url = `${BASE}?${qs({
        action: 'dailyPriceByCategoryList',
        p_product_cls_code: cls,
        p_regday: fmtDate(new Date()),
        p_convert_kg_yn: 'N',
        p_item_category_code: cat,
      })}`;
      try {
        const rows = (await (await fetchT(url)).json())?.data?.item ?? [];
        for (const r of Array.isArray(rows) ? rows : []) {
          if (!r.item_code) continue;
          const k = `${r.item_code}-${r.kind_code ?? '00'}`;
          if (!m.has(k)) m.set(k, { price: String(r.dpr1 ?? ''), unit: String(r.unit ?? '') });
        }
      } catch {
        // 이 검사는 부가 정보다 — 실패하면 그냥 판정을 못 할 뿐 빌드를 막지 않는다.
      }
    }
  }
  const hasWholesaleFor = (k) => {
    const w = wsDaily.get(k);
    if (!w || !w.price || w.price === '-') return false;
    const r = rtDaily.get(k);
    return !(r && r.price === w.price && r.unit === w.unit); // 소매 미러면 도매 없음
  };

  // 유기농: 자기 품종과 품목 단위('00')만 본다 — 형제 품종을 빌리면 다른 물건 가격이 뜬다.
  const ecoStart = new Date();
  ecoStart.setDate(ecoStart.getDate() - 365);
  async function hasEcoFor(it) {
    // 앱 kamis.ts와 같은 규칙 — 품목 단위('00')는 KAMIS가 이 품목을 품종으로 안 나눌 때만.
    // 여러 품종이면 '00'은 그중 한 품종이라 다른 품종 가격을 빌리게 된다(쪽파←대파).
    const kindCount = new Set((kindsByItem.get(it.itemCode) || []).map((k) => k.kindCode)).size;
    const cands = kindCount <= 1 ? [it.kindCode, '00'] : [it.kindCode];
    for (const kind of [...new Set(cands)]) {
      for (const rank of ['07', '08']) {
        const url = `${BASE}?${qs({
          action: 'periodEcoPriceList',
          p_startday: fmtDate(ecoStart),
          p_endday: fmtDate(new Date()),
          p_itemcategorycode: it.categoryCode,
          p_itemcode: it.itemCode,
          p_kindcode: kind,
          p_productrankcode: rank,
          p_convert_kg_yn: 'N',
        })}`;
        try {
          const rows = (await (await fetchT(url)).json())?.data?.item ?? [];
          if (Array.isArray(rows) && rows.length >= 2) return true; // 앱과 같은 기준(2점 미만은 무효)
        } catch {
          // 다음 조합
        }
      }
    }
    return false;
  }

  const out = {};
  // 상세 '최근 시세' 차트용 일별 시계열. 이미 받아둔 1년치 포인트를 그대로 쓰므로
  // KAMIS 추가 호출이 0이다. 형식: { "211-02": { r: [["2026-08-20", 4985], …], w: […] } }
  const series = {};
  const toSeries = (pts) => {
    const seen = new Set();
    return pts
      .filter((p) => p.y && p.d && p.price != null)
      .map((p) => [`${p.y}-${String(p.d).replace('/', '-')}`, p.price])
      .sort((a, b) => a[0].localeCompare(b[0]))
      .filter(([k]) => (seen.has(k) ? false : (seen.add(k), true)));
  };
  let done = 0;
  let merged = 0;
  for (const it of reps) {
    const repPts = await fetchYearPoints(it).catch(() => []);
    const prices = repPts.map((p) => p.price);
    const recentAvg = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null;
    const level = recommendLevel(it.today, it.normal, recentAvg);

    // 도매(cls=02) 최근 1년 평균 + 연간 흐름도 사전계산 — 상세 도매 탭에서 365일 기기 호출 없이 즉시(#4).
    const wsPts = await fetchYearPoints(it, '02').catch(() => []);
    const wsPrices = wsPts.map((p) => p.price);
    const wholesaleRecentAvg = wsPrices.length ? Math.round(wsPrices.reduce((a, b) => a + b, 0) / wsPrices.length) : null;
    let wholesaleMonths = null;
    if (wholesaleRecentAvg != null) {
      const ws = Array(12).fill(0);
      const wc = Array(12).fill(0);
      addPts(ws, wc, wsPts);
      wholesaleMonths = monthlyFrom(ws, wc);
      // 철별 분할 품목(무·배추 — 도매 단일품종이 일부 달만)만 병합. 비철 다품목(상추 적/청)은 안 섞이게 가드.
      // 각 달 = 그 달 조사된 도매 품종 중 '가장 싼' 값 (소매 패턴 + 겹치는 달은 더 싼 쪽).
      if (wc.filter((c) => c > 0).length < FULL_YEAR_MIN) {
        const wsPer = [{ sums: ws, cnts: wc }]; // 대표 품종
        const wsSibs = (kindsByItem.get(it.itemCode) || []).filter((k) => k.kindCode !== it.kindCode && k.unit === it.unit);
        for (const k of wsSibs) {
          const ks = Array(12).fill(0);
          const kc = Array(12).fill(0);
          addPts(ks, kc, await fetchYearPoints(k, '02').catch(() => []));
          wsPer.push({ sums: ks, cnts: kc });
        }
        wholesaleMonths = Array.from({ length: 12 }, (_, m) => {
          let cheapest = null;
          for (const pk of wsPer) {
            if (pk.cnts[m] > 0) {
              const avg = Math.round(pk.sums[m] / pk.cnts[m]);
              if (cheapest == null || avg < cheapest) cheapest = avg;
            }
          }
          return cheapest;
        });
      }
    }

    // 연간 흐름(months) — 대표 품종 우선, 빈 달은 같은 단위의 다른 품종으로 채움
    const sums = Array(12).fill(0);
    const cnts = Array(12).fill(0);
    addPts(sums, cnts, repPts);
    let months = monthlyFrom(sums, cnts);
    let spanVarieties = false;
    let variety = null;
    let thisMonthVarieties = null;
    if (cnts.filter((c) => c > 0).length < SEASONAL_MAX) {
      // 대표 품종(=화면에 뜨는 무)이 조사된 달은 그 값 그대로 — 히어로의 이번 달과 일치.
      // 비는 달만 '그 철 주력(가장 많이 조사된)' 다른 품종으로 채운다(평균으로 섞지 않음 → 정체불명 값 방지).
      const sibs = (kindsByItem.get(it.itemCode) || []).filter((k) => k.kindCode !== it.kindCode && k.unit === it.unit);
      const sibPer = [];
      for (const k of sibs) {
        const ks = Array(12).fill(0);
        const kc = Array(12).fill(0);
        addPts(ks, kc, await fetchYearPoints(k).catch(() => []));
        sibPer.push({ kindName: k.kindName, sums: ks, cnts: kc });
      }
      months = months.map((repVal, m) => {
        if (repVal != null) return repVal; // 대표 품종이 있는 달 — 그대로
        let best = null;
        for (const pk of sibPer) if (pk.cnts[m] > 0 && (!best || pk.cnts[m] > best.cnts[m])) best = pk;
        if (!best) return null;
        spanVarieties = true;
        return Math.round(best.sums[m] / best.cnts[m]);
      });
      if (spanVarieties) {
        merged += 1;
        variety = varietyName(it.kindName, it.itemName); // 히어로 품종명
        // 이번 달에 실제 조사된 품종들 + 가격 (캡션 "6월 배추는 봄배추와 월동배추가 있어요") — 싼 순
        const m0 = new Date().getMonth();
        const tmv = [];
        if (cnts[m0] > 0) tmv.push({ name: variety, price: Math.round(sums[m0] / cnts[m0]) });
        for (const pk of sibPer) if (pk.cnts[m0] > 0) tmv.push({ name: varietyName(pk.kindName, it.itemName), price: Math.round(pk.sums[m0] / pk.cnts[m0]) });
        tmv.sort((a, b) => a.price - b.price);
        thisMonthVarieties = tmv;
      }
    }

    const sr = toSeries(repPts);
    const sw = toSeries(wsPts);
    if (sr.length || sw.length) {
      series[`${it.itemCode}-${it.kindCode}`] = { ...(sr.length ? { r: sr } : {}), ...(sw.length ? { w: sw } : {}) };
    }

    const key = `${it.itemCode}-${it.kindCode}`;
    out[key] = {
      hasWholesale: hasWholesaleFor(key),
      hasEco: await hasEcoFor(it).catch(() => false),
      level,
      recentAvg,
      today: it.today,
      normal: it.normal,
      months,
      spanVarieties,
      ...(variety ? { variety, thisMonthVarieties } : {}),
      ...(wholesaleRecentAvg != null ? { wholesaleRecentAvg, wholesaleMonths } : {}),
    };
    done += 1;
    if (done % 10 === 0) console.log(`  ${done}/${reps.length}`);
  }

  // KAMIS 장애 시 빈 verdicts가 기존 데이터를 덮어쓰는 사고 방지 (2026-07-15 실제 발생)
  if (Object.keys(out).length === 0) {
    console.error('판정 0건 — KAMIS 장애로 보고 기존 verdicts.json 보존, 실패 처리');
    process.exit(1);
  }
  // 부분 장애 보전 (2026-07-19 실제 발생: 판정은 되고 연간 시계열만 전멸) —
  // 새 months가 비었으면 직전 verdicts의 연간 흐름 필드를 물려받는다. 대표 품종이 바뀌었으면 같은 품목으로 폴백.
  try {
    const prev = JSON.parse(fs.readFileSync(new URL('../public/verdicts.json', import.meta.url), 'utf8')).items ?? {};
    let carried = 0;
    for (const [k, v] of Object.entries(out)) {
      if ((v.months ?? []).some(Boolean)) continue;
      const code = k.split('-')[0];
      const p = prev[k] ?? prev[Object.keys(prev).find((pk) => pk.startsWith(`${code}-`)) ?? ''];
      if (!p || !(p.months ?? []).some(Boolean)) continue;
      v.months = p.months;
      if (v.wholesaleRecentAvg == null && p.wholesaleRecentAvg != null) {
        v.wholesaleRecentAvg = p.wholesaleRecentAvg;
        v.wholesaleMonths = p.wholesaleMonths;
      }
      if (p.spanVarieties) {
        v.spanVarieties = p.spanVarieties;
        v.variety ??= p.variety;
        v.thisMonthVarieties ??= p.thisMonthVarieties;
      }
      carried += 1;
    }
    if (carried) console.log(`연간 흐름 결손 ${carried}건을 직전 verdicts에서 보전`);
  } catch {
    // 직전 파일 없음(첫 실행) — 보전 생략
  }
  const payload = { generatedAt: new Date().toISOString(), date: fmtDate(new Date()), items: out };
  const dir = new URL('../public/', import.meta.url);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir.pathname, 'verdicts.json'), JSON.stringify(payload));
  // 시계열은 별도 파일 — verdicts.json은 워커가 매 응답마다 읽으므로 가벼야 한다.
  // 빈 결과로 직전 파일을 덮어쓰지 않는다(KAMIS 장애 때 차트가 통째로 비는 사고 방지).
  const seriesPath = path.join(dir.pathname, 'series.json');
  if (Object.keys(series).length) {
    fs.writeFileSync(seriesPath, JSON.stringify({ generatedAt: new Date().toISOString(), items: series }));
    const pts = Object.values(series).reduce((n, v) => n + (v.r?.length ?? 0) + (v.w?.length ?? 0), 0);
    console.log(`완료 → public/series.json (${Object.keys(series).length}개 품목, 포인트 ${pts}개, ${Math.round(fs.statSync(seriesPath).size / 1024)}KB)`);
  } else {
    console.warn('시계열 0건 — series.json 유지(덮어쓰지 않음)');
  }
  const counts = Object.values(out).reduce((m, v) => ((m[v.level] = (m[v.level] ?? 0) + 1), m), {});
  console.log(`완료 → public/verdicts.json (${reps.length}개, 다품종 병합 ${merged}개)`, counts);
})().catch((e) => {
  console.error('ERR', e.message);
  process.exit(1);
});
