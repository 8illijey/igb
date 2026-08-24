import { router } from 'expo-router';
import Head from 'expo-router/head';
import { ChevronLeft, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { IGButton } from '../components/igb/Buttons';
import { EmptyState } from '../components/igb/EmptyState';
import { GlassHeader } from '../components/igb/GlassHeader';
import { PriceListRow } from '../components/igb/PriceListRow';
import { SearchField } from '../components/igb/SearchField';
import { PriceItem } from '../api/kamis';
import { usePopularity } from '../store/popularity';
import { itemKey, usePrices } from '../store/prices';
import { useRecentSearches } from '../store/recentSearches';
import { colors, palette, radius, spacing, type } from '../theme/tokens';
import { OG_DEFAULT_IMAGE } from '../og';
import { scrollBottomInset } from '../theme/bottomInset';

// 클릭 데이터가 적을 때 채울 큐레이션 인기 품목 (이름 부분일치)
const POPULAR_NAMES = ['삼겹살', '계란', '사과', '바나나', '양파', '대파', '배추', '상추', '우유', '감자', '딸기', '오이'];

export default function SearchScreen() {
  const { items } = usePrices();
  const { recents, add, remove, clear } = useRecentSearches();
  const counts = usePopularity();
  const [query, setQuery] = useState('');
  const [topH, setTopH] = useState(0);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return items.filter((i) => i.itemName.includes(q) || i.kindName.includes(q));
  }, [items, query]);

  // 인기 품목 TOP 10 — 조회수(클릭량) 많은 순. 데이터 부족분은 큐레이션 인기 품목으로 채움.
  const top10 = useMemo(() => {
    const live = items.filter((i) => i.today != null);
    const clicked = live
      .filter((i) => (counts[i.itemCode] ?? 0) > 0)
      .sort((a, b) => (counts[b.itemCode] ?? 0) - (counts[a.itemCode] ?? 0));
    if (clicked.length >= 10) return clicked.slice(0, 10);
    const seen = new Set(clicked.map((i) => i.itemCode));
    const curated = POPULAR_NAMES.map((n) => live.find((i) => i.itemName.includes(n) && !seen.has(i.itemCode))).filter(
      (i): i is PriceItem => i != null,
    );
    return [...clicked, ...curated].slice(0, 10);
  }, [items, counts]);

  return (
    <View style={styles.screen}>
      <Head>
        <title>품목 검색 — 오늘 시세 찾기 | 이거비싸?</title>
        <meta name="description" content="배추·양파·삼겹살·계란 등 농수산물 품목을 검색해 오늘 시세와 평년 대비 가격을 확인하세요." />
        <link rel="canonical" href="https://igeobissa.com/search" />
        <meta property="og:url" content="https://igeobissa.com/search" />
              <meta property="og:title" content="품목 검색 — 오늘 시세 찾기 | 이거비싸?" />
        <meta property="og:description" content="배추·양파·삼겹살·계란 등 농수산물 품목을 검색해 오늘 시세와 평년 대비 가격을 확인하세요." />
        <meta name="twitter:title" content="품목 검색 — 오늘 시세 찾기 | 이거비싸?" />
        <meta name="twitter:description" content="배추·양파·삼겹살·계란 등 농수산물 품목을 검색해 오늘 시세와 평년 대비 가격을 확인하세요." />
      <meta property="og:image" content={OG_DEFAULT_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:image" content={OG_DEFAULT_IMAGE} />
      </Head>
      {/* 헤더 44 — back 44×44 + search-field size s(40) 세로 중앙. 상단 고정 글래스 */}
      <GlassHeader onHeight={setTopH}>
        <View style={styles.header}>
          <Pressable style={styles.back} onPress={() => router.back()} hitSlop={4}>
            <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <SearchField
              size="s"
              value={query}
              onChangeText={setQuery}
              onClear={() => setQuery('')}
              autoFocus
            />
          </View>
        </View>
      </GlassHeader>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topH + spacing.s4 }]}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
      >
        {query.trim() === '' ? (
          // 검색 전 빈 상태 — 최근 검색어 + 평년보다 싼 TOP 10
          <View style={styles.empty}>
            {recents.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHead}>
                  <Text style={styles.sectionTitle}>최근 검색어</Text>
                  <IGButton label="전체 삭제" variant="quiet" size="s" onPress={clear} />
                </View>
                <View style={styles.chips}>
                  {recents.map((term) => (
                    <Pressable key={term} style={styles.chip} onPress={() => setQuery(term)}>
                      <Text style={styles.chipText}>{term}</Text>
                      <Pressable hitSlop={6} onPress={() => remove(term)}>
                        <X size={16} color={colors.textTertiary} strokeWidth={2} />
                      </Pressable>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.rankHead}>
                <Text style={styles.sectionTitle}>인기 품목 TOP 10</Text>
                <Text style={styles.sectionCaption}>많이 찾아본 순</Text>
              </View>
              {top10.map((i, idx) => (
                <View key={itemKey(i)} style={styles.rankRow}>
                  <Text
                    style={[styles.rank, { color: idx < 3 ? palette.brandPrimary : colors.textTertiary }]}
                  >
                    {idx + 1}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <PriceListRow
                      name={i.itemName}
                      price={i.today}
                      unit={i.unit}
                      level={i.level}
                      itemCode={i.itemCode}
                      kindCode={i.kindCode}
                      onPress={() => router.push(`/item/${itemKey(i)}`)}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : results.length === 0 ? (
          <EmptyState
            title="검색 결과가 없어요"
            description="KAMIS에 아직 없는 품목이에요. 다른 품목명으로 검색해 보세요"
          />
        ) : (
          <>
            <Text style={styles.count}>
              ‘{query.trim()}’ 검색 결과 {results.length}건
            </Text>
            {results.map((i, idx) => (
              <View key={itemKey(i)}>
                {idx > 0 && <View style={styles.divider} />}
                <PriceListRow
                  name={i.itemName}
                  price={i.today}
                  unit={i.unit}
                  level={i.level}
                  itemCode={i.itemCode}
                  kindCode={i.kindCode}
                  onPress={() => {
                    // 검색어가 아니라 실제로 선택한 품목명을 최근 검색어로 저장
                    // (예: '배추' 검색 → '얼갈이배추' 선택 시 '얼갈이배추'가 남는다)
                    add(i.itemName);
                    router.push(`/item/${itemKey(i)}`);
                  }}
                />
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgCanvas },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.s1,
    paddingRight: spacing.s4,
    gap: spacing.s1,
  },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.s4, paddingBottom: scrollBottomInset },
  count: { ...type.size[13], ...type.w.regular, color: colors.textTertiary, marginBottom: spacing.s2 } as const,
  divider: { height: 1, backgroundColor: colors.borderDefault },

  // 빈 상태
  empty: { gap: spacing.s6 },
  section: { gap: spacing.s3 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { ...type.size[17], ...type.w.semibold, color: colors.textPrimary } as const,
  sectionCaption: { ...type.size[13], ...type.w.regular, color: colors.textTertiary } as const,
  rankHead: { gap: 2 },
  // 최근 검색어 칩
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s1,
    paddingLeft: spacing.s3,
    paddingRight: spacing.s2,
    paddingVertical: spacing.s2,
    borderRadius: radius.full,
    backgroundColor: colors.bgSecondary,
  },
  chipText: { ...type.size[15], ...type.w.regular, color: colors.textPrimary } as const,
  // TOP10 랭킹 행 — 순위 번호 + price-list-row
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.s2 },
  rank: { ...type.size[13], ...type.w.semibold, width: 20, textAlign: 'center' } as const,
});
