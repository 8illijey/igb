// 품목 썸네일을 검색엔진이 읽을 수 있는 고정 주소로 내보낸다.
//   assets/items/211_02.jpg  →  dist/items/211-02.jpg
//
// 왜 복사하나:
//   앱은 require()로 이미지를 찾지만 번들러가 파일명에 해시를 붙인다
//   (211_02.951f4e….jpg). 상세 페이지 <head>의 구조화 데이터에는 문자열 주소가
//   들어가야 하는데, 해시를 알아내려면 빌드 산출물을 뒤져야 하고 번들러가
//   경로 규칙을 바꾸면 조용히 깨진다. <head> 안이라 화면에 티도 안 난다.
//   KAMIS 키를 그대로 쓴 사본을 두면 주소가 항상 /items/{key}.jpg로 고정된다.
//
// 용량은 배포 산출물에만 3MB가량 늘고 git에는 안 들어간다.

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const argv = process.argv.slice(2);
const arg = (k, d) => {
  const i = argv.indexOf(k);
  return i < 0 ? d : argv[i + 1];
};

// seo.gen.ts는 기계 생성 파일이라 형식이 고정이다(gen-og.mjs와 같은 방식).
function readItems() {
  const src = readFileSync(path.join(ROOT, 'src/seo.gen.ts'), 'utf8');
  const marker = 'SEO_ITEMS: SeoItem[] = ';
  const start = src.indexOf(marker);
  if (start < 0) throw new Error('seo.gen.ts에서 SEO_ITEMS를 못 찾았다.');
  const open = src.indexOf('[', start + marker.length - 1);
  const close = src.indexOf('\n];', open);
  return JSON.parse(src.slice(open, close + 2));
}

const srcDir = path.join(ROOT, 'assets/items');
const outDir = path.resolve(ROOT, arg('--out', 'dist/items'));
mkdirSync(outDir, { recursive: true });

let copied = 0;
const missing = [];
for (const it of readItems()) {
  const [itemCode, kindCode] = it.key.split('-');
  // thumbFor()와 같은 규칙 — 종류별 이미지가 있으면 우선, 없으면 품목 대표.
  const candidates = [`${itemCode}_${kindCode}.jpg`, `${itemCode}.jpg`];
  const found = candidates.map((f) => path.join(srcDir, f)).find(existsSync);
  if (!found) {
    missing.push(`${it.key}(${it.name})`);
    continue;
  }
  copyFileSync(found, path.join(outDir, `${it.key}.jpg`));
  copied++;
}

console.log(`품목 이미지 ${copied}장 → ${outDir}`);
if (missing.length) console.warn(`  이미지 없음 ${missing.length}개: ${missing.join(', ')}`);
