/**
 * KAMIS 농수산물 가격정보 Open API 어댑터.
 * - dailyPriceByCategoryList: 카테고리별 당일/평년(dpr7) 시세 → 신호 계산의 원천
 * - periodProductList: 일별 시계열 → 상세 차트
 * 응답 포맷은 .api-samples/*.json 실응답 기준.
 */
import type { SignalLevel } from '../theme/tokens';

// KAMIS는 worker 프록시 경유 — cert_key/cert_id는 서버에서 주입되어 클라이언트에 노출되지 않는다.
// 워커 URL 하드코딩: Vercel env EXPO_PUBLIC_KAMIS_URL이 자기 오리진 값으로 오염돼 전 요청이 앱 HTML을 받는
// 사고가 반복됨(2026-07-16, 2026-08-08). env 오버라이드는 사고만 유발하므로 제거. 워커 URL은 고정값이라 무방.
const BASE = 'https://igeobissa-recipes.designerxyzi.workers.dev/kamis';

/** 타임아웃 있는 fetch — 병렬 호출(Promise.all)에서 하나가 hang해도 전체가 안 멈추게. */
async function fetchT(url: string, ms = 12000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

/**
 * 신호 임계값(±1%) — 평년·어제 동일 적용.
 * 0보다 싸면 싸요/비싸면 비싸요. ±1% 안만 "비슷"으로 흡수(일별 잔진동 노이즈).
 * (2026-06-19: 기존 ±10% 밴드가 −9%까지 "평소"로 묻어버려 1%로 좁힘 — design.md Known Gaps 검증 반영)
 */
const THRESHOLD = 0.01;

export const CATEGORIES = [
  { code: '100', name: '식량작물' },
  { code: '200', name: '채소' },
  { code: '400', name: '과일' },
  { code: '500', name: '축산' },
] as const;

export interface PriceItem {
  categoryCode: string;
  itemName: string;
  itemCode: string;
  kindName: string;
  kindCode: string;
  rankCode: string;
  unit: string;
  /** 당일 (dpr1) */
  today: number | null;
  /** 1일전 (dpr2) */
  yesterday: number | null;
  /** 1개월전 (dpr5) */
  monthAgo: number | null;
  /** 1년전 (dpr6) */
  yearAgo: number | null;
  /** 일평년 — UI 어휘 '평년' (dpr7) */
  normal: number | null;
  level: SignalLevel | null;
  /** 평년 대비 % (양수 = 평년보다 비쌈) */
  vsNormalPct: number | null;
  vsYesterdayPct: number | null;
}

export interface SeriesPoint {
  date: string; // MM/DD
  year?: string; // YYYY — 1년 차트에서 작년 날짜에 연도 표기용
  price: number;
}

function parsePrice(v: unknown): number | null {
  if (typeof v !== 'string' || v === '-' || v === '' || v === '0') return null;
  const n = Number(v.replace(/,/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** KAMIS 축산 품목명은 가축명(소·돼지·닭)으로 와서 식품명으로 보정한다 */
const NAME_FIX: Record<string, string> = {
  소: '소고기',
  돼지: '돼지고기',
  닭: '닭고기',
  // 참다래 = 키위의 국산 품종명(KAMIS 공식 명칭). 그대로 두면 뭐지 모른다는 질문을 받았다
  // (2026-08-20). 둘 다 적어 검색에서 '참다래'도 '키위'도 잡히게 한다(search는 부분일치).
  참다래: '참다래(키위)',
};
/** 고기류 — 부위(kindName)가 핵심이므로 이름에 붙인다. 계란·우유는 제외. */
const MEAT_CODES = new Set(['4301', '4304', '4401', '4402', '9901']);
/** 품종명 끝의 단위 괄호를 둔다. "육계(kg)"→"육계", "풋고추(녹광 등)"→"풋고추" */
/**
 * 품종명 끝의 '단위 괄호' 한 덩어리만 떼어낸다. "육계(kg)"→"육계", "여름(고랭지)(1포기)"→"여름(고랭지)".
 *
 * 정규식 \([^)]*\)$ 로는 안 된다 — 도매 품종명은 괄호가 중첩된다:
 * "여름(고랭지)(10kg(그물망 3포기))". 안쪽에 ')'가 있어 매치가 실패하고,
 * 그대로 남아 "여름(고랭지)(10kg(그물망 3포기))배추"로 표시됐다(2026-08-20).
 * 그래서 뒤에서부터 괄호 짝을 세어 마지막 덩어리 하나만 정확히 제거한다.
 */
export function stripUnitParen(k: string): string {
  const s = String(k ?? '').trim();
  if (!s.endsWith(')')) return s;
  let depth = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    if (s[i] === ')') depth += 1;
    else if (s[i] === '(') {
      depth -= 1;
      if (depth === 0) return i === 0 ? s : s.slice(0, i).trim(); // 통째로 괄호면 이름이 사라지니 그대로 둔다
    }
  }
  return s; // 짝이 안 맞으면 건드리지 않는다
}
const cleanKind = (k: string) => stripUnitParen(k);

function displayName(name: string, code: string, kindName: string): string {
  const fixed = NAME_FIX[name] ?? name;
  const k = cleanKind(kindName);
  return MEAT_CODES.has(code) && k ? `${fixed} ${k}` : fixed;
}

/**
 * 자동 규칙이 어색한 품종만 손으로 정한다.
 * 포도는 '거봉'·'샤인머스켓'만 두면 검색에서 '포도'로 안 걸려 품목명을 붙인다.
 */
const KIND_LABEL: Record<string, string> = {
  // 꾬리·청양·오이맛은 그 자체로 통용하는 이름이라 '풋고추'를 앎 붙이지 않는다(2026-08-20 사용자 요청).
  '242-02': '꽈리고추',
  '242-03': '청양고추',
  '242-04': '오이맛고추',
  '411-05': '후지사과',
  '411-06': '아오리사과',
  '414-01': '캠벨얼리포도',
  '414-02': '거봉포도',
  '414-12': '샤인머스켓포도',
  '223-01': '가시오이',
  '223-02': '다다기오이',
  '223-03': '취청오이',
  '224-02': '쥬키니호박',
  '9903-21': '계란 10구',
  '9903-23': '계란 30구',
};

/**
 * 한 품목에 품종이 여럿일 때 구분되는 표시명을 만든다.
 * 규칙: 품종명이 품목명을 품으면 그대로(대파·쪽파), 짧으면 붙이고(적상추),
 * 길면 띄어쓴다(건고추 화건). 끝글자와 첫글자가 겹치면 붙이지 않는다.
 */
function kindLabel(item: PriceItem, kindsInItem: number): string {
  const override = KIND_LABEL[`${item.itemCode}-${item.kindCode}`];
  if (override) return override;
  if (MEAT_CODES.has(item.itemCode)) return item.itemName; // 이미 '소고기 안심' 형태
  if (kindsInItem <= 1) return item.itemName;
  const v = cleanKind(item.kindName);
  const base = item.itemName;
  if (!v || v === base) return base;
  if (v.includes(base)) return v;
  const stutter = v.slice(-1) === base.slice(0, 1);
  return [...v].length <= 2 && !stutter ? `${v}${base}` : `${base} ${v}`;
}

/**
 * 홈 목록과 똑같은 표시명을 만든다. 상세·도매 화면이 홈과 다른 이름을 쓰지 않게 규칙을 공유한다.
 * (2026-08-20: 홈 '거봉포도' ↔ 도매 '포도'처럼 18개 품목이 화면마다 다르게 보였다.)
 */
export function labelOf(
  item: Pick<PriceItem, 'itemCode' | 'kindCode' | 'itemName' | 'kindName'>,
): string {
  return kindLabel(item as PriceItem, 2); // 2 = 품종명까지 드러내는 다품종 규칙
}

export function judge(today: number | null, base: number | null): SignalLevel | null {
  if (today == null || base == null) return null;
  const r = (today - base) / base;
  if (r <= -THRESHOLD) return 'cheap';
  if (r >= THRESHOLD) return 'expensive';
  return 'fair';
}

function pct(today: number | null, base: number | null): number | null {
  if (today == null || base == null) return null;
  return Math.round(((today - base) / base) * 100);
}

function qs(params: Record<string, string>): string {
  return Object.entries({
    p_returntype: 'json',
    ...params,
  })
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
}

function fmtDate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** 시장 구분 — 01 소매 / 02 도매. 친환경은 EcoPriceList 별도 API(평년 없음)라 미지원. */
export type MarketCls = '01' | '02';

/** 카테고리 하나의 당일 시세 목록 (서울 기준) */
export async function fetchCategory(
  categoryCode: string,
  regday?: string,
  cls: MarketCls = '01',
): Promise<PriceItem[]> {
  const url = `${BASE}?${qs({
    action: 'dailyPriceByCategoryList',
    p_product_cls_code: cls,
    // p_country_code를 일부러 안 보낸다 = 전국 평균. 예전엔 '1101'(서울) 고정이었는데,
    // 같은 화면의 다른 숫자는 전부 전국 기준이라 혼자만 기준이 달랐다(2026-08-20 확인):
    //   · 평년(dpr7)은 p_country_code와 무관하게 항상 전국 단일값
    //   · 최근 시세 차트는 periodProductList의 countyname='평균'(=전국) 행만 읽는다
    // 그래서 오늘가만 서울이었고, 차트 끝에 서울값이 꽂혀 절벽이 생겼다
    // (신고배 전국 42,017 vs 서울 27,667). 81개 중 9개는 싸요/비싸요 판정까지 바뀌었다.
    // 미러(data.go.kr) 폴백 경로는 perRegion 데이터셋이라 지역이 필수 — 워커가 1101로 기본값을 넣고,
    // 그 경로의 평년은 서울로 계산한 baselines.json이라 둘이 서로 일관된다.
    p_regday: regday ?? fmtDate(new Date()),
    p_convert_kg_yn: 'N',
    // 주의: 문서·체감상 'p_category_code'가 아니라 'p_item_category_code'만 동작한다.
    // 잘못된 이름이면 에러 없이 기본 부류(100 식량작물)로 떨어지는 무음 폴백 — 2026-06-13 디버깅으로 확인.
    p_item_category_code: categoryCode,
  })}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`KAMIS HTTP ${res.status}`);
  const json = await res.json();
  const rows: any[] = json?.data?.item ?? [];
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((r) => r.item_name && r.item_code)
    .map((r) => {
      // KAMIS 일별가 사다리: dpr1 당일 → dpr2 1일전 → dpr3 1주전 → dpr4 2주전.
      // 미나리·생강·망고처럼 매일 조사 안 하는 품목은 당일칸이 비고 시계열에만 최근가가 남는다.
      // '오늘 가격'을 가장 최근 조사가로, '어제 가격'은 그 다음으로 최근인 조사가로 잡아 가격이 증발하지 않게 한다.
      const ladder = [r.dpr1, r.dpr2, r.dpr3, r.dpr4].map(parsePrice);
      const ti = ladder.findIndex((v) => v != null); // 최근 조사가 위치
      const today = ti === -1 ? null : ladder[ti];
      const yesterday = ti === -1 ? null : (ladder.slice(ti + 1).find((v) => v != null) ?? null);
      const normal = parsePrice(r.dpr7);
      return {
        categoryCode,
        itemName: displayName(String(r.item_name), String(r.item_code), String(r.kind_name ?? '')),
        itemCode: String(r.item_code),
        kindName: String(r.kind_name ?? ''),
        kindCode: String(r.kind_code ?? '00'),
        rankCode: String(r.rank_code ?? '04'),
        unit: String(r.unit ?? ''),
        today,
        yesterday,
        monthAgo: parsePrice(r.dpr5),
        yearAgo: parsePrice(r.dpr6),
        normal,
        level: judge(today, normal),
        vsNormalPct: pct(today, normal),
        vsYesterdayPct: pct(today, yesterday),
      };
    });
}

/** 전 카테고리 병렬 수집. 당일 데이터가 비면 최근 영업일까지 거슬러 재시도. */
export async function fetchAllCategories(): Promise<PriceItem[]> {
  const load = async (regday?: string) => {
    const results = await Promise.allSettled(
      CATEGORIES.map((c) => fetchCategory(c.code, regday)),
    );
    return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  };
  // 주말·공휴일·발행 전(오후 4시)엔 일부 품목(축산 등)만 데이터가 있고 채소·과일은 비어 온다.
  // "하나라도 있으면 멈춤"이 아니라, 충분히 많이(≥30) 채워진 '완전한 영업일'을 만날 때까지 거슬러 간다.
  const withToday = (arr: PriceItem[]) => arr.filter((i) => i.today != null).length;
  const FULL = 30;
  let items = await load();
  for (let back = 1; back <= 7 && withToday(items) < FULL; back++) {
    const d = new Date();
    d.setDate(d.getDate() - back);
    const next = await load(fmtDate(d));
    if (withToday(next) > withToday(items)) items = next; // 더 완전한 날만 채택
  }
  // 1차: 품목·품종 단위로 1행만 — 고기 등급(rank 1·2·3)이 같은 이름으로 중복되는 것 방지(상위 등급 유지).
  const seen = new Set<string>();
  const unique = items.filter((i) => {
    const k = `${i.itemCode}-${i.kindCode}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  // 2차: 표시명이 같은 여러 단위(예: 계란 10구/30구, 오이 3계통)는 신호가 가장 좋은 단위를 대표로.
  //  싸거나 적정한 단위가 있으면 그걸 보여줘야 한다 (cheap<fair<expensive<없음, 동급이면 더 싼 쪽).
  // 품종을 접지 않고 모두 내보낸다. 예전엔 표시명이 같은 품종 중 신호가 가장 좋은 하나만
  // 남겼는데, 그 '대표'가 날마다 시세로 바뀜어 같은 URL이 어제는 캠벨얼리, 오늘은
  // 샤인머스켓을 가리켰다. 그 탓에 쿠팡 상품·사진이 품종과 어긋나는 문제가 생겼다(2026-08-18).
  // 품종별로 가격도 단위도 다른 이상 각각을 독립된 항목으로 다룬다.
  const kindCounts = new Map<string, number>();
  for (const i of unique) kindCounts.set(i.itemCode, (kindCounts.get(i.itemCode) ?? 0) + 1);
  return unique.map((i) => ({ ...i, itemName: kindLabel(i, kindCounts.get(i.itemCode) ?? 1) }));
}

/**
 * 품목 일별 시계열 (상세 차트, countyname=평균 행만).
 * 주의: period API의 p_productrankcode는 daily의 rank_code와 코드 체계가 다르다 —
 * 축산(500)은 1(상품)/2(중품), 농산은 04/05. daily 계란 rank_code '71'을 그대로 보내면
 * 에러 없이 빈 응답(무음 실패). 후보 코드를 순서대로 시도한다. (2026-06-13 디버깅)
 */
async function fetchPeriodRowsRange(
  item: Pick<PriceItem, 'categoryCode' | 'itemCode' | 'kindCode' | 'rankCode'>,
  start: Date,
  end: Date,
  cls: MarketCls,
): Promise<any[]> {
  const rankCandidates =
    item.categoryCode === '500' ? ['1', '2'] : [item.rankCode, '04', '05'];

  for (const rank of [...new Set(rankCandidates)]) {
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
    const res = await fetch(url);
    // 인프라 오류(워커 stale 미보유 등)는 중단 대신 다음 등급 후보로 — stale은 성공했던 등급 키에만 있다.
    if (!res.ok) continue;
    const json = await res.json();
    const rows: any[] = json?.data?.item ?? [];
    if (Array.isArray(rows) && rows.length > 0) return rows;
  }
  return [];
}

async function fetchPeriodRows(
  item: Pick<PriceItem, 'categoryCode' | 'itemCode' | 'kindCode' | 'rankCode'>,
  days: number,
  cls: MarketCls,
): Promise<any[]> {
  const end = new Date();
  if (days <= 120) {
    const start = new Date();
    start.setDate(end.getDate() - days);
    return fetchPeriodRowsRange(item, start, end, cls);
  }
  // KAMIS는 범위가 클수록 느려짐(1년≈16s) → 분기(약 91일)로 쪼개 병렬 fetch(≈7s). 청크는 아래에서 정렬·중복제거.
  const chunks = Math.ceil(days / 91);
  const per = Math.ceil(days / chunks);
  const ranges = Array.from({ length: chunks }, (_, i) => {
    const s = new Date();
    s.setDate(end.getDate() - Math.min(days, per * (i + 1)));
    const e = new Date();
    e.setDate(end.getDate() - per * i);
    return [s, e] as const;
  });
  const parts = await Promise.all(ranges.map(([s, e]) => fetchPeriodRowsRange(item, s, e, cls).catch(() => [])));
  return parts.flat();
}

function rowsToSeries(rows: any[]): SeriesPoint[] {
  return rows
    .filter((r) => r.countyname === '평균')
    .map((r) => ({ date: String(r.regday), year: r.yyyy != null ? String(r.yyyy) : undefined, price: parsePrice(r.price) }))
    .filter((p) => p.price != null) as SeriesPoint[];
}

export async function fetchSeries(
  item: Pick<PriceItem, 'categoryCode' | 'itemCode' | 'kindCode' | 'rankCode'>,
  days = 28,
  cls: MarketCls = '01',
): Promise<SeriesPoint[]> {
  const series = rowsToSeries(await fetchPeriodRows(item, days, cls));
  // 병렬 청크는 순서가 섞이므로 연월일로 정렬 + 경계 중복 제거(차트는 시간순 전제).
  series.sort((a, b) => `${a.year ?? ''}${a.date}`.localeCompare(`${b.year ?? ''}${b.date}`));
  return series.filter((p, i) => i === 0 || `${p.year ?? ''}${p.date}` !== `${series[i - 1].year ?? ''}${series[i - 1].date}`);
}

/** 작년 같은 시기 궤적(차트 점선) — 365일 전 ±2~3주 작은 창만 fetch. 365일 전체(≈27s) 대신 빠르게.
 *  일부 품종(예: 시설 감자)은 작년 이맘때 미조사라 빈다 → 같은 품목의 다른 품종으로 폴백(러프 참조). */
export async function fetchLastYearSeries(
  item: Pick<PriceItem, 'categoryCode' | 'itemCode' | 'kindCode' | 'rankCode'>,
  cls: MarketCls = '01',
): Promise<SeriesPoint[]> {
  const end = new Date();
  end.setDate(end.getDate() - 365 + 18);
  const start = new Date();
  start.setDate(start.getDate() - 365 - 3);
  const kinds = [...new Set([item.kindCode, '01', '00', '02', '03'])];
  for (const kindCode of kinds) {
    const s = rowsToSeries(await fetchPeriodRowsRange({ ...item, kindCode }, start, end, cls));
    if (s.length >= 4) return s;
  }
  return [];
}

export interface MarketPrice {
  market: string;
  price: number;
}

/** KAMIS 익명 판매처 코드 패턴 (A-대형마트, B`-유통 …) — 브랜드 실명은 비공개 */
const ANON_MARKET = /^[A-Z][`']?-(대형마트|백화점|SSM|생협|유통)$/;
// 'X-유통' = KAMIS의 대형유통업체(대형마트·기업형 체인슈퍼) 익명 코드 — 동네 슈퍼 아님(조사 대상 외)
const TYPE_LABEL: Record<string, string> = { SSM: '기업형 슈퍼', 유통: '대형마트·체인슈퍼' };

/**
 * 판매처별 최신 가격 — 업태 평균만, 전국 기준.
 *
 * 2026-08-20 이전엔 서울 매장만 썼고 개별 전통시장을 실명으로 보여줬다.
 * 오늘 가격을 전국 평균으로 바꾸면서 기준을 맞춘다 — 배추 기준 서울 판매처 평균은
 * 전국 오늘가와 4.3% 어긋났고 전국 판매처 평균은 0.5% 안에 들었다.
 * 개별 시장 실명은 뺀다: 전국으로 넓히면 순천·제주 시장까지 15~20줄이 되는데
 * 사용자가 갈 수 없는 곳이라 목록만 길어진다. 업태 평균은 표본이 늘어 더 견고해진다.
 *
 * 주의: 익명 코드('B-유통' 등)는 지역마다 재사용된다(B-유통 = 8개 지역).
 * 그래서 최신값 맵의 키에 반드시 지역명을 포함해야 한다 — 안 그러면 한 곳만 남는다.
 */
function groupMarkets(rows: any[]): MarketPrice[] {
  const latest = new Map<string, { regday: string; price: number; name: string }>();
  for (const r of rows) {
    // KAMIS는 빈 필드를 문자열이 아니라 빈 배열 []로 준다 — []는 truthy라 단순 검사를 통과해
    // 이름 없는 집계행이 '전통시장'으로 둔갑했다(축산은 판매처 조사 자체가 없다). 문자열로 확인한다.
    const name = typeof r.marketname === 'string' ? r.marketname.trim() : '';
    if (!name) continue;
    const county = String(r.countyname ?? '');
    // '평균'·'평년'·'전국'은 판매처가 아니라 KAMIS가 만든 집계 의사행 — 넣으면 이중 계산된다.
    if (!county || county === '평균' || county === '평년' || county === '전국') continue;
    const p = parsePrice(r.price);
    if (p == null) continue;
    const key = `${county}|${name}`;
    const prev = latest.get(key);
    if (!prev || String(r.regday) >= prev.regday) {
      latest.set(key, { regday: String(r.regday), price: p, name });
    }
  }
  const byType = new Map<string, number[]>();
  for (const v of latest.values()) {
    const m = v.name.match(ANON_MARKET);
    // 실명 판매처는 소매면 전통시장(경동·복조리·부전…), 도매면 도매시장(가락도매·엄궁도매…)이다.
    // 둘을 같은 '전통시장'으로 묶으면 도매 탭에 "전통시장 5곳 평균 36,200원"처럼
    // 사실과 다른 말이 된다(2026-08-20).
    const type = m ? (TYPE_LABEL[m[1]] ?? m[1]) : v.name.includes('도매') ? '도매시장' : '전통시장';
    byType.set(type, [...(byType.get(type) ?? []), v.price]);
  }
  const out: MarketPrice[] = [];
  for (const [type, prices] of byType) {
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length / 10) * 10;
    out.push({ market: prices.length > 1 ? `${type} ${prices.length}곳 평균` : type, price: avg });
  }
  return out.sort((a, b) => a.price - b.price);
}

/** 소매/도매 판매처별 최신 가격 (최근 7일) */
export async function fetchMarketPrices(
  item: Pick<PriceItem, 'categoryCode' | 'itemCode' | 'kindCode' | 'rankCode'>,
  cls: MarketCls = '01',
): Promise<MarketPrice[]> {
  return groupMarkets(await fetchPeriodRows(item, 7, cls));
}

/**
 * 친환경 — periodEcoPriceList(주간 발행). 평년·어제 같은 공식 기준값이 없어
 * 신호 판단 없이 ① 주간 평균 추이 ② 지난주 대비 ③ 판매처별 가격만 제공한다.
 * eco의 kind/rank 코드 체계는 일반 시세와 달라 후보를 순서대로 시도한다.
 */
export interface EcoData {
  series: SeriesPoint[];
  markets: MarketPrice[];
  latest: number | null;
  prevWeek: number | null;
  vsPrevWeekPct: number | null;
  unit: string | null;
}

/** regday("MM/DD")만 있고 yyyy가 없는 시계열(친환경)에 연도 추론 부여.
 *  최신=올해 기준, 뒤로 갈수록 월이 커지면(연말↔연초 wrap) 연도 감소. */
function assignYears(series: SeriesPoint[]): SeriesPoint[] {
  let yr = new Date().getFullYear();
  for (let i = series.length - 1; i >= 0; i--) {
    if (i < series.length - 1) {
      const m = parseInt(series[i].date.split('/')[0], 10);
      const nextM = parseInt(series[i + 1].date.split('/')[0], 10);
      if (m > nextM) yr -= 1;
    }
    series[i].year = String(yr);
  }
  return series;
}

export async function fetchEco(
  item: Pick<PriceItem, 'categoryCode' | 'itemCode' | 'kindCode'>,
  allowItemLevel = true,
): Promise<EcoData | null> {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 365); // 1년 (친환경 주간 발행 — 가벼움)
  // 자기 품종만 본다. 품목 단위('00')는 KAMIS가 그 품목을 품종으로 안 나누고 조사할 때만 쓴다(allowItemLevel)
  // — 파(대파·쪽파)나 풋고추(녹광·꽈리·청양·오이맛)처럼 품종이 여럿이면 '00'은 그중 한 품종이라
  // 쪽파 페이지에 대파 유기농 가격이 뜬다(2026-08-20 사용자 신고). '01','02','03'까지 훑으면 자기 유기농 데이터가
  // 없는 품종이 형제 품종 것을 가져다 쓴다 — 2026-08-20 확인: 거봉포도·샤인머스켓 유기농 탭이
  // 캠벨얼리 가격을, 쥬키니호박이 애호박을, 취청오이가 다다기오이를, 쌀 10kg이 20kg을 보여줬다.
  // '00'은 와일드카드가 아니라 실제 품종코드다(포도·방울토마토는 '00' 자체가 없음).
  // 당근·감귤·풋고추·파처럼 KAMIS가 품종을 안 나누고 조사하는 품목만 여기에 걸린다.
  const kinds = [...new Set(allowItemLevel ? [item.kindCode, '00'] : [item.kindCode])];
  const combos = kinds.flatMap((kind) => ['07', '08'].map((rank) => ({ kind, rank })));
  // 순차 대신 병렬 — 빈 조합이 많은 품목(사과 등)도 안 느리게.
  const results = await Promise.all(
    combos.map(async ({ kind, rank }) => {
      const url = `${BASE}?${qs({
        action: 'periodEcoPriceList',
        p_startday: fmtDate(start),
        p_endday: fmtDate(end),
        p_itemcategorycode: item.categoryCode,
        p_itemcode: item.itemCode,
        p_kindcode: kind,
        p_productrankcode: rank,
        p_convert_kg_yn: 'N',
      })}`;
      try {
        const res = await fetchT(url);
        if (!res.ok) return null;
        const rows: any[] = (await res.json())?.data?.item ?? [];
        if (!Array.isArray(rows) || rows.length === 0) return null;
        const series = assignYears(rowsToSeries(rows));
        // 2점 미만은 무효 — 차트를 못 그리는 1점짜리(오래된 stale 등)가 헤더 가격만 뜨는 불일치 방지.
        return series.length >= 2 ? { rows, series } : null;
      } catch {
        return null;
      }
    }),
  );
  const hit = results.find((r) => r != null); // combos 우선순위(품종 순)로 첫 유효
  if (!hit) return null;
  const { rows, series } = hit;
  const latest = series[series.length - 1]?.price ?? null;
  const prevWeek = series[series.length - 2]?.price ?? null;
  return {
    series,
    markets: groupMarkets(rows),
    latest,
    prevWeek,
    vsPrevWeekPct:
      latest != null && prevWeek != null ? Math.round(((latest - prevWeek) / prevWeek) * 100) : null,
    unit: rows.find((r) => r.unit)?.unit ?? null,
  };
}

/** 친환경 작년 같은 시기 +3개월 궤적(차트 점선) — 일반 28일 차트의 '작년 +2주'를 친환경(주간)에 맞춰 확장.
 *  주간 발행이라 좁은 창은 점이 듬성(±3주 ≈ 3점) → 3개월(≈13점)로 넓혀 궤적이 살게 한다. */
export async function fetchEcoLastYear(
  item: Pick<PriceItem, 'categoryCode' | 'itemCode' | 'kindCode'>,
  allowItemLevel = true,
): Promise<SeriesPoint[]> {
  const start = new Date();
  start.setDate(start.getDate() - 365);
  const end = new Date();
  end.setDate(end.getDate() - 365 + 90);
  // 자기 품종만 본다. 품목 단위('00')는 KAMIS가 그 품목을 품종으로 안 나누고 조사할 때만 쓴다(allowItemLevel)
  // — 파(대파·쪽파)나 풋고추(녹광·꽈리·청양·오이맛)처럼 품종이 여럿이면 '00'은 그중 한 품종이라
  // 쪽파 페이지에 대파 유기농 가격이 뜬다(2026-08-20 사용자 신고). '01','02','03'까지 훑으면 자기 유기농 데이터가
  // 없는 품종이 형제 품종 것을 가져다 쓴다 — 2026-08-20 확인: 거봉포도·샤인머스켓 유기농 탭이
  // 캠벨얼리 가격을, 쥬키니호박이 애호박을, 취청오이가 다다기오이를, 쌀 10kg이 20kg을 보여줬다.
  // '00'은 와일드카드가 아니라 실제 품종코드다(포도·방울토마토는 '00' 자체가 없음).
  // 당근·감귤·풋고추·파처럼 KAMIS가 품종을 안 나누고 조사하는 품목만 여기에 걸린다.
  const kinds = [...new Set(allowItemLevel ? [item.kindCode, '00'] : [item.kindCode])];
  for (const kind of kinds) {
    for (const rank of ['07', '08']) {
      const url = `${BASE}?${qs({
        action: 'periodEcoPriceList',
        p_startday: fmtDate(start),
        p_endday: fmtDate(end),
        p_itemcategorycode: item.categoryCode,
        p_itemcode: item.itemCode,
        p_kindcode: kind,
        p_productrankcode: rank,
        p_convert_kg_yn: 'N',
      })}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const json = await res.json();
      const series = rowsToSeries(json?.data?.item ?? []);
      if (series.length >= 2) return series;
    }
  }
  return [];
}

/** 친환경 '이맘때 평균' — 평년 자료가 없는 친환경용 대체 기준선.
 *  최근 2년의 같은 시기(±3주) 친환경 평균가를 모아 평균낸다. 표본 4점 미만이면 null(기준선 숨김).
 *  ⚠️ KAMIS 평년(5년·이상치 제외 공식통계)과 다른 2년 단순평균 — '평년'이 아니라 '이맘때 평균'으로만 표기. */
export async function fetchEcoSeasonalBaseline(
  item: Pick<PriceItem, 'categoryCode' | 'itemCode' | 'kindCode'>,
  allowItemLevel = true,
): Promise<{ avg: number; count: number } | null> {
  // 자기 품종만 본다. 품목 단위('00')는 KAMIS가 그 품목을 품종으로 안 나누고 조사할 때만 쓴다(allowItemLevel)
  // — 파(대파·쪽파)나 풋고추(녹광·꽈리·청양·오이맛)처럼 품종이 여럿이면 '00'은 그중 한 품종이라
  // 쪽파 페이지에 대파 유기농 가격이 뜬다(2026-08-20 사용자 신고). '01','02','03'까지 훑으면 자기 유기농 데이터가
  // 없는 품종이 형제 품종 것을 가져다 쓴다 — 2026-08-20 확인: 거봉포도·샤인머스켓 유기농 탭이
  // 캠벨얼리 가격을, 쥬키니호박이 애호박을, 취청오이가 다다기오이를, 쌀 10kg이 20kg을 보여줬다.
  // '00'은 와일드카드가 아니라 실제 품종코드다(포도·방울토마토는 '00' 자체가 없음).
  // 당근·감귤·풋고추·파처럼 KAMIS가 품종을 안 나누고 조사하는 품목만 여기에 걸린다.
  const kinds = [...new Set(allowItemLevel ? [item.kindCode, '00'] : [item.kindCode])];
  // 창(작년·재작년) × 품종 × 랭크를 전부 병렬 — 순차면 사과처럼 표본 없는 품목이 ~30s.
  const windows = await Promise.all(
    [365, 730].map(async (back) => {
      const start = new Date();
      start.setDate(start.getDate() - back - 21);
      const end = new Date();
      end.setDate(end.getDate() - back + 21);
      const combos = kinds.flatMap((kind) => ['07', '08'].map((rank) => ({ kind, rank })));
      const res = await Promise.all(
        combos.map(async ({ kind, rank }) => {
          const url = `${BASE}?${qs({
            action: 'periodEcoPriceList',
            p_startday: fmtDate(start),
            p_endday: fmtDate(end),
            p_itemcategorycode: item.categoryCode,
            p_itemcode: item.itemCode,
            p_kindcode: kind,
            p_productrankcode: rank,
            p_convert_kg_yn: 'N',
          })}`;
          try {
            const r = await fetchT(url);
            if (!r.ok) return { kind, prices: [] as number[] };
            const series = rowsToSeries((await r.json())?.data?.item ?? []);
            return { kind, prices: series.map((p) => p.price) };
          } catch {
            return { kind, prices: [] as number[] };
          }
        }),
      );
      // 이 창은 우선순위 첫 유효 품종의 가격만
      for (const kind of kinds) {
        const p = res.filter((x) => x.kind === kind).flatMap((x) => x.prices);
        if (p.length) return p;
      }
      return [] as number[];
    }),
  );
  const prices = windows.flat();
  if (prices.length < 4) return null;
  return { avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length), count: prices.length };
}

export function won(n: number | null): string {
  if (n == null) return '—';
  return n.toLocaleString('ko-KR');
}
