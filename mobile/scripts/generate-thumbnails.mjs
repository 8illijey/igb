#!/usr/bin/env node
/**
 * 품목 썸네일 일괄 생성 — Gemini 이미지 생성 API.
 *
 * 사용법:
 *   1) mobile/.env 에 GEMINI_API_KEY=... 추가 (EXPO_PUBLIC_ 접두사 금지 — 앱 번들에 들어가면 안 됨)
 *   2) node scripts/generate-thumbnails.mjs           # 전체 (이미 있는 파일은 건너뜀)
 *      node scripts/generate-thumbnails.mjs --limit 3 # 스타일 확인용 시범 생성
 *
 * 결과:
 *   assets/items/{품목코드}.png
 *   src/thumbnails.gen.ts (품목코드 → require 맵, 자동 생성)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'assets', 'items');
const MAP_FILE = path.join(ROOT, 'src', 'thumbnails.gen.ts');

for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')) {
  const [k, ...v] = line.split('=');
  if (k && v.length) process.env[k.trim()] ??= v.join('=').trim();
}
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const TOGETHER_KEY = process.env.TOGETHER_API_KEY;
const CF_ACCOUNT = process.env.CF_ACCOUNT_ID;
const CF_TOKEN = process.env.CF_API_TOKEN;
const KAMIS_KEY = process.env.EXPO_PUBLIC_KAMIS_KEY;
const KAMIS_ID = process.env.EXPO_PUBLIC_KAMIS_ID;

// provider: cloudflare(Workers AI, 무료 일일 할당) | together(결제) | gemini(결제)
const provArg = process.argv.indexOf('--provider');
const PROVIDER = provArg > -1 ? process.argv[provArg + 1] : 'cloudflare';
if (PROVIDER === 'gemini' && !GEMINI_KEY) {
  console.error('GEMINI_API_KEY가 없습니다 (.env, EXPO_PUBLIC_ 접두사 없이).');
  process.exit(1);
}
if (PROVIDER === 'together' && !TOGETHER_KEY) {
  console.error('TOGETHER_API_KEY가 없습니다.');
  process.exit(1);
}
if (PROVIDER === 'cloudflare' && (!CF_ACCOUNT || !CF_TOKEN)) {
  console.error('CF_ACCOUNT_ID / CF_API_TOKEN이 없습니다. Cloudflare 대시보드에서 발급해 .env에 추가하세요.');
  process.exit(1);
}

// 품목코드 → 영문 피사체. FLUX는 한글을 못 알아들어 영어 명사구로 넣는다(스타일은 동일).
const EN = {
  '111': 'a small pile of white rice grains',
  '112': 'a small pile of glutinous white rice grains',
  '141': 'a small pile of soybeans',
  '142': 'a small pile of red adzuki beans',
  '143': 'a small pile of green mung beans',
  '151': 'a single fresh sweet potato, vegetable produce',
  '152': 'a brown potato vegetable, grocery food photography',
  '211': 'a single napa cabbage',
  '212': 'a single round green cabbage',
  '213': 'a bunch of fresh spinach',
  '214': 'a bunch of fresh green lettuce leaves',
  '215': 'a bunch of young napa cabbage greens',
  '221': 'a round green watermelon, fresh fruit',
  '222': 'a single yellow Korean melon',
  '223': 'a green cucumber, fresh salad vegetable, grocery food photography',
  '224': 'a single green zucchini',
  '225': 'a single red tomato',
  '231': 'a long white radish vegetable, grocery food photography',
  '232': 'a single carrot',
  '233': 'a bunch of young summer radish greens',
  '241': 'a small pile of dried red chili peppers',
  '242': 'a few green chili peppers',
  '243': 'a few fresh red chili peppers',
  '245': 'a single onion',
  '246': 'a bunch of green onions',
  '247': 'a piece of fresh ginger root',
  '248': 'a small pile of red chili powder',
  '252': 'a bunch of fresh water dropwort greens',
  '253': 'a stack of green perilla leaves',
  '255': 'a single green bell pepper',
  '256': 'a single red bell pepper',
  '257': 'a single round melon',
  '258': 'a small pile of peeled garlic cloves',
  '279': 'a single small baby napa cabbage',
  '280': 'a single head of broccoli',
  '422': 'a few cherry tomatoes',
  '411': 'a single red apple',
  '412': 'a single round Asian pear',
  '413': 'a single ripe peach, fresh fruit',
  '414': 'a bunch of dark purple grapes',
  '415': 'a few mandarin oranges with green leaves',
  '418': 'a single bunch of bananas',
  '419': 'a single kiwi fruit',
  '420': 'a single pineapple',
  '421': 'a single orange',
  '424': 'a single lemon',
  '425': 'a small pile of red cherries',
  '428': 'a single mango',
  '430': 'a single avocado',
  '4301': 'a piece of fresh raw beef',
  '4304': 'a piece of fresh raw pork',
  '4401': 'a piece of fresh raw beef',
  '4402': 'a piece of fresh raw pork',
  '9901': 'a raw chicken drumstick, food photography',
  '9903': 'a few eggs',
  '9908': 'a carton of white milk',
};

// 프롬프트 — 영문 피사체구 + 사용자 확정 스타일
const prompt = (subject) =>
  `${subject}, photographed from above at a slight angle, ` +
  `on a clean off-white background, soft natural lighting, ` +
  `minimal soft shadow, no props or decorations, ` +
  `generous white space around the subject, ` +
  `realistic photography style`;

const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg > -1 ? Number(process.argv[limitArg + 1]) : Infinity;

async function fetchItems() {
  // 주말·공휴일엔 당일 데이터가 적어 카탈로그가 빈다. 최근 8일을 합쳐 전체 품목코드를 모은다.
  const items = new Map(); // item_code → item_name
  const fmt = (d) => d.toISOString().slice(0, 10);
  for (let back = 1; back <= 8; back++) {
    const day = fmt(new Date(Date.now() - back * 86400000));
    for (const cat of ['100', '200', '400', '500']) {
      const url =
        `https://www.kamis.or.kr/service/price/xml.do?action=dailyPriceByCategoryList` +
        `&p_product_cls_code=01&p_item_category_code=${cat}&p_country_code=1101` +
        `&p_regday=${day}&p_convert_kg_yn=N&p_cert_key=${KAMIS_KEY}&p_cert_id=${KAMIS_ID}&p_returntype=json`;
      const json = await fetch(url).then((r) => r.json()).catch(() => null);
      for (const it of json?.data?.item ?? []) {
        if (it.item_name && it.item_code && !items.has(it.item_code)) {
          items.set(String(it.item_code), String(it.item_name));
        }
      }
    }
    if (items.size >= 50) break; // 충분히 모이면 조기 종료
  }
  return items;
}

async function generateImage(name) {
  if (PROVIDER === 'gemini') return genGemini(name);
  if (PROVIDER === 'together') return genTogether(name);
  if (PROVIDER === 'cloudflare') return genCloudflare(name);
  return genPollinations(name);
}

/**
 * Cloudflare Workers AI — flux-1-schnell. NSFW 검사는 출력 이미지에 걸리고 생성은
 * 매번 달라서, NSFW 오탐 시 같은 프롬프트로 최대 5회 재시도하면 통과 생성이 나온다.
 * (SDXL 폴백은 스타일이 달라져 쓰지 않음 — 일관성 우선)
 */
async function genCloudflare(name) {
  for (let attempt = 1; attempt <= 10; attempt++) {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${CF_TOKEN}` },
        body: JSON.stringify({ prompt: prompt(name), steps: 4 }),
      },
    );
    if (res.ok) {
      const b64 = (await res.json())?.result?.image;
      if (b64) return Buffer.from(b64, 'base64');
      continue;
    }
    const txt = await res.text();
    if (!txt.includes('NSFW')) throw new Error(`Cloudflare HTTP ${res.status}: ${txt.slice(0, 150)}`);
    await new Promise((r) => setTimeout(r, 800)); // NSFW 오탐 → 잠시 후 재생성
  }
  throw new Error('flux NSFW 오탐 10회 연속 — 프롬프트 조정 필요');
}

/** Together.ai — FLUX.1-schnell-Free (무료 모델). b64_json으로 이미지 수신. */
async function genTogether(name) {
  const res = await fetch('https://api.together.xyz/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOGETHER_KEY}` },
    body: JSON.stringify({
      model: 'black-forest-labs/FLUX.1-schnell-Free',
      prompt: prompt(name),
      width: 768,
      height: 768,
      steps: 4,
      n: 1,
      response_format: 'b64_json',
    }),
  });
  if (!res.ok) throw new Error(`Together HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) throw new Error(`이미지 없음: ${JSON.stringify(json).slice(0, 200)}`);
  return Buffer.from(b64, 'base64');
}

/** Pollinations.ai — 무료, 키 불필요. URL GET으로 이미지 바이트 직접 수신(Flux 모델). */
async function genPollinations(name) {
  // 영문 품목명이 더 안정적이라 한글명을 영어 프롬프트에 그대로 두되, seed 고정으로 재현성 확보
  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt(name))}` +
    `?width=768&height=768&nologo=true&model=flux&seed=42`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Pollinations HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 2000) throw new Error(`이미지가 너무 작음(${buf.length}B) — 생성 실패 추정`);
  return buf;
}

async function genGemini(name) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt(name) }] }],
        generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '1:1' } },
      }),
    },
  );
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  const part = json?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error(`이미지 파트 없음: ${JSON.stringify(json).slice(0, 200)}`);
  return Buffer.from(part.inlineData.data, 'base64');
}

function emitMap() {
  const files = fs.existsSync(OUT_DIR)
    ? fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.png'))
    : [];
  const entries = files
    .map((f) => path.basename(f, '.png'))
    .sort()
    .map((code) => `  '${code}': require('../assets/items/${code}.png'),`)
    .join('\n');
  fs.writeFileSync(
    MAP_FILE,
    `// 자동 생성 — scripts/generate-thumbnails.mjs. 직접 수정 금지.\n` +
      `export const THUMBS: Record<string, number> = {\n${entries}\n};\n`,
  );
  return files.length;
}

const items = await fetchItems();
console.log(`KAMIS 품목 ${items.size}개`);
// EN에 영문 피사체가 없는 품목은 한글명이 그대로 프롬프트에 들어가 결과가 무너진다.
// (FLUX는 한글을 못 읽고, Gemini도 스타일이 흔들린다) 조용히 이상한 그림을 만드느니 먼저 알린다.
const noEn = [...items.keys()].filter((c) => !EN[c] && !fs.existsSync(path.join(OUT_DIR, `${c}.png`)));
if (noEn.length) {
  console.warn(`⚠ 영문 피사체(EN) 미정의 품목 ${noEn.length}개 — ${noEn.map((c) => `${items.get(c)}(${c})`).join(', ')}`);
  console.warn('  EN 맵에 추가하고 다시 실행하는 것을 권합니다. 그대로 두면 한글명으로 생성됩니다.');
}
fs.mkdirSync(OUT_DIR, { recursive: true });

let done = 0;
let attempts = 0;
let quotaErrors = 0;
for (const [code, name] of items) {
  if (attempts >= LIMIT) break;
  const file = path.join(OUT_DIR, `${code}.png`);
  if (fs.existsSync(file)) { done++; continue; }
  attempts++;
  const subject = EN[code] ?? `a single ${name}`;
  try {
    const buf = await generateImage(subject);
    fs.writeFileSync(file, buf);
    done++;
    quotaErrors = 0;
    console.log(`✓ ${name} (${code}) — ${(buf.length / 1024).toFixed(0)}KB [${done}/${items.size}]`);
    await new Promise((r) => setTimeout(r, 1500)); // rate limit 여유
  } catch (e) {
    console.error(`✗ ${name} (${code}): ${String(e.message).slice(0, 120)}`);
    if (String(e.message).includes('429')) {
      quotaErrors++;
      if (quotaErrors >= 3) {
        console.error('\n429 연속 3회 — 쿼터 소진으로 중단합니다. 결제 연결 또는 내일 재시도 후 다시 실행하세요 (이미 생성된 파일은 건너뜁니다).');
        break;
      }
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}
const total = emitMap();
console.log(`완료 — 이미지 ${total}개, 맵 갱신: src/thumbnails.gen.ts`);
