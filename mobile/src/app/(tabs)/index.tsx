import { Image } from 'expo-image';
import { router } from 'expo-router';
import Head from 'expo-router/head';
import Svg, { Path } from 'react-native-svg';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Reanimated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { PriceItem, won } from '../../api/kamis';
import { useVerdicts } from '../../api/verdicts';
import { EmptyState } from '../../components/igb/EmptyState';
import { GlassHeader } from '../../components/igb/GlassHeader';
import { SearchField } from '../../components/igb/SearchField';
import { SignalChip } from '../../components/igb/SignalChip';
import { Wordmark } from '../../components/igb/Wordmark';
import { itemKey, usePrices } from '../../store/prices';
import { thumbFor } from '../../thumbnails';
import { subjectParticle } from '../../utils/korean';
import { colors, font, radius, signal, SignalLevel, spacing, type } from '../../theme/tokens';
import { OG_DEFAULT_IMAGE } from '../../og';
import { PrivacyLink } from '../../components/igb/PrivacyLink';

const CHIP_LABEL = { cheap: '할인율 1위', fair: '평소 수준이에요', expensive: '비싼 편이에요' } as const;

/** 히어로 가격 카운트업 — 첫 도착 1회만 85%→100%를 500ms cubic ease-out으로. reduced motion·비활성 시 즉시 최종값. */
function useCountUp(target: number | null, enabled: boolean): number | null {
  const [v, setV] = useState(target);
  useEffect(() => {
    if (target == null || !enabled) {
      setV(target);
      return;
    }
    const from = Math.round(target * 0.85);
    const t0 = Date.now();
    let raf: number;
    const tick = () => {
      const p = Math.min(1, (Date.now() - t0) / 500);
      const e = 1 - Math.pow(1 - p, 3);
      setV(Math.round(from + (target - from) * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, enabled]);
  return v;
}

// Figma price-right-button (842:4347) 실제 애셋 — 37×37, 굵은 chevron(stroke 3.44).
function PriceChevron() {
  return (
    <Svg width={37} height={37} viewBox="0 0 37 37" fill="none">
      <Path
        d="M9.91187 27.1079L18.5198 18.5L9.91187 9.89209"
        stroke={colors.textPrimary}
        strokeWidth={3.44316}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
// 카드 배지 = 평년 대비 할인율%. cheap은 항상 음수(싸요)라 "주목할 시세"의 차이를 그대로 보여준다.
// (전부 BEST면 정보가 0 → 할인율로 카드끼리 구별. 상세 종합판정은 cheap 게이팅이라 모순 안 남)

/** Figma hero-verdict-card 1:1 — level은 사전계산(평년+최근1년) 우선, 없으면 item.level(평년) */
function HeroVerdictCard({ item, level, animatePrice = false }: { item: PriceItem; level: SignalLevel; animatePrice?: boolean }) {
  const c = signal[level];
  const shownPrice = useCountUp(item.today, animatePrice);
  const pct = Math.abs(item.vsNormalPct ?? 0);
  // 숫자와 판정어 사이는 줄바꿈 안 되는 공백(NBSP).
  // 일반 공백이면 '40% / 싸요'처럼 떨어진다 — word-break: keep-all은 단어 안만 묶고
  // 어절 사이는 그대로 끊기 때문이다(2026-08-25 제보).
  const verdictTail =
    level === 'cheap'
      ? `${pct}%\u00A0싸요`
      : level === 'expensive'
        ? `${pct}%\u00A0비싸요`
        : '평소\u00A0가격이에요';
  // 규격 캡션 — kindName에서 품목명 접두어 제거(토마토(1kg)→1kg). 품종명(다다기계통(10개))은 유지.
  let spec = item.kindName.replace(item.itemName, '').trim();
  if (spec.startsWith('(') && spec.endsWith(')')) spec = spec.slice(1, -1);
  if (!spec) spec = item.unit;
  return (
    <Pressable
      style={({ pressed }) => [styles.heroCard, pressed && { opacity: 0.85 }]}
      onPress={() => router.push(`/item/${itemKey(item)}`)}
      accessibilityRole="button"
      accessibilityLabel={`${item.itemName} 시세 자세히 보기`}
    >
      <View style={styles.heroTopRow}>
        <SignalChip level={level} label={CHIP_LABEL[level]} showArrow />
        <Text style={styles.captionGrey}>오늘 · KAMIS 소매</Text>
      </View>

      {/* Figma: 평가문구는 카드 상단 풀폭.
          줄바꿈을 강제하지 않는다 — 좀은 화면에선 앞 문장이 한 번 더 접혀
          '평균보다 / (빈줄) / 39% 싸요'처럼 떨어졌다(2026-08-24 아이폰 제보).
          그냥 흐르게 두면 폭에 맞춰 알아서 나뉩다. */}
      <Text style={styles.verdict}>
        오늘은 {item.itemName}
        {subjectParticle(item.itemName)} 이맘때 평균보다{' '}
        <Text style={{ color: c.main, textDecorationLine: 'underline' }}>{verdictTail}</Text>
      </Text>

      <View style={styles.heroMediaRow}>
        {/* Figma hero-verdict-card: 좌측 1:1 썸네일 (없으면 bgTertiary placeholder) */}
        <View style={styles.heroThumb}>
          {thumbFor(item) != null && (
            <Image source={thumbFor(item)} style={StyleSheet.absoluteFill} contentFit="cover" />
          )}
        </View>
        {/* 우측 칼럼: 가격+chevron 위, 캡션 아래 (space-between) — Figma title-price */}
        <View style={styles.heroPriceCol}>
          <View style={styles.heroPriceRow}>
            <Text style={styles.heroPrice}>{won(shownPrice)}원</Text>
            <PriceChevron />
          </View>
          <View>
            <Text style={styles.captionSecondary}>{spec}</Text>
            <Text style={styles.captionSecondary}>이맘때 평균 {won(item.normal)}원</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

/** Figma thumbnail-card 1:1 — 사진(placeholder) + xs solid 칩(%·변동없음) + 품명/규격/가격 */
function ThumbnailCard({ item, width }: { item: PriceItem; width?: number }) {
  // 칩 색은 표시한 평년 할인율(%)과 같은 기준으로 묶는다 — 숫자와 색이 따로 놀지 않게(-10%→싸/초록, +53%→비싸/빨강).
  const pct = item.vsNormalPct ?? 0;
  const pctLevel: SignalLevel = pct <= -1 ? 'cheap' : pct >= 1 ? 'expensive' : 'fair';
  return (
    <Pressable
      style={[styles.thumbCard, width != null && { width }]}
      onPress={() => router.push(`/item/${itemKey(item)}`)}
    >
      <View style={styles.thumbMedia}>
        {thumbFor(item) != null && (
          <Image source={thumbFor(item)} style={StyleSheet.absoluteFill} contentFit="cover" />
        )}
        <View style={styles.thumbChip}>
          {/* Figma: 화살표 + 무부호 %(fair는 '변동없음'). 방향은 화살표가 표기. */}
          <SignalChip
            level={pctLevel}
            size="xs"
            showArrow
            label={pctLevel === 'fair' ? '변동없음' : `${Math.abs(pct)}%`}
          />
        </View>
      </View>
      <View>
        <Text style={styles.thumbName} numberOfLines={1}>
          {item.itemName}
        </Text>
        <Text style={styles.thumbPrice} numberOfLines={1}>
          {won(item.today)}원<Text style={styles.thumbUnit}> / {item.unit}</Text>
        </Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { items, loading, error, refresh } = usePrices();
  const verdicts = useVerdicts(); // 사전계산: 평년+최근1년 두 기준 판정 (있으면 우선)
  // 표시 신호 = 사전계산 level(두 기준) 우선, 없으면 item.level(평년)
  // 주목할 시세 섹션 인라인 펼침 — 별도 화면 없이 섹션이 아래로 쌓이고 홈 스크롤로 본다
  const [expanded, setExpanded] = useState(false);
  // 3열 그리드는 컨테이너 폭을 측정해 열 너비를 채운다(고정 %는 480 등에서 우측 여백이 남음).
  const [gridW, setGridW] = useState(0);
  const colW = gridW > 0 ? Math.floor((gridW - spacing.s3 * 2) / 3) : undefined;
  // 상단 고정 글래스 영역 높이 — ScrollView 콘텐츠를 그만큼 내려 가려지지 않게
  const [topH, setTopH] = useState(0);

  const lvlOf = (i: PriceItem) => verdicts[itemKey(i)]?.level ?? i.level;

  // 진입 연출 게이트 — 스피너를 실제로 본 첫 도착 1회만. 캐시 즉시 페인트·당겨서 새로고침·펼침엔 연출 없음.
  const reduced = useReducedMotion();
  const sawSpinner = useRef(false);
  const didAnimate = useRef(false);
  if (loading && items.length === 0) sawSpinner.current = true;
  const animateEntrance = sawSpinner.current && !didAnimate.current && !reduced && items.length > 0;
  useEffect(() => {
    if (animateEntrance) didAnimate.current = true;
  });
  const ORDER = { cheap: 0, fair: 1, expensive: 2 } as const;
  // 전체 품목 — BEST(싸) → FAIR(적정) → WAIT(비싸) 순, 같은 등급 내 평년 대비 낮은 순.
  const ranked = useMemo(
    () =>
      items
        .filter((i) => i.today != null && i.vsNormalPct != null && lvlOf(i) != null)
        .sort((a, b) => {
          const d = ORDER[lvlOf(a)!] - ORDER[lvlOf(b)!];
          return d !== 0 ? d : (a.vsNormalPct ?? 0) - (b.vsNormalPct ?? 0);
        }),
    [items, verdicts],
  );
  const movers = useMemo(() => ranked.filter((i) => lvlOf(i) === 'cheap'), [ranked, verdicts]);
  const hero = movers[0] ?? null; // 가장 싼 BEST 품목
  const allRest = useMemo(() => ranked.filter((i) => i !== hero), [ranked, hero]);
  const deals = useMemo(() => movers.filter((i) => i !== hero), [movers, hero]);
  // 접힘: 주목할 시세(BEST) 6개 / 펼침: 전체 품목.
  const notable = expanded ? allRest : (deals.length ? deals : allRest).slice(0, 6);

  return (
    <View style={styles.screen}>
      {/* 홈 제목·설명 — 라우트가 <Head>를 안 주면 helmet이 빈 <title>을 심어 전 페이지 제목이 빈다. */}
      <Head>
        <title>오늘 장보기 시세를 한눈에 | 이거비싸?</title>
        <meta
          name="description"
          content="배추·양파·삼겹살·계란 등 82개 품목의 오늘 가격. 이맘때 평년과 비교해 지금 사도 되는 값인지 알려드려요. 소매·도매·유기농 시세 제공."
        />
        <link rel="canonical" href="https://igeobissa.com/" />
        {/* og:title·description은 +html.tsx에서 뺐으므로 라우트가 반드시 채워야 한다.
            안 채우면 카톡·슬랙 공유 시 제목 없는 카드가 뜬다. */}
        <meta property="og:title" content="오늘 장보기 시세를 한눈에 | 이거비싸?" />
        <meta
          property="og:description"
          content="배추·양파·삼겹살·계란 등 82개 품목의 오늘 가격. 이맘때 평년과 비교해 지금 사도 되는 값인지 알려드려요."
        />
        <meta property="og:url" content="https://igeobissa.com/" />
        <meta name="twitter:title" content="오늘 장보기 시세를 한눈에 | 이거비싸?" />
        <meta
          name="twitter:description"
          content="배추·양파·삼겹살·계란 등 82개 품목의 오늘 가격. 이맘때 평년과 비교해 지금 사도 되는 값인지 알려드려요."
        />
      <meta property="og:image" content={OG_DEFAULT_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:image" content={OG_DEFAULT_IMAGE} />
      </Head>      {/* 상단 고정 글래스 — 워드마크 + 검색 입구. 콘텐츠가 아래로 스크롤되며 블러됨 */}
      <GlassHeader onHeight={setTopH}>
        <View style={styles.header}>
          <Wordmark />
        </View>
        <View style={styles.searchWrap}>
          <SearchField editable={false} onPress={() => router.push('/search')} />
        </View>
      </GlassHeader>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topH }]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        {/* content-02: grey-50 무대 — 흰 카드들이 배경 대비로 분리 (보더 없음) */}
        <View style={styles.content02}>
        {loading && items.length === 0 ? (
          <ActivityIndicator style={{ marginTop: spacing.s10 }} color={colors.textTertiary} />
        ) : error && items.length === 0 ? (
          <EmptyState title="시세를 불러오지 못했어요" description="아래로 당겨 다시 시도해 보세요" />
        ) : (
          <>
            {hero &&
              (animateEntrance ? (
                <Reanimated.View entering={FadeInDown.duration(300)}>
                  <HeroVerdictCard item={hero} level={lvlOf(hero)} animatePrice />
                </Reanimated.View>
              ) : (
                <HeroVerdictCard item={hero} level={lvlOf(hero)} />
              ))}

            {notable.length > 0 && (
              <View style={styles.outerCard}>
                <Text style={styles.sectionTitle}>이번 주 주목할 시세</Text>
                <View
                  style={styles.grid}
                  onLayout={(e) => setGridW(e.nativeEvent.layout.width)}
                >
                  {notable.map((i, n) =>
                    animateEntrance ? (
                      <Reanimated.View key={itemKey(i)} entering={FadeInDown.duration(300).delay(60 + n * 40)}>
                        <ThumbnailCard item={i} width={colW} />
                      </Reanimated.View>
                    ) : (
                      <ThumbnailCard key={itemKey(i)} item={i} width={colW} />
                    ),
                  )}
                </View>
                <Pressable
                  style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.85 }]}
                  onPress={() => setExpanded((v) => !v)}
                >
                  <Text style={styles.secondaryBtnLabel}>{expanded ? '접기' : '전체보기'}</Text>
                </Pressable>
              </View>
            )}

            <Text style={styles.source}>
              자료 출처 · KAMIS (한국농수산식품유통공사){'\n'}매일 오후 4시 갱신
            </Text>
            <PrivacyLink />
          </>
        )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgSecondary },
  searchWrap: { paddingHorizontal: spacing.s4, paddingBottom: spacing.s2 },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: spacing.s4,
  },
  wordmark: { fontSize: 20, fontFamily: font.extrabold, color: colors.textPrimary },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 140 },
  content01: { padding: spacing.s4, backgroundColor: colors.bgCanvas },
  content02: {
    padding: spacing.s4,
    gap: spacing.s4,
    backgroundColor: colors.bgSecondary,
    flexGrow: 1,
  },

  heroCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.l,
    padding: spacing.s4,
    gap: spacing.s2,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sourceCaption: { flexDirection: 'row', alignItems: 'center', gap: spacing.s1 },
  // Figma media-row: 120 썸네일 + 우측 칼럼(stretch) — 칼럼이 썸네일 높이를 채워 space-between 동작
  heroMediaRow: { flexDirection: 'row', alignItems: 'stretch', gap: spacing.s3 },
  heroThumb: { width: 120, aspectRatio: 1, borderRadius: radius.m, backgroundColor: colors.bgTertiary, overflow: 'hidden' },
  heroPriceCol: { flex: 1, justifyContent: 'space-between', paddingVertical: spacing.s1 }, // Figma title-price py-4
  heroPriceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.s1 },
  verdict: { ...type.size[22], ...type.w.bold, color: colors.textPrimary } as const,
  heroPrice: { ...type.size[28], ...type.w.bold, color: colors.priceNumber } as const,
  captionGrey: { ...type.size[13], ...type.w.regular, color: colors.textTertiary } as const,
  captionSecondary: { ...type.size[13], ...type.w.regular, color: colors.textSecondary } as const,

  outerCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.l,
    padding: spacing.s4,
    gap: spacing.s3,
  },
  sectionTitle: { ...type.size[17], ...type.w.semibold, color: colors.textPrimary } as const,
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s3 },
  // flexGrow 금지 — 마지막 줄 1~2개일 때 칸이 늘어나지 않고 3칸 너비 유지
  thumbCard: { width: '30.5%', gap: spacing.s2 },
  thumbMedia: {
    aspectRatio: 1,
    borderRadius: radius.m,
    backgroundColor: colors.bgTertiary,
    overflow: 'hidden',
  },
  thumbChip: { position: 'absolute', left: spacing.s2, top: spacing.s2 }, // Figma: (8,8) 좌상단
  thumbName: { ...type.size[13], ...type.w.semibold, color: colors.textPrimary } as const,
  thumbPrice: { ...type.size[15], ...type.w.semibold, color: colors.priceNumber } as const,
  thumbUnit: { ...type.size[13], ...type.w.regular, color: colors.priceUnit } as const,
  secondaryBtn: {
    height: 40,
    borderRadius: radius.s,
    backgroundColor: colors.bgSecondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s2,
  },
  secondaryBtnLabel: { ...type.size[15], ...type.w.semibold, color: colors.textPrimary } as const,
  source: { ...type.size[13], ...type.w.regular, color: colors.textTertiary, textAlign: 'center' } as const,
});
