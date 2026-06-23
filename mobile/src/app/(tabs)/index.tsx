import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
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
import { colors, font, palette, radius, signal, SignalLevel, spacing, tabularNums, type } from '../../theme/tokens';

const CHIP_LABEL = { cheap: '할인율 1위', fair: '평소 수준이에요', expensive: '비싼 편이에요' } as const;
// 두 기준 판정 배지 — 상세 rec-card와 동일 어휘
const BADGE = { cheap: 'BEST', fair: 'FAIR', expensive: 'WAIT' } as const;

/** Figma hero-verdict-card 1:1 — level은 사전계산(평년+최근1년) 우선, 없으면 item.level(평년) */
function HeroVerdictCard({ item, level }: { item: PriceItem; level: SignalLevel }) {
  const c = signal[level];
  const pct = Math.abs(item.vsNormalPct ?? 0);
  const verdictTail =
    level === 'cheap' ? `${pct}% 싸요` : level === 'expensive' ? `${pct}% 비싸요` : '평소 가격이에요';
  return (
    <Pressable
      style={({ pressed }) => [styles.heroCard, pressed && { opacity: 0.85 }]}
      onPress={() => router.push(`/item/${itemKey(item)}`)}
      accessibilityRole="button"
      accessibilityLabel={`${item.itemName} 시세 자세히 보기`}
    >
      <View style={styles.heroTopRow}>
        <SignalChip level={level} label={CHIP_LABEL[level]} />
        <Text style={styles.captionGrey}>오늘 · KAMIS 소매</Text>
      </View>

      {/* Figma: 평가문구는 카드 상단 풀폭 */}
      <Text style={styles.verdict}>
        오늘은 {item.itemName}
        {subjectParticle(item.itemName)} 평소보다{'\n'}
        <Text style={{ color: c.main, textDecorationLine: 'underline' }}>{verdictTail}</Text>
      </Text>

      <View style={styles.heroMediaRow}>
        {/* Figma hero-verdict-card: 좌측 1:1 썸네일 (없으면 bgTertiary placeholder) */}
        <View style={styles.heroThumb}>
          {thumbFor(item) != null && (
            <Image source={thumbFor(item)} style={StyleSheet.absoluteFill} contentFit="cover" />
          )}
        </View>
        {/* 우측 칼럼: 가격·캡션은 위, 자세히보기 링크는 아래 (space-between) */}
        <View style={styles.heroPriceCol}>
          <View style={styles.heroPriceBlock}>
            <Text style={[styles.heroPrice, tabularNums]}>{won(item.today)}원</Text>
            <View>
              <Text style={styles.captionSecondary}>{item.kindName || item.unit}</Text>
              <Text style={styles.captionSecondary}>평년 평균 {won(item.normal)}원</Text>
            </View>
          </View>
          {/* 전체 카드가 탭 영역 — 시각적 힌트만, 별도 onPress 없음 */}
          <View style={styles.heroDetailLink}>
            <Text style={styles.heroDetailLabel}>자세히보기</Text>
            <ChevronRight size={16} color={palette.brandPrimary} strokeWidth={2} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

/** Figma thumbnail-card 1:1 — 사진(placeholder) + xs solid 칩(%·변동없음) + 품명/규격/가격 */
function ThumbnailCard({ item, width, level }: { item: PriceItem; width?: number; level: SignalLevel }) {
  // 이름 아래에는 규격만 — kindName이 "양파(1kg)"처럼 품목명을 포함하므로 제거.
  // 전체가 괄호로 감싸졌을 때만 벗긴다 ("봄(1포기)"의 닫는 괄호 오절단 방지).
  let spec = item.kindName.replace(item.itemName, '').trim();
  if (spec.startsWith('(') && spec.endsWith(')')) spec = spec.slice(1, -1);
  if (!spec) spec = item.unit;
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
          <SignalChip level={level} size="xs" label={BADGE[level]} />
        </View>
      </View>
      <View>
        <Text style={styles.thumbName} numberOfLines={1}>
          {item.itemName}
        </Text>
        <Text style={styles.captionGrey} numberOfLines={1}>
          {spec}
        </Text>
        <Text style={[styles.thumbPrice, tabularNums]} numberOfLines={1}>
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
                <Text style={styles.sectionTitle}>{expanded ? '전체 시세' : '이번 주 주목할 시세'}</Text>
                <View
                  style={styles.grid}
                  onLayout={(e) => setGridW(e.nativeEvent.layout.width)}
                >
                  {notable.map((i) => (
                    <ThumbnailCard key={itemKey(i)} item={i} width={colW} level={lvlOf(i)} />
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
  heroPriceCol: { flex: 1, justifyContent: 'space-between' },
  heroPriceBlock: { gap: spacing.s2 },
  heroDetailLink: { flexDirection: 'row', alignItems: 'center', gap: spacing.s2 },
  heroDetailLabel: { ...type.buttonS, color: palette.brandPrimary } as const,
  verdict: { ...type.signalLead, color: colors.textPrimary } as const,
  heroPrice: { ...type.priceXl, color: colors.priceNumber } as const,
  captionGrey: { ...type.caption, color: colors.textTertiary } as const,
  captionSecondary: { ...type.caption, color: colors.textSecondary } as const,

  outerCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.l,
    padding: spacing.s4,
    gap: spacing.s3,
  },
  sectionTitle: { ...type.title, color: colors.textPrimary } as const,
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
  thumbName: { fontSize: 13, fontFamily: font.semibold, color: colors.textPrimary },
  thumbPrice: { ...type.priceSm, color: colors.priceNumber } as const,
  thumbUnit: { fontSize: 13, fontFamily: font.regular, color: colors.priceUnit },
  secondaryBtn: {
    height: 40,
    borderRadius: radius.s,
    backgroundColor: colors.bgSecondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s2,
  },
  secondaryBtnLabel: { ...type.buttonM, color: colors.textPrimary } as const,
  source: { ...type.caption, color: colors.textTertiary, textAlign: 'center' } as const,
});
