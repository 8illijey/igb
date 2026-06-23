import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Heart, Info } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import {
  EcoData,
  fetchCategory,
  fetchEco,
  fetchMarketPrices,
  fetchSeries,
  judge,
  MarketPrice,
  PriceItem,
  SeriesPoint,
  won,
} from '../../api/kamis';
import { useVerdicts } from '../../api/verdicts';
import { EmptyState } from '../../components/igb/EmptyState';
import { GlassHeader } from '../../components/igb/GlassHeader';
import { SegmentedControl } from '../../components/igb/SegmentedControl';
import { SignalChip } from '../../components/igb/SignalChip';
import { Sparkline } from '../../components/igb/Sparkline';
import { useFavorites } from '../../store/favorites';
import { bumpPopularity } from '../../store/popularity';
import { itemKey, usePrices } from '../../store/prices';
import { thumbFor } from '../../thumbnails';
import { subjectParticle, topicParticle, withParticle } from '../../utils/korean';
import { colors, font, palette, radius, signal, SignalLevel, spacing, tabularNums, type } from '../../theme/tokens';

type Market = 'retail' | 'eco' | 'wholesale';

const MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const SKEL_BAR_H = [20, 28, 36, 24, 18, 40, 30, 44, 38, 26, 22, 16]; // 작년 흐름 스켈레톤 막대 실루엣

// 영구 캐시 — 같은 날이면 새로고침해도 즉시(메모리 + AsyncStorage). 시계열·판매처 등 일 단위 데이터 공용.
const dataMem = new Map<string, unknown>();
function todayStr() {
  return new Date().toISOString().slice(0, 10);
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
  const [yearSeries, setYearSeries] = useState<SeriesPoint[] | null>(null); // 365일 — 28일 차트·최근1년 평균·연간 흐름·작년 궤적 모두 여기서 파생
  const [markets, setMarkets] = useState<MarketPrice[] | null>(null);
  const [wsItem, setWsItem] = useState<PriceItem | null | undefined>(undefined);
  const [eco, setEco] = useState<EcoData | null | undefined>(undefined);

  useEffect(() => {
    if (market !== 'wholesale' || wsItem !== undefined || !item) return;
    fetchCategory(item.categoryCode, undefined, '02')
      .then((list) => {
        const matches = list.filter((x) => x.itemCode === item.itemCode && x.today != null);
        setWsItem(matches.find((x) => x.kindCode === item.kindCode) ?? matches[0] ?? null);
      })
      .catch(() => setWsItem(null));
  }, [market, wsItem, item]);

  useEffect(() => {
    if (market !== 'eco' || eco !== undefined || !item) return;
    fetchEco(item)
      .then(setEco)
      .catch(() => setEco(null));
  }, [market, eco, item]);

  const active = market === 'wholesale' ? wsItem : market === 'retail' ? item : null;
  const cls = market === 'wholesale' ? '02' : '01';

  // 365일 1회 + 마켓 1회만 호출 (28일 차트는 연 데이터 끝 28개로 파생 — 중복 fetch 제거로 가속).
  useEffect(() => {
    if (market === 'eco' || !active) return;
    const ck = `${itemKey(active)}-${cls}`;
    // 같은 날 캐시(메모리+localStorage) — 새로고침/재방문 즉시. 오늘 가격은 item에서 오므로 차트도 캐시 무해.
    setMarkets(null);
    setYearSeries(null);
    cached(`mk-${ck}`, () => fetchMarketPrices(active, cls))
      .then(setMarkets)
      .catch(() => setMarkets([]));
    cached(`y-${ck}`, () => fetchSeries(active, 365, cls))
      .then(setYearSeries)
      .catch(() => setYearSeries([]));
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

  // 28일 — 최근 추이 차트 (연 데이터 끝 28개에서 파생, 오늘가 앵커)
  const chartSeries = useMemo(() => {
    if (!yearSeries) return null;
    return anchor(yearSeries.slice(-28), active?.today);
  }, [yearSeries, active?.today]);

  // 365일 — 최근 1년 평균(추천 기준) + 월별 평균(연간 흐름) + 작년 궤적 (백그라운드, 늦게 채워짐)
  const yearDerived = useMemo(() => {
    const ys = anchor(yearSeries, active?.today);
    if (!ys || ys.length < 30 || active?.today == null) return null;
    const prices = ys.map((p) => p.price);
    const recentAvg = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null;
    // 작년 같은 시기 궤적(차트 점선) — 1년 시계열 맨 앞(≈작년 오늘)부터 ~2주. 별도 fetch보다 robust(연 데이터에 있음).
    const k = Math.max(4, Math.round((ys.length * 14) / 365));
    const overlay = ys.length >= 8 ? ys.slice(0, Math.min(ys.length, k + 1)) : null;
    return { months: monthlyAverages(ys), recentAvg, overlay };
  }, [yearSeries, active?.today]);

  // 차트 한 줄 결론 (최근 28일 vs 평년)
  const chartSummary = useMemo(() => {
    if (!chartSeries || chartSeries.length < 2 || !view) return null;
    const recent = chartSeries.slice(-28).map((p) => p.price);
    const today = recent[recent.length - 1];
    if (today <= Math.min(...recent)) return '최근 28일 중 오늘이 가장 싸요';
    if (today >= Math.max(...recent)) return '최근 28일 중 오늘이 가장 비싸요';
    if (view.level === 'cheap') return '평년보다 아래에서 움직이고 있어요';
    if (view.level === 'expensive') return '평년보다 위에서 움직이고 있어요';
    return '평년 수준에서 오르내리고 있어요';
  }, [chartSeries, view]);

  // 최근 1년 평균 — 사전계산(서버) 우선, 없으면 365일 기기 계산. 사전계산이 있으면 추천이 즉시 확정.
  const verdicts = useVerdicts();
  const precomputedRecentAvg = market === 'retail' ? verdicts[key]?.recentAvg ?? null : null;
  const recentAvg = precomputedRecentAvg ?? yearDerived?.recentAvg ?? null;
  // 연간 흐름 — 사전계산(다품종 병합) 우선, 없으면 365일 단일 품종에서 파생
  const annualMonths = (market === 'retail' ? verdicts[key]?.months : null) ?? yearDerived?.months ?? null;
  const annualSpanVarieties = market === 'retail' ? verdicts[key]?.spanVarieties ?? false : false;
  const annualThisMonthVarieties = market === 'retail' ? verdicts[key]?.thisMonthVarieties ?? null : null;
  // 분할 품목은 대표 품종명(봄배추)을 히어로에 — 그 외엔 품목명
  const heroName = (annualSpanVarieties && verdicts[key]?.variety) || item?.itemName || '';

  // 추천 = 평년 + 최근 1년 평균 두 기준 종합(evalBuy). 히어로 칩·rec-card·verdict가 이걸 따른다.
  const buy = active?.today != null && recentAvg != null ? evalBuy(active.today, active.normal, recentAvg) : null;
  const displayLevel: SignalLevel = buy ? buy.level : 'fair';
  // recReady = 추천 확정(사전계산이면 즉시, 아니면 365 도착 후). chartReady = 차트·연간흐름 데이터 도착.
  const recReady = buy != null;
  const chartReady = chartSeries != null;

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
        {/* content-01: 흰 배경 — 세그먼트 + 가격 헤드 */}
        <View style={styles.content01}>
          <SegmentedControl
            value={market}
            onChange={setMarket}
            options={[
              { value: 'retail', label: '소매' },
              { value: 'eco', label: '친환경' },
              { value: 'wholesale', label: '도매' },
            ]}
          />

          {market === 'eco' ? (
            eco === undefined ? (
              <ActivityIndicator style={{ marginVertical: spacing.s10 }} color={colors.textTertiary} />
            ) : eco === null ? (
              <EmptyState title="친환경 시세가 없는 품목이에요" description="소매 기준으로 확인해 보세요" />
            ) : (
              <View style={styles.hero}>
                <View style={styles.heroBody}>
                  <View style={styles.heroThumb}>
                    {thumbFor(item) != null && (
                      <Image source={thumbFor(item)} style={StyleSheet.absoluteFill} contentFit="cover" />
                    )}
                  </View>
                  <View style={styles.heroContents}>
                    <Text style={[styles.price, tabularNums]}>
                      {won(eco.latest)}
                      <Text style={styles.unit}> 원 / {eco.unit ?? item.unit} 기준</Text>
                    </Text>
                    {perUnitCaption(item.itemCode, eco.latest, eco.unit ?? item.unit) ? (
                      <Text style={styles.heroSub}>
                        {perUnitCaption(item.itemCode, eco.latest, eco.unit ?? item.unit)}
                      </Text>
                    ) : null}
                    <Text style={styles.ecoLead}>
                      {eco.vsPrevWeekPct == null
                        ? '지난주 비교 데이터가 없어요'
                        : eco.vsPrevWeekPct === 0
                          ? '지난주와 같은 가격이에요'
                          : `지난주보다 ${eco.vsPrevWeekPct > 0 ? '+' : ''}${eco.vsPrevWeekPct}%`}
                      {'  ·  매주 화요일 발행'}
                    </Text>
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
                  {thumbFor(active) != null && (
                    <Image source={thumbFor(active)} style={StyleSheet.absoluteFill} contentFit="cover" />
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
                            ? isTopDiscount
                              ? '할인율 1위'
                              : '저렴해요'
                            : displayLevel === 'fair'
                              ? '평소 수준이에요'
                              : '비싼 편이에요'
                        }
                      />
                    ) : (
                      <Skeleton style={styles.skelChip} />
                    )}
                  </View>
                  <Text style={[styles.price, tabularNums]}>
                    {won(active.today)}
                    <Text style={styles.unit}> 원 / {active.unit} 기준</Text>
                  </Text>
                  {perUnitCaption(active.itemCode, active.today, active.unit) ? (
                    <Text style={styles.heroSub}>
                      {perUnitCaption(active.itemCode, active.today, active.unit)}
                    </Text>
                  ) : null}
                </View>
              </View>
              {/* 오늘·최근 1년 평균·평년 3값 비교 + 한 줄 판정 — 라벨은 즉시, 값은 칸별 스켈레톤 */}
              <View style={styles.compareRow}>
                <View style={styles.compareCol}>
                  <Text style={styles.compareLabel}>오늘</Text>
                  {recReady ? (
                    <Text style={[styles.compareValue, tabularNums, { color: signal[displayLevel].main }]}>
                      {won(active.today)}원
                    </Text>
                  ) : (
                    <Skeleton style={styles.skelValue} />
                  )}
                </View>
                <View style={styles.compareCol}>
                  <Text style={styles.compareLabel}>최근 1년 평균</Text>
                  {recReady ? (
                    <Text style={[styles.compareValue, tabularNums]}>{won(recentAvg)}원</Text>
                  ) : (
                    <Skeleton style={styles.skelValue} />
                  )}
                </View>
                <View style={styles.compareCol}>
                  <Text style={styles.compareLabel}>평년</Text>
                  {recReady ? (
                    <Text style={[styles.compareValue, tabularNums]}>{won(active.normal)}원</Text>
                  ) : (
                    <Skeleton style={styles.skelValue} />
                  )}
                </View>
              </View>
              {recReady && buy ? (
                <Text style={[styles.verdict, { color: signal[buy.verdictLevel].main }]}>
                  {buy.verdict}
                  {buy.check ? ' ✓' : ''}
                </Text>
              ) : (
                <Skeleton style={styles.skelLine} />
              )}
            </View>
          )}
        </View>

        {/* content-02: grey-50 무대 */}
        {market === 'eco' && eco ? (
          <View style={styles.content02}>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>최근 6개월</Text>
              <Sparkline series={eco.series} baseline={null} level="fair" neutral />
              <Text style={styles.chartFootnote}>
                친환경은 평년 가격 자료가 없어서, 싼지 비싼지 대신 가격 흐름을 보여드려요
              </Text>
            </View>
            <BuySection markets={eco.markets} reference={eco.latest} />
            <Text style={styles.source}>자료 출처 · KAMIS {new Date().toISOString().slice(0, 10)} 기준</Text>
          </View>
        ) : active && view ? (
          <View style={styles.content02}>
            {/* when-buy 그룹 — rec-card·차트·연간흐름을 16px로 묶는다 (마켓까지는 32px) */}
            <View style={styles.whenBuy}>
              {/* 언제 살까요? — 평년·최근 1년 평균 두 기준 비교로 정직하게 */}
              <WhenToBuyCard
                level={displayLevel}
                prose={buy ? buyProse(buy, active.normal, recentAvg) : ''}
                loading={!recReady}
              />

              {/* 최근 가격 추이 (실측 + 평년 기준선 + 작년 점선) */}
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>{chartReady ? (chartSummary ?? '최근 추이') : '최근 추이'}</Text>
                {/* 차트 데이터(365 도착) 전엔 스켈레톤. 색은 이미 확정된 추천(displayLevel)을 따른다 */}
                {!chartReady ? (
                  <Skeleton style={styles.skelChart} />
                ) : (
                  <Sparkline
                    series={chartSeries.slice(-28)}
                    baseline={active.normal}
                    baselineLabel="평년"
                    level={recReady ? displayLevel : 'fair'}
                    overlay={yearDerived?.overlay ?? undefined}
                  />
                )}
                {/* 범례 — 차트 데이터 준비 후 표시 */}
                {chartReady && (
                <View style={styles.chartLegend}>
                  <View style={styles.legendRow}>
                    <View style={[styles.legendLine, { borderTopWidth: 2, borderColor: signal[displayLevel].main }]} />
                    <Text style={styles.chartFootnote}>최근 28일</Text>
                  </View>
                  <View style={styles.legendRow}>
                    <View
                      style={[styles.legendLine, { borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: colors.textTertiary }]}
                    />
                    <Text style={styles.chartFootnote}>
                      작년 같은 시기 궤적{'\n'}작년 기록이라 올해는 다를 수 있어요
                    </Text>
                  </View>
                  {/* 평년 용어 설명 — KAMIS 평년 정의(최근 5년 중 최고·최저 제외), 같은 날짜 무렵 기준 */}
                  <View style={styles.legendRow}>
                    <Info size={12} color={colors.textTertiary} strokeWidth={2} style={{ marginTop: 4 }} />
                    <Text style={styles.chartFootnote}>
                      평년: 최근 5년({new Date().getFullYear() - 5}~{new Date().getFullYear() - 1}) 중 최고·최저를 뺀,
                      {'\n'}매년 이맘때의 평균 가격
                    </Text>
                  </View>
                </View>
                )}
              </View>

              {/* 작년 가격 흐름 — 계산 중에도 타이틀 + '흐름 파악 중' (섹션 안 사라짐) */}
              <AnnualFlow
                months={annualMonths}
                name={item.itemName}
                spanVarieties={annualSpanVarieties}
                thisMonthVarieties={annualThisMonthVarieties}
              />
            </View>

            <BuySection markets={markets} reference={active.today} />

            <Text style={styles.source}>자료 출처 · KAMIS {new Date().toISOString().slice(0, 10)} 기준</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

/**
 * 언제 살까요? — 평년·최근 1년 평균 두 기준 비교(evalBuy) 결과.
 * BEST(둘 다보다 쌈) / FAIR(엇갈림) / WAIT(둘 다보다 비쌈) 배지 + 헤드라인 + 안내문(둘 다 봐야 하는 이유 포함).
 */
function WhenToBuyCard({ level, prose, loading }: { level: SignalLevel; prose: string; loading: boolean }) {
  // 추천 확정 전(최근 1년 데이터 도착 전)엔 판정이 뒤집히므로 — 스켈레톤만 보여준다.
  if (loading) {
    return (
      <View style={styles.whenSection}>
        <Text style={styles.sectionTitle}>언제 살까요?</Text>
        <View style={styles.recCard}>
          <View style={styles.recTopLeft}>
            <Skeleton style={styles.skelBadge} />
            <Skeleton style={styles.skelHeadline} />
          </View>
          <Skeleton style={styles.skelLine} />
        </View>
      </View>
    );
  }
  const c = signal[level];
  const badge = level === 'cheap' ? 'BEST' : level === 'fair' ? 'FAIR' : 'WAIT';
  const headline = level === 'cheap' ? '지금 사기 좋아요' : level === 'fair' ? '지금 사도 괜찮아요' : '조금 기다려도 좋아요';
  return (
    <View style={styles.whenSection}>
      <Text style={styles.sectionTitle}>언제 살까요?</Text>
      <View style={styles.recCard}>
        <View style={styles.recTopLeft}>
          <View style={[styles.recBadge, { backgroundColor: c.main }]}>
            <Text style={styles.recBadgeText}>{badge}</Text>
          </View>
          <Text style={[styles.recHeadline, { color: c.main }]}>{headline}</Text>
        </View>
        <Text style={styles.recProse}>{prose}</Text>
      </View>
    </View>
  );
}

/**
 * 추천 판정 = 평년 + 최근 1년 평균 두 기준 종합 (단순·투명, 낡은 평년도 자연 처리).
 * 둘 다보다 싸면 BEST(cheap) / 둘 다보다 비싸면 WAIT(expensive) / 엇갈리면 FAIR(fair).
 * 히어로 칩·차트·rec-card가 이 level을 따르고, verdict/check는 히어로 한 줄 판정에 쓴다.
 */
function evalBuy(today: number, normal: number | null, recentAvg: number | null) {
  const nv = judge(today, normal); // vs 평년
  const rv = recentAvg != null ? judge(today, recentAvg) : null; // vs 최근 1년
  const belowN = nv === 'cheap';
  const aboveN = nv === 'expensive';
  const belowR = rv === 'cheap';
  const aboveR = rv === 'expensive';

  let level: SignalLevel;
  if (rv == null) level = nv ?? 'fair';
  else if (belowN && belowR) level = 'cheap';
  else if (aboveN && aboveR) level = 'expensive';
  else level = 'fair';

  let verdict: string;
  let verdictLevel: SignalLevel;
  let check = false;
  if (rv == null) {
    verdict = nv === 'cheap' ? '역대 기준으로 저렴해요' : nv === 'expensive' ? '역대 기준으론 비싼 편이에요' : '역대 기준과 비슷해요';
    verdictLevel = nv ?? 'fair';
  } else if (belowN && belowR) {
    verdict = '역대 기준·요즘 기준 모두에서 저렴해요';
    verdictLevel = 'cheap';
    check = true;
  } else if (aboveN && aboveR) {
    verdict = '역대 기준·요즘 기준 모두에서 비싼 편이에요';
    verdictLevel = 'expensive';
  } else if ((belowN || belowR) && !aboveN && !aboveR) {
    verdict = `${belowN ? '역대' : '요즘'} 기준으론 저렴한 편이에요`;
    verdictLevel = 'cheap';
  } else if ((aboveN || aboveR) && !belowN && !belowR) {
    verdict = `${aboveN ? '역대' : '요즘'} 기준으론 비싼 편이에요`;
    verdictLevel = 'expensive';
  } else if (belowN && aboveR) {
    verdict = '역대 기준보단 싸지만 요즘보단 비싼 편이에요';
    verdictLevel = 'fair';
  } else if (aboveN && belowR) {
    verdict = '역대 기준보단 비싸지만 요즘보단 싼 편이에요';
    verdictLevel = 'fair';
  } else {
    verdict = '역대·요즘 기준과 비슷해요';
    verdictLevel = 'fair';
  }
  return { level, verdict, verdictLevel, check, belowN, aboveN, belowR, aboveR };
}

/** rec-card 안내문 — 두 기준 비교(숫자) + 상황별 해석. 케이스마다 결론 문장이 다르다. */
function buyProse(e: ReturnType<typeof evalBuy>, normal: number | null, recentAvg: number | null): string {
  const r = won(recentAvg);
  const n = won(normal);
  let s1: string;
  let s2: string;
  if (e.belowN && e.belowR) {
    s1 = `최근 1년 평균(${r}원)과 평년(${n}원) 모두보다 낮아요`;
    s2 = '오늘이 두 기준 모두보다 낮으니, 지금이 진짜 싼 때예요.';
  } else if (e.aboveN && e.aboveR) {
    s1 = `최근 1년 평균(${r}원)과 평년(${n}원) 모두보다 높아요`;
    s2 = '두 기준 모두보다 높으니, 급하지 않다면 조금 기다려도 좋아요.';
  } else if (e.belowN && e.aboveR) {
    s1 = `평년(${n}원)보단 싸지만, 최근 1년 평균(${r}원)보단 비싸요`;
    s2 = '요즘 시세가 평년보다 낮아진 품목이라, 지금이 특별히 싼 건 아니에요.';
  } else if (e.aboveN && e.belowR) {
    s1 = `평년(${n}원)보단 비싸지만, 최근 1년 평균(${r}원)보단 싸요`;
    s2 = '요즘 오른 품목이라, 최근 흐름 기준으론 살 만한 편이에요.';
  } else {
    s1 = `최근 1년 평균(${r}원)·평년(${n}원)과 비슷한 수준이에요`;
    s2 = '두 기준 모두와 비슷해, 평소 수준이에요.';
  }
  return `${s1}. ${s2}`;
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
  const thisMonthAvg = ready && months![thisMonth] != null ? months![thisMonth]! : null;

  return (
    <View style={styles.flowCard}>
      <View style={styles.flowTitleRow}>
        <Text style={styles.sectionTitle}>작년 가격 흐름</Text>
        {thisMonthAvg != null ? (
          <Text style={styles.flowThisMonth}>
            {thisMonth + 1}월 평균 <Text style={tabularNums}>{won(Math.round(thisMonthAvg))}</Text>원
          </Text>
        ) : null}
      </View>
      {ready ? (
        <>
          {bars}
          {varietyCaption ? (
            <Text style={styles.flowCaption}>{varietyCaption}</Text>
          ) : (
            <Text style={styles.flowCaption}>{seasonText}.</Text>
          )}
          {valid.length < 12 && (
            <Text style={styles.flowCaption}>· 자료가 없는 달은 비워뒀어요 (KAMIS 미조사)</Text>
          )}
        </>
      ) : insufficient ? (
        <Text style={styles.flowCaption}>
          이 품목은 철마다 다른 품종으로 조사돼, 한 해 흐름을 보여줄 자료가 부족해요.
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
                <Text style={[styles.buyPrice, tabularNums]}>{won(m.price)}원</Text>
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

/** main-header type=detail — back + 제목 + 관심(heart) */
function Header({ title, fav, onFav }: { title: string; fav: boolean; onFav: () => void }) {
  const favColor = fav ? colors.iconActive : colors.iconInactive;
  return (
    <View style={styles.header}>
      <Pressable style={styles.iconBtn} onPress={() => router.back()} hitSlop={4}>
        <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <Pressable style={styles.iconBtn} onPress={onFav} hitSlop={4}>
        <Heart size={24} color={favColor} fill={fav ? favColor : 'none'} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgSecondary },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s1,
    gap: spacing.s1,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, ...type.title, color: colors.textPrimary, textAlign: 'left' } as const,
  scroll: { paddingBottom: spacing.s16 },
  content01: { padding: spacing.s4, gap: spacing.s6, backgroundColor: colors.bgCanvas },
  content02: { padding: spacing.s4, gap: spacing.s8, backgroundColor: colors.bgSecondary, flexGrow: 1 },
  whenBuy: { gap: spacing.s4 }, // rec-card·차트·연간흐름 묶음 (16px)
  hero: { gap: spacing.s3 },
  heroBody: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.s3 },
  heroThumb: { width: 100, aspectRatio: 1, borderRadius: radius.m, backgroundColor: colors.bgTertiary, overflow: 'hidden' },
  heroContents: { flex: 1, alignItems: 'flex-start', gap: spacing.s2 },
  heroNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.s2, maxWidth: '100%' },
  heroName: { ...type.title, color: colors.textPrimary, flexShrink: 1 } as const,
  heroSub: { ...type.caption, color: colors.textSecondary } as const,
  price: { ...type.priceXl, color: colors.priceNumber } as const,
  unit: { fontSize: 13, fontFamily: font.regular, color: colors.priceUnit } as const,
  ecoLead: { ...type.body, color: colors.textSecondary } as const,
  // 오늘·최근1년·평년 3값 비교행 + 한 줄 판정
  compareRow: { flexDirection: 'row', gap: spacing.s4, width: '100%' },
  compareCol: { flex: 1, gap: 2 },
  compareLabel: { ...type.caption, color: colors.textTertiary } as const,
  compareValue: { ...type.priceSm, color: colors.textSecondary } as const,
  verdict: { ...type.caption } as const,
  skelValue: { width: 58, height: 18, borderRadius: radius.xs, backgroundColor: colors.bgTertiary },

  sectionTitle: { ...type.title, color: colors.textPrimary } as const,

  // 언제 살까요? rec-card
  whenSection: { gap: spacing.s2 },
  recCard: { backgroundColor: colors.bgElevated, borderRadius: radius.l, padding: spacing.s5, gap: spacing.s3 },
  recTopLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.s2, flexShrink: 1 },
  recBadge: { paddingHorizontal: spacing.s2, paddingVertical: spacing.s1, borderRadius: radius.full },
  recBadgeText: { ...type.label, color: '#ffffff' } as const,
  recHeadline: { ...type.title, flexShrink: 1 } as const,
  recProse: { ...type.body, color: colors.textSecondary } as const,
  // 스켈레톤 — 추천 확정 전 자리 채움(뒤집힘 방지)
  skelChip: { width: 84, height: 26, borderRadius: radius.full, backgroundColor: colors.bgTertiary },
  skelBadge: { width: 46, height: 24, borderRadius: radius.full, backgroundColor: colors.bgTertiary },
  skelHeadline: { width: 150, height: 22, borderRadius: radius.s, backgroundColor: colors.bgTertiary },
  skelLine: { width: '85%', height: 16, borderRadius: radius.s, backgroundColor: colors.bgTertiary },
  skelChart: { height: 140, borderRadius: radius.m, backgroundColor: colors.bgTertiary },

  chartCard: { backgroundColor: colors.bgElevated, borderRadius: radius.m, padding: spacing.s5, gap: spacing.s4 },
  chartTitle: { ...type.title, color: colors.textPrimary } as const,
  chartFootnote: { ...type.caption, color: colors.textTertiary } as const,
  // 차트 범례 — 라인 샘플(12px) + 라벨
  chartLegend: { gap: 2 },
  legendRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.s2 },
  legendLine: { width: 12, height: 0, marginTop: 8 },

  // 연간 가격 흐름
  flowCard: { backgroundColor: colors.bgElevated, borderRadius: radius.l, padding: spacing.s5, gap: spacing.s4 },
  flowTitleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.s2 },
  flowThisMonth: { ...type.caption, color: colors.textSecondary } as const,
  flowBars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 60, paddingHorizontal: spacing.s2 },
  flowCol: { alignItems: 'center', gap: spacing.s1 },
  flowBar: { width: 12, borderRadius: 4 },
  flowLabel: { ...type.caption, color: colors.textTertiary } as const,
  flowCaption: { ...type.caption, color: colors.textTertiary } as const,

  source: { ...type.caption, color: colors.textTertiary, textAlign: 'center' } as const,
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
  buyName: { ...type.body, color: colors.textPrimary, flex: 1 } as const,
  buyPrice: { ...type.priceSm, color: colors.priceNumber } as const,
  buyDivider: { height: 1, backgroundColor: colors.borderDefault },
  buyCaption: { ...type.caption, color: colors.textTertiary } as const,
});
