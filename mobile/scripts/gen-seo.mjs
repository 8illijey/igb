/**
 * 검색엔진용 정적 데이터 생성 — src/seo.gen.ts + public/robots.txt + public/sitemap.xml
 *
 * 왜 필요한가 (2026-08-21 실측):
 *  · 상세 82개가 홈과 **1바이트도 다르지 않은 HTML**을 내려주고 있었다(38,060 bytes 동일).
 *    품목명도 가격도 HTML에 없어서, 검색엔진 눈엔 '제목 없는 똑같은 페이지 82개'였다.
 *  · 구글은 JS를 실행해 주지만 네이버 크롤러는 사실상 못 한다. 한국 서비스라 정적 HTML이 필수다.
 *
 * 이름 규칙은 앱과 절대 어긋나면 안 되므로 src/api/kamis.ts를 그대로 import한다.
 * (kamis.ts는 타입 하나만 import하는 순수 모듈이라 Node 24의 타입 스트리핑으로 바로 불러진다.
 *  build-verdicts처럼 규칙을 베껴 쓰면 또 어긋난다 — 2026-08-20에 실제로 겪었다.)
 *
 * 사용법: node scripts/gen-seo.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://igeobissa.com';

const { fetchAllCategories } = await import(path.join(ROOT, 'src/api/kamis.ts'));
const { recipeSlug } = await import(path.join(ROOT, 'src/recipeSlug.ts'));

const items = await fetchAllCategories();
if (items.length < 40) {
  // KAMIS 장애 중에 빈 목록으로 파일을 덮으면 사이트맵이 통째로 날아간다 — 기존 파일 유지.
  console.error(`품목이 ${items.length}개뿐 — 생성 중단(기존 파일 유지)`);
  process.exit(1);
}

// ── 레시피 ──
// 상세를 정적으로 내려면 빌드 시점에 목록을 알아야 한다. 앛은 워커가 주1회 갱신하므로
// 매일 CI가 이 스크립트를 돌리면 자연스럽게 따라간다. 실패하면 레시피만 빼고 계속한다
// — 품목 82개 사이트맵까지 날릴 이유는 없다.
const RECIPES_URL = 'https://igeobissa-recipes.designerxyzi.workers.dev/recipes';
let recipes = [];
try {
  const res = await fetch(RECIPES_URL);
  const json = await res.json();
  recipes = (json?.recipes ?? [])
    .map((r) => String(r?.title ?? '').trim())
    .filter(Boolean)
    .map((title) => ({ slug: recipeSlug(title), title }));
  // 제목이 같으면 주소가 겹친다 — 먼저 것만 남긴다.
  const seen = new Set();
  recipes = recipes.filter((r) => !seen.has(r.slug) && seen.add(r.slug));
} catch (e) {
  console.warn(`  레시피 목록을 못 받았다(${e.message}) — 레시피 없이 진행한다.`);
}

// ── 시세 맥락(verdicts) ──
// 상세 정적 본문이 전 품목 공용 템플릿 문장뿐이라 얇은 중복 문서로 취급됐다(2026-09-03 진단:
// 네이버가 상세 82개 중 0개 수집). 품목마다 다른 실데이터 문장을 만들려고 평년·월별 흐름을 싣는다.
// verdicts.json은 같은 CI 회차에서 build-verdicts.mjs가 직전에 만든 파일이다.
let verdicts = {};
try {
  verdicts = JSON.parse(readFileSync(path.join(ROOT, 'public/verdicts.json'), 'utf8')).items ?? {};
} catch (e) {
  console.warn(`  verdicts.json을 못 읽었다(${e.message}) — 시세 맥락 없이 진행한다.`);
}

// 겨울 품목 조사월 [1,2,11,12]를 '11·12·1·2월'로 읽히게 — 가장 긴 공백 다음 달부터 시작.
function seasonOrder(ms) {
  let cut = 0, best = -1;
  for (let i = 0; i < ms.length; i++) {
    const gap = (ms[(i + 1) % ms.length] - ms[i] + 12) % 12 || 12;
    if (gap > best) { best = gap; cut = (i + 1) % ms.length; }
  }
  return [...ms.slice(cut), ...ms.slice(0, cut)];
}

// price를 같이 넣는다 — 상세 제목이 '배추 5,684원 | 이거비싸?' 형태라 정적 HTML에도 값이 있어야 한다.
// 매일 verdicts CI가 이 스크립트를 돌리고 커밋 → Vercel 재배포라 제목의 가격도 매일 갱신된다.
const rows = items
  .map((i) => {
    const key = `${i.itemCode}-${i.kindCode}`;
    const v = verdicts[key] ?? {};
    const valid = (Array.isArray(v.months) ? v.months : [])
      .map((m, idx) => ({ m, idx }))
      .filter((x) => x.m != null);
    // 상세 화면 AnnualFlow와 같은 기준: 조사월 6개 이상이어야 '가장 싼/비싼 달'을 말한다.
    // 그 미만이면 제철 품목 — 조사월 목록만 말한다(일부 철로 연간 흐름을 주장하면 오해).
    let minMonth = null, maxMonth = null, seasonMonths = null;
    if (valid.length >= 6) {
      minMonth = valid.reduce((a, b) => (b.m < a.m ? b : a)).idx + 1;
      maxMonth = valid.reduce((a, b) => (b.m > a.m ? b : a)).idx + 1;
    } else if (valid.length >= 1) {
      seasonMonths = seasonOrder(valid.map((x) => x.idx + 1));
    }
    return { key, name: i.itemName, unit: i.unit, price: i.today ?? null, normal: v.normal ?? null, minMonth, maxMonth, seasonMonths };
  })
  .sort((a, b) => a.key.localeCompare(b.key));

// ── src/seo.gen.ts ──────────────────────────────────────────────────────────
// 앱이 build 시점에 import한다. 정적 렌더링(SSG) 때 품목명을 알아야
// <title>과 본문에 이름이 박힌다. 런타임에도 첫 화면 이름을 즉시 띄우는 데 쓴다.
writeFileSync(
  path.join(ROOT, 'src/seo.gen.ts'),
  `// 자동 생성 — scripts/gen-seo.mjs. 직접 수정 금지.
// 검색엔진용 품목 목록. 이름은 앱의 labelOf(홈 목록과 동일 규칙)로 만들어진다.
export interface SeoItem {
  key: string;
  name: string;
  unit: string;
  /** 빌드 시점 가격 — 정적 HTML의 제목에 쓴다. 라이브 값이 오면 그걸로 덮는다. */
  price: number | null;
  /** 이맘때 평년 평균(verdicts) — 정적 본문의 비교 문장에 쓴다. */
  normal: number | null;
  /** 연중 가장 싼/비싼 달(1~12). 조사월 6개 이상일 때만 값이 있다. */
  minMonth: number | null;
  maxMonth: number | null;
  /** 제철 품목(조사월 6개 미만)의 조사월 목록 — 철 시작 달부터 정렬. */
  seasonMonths: number[] | null;
}
export const SEO_ITEMS: SeoItem[] = ${JSON.stringify(rows, null, 2)};
/** 이 파일을 만든 날(YYYYMMDD). 공유 카드 이미지 URL의 캐시 무효화에 쓴다 —
 *  카톡은 OG 이미지를 오래 캐싱해서 주소가 같으면 어제 가격이 계속 보인다. */
export const SEO_BUILD_DAY = '${new Date().toISOString().slice(0, 10).replace(/-/g, '')}';
export const SEO_BY_KEY: Record<string, SeoItem> = Object.fromEntries(SEO_ITEMS.map((i) => [i.key, i]));

/** 레시피 상세를 정적으로 내리기 위한 목록. 주소는 순번이 아니라 제목 슬러그다. */
export interface SeoRecipe {
  slug: string;
  title: string;
}
export const SEO_RECIPES: SeoRecipe[] = ${JSON.stringify(recipes, null, 2)};
`,
);

// ── public/robots.txt ───────────────────────────────────────────────────────
// 지금은 robots.txt·sitemap.xml 요청이 SPA HTML로 응답된다(catch-all rewrite 때문).
// public/에 실제 파일을 두면 rewrite보다 먼저 잡힌다.
writeFileSync(
  path.join(ROOT, 'public/robots.txt'),
  `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`,
);

// ── public/sitemap.xml ──────────────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: `${SITE}/`, pri: '1.0', freq: 'daily' },
  { loc: `${SITE}/recipes`, pri: '0.6', freq: 'weekly' },
  // 방문 통계를 수집하므로 방침 페이지가 검색으로도 닿아야 한다.
  // 내용이 거의 안 바뀌니 빈도는 yearly, 우선순위는 낮게.
  { loc: `${SITE}/privacy`, pri: '0.2', freq: 'yearly' },
  ...rows.map((r) => ({ loc: `${SITE}/item/${r.key}`, pri: '0.8', freq: 'daily' })),
  // 레시피는 재료 시세가 매일 바뀌지만 글 자체는 안 바뀜다 — weekly.
  ...recipes.map((r) => ({ loc: `${SITE}/recipe/${encodeURIComponent(r.slug)}`, pri: '0.5', freq: 'weekly' })),
];
writeFileSync(
  path.join(ROOT, 'public/sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>${u.freq}</changefreq><priority>${u.pri}</priority></url>`,
  )
  .join('\n')}
</urlset>
`,
);

console.log(`완료 — 품목 ${rows.length}개 / 레시피 ${recipes.length}개`);
console.log(`  src/seo.gen.ts`);
console.log(`  public/robots.txt`);
console.log(`  public/sitemap.xml (URL ${urls.length}개)`);
