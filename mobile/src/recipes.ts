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
};

const normalize = (r: any): Recipe => ({
  title: String(r?.title ?? ''),
  ingredients: (r?.ingredients ?? []).map((x: any) => ({ name: String(x?.name ?? ''), amount: String(x?.amount ?? '') })),
  condiments: (r?.condiments ?? []).map((x: any) => ({ name: String(x?.name ?? ''), amount: String(x?.amount ?? '') })),
  steps: (r?.steps ?? []).map(String),
  note: String(r?.note ?? ''),
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

/** 레시피 이미지. key 없으면 히어로, 숫자면 단계 이미지, 'ingredients'면 재료모음. (없으면 undefined) */
export function recipeImage(title: string, key?: number | 'ingredients'): number | undefined {
  return RECIPE_IMAGES[key == null ? title : `${title}__${key}`];
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
