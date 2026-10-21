import { useEffect, useState } from 'react';
import type { PriceItem } from './api/kamis';
import recipeData from './recipes.gen.json';
import { RECIPE_IMAGES } from './recipeImages.gen';
// 슬러그 규칙은 빌드 스크립트(gen-seo.mjs)와 공유해야 해서 의존성 없는 파일로 분리했다.
import { recipeSlug } from './recipeSlug';

export { recipeSlug };

/** raw = 식약처 원문 재료명('쇠고기등심'). 워커가 name을 '소고기'로 줄이므로 부위는 raw에만 남는다. */
export type Ingredient = { name: string; amount: string; raw?: string };
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
  ingredients: (r?.ingredients ?? []).map((x: any) => ({
    name: String(x?.name ?? ''),
    amount: String(x?.amount ?? ''),
    ...(x?.raw ? { raw: String(x.raw) } : {}),
  })),
  condiments: (r?.condiments ?? []).map((x: any) => ({ name: String(x?.name ?? ''), amount: String(x?.amount ?? '') })),
  steps: (r?.steps ?? []).map(String),
  note: String(r?.note ?? ''),
  heroImage: r?.heroImage ? String(r.heroImage) : undefined,
  stepImages: Array.isArray(r?.stepImages) ? r.stepImages.map(String) : undefined,
});

/** 슬러그로 레시피 찾기. 못 찾으면 undefined — 로테이션으로 빠진 레시피일 수 있다. */
export function findRecipeBySlug(list: Recipe[], slug: string): Recipe | undefined {
  const s = decodeURIComponent(String(slug));
  return list.find((r) => recipeSlug(r.title) === s || r.title === s);
}

/** 번들된(빌드 시점) 레시피 — 오프라인·첫 로드 폴백. 운영판은 Worker에서 fetch. */
export const RECIPES: Recipe[] = (recipeData.recipes as any[]).map(normalize);

// 운영판 Worker URL 하드코딩 — EXPO_PUBLIC_* env가 오염 값으로 주입되는 사고 반복(kamis.ts 참조, 2026-08-09).
// 오염되면 식약처 라이브 대신 구버전 번들만 떴다. 실패 시엔 어차피 번들 RECIPES 폴백.
const RECIPES_URL = 'https://igeobissa-recipes.designerxyzi.workers.dev/recipes';
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
/** 주간 목록 밖 레시피(관심목록·품목 상세에서 연 것)를 슬러그로 찾는다. */
export function findViewedRecipeBySlug(slug: string): Recipe | undefined {
  return findRecipeBySlug(viewedRecipes, slug);
}

// ---- 관심 레시피 복원 ----
// 즐겨찾기 키가 '목록 인덱스'면 목록(주간 로테이션·검색 결과)이 바뀔 때 엉뚱한 레시피를 가리킨다
// (2026-08-09 실제 발생 — 구버전 번들 제목이 뜸). 제목 키로 저장하고, 복원은 원천인
// 식약처 조리식품 레시피 DB(워커 /recipes/search 라이브)에서 제목 재조회로 한다.
const SEARCH_URL = RECIPES_URL.replace(/\/recipes$/, '/recipes/search');
async function searchLive(q: string, byTitle: boolean): Promise<Recipe[]> {
  const url = `${SEARCH_URL}?q=${encodeURIComponent(q)}${byTitle ? '&by=title' : ''}`;
  const get = async (init?: RequestInit) => (((await (await fetch(url, init)).json()) as any)?.recipes ?? []).map(normalize);
  const list = await get();
  // 빈 답이면 저장본을 건너뛰고 한 번 더 — 식약처가 가끔 빈 응답을 주고, 예전 워커는 그걸 1시간 캐시했다(2026-10-22).
  return list.length ? list : get({ cache: 'no-store' });
}

export async function fetchRecipeByTitle(title: string): Promise<Recipe | null> {
  try {
    const list = await searchLive(title, true);
    return list.find((r: Recipe) => r.title === title) ?? list[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * 슬러그만 아는 레시피(품목 상세에서 연 주간 목록 밖 레시피를 새로고침·공유로 다시 연 경우) 복원.
 * 슬러그는 공백·&를 '-'로 바꿔 제목을 그대로 못 되돌린다 — 가장 긴 조각으로 제목 검색 후 슬러그로 대조.
 */
export async function fetchRecipeBySlug(slug: string): Promise<Recipe | null> {
  const s = decodeURIComponent(slug);
  const q = s.split('-').sort((a, b) => b.length - a.length)[0];
  if (!q) return null;
  try {
    return (await searchLive(q, true)).find((r) => recipeSlug(r.title) === s) ?? null;
  } catch {
    return null;
  }
}

/**
 * 품목 표시명 → 레시피 원문에서 찾을 재료명. 첫 항목이 검색어이자 화면 표기('양파로 만드는 요리').
 * 품종·등급·규격은 레시피에 안 나온다 — '한우 등심 1+등급'·'홍로사과'·'계란 10구'로는 0건.
 * 표에 없으면 표시명 그대로(끝 괄호만 뗌).
 */
const TERM_RULES: [RegExp, string[]][] = [
  [/한우|소고기/, ['소고기', '쇠고기']],
  [/돼지고기/, ['돼지고기']],
  [/닭고기/, ['닭고기']],
  [/계란/, ['계란', '달걀']],
  [/^쌀 /, ['쌀']],
  [/사과/, ['사과']],
  [/포도$/, ['포도']],
  [/오이$/, ['오이']],
  [/상추$/, ['상추']],
  [/감귤$/, ['귤', '감귤']],
  // 레시피 원문은 '알배추'라 쓴다 — 검색어·제목 대조는 그 말로. 재료 대조는 ingredientName이 '알배기배추'로 갈라 준다.
  [/^알배기배추$/, ['알배추', '알배기배추']],
  // 원문은 '얼갈이 배추'(띄어 씀)·'얼갈이'로 쓴다 — '얼갈이배추'로 물으면 식약처가 못 찾는다.
  [/^얼갈이배추$/, ['얼갈이', '얼갈이배추']],
  [/고춧가루$/, ['고춧가루']],
  [/^깐마늘/, ['마늘', '깐마늘']],
  [/방울토마토$/, ['방울토마토']],
  [/^쥬키니호박$/, ['애호박', '호박']],
];
export function recipeTerms(itemName: string): string[] {
  return TERM_RULES.find(([re]) => re.test(itemName))?.[1] ?? [itemName.replace(/\s*\([^)]*\)$/, '')];
}

/** 제목에서 품목명을 품은 다른 말 — '김치양배추볶음'이 배추 레시피로, '무염버터'가 무 레시피로 잡히지 않게. */
const TITLE_NOISE = ['양배추', '알배추', '얼갈이배추', '방울토마토', '단호박', '애호박', '순무', '열무', '무염', '무가당', '무말랭이', '사과식초', '쌀가루'];
const grams = (amount: string) => Number(/(\d+(?:\.\d+)?)\s*(?:g|ml|㎖)/i.exec(amount)?.[1] ?? 0);

/**
 * 품목이 '주재료'인지 — 제목에 품목명이 있거나(1순위), 재료 전체 g 중 15% 이상이면(2순위, 비율이 점수).
 * 들어가기만 하면 다 보여줬더니 양파 10g짜리 방울토마토 소박이가 양파 레시피로 떠서 연관 없어 보였다(2026-10-19 예지님).
 * 실측(2026-10-19): 양파 54→7, 감자 62→29, 소고기 47→31, 대파 50→2. 0이면 주재료 아님.
 */
export function mainScore(r: Recipe, terms: string[]): number {
  const all = [...r.ingredients, ...r.condiments];
  const mine = all.find((i) => {
    const n = ingredientName(i);
    return n != null && (terms.includes(n) || (i.raw != null && terms.includes(i.raw)));
  });
  if (!mine) return 0;
  const title = TITLE_NOISE.filter((w) => !terms.includes(w)).reduce((t, w) => t.replaceAll(w, ''), r.title);
  // 원문이 품종을 갈랐으면(알배추) 워커 이름(배추)으로도 제목을 본다 — '배추겉절이'의 재료가 알배추다.
  const split = ingredientName(mine) !== mine.name; // 쪽파(워커 이름 '대파') 같은 경우엔 쓰지 않는다
  if ([...terms, ...(split ? [mine.name] : [])].some((t) => title.includes(t))) return 2;
  const total = all.reduce((s, i) => s + grams(i.amount), 0);
  const share = total ? grams(mine.amount) / total : 0;
  return share >= 0.15 ? share : 0;
}

/**
 * 식약처 DB에 같은 요리가 띄어쓰기만 다르게 두 번 있다('구운주먹밥' 저화질 5단계 / '구운 주먹밥' 고화질 6단계,
 * 2026-10-22 실측: 8품목 검색 399건 중 3쌍). 공백을 뺀 제목으로 묶고 고화질 사진(/uploadimg/cook/ 아님) 쪽을 남긴다. 순서는 먼저 온 쪽.
 */
function dedupeRecipes(list: Recipe[]): Recipe[] {
  const lowRes = (r: Recipe) => (r.heroImage ?? '').includes('/uploadimg/cook/');
  const uniq = new Map<string, Recipe>();
  for (const r of list) {
    const k = r.title.replace(/\s+/g, '');
    const had = uniq.get(k);
    if (!had || (lowRes(had) && !lowRes(r))) uniq.set(k, r);
  }
  return [...uniq.values()];
}

const itemRecipeCache = new Map<string, Recipe[]>();
/**
 * 품목이 주재료인 레시피(mainScore 순) — 식약처 재료 검색 + 제목 검색(워커 /recipes/search)을 합친다.
 * 재료 검색은 50건 상한이라 '양파홍초절임'처럼 제목에 품목이 든 레시피가 빠질 수 있어 제목 검색을 더한다.
 * 식약처 검색은 부분 일치라 '사과'에 사과식초가 걸린다 — mainScore가 재료명 정확 일치로 거른다.
 * 워커는 시세 추적 27종만 ingredients로 두고 나머지(사과·깻잎…)는 condiments로 보내서 둘 다 본다.
 * undefined = 불러오는 중, [] = 없음.
 */
export function useItemRecipes(itemName: string, limit = 3): Recipe[] | undefined {
  // 결과를 요청한 품목명과 같이 들고 있다 — 다른 품목으로 넘어가면 이전 품목 레시피를 안 보여준다.
  const [got, setGot] = useState<{ name: string; list: Recipe[] } | null>(null);
  const cached = itemRecipeCache.get(itemName);
  useEffect(() => {
    if (!itemName || itemRecipeCache.has(itemName)) return;
    let alive = true;
    const terms = recipeTerms(itemName);
    Promise.all([searchLive(terms[0], true).catch(() => []), searchLive(terms[0], false)])
      .then(([byTitle, byIngredient]) => {
        const picked = dedupeRecipes([...byTitle, ...byIngredient])
          .map((r) => ({ r, s: mainScore(r, terms) }))
          .filter((x) => x.s > 0)
          .sort((a, b) => b.s - a.s)
          .slice(0, limit)
          .map((x) => x.r);
        itemRecipeCache.set(itemName, picked);
        if (alive) setGot({ name: itemName, list: picked });
      })
      // 실패는 캐시하지 않는다 — 다음 진입 때 다시 시도.
      .catch(() => alive && setGot({ name: itemName, list: [] }));
    return () => {
      alive = false;
    };
  }, [itemName, limit]);
  return cached ?? (got?.name === itemName ? got.list : undefined);
}

/** 레시피명에 검색어가 들어가는지 — 띄어쓰기 무시('구운주먹밥'으로 '구운 주먹밥'을 찾게). 검색 결과 정렬 1순위. */
export function titleMatches(r: Recipe, q: string): boolean {
  const n = (s: string) => s.replace(/\s+/g, '').toLowerCase();
  return n(r.title).includes(n(q));
}

/**
 * 재료명·레시피명으로 검색 — 식약처 DB 전체(워커 /recipes/search 제목+재료). 빈 쿼리면 빈 배열.
 * 예전엔 이번 주 목록 30개 안에서만 찾아서, 품목 상세에서 본 레시피가 탭 검색에선 안 나왔다(2026-10-22).
 * 재료 검색은 부분 일치라 '사과'에 사과식초가 걸린다 — 재료명이 정확히 같거나 제목에 든 것만 남긴다.
 * 라이브가 실패하면 이번 주 목록(로컬)만으로 답한다.
 */
export async function searchRecipes(q: string): Promise<Recipe[]> {
  const qq = q.trim();
  if (!qq) return [];
  const ql = qq.toLowerCase();
  const local = (sessionCache ?? RECIPES).filter(
    (r) => r.title.toLowerCase().includes(ql) || r.ingredients.some((ing) => ing.name.toLowerCase().includes(ql)),
  );
  // 식약처 검색은 공백이 든 검색어에 0건을 준다(2026-10-22: '구운 주먹밥' 0건, '주먹밥' 14건). 가장 긴 단어로 묻고
  // 제목은 titleMatches(공백 무시)로 다시 거른다 — '구운주먹밥'·'구운 주먹밥'이 둘 다 잡혀 고화질 쪽이 남는다.
  const word = qq.split(/\s+/).sort((a, b) => b.length - a.length)[0];
  const [byTitle, byIngredient] = await Promise.all([
    searchLive(word, true).catch(() => [] as Recipe[]),
    searchLive(word, false).catch(() => [] as Recipe[]),
  ]);
  const hasIngredient = (r: Recipe) => [...r.ingredients, ...r.condiments].some((i) => i.name === qq || i.raw === qq);
  const live = [...byTitle, ...byIngredient].filter((r) => titleMatches(r, qq) || hasIngredient(r));
  return dedupeRecipes([...local, ...live]);
}

// AI가 쓰는 자연스러운 재료명 → KAMIS 실제 품목명 보정 (UI 표기는 자연어 유지, 매칭만 교정).
// 예: KAMIS는 "애호박"을 "호박", "대파"를 "파"로 집계한다.
// 레시피 재료명 → KAMIS 품목명. 품목명에 없는 이름만 넣는다.
// '대파: 파'는 지웠다 — 품목명이 이미 '대파'(246-00)라 별칭이 오히려 정확 일치를 깨고,
// 폴백 includes('파')가 목록에서 먼저 오는 '양파'(245-00)를 잡았다(2026-09-10 확인: 레시피의 대파가
// 양파 가격·신호·쿠팡 상품을 달고 있었다).
const KAMIS_ALIAS: Record<string, string> = {
  애호박: '호박',
  달걀: '계란',
  '다진 마늘': '깐마늘',
  다진마늘: '깐마늘',
  마늘: '깐마늘',
  // 부위를 알 수 없는 '소고기'의 기본값. 부위가 원문에 있으면 cutTarget()이 먼저 고른다.
  // 레시피 소고기는 떡갈비·만두·찜용(다짐육)이 대부분이라 설도, 등급은 가운데인 1+.
  // includes('한우')로 두면 목록 첫 줄 '한우 안심 1++등급' — 가장 비싼 부위·등급 — 이 잡혔다(2026-10-16).
  소고기: '한우 설도 1+등급',
  쇠고기: '한우 설도 1+등급',
};

/**
 * 원문 재료명의 부위 → KAMIS 품목명. 위에서부터 첫 일치.
 * 식약처 원문 예(2026-10-16 표본): '쇠고기등심', '소고기 우둔살', '다진소고기', '소고기(살치살', '돼지고기(사태'.
 * KAMIS에 없는 부위는 용도가 가장 가까운 부위로 — 살치·채끝→등심, 사태·차돌·국거리→양지,
 * 우둔·홍두깨·다짐육·불고기·장조림→설도(기본값). 레시피엔 등급이 없어 한우는 1+등급으로 둔다.
 */
const CUT_RULES: Record<string, [RegExp, string][]> = {
  // 다짐육을 맨 앞에 — 원문이 '떡갈비 : 다진소고기'처럼 요리명을 달고 오면 '갈비'에 먼저 걸린다.
  소고기: [
    [/다진|갈은|분쇄/, '한우 설도 1+등급'],
    [/안심/, '한우 안심 1+등급'],
    [/등심|채끝|살치/, '한우 등심 1+등급'],
    [/갈비/, '한우 갈비 1+등급'],
    [/양지|사태|차돌|국거리/, '한우 양지 1+등급'],
  ],
  돼지고기: [
    [/다진|갈은|분쇄/, '돼지고기 앞다리'],
    [/삼겹/, '돼지고기 삼겹살'],
    [/목살|목심/, '돼지고기 목심'],
    [/갈비/, '돼지고기 갈비'],
  ],
};
/**
 * 원문이 그냥 '소고기'일 때 요리 이름으로 부위를 정한다. 원문 규칙이 먼저다.
 * 2026-10-16 새우와스테이크: 원문 '소고기(120g)'라 기본값 설도로 갔다 — 스테이크는 등심이다.
 * 제목엔 원문 규칙을 쓰지 않는다. '떡갈비'가 '갈비'에 걸린다.
 */
const TITLE_RULES: Record<string, [RegExp, string][]> = {
  소고기: [[/스테이크/, '한우 등심 1+등급']],
};
/**
 * 워커가 하나로 묶은 재료를 원문으로 다시 가른다. null = 시세 품목이 아님.
 * 워커는 '배추'가 든 재료를 모두 '배추'로 태깅한다(2026-10-22 실측: 원문 알배추 9·얼갈이배추 2·배추김치 3개가
 * 전부 배추). 그래서 알배추 레시피에 배추(1포기) 시세가 붙고, 배추 상세에 김치양배추볶음이 떴다.
 */
const VARIETY_RULES: Record<string, [RegExp, string | null][]> = {
  배추: [
    [/김치/, null], // 배추김치는 가공품 — 생배추 시세로 매기지 않는다
    [/알배추|알배기/, '알배기배추'],
    [/얼갈이|단배추/, '얼갈이배추'], // 단배추 = 얼갈이의 다른 이름(경상도)
  ],
};
/** 재료의 실제 시세 품목명 — 원문으로 품종을 가르고, 규칙이 없으면 워커가 준 이름. null = 시세 품목 아님. */
export function ingredientName(i: { name: string; raw?: string }): string | null {
  const rule = i.raw ? VARIETY_RULES[i.name]?.find(([re]) => re.test(i.raw!)) : undefined;
  return rule ? rule[1] : i.name;
}

function cutTarget(name: string, raw: string | undefined, title: string | undefined): string | null {
  const byRaw = raw ? CUT_RULES[name]?.find(([re]) => re.test(raw))?.[1] : undefined;
  return byRaw ?? (title ? TITLE_RULES[name]?.find(([re]) => re.test(title))?.[1] : undefined) ?? null;
}

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
export function findItem(
  items: PriceItem[],
  name: string,
  raw?: string,
  title?: string,
  /** 사용자가 보던 품종 — 레시피는 '포도'라고만 써서 목록 첫 품종(캠벨얼리)이 잡혔다. 같은 품목이면 이걸로 바꾼다.
   *  2026-10-22 부산: 샤인머스켓 '싸요' 상세에서 연 레시피가 포도를 캠벨얼리 '비싸요'로 보여줬다. */
  prefer?: PriceItem,
): PriceItem | undefined {
  const variety = ingredientName({ name, raw });
  if (variety == null) return undefined;
  // 원문이 품종을 정했으면('알배추'→알배기배추) 그 품목 그대로 — 보던 품종으로 바꾸지 않는다.
  if (variety !== name) return items.find((i) => i.itemName === variety && i.level != null);
  const hit = findItemRaw(items, name, raw, title);
  // 원문이 부위를 정했으면('다진소고기'→설도) 그대로 — 등심 상세에서 열었다고 다짐육을 등심값으로 매기면 틀린다.
  if (cutTarget(name, raw, title)) return hit;
  return hit && prefer && prefer.level != null && prefer.itemCode === hit.itemCode ? prefer : hit;
}
function findItemRaw(items: PriceItem[], name: string, raw?: string, title?: string): PriceItem | undefined {
  const live = (i: PriceItem) => i.level != null;
  const cut = cutTarget(name, raw, title);
  const byCut = cut ? items.find((i) => i.itemName === cut && live(i)) : undefined;
  if (byCut) return byCut;
  const q = KAMIS_ALIAS[name] ?? name;
  // 정확 일치를 재료명·별칭 순으로 먼저. includes는 마지막 — '파'가 '양파'에, '호박'이 '애호박'에
  // 걸리는 식이라 정확 일치가 있는데도 먼저 돌면 엉뚱한 품목을 집는다.
  return (
    items.find((i) => i.itemName === name && live(i)) ??
    items.find((i) => i.itemName === q && live(i)) ??
    items.find((i) => i.itemName.includes(q) && live(i))
  );
}
