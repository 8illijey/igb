import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { ChevronRight, Heart } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../components/igb/EmptyState';
import { GlassHeader } from '../../components/igb/GlassHeader';
import { PriceListRow } from '../../components/igb/PriceListRow';
import { Wordmark } from '../../components/igb/Wordmark';
import { recipeImage, useRecipes } from '../../recipes';
import { useFavorites } from '../../store/favorites';
import { itemKey, usePrices } from '../../store/prices';
import { colors, font, radius, spacing, type } from '../../theme/tokens';

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
  // 관심 레시피 — 키가 'recipe:{id}' 형태. 상세 화면 하트로 담는다.
  const favRecipes = useMemo(
    () =>
      keys
        .filter((k) => k.startsWith('recipe:'))
        .map((k) => ({ id: Number(k.slice('recipe:'.length)), recipe: recipeList[Number(k.slice('recipe:'.length))] }))
        .filter((r) => r.recipe != null),
    [keys, recipeList],
  );

  const isEmpty = favorites.length === 0 && favRecipes.length === 0;

  return (
    <View style={styles.screen}>
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
                {favRecipes.map(({ id, recipe }, idx) => (
                  <View key={`recipe:${id}`}>
                    {idx > 0 && <View style={styles.divider} />}
                    <Pressable
                      style={({ pressed }) => [styles.recipeRow, pressed && { opacity: 0.6 }]}
                      onPress={() => router.push(`/recipe/${id}` as Href)}
                    >
                      <View style={styles.recipeThumb}>
                        {recipeImage(recipe!.title) != null && (
                          <Image
                            source={recipeImage(recipe!.title)}
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
  sectionTitle: { ...type.h2, color: colors.textPrimary } as const,
  count: { ...type.caption, color: colors.textTertiary } as const,
  // Figma favorites: 행 사이 8px 간격 + 1px divider
  divider: { height: 1, backgroundColor: colors.borderDefault, marginVertical: spacing.s2 },
  source: {
    ...type.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.s6,
  } as const,
  // 관심 레시피 행 — 40 썸네일 + 제목 + chevron
  recipeRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.s3 },
  recipeThumb: { width: 40, height: 40, borderRadius: radius.s, backgroundColor: colors.bgTertiary, overflow: 'hidden' },
  recipeName: { flex: 1, ...type.body, color: colors.textPrimary } as const,
});
