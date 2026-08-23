import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PriceItem, won } from '../../api/kamis';
import { EmptyState } from '../../components/igb/EmptyState';
import { FavoriteHeart } from '../../components/igb/FavoriteHeart';
import { GlassHeader } from '../../components/igb/GlassHeader';
import { SignalChip } from '../../components/igb/SignalChip';
import { Ingredient, findItem, getViewedRecipe, recipeHero, recipeImage, recipeStep, useRecipes } from '../../recipes';
import { portionPrice } from '../../portion';
import { useFavorites } from '../../store/favorites';
import { itemKey, usePrices } from '../../store/prices';
import { colors, radius, spacing, type } from '../../theme/tokens';
import { OG_DEFAULT_IMAGE } from '../../og';

const LEVEL_WORD = { cheap: '싸요', fair: '적당해요', expensive: '비싸요' } as const;

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items } = usePrices();
  // 목록/검색 화면이 보여준 '현재 목록'을 인덱스로 참조. 없으면(딥링크 등) 기본 목록 폴백.
  const fallback = useRecipes();
  const recipe = getViewedRecipe(Number(id)) ?? fallback[Number(id)];
  const { isFavorite, toggle } = useFavorites();
  // 제목 키 — 인덱스 키는 목록(주간 로테이션·검색)이 바뀌면 다른 레시피를 가리킨다.
  // 복원은 관심목록이 식약처 DB 라이브 재조회(fetchRecipeByTitle)로 한다.
  const favKey = recipe ? `recipe:${recipe.title}` : `recipe:${id}`;
  const fav = isFavorite(favKey);
  const [topH, setTopH] = useState(0);

  const matched = useMemo(
    () => recipe?.ingredients.map((ing) => ({ ...ing, item: findItem(items, ing.name) })) ?? [],
    [recipe, items],
  );
  const cheapCount = matched.filter((m) => m.item?.level === 'cheap').length;

  if (!recipe) {
    return (
      <View style={styles.screen}>
        <GlassHeader>
          <Header />
        </GlassHeader>
        <EmptyState title="레시피를 찾을 수 없어요" description="목록에서 다시 선택해 주세요" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Head>
        <title>{recipe ? `${recipe.title} — 오늘 재료 시세로 보는 레시피 | 이거비싸?` : '레시피 | 이거비싸?'}</title>
        <meta
          name="description"
          content={recipe ? `${recipe.title} 만드는 법과 재료별 오늘 시세. 지금 싼 재료인지 확인하고 장 보세요.` : '오늘 시세가 싼 재료로 만드는 레시피.'}
        />
              <meta
          property="og:title"
          content={recipe ? `${recipe.title} — 오늘 재료 시세로 보는 레시피 | 이거비싸?` : '레시피 | 이거비싸?'}
        />
        <meta
          property="og:description"
          content={recipe ? `${recipe.title} 만드는 법과 재료별 오늘 시세. 지금 싼 재료인지 확인하고 장 보세요.` : '오늘 시세가 싼 재료로 만드는 레시피.'}
        />
      <meta property="og:image" content={OG_DEFAULT_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:image" content={OG_DEFAULT_IMAGE} />
      </Head>
      <GlassHeader onHeight={setTopH}>
        <Header />
      </GlassHeader>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: topH }]}>
        {/* 히어로 사진 (없으면 placeholder) */}
        <View style={styles.hero}>
          {recipeHero(recipe) != null && (
            <Image source={recipeHero(recipe)!} style={StyleSheet.absoluteFill} contentFit="cover" />
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.titleBlock}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { flex: 1 }]}>{recipe.title}</Text>
              <FavoriteHeart fav={fav} onToggle={() => toggle(favKey)} style={styles.favBtn} />
            </View>
          </View>
          <Text style={styles.meta}>
            {matched.length > 0
              ? `재료 ${matched.length}개 중 ${cheapCount}개가 이맘때 평균보다 싸요`
              : '재료 시세를 불러오는 중이에요'}
          </Text>

          {/* 재료모음 사진 (있을 때만) */}
          {recipeImage(recipe.title, 'ingredients') != null && (
            <View style={styles.ingredientsPhoto}>
              <Image
                source={recipeImage(recipe.title, 'ingredients')}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
            </View>
          )}

          {/* 재료 — 시세 추적 재료(탭 → 품목 상세) + 조미료. 조미료도 매칭되면(다진 마늘 등) 가격 표시. */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>재료</Text>
            {matched.map((m) => (
              <IngredientRow key={m.name} ing={m} item={m.item} />
            ))}
            {recipe.condiments.map((c) => (
              <IngredientRow key={c.name} ing={c} item={findItem(items, c.name)} silent />
            ))}
          </View>

          {/* 섹션 구분 — 화면 full-width 회색 밴드 */}
          <View style={styles.sectionBand} />

          {/* 만드는 법 — 사진 + 단계 텍스트 */}
          <View style={styles.stepsSection}>
            <Text style={styles.sectionTitle}>만드는 법</Text>
            {recipe.steps.map((s, i) => (
              <View key={i} style={styles.step}>
                <Text style={styles.stepNum}>{i + 1}</Text>
                <Text style={styles.stepText}>{s}</Text>
                <View style={styles.stepPhoto}>
                  {recipeStep(recipe, i) != null && (
                    <Image source={recipeStep(recipe, i)!} style={StyleSheet.absoluteFill} contentFit="cover" />
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/** 재료 행 — 신호칩 + '들어가는 만큼' 가격 + chevron, 탭하면 품목 상세로.
 *  silent=true(조미료)면 미추적 품목은 분량만 보여주고 '시세 정보 없음'은 숨긴다. */
function IngredientRow({ ing, item, silent }: { ing: Ingredient; item?: PriceItem; silent?: boolean }) {
  if (item == null) {
    return (
      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Text style={styles.ingName}>{ing.name}</Text>
          <Text style={styles.ingAmount}>{ing.amount}</Text>
        </View>
        {/* 메인 재료(두부·콩나물 등)는 없음을 명시, 조미료는 분량만 */}
        {silent ? null : <Text style={styles.noData}>시세 정보 없음</Text>}
      </View>
    );
  }
  const portion = portionPrice(item, ing.amount);
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
      onPress={() => router.push(`/item/${itemKey(item)}`)}
    >
      <View style={styles.rowLeft}>
        <Text style={styles.ingName}>{ing.name}</Text>
        <Text style={styles.ingAmount}>{ing.amount}</Text>
      </View>
      <View style={styles.rowRight}>
        <SignalChip level={item.level!} size="s" label={LEVEL_WORD[item.level!]} />
        {/* 들어가는 분량만큼의 가격. 환산 불가하면 단위 시세로 폴백. (물결 ≈ 제거 — 디자인) */}
        <Text style={styles.ingPrice}>
          {portion != null ? `${won(portion)}원` : `${won(item.today)}원`}
        </Text>
        <ChevronRight size={20} color={colors.textTertiary} strokeWidth={2} />
      </View>
    </Pressable>
  );
}

/** main-header type=detail — back + 제목. (관심 하트는 본문 제목 우측으로 이동) */
function Header() {
  return (
    <View style={styles.header}>
      <Pressable style={styles.iconBtn} onPress={() => router.back()} hitSlop={4}>
        <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>
        레시피
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgCanvas },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s1,
    gap: spacing.s1,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, ...type.size[17], ...type.w.semibold, color: colors.textPrimary, textAlign: 'left' } as const,
  scroll: { paddingBottom: spacing.s16 },

  hero: { height: 240, backgroundColor: colors.bgTertiary },
  content: { padding: spacing.s4, gap: spacing.s4 },

  titleBlock: { gap: spacing.s2 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.s2 },
  favBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  title: { ...type.size[22], ...type.w.bold, color: colors.textPrimary } as const,
  meta: { ...type.size[13], ...type.w.regular, color: colors.textSecondary } as const,

  section: { gap: spacing.s1 },
  sectionTitle: { ...type.size[17], ...type.w.semibold, color: colors.textPrimary } as const,
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.s2,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.s2 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.s2 },
  ingName: { ...type.size[15], ...type.w.regular, color: colors.textPrimary } as const,
  ingAmount: { ...type.size[13], ...type.w.regular, color: colors.textTertiary } as const,
  ingPrice: { ...type.size[15], ...type.w.semibold, color: colors.priceNumber } as const,
  noData: { ...type.size[13], ...type.w.regular, color: colors.textTertiary } as const,
  // 재료모음 사진 — 인셋(콘텐츠 폭), 16:9
  ingredientsPhoto: { aspectRatio: 16 / 9, borderRadius: radius.m, backgroundColor: colors.bgTertiary, overflow: 'hidden' },
  // 섹션 구분 밴드 — 화면 full-width (콘텐츠 패딩 상쇄 위해 음수 마진)
  sectionBand: { height: 8, backgroundColor: colors.bgSecondary, marginHorizontal: -spacing.s4 },

  stepsSection: { gap: spacing.s4 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.s3 },
  // 번호는 덜 강조 — 옅은 회색
  stepNum: { ...type.size[15], ...type.w.regular, color: colors.textTertiary, width: 14 } as const,
  stepText: { flex: 1, ...type.size[15], ...type.w.regular, color: colors.textSecondary } as const,
  stepPhoto: { width: 64, height: 64, borderRadius: radius.s, backgroundColor: colors.bgTertiary, overflow: 'hidden' },
});
