// 사용자가 Gemini로 만든 품목 이미지(한글 파일명)를 assets/items/{code}[_{kind}].png 로 통합.
//
// 사용법:
//   node scripts/import-item-images.mjs                 # ~/Downloads 미리보기(dry-run)
//   node scripts/import-item-images.mjs --from <dir>    # 다른 폴더에서
//   node scripts/import-item-images.mjs --apply         # 실제 복사 + 최적화 + 맵 재생성
//
// 매핑: 파일명을 KAMIS 품목/종류명과 대조.
//   "토마토.png"        → 225            (품목 대표)
//   "소고기 안심.png"   → 4301_21        (품목+종류)
//   "청오이.png"        → 223            (오이 대표, 종류 미매칭 시 품목)
// 매칭 안 되는 파일(피자·로고 등)은 건너뜀. dry-run으로 먼저 확인 후 --apply.
import { execSync } from 'node:child_process';
import { copyFileSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'assets', 'items');
const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const fromArg = args.indexOf('--from');
const FROM = fromArg > -1 ? args[fromArg + 1] : path.join(homedir(), 'Downloads');

const env = readFileSync(path.join(ROOT, '.env'), 'utf8');
const g = (k) => (env.match(new RegExp('^' + k + '=(.*)$', 'm'))?.[1] ?? '').trim().replace(/^["']|["']$/g, '');
const KEY = g('EXPO_PUBLIC_KAMIS_KEY'), ID = g('EXPO_PUBLIC_KAMIS_ID');

// 파일명 토큰 → KAMIS 품목명 보정
const ALIAS = { 소고기: '소', 쇠고기: '소', 돼지고기: '돼지', 닭고기: '닭', 애호박: '호박', 대파: '파' };

async function catalog() {
  const today = new Date().toISOString().slice(0, 10);
  const rows = [];
  for (const cat of ['100', '200', '400', '500']) {
    const qs = `p_cert_key=${KEY}&p_cert_id=${ID}&p_returntype=json&action=dailyPriceByCategoryList&p_product_cls_code=01&p_country_code=1101&p_regday=${today}&p_convert_kg_yn=N&p_item_category_code=${cat}`;
    const j = await (await fetch(`https://www.kamis.or.kr/service/price/xml.do?${qs}`)).json();
    for (const it of j?.data?.item ?? []) {
      if (it.item_name && it.item_code) {
        rows.push({
          itemCode: String(it.item_code), itemName: String(it.item_name),
          kindCode: String(it.kind_code ?? ''), kindName: String(it.kind_name ?? ''),
        });
      }
    }
  }
  return rows;
}

// 공백·괄호 제거(예: "수입 소고기"→"수입소고기", "육계(kg)"→"육계")
const sq = (s) => (s || '').replace(/\([^)]*\)/g, '').replace(/\s+/g, '');

function resolve(base, rows) {
  const b = sq(base);
  // 1) 품목: itemName(공백제거)이 파일명에 포함되는 것 중 "가장 긴" 것 (수입 소고기 > 소, 양배추 > 배추)
  let item = null;
  for (const row of rows) {
    const iname = sq(row.itemName);
    if (iname && b.includes(iname) && (!item || iname.length > sq(item.itemName).length)) item = row;
  }
  if (!item) return null;
  // 2) 종류: 그 품목의 kindName(core)이 파일명에 포함되고 품목명과 다르면 종류별
  const itemCore = sq(item.itemName);
  let kind = null;
  for (const row of rows) {
    if (row.itemCode !== item.itemCode) continue;
    const kc = sq(row.kindName);
    if (kc && kc !== itemCore && b.includes(kc) && (!kind || kc.length > sq(kind.kindName).length)) kind = row;
  }
  if (kind) return { key: `${item.itemCode}_${kind.kindCode}`, label: `${item.itemName} ${kind.kindName}` };
  return { key: `${item.itemCode}`, label: item.itemName };
}

function optimize(file) {
  execSync(`sips -s format png "${file}" --out "${file}"`, { stdio: 'ignore' }); // jpeg 등 → png 보장
  const h = execSync(`sips -g pixelHeight "${file}"`).toString().match(/pixelHeight:\s*(\d+)/)?.[1];
  if (h) execSync(`sips -c ${h} ${h} "${file}" --out "${file}"`, { stdio: 'ignore' }); // 가운데 정사각
  execSync(`sips -Z 600 "${file}" --out "${file}"`, { stdio: 'ignore' }); // 600px
}

function regenMap() {
  const files = readdirSync(OUT_DIR).filter((f) => f.endsWith('.png')).sort();
  const lines = files.map((f) => `  '${f.replace(/\.png$/, '')}': require('../assets/items/${f}'),`);
  writeFileSync(
    path.join(ROOT, 'src', 'thumbnails.gen.ts'),
    `// 자동 생성 — scripts/import-item-images.mjs. 직접 수정 금지.\n// 키: \`{itemCode}\` 또는 종류별 \`{itemCode}_{kindCode}\`. 조회는 thumbFor() 사용.\nexport const THUMBS: Record<string, number> = {\n${lines.join('\n')}\n};\n`,
  );
  return files.length;
}

const rows = await catalog();
const files = readdirSync(FROM).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
const mapped = [], skipped = [], seen = new Map();
for (const f of files) {
  // macOS 파일명은 NFD(자모 분리) → KAMIS 문자열(NFC)과 비교되도록 정규화
  const base = f.replace(/\.(png|jpe?g|webp)$/i, '').normalize('NFC');
  const r = resolve(base, rows);
  if (!r) { skipped.push(f); continue; }
  if (seen.has(r.key)) mapped.push({ f, ...r, warn: `중복 키(${seen.get(r.key)} 와 같음) — 나중 파일이 덮어씀` });
  else mapped.push({ f, ...r });
  seen.set(r.key, f);
}

console.log(`\n입력: ${FROM}  (png ${files.length}개, KAMIS 카탈로그 ${rows.length}행)  —  ${APPLY ? 'APPLY' : 'DRY-RUN(미리보기)'}\n`);
console.log('매핑됨:');
for (const m of mapped) console.log(`  ${m.f}  →  ${m.key}.png  (${m.label})${m.warn ? '  ⚠ ' + m.warn : ''}`);
console.log(`\n건너뜀(품목 매칭 없음): ${skipped.length}개`);
if (skipped.length) console.log('  ' + skipped.join(', '));

if (APPLY) {
  for (const m of mapped) {
    const dst = path.join(OUT_DIR, `${m.key}.png`);
    copyFileSync(path.join(FROM, m.f), dst);
    optimize(dst);
  }
  const n = regenMap();
  console.log(`\n적용 완료: ${mapped.length}개 복사·최적화, thumbnails.gen.ts ${n}개로 재생성`);
} else {
  console.log('\n실제 적용하려면 --apply 를 붙이세요.');
}
