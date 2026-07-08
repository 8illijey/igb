import { Image } from 'expo-image';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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

const CHIP_LABEL = { cheap: '할인율 1위', fair: '평소 수준이에요', expensive: '비싼 편이에요' } as const;

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
function HeroVerdictCard({ item, level }: { item: PriceItem; level: SignalLevel }) {
  const c = signal[level];
  const pct = Math.abs(item.vsNormalPct ?? 0);
  const verdictTail =
    level === 'cheap' ? `${pct}% 싸요` : level === 'expensive' ? `${pct}% 비싸요` : '평소 가격이에요';
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

      {/* Figma: 평가문구는 카드 상단 풀폭 */}
      <Text style={styles.verdict}>
        오늘은 {item.itemName}
        {subjectParticle(item.itemName)} 이맘때 평균보다{'\n'}
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
            <Text style={styles.heroPrice}>{won(item.today)}원</Text>
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
      {/* 상단 고정 글래스 — 워드마크 + 검색 입구. 콘텐츠가 아래로 스크롤되며 블러됨 */}
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
            {hero && <HeroVerdictCard item={hero} level={lvlOf(hero)} />}

            {notable.length > 0 && (
              <View style={styles.outerCard}>
                <Text style={styles.sectionTitle}>이번 주 주목할 시세</Text>
                <View
                  style={styles.grid}
                  onLayout={(e) => setGridW(e.nativeEvent.layout.width)}
                >
                  {notable.map((i) => (
                    <ThumbnailCard key={itemKey(i)} item={i} width={colW} />
                  ))}
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
