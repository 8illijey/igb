import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Linking, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  EcoData,
  fetchCategory,
  fetchEco,
  fetchEcoSeasonalBaseline,
  fetchMarketPrices,
  fetchSeries,
  judge,
  labelOf,
  MarketPrice,
  PriceItem,
  SeriesPoint,
  won,
} from '../../api/kamis';
import { coupangProducts, ROCKET_LOGO, ROCKET_LOGO_W, trackShoppingClick } from '../../api/shopping';
import { useVerdicts } from '../../api/verdicts';
import { EmptyState } from '../../components/igb/EmptyState';
import { GlassHeader } from '../../components/igb/GlassHeader';
import { Tabs } from '../../components/igb/Tabs';
import { SignalChip } from '../../components/igb/SignalChip';
import { Sparkline } from '../../components/igb/Sparkline';
import { useFavorites } from '../../store/favorites';
import { bumpPopularity } from '../../store/popularity';
import { itemKey, usePrices } from '../../store/prices';
import { thumbFor } from '../../thumbnails';
import { subjectParticle, topicParticle, withParticle } from '../../utils/korean';
import { colors, palette, radius, signal, SignalLevel, spacing, type } from '../../theme/tokens';
import { FavoriteHeart } from '../../components/igb/FavoriteHeart';

type Market = 'retail' | 'eco' | 'wholesale';

const MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
// kindName "봄(20kg)" → "봄무" (단위 괄호 떼고 품목명 붙임). build-verdicts.mjs와 동일 규칙.
const varietyName = (kindName: string, itemName: string) => {
  const v = kindName.replace(/\([^)]*\)\s*$/, '').trim();
  // 변종명이 이미 품목명을 포함/끝나면(대파·쪽파→파) 그대로. 아니면(봄→무) 붙인다.
  return !v || v === itemName ? itemName : v.endsWith(itemName) ? v : `${v}${itemName}`;
};
const SKEL_BAR_H = [20, 28, 36, 24, 18, 40, 30, 44, 38, 26, 22, 16]; // 작년 흐름 스켈레톤 막대 실루엣

// 영구 캐시 — 같은 날이면 새로고침해도 즉시(메모리 + AsyncStorage). 시계열·판매처 등 일 단위 데이터 공용.
const dataMem = new Map<string, unknown>();
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
// 표시 중인 차트의 실제 최근 조사일(YYYY-MM-DD). 푸터 '기준일'은 오늘이 아니라 이 값이어야 한다
// — KAMIS는 매일 오후 4시 갱신·주말 미조사·미러 1~2일 지연이라 오늘과 조사일이 다르다(2026-08-13).
function latestSurveyDate(s: SeriesPoint[] | null | undefined): string | null {
  if (!s || s.length === 0) return null;
  const last = s[s.length - 1];
  const [mm, dd] = String(last.date).split('/');
  if (!mm || !dd) return null;
  return `${last.year ?? new Date().getFullYear()}-${mm}-${dd}`;
}
async function cached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  if (dataMem.has(key)) return dataMem.get(key) as T;
  try {
    const raw = await AsyncStorage.getItem('igb.cache.' + key);
    if (raw) {
      const o = JSON.parse(raw);
      if (o && o.d === todayStr() && o.s !== undefined) {
        dataMem.set(key, o.s);
        return o.s as T;
      }
    }
  } catch {}
  const s = await fetcher();
  // 빈 결과는 캐시 안 함 — KAMIS 장애 중의 빈 응답이 하루 종일 굳어 복구 후에도 차트가 비는 사고 방지(2026-07-15).
  if (Array.isArray(s) && s.length === 0) return s;
  dataMem.set(key, s);
  AsyncStorage.setItem('igb.cache.' + key, JSON.stringify({ d: todayStr(), s })).catch(() => {});
  return s;
}

// 단위에 무게가 없는 품목의 1단위 평균중량(g) — 100g당 환산용 추정치(대략값).
const AVG_GRAMS: Record<string, number> = {
  '211': 2500, // 배추 1포기
  '212': 1000, // 양배추 1포기
  '221': 7000, // 수박 1개
  '224': 250, // 호박(애호박) 1개
  '231': 1000, // 무 1개
  '257': 1500, // 멜론 1개
  '279': 600, // 알배기배추 1포기
  '280': 300, // 브로콜리 1개
  '420': 1500, // 파인애플 1개
  '428': 300, // 망고 1개
  '430': 200, // 아보카도 1개
};

/** "1개 약 X원 · 100g당 Y원" 캡션. 단위에서 무게/개수를 파싱하고,
 *  무게 정보가 없으면 품목 평균중량(AVG_GRAMS)으로 추정해 "(1포기 약 1kg)"처럼 가정을 명시한다. */
function perUnitCaption(itemCode: string, today: number | null, unit: string): string | null {
  if (today == null || !unit) return null;
  const parts: string[] = [];
  const cnt = unit.match(/(\d+)\s*(개|구|알|마리)/);
  const count = cnt ? parseInt(cnt[1], 10) : null;
  if (count && count > 1) parts.push(`1개 약 ${won(Math.round(today / count))}원`);
  const kg = unit.match(/([\d.]+)\s*kg/i);
  const g = unit.match(/([\d.]+)\s*g(?![a-z])/i);
  let grams = kg ? parseFloat(kg[1]) * 1000 : g ? parseFloat(g[1]) : null;
  let estimated = false;
  if (grams == null && AVG_GRAMS[itemCode] != null) {
    grams = AVG_GRAMS[itemCode];
    estimated = true;
  }
  if (grams) {
    const per = `100g당 ${won(Math.round(today / (grams / 100)))}원`;
    const wLabel = grams >= 1000 ? `${grams / 1000}kg` : `${grams}g`;
    const uLabel = unit.replace(/^\d+\s*/, '');
    parts.push(estimated ? `${per} (1${uLabel} 약 ${wLabel})` : per);
  } else {
    const ml = unit.match(/([\d.]+)\s*ml\b/i);
    const l = unit.match(/([\d.]+)\s*l\b/i);
    const mL = ml ? parseFloat(ml[1]) : l ? parseFloat(l[1]) * 1000 : null;
    if (mL) parts.push(`100mL당 ${won(Math.round(today / (mL / 100)))}원`);
  }
  return parts.length ? parts.join(' · ') : null;
}

// ---- 1년 시계열에서 파생: 월별 평균(연간 흐름) ----
function monthlyAverages(series: SeriesPoint[]): (number | null)[] {
  const sums = Array(12).fill(0);
  const cnts = Array(12).fill(0);
  for (const p of series) {
    const m = parseInt(String(p.date).split('/')[0], 10) - 1;
    if (m >= 0 && m < 12) {
      sums[m] += p.price;
      cnts[m] += 1;
    }
  }
  return sums.map((s, i) => (cnts[i] ? s / cnts[i] : null));
}

export default function ItemDetailScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const { find, items, resolve } = usePrices();
  const { keys, isFavorite, toggle } = useFavorites();
  const item = find(key) ?? resolve(key);
  const [topH, setTopH] = useState(0);
  const insets = useSafeAreaInsets(); // content-02(회색)가 하단 safe-area까지 덮도록

  // 인기 품목 신호 — 이 상세를 열 때마다 itemCode 조회수 +1 (검색 화면 '인기 품목 TOP')
  useEffect(() => {
    if (item) bumpPopularity(item.itemCode);
  }, [item?.itemCode]);

  // 즐겨찾기 키 정합 — 대표 단위가 매일 바뀌어도 이 품목을 가리키는 '저장된 키'가 있으면 그걸 토글한다.
  const favKey = useMemo(() => {
    const cur = item ? itemKey(item) : key;
    if (keys.includes(cur)) return cur;
    const stored = keys.find((k) => {
      const r = resolve(k);
      return r != null && itemKey(r) === cur;
    });
    return stored ?? cur;
  }, [item, keys, resolve, key]);

  // 오늘 평년 대비 할인율 1위 품목인지 — 홈 hero와 동일 기준(min vsNormalPct)
  const isTopDiscount = useMemo(() => {
    const cand = items.filter((i) => i.level && i.today != null && i.vsNormalPct != null);
    if (!cand.length) return false;
    const top = cand.reduce((best, i) => (i.vsNormalPct! < best.vsNormalPct! ? i : best));
    return itemKey(top) === key;
  }, [items, key]);

  const [market, setMarket] = useState<Market>('retail');
  const [chart28, setChart28] = useState<SeriesPoint[] | null>(null); // 28일 — 차트 표시용. 가벼워 빠름(~3s)
  const [yearSeries, setYearSeries] = useState<SeriesPoint[] | null>(null); // 365일 — 최근1년 평균·연간 흐름 폴백. verdicts 없을 때만(무거움 ≈27s).
  const [markets, setMarkets] = useState<MarketPrice[] | null>(null);
  const [wsItem, setWsItem] = useState<PriceItem | null | undefined>(undefined);
  const [eco, setEco] = useState<EcoData | null | undefined>(undefined);
  const [ecoBaseline, setEcoBaseline] = useState<{ avg: number; count: number } | null | undefined>(undefined); // 친환경 '이맘때 평균'(최근 2년). undefined=로딩, null=데이터없음

  // 품목이 바뀌면 도매·유기농 상태 초기화 — 안 하면 이전 품목의 옛 화면이 남아 잠깐 뜬다(#5).
  useEffect(() => {
    setWsItem(undefined);
    setEco(undefined);
    setEcoBaseline(undefined);
  }, [key]);

  // 축산(500)은 KAMIS가 도매를 아예 조사하지 않는데, 빈 응답이나 에러 대신 '소매 응답을 그대로' 돌려준다.
  // 2026-08-20 확인: 축산 17행 전부 cls=01과 가격·단위가 완전히 동일했다
  //   (삼겹살 2,867원/100g, 계란 특란30구 7,275원/30구, 우유 2,928원/1L …).
  // 단위까지 소매 단위(100g·30구·1L)라 그대로 두면 '도매' 라벨을 단 소매가가 표시된다 —
  // wsItem이 null이 아니라 값이 있으니 EmptyState도 안 걸리고, signalHidden 때문에
  // '이맘때 평균'과 싸요/비싸요 배지만 조용히 사라져 사용자 눈엔 정상 화면으로 보인다.
  // → 같은 날짜·같은 파라미터로 소매(cls=01)도 같이 받아 '가격 AND 단위'가 둘 다 같으면 도매 없음 처리.
  //   단위만 같은 정상 도매(쌀 20kg·수박 1개·대파/쪽파 1kg·거봉/샤인머스캣 2kg)를 죽이지 않으려면
  //   반드시 둘을 함께 봐야 한다 — 3일치(8/12·8/18·8/19) 검증에서 축산 17/17 정탐, 오탐 0.
  useEffect(() => {
    if (market !== 'wholesale' || wsItem !== undefined || !item) return;
    Promise.all([
      fetchCategory(item.categoryCode, undefined, '02'),
      fetchCategory(item.categoryCode, undefined, '01'),
    ])
      .then(([wholesale, retail]) => {
        const matches = wholesale.filter((x) => x.itemCode === item.itemCode && x.today != null);
        const picked = matches.find((x) => x.kindCode === item.kindCode) ?? matches[0] ?? null;
        if (!picked) return setWsItem(null);
        const twin = retail.find((x) => x.itemCode === picked.itemCode && x.kindCode === picked.kindCode);
        const mirrorsRetail = twin != null && twin.today === picked.today && twin.unit === picked.unit;
        setWsItem(mirrorsRetail ? null : picked);
      })
      .catch(() => setWsItem(null));
  }, [market, wsItem, item]);

  useEffect(() => {
    if (market !== 'eco' || eco !== undefined || !item) return;
    fetchEco(item)
      .then(setEco)
      .catch(() => setEco(null));
    fetchEcoSeasonalBaseline(item)
      .then(setEcoBaseline)
      .catch(() => setEcoBaseline(null));
  }, [market, eco, item]);

  const active = market === 'wholesale' ? wsItem : market === 'retail' ? item : null;
  const cls = market === 'wholesale' ? '02' : '01';

  // 가벼운 호출만 여기서: 마켓·28일 차트. 둘 다 ~3s, 병렬.
  // 무거운 365일(≈27s)은 verdicts가 최근1년평균을 못 줄 때만 아래 별도 effect에서.
  useEffect(() => {
    if (market === 'eco' || !active) return;
    const ck = `${itemKey(active)}-${cls}`;
    // 같은 날 캐시(메모리+localStorage) — 새로고침/재방문 즉시. 오늘 가격은 item에서 오므로 차트도 캐시 무해.
    setMarkets(null);
    setChart28(null);
    setYearSeries(null);
    cached(`mk-${ck}`, () => fetchMarketPrices(active, cls))
      .then(setMarkets)
      .catch(() => setMarkets([]));
    cached(`c28-${ck}`, () => fetchSeries(active, 28, cls))
      .then(setChart28)
      .catch(() => setChart28([]));
  }, [key, market, active?.itemCode, active?.kindCode]);

  // 평년 대비 신호 (±1% judge) — 차트 한 줄 결론·진입 가드용
  const view = useMemo(() => {
    if (!active) return null;
    const level: SignalLevel = judge(active.today, active.normal) ?? 'fair';
    return { level };
  }, [active]);

  // 마지막 점을 헤드라인 오늘가로 앵커(출처 차이 보정)
  const anchor = (s: SeriesPoint[] | null, today?: number | null) => {
    if (!s || s.length === 0) return s;
    if (today == null) return s;
    const out = [...s];
    out[out.length - 1] = { ...out[out.length - 1], price: today };
    return out;
  };

  // 28일 — 빠른 초기 차트 (가벼운 28일 호출, 오늘가 앵커).
  const chartSeries = useMemo(() => {
    if (!chart28) return null;
    return anchor(chart28.slice(-28), active?.today);
  }, [chart28, active?.today]);

  // 최근 시세 차트 = 1년 일별. 로딩 중엔 스켈레톤(28일 중간단계 없이), 1년 실패/부족 시에만 28일 폴백.
  const chartDisplay = useMemo(() => {
    const ys = anchor(yearSeries, active?.today);
    if (ys && ys.length >= 30) return ys; // 1년 도착
    if (yearSeries == null) return null; // 아직 로딩 → 스켈레톤
    return chartSeries; // 1년 실패/부족 → 28일 폴백
  }, [yearSeries, chartSeries, active?.today]);

  // 365일 — 최근 1년 평균(추천 기준) + 월별 평균(연간 흐름). verdicts 없을 때만 채워짐.
  const yearDerived = useMemo(() => {
    const ys = anchor(yearSeries, active?.today);
    if (!ys || ys.length < 30 || active?.today == null) return null;
    const prices = ys.map((p) => p.price);
    const recentAvg = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null;
    return { months: monthlyAverages(ys), recentAvg };
  }, [yearSeries, active?.today]);

  // 최근 1년 평균 — 사전계산(서버) 우선, 없으면 365일 기기 계산. 사전계산이 있으면 추천이 즉시 확정.
  const verdicts = useVerdicts();
  // 대표 품종(kind)은 홈과 verdicts가 서로 다른 시점에 뽑아 어긋날 수 있다(예: 봄배추 211-01 vs 고랭지 211-02).
  // 같은 품목 verdict가 유일하면 그걸 쓴다. 고기는 부위(kind)마다 가격이 달라 정확 일치만(prices.resolve와 동일 원칙).
  // 형제 품종의 verdict를 빌리지 않는다. 예전엔 '대표 품종'이 홈과 verdicts 사이에
  // 어긋날 수 있어 같은 품목 verdict가 하나뿐이면 그걸 가져다 썼는데, 홈이 품종을 전부
  // 노출하게 바뀌면서 사전계산이 없는 품종이 형제의 것을 통째로 썼다 — 후지사과 상세가
  // 아오리사과의 이름·최근1년평균·연간흐름을 그대로 보여줬다(2026-08-20 사용자 신고).
  // build-verdicts가 모든 품종을 계산하므로 이젠 빌릴 이유가 없고,
  // 혹시 빠졌다면 라이브 365일로 떨어지는 쪽(느리지만 정확)이 옳다.
  const vKey = key;
  const precomputedRecentAvg =
    market === 'wholesale'
      ? verdicts[vKey]?.wholesaleRecentAvg ?? null
      : market === 'retail'
        ? verdicts[vKey]?.recentAvg ?? null
        : null;
  const recentAvg = precomputedRecentAvg ?? yearDerived?.recentAvg ?? null;

  // 365일 일별 — 최근 시세 차트가 항상 필요(1년 표시). 같은 날 캐시로 재방문은 즉시.
  // (추천 판정은 precomputed recentAvg로 이미 즉시 확정 — 이 무거운 호출을 기다리지 않는다.)
  useEffect(() => {
    if (market === 'eco' || !active) return;
    cached(`y2-${itemKey(active)}-${cls}`, () => fetchSeries(active, 365, cls))
      .then(setYearSeries)
      .catch(() => setYearSeries([]));
  }, [key, market, active?.itemCode, active?.kindCode]);
  // 연간 흐름 — 사전계산(다품종 병합) 우선, 없으면 365일 단일 품종에서 파생
  // 도매는 도매 데이터(품종 병합)만. 사전계산 없으면 라이브(yearDerived)로 폴백 — 소매가는 안 빌림.
  const annualMonths =
    (market === 'retail' ? verdicts[vKey]?.months : market === 'wholesale' ? verdicts[vKey]?.wholesaleMonths : null) ??
    yearDerived?.months ??
    null;
  // 철별 분할 품목인지 — 시장 무관 품목 속성(소매 사전계산). hero 품종명 표시 기준 + 흐름 캡션용.
  const isSplitItem = verdicts[vKey]?.spanVarieties ?? false;
  const annualSpanVarieties = market === 'eco' ? false : isSplitItem;
  // hero 품종명 — 도매는 '도매 데이터 자체'(보고 있는 wsItem의 kind="봄(20kg)"→봄무), 소매는 대표 품종.
  // 연간흐름 캐션 전용 — hero 제목엔 더 이상 쓰지 않는다(아래 heroName 참고).
  const heroVariety =
    market === 'wholesale' ? (active ? varietyName(active.kindName, active.itemName) : null) : verdicts[vKey]?.variety ?? null;
  // 표시명은 항상 홈 목록과 같아야 한다(2026-08-20 사용자 신고 — 홈 '거봉포도'가
  // 도매에선 '포도', 홈 '무'가 상세에선 '고랭지무'로 보였다).
  //  · 소매·유기농: 홈 이름 그대로. 제철 품종명은 연간흐름 캐션이 이미 알려준다.
  //  · 도매: 같은 품종이 조사되면 홈 이름 그대로(61개 중 57개).
  //    다른 품종으로 폴백했을 때만(쌀 10kg→20kg, 가시오이→다다기오이 등 4건)
  //    그 품종 이름을 홈과 같은 규칙(labelOf)으로 만들어 보여준다 — 홈 이름을 그대로 쓰면
  //    다른 품종 가격을 이 품종 가격처럼 읽게 된다.
  const heroName = useMemo(() => {
    const home = item?.itemName ?? '';
    if (market !== 'wholesale' || !active) return home;
    return active.kindCode === item?.kindCode ? home : labelOf(active);
  }, [market, active, item]);
  // 연간흐름 '철마다 품종 달라요' 캡션 — 소매는 사전계산(품종별 가격), 도매는 현재 품종명만(가격 캡션은 소매가라 제외).
  const annualThisMonthVarieties =
    market === 'retail'
      ? verdicts[vKey]?.thisMonthVarieties ?? null
      : market === 'wholesale' && isSplitItem && heroVariety
        ? [{ name: heroVariety, price: 0 }]
        : null;

  // 추천 = 평년 단일 기준(홈 카드와 동일 — 둘이 어긋나지 않게). 최근 1년 평균은 rec-card 보조 설명으로만.
  // 평년만 필요하므로 recentAvg(365·verdicts) 안 기다리고 즉시 확정 — 칩·헤드라인 바로 뜸.
  // 도매 '이맘때 평균' — KAMIS 도매 응답의 dpr7(평년)은 쓸 수 없다.
  // 2026-08-17 확인: 도매 32개 품목 전부 dpr7이 소매 dpr7과 숫자가 완전히 동일했다.
  // 단위는 다른데(감자 소매 100g / 도매 20kg) 값은 같아서, 그대로 쓰면 감자가 기준 대비 117배로
  // 잎혀 도매 품목의 절반이 항상 '비싼 편이에요'로 뜼던다 — 실제로는 평균보다 쌀 때도.
  // → 사전계산된 도매 시계열의 '이번 달 평균'(wholesaleMonths)을 기준으로 쓴다.
  //   연간 흐름 막대가 이미 이 값을 쓰고 있어, 한 화면에서 막대와 숫자가 같은 축을 보게 된다.
  // 연평균(wholesaleRecentAvg) 폴백은 일부러 안 쓴다 — 제철 과일 비수기에만 발동하는데
  // 그때 연평균은 성수기 가격이라(복숭아는 7~9월만 조사) '이맘때'가 아니게 된다.
  // 고치려던 것과 같은 종류의 오류라, 기준이 없으면 신호를 안 내는 쪽을 택한다.
  const wholesaleBaseline =
    market === 'wholesale' ? verdicts[vKey]?.wholesaleMonths?.[new Date().getMonth()] ?? null : null;
  /** 차트 기준선·라벨의 '이맘때 평균'. 소매는 KAMIS 평년, 도매는 위 사전계산값. */
  const baseline = market === 'wholesale' ? wholesaleBaseline : active?.normal ?? null;
  // 도매는 기준값이 없으면 buy=null → 칩을 아예 안 띄운다(signalHidden).
  const buy =
    active?.today == null
      ? null
      : market === 'wholesale'
        ? wholesaleBaseline != null
          ? evalBuy(active.today, wholesaleBaseline)
          : null
        : evalBuy(active.today, active.normal);
  const displayLevel: SignalLevel = buy ? buy.level : 'fair';
  const recReady = buy != null;
  // 도매인데 기준값이 없는 경우 — 로딩이 아니라 '판단을 안 함'이니 스켈레톤 대신 아무것도 안 보인다.
  // (도매 사전계산이 없는 축산·유제품 6개: 소·돼지·수입소·수입돼지·계란·우유)
  const signalHidden = market === 'wholesale' && !recReady && active?.today != null;
  // chartReady = 1년 차트 준비 완료(로딩 중이면 스켈레톤). 1년 실패 시 28일 폴백도 chartDisplay가 처리.
  const chartReady = chartDisplay != null;
  // 푸터 '기준일' = 지금 보는 차트의 실제 최근 조사일 (오늘 날짜 아님).
  const surveyDate = useMemo(
    () => latestSurveyDate(market === 'eco' ? eco?.series : chartDisplay),
    [market, eco, chartDisplay],
  );
  // 유기농·무농약 '이맘때 평균'(최근 2년) 대비 신호 — 일반의 평년 대비와 같은 방식(이맘때 평균이 기준).
  const ecoSeasonalPct =
    eco && ecoBaseline && eco.latest != null
      ? Math.round(((eco.latest - ecoBaseline.avg) / ecoBaseline.avg) * 100)
      : null;
  const ecoLevel: SignalLevel =
    ecoSeasonalPct == null ? 'fair' : ecoSeasonalPct < 0 ? 'cheap' : ecoSeasonalPct > 0 ? 'expensive' : 'fair';
  if (!item) {
    return (
      <View style={styles.screen}>
        <GlassHeader>
          <Header title="" fav={false} onFav={() => {}} />
        </GlassHeader>
        <EmptyState title="품목 정보를 찾지 못했어요" description="목록에서 다시 진입해 보세요" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <GlassHeader onHeight={setTopH}>
        <Header title={item.itemName} fav={isFavorite(favKey)} onFav={() => toggle(favKey)} />
      </GlassHeader>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: topH }]}>
        {/* 소매/도매 — 헤더 바로 아래 풀폭 밑줄 탭(content 밖). 헤어라인 full-bleed + 탭 16 인셋 */}
        <View style={styles.marketTabs}>
          {/* 풀블리드 하단 디바이더 — Figma처럼 밑줄 바 '뒤'에 깔린다(활성 바가 자기 칸에서 디바이더를 덮음). */}
          <View style={styles.marketTabsLine} pointerEvents="none" />
          <Tabs
            variant="underline"
            value={market === 'wholesale' ? 'wholesale' : 'retail'}
            onChange={(v) => setMarket(v as Market)}
            options={[
              { value: 'retail', label: '소매' },
              { value: 'wholesale', label: '도매' },
            ]}
          />
        </View>
        {/* content-01: 흰 배경 — (소매면) 일반/유기농 토글 + 가격 헤드 */}
        {/* 도매는 일반/유기농 토글이 없어 디자인이 hero 상단 패딩을 20으로 키움(소매=12) */}
        <View style={[styles.content01, market === 'wholesale' && { paddingTop: spacing.s5 }]}>
          {/* 재배방식(일반/유기농)은 소매 하위 토글 — hero 바로 위. 도매엔 유기농 데이터 없어 숨김. */}
          {market !== 'wholesale' && (
            <Tabs
              variant="pill"
              value={market}
              onChange={setMarket}
              options={[
                { value: 'retail', label: '일반' },
                { value: 'eco', label: '유기농·무농약' },
              ]}
            />
          )}

          {market === 'eco' ? (
            eco === undefined || (eco !== null && ecoBaseline === undefined) ? (
              <ActivityIndicator style={{ marginVertical: spacing.s10 }} color={colors.textTertiary} />
            ) : eco === null ? (
              <EmptyState title="유기농·무농약 시세가 없는 품목이에요" description="일반 기준으로 확인해 보세요" />
            ) : (
              <View style={styles.hero}>
                <View style={styles.heroBody}>
                  <View style={styles.heroThumb}>
                    {thumbFor(item) != null && (
                      <Image source={thumbFor(item)} style={StyleSheet.absoluteFill} contentFit="cover" />
                    )}
                  </View>
                  <View style={styles.heroContents}>
                    <View style={styles.heroNameRow}>
                      <Text style={styles.heroName} numberOfLines={1}>
                        {item.itemName}
                      </Text>
                      {ecoBaseline && ecoSeasonalPct != null && (
                        <SignalChip
                          level={ecoLevel}
                          label={
                            ecoLevel === 'cheap'
                              ? '저렴해요'
                              : ecoLevel === 'expensive'
                                ? '비싼 편이에요'
                                : '평소 수준이에요'
                          }
                        />
                      )}
                    </View>
                    <View style={styles.heroPriceBlock}>
                      <Text style={styles.price}>
                        {won(eco.latest)}원
                        <Text style={styles.unit}> / {eco.unit ?? item.unit}</Text>
                      </Text>
                      {perUnitCaption(item.itemCode, eco.latest, eco.unit ?? item.unit) ? (
                        <Text style={styles.heroSub}>
                          {perUnitCaption(item.itemCode, eco.latest, eco.unit ?? item.unit)}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              </View>
            )
          ) : !active || !view ? (
            market === 'wholesale' && wsItem === undefined ? (
              <ActivityIndicator style={{ marginVertical: spacing.s10 }} color={colors.textTertiary} />
            ) : (
              <EmptyState title="도매 시세가 없는 품목이에요" description="소매 기준으로 확인해 보세요" />
            )
          ) : (
            <View style={styles.hero}>
              <View style={styles.heroBody}>
                <View style={styles.heroThumb}>
                  {/* 사진은 품목 대표(item)로 고정 — 도매 wsItem의 품종코드로 찾으면 소매/도매 사진이 어긋난다 */}
                  {thumbFor(item!) != null && (
                    <Image source={thumbFor(item!)} style={StyleSheet.absoluteFill} contentFit="cover" />
                  )}
                </View>
                <View style={styles.heroContents}>
                  <View style={styles.heroNameRow}>
                    <Text style={styles.heroName} numberOfLines={1}>
                      {heroName}
                    </Text>
                    {recReady ? (
                      <SignalChip
                        level={displayLevel}
                        label={
                          displayLevel === 'cheap'
                            ? isTopDiscount && market === 'retail'
                              ? '할인율 1위'
                              : '저렴해요'
                            : displayLevel === 'fair'
                              ? '평소 수준이에요'
                              : '비싼 편이에요'
                        }
                      />
                    ) : signalHidden ? null : (
                      <Skeleton style={styles.skelChip} />
                    )}
                  </View>
                  <View style={styles.heroPriceBlock}>
                    <Text style={styles.price}>
                      {won(active.today)}원
                      <Text style={styles.unit}> / {active.unit}</Text>
                    </Text>
                    {perUnitCaption(active.itemCode, active.today, active.unit) ? (
                      <Text style={styles.heroSub}>
                        {perUnitCaption(active.itemCode, active.today, active.unit)}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* content-02: grey-50 무대 */}
        {market === 'eco' && eco && ecoBaseline !== undefined ? (
          <View style={[styles.content02, { paddingBottom: insets.bottom + spacing.s10 }]}>
            <View style={styles.chartCard}>
              <View style={styles.chartLabelRow}>
                <Text style={styles.chartTitle}>최근 시세</Text>
                {ecoBaseline && (
                  <Text style={styles.chartBaseline}>이맘때 평균 {won(ecoBaseline.avg)}원</Text>
                )}
              </View>
              <Sparkline series={eco.series} baseline={ecoBaseline?.avg ?? null} level={ecoLevel} />
            </View>
            <BuySection markets={eco.markets} reference={eco.latest} />
            <ShopSection itemCode={itemKey(item)} market="eco" />
            <Text style={styles.source}>
              자료 출처 · KAMIS{surveyDate ? ` ${surveyDate} 기준` : ''}
              {'\n'}유기농·무농약은 주 1회 화요일에 업데이트
            </Text>
          </View>
        ) : active && view ? (
          <View style={[styles.content02, { paddingBottom: insets.bottom + spacing.s10 }]}>
            {/* when-buy 그룹 — rec-card·차트·연간흐름을 16px로 묶는다 (마켓까지는 32px) */}
            <View style={styles.whenBuy}>
              {/* 최근 시세 — 실측 추이 + 이맘때 평균 기준선 + 오늘 시세 툴팁 */}
              <View style={styles.chartCard}>
                <View style={styles.chartLabelRow}>
                  <Text style={styles.chartTitle}>최근 시세</Text>
                  {baseline != null && (
                    <Text style={styles.chartBaseline}>이맘때 평균 {won(baseline)}원</Text>
                  )}
                </View>
                {/* 차트 데이터(28일 도착) 전엔 스켈레톤. 색은 이미 확정된 추천(displayLevel)을 따른다 */}
                {!chartReady ? (
                  <Skeleton style={styles.skelChart} />
                ) : (
                  <Sparkline
                    series={chartDisplay!}
                    baseline={baseline}
                    level={recReady ? displayLevel : 'fair'}
                  />
                )}
              </View>

              {/* 연간 가격 흐름 — 계산 중에도 타이틀 + '흐름 파악 중' (섹션 안 사라짐) */}
              <AnnualFlow
                months={annualMonths}
                name={item.itemName}
                spanVarieties={annualSpanVarieties}
                thisMonthVarieties={annualThisMonthVarieties}
              />
            </View>

            <BuySection markets={markets} reference={active.today} />

            {/* 도매 탭엔 쿠팡 섹션을 붙이지 않는다 — 도매가는 가락시장 경락가(유통 마진 이전)라
                소매가인 쿠팡 상품과 비교 축이 다르고, 조사 단위(10kg·1상자)도 상품 규격과 대응이 안 된다.
                "도매가로 살 수 있다"는 오해를 만드느니 안 보여주는 게 정직하다. */}
            {market !== 'wholesale' && <ShopSection itemCode={itemKey(item)} />}

            <Text style={styles.source}>자료 출처 · KAMIS{surveyDate ? ` ${surveyDate} 기준` : ''}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

/**
 * 추천 판정 = 평년(=이맘때) 단일 기준 (오늘 vs 이맘때 평균). 홈 카드와 같은 기준이라 어긋나지 않는다.
 * level이 히어로 칩·차트 색을 끌고 간다.
 */
function evalBuy(today: number, normal: number | null) {
  // 홈 카드와 '완전히 같은' 판정: 반올림된 평년 대비 %(=item.vsNormalPct)에 ±1% 임계.
  const pctN = normal != null && normal > 0 ? Math.round(((today - normal) / normal) * 100) : null;
  const level: SignalLevel = pctN == null ? 'fair' : pctN <= -1 ? 'cheap' : pctN >= 1 ? 'expensive' : 'fair';
  return { level };
}

/** 스켈레톤 — 펄스(opacity) 애니메이션. children을 주면 그 묶음 전체가 한 단위로 펄스(차트 실루엣 등). */
function Skeleton({ style, children }: { style?: StyleProp<ViewStyle>; children?: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 750, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={[style, { opacity }]}>{children}</Animated.View>;
}

/**
 * 연간 가격 흐름 — 12개월 평균 막대, 이번 달 강조.
 * 캡션은 '관측된 가격 패턴'만 사실로 전한다(이맘때 가격 위치 / 가장 싼·비싼 달).
 * 출하량(공급) 데이터는 없으므로 '출하가 늘어/줄어' 같은 인과는 주장하지 않는다.
 */
function AnnualFlow({
  months,
  name,
  spanVarieties,
  thisMonthVarieties,
}: {
  months: (number | null)[] | null;
  name: string;
  spanVarieties?: boolean;
  thisMonthVarieties?: { name: string; price: number }[] | null;
}) {
  const thisMonth = new Date().getMonth(); // 0-based
  // 분할 품목 캡션 (한 Text 안 \n 두 줄 — 별도 div 아님):
  //  · 이달 품종 2+ : "6월 무는 보통 봄무와 월동무가 있어요 / 봄무가 월동무보다 낮은 편이에요"
  //  · 이달 품종 1   : "지금은 봄배추 철이에요 / 철마다 품종이 달라 가격대도 바뀌어요"
  //  (교차-품종 '이맘때 낮은 편' 주장은 안 함 — 지금 싼지는 히어로 판정이 알려준다)
  const tmvList = thisMonthVarieties ?? [];
  const varietyCaption =
    tmvList.length >= 2
      ? `${thisMonth + 1}월 ${name}${topicParticle(name)} 보통 ${tmvList
          .map((v, i) => `${v.name}${i < tmvList.length - 1 ? `${withParticle(v.name)} ` : subjectParticle(v.name)}`)
          .join('')} 있어요.\n${
          tmvList.length === 2
            ? `${tmvList[0].name}${subjectParticle(tmvList[0].name)} ${tmvList[1].name}보다 보통 이맘때 가격이 낮은 편이에요.`
            : `${tmvList[0].name}${subjectParticle(tmvList[0].name)} 보통 이맘때 가격이 가장 낮은 편이에요.`
        }`
      : spanVarieties && tmvList.length === 1
        ? `지금은 ${tmvList[0].name} 철이에요.\n철마다 품종이 달라 가격대도 바뀌어요.`
        : null;
  const valid = months
    ? months.map((m, i) => ({ m, i })).filter((x): x is { m: number; i: number } => x.m != null)
    : [];
  const loading = months == null;
  // 1년치 중 절반 미만만 조사된 품목(배추·무·감자 등 — 계절별 품종으로 쪼개 조사)은
  // 한 품종의 일부 철만 잡혀, '연간 흐름'으로 보여주면 오해됨 → 차트 생략하고 안내.
  const ready = !loading && valid.length >= 6;
  const insufficient = !loading && !ready;

  // 준비됐을 때만 막대·캡션 계산. 아니면 타이틀 + '흐름 파악 중' (섹션 자체는 항상 보인다)
  let bars: React.ReactNode = null;
  let seasonText = '';
  if (ready) {
    const max = Math.max(...valid.map((x) => x.m));
    const min = Math.min(...valid.map((x) => x.m));
    const span = Math.max(max - min, 1);
    const minIdx = valid.reduce((a, b) => (b.m < a.m ? b : a)).i; // 가장 싼 달
    const maxIdx = valid.reduce((a, b) => (b.m > a.m ? b : a)).i; // 가장 비싼 달
    const p = topicParticle(name);
    const variation = (max - min) / min;
    const cur = months![thisMonth]; // 이번 달 평균 (null이면 위치 판정 불가 → 일반 안내)
    // 우리가 가진 건 '가격'뿐 — 출하량(공급) 데이터는 없다. 그래서 인과(출하↑↓)는 말하지 않고
    // 관측된 가격 패턴만 사실로 전한다 (이번 달의 실제 가격 위치로 판정).
    const generic = `${name}${p} 보통 ${MONTHS[minIdx]}월 무렵 가장 싸고, ${MONTHS[maxIdx]}월 무렵 가장 비싸요`;
    if (variation < 0.08) seasonText = `${name}${p} 연중 가격이 비교적 안정적이에요`;
    else if (cur == null) seasonText = generic;
    else {
      const pos = (cur - min) / span;
      if (pos <= 0.33) seasonText = `${name}${p} 보통 이맘때 가격이 낮은 편이에요`;
      else if (pos >= 0.67) seasonText = `${name}${p} 보통 이맘때 가격이 높은 편이에요`;
      else seasonText = generic;
    }
    bars = (
      <View style={styles.flowBars}>
        {months!.map((m, i) => {
          const on = i === thisMonth;
          return (
            <View key={i} style={styles.flowCol}>
              {/* 데이터 없는 달은 막대 없음 — 짧은 막대로 그리면 '제일 싼 달'로 오해됨 */}
              {m != null && (
                <View
                  style={[
                    styles.flowBar,
                    { height: 16 + Math.round(((m - min) / span) * 28), backgroundColor: on ? palette.brandPrimary : colors.bgTertiary },
                  ]}
                />
              )}
              <Text style={[styles.flowLabel, on && { color: palette.brandPrimary }]}>{MONTHS[i]}</Text>
            </View>
          );
        })}
      </View>
    );
  }
  return (
    <View style={styles.flowCard}>
      <View style={styles.flowTitleRow}>
        <Text style={styles.sectionTitle}>연간 가격 흐름</Text>
      </View>
      {ready ? (
        <>
          {bars}
          <View style={styles.flowCaptions}>
            {varietyCaption ? (
              <Text style={styles.flowCaption}>{varietyCaption}</Text>
            ) : (
              <Text style={styles.flowCaption}>{seasonText}.</Text>
            )}
            {valid.length < 12 && (
              <Text style={styles.flowCaption}>자료가 없는 달은 비워뒀어요.</Text>
            )}
          </View>
        </>
      ) : insufficient ? (
        <Text style={styles.flowCaption}>
          이 품목은 제철에만 조사돼, 한 해 흐름을 보여줄 자료가 부족해요.
        </Text>
      ) : (
        <>
          {/* 막대 차트 실루엣이 한 단위로 펄스 — 차트가 로딩 중임을 그대로 전달 */}
          <Skeleton style={styles.flowBars}>
            {SKEL_BAR_H.map((h, i) => (
              <View key={i} style={styles.flowCol}>
                <View style={[styles.flowBar, { height: h, backgroundColor: colors.bgTertiary }]} />
                <Text style={styles.flowLabel}>{MONTHS[i]}</Text>
              </View>
            ))}
          </Skeleton>
          <Skeleton style={styles.skelLine} />
        </>
      )}
    </View>
  );
}

/**
 * "이렇게 사면 좋아요" — 판매처별 실가격. 점 색은 상대 신호(최저=cheap, 최고=expensive).
 */
function BuySection({ markets, reference }: { markets: MarketPrice[] | null; reference: number | null }) {
  if (markets == null) {
    return <ActivityIndicator style={{ marginVertical: spacing.s4 }} color={colors.textTertiary} />;
  }
  if (markets.length === 0) return null;
  const shown = markets.slice(0, 6);
  return (
    <View style={styles.buySection}>
      <Text style={styles.sectionTitle}>이렇게 사면 좋아요</Text>
      <View style={styles.buyCard}>
        {shown.map((m, idx) => {
          // 점 색 = 현재 가격(오늘가) 대비. 싸면 cheap(초록)·비싸면 expensive(빨강)·±1% 안은 fair.
          const level = judge(m.price, reference) ?? 'fair';
          return (
            <View key={m.market}>
              {idx > 0 && <View style={styles.buyDivider} />}
              <View style={styles.buyRow}>
                <View style={[styles.buyDot, { backgroundColor: signal[level].main }]} />
                <Text style={styles.buyName}>{m.market}</Text>
                <Text style={styles.buyPrice}>{won(m.price)}원</Text>
              </View>
            </View>
          );
        })}
      </View>
      <Text style={styles.buyCaption}>
        현재 가격보다 싼 곳은 초록, 비싼 곳은 빨강이에요. 최근 조사가라 매장마다 다를 수 있어요.
      </Text>
    </View>
  );
}

/**
 * "지금 온라인에서 사기" — 제휴 아웃링크. 가격 숫자는 표시하지 않는다(실시간 조회 불가 → 오정보 방지).
 * 제휴 설정이 안 된 몰 행은 숨김 — 네이버(무수익 검색 링크)는 항상 있어 섹션이 비지 않는다.
 */
/** 지금 쿠팡에서 사기 — 상품 카드 리스트(이미지·상품명·로켓 배지·가격). Figma 933:2564 1:1. */
function ShopSection({ itemCode, market = 'retail' }: { itemCode: string; market?: 'retail' | 'eco' }) {
  const products = coupangProducts(itemCode, market);
  if (products.length === 0) return null;
  return (
    <View style={styles.buySection}>
      <Text style={styles.sectionTitle}>지금 쿠팡에서 사기</Text>
      <View style={styles.coupangCard}>
        {products.map((p, idx) => (
          <View key={idx}>
            {idx > 0 && <View style={styles.buyDivider} />}
            <Pressable
              style={styles.coupangRow}
              onPress={() => {
                trackShoppingClick('coupang', itemCode);
                Linking.openURL(p.url);
              }}
            >
              <View style={styles.coupangThumb}>
                {p.imageUrl ? (
                  <Image source={{ uri: p.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
                ) : null}
              </View>
              <View style={styles.coupangInfo}>
                <Text style={styles.coupangName} numberOfLines={2}>
                  {p.name}
                </Text>
                <View style={styles.coupangPriceRow}>
                  {p.status && (
                    <Image
                      source={{ uri: ROCKET_LOGO[p.status] }}
                      style={{ height: 16, width: ROCKET_LOGO_W[p.status] }}
                      contentFit="contain"
                    />
                  )}
                  <Text style={styles.coupangPrice}>{won(p.price)}원</Text>
                </View>
              </View>
            </Pressable>
          </View>
        ))}
      </View>
      {/* 쿠팡 파트너스 표시의무 — 수수료 고지 필수 */}
      <Text style={styles.buyCaption}>
        이 게시물은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다. 정확한 가격은 판매처에서 확인하세요.
      </Text>
    </View>
  );
}

/** main-header type=detail — back + 제목 + 관심(heart). 하트 상호작용은 FavoriteHeart 공용. */
function Header({ title, fav, onFav }: { title: string; fav: boolean; onFav: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.iconBtn} onPress={() => router.back()} hitSlop={4}>
        <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <FavoriteHeart fav={fav} onToggle={onFav} hitSlop={4} style={styles.iconBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgCanvas }, // 03 상세 fill = bg/canvas (content-02만 secondary)
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s1,
    gap: spacing.s1,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, ...type.size[17], ...type.w.semibold, color: colors.textPrimary, textAlign: 'left' } as const,
  scroll: { flexGrow: 1 }, // 짧아도 content-02(회색)가 화면 끝까지 늘어나게(안 그러면 흰 배경 드러남)
  // 소매/도매 탭 — 헤더 바로 아래 풀폭. 패딩 안쪽으로 탭, 보더는 박스 풀폭(=full-bleed 헤어라인).
  marketTabs: {
    backgroundColor: colors.bgCanvas,
    paddingHorizontal: spacing.s4,
  },
  // 풀블리드 디바이더 — 2px 밑줄 바의 수직 '정중앙'에 맞춤(Figma: 바 48~50, 디바이더 48.75).
  // 바는 컨테이너 맨 아래 2px에 붙으므로 bottom=(바두께-라인두께)/2 로 바 중앙에 위치. borderBottom처럼 1px 안 더해지게 절대배치.
  marketTabsLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: (2 - StyleSheet.hairlineWidth) / 2,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.bgTertiary,
  },
  // content01: 상단 12 / 좌우 16 / 하단 12, 자식 간격 12(일반·유기농 토글 → hero)
  content01: {
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s3,
    gap: spacing.s3,
    backgroundColor: colors.bgCanvas,
  },
  content02: { padding: spacing.s4, gap: spacing.s8, backgroundColor: colors.bgSecondary, flexGrow: 1 },
  whenBuy: { gap: spacing.s4 }, // rec-card·차트·연간흐름 묶음 (16px)
  hero: { gap: spacing.s3 },
  heroBody: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.s3 },
  heroThumb: { width: 100, aspectRatio: 1, borderRadius: radius.m, backgroundColor: colors.bgTertiary, overflow: 'hidden' },
  // Figma hero-top: 이름행(위)·가격블록(아래) space-between으로 썸네일(100) 높이 채움
  heroContents: { flex: 1, alignSelf: 'stretch', alignItems: 'flex-start', justifyContent: 'space-between' },
  heroPriceBlock: { alignItems: 'flex-start' },
  heroNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.s2, maxWidth: '100%' },
  heroName: { ...type.size[17], ...type.w.semibold, color: colors.textPrimary, flexShrink: 1 } as const,
  heroSub: { ...type.size[13], ...type.w.regular, color: colors.textTertiary } as const,
  price: { ...type.size[28], ...type.w.bold, color: colors.priceNumber } as const,
  unit: { ...type.size[15], ...type.w.regular, color: colors.priceUnit } as const,
  ecoLead: { ...type.size[15], ...type.w.regular, color: colors.textSecondary } as const,
  // 오늘·최근1년·평년 3값 비교행 + 한 줄 판정
  compareRow: { flexDirection: 'row', gap: spacing.s4, width: '100%' },
  compareCol: { flex: 1, gap: 2 },
  compareLabel: { ...type.size[13], ...type.w.regular, color: colors.textTertiary } as const,
  compareValue: { ...type.size[15], ...type.w.semibold, color: colors.textSecondary } as const,
  verdict: { ...type.size[13], ...type.w.regular } as const,
  skelValue: { width: 58, height: 18, borderRadius: radius.xs, backgroundColor: colors.bgTertiary },

  sectionTitle: { ...type.size[17], ...type.w.semibold, color: colors.textPrimary } as const,

  // 언제 살까요? rec-card
  whenSection: { gap: spacing.s2 },
  recCard: { backgroundColor: colors.bgElevated, borderRadius: radius.l, padding: spacing.s5, gap: spacing.s3 },
  recTopLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.s2, flexShrink: 1 },
  recBadge: { paddingHorizontal: spacing.s2, paddingVertical: spacing.s1, borderRadius: radius.full },
  recBadgeText: { ...type.size[13], ...type.w.semibold, color: '#ffffff' } as const,
  recHeadline: { ...type.size[17], ...type.w.semibold, flexShrink: 1 } as const,
  recProse: { ...type.size[15], ...type.w.regular, color: colors.textSecondary } as const,
  // 스켈레톤 — 추천 확정 전 자리 채움(뒤집힘 방지)
  skelChip: { width: 84, height: 26, borderRadius: radius.full, backgroundColor: colors.bgTertiary },
  skelBadge: { width: 46, height: 24, borderRadius: radius.full, backgroundColor: colors.bgTertiary },
  skelHeadline: { width: 150, height: 22, borderRadius: radius.s, backgroundColor: colors.bgTertiary },
  skelLine: { width: '85%', height: 16, borderRadius: radius.s, backgroundColor: colors.bgTertiary },
  skelChart: { height: 140, borderRadius: radius.m, backgroundColor: colors.bgTertiary },
  skelTitle: { width: 210, height: 25, borderRadius: radius.s, backgroundColor: colors.bgTertiary },

  chartCard: { backgroundColor: colors.bgElevated, borderRadius: radius.l, padding: spacing.s5, gap: spacing.s4 },
  // 최근 시세 라벨 — 제목 + '이맘때 평균 X원' 서브타이틀 세로 스택 (Figma label-row, gap 0)
  chartLabelRow: {},
  chartTitle: { ...type.size[17], ...type.w.semibold, color: colors.textPrimary } as const,
  chartBaseline: { ...type.size[13], ...type.w.regular, color: colors.textSecondary } as const,
  chartFootnote: { ...type.size[13], ...type.w.regular, color: colors.textTertiary } as const,
  // 차트 범례 — 라인 샘플(12px) + 라벨
  chartLegend: { gap: 2 },
  legendRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.s2 },
  legendLine: { width: 12, height: 0, marginTop: 8 },

  // 연간 가격 흐름
  flowCard: { backgroundColor: colors.bgElevated, borderRadius: radius.l, padding: spacing.s5, gap: spacing.s4 },
  flowTitleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.s2 },
  flowThisMonth: { ...type.size[13], ...type.w.regular, color: colors.textSecondary } as const,
  flowBars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 60, paddingHorizontal: spacing.s2 },
  flowCol: { alignItems: 'center', gap: spacing.s1 },
  flowBar: { width: 12, borderRadius: 4 },
  flowLabel: { ...type.size[13], ...type.w.regular, color: colors.textTertiary } as const,
  flowCaptions: { gap: 2 }, // 시즌 캡션 + '자료 없는 달' 줄을 붙여서(Figma anual-contents)
  flowCaption: { ...type.size[13], ...type.w.regular, color: colors.textTertiary } as const,

  source: { ...type.size[13], ...type.w.regular, color: colors.textTertiary, textAlign: 'center' } as const,
  buySection: { gap: spacing.s2 },
  buyCard: { borderRadius: radius.l, backgroundColor: colors.bgElevated, overflow: 'hidden' },
  buyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s3,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s3,
  },
  buyDot: { width: 8, height: 8, borderRadius: radius.full },
  buyName: { ...type.size[15], ...type.w.regular, color: colors.textPrimary, flex: 1 } as const,
  buyPrice: { ...type.size[15], ...type.w.semibold, color: colors.priceNumber } as const,
  buyDivider: { height: 1, backgroundColor: colors.borderDefault },
  buyCaption: { ...type.size[13], ...type.w.regular, color: colors.textTertiary } as const,
  // 쿠팡 상품 리스트 (Figma 933:2564)
  coupangCard: { borderRadius: radius.l, backgroundColor: colors.bgElevated, overflow: 'hidden' },
  coupangRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s3,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s3,
    minHeight: 80,
  },
  coupangThumb: { width: 56, height: 56, borderRadius: radius.s, backgroundColor: colors.bgSecondary, overflow: 'hidden' },
  coupangInfo: { flex: 1, gap: spacing.s1 },
  coupangName: { ...type.size[15], ...type.w.regular, color: colors.textPrimary } as const,
  coupangPriceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.s2 },
  coupangPrice: { ...type.size[15], ...type.w.semibold, color: colors.priceNumber } as const,
});
