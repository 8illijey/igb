/**
 * igeobissa 레시피 Worker
 * - 매주(cron) 라이브 KAMIS cheap 품목으로 식약처 '조리식품 레시피 DB'(COOKRCP01)를 필터 → KV 캐시
 *   (공공데이터라 저작권 자유, 단계별 설명+실사진 포함)
 * - GET /recipes : 캐시된 레시피 JSON 반환(CORS 허용). 캐시 없으면 즉시 1회 생성.
 * - POST /generate?token=ADMIN_TOKEN : 수동 재생성(테스트/강제 갱신)
 */
export interface Env {
  RECIPES_KV: KVNamespace;
  FOODSAFETY_KEY: string;
  KAMIS_KEY: string;
  KAMIS_ID: string;
  ADMIN_TOKEN?: string;
  /** 공공데이터포털 KAMIS 미러(apis.data.go.kr) 인증키 — 원본 방화벽 차단 시 폴백 소스(2026-08-08) */
  DATAGO_KEY?: string;
  /** verdicts CI 재발화용(actions:write). 없으면 워치독 cron은 아무것도 안 한다 */
  GITHUB_TOKEN?: string;
}

const KV_KEY = 'recipes:latest';
const FOOD_BASE = 'http://openapi.foodsafetykorea.go.kr/api';

// 시세 추적 메인 재료 풀(신호칩이 붙는 품목명)
const ALLOWED = [
  '양파', '감자', '고구마', '배추', '양배추', '무', '당근', '대파', '마늘', '깐마늘', '애호박',
  '오이', '시금치', '상추', '토마토', '방울토마토', '파프리카', '버섯', '콩나물', '두부',
  '계란', '닭고기', '돼지고기', '소고기', '고등어', '오징어', '명태',
];
const ALIAS: Record<string, string> = { 애호박: '호박', 대파: '파', 소고기: '소', 돼지고기: '돼지', 닭고기: '닭', 깐마늘: '깐마늘(국산)' };
// 긴 토큰부터 매칭 — '방울토마토'를 '토마토'로, '파프리카'를 '파(대파)'로 오인하지 않게.
const ALLOWED_BY_LEN = [...ALLOWED].sort((a, b) => b.length - a.length);

const KAMIS_BASE = 'https://www.kamis.or.kr/service/price/xml.do';
// 원본 다운 서킷브레이커 — 방화벽 차단 중엔 매 요청이 원본 시도(최대 8s)를 낭비해 유기농 탭 등이 늘어진다.
// 타임아웃/비JSON(차단 페이지)을 보면 10분간 원본을 건너뛰고 바로 미러/stale로. isolate 단위 메모리.
let kamisDownUntil = 0;
// KAMIS 방화벽이 브라우저 UA 없는 요청을 무응답/차단 페이지로 막는다(2026-07-17 확인) — 모든 KAMIS fetch에 필수.
const KAMIS_HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
  accept: 'application/json, text/plain, */*',
};

// ── 공공데이터포털 KAMIS 미러 어댑터 (2026-08-08) ─────────────────────────────
// 원본 KAMIS가 데이터센터 IP를 방화벽으로 막아 워커/CI가 못 받을 때, apis.data.go.kr 게이트웨이(클라우드 IP 허용)
// 에서 받아 **원본 KAMIS 응답 포맷으로 변환**해 돌려준다. 앱·CI·verdicts 빌드는 무변경으로 동작.
// 코드 체계(부류·품목·품종·등급·시군구·소매도매)는 원본과 100% 동일 — 파라미터 이름만 매핑.
// 트레이드오프: 미러는 원본보다 1~2일 지연.
const DATAGO_BASE = 'https://apis.data.go.kr/B552845/perRegion/price';
const ymd = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

// 미러엔 평년(원본 dpr7)이 없다 → verdicts(CI 사전계산)의 normal을 daily 변환 시 dpr7에 주입.
// 그래야 앱 홈/상세의 '평년 대비' 판정이 무변경으로 복구된다. 1시간 메모리 캐시(isolate 단위).
// 소스 2개를 순서대로 시도. 1순위는 배포된 사이트(Vercel CDN), 2순위가 GitHub raw.
// raw를 1순위로 둔 것이 2026-08-18 새벽 장애의 직접 원인이었다 — raw가 429를 지속해서
// 이 함수가 빈 맵을 돌려주었고, 그러면 아래 dpr7 주입이 전부 '-'가 돼 앱 홈 목록이 통째로 비었다.
// 사이트 사본도 CI 푸시마다 자동 배포돼(2026-08-17 Git 연동) 매일 최신이다.
const SOURCES = (file: string) => [
  `https://igeobissa.com/${file}`,
  `https://raw.githubusercontent.com/8illijey/igb/main/mobile/public/${file}`,
];
const jsonCache = new Map<string, { t: number; v: Record<string, any> }>();
async function getJson(file: string): Promise<Record<string, any>> {
  const hit = jsonCache.get(file);
  if (hit && Date.now() - hit.t < 3600_000) return hit.v;
  for (const url of SOURCES(file)) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!r.ok) continue;
      const v = ((await r.json()) as any)?.items ?? {};
      if (Object.keys(v).length === 0) continue; // 빈 응답은 쓸모없다 — 다음 소스로
      jsonCache.set(file, { t: Date.now(), v });
      return v;
    } catch {
      // 다음 소스로
    }
  }
  return hit?.v ?? {}; // 전부 실패 — 만료된 캐시라도 있으면 그걸 쓴다
}

/**
 * 평년(dpr7) 주입 소스.
 * baselines.json = scripts/build-baselines.mjs가 미러 5년치 원천 가격으로 KAMIS 정의대로
 * 계산한 날짜별 평년(365칸). verdicts를 쓰던 이전 방식은 순환이었다 — verdicts가
 * 다시 이 워커를 거쳐 만들어졌기 때문에, 사실상 자체 최근 1년 평균을 '평년'으로
 * 되돌려주고 있었다(2026-08-18 확인: 56종 중 50종에서 normal === months[이번달]).
 * baselines는 원천 가격만으로 만들어져 순환이 없다.
 */
const CUM_DAYS = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
function dayIndex(d = new Date()): number {
  return Math.min(364, CUM_DAYS[d.getMonth()] + (d.getDate() - 1));
}
/**
 * 해당 품목·시장의 오늘자 평년. baselines에 없으면 verdicts로 폴백한다.
 * 폴백이 필요한 이유: 미러가 축산 도매 시계열을 안 준다(2026-08-18 확인: 소·돼지·닭·계란·우유
 * 17종 도매 수집 실패). 폴백 없이 바로 전환하면 그 품목들이 평년을 잃어 홈에서 사라진다.
 * 폴백값은 순환 출신이라 정확도가 떨어지지만, 없는 것보다는 낫다.
 */
function baselineOf(
  bl: Record<string, any>,
  verd: Record<string, any>,
  key: string,
  cls: string,
): number | null {
  const v = bl[key];
  const arr = cls === '02' ? v?.wsDays : v?.days;
  const n = Array.isArray(arr) ? arr[dayIndex()] : null;
  if (typeof n === 'number' && n > 0) return n;
  const f = verd[key];
  const fb = cls === '02' ? f?.wholesaleMonths?.[new Date().getMonth()] : f?.months?.[new Date().getMonth()];
  return typeof fb === 'number' && fb > 0 ? fb : null;
}

const DATAGO_PAGE = 1000;
/** data.go.kr 한 페이지 조회. 실패 시 null. */
async function datagoPage(key: string, cond: Record<string, string>, pageNo: number, extra: Record<string, string>): Promise<any[] | null> {
  const p = new URLSearchParams({ serviceKey: key, returnType: 'JSON', numOfRows: String(DATAGO_PAGE), pageNo: String(pageNo), ...extra });
  for (const [k, v] of Object.entries(cond)) p.append(k, v);
  let res: Response;
  try {
    res = await fetch(`${DATAGO_BASE}?${p.toString()}`, { signal: AbortSignal.timeout(10000) });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  let j: any;
  try {
    j = await res.json();
  } catch {
    return null;
  }
  if (j?.response?.header?.resultCode !== '0') return null; // 인증 실패·오류
  const item = j?.response?.body?.items?.item;
  return Array.isArray(item) ? item : [];
}

/**
 * data.go.kr price 조회 — cond[...] 필터 배열. 페이지를 끝까지 이어 받는다.
 * 지역 고정을 푸는 순간 한 질의가 25개 도시×일수만큼 불어나 1000행 상한을 넘는다
 * (2026-08-18: 5년치 단일 요청이 조용히 잘려 2021~2023만 돌아오는 것을 확인).
 * 페이지네이션 없이는 데이터가 무음으로 사라진다.
 */
async function datagoQuery(key: string, cond: Record<string, string>, extra: Record<string, string> = {}): Promise<any[] | null> {
  const out: any[] = [];
  for (let page = 1; page <= 6; page++) {
    const rows = await datagoPage(key, cond, page, extra);
    if (rows == null) return page === 1 ? null : out; // 첫 페이지 실패만 전체 실패로 본다
    out.push(...rows);
    if (rows.length < DATAGO_PAGE) break;
  }
  return out;
}

/** 미러 → 원본 KAMIS 포맷 변환. action별로 dailyPriceByCategoryList / period* 를 재구성. null이면 폴백 실패. */
async function fetchDatago(env: Env, action: string, sp: URLSearchParams): Promise<string | null> {
  if (!env.DATAGO_KEY) return null;
  const end = new Date();
  const start = new Date();

  if (action === 'dailyPriceByCategoryList') {
    // p_regday 존중 — verdicts 빌드가 과거 시점(-90/-180/-270일) 목록으로 계절 품종(봄배추 등)을
    // 발견한다. 무시하고 항상 오늘로 답하면 다품종 병합이 죽어 연간 흐름이 반토막 난다(2026-08-09).
    const regday = sp.get('p_regday');
    if (regday && /^\d{4}-\d{2}-\d{2}$/.test(regday)) {
      end.setTime(Date.parse(regday));
      start.setTime(Date.parse(regday));
    }
    start.setDate(end.getDate() - 10); // 최근 조사일을 확실히 잡도록 10일 창
    const rows = await datagoQuery(env.DATAGO_KEY, {
      'cond[exmn_ymd::GTE]': ymd(start),
      'cond[exmn_ymd::LTE]': ymd(end),
      'cond[se_cd::EQ]': sp.get('p_product_cls_code') ?? '01',
      'cond[ctgry_cd::EQ]': sp.get('p_item_category_code') ?? '',
      // 앱은 2026-08-20부터 p_country_code를 안 보낸다(원본 KAMIS에선 그게 전국 평균).
      // 미러 데이터셋은 perRegion 구조라 지역이 필수라 서울로 떨어진다 — 이 경로엔
      // 평년도 서울로 계산한 baselines.json을 주입하므로 둘이 서로 일관된다.
      'cond[sgg_cd::EQ]': sp.get('p_country_code') ?? '1101',
    });
    if (!rows) return null;
    // 미러의 축산 도매 등은 가격이 '0'으로 오는 껍데기 행이 있다(2026-08-09 확인) — 통과시키면
    // last-good KV의 정상 데이터를 오염시키므로 가격 없는 행은 버리고, 전부 껍데기면 폴백(null).
    const priced = rows.filter((r) => r.exmn_dd_avg_prc && r.exmn_dd_avg_prc !== '0');
    if (priced.length === 0) return null;
    const [base, verd] = await Promise.all([getJson('baselines.json'), getJson('verdicts.json')]);
    // 품목+품종별로 조사일 내림차순 → 사다리(dpr1=최근, dpr2~4=이전 조사일). 원본 dpr1~4 자리를 채운다.
    const byKind = new Map<string, any[]>();
    for (const r of priced) {
      const k = `${r.item_cd}_${r.vrty_cd}_${r.grd_cd}`;
      (byKind.get(k) ?? byKind.set(k, []).get(k)!).push(r);
    }
    const item: any[] = [];
    for (const list of byKind.values()) {
      list.sort((a, b) => String(b.exmn_ymd).localeCompare(String(a.exmn_ymd)));
      const top = list[0];
      const prices = list.map((r) => r.exmn_dd_avg_prc || '-');
      // 평년(dpr7) = baselines의 오늘자 값. 원천 가격만으로 계산돼 순환이 없다.
      const normal = baselineOf(base, verd, `${top.item_cd}-${top.vrty_cd}`, sp.get('p_product_cls_code') ?? '01');
      item.push({
        item_name: top.item_nm,
        item_code: top.item_cd,
        kind_name: top.vrty_nm,
        kind_code: top.vrty_cd,
        rank: top.grd_nm ?? '',
        rank_code: top.grd_cd,
        unit: top.unit_sz ? `${top.unit_sz}${top.unit}` : top.unit,
        // dpr1~4 = 최근 4개 조사일 사다리. dpr5(1개월)·6(1년)은 미러에 없어 비움.
        // dpr7(평년)은 verdicts에서 주입 — 앱 '평년 대비' 판정 복구.
        dpr1: prices[0] ?? '-',
        dpr2: prices[1] ?? '-',
        dpr3: prices[2] ?? '-',
        dpr4: prices[3] ?? '-',
        dpr5: '-',
        dpr6: '-',
        dpr7: normal != null ? String(normal) : '-',
      });
    }
    return JSON.stringify({ data: { item } });
  }

  // periodProductList / periodEcoPriceList — 품목 기간별 시계열. rowsToSeries가 countyname==='평균'만 읽으므로 그 라벨로.
  const s = sp.get('p_startday');
  const e = sp.get('p_endday');
  if (!s || !e) return null;
  // 친환경 데이터는 se_cd=07(신규)에 있다 — 03(구)은 데이터 0건(2026-08-08 확인). 등급(07유기농/08무농약)은 grd_cd로.
  const isEco = action === 'periodEcoPriceList';
  const seCd = isEco ? '07' : sp.get('p_productclscode') ?? '01';
  // 지역은 서울(1101) 고정을 유지한다.
  //
  // 알면서 남기는 한계: 원본 KAMIS의 countyname='평균' 행은 서울이 아니라 전국 조사처의
  // 평균이다(2026-08-18 확인: 친환경 평균 6,101 = 서울 5곳·부산·광주 판매처 7개의 산술평균,
  // 우리 값 5,832 = 서울 5곳 평균). 평년(dpr7)도 p_country_code와 무관하게 전국 단일값이라,
  // 우리 시계열은 서울 기준인데 비교 대상은 전국 기준이라 2~5% 계통 오차가 남는다.
  //
  // sgg_cd를 빼면 data.go.kr이 조회 자체를 실패시켜(2026-08-18 시도 — 모든 창 크기에서
  // 미러가 null이 돼 KV stale로 떨어졌다) 전국 평균을 그대로 받을 수 없다.
  // 제대로 하려면 지역별로 나눴 조회해 평균내야 하고(요청이 25배) 그건 별도 과제로 둔다.
  const cond: Record<string, string> = {
    'cond[exmn_ymd::GTE]': s.replace(/-/g, ''),
    'cond[exmn_ymd::LTE]': e.replace(/-/g, ''),
    'cond[se_cd::EQ]': seCd,
    'cond[item_cd::EQ]': sp.get('p_itemcode') ?? '',
    'cond[sgg_cd::EQ]': sp.get('p_countycode') ?? '1101',
  };
  const kind = sp.get('p_kindcode');
  if (kind) cond['cond[vrty_cd::EQ]'] = kind;
  if (isEco) {
    const rank = sp.get('p_productrankcode'); // 07=유기농, 08=무농약
    if (rank) cond['cond[grd_cd::EQ]'] = rank;
  }
  const rows = await datagoQuery(env.DATAGO_KEY, cond);
  if (!rows) return null;
  const priced = rows.filter((r) => r.exmn_dd_avg_prc && r.exmn_dd_avg_prc !== '0'); // 0원 껍데기 행 제거
  if (priced.length === 0) return null;
  // 조사일별로 전국 조사처를 평균 낸다 — 원본 '평균' 행의 정의와 같게.
  // 등급이 여러개면 질의에서 이미 grd_cd로 걸러져 오고, 친환경은 등급이 계약별로 섮여
  // 들어올 수 있지만 그역시 원본이 모두 섮어 평균내므로 같은 방식이 맞다.
  const byDay = new Map<string, { sum: number; cnt: number }>();
  for (const r of priced) {
    const d = String(r.exmn_ymd);
    const v = Number(String(r.exmn_dd_avg_prc).replace(/,/g, ''));
    if (!Number.isFinite(v) || v <= 0) continue;
    const cur = byDay.get(d) ?? { sum: 0, cnt: 0 };
    cur.sum += v;
    cur.cnt += 1;
    byDay.set(d, cur);
  }
  const item = [...byDay.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([y, v]) => ({
      countyname: '평균',
      yyyy: y.slice(0, 4),
      regday: `${y.slice(4, 6)}/${y.slice(6, 8)}`,
      price: String(Math.round(v.sum / v.cnt)),
    }));
  return JSON.stringify({ data: { item } });
}
// ─────────────────────────────────────────────────────────────────────────────

type Level = 'cheap' | 'fair' | 'expensive';

/** ALLOWED 품목의 라이브 cheap/fair/expensive 판정 (예년 대비 ±10%). 실패 시 null. */
async function liveLevels(env: Env): Promise<[string, Level | null][] | null> {
  if (!env.KAMIS_KEY || !env.KAMIS_ID) return null;
  const day = new Date().toISOString().slice(0, 10);
  const num = (s: unknown) => {
    const n = parseFloat(String(s).replace(/,/g, ''));
    return isNaN(n) ? null : n;
  };
  const live = new Map<string, Level>();
  for (const cat of ['100', '200', '400', '500']) {
    // p_country_code 생략 = 전국 평균. 앱·verdicts와 같은 기준이어야 레시피가 고르는 'cheap' 품목이
    // 홈 화면의 판정과 어긋나지 않는다(2026-08-20). 평년(dpr7)은 원래부터 전국 단일값이다.
    const qs = `p_cert_key=${env.KAMIS_KEY}&p_cert_id=${env.KAMIS_ID}&p_returntype=json&action=dailyPriceByCategoryList&p_product_cls_code=01&p_regday=${day}&p_convert_kg_yn=N&p_item_category_code=${cat}`;
    let j: any;
    try {
      j = await (await fetch(`${KAMIS_BASE}?${qs}`, { headers: KAMIS_HEADERS })).json();
    } catch {
      continue;
    }
    const rows = j?.data?.item;
    for (const it of Array.isArray(rows) ? rows : []) {
      const t = num(it.dpr1);
      const nrm = num(it.dpr7);
      if (t == null || nrm == null || t <= 0) continue;
      const pct = Math.round(((t - nrm) / nrm) * 100);
      if (pct <= -90) continue; // 데이터 결손 제외
      const nm = String(it.item_name);
      if (!live.has(nm)) live.set(nm, pct <= -10 ? 'cheap' : pct >= 10 ? 'expensive' : 'fair');
    }
  }
  if (!live.size) return null;
  const levelOf = (token: string): Level | null => {
    const q = ALIAS[token] ?? token;
    for (const [nm, lv] of live) if (nm === q) return lv;
    for (const [nm, lv] of live) if (nm.includes(q)) return lv;
    for (const [nm, lv] of live) if (q.includes(nm) && nm.length >= 2) return lv;
    return null;
  };
  return ALLOWED.map((t) => [t, levelOf(t)]);
}

const pad2 = (n: number) => String(n).padStart(2, '0');
const STEP_KEYS = Array.from({ length: 20 }, (_, i) => pad2(i + 1));
// 식약처 이미지·첨부는 http로 옴 — HTTPS 웹앱에서 mixed-content로 막히므로 https로 강제(실측: https 200).
const httpsify = (u: string) => u.replace(/^http:\/\//i, 'https://');
// 단계 설명 정리 — 앞 "1. " 번호, 뒤 한 글자 영문(원본의 이미지 참조 a/b/c) 제거.
// 식약처 MANUAL은 내부에 \n이 박혀 있어 줄바꿈이 어색하게 끊김 → 공백 1칸으로 합친다. 앞 "1." 번호·뒤 이미지참조 영문 제거.
const cleanStep = (s: string) => s.replace(/\s+/g, ' ').replace(/^\s*\d+\.\s*/, '').replace(/\s*[A-Za-z]\s*$/, '').trim();

/** RCP_PARTS_DTLS 한 청크 파싱. 두 포맷 + 줄머리 헤더 처리:
 *  · 괄호형 "감자(30g)" → name=감자, amount=30g
 *  · 공백형 "두부 20g(2×2×2cm)" → name=두부, amount=20g (뒤 설명 괄호 제거)
 *  · "재료 쌀(100g)"처럼 줄머리 헤더(재료/양념/육수…)는 떼어낸다. 분량 없는 줄(요리명)은 버린다. */
function parseChunk(raw: string): { name: string; amount: string } | null {
  const chunk = raw.replace(/^(재료|양념|육수|소스|고명|기타|주재료|부재료)\s+/, '').replace(/[•*■]/g, '').trim();
  const paren = chunk.match(/^([^()\d]+?)\s*\(([^()]*\d[^()]*)\)\s*$/); // 이름(분량) — 이름엔 숫자 없음
  if (paren) return { name: paren[1].trim(), amount: paren[2].trim() };
  const di = chunk.search(/\d/);
  if (di <= 0) return null;
  const name = chunk.slice(0, di).trim();
  const amount = chunk.slice(di).replace(/\s*\([^()]*\)\s*$/, '').trim(); // 뒤 설명 괄호 제거
  return name ? { name, amount } : null;
}

function parseParts(parts: string): { name: string; amount: string }[] {
  return parts
    .split(/\r?\n|,/)
    .map((s) => parseChunk(s.trim()))
    .filter((x): x is { name: string; amount: string } => x != null);
}

/** 청크명이 시세 추적 품목이면 표준 토큰(매칭 일관성) 반환. 긴 토큰부터 검사.
 *  ponytail: '쪽파'가 별칭 '파'에 걸려 대파로 태깅될 수 있음 — 가격만 살짝 어긋나는 희귀 엣지라 둠. */
function trackedToken(name: string): string | null {
  for (const t of ALLOWED_BY_LEN) {
    const q = ALIAS[t] ?? t;
    if (name.includes(t) || name.includes(q)) return t;
  }
  return null;
}

/** 식약처 COOKRCP01 — 재료명으로 레시피 검색(최대 40개). */
async function fetchByIngredient(env: Env, token: string): Promise<any[]> {
  const url = `${FOOD_BASE}/${env.FOODSAFETY_KEY}/COOKRCP01/json/1/40/RCP_PARTS_DTLS=${encodeURIComponent(token)}`;
  try {
    const j: any = await (await fetch(url)).json();
    const rows = j?.COOKRCP01?.row;
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

/** 식약처 row 1개 → 앱 레시피 객체. cheapSet/expensiveSet으로 cheapCount·hasExpensive 계산(목록 정렬·필터용). */
function buildRecipe(r: any, cheapSet: Set<string>, expensiveSet: Set<string>) {
  const tracked = new Map<string, string>(); // 표준토큰 → 분량
  const condiments: { name: string; amount: string }[] = [];
  for (const p of parseParts(String(r.RCP_PARTS_DTLS ?? ''))) {
    const tok = trackedToken(p.name);
    if (tok) {
      if (!tracked.has(tok)) tracked.set(tok, p.amount);
    } else condiments.push(p);
  }
  const ingredients = [...tracked].map(([name, amount]) => ({ name, amount }));
  const steps: string[] = [];
  const stepImages: string[] = [];
  for (const k of STEP_KEYS) {
    const t = cleanStep(String(r[`MANUAL${k}`] ?? ''));
    if (!t) continue;
    steps.push(t);
    stepImages.push(httpsify(String(r[`MANUAL_IMG${k}`] ?? '')));
  }
  return {
    title: String(r.RCP_NM ?? '').trim(),
    ingredients,
    condiments,
    steps,
    note: String(r.RCP_NA_TIP ?? '').replace(/\s+/g, ' ').trim(),
    heroImage: httpsify(String(r.ATT_FILE_NO_MK || r.ATT_FILE_NO_MAIN || '')),
    stepImages,
    cheapCount: ingredients.filter((i) => cheapSet.has(i.name)).length,
    hasExpensive: ingredients.some((i) => expensiveSet.has(i.name)),
    // 식약처 단계사진 화질: `/uploadimg/cook/20_…` = 181×125 저해상도(크게 보면 깨짐), `/uploadimg/YYYYMMDD/…` = 고해상도.
    // 저해상도 단계사진이 있으면 후순위로 — 크게보기 모달에서 안 깨지게.
    lowResSteps: stepImages.filter(Boolean).some((u) => u.includes('/uploadimg/cook/')),
  };
}

/** 재료명으로 식약처 레시피 검색 → 앱 레시피 목록(싼/비싼 판단은 클라가 라이브 시세로). */
export async function searchRecipes(env: Env, q: string, byTitle = false) {
  if (!env.FOODSAFETY_KEY) throw new Error('FOODSAFETY_KEY missing');
  // 기본은 재료(RCP_PARTS_DTLS) 검색, byTitle이면 레시피명(RCP_NM) — 관심목록이 제목으로 복원할 때 사용.
  const field = byTitle ? 'RCP_NM' : 'RCP_PARTS_DTLS';
  const url = `${FOOD_BASE}/${env.FOODSAFETY_KEY}/COOKRCP01/json/1/50/${field}=${encodeURIComponent(q)}`;
  let rows: any[] = [];
  try {
    rows = (await (await fetch(url)).json())?.COOKRCP01?.row ?? [];
  } catch {}
  const empty = new Set<string>();
  const recipes = (Array.isArray(rows) ? rows : [])
    .map((r) => buildRecipe(r, empty, empty))
    .filter((r) => r.title && r.heroImage && r.steps.length >= 2)
    .sort((a, b) => Number(a.lowResSteps) - Number(b.lowResSteps)) // 고화질 단계사진 우선
    .map(({ cheapCount, hasExpensive, lowResSteps, ...r }) => r);
  return { source: 'foodsafetykorea', query: q, recipes };
}

/** 이번 주 싼 재료로 식약처 공공 레시피를 필터·정리 → { generatedAt, source, cheapHint, fairHint, recipes } */
export async function generate(env: Env) {
  if (!env.FOODSAFETY_KEY) throw new Error('FOODSAFETY_KEY missing');
  const levels = await liveLevels(env);
  let cheapHint: string[], fairHint: string[];
  if (levels) {
    cheapHint = levels.filter(([, lv]) => lv === 'cheap').map(([t]) => t);
    fairHint = levels.filter(([, lv]) => lv === 'fair').map(([t]) => t);
  } else {
    cheapHint = ['감자', '양배추', '고구마', '토마토'];
    fairHint = ['양파', '무', '당근', '대파', '오이', '애호박'];
  }
  if (cheapHint.length === 0) cheapHint = fairHint.slice(0, 3);
  const cheapSet = new Set(cheapHint);
  const expensiveSet = new Set((levels ?? []).filter(([, lv]) => lv === 'expensive').map(([t]) => t));

  // 싼 재료별로 레시피 수집(최대 8종) → RCP_SEQ로 중복 제거
  const raw = (await Promise.all(cheapHint.slice(0, 8).map((t) => fetchByIngredient(env, t)))).flat();
  const bySeq = new Map<string, any>();
  for (const r of raw) if (r?.RCP_SEQ && !bySeq.has(String(r.RCP_SEQ))) bySeq.set(String(r.RCP_SEQ), r);

  // 사진 있고, 추적 재료 1개+, 단계 2개+, 스텝에 '?'(식약처 원본에서 깨진 스텝참조) 없는 것.
  // (비싼 재료 있어도 버리지 않고 뒤로 랭크 — 빈/적은 목록 방지)
  const recipes = [...bySeq.values()]
    .map((r) => buildRecipe(r, cheapSet, expensiveSet))
    .filter(
      (r) =>
        r.title &&
        r.heroImage &&
        r.ingredients.length >= 1 &&
        r.steps.length >= 2 &&
        !r.steps.some((s: string) => s.includes('?')),
    )
    // 고화질 단계사진 우선 → 싼 재료 많은 순 → 비싼 재료 적은 순 → 재료 많은 순
    .sort(
      (a, b) =>
        Number(a.lowResSteps) - Number(b.lowResSteps) ||
        b.cheapCount - a.cheapCount ||
        Number(a.hasExpensive) - Number(b.hasExpensive) ||
        b.ingredients.length - a.ingredients.length,
    )
    .slice(0, 30)
    .map(({ cheapCount, hasExpensive, lowResSteps, ...r }) => r);

  return { generatedAt: new Date().toISOString(), source: 'foodsafetykorea', cheapHint, fairHint, recipes };
}

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
};

/** 생성 결과를 KV에 저장. 빈 결과(식약처 일시 장애 등)는 10분만 캐시 — 좋은 캐시를 영구히 덮지 않고 곧 자동 재시도. */
function storeRecipes(env: Env, data: { recipes: unknown[] }): Promise<void> {
  return env.RECIPES_KV.put(KV_KEY, JSON.stringify(data), data.recipes.length ? undefined : { expirationTtl: 600 });
}

// verdicts CI 워치독 — GitHub cron이 통째로 누락되는 날이 잦다(2026-08-31: 예약 3회 전부
// 미실행, health.yml 워치독도 같은 cron이라 같이 침묵). 발화만 Cloudflare cron으로 옮긴다.
// 판정은 health.yml #7과 동일: '오늘 KST 16시(KAMIS 갱신) 이후 생성분'이 main에 있는가.
// generatedAt 대신 series.json의 최근 커밋 시각을 본다 — 같은 의미(빌드 직후 커밋)인데
// 파일 700KB를 매시 받지 않아도 된다. 신선하면 아무것도 안 하고, 아니면 dispatch만 쏜다.
// 중복 발화는 verdicts.yml의 concurrency+guard가 흡수하므로 여기선 억제 로직이 필요 없다.
const GH_REPO = '8illijey/igb';

async function fireVerdictsIfStale(env: Env): Promise<void> {
  if (!env.GITHUB_TOKEN) return;
  const gh = (path: string, init?: RequestInit) =>
    fetch(`https://api.github.com/repos/${GH_REPO}${path}`, {
      ...init,
      headers: {
        authorization: `Bearer ${env.GITHUB_TOKEN}`,
        'user-agent': 'igeobissa-watchdog',
        accept: 'application/vnd.github+json',
        ...(init?.headers ?? {}),
      },
    });

  const commits = await gh('/commits?path=mobile/public/series.json&per_page=1&sha=main');
  const committedAt = (await commits.json<any>())?.[0]?.commit?.committer?.date;
  if (committedAt) {
    const kst = (iso: string | number) => new Date(new Date(iso).getTime() + 9 * 3600e3);
    const gen = kst(committedAt);
    const now = kst(Date.now());
    const fresh = gen.toISOString().slice(0, 10) === now.toISOString().slice(0, 10) && gen.getUTCHours() >= 16;
    if (fresh) return;
  }
  // 커밋 조회 실패 시에도 발화한다 — 헛발화는 guard가 스킵하지만 침묵은 하루치 데이터를 잃는다.
  const res = await gh('/actions/workflows/verdicts.yml/dispatches', {
    method: 'POST',
    body: JSON.stringify({ ref: 'main' }),
  });
  // PAT 만료·권한 오류가 무음이면 워치독이 통째로 무력화된다(2026-09-02 실사고 의심) —
  // throw로 cron 실행을 실패 처리해 CF 대시보드 오류 카운트·tail에 노출시킨다.
  if (res.status !== 204) throw new Error(`verdicts dispatch ${res.status}: ${await res.text()}`);
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // 매시 워치독 cron과 주 1회 레시피 cron을 트리거 문자열로 구분
    if (event.cron === '10 7-13 * * *') return ctx.waitUntil(fireVerdictsIfStale(env));
    ctx.waitUntil(generate(env).then((data) => storeRecipes(env, data)));
  },

  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

    // 수동 재생성(관리자 토큰)
    if (req.method === 'POST' && url.pathname === '/generate') {
      if (!env.ADMIN_TOKEN || url.searchParams.get('token') !== env.ADMIN_TOKEN) {
        return new Response('forbidden', { status: 403, headers: CORS });
      }
      const data = await generate(env);
      await storeRecipes(env, data);
      return Response.json(data, { headers: CORS });
    }

    // KAMIS 프록시 — cert를 서버에서 주입해 클라이언트 키 노출 제거.
    // 클라이언트는 cert 없이 KAMIS 파라미터만 보내고, 여기서 cert_key/cert_id를 붙여 포워딩한다.
    if (url.pathname === '/kamis') {
      const ALLOWED_ACTIONS = new Set(['dailyPriceByCategoryList', 'periodProductList', 'periodEcoPriceList']);
      if (!ALLOWED_ACTIONS.has(url.searchParams.get('action') ?? '')) {
        return new Response('bad action', { status: 400, headers: CORS });
      }
      if (!env.KAMIS_KEY || !env.KAMIS_ID) {
        return new Response('not configured', { status: 503, headers: CORS });
      }
      const params = new URLSearchParams(url.search);
      params.set('p_cert_key', env.KAMIS_KEY);
      params.set('p_cert_id', env.KAMIS_ID);
      params.set('p_returntype', 'json');
      // last-good 폴백 — 2026-07-15 KAMIS 전면 장애(무응답·방화벽 페이지)로 프로덕션이 백지가 됐다.
      // 성공 응답을 KV에 저장해두고, 상류가 죽으면 그걸 내보낸다. 키에서 날짜를 뺀다 —
      // 날짜와 무관하게 '가장 최근 성공한 같은 질의'가 잡히도록.
      //
      // 홈 목록(dailyPriceByCategoryList)에만 건다. 기간 질의(periodProductList·periodEcoPriceList)는
      // 뺐다 — 2026-08-21 Cloudflare가 'KV requests are temporarily blocked' 메일을 보냈고,
      // 확인해보니 무료 티어 쓰기 한도(1,000/일)를 5일 중 3일 초과하고 있었다(1,180·1,440·1,090).
      // 원인은 기간 질의다: 키가 품목×품종×등급×소매도매×기간버킷이라 3,444개까지 불어났고,
      // 값이 바뀔 때마다(=매일) 쓰기가 나간다. 게다가 한 요청마다 비교용 get이 한 번씩 든다.
      // 지금은 기간 질의를 KV로 지킬 이유도 없다 — 상세 '최근 시세' 차트는 2026-08-20부터
      // series.json(CDN 사전계산)이 담당한다. 판매처·유기농은 장애 중 비지만 부차적이고,
      // 홈 목록은 미러 → daily last-good 순으로 그대로 보호된다(키 8개, 쓰기 하루 최대 8회).
      const action = url.searchParams.get('action') ?? '';
      const staleKey: string | null =
        action === 'dailyPriceByCategoryList'
          ? `kamis:daily:${url.searchParams.get('p_product_cls_code') ?? '01'}:${url.searchParams.get('p_item_category_code') ?? ''}`
          : null;
      let upstream: Response | null = null;
      if (Date.now() >= kamisDownUntil) {
        try {
          // KAMIS는 장애 시 응답 없이 매달린다 — 8초 컷하고 폴백으로.
          upstream = await fetch(`${KAMIS_BASE}?${params.toString()}`, {
            signal: AbortSignal.timeout(8000),
            headers: KAMIS_HEADERS,
          });
        } catch {
          kamisDownUntil = Date.now() + 600_000; // 타임아웃·네트워크 → 10분 원본 스킵
        }
      }
      // KAMIS는 요청 파라미터(cert 포함)를 응답 condition에 echo한다 → 제거해야 키가 안 샌다.
      let text = upstream ? await upstream.text() : '';
      let parsed = false;
      let hasRows = false;
      try {
        const j = JSON.parse(text);
        delete j.condition;
        text = JSON.stringify(j);
        parsed = true;
        const rows = j?.data?.item;
        hasRows = Array.isArray(rows) && rows.length > 0;
        if (hasRows) kamisDownUntil = 0; // 원본 생존 확인 — 브레이커 해제
        if (staleKey && upstream?.ok && hasRows) {
          const body = text;
          // 값이 같으면 안 씀 — KV 쓰기 한도 절약 (시세는 하루 한 번 바뀜)
          ctx.waitUntil(
            env.RECIPES_KV.get(staleKey).then((cur) => (cur === body ? undefined : env.RECIPES_KV.put(staleKey, body))),
          );
        }
      } catch {
        // 비-JSON(방화벽 차단 페이지 등) — 원본 다운으로 간주, 10분 스킵.
        if (upstream) kamisDownUntil = Date.now() + 600_000;
        // cert 두 값 모두 마스킹. 검증 못한 본문이므로 캐시 금지.
        text = text.split(env.KAMIS_KEY).join('***').split(env.KAMIS_ID).join('***');
      }
      // 장애 플래핑 대응: KAMIS는 죽는 중에 방화벽 페이지뿐 아니라 '데이터 없음' 정상 JSON도 섞어 준다
      // (2026-07-16 확인). 빈 응답도 폴백 대상 — stale은 같은 질의가 과거에 데이터를 준 적 있을 때만
      // 존재하므로, 정당하게 늘 비는 질의(등급 후보 탐색 등)는 stale이 없어 원문 그대로 통과된다.
      if (!(parsed && hasRows)) {
        // ① data.go.kr 미러 폴백 — 원본 방화벽 차단 시 클라우드에서 받아 원본 포맷으로 변환(2026-08-08).
        //    성공하면 last-good KV에도 저장해 다음 장애 때 미러 호출 없이 바로 응답.
        const mirror = await fetchDatago(env, action, url.searchParams).catch(() => null);
        if (mirror) {
          // 값이 같으면 안 씀 — KV 무료 티어 일일 쓰기 1000회. 중복 put이 한도를 태운 사고(2026-08-09).
          if (staleKey)
            ctx.waitUntil(
              env.RECIPES_KV.get(staleKey).then((cur) => (cur === mirror ? undefined : env.RECIPES_KV.put(staleKey, mirror))),
            );
          return new Response(mirror, {
            headers: {
              'content-type': 'application/json; charset=utf-8',
              'cache-control': 'public, max-age=300',
              'x-igb-mirror': '1', // 미러 경유(1~2일 지연) 표식
              ...CORS,
            },
          });
        }
        // ② last-good KV — 미러도 실패면 마지막 정상 응답.
        if (staleKey) {
          const stale = await env.RECIPES_KV.get(staleKey);
          if (stale) {
            return new Response(stale, {
              headers: {
                'content-type': 'application/json; charset=utf-8',
                'cache-control': 'no-store', // 장애 중 임시 응답 — 엣지에 남기지 않는다
                'x-igb-stale': '1',
                ...CORS,
              },
            });
          }
        }
      }
      return new Response(text, {
        status: upstream?.status ?? 599,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': parsed ? 'public, max-age=300' : 'no-store',
          ...CORS,
        },
      });
    }

    // 레시피 검색 — 재료명으로 식약처 라이브 조회 (캐시 1시간)
    if (url.pathname === '/recipes/search') {
      const q = (url.searchParams.get('q') ?? '').trim();
      if (!q) return Response.json({ recipes: [] }, { headers: CORS });
      const data = await searchRecipes(env, q, url.searchParams.get('by') === 'title');
      return new Response(JSON.stringify(data), {
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=3600', ...CORS },
      });
    }

    // 레시피 조회 (캐시 우선, 없으면 즉시 생성)
    if (url.pathname === '/recipes' || url.pathname === '/') {
      let cached = await env.RECIPES_KV.get(KV_KEY);
      if (!cached) {
        const data = await generate(env);
        cached = JSON.stringify(data);
        await storeRecipes(env, data);
      }
      return new Response(cached, {
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=3600', ...CORS },
      });
    }
    // 쇼핑 아웃링크 클릭 집계 — 일별 카운터. 바디 없는 단순 POST라 preflight 불필요.
    if (req.method === 'POST' && url.pathname === '/click') {
      const store = url.searchParams.get('store') ?? '';
      const item = url.searchParams.get('item') ?? '';
      if (!/^[a-z]{1,20}$/.test(store) || !/^[\d-]{1,20}$/.test(item))
        return new Response('bad request', { status: 400, headers: CORS });
      const key = `click:${new Date().toISOString().slice(0, 10)}:${store}:${item}`;
      // ponytail: KV는 원자 증가가 없어 동시 클릭이 드물게 유실될 수 있음 — 저트래픽 MVP 허용, 필요 시 Durable Object로
      const cur = parseInt((await env.RECIPES_KV.get(key)) ?? '0', 10);
      await env.RECIPES_KV.put(key, String(cur + 1));
      return new Response('ok', { headers: CORS });
    }

    // 쇼핑 딥링크 트램펄린 — SSG(이마트몰) 제휴 게이트웨이가 한글 쿼리 파라미터를 지워서,
    // ASCII뿐인 이 URL(base64url)을 경유시킨 뒤 여기서 진짜 검색 URL로 302시킨다.
    // 귀속 쿠키는 게이트웨이 홉(.ssg.com)에서 이미 심어진 상태라 수수료에 영향 없음.
    if (url.pathname === '/go') {
      let target = '';
      try {
        const b64 = (url.searchParams.get('u') ?? '').replace(/-/g, '+').replace(/_/g, '/');
        target = new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
      } catch {}
      // 오픈 리다이렉트 방지 — 제휴 몰 도메인만 허용
      if (!/^https:\/\/(emart\.ssg\.com|www\.ssg\.com|www\.kurly\.com|www\.cjthemarket\.com)\//.test(target))
        return new Response('bad request', { status: 400, headers: CORS });
      return Response.redirect(target, 302);
    }

    // 클릭 집계 조회 — { "2026-07-03:coupang:245": 3, ... }
    if (url.pathname === '/clicks') {
      if (env.ADMIN_TOKEN && url.searchParams.get('token') !== env.ADMIN_TOKEN)
        return new Response('forbidden', { status: 403, headers: CORS });
      const list = await env.RECIPES_KV.list({ prefix: 'click:' });
      const out: Record<string, number> = {};
      for (const k of list.keys) out[k.name.slice(6)] = parseInt((await env.RECIPES_KV.get(k.name)) ?? '0', 10);
      return Response.json(out, { headers: CORS });
    }

    return new Response('not found', { status: 404, headers: CORS });
  },
};
