// 레시피 사진(직접 Gemini로 생성)을 assets/recipes/ 로 통합.
//
// 파일명 규칙 (recipes.gen.json 의 제목과 일치):
//   "부드러운 두부 애호박 된장찌개.png"      → 히어로
//   "부드러운 두부 애호박 된장찌개 1.png"    → 1단계 이미지 (제목 + 공백 + 단계번호)
//
// 사용법:
//   node scripts/import-recipe-images.mjs                # ~/Downloads 미리보기(dry-run)
//   node scripts/import-recipe-images.mjs --from <dir>
//   node scripts/import-recipe-images.mjs --apply        # 실제 복사 + 최적화 + 맵 재생성
import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets', 'recipes');
const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const fromArg = args.indexOf('--from');
const FROM = fromArg > -1 ? args[fromArg + 1] : path.join(homedir(), 'Downloads');

const titles = JSON.parse(readFileSync(path.join(ROOT, 'src', 'recipes.gen.json'), 'utf8')).recipes.map((r) => r.title);

function resolve(base) {
  for (let i = 0; i < titles.length; i++) {
    const t = titles[i];
    if (base === t) return { i, asset: `r${i}.jpg`, key: t, label: `${t} (히어로)` };
    if (base === `${t} 재료모음`) return { i, asset: `r${i}_ing.jpg`, key: `${t}__ingredients`, label: `${t} (재료모음)` };
    if (base.startsWith(t + ' ')) {
      const rest = base.slice(t.length + 1).trim();
      if (/^\d+$/.test(rest)) return { i, asset: `r${i}_s${rest}.jpg`, key: `${t}__${rest}`, label: `${t} (${rest}단계)` };
    }
  }
  return null;
}

// JPEG q80 — PNG로 두면 히어로 한 장이 900KB라 레시피 에셋만 11MB였다(2026-08-20).
// 표시 크기 기준으로 줄인다: 앱 최대 폭이 480px이라 히어로는 900px이면 2배수까지 충분하고,
// 단계 사진은 64px로 그리므로 192px(3배수)면 된다. 30장 11MB → 0.9MB.
function optimize(file, square) {
  if (square) {
    const h = execSync(`sips -g pixelHeight "${file}"`).toString().match(/pixelHeight:\s*(\d+)/)?.[1];
    if (h) execSync(`sips -c ${h} ${h} "${file}" --out "${file}"`, { stdio: 'ignore' });
    execSync(`sips -Z 192 -s format jpeg -s formatOptions 80 "${file}" --out "${file}"`, { stdio: 'ignore' }); // 단계 썸네일(64px 표시)
  } else {
    execSync(`sips -Z 900 -s format jpeg -s formatOptions 80 "${file}" --out "${file}"`, { stdio: 'ignore' }); // 히어로(가로형 유지)
  }
}

function regenMap() {
  const files = existsSync(OUT) ? readdirSync(OUT).filter((f) => /^r\d/.test(f)) : [];
  const lines = [];
  files.forEach((f) => {
    const m = f.match(/^r(\d+)(?:_s(\d+)|(_ing))?\.jpg$/);
    if (!m) return;
    const t = titles[Number(m[1])];
    if (!t) return;
    const key = m[3] ? `${t}__ingredients` : m[2] ? `${t}__${m[2]}` : t;
    lines.push(`  ${JSON.stringify(key)}: require('../assets/recipes/${f}'),`);
  });
  writeFileSync(
    path.join(ROOT, 'src', 'recipeImages.gen.ts'),
    `// 자동 생성 — scripts/import-recipe-images.mjs. 직접 수정 금지.\n// 키: 레시피 제목(히어로) 또는 \`\${제목}__\${단계번호}\`.\nexport const RECIPE_IMAGES: Record<string, number> = {\n${lines.join('\n')}\n};\n`,
  );
  return lines.length;
}

const files = readdirSync(FROM).filter((f) => f.toLowerCase().endsWith('.png'));
const mapped = [], skipped = [];
for (const f of files) {
  const base = f.replace(/\.png$/i, '').normalize('NFC');
  const r = resolve(base);
  if (r) mapped.push({ f, ...r });
  else skipped.push(f);
}

console.log(`\n입력: ${FROM} (png ${files.length}개) — ${APPLY ? 'APPLY' : 'DRY-RUN(미리보기)'}\n`);
console.log('매핑됨:');
for (const m of mapped) console.log(`  ${m.f}  →  assets/recipes/${m.asset}  (${m.label})`);
if (!mapped.length) console.log('  (없음)');
console.log(`\n건너뜀: ${skipped.length}개`);

if (APPLY && mapped.length) {
  mkdirSync(OUT, { recursive: true });
  for (const m of mapped) {
    const dst = path.join(OUT, m.asset);
    copyFileSync(path.join(FROM, m.f), dst);
    optimize(dst, m.asset.includes('_s'));
  }
  const n = regenMap();
  console.log(`\n적용 완료: ${mapped.length}개 복사·최적화, recipeImages.gen.ts ${n}개로 재생성`);
} else if (!APPLY) {
  console.log('\n실제 적용하려면 --apply 를 붙이세요.');
}
