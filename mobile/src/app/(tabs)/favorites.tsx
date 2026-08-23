import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import Head from 'expo-router/head';
import { ChevronRight, Heart } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../components/igb/EmptyState';
import { GlassHeader } from '../../components/igb/GlassHeader';
import { PriceListRow } from '../../components/igb/PriceListRow';
import { Wordmark } from '../../components/igb/Wordmark';
import { fetchRecipeByTitle, recipeHero, setViewedRecipes, useRecipes, type Recipe } from '../../recipes';
import { useFavorites } from '../../store/favorites';
import { itemKey, usePrices } from '../../store/prices';
import { colors, font, radius, spacing, type } from '../../theme/tokens';
import { OG_DEFAULT_IMAGE } from '../../og';

export default function FavoritesScreen() {
  const { resolve } = usePrices();
  const { keys } = useFavorites();
  const recipeList = useRecipes();
  const [topH, setTopH] = useState(0);

  // 저장된 키 → 오늘 품목. 정확 일치 없으면 같은 itemCode 대표로 폴백(대표 단위는 매일 바뀜).
  // recipe: 키는 itemCode 폴백에 안 걸리므로(품목 코드 아님) 자연히 제외된다.
  const favorites = useMemo(
    () => keys.map((k) => resolve(k)).filter((i) => i != null),
    [keys, resolve],
  );
  // 관심 레시피 — 키 'recipe:{제목}'. 복원은 원천인 식약처 레시피 DB 라이브 재조회(주간 목록에 없어도 뜸).
  // 구버전 'recipe:{인덱스}' 키는 어떤 목록의 인덱스였는지 알 수 없어(오표시 원인) 표시하지 않는다.
  const [fetched, setFetched] = useState<Record<string, Recipe>>({});
  useEffect(() => {
    const titles = keys
      .filter((k) => k.startsWith('recipe:'))
      .map((k) => k.slice('recipe:'.length))
      .filter((t) => !/^\d+$/.test(t));
    if (!titles.length) return;
    let alive = true;
    Promise.all(
      titles.map(async (t) => [t, recipeList.find((r) => r.title === t) ?? (await fetchRecipeByTitle(t))] as const),
    ).then((entries) => {
      if (alive) setFetched(Object.fromEntries(entries.filter(([, r]) => r != null)) as Record<string, Recipe>);
    });
    return () => {
      alive = false;
    };
  }, [keys, recipeList]);
  const favRecipes = useMemo(
    () =>
      keys
        .filter((k) => k.startsWith('recipe:'))
        .map((k) => ({ key: k, recipe: fetched[k.slice('recipe:'.length)] }))
        .filter((r) => r.recipe != null),
    [keys, fetched],
  );

  const isEmpty = favorites.length === 0 && favRecipes.length === 0;

  return (
    <View style={styles.screen}>
      <Head>
        <title>관심 품목 시세 | 이거비싸?</title>
        <meta name="description" content="관심 등록한 품목의 오늘 가격과 평년 대비 변화를 한 화면에서 확인하세요." />
        <link rel="canonical" href="https://igeobissa.com/favorites" />
        <meta property="og:url" content="https://igeobissa.com/favorites" />
              <meta property="og:title" content="관심 품목 시세 | 이거비싸?" />
        <meta property="og:description" content="관심 등록한 품목의 오늘 가격과 평년 대비 변화를 한 화면에서 확인하세요." />
        <meta name="twitter:title" content="관심 품목 시세 | 이거비싸?" />
        <meta name="twitter:description" content="관심 등록한 품목의 오늘 가격과 평년 대비 변화를 한 화면에서 확인하세요." />
      <meta property="og:image" content={OG_DEFAULT_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:image" content={OG_DEFAULT_IMAGE} />
      </Head>
      <GlassHeader onHeight={setTopH}>
        <View style={styles.header}>
          <Wordmark />
        </View>
      </GlassHeader>

      <ScrollView contentContainerStyle={[styles.content, { paddingTop: topH }]}>
        {isEmpty ? (
          <EmptyState
            icon={Heart}
            title="아직 관심 목록이 없어요"
            description="상세 화면에서 하트를 누르면 여기에 모여요"
          />
        ) : (
          <View style={styles.sections}>
            {favorites.length > 0 && (
              <View>
                <View style={styles.sectionHead}>
                  <Text style={styles.sectionTitle}>관심 품목</Text>
                  <Text style={styles.count}>{favorites.length}개</Text>
                </View>
                {favorites.map((i, idx) => (
                  <View key={itemKey(i!)}>
                    {idx > 0 && <View style={styles.divider} />}
                    <PriceListRow
                      name={i!.itemName}
                      price={i!.today}
                      unit={i!.unit}
                      level={i!.level}
                      itemCode={i!.itemCode}
                      onPress={() => router.push(`/item/${itemKey(i!)}`)}
                    />
                  </View>
                ))}
                {/* 출처는 KAMIS 시세(관심 품목)에만 해당 */}
                <Text style={styles.source}>
                  자료 출처 · KAMIS (한국농수산식품유통공사) 매일 오후 4시 갱신
                </Text>
              </View>
            )}

            {favRecipes.length > 0 && (
              <View>
                <View style={styles.sectionHead}>
                  <Text style={styles.sectionTitle}>관심 레시피</Text>
                  <Text style={styles.count}>{favRecipes.length}개</Text>
                </View>
                {favRecipes.map(({ key, recipe }, idx) => (
                  <View key={key}>
                    {idx > 0 && <View style={styles.divider} />}
                    <Pressable
                      style={({ pressed }) => [styles.recipeRow, pressed && { opacity: 0.6 }]}
                      onPress={() => {
                        // 상세는 '현재 목록'을 인덱스로 읽는다 — 관심 레시피 배열을 그 목록으로 세팅하고 이동.
                        setViewedRecipes(favRecipes.map((f) => f.recipe!));
                        router.push(`/recipe/${idx}` as Href);
                      }}
                    >
                      <View style={styles.recipeThumb}>
                        {recipeHero(recipe!) != null && (
                          <Image
                            source={recipeHero(recipe!)!}
                            style={StyleSheet.absoluteFill}
                            contentFit="cover"
                          />
                        )}
                      </View>
                      <Text style={styles.recipeName} numberOfLines={1}>
                        {recipe!.title}
                      </Text>
                      <ChevronRight size={20} color={colors.textTertiary} strokeWidth={2} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
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
  wordmark: { fontSize: 20, fontFamily: font.extrabold, color: colors.textPrimary },
  content: { padding: spacing.s4, paddingBottom: 140 },
  sections: { gap: spacing.s6 },
  // 관심 품목 / 관심 레시피 — 동일 위계 섹션 헤더
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.s2,
  },
  sectionTitle: { ...type.size[20], ...type.w.bold, color: colors.textPrimary } as const,
  count: { ...type.size[13], ...type.w.regular, color: colors.textTertiary } as const,
  // Figma favorites: 행 사이 8px 간격 + 1px divider
  divider: { height: 1, backgroundColor: colors.borderDefault, marginVertical: spacing.s2 },
  source: {
    ...type.size[13], ...type.w.regular,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.s6,
  } as const,
  // 관심 레시피 행 — 40 썸네일 + 제목 + chevron
  recipeRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.s3 },
  recipeThumb: { width: 40, height: 40, borderRadius: radius.s, backgroundColor: colors.bgTertiary, overflow: 'hidden' },
  recipeName: { flex: 1, ...type.size[15], ...type.w.regular, color: colors.textPrimary } as const,
});
