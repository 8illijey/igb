import { router, type Href } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GlassHeader } from '../../components/igb/GlassHeader';
import { SignalChip } from '../../components/igb/SignalChip';
import { Wordmark } from '../../components/igb/Wordmark';
import { usePrices } from '../../store/prices';
import { Image } from 'expo-image';
import { findItem, recipeImage, useRecipes } from '../../recipes';
import { colors, font, radius, spacing, type } from '../../theme/tokens';

const LEVEL_WORD = { cheap: '싼 편', fair: '적정', expensive: '비싼 편' } as const;

export default function RecipesScreen() {
  const { items } = usePrices();
  const recipeList = useRecipes();
  const [topH, setTopH] = useState(0);

  const cards = useMemo(
    () =>
      recipeList.map((r, id) => {
        const matched = r.ingredients
          .map((ing) => ({ name: ing.name, item: findItem(items, ing.name) }))
          .filter((m) => m.item != null);
        const cheapCount = matched.filter((m) => m.item!.level === 'cheap').length;
        return { ...r, id, matched, cheapCount };
      })
        // 메인 재료가 하나라도 '비싼 편'이면 레시피를 노출하지 않는다 (라이브 시세 기준).
        // 예: 쌀이 비싸면 '양배추 토마토 볶음밥'은 빠진다. (조미료는 판단에서 제외)
        .filter((c) => c.matched.every((m) => m.item!.level !== 'expensive'))
        .sort((a, b) => b.cheapCount - a.cheapCount),
    [items, recipeList],
  );

  return (
    <View style={styles.screen}>
      <GlassHeader onHeight={setTopH}>
        <View style={styles.header}>
          <Wordmark />
        </View>
      </GlassHeader>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: topH }]}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>이번 주 장보기 레시피</Text>
          <Text style={styles.caption}>매주 화요일 갱신</Text>
        </View>
        <Text style={styles.intro}>AI가 평년보다 싼 재료로 짠 레시피예요</Text>
        {cards.map((r) => (
          <Pressable
            key={r.id}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
            onPress={() => router.push(`/recipe/${r.id}` as Href)}
          >
            <View style={styles.media}>
              {recipeImage(r.title) != null && (
                <Image source={recipeImage(r.title)} style={StyleSheet.absoluteFill} contentFit="cover" />
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
                    ? `재료 ${r.matched.length}개 중 ${r.cheapCount}개가 평년보다 싸요`
                    : '지금 담으면 무난한 가격이에요'
                  : '재료 시세를 불러오는 중이에요'}
              </Text>
              {r.note ? <Text style={styles.note}>{r.note}</Text> : null}
            </View>
          </Pressable>
        ))}
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
  content: { padding: spacing.s4, gap: spacing.s3, paddingBottom: 140 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { ...type.h2, color: colors.textPrimary } as const,
  intro: { ...type.body, color: colors.textSecondary } as const,
  card: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.m,
    overflow: 'hidden',
    backgroundColor: colors.bgCanvas,
  },
  media: { height: 140, backgroundColor: colors.bgTertiary },
  cardBody: { padding: spacing.s3, gap: spacing.s2 },
  cardTitle: { ...type.title, color: colors.textPrimary } as const,
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s1 },
  caption: { ...type.caption, color: colors.textTertiary } as const,
  note: { ...type.caption, color: colors.textSecondary } as const,
});
