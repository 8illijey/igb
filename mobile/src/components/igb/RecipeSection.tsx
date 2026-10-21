import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { track } from '../../analytics';
import { findItem, recipeHero, recipeSlug, recipeTerms, setViewedRecipes, useItemRecipes } from '../../recipes';
import { useDisplayItems } from '../../store/itemView';
import { itemKey } from '../../store/prices';
import { colors, radius, spacing, type } from '../../theme/tokens';
import { byParticle } from '../../utils/korean';
import { SignalChip } from './SignalChip';

const CARD_W = 140;

/**
 * 품목 상세 — 이 품목이 들어간 레시피를 가로로 넘기는 카드로. Figma 1223:2978(시안 A, 2026-10-19).
 * ponytail: 불러오는 동안·0건이면 섹션 자체를 안 그린다(쿠팡 섹션 아래라 첫 화면 밖). 스켈레톤은 늦게 뜨는 게 거슬리면.
 */
export function RecipeSection({ itemName, itemCode }: { itemName: string; itemCode: string }) {
  const recipes = useItemRecipes(itemName, 6);
  const { items } = useDisplayItems();
  // 보고 있는 품종 — 레시피의 '포도'를 이 품종 가격으로 판정한다(findItem prefer).
  const viewing = items.find((i) => itemKey(i) === itemCode);
  if (!recipes?.length) return null;
  const terms = recipeTerms(itemName);
  const term = terms[0];
  return (
    <View style={styles.section}>
      <Text style={styles.title}>
        {term}
        {byParticle(term)} 뭘 해먹을까요?
      </Text>
      {/* 상세 본문 좌우 여백(16)을 넘어 화면 끝까지 넘어가게 — 카드가 잘려 보여야 옆으로 넘길 수 있다는 걸 안다. */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bleed} contentContainerStyle={styles.row}>
        {recipes.map((r) => {
          const cheap = r.ingredients.filter((i) => findItem(items, i.name, i.raw, r.title, viewing)?.level === 'cheap').length;
          const hero = recipeHero(r);
          return (
            <Pressable
              key={r.title}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
              onPress={() => {
                track('select_content', { content_type: 'recipe', content_id: r.title, item_name: itemName });
                // 주간 목록 밖 레시피라 상세가 슬러그로 찾을 수 있게 넘겨 둔다(관심목록과 같은 방식).
                setViewedRecipes(recipes);
                router.push(`/recipe/${encodeURIComponent(recipeSlug(r.title))}?from=${itemCode}` as Href);
              }}
            >
              <View style={styles.photo}>
                {hero != null && <Image source={hero} style={StyleSheet.absoluteFill} contentFit="cover" />}
                {cheap > 0 && (
                  <View style={styles.badge}>
                    <SignalChip level="cheap" size="xs" label={`싼 재료 ${cheap}개`} />
                  </View>
                )}
              </View>
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>
                  {r.title}
                </Text>
                {/* 이 품목을 맨 앞에 — 사과·깻잎은 시세 추적 재료(ingredients)가 아니라 목록에 안 나와
                    '연두부 토마토 / 두부 · 방울토마토'처럼 품목과 무관해 보였다(2026-10-19). */}
                <Text style={styles.caption} numberOfLines={1}>
                  {[term, ...r.ingredients.map((i) => i.name).filter((n) => !terms.includes(n))].join(' · ')}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      <Text style={styles.caption}>자료 출처 · 식품의약품안전처 조리식품 레시피 DB</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.s4 },
  title: { ...type.size[17], ...type.w.semibold, color: colors.textPrimary } as const,
  bleed: { marginHorizontal: -spacing.s4 },
  row: { paddingHorizontal: spacing.s4, gap: spacing.s3 },
  card: { width: CARD_W, gap: spacing.s2 },
  photo: { width: CARD_W, height: CARD_W, borderRadius: radius.m, backgroundColor: colors.bgTertiary, overflow: 'hidden' },
  badge: { position: 'absolute', top: spacing.s2, left: spacing.s2 },
  info: { gap: spacing.s1 },
  name: { ...type.size[15], ...type.w.regular, color: colors.textPrimary } as const,
  caption: { ...type.size[13], ...type.w.regular, color: colors.textTertiary } as const,
});
