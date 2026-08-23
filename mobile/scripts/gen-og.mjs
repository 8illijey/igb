// 상세 페이지 OG 이미지 생성 — 품목명 + 오늘 가격이 박힌 1200×630 카드.
//
// 사용법:
//   node scripts/gen-og.mjs --out dist/og                      # 전체 생성 (빌드용)
//   node scripts/gen-og.mjs --out /tmp/og --only 211-02,412-01
//   node scripts/gen-og.mjs --out /tmp/og --font <폰트파일>      # 폰트 바꿔 미리보기
//
// 왜 빌드 때 만들고 git에 안 넣나:
//   가격이 매일 바뀌니 이미지도 매일 바뀐다. PNG는 git 델타 압축이 거의 안 먹어서
//   84장(약 1.2MB)을 매일 커밋하면 1년에 400MB 넘게 쌓인다. 배포 산출물에만 넣으면
//   레포는 그대로고, 매일 도는 verdicts 커밋이 배포를 트리거하니 자동으로 최신화된다.
//
// 렌더러가 WASM인 이유:
//   네이티브 @resvg/resvg-js는 macOS 코드서명 정책에 막혀 로컬에서 dlopen이 실패한다.
//   WASM 빌드는 플랫폼 바이너리가 없어 로컬·CI·Vercel 어디서나 같은 결과가 나온다.

import { initWasm, Resvg } from '@resvg/resvg-wasm';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ── 디자인 사양 ────────────────────────────────────────────────────────────
// 피그마 목업(og-detail-long/short.png)에서 픽셀로 실측한 값이다.
//   캔버스 1200×630 / 배경 #F6F8FA / 글자 #141F2C / 단위 #87919C
//   제목은 고정 크기가 아니다. 짧은 이름은 크게, 길면 폭 1000에 맞춰 줄어든다.
//   (목업 '오이' 잉크폭 245 / '수입 소고기 갈비살 비싸?' 잉크폭 999)
//   세로는 잉크 아랫변으로 고정한다 — 제목 y≈308, 가격 y≈416.
const W = 1200;
const H = 630;
const BG = '#F6F8FA';
const FG = '#141F2C';
const FG_UNIT = '#87919C'; // 앱 theme의 priceUnit 토큰과 같은 값

// 아래는 "픽셀 목표"라서 폰트를 바꿔도 그대로 둔다.
// 실제 font-size와 baseline은 렌더러의 bbox를 재서 매번 역산한다(cal 참조).
const TITLE = {
  refInk: { text: '오이', width: 245 }, // 이 문구가 이 잉크폭이 되는 크기를 최대 크기로 삼는다
  maxWidth: 1000, // 좌우 100px 여백
  inkBottom: 308,
  lineGap: 1.08, // 두 줄일 때 줄 간격(폰트 크기 배수)
};
const PRICE = {
  refInk: { text: '1,234원', width: 218 },
  inkBottom: 416,
  unitRatio: 0.58, // 단위 글자 크기(가격 대비)
};

const FONT_FAMILY = 'OGFont';

// ── 유틸 ──────────────────────────────────────────────────────────────────
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// seo.gen.ts는 기계 생성 파일이라 형식이 고정이다. TS를 import하면 Node 버전(타입 스트리핑)에
// 묶이므로, 배열만 떼어내 JSON으로 읽는다.
function readItems() {
  const src = readFileSync(path.join(ROOT, 'src/seo.gen.ts'), 'utf8');
  const marker = 'SEO_ITEMS: SeoItem[] = ';
  const start = src.indexOf(marker);
  if (start < 0) throw new Error('seo.gen.ts에서 SEO_ITEMS를 못 찾았다. gen-seo.mjs를 먼저 돌려라.');
  // `SeoItem[]`의 대괄호가 아니라 대입 뒤의 배열 시작을 잡아야 한다.
  const open = src.indexOf('[', start + marker.length - 1);
  const close = src.indexOf('\n];', open);
  if (open < 0 || close < 0) throw new Error('seo.gen.ts 형식이 예상과 다르다.');
  return JSON.parse(src.slice(open, close + 2));
}

// ── 실행 준비 ──────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const arg = (k, d) => {
  const i = argv.indexOf(k);
  return i < 0 ? d : argv[i + 1];
};

await initWasm(readFileSync(path.join(ROOT, 'node_modules/@resvg/resvg-wasm/index_bg.wasm')));

const fontPath = path.resolve(ROOT, arg('--font', 'assets/fonts/GangwonEdu-TteunTteun.otf'));
const fontBuf = readFileSync(fontPath);
const fontOpt = { font: { fontBuffers: [fontBuf], defaultFontFamily: FONT_FAMILY } };

// 한 줄을 주어진 크기로 그렸을 때의 잉크 상자. baseline은 임의값을 쓰고
// 상대량(폭, baseline 대비 아랫변)만 뽑는다.
const PROBE_BASELINE = 500;
function inkBox(text, size) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="1000"><text x="${W / 2}" y="${PROBE_BASELINE}" font-family="${FONT_FAMILY}" font-size="${size}" text-anchor="middle">${esc(text)}</text></svg>`;
  const b = new Resvg(svg, fontOpt).getBBox();
  if (!b) throw new Error(`bbox 계산 실패: "${text}"`);
  return { width: b.width, height: b.height, bottomFromBaseline: b.y + b.height - PROBE_BASELINE };
}

// 목표 잉크폭이 나오는 font-size를 역산한다. 글자 폭은 크기에 비례하므로 한 번 재고 나누면 된다.
function sizeForInkWidth(text, targetWidth) {
  const REF = 100;
  return (REF * targetWidth) / inkBox(text, REF).width;
}

// 폰트를 바꿔도 사람이 숫자를 다시 맞출 필요가 없도록 시작할 때 한 번 계산해 둔다.
const cal = {
  titleMaxSize: sizeForInkWidth(TITLE.refInk.text, TITLE.refInk.width),
  priceSize: sizeForInkWidth(PRICE.refInk.text, PRICE.refInk.width),
};

// 잉크 아랫변을 목표에 맞추는 baseline. (아랫변 = baseline + 폰트별 오프셋)
const baselineFor = (text, size, inkBottom) => inkBottom - inkBox(text, size).bottomFromBaseline;

// ── 카드 조립 ──────────────────────────────────────────────────────────────
function buildSvg(name, price, unit) {
  // 제목: 최대 크기로 그려보고 폭이 넘치면 그만큼 줄인다. 그래도 심하면 두 줄로 나눈다.
  let lines = [name];
  let size = cal.titleMaxSize;
  const full = inkBox(name, size).width;
  if (full > TITLE.maxWidth) {
    const shrunk = (size * TITLE.maxWidth) / full;
    // 절반 이하로 쪼그라들 정도면 줄바꿈이 낫다. 현재 카탈로그(최장 11자)에선 걸리지 않는다.
    if (shrunk < cal.titleMaxSize * 0.5 && name.includes(' ')) {
      const words = name.split(' ');
      let best = null;
      for (let i = 1; i < words.length; i++) {
        const a = words.slice(0, i).join(' ');
        const b = words.slice(i).join(' ');
        const diff = Math.abs(inkBox(a, 100).width - inkBox(b, 100).width);
        if (!best || diff < best.diff) best = { a, b, diff };
      }
      lines = [best.a, best.b];
      const widest = Math.max(inkBox(lines[0], size).width, inkBox(lines[1], size).width);
      if (widest > TITLE.maxWidth) size = (size * TITLE.maxWidth) / widest;
    } else {
      size = shrunk;
    }
  }

  const baseLast = baselineFor(lines[lines.length - 1], size, TITLE.inkBottom);
  const titleSvg = lines
    .map((t, i) => {
      const y = baseLast - (lines.length - 1 - i) * size * TITLE.lineGap;
      return `<text x="${W / 2}" y="${y.toFixed(2)}" font-family="${FONT_FAMILY}" font-size="${size.toFixed(2)}" fill="${FG}" text-anchor="middle">${esc(t)}</text>`;
    })
    .join('');

  // 가격: 크기 고정. 단위는 같은 줄에 작고 흐리게 붙인다.
  // 이름에 이미 단위가 들어있으면(쌀 20kg, 계란 30구 등) 중복이라 생략한다.
  let priceSvg = '';
  if (price != null) {
    const num = `${price.toLocaleString('ko-KR')}원`;
    const showUnit = unit && !name.includes(unit);
    const unitTspan = showUnit
      ? `<tspan font-size="${(cal.priceSize * PRICE.unitRatio).toFixed(2)}" fill="${FG_UNIT}"> / ${esc(unit)}</tspan>`
      : '';
    const y = baselineFor(num, cal.priceSize, PRICE.inkBottom);
    priceSvg = `<text x="${W / 2}" y="${y.toFixed(2)}" font-family="${FONT_FAMILY}" font-size="${cal.priceSize.toFixed(2)}" fill="${FG}" text-anchor="middle">${esc(num)}${unitTspan}</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${BG}"/>${titleSvg}${priceSvg}</svg>`;
}

const render = (svg) => new Resvg(svg, fontOpt).render().asPng();

// ── 생성 ──────────────────────────────────────────────────────────────────
const outDir = path.resolve(ROOT, arg('--out', 'dist/og'));
mkdirSync(outDir, { recursive: true });

const only = arg('--only', null)?.split(',').map((s) => s.trim());
const items = readItems().filter((i) => !only || only.includes(i.key));
if (!items.length) throw new Error('생성할 품목이 없다. seo.gen.ts를 확인해라.');

let bytes = 0;
for (const it of items) {
  const png = render(buildSvg(it.name, it.price, it.unit));
  writeFileSync(path.join(outDir, `${it.key}.png`), png);
  bytes += png.length;
}
console.log(
  `OG ${items.length}장 → ${outDir} (${(bytes / 1024).toFixed(0)}KB)\n` +
    `  폰트 ${path.basename(fontPath)} / 제목 최대 ${cal.titleMaxSize.toFixed(1)}px · 가격 ${cal.priceSize.toFixed(1)}px (자동 보정)`,
);
