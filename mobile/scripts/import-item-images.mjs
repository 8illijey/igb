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
// 저장 형식: assets/items/{code}.jpg (500px, q80). 입력은 png/jpg/webp 뭐든 된다.
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

// 500px JPEG q80 — 예전엔 600px PNG였는데 사진을 PNG로 두면 장당 500~600KB라
// 홈 첫 화면에 보이는 7장만 3.6MB였다(2026-08-20 측정). 전부 JPEG로 바꿔 49MB→3.4MB.
// · 표시 크기는 최대 146px(홈 그리드 카드) — 3배수 대응으로 500px면 충분하다.
// · 96장 전부 투명 픽셀이 0개라(캔버스로 전수 검사) 알파가 필요 없다.
// · WebP가 30%가량 더 작지만 macOS sips가 webp 출력을 못 해 별도 설치가 필요하다 —
//   이 스크립트를 맥OS 기본 도구만으로 돌아가게 두려고 JPEG을 택했다.
function optimize(file) {
  const h = execSync(`sips -g pixelHeight "${file}"`).toString().match(/pixelHeight:\s*(\d+)/)?.[1];
  if (h) execSync(`sips -c ${h} ${h} "${file}" --out "${file}"`, { stdio: 'ignore' }); // 가운데 정사각
  execSync(`sips -Z 500 -s format jpeg -s formatOptions 80 "${file}" --out "${file}"`, { stdio: 'ignore' });
}

function regenMap() {
  const files = readdirSync(OUT_DIR).filter((f) => f.endsWith('.jpg')).sort();
  const lines = files.map((f) => `  '${f.replace(/\.jpg$/, '')}': require('../assets/items/${f}'),`);
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
for (const m of mapped) console.log(`  ${m.f}  →  ${m.key}.jpg  (${m.label})${m.warn ? '  ⚠ ' + m.warn : ''}`);
console.log(`\n건너뜀(품목 매칭 없음): ${skipped.length}개`);
if (skipped.length) console.log('  ' + skipped.join(', '));

if (APPLY) {
  for (const m of mapped) {
    const dst = path.join(OUT_DIR, `${m.key}.jpg`);
    copyFileSync(path.join(FROM, m.f), dst);
    optimize(dst);
  }
  const n = regenMap();
  console.log(`\n적용 완료: ${mapped.length}개 복사·최적화, thumbnails.gen.ts ${n}개로 재생성`);
} else {
  console.log('\n실제 적용하려면 --apply 를 붙이세요.');
}
