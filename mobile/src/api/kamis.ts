/**
 * KAMIS 농수산물 가격정보 Open API 어댑터.
 * - dailyPriceByCategoryList: 카테고리별 당일/평년(dpr7) 시세 → 신호 계산의 원천
 * - periodProductList: 일별 시계열 → 상세 차트
 * 응답 포맷은 .api-samples/*.json 실응답 기준.
 */
import type { SignalLevel } from '../theme/tokens';

// KAMIS는 worker 프록시 경유 — cert_key/cert_id는 서버에서 주입되어 클라이언트에 노출되지 않는다.
const BASE = process.env.EXPO_PUBLIC_KAMIS_URL ?? 'https://igeobissa-recipes.designerxyzi.workers.dev/kamis';

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
  price: number;
}

function parsePrice(v: unknown): number | null {
  if (typeof v !== 'string' || v === '-' || v === '' || v === '0') return null;
  const n = Number(v.replace(/,/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** KAMIS 축산 품목명은 가축명(소·돼지·닭)으로 와서 식품명으로 보정한다 */
const NAME_FIX: Record<string, string> = { 소: '소고기', 돼지: '돼지고기', 닭: '닭고기' };
/** 고기류 — 부위(kindName)가 핵심이므로 이름에 붙인다. 계란·우유는 제외. */
const MEAT_CODES = new Set(['4301', '4304', '4401', '4402', '9901']);
function displayName(name: string, code: string, kindName: string): string {
  const fixed = NAME_FIX[name] ?? name;
  return MEAT_CODES.has(code) && kindName ? `${fixed} ${kindName}` : fixed;
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
    p_country_code: '1101', // 서울
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
  const rank = (lv: SignalLevel | null) => (lv === 'cheap' ? 0 : lv === 'fair' ? 1 : lv === 'expensive' ? 2 : 3);
  const best = new Map<string, PriceItem>();
  for (const it of unique) {
    const prev = best.get(it.itemName);
    if (
      !prev ||
      rank(it.level) < rank(prev.level) ||
      (rank(it.level) === rank(prev.level) && (it.vsNormalPct ?? 999) < (prev.vsNormalPct ?? 999))
    ) {
      best.set(it.itemName, it);
    }
  }
  return [...best.values()];
}

/**
 * 품목 일별 시계열 (상세 차트, countyname=평균 행만).
 * 주의: period API의 p_productrankcode는 daily의 rank_code와 코드 체계가 다르다 —
 * 축산(500)은 1(상품)/2(중품), 농산은 04/05. daily 계란 rank_code '71'을 그대로 보내면
 * 에러 없이 빈 응답(무음 실패). 후보 코드를 순서대로 시도한다. (2026-06-13 디버깅)
 */
async function fetchPeriodRows(
  item: Pick<PriceItem, 'categoryCode' | 'itemCode' | 'kindCode' | 'rankCode'>,
  days: number,
  cls: MarketCls,
): Promise<any[]> {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
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
    if (!res.ok) throw new Error(`KAMIS HTTP ${res.status}`);
    const json = await res.json();
    const rows: any[] = json?.data?.item ?? [];
    if (Array.isArray(rows) && rows.length > 0) return rows;
  }
  return [];
}

function rowsToSeries(rows: any[]): SeriesPoint[] {
  return rows
    .filter((r) => r.countyname === '평균')
    .map((r) => ({ date: String(r.regday), price: parsePrice(r.price) }))
    .filter((p): p is SeriesPoint => p.price != null);
}

export async function fetchSeries(
  item: Pick<PriceItem, 'categoryCode' | 'itemCode' | 'kindCode' | 'rankCode'>,
  days = 28,
  cls: MarketCls = '01',
): Promise<SeriesPoint[]> {
  return rowsToSeries(await fetchPeriodRows(item, days, cls));
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
 * 판매처별 최신 가격 — 갈 수 있는 곳만 실명으로.
 * 전통시장(실명)은 개별 행("경동시장"), 익명 코드는 묶어봐야 정보 손실이 없으므로
 * 업태 평균 한 줄("유통점 8곳 평균")로 합친다. 싼 순 정렬.
 */
function groupMarkets(rows: any[]): MarketPrice[] {
  const latest = new Map<string, { regday: string; price: number }>();
  for (const r of rows) {
    if (!r.marketname) continue;
    // p_countycode를 줘도 전국 시장 행이 섞여 온다 — 서울 행만 사용 (2026-06-13 확인)
    if (r.countyname !== '서울') continue;
    const p = parsePrice(r.price);
    if (p == null) continue;
    const prev = latest.get(r.marketname);
    if (!prev || String(r.regday) >= prev.regday) {
      latest.set(String(r.marketname), { regday: String(r.regday), price: p });
    }
  }
  const out: MarketPrice[] = [];
  const anonByType = new Map<string, number[]>();
  for (const [name, v] of latest) {
    const m = name.match(ANON_MARKET);
    if (m) {
      const type = TYPE_LABEL[m[1]] ?? m[1];
      anonByType.set(type, [...(anonByType.get(type) ?? []), v.price]);
    } else {
      out.push({ market: name.endsWith('시장') ? name : `${name}시장`, price: v.price });
    }
  }
  for (const [type, prices] of anonByType) {
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

export async function fetchEco(
  item: Pick<PriceItem, 'categoryCode' | 'itemCode' | 'kindCode'>,
): Promise<EcoData | null> {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 180);
  const kinds = [...new Set([item.kindCode, '00', '01', '02', '03'])];
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
      const rows: any[] = json?.data?.item ?? [];
      if (!Array.isArray(rows) || rows.length === 0) continue;
      const series = rowsToSeries(rows);
      if (series.length === 0) continue;
      const latest = series[series.length - 1]?.price ?? null;
      const prevWeek = series[series.length - 2]?.price ?? null;
      return {
        series,
        markets: groupMarkets(rows),
        latest,
        prevWeek,
        vsPrevWeekPct:
          latest != null && prevWeek != null
            ? Math.round(((latest - prevWeek) / prevWeek) * 100)
            : null,
        unit: rows.find((r) => r.unit)?.unit ?? null,
      };
    }
  }
  return null;
}

export function won(n: number | null): string {
  if (n == null) return '—';
  return n.toLocaleString('ko-KR');
}
