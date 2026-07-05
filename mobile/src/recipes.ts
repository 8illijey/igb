import { useEffect, useState } from 'react';
import { PriceItem } from './api/kamis';
import recipeData from './recipes.gen.json';
import { RECIPE_IMAGES } from './recipeImages.gen';

export type Ingredient = { name: string; amount: string };
export type Recipe = {
  title: string;
  ingredients: Ingredient[];
  condiments: Ingredient[];
  steps: string[];
  note: string;
  /** 운영판(식약처) 실사진 URL. 번들 폴백 레시피엔 없음 → recipeImage()로 폴백. */
  heroImage?: string;
  /** 단계별 사진 URL (steps와 인덱스 정렬). */
  stepImages?: string[];
};

const normalize = (r: any): Recipe => ({
  title: String(r?.title ?? ''),
  ingredients: (r?.ingredients ?? []).map((x: any) => ({ name: String(x?.name ?? ''), amount: String(x?.amount ?? '') })),
  condiments: (r?.condiments ?? []).map((x: any) => ({ name: String(x?.name ?? ''), amount: String(x?.amount ?? '') })),
  steps: (r?.steps ?? []).map(String),
  note: String(r?.note ?? ''),
  heroImage: r?.heroImage ? String(r.heroImage) : undefined,
  stepImages: Array.isArray(r?.stepImages) ? r.stepImages.map(String) : undefined,
});

/** 번들된(빌드 시점) 레시피 — 오프라인·첫 로드 폴백. 운영판은 Worker에서 fetch. */
export const RECIPES: Recipe[] = (recipeData.recipes as any[]).map(normalize);

// 운영판 Worker URL. 미설정 시 번들 RECIPES만 사용.
const RECIPES_URL = process.env.EXPO_PUBLIC_RECIPES_URL;
let sessionCache: Recipe[] | null = null; // 목록·상세가 같은 데이터를 보도록 세션 캐시

/** 레시피 목록 — Worker에서 라이브 fetch(주1회 갱신), 실패/미설정 시 번들 폴백. */
export function useRecipes(): Recipe[] {
  const [recipes, setRecipes] = useState<Recipe[]>(sessionCache ?? RECIPES);
  useEffect(() => {
    if (sessionCache || !RECIPES_URL) return;
    let alive = true;
    fetch(RECIPES_URL)
      .then((r) => r.json())
      .then((d) => {
        const list = (d?.recipes ?? []).map(normalize).filter((r: Recipe) => r.title);
        if (alive && list.length) {
          sessionCache = list;
          setRecipes(list);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return recipes;
}

// 상세 화면이 인덱스로 참조하는 '현재 보고 있는 목록' — 목록/검색 화면이 렌더할 때 갱신.
let viewedRecipes: Recipe[] = RECIPES;
export function setViewedRecipes(list: Recipe[]) {
  viewedRecipes = list;
}
export function getViewedRecipe(id: number): Recipe | undefined {
  return viewedRecipes[id];
}

/** 재료명·레시피명으로 검색 — 화면에 보이는 corpus(라이브 또는 번들)를 로컬 필터. 빈 쿼리면 빈 배열. */
export async function searchRecipes(q: string): Promise<Recipe[]> {
  const ql = q.trim().toLowerCase();
  if (!ql) return [];
  const corpus = sessionCache ?? RECIPES;
  return corpus.filter(
    (r) => r.title.toLowerCase().includes(ql) || r.ingredients.some((ing) => ing.name.toLowerCase().includes(ql)),
  );
}

// AI가 쓰는 자연스러운 재료명 → KAMIS 실제 품목명 보정 (UI 표기는 자연어 유지, 매칭만 교정).
// 예: KAMIS는 "애호박"을 "호박", "대파"를 "파"로 집계한다.
const KAMIS_ALIAS: Record<string, string> = {
  애호박: '호박',
  대파: '파',
  달걀: '계란',
  '다진 마늘': '깐마늘',
  다진마늘: '깐마늘',
  마늘: '깐마늘',
};

/** 레시피 이미지(번들). key 없으면 히어로, 숫자면 단계 이미지, 'ingredients'면 재료모음. (없으면 undefined) */
export function recipeImage(title: string, key?: number | 'ingredients'): number | undefined {
  return RECIPE_IMAGES[key == null ? title : `${title}__${key}`];
}

import type { ImageSourcePropType } from 'react-native';
/** 레시피 히어로 사진 — 운영판 URL 우선, 없으면 번들 폴백. (둘 다 없으면 undefined → placeholder) */
export function recipeHero(r: Recipe): ImageSourcePropType | undefined {
  return r.heroImage ? { uri: r.heroImage } : recipeImage(r.title);
}
/** 레시피 단계(0-based) 사진 — 운영판 URL 우선, 없으면 번들 폴백. */
export function recipeStep(r: Recipe, i: number): ImageSourcePropType | undefined {
  const url = r.stepImages?.[i];
  return url ? { uri: url } : recipeImage(r.title, i + 1);
}

/** 재료명을 라이브 KAMIS 품목과 매칭 (신호가 있는 품목만). 별칭 보정 + 정확일치 우선 → 부분일치 폴백.
 *  정확일치를 먼저 보는 이유: "파"가 양파·파프리카에 부분포함되는 등의 오매칭 방지. */
export function findItem(items: PriceItem[], name: string): PriceItem | undefined {
  const q = KAMIS_ALIAS[name] ?? name;
  return (
    items.find((i) => i.itemName === q && i.level != null) ??
    items.find((i) => i.itemName.includes(q) && i.level != null)
  );
}
