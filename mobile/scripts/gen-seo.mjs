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
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://igeobissa.com';

const { fetchAllCategories } = await import(path.join(ROOT, 'src/api/kamis.ts'));

const items = await fetchAllCategories();
if (items.length < 40) {
  // KAMIS 장애 중에 빈 목록으로 파일을 덮으면 사이트맵이 통째로 날아간다 — 기존 파일 유지.
  console.error(`품목이 ${items.length}개뿐 — 생성 중단(기존 파일 유지)`);
  process.exit(1);
}

// price를 같이 넣는다 — 상세 제목이 '배추 5,684원 | 이거비싸?' 형태라 정적 HTML에도 값이 있어야 한다.
// 매일 verdicts CI가 이 스크립트를 돌리고 커밋 → Vercel 재배포라 제목의 가격도 매일 갱신된다.
const rows = items
  .map((i) => ({ key: `${i.itemCode}-${i.kindCode}`, name: i.itemName, unit: i.unit, price: i.today ?? null }))
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
}
export const SEO_ITEMS: SeoItem[] = ${JSON.stringify(rows, null, 2)};
/** 이 파일을 만든 날(YYYYMMDD). 공유 카드 이미지 URL의 캐시 무효화에 쓴다 —
 *  카톡은 OG 이미지를 오래 캐싱해서 주소가 같으면 어제 가격이 계속 보인다. */
export const SEO_BUILD_DAY = '${new Date().toISOString().slice(0, 10).replace(/-/g, '')}';
export const SEO_BY_KEY: Record<string, SeoItem> = Object.fromEntries(SEO_ITEMS.map((i) => [i.key, i]));
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
  ...rows.map((r) => ({ loc: `${SITE}/item/${r.key}`, pri: '0.8', freq: 'daily' })),
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

console.log(`완료 — 품목 ${rows.length}개`);
console.log(`  src/seo.gen.ts`);
console.log(`  public/robots.txt`);
console.log(`  public/sitemap.xml (URL ${urls.length}개)`);
