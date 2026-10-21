import { router, type Href } from 'expo-router';
import Head from 'expo-router/head';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../components/igb/EmptyState';
import { GlassHeader } from '../../components/igb/GlassHeader';
import { SearchField } from '../../components/igb/SearchField';
import { SignalChip } from '../../components/igb/SignalChip';
import { Wordmark } from '../../components/igb/Wordmark';
import { RegionPill } from '../../components/igb/RegionPill';
import { useDisplayItems } from '../../store/itemView';
import { Image } from 'expo-image';
import { findItem, recipeHero, searchRecipes, titleMatches, setViewedRecipes, useRecipes, type Recipe, recipeSlug } from '../../recipes';
import { colors, font, radius, spacing, type } from '../../theme/tokens';
import { OG_DEFAULT_IMAGE } from '../../og';

const LEVEL_WORD = { cheap: '싸요', fair: '적당해요', expensive: '비싸요' } as const;

export default function RecipesScreen() {
  // 홈과 같은 판정·지역 가격 — 원값(usePrices)을 쓰면 지역을 골라도 전국 신호가 나왔다(2026-10-22).
  const { items, baseLabel } = useDisplayItems();
  const recipeList = useRecipes();
  // 초기값 = 홈과 같은 헤더(44)+검색 — 0이면 SSG 콘텐츠가 하이드레이션 때 밀린다(홈 CLS 주석 참고). onLayout이 보정.
  const [topH, setTopH] = useState(100);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Recipe[] | null>(null); // null = 검색 안 함(기본 목록)

  // 검색 — 입력 디바운스(300ms). 빈 쿼리면 기본 목록.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults(null);
      return;
    }
    let alive = true;
    const t = setTimeout(() => {
      searchRecipes(q).then((rs) => alive && setResults(rs));
    }, 300);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query]);

  const searching = results != null;
  const cards = useMemo(() => {
    const base = results ?? recipeList;
    const all = base.map((r) => {
      const matched = r.ingredients
        .map((ing) => ({ name: ing.name, item: findItem(items, ing.name, ing.raw, r.title) }))
        .filter((m) => m.item != null);
      const cheapCount = matched.filter((m) => m.item!.level === 'cheap').length;
      return { ...r, matched, cheapCount };
    });
    // 싼 재료 많은 순 → 동률이면 비싼 재료 적은 순. (비싼 재료 있어도 제외 안 함 — 빈 목록 방지)
    const exCount = (c: (typeof all)[number]) => c.matched.filter((m) => m.item!.level === 'expensive').length;
    const byCheap = (arr: typeof all) =>
      arr.slice().sort((a, b) => b.cheapCount - a.cheapCount || exCount(a) - exCount(b));
    // 검색: 전부. 기본: 싼 재료 ≥1개인 것 우선, 하나도 없으면 전체(빈 목록 방지).
    // 검색은 레시피명이 맞는 것 먼저 — '구운 주먹밥'을 쳤는데 재료만 맞는 레시피 뒤로 밀리지 않게. 그 안에선 싼 재료 순.
    if (searching) {
      const q = query.trim();
      const sorted = byCheap(all);
      return [...sorted.filter((c) => titleMatches(c, q)), ...sorted.filter((c) => !titleMatches(c, q))];
    }
    const withCheap = all.filter((c) => c.cheapCount >= 1);
    return byCheap(withCheap.length ? withCheap : all);
  }, [items, recipeList, results, searching, query]);

  // 상세가 인덱스로 참조하는 '현재 목록'을 화면이 보여주는 순서와 일치시킨다.
  useEffect(() => {
    setViewedRecipes(cards);
  }, [cards]);

  return (
    <View style={styles.screen}>
      <Head>
        <title>오늘 싼 재료로 만드는 레시피 | 이거비싸?</title>
        <meta name="description" content="오늘 시세가 싼 재료를 쓰는 레시피를 골라드려요. 재료별 가격 신호와 함께 확인하세요." />
        <link rel="canonical" href="https://igeobissa.com/recipes" />
        <meta property="og:url" content="https://igeobissa.com/recipes" />
              <meta property="og:title" content="오늘 싼 재료로 만드는 레시피 | 이거비싸?" />
        <meta property="og:description" content="오늘 시세가 싼 재료를 쓰는 레시피를 골라드려요. 재료별 가격 신호와 함께 확인하세요." />
        <meta name="twitter:title" content="오늘 싼 재료로 만드는 레시피 | 이거비싸?" />
        <meta name="twitter:description" content="오늘 시세가 싼 재료를 쓰는 레시피를 골라드려요. 재료별 가격 신호와 함께 확인하세요." />
      <meta property="og:image" content={OG_DEFAULT_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:image" content={OG_DEFAULT_IMAGE} />
      </Head>
      <GlassHeader onHeight={setTopH}>
        {/* 홈과 같은 메인 헤더 — 레시피 판정도 고른 지역 가격을 따른다(2026-10-22). */}
        <View style={styles.header}>
          <Wordmark />
          <RegionPill />
        </View>
        {/* 검색창도 홈처럼 헤더 안(사방 16) — 본문 첫 줄에 두면 paddingTop이 topH로 덮여 헤더에 붙었다(2026-10-22). */}
        <View style={styles.searchWrap}>
          <SearchField
            value={query}
            onChangeText={setQuery}
            onClear={() => setQuery('')}
            placeholder="감자, 두부, 계란…"
          />
        </View>
      </GlassHeader>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: topH }]} keyboardShouldPersistTaps="handled">
        {searching && cards.length === 0 ? (
          <EmptyState
            title={`'${query.trim()}' 검색 결과가 없어요`}
            description="다른 재료로 찾아 보세요."
          />
        ) : (
        <>
        <Text style={styles.title}>{searching ? `'${query.trim()}' 검색 결과` : '이번 주 장보기 레시피'}</Text>
        <Text style={styles.intro}>
          {searching
            ? `'${query.trim()}'(으)로 레시피 ${cards.length}개를 찾았어요`
            : `${baseLabel}보다 싼 재료로 만들 수 있는 레시피를 골라봤어요`}
        </Text>
        {cards.map((r, idx) => (
          <Pressable
            key={`${r.title}-${idx}`}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
            onPress={() => router.push(`/recipe/${encodeURIComponent(recipeSlug(r.title))}` as Href)}
          >
            <View style={styles.media}>
              {recipeHero(r) != null && (
                <Image source={recipeHero(r)!} style={StyleSheet.absoluteFill} contentFit="cover" />
              )}
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{r.title}</Text>
              <View style={styles.chips}>
                {r.matched.slice(0, 3).map((m) => (
                  <SignalChip
                    key={m.name}
                    level={m.item!.level!}
                    label={`${m.name} ${LEVEL_WORD[m.item!.level!]}`}
                  />
                ))}
              </View>
              <Text style={styles.caption}>
                {r.matched.length > 0
                  ? r.cheapCount > 0
                    ? `재료 ${r.matched.length}개 중 ${r.cheapCount}개가 ${baseLabel}보다\u00A0싸요`
                    : '지금 담으면 무난한 가격이에요'
                  : '재료 시세를 불러오는 중이에요'}
              </Text>
            </View>
          </Pressable>
        ))}
        <Text style={styles.source}>자료 출처 · 식품의약품안전처 조리식품 레시피 DB</Text>
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
    justifyContent: 'space-between',
    paddingLeft: spacing.s4,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  searchWrap: { padding: spacing.s4 },
  content:{ padding: spacing.s4, gap: spacing.s3, paddingBottom: 140 },
  source: { ...type.size[13], ...type.w.regular, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.s2 } as const,
  title: { ...type.size[20], ...type.w.bold, color: colors.textPrimary } as const,
  intro: { ...type.size[15], ...type.w.regular, color: colors.textSecondary } as const,
  card: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.m,
    overflow: 'hidden',
    backgroundColor: colors.bgCanvas,
  },
  media: { height: 140, backgroundColor: colors.bgTertiary },
  cardBody: { padding: spacing.s3, gap: spacing.s2 },
  cardTitle: { ...type.size[17], ...type.w.semibold, color: colors.textPrimary } as const,
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s1 },
  caption: { ...type.size[13], ...type.w.regular, color: colors.textTertiary } as const,
});
