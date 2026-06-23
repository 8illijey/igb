// 프로토타입: Gemini로 "예년보다 싼/적정 재료" 기반 레시피를 1회 생성해 src/recipes.gen.json 에 저장.
// 실행: node scripts/gen-recipes.mjs  (또는 npm run gen-recipes)
// 운영판(Cloudflare Worker)에서는 CHEAP_HINT 대신 라이브 KAMIS의 cheap/fair 품목을 주입하고,
// expensive 품목은 애초에 후보에서 제외한다(규칙 3).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const env = readFileSync(join(root, '.env'), 'utf8');
const KEY = (env.match(/^GEMINI_API_KEY=(.*)$/m)?.[1] ?? '').trim().replace(/^["']|["']$/g, '');
if (!KEY) throw new Error('GEMINI_API_KEY가 .env에 없습니다');
const envGet = (k) => (env.match(new RegExp('^' + k + '=(.*)$', 'm'))?.[1] ?? '').trim().replace(/^["']|["']$/g, '');
const KAMIS_KEY = envGet('EXPO_PUBLIC_KAMIS_KEY'), KAMIS_ID = envGet('EXPO_PUBLIC_KAMIS_ID');

const MODEL = 'gemini-2.5-flash';

// 시세 추적 재료(KAMIS itemName과 부분문자열 매칭) — 신호칩·가격이 붙는 메인 재료.
const ALLOWED = [
  '양파', '감자', '고구마', '배추', '양배추', '무', '당근', '대파', '마늘', '깐마늘', '애호박',
  '오이', '시금치', '상추', '토마토', '방울토마토', '파프리카', '버섯', '콩나물', '두부',
  '계란', '닭고기', '돼지고기', '소고기', '고등어', '오징어', '명태',
];
// 양념/기타(시세 추적 안 함) 예시 — 자유롭게 쓸 수 있다.
const CONDIMENT_HINT = ['된장', '고추장', '간장', '소금', '설탕', '다진 마늘', '고춧가루', '식용유', '참기름', '물'];

// ── 라이브 KAMIS 시세로 ALLOWED 품목을 cheap/fair/expensive 판정 (운영판 Worker와 동일 로직) ──
const ALIAS = { 애호박: '호박', 대파: '파', 소고기: '소', 돼지고기: '돼지', 닭고기: '닭', 깐마늘: '깐마늘(국산)' };
async function liveLevels() {
  if (!KAMIS_KEY || !KAMIS_ID) return null;
  const day = new Date().toISOString().slice(0, 10);
  const num = (s) => { const n = parseFloat(String(s).replace(/,/g, '')); return isNaN(n) ? null : n; };
  const live = new Map(); // itemName → level
  for (const cat of ['100', '200', '400', '500']) {
    const qs = `p_cert_key=${KAMIS_KEY}&p_cert_id=${KAMIS_ID}&p_returntype=json&action=dailyPriceByCategoryList&p_product_cls_code=01&p_country_code=1101&p_regday=${day}&p_convert_kg_yn=N&p_item_category_code=${cat}`;
    let j; try { j = await (await fetch(`https://www.kamis.or.kr/service/price/xml.do?${qs}`)).json(); } catch { continue; }
    for (const it of (j?.data?.item ?? [])) {
      const t = num(it.dpr1), nrm = num(it.dpr7); if (t == null || nrm == null || t <= 0) continue;
      const pct = Math.round(((t - nrm) / nrm) * 100);
      if (pct <= -90) continue; // 데이터 결손(예: 당일가 누락 → -100%) 제외
      const nm = String(it.item_name);
      if (!live.has(nm)) live.set(nm, pct <= -10 ? 'cheap' : pct >= 10 ? 'expensive' : 'fair');
    }
  }
  if (!live.size) return null;
  const levelOf = (token) => {
    const q = ALIAS[token] ?? token;
    for (const [nm, lv] of live) if (nm === q) return lv;
    for (const [nm, lv] of live) if (nm.includes(q)) return lv;
    for (const [nm, lv] of live) if (q.includes(nm) && nm.length >= 2) return lv;
    return null;
  };
  return ALLOWED.map((t) => [t, levelOf(t)]);
}

const levels = await liveLevels();
let cheapHint, fairHint;
if (levels) {
  cheapHint = levels.filter(([, lv]) => lv === 'cheap').map(([t]) => t);
  fairHint = levels.filter(([, lv]) => lv === 'fair').map(([t]) => t);
  console.log(`라이브 시세 — 싼: ${cheapHint.join(', ') || '(없음)'}`);
  console.log(`           적정: ${fairHint.join(', ') || '(없음)'}`);
} else {
  cheapHint = ['감자', '양배추', '고구마', '토마토'];
  fairHint = ['양파', '무', '당근', '대파', '오이', '애호박'];
  console.warn('KAMIS 라이브 조회 실패 — 폴백 힌트 사용');
}
if (cheapHint.length === 0) { cheapHint = fairHint.slice(0, 3); } // 싼 게 없으면 적정 일부를 핵심으로

const prompt = `너는 한국 가정식 레시피 큐레이터다. "예년보다 싼 재료"를 적극 활용한 간단한 집밥/반찬 레시피 6개를 만들어라.

[이번 주 예년보다 싼 재료] (각 레시피에 1개 이상 메인으로)
${cheapHint.join(', ')}

[함께 쓸 수 있는 적정 가격 재료]
${fairHint.join(', ')}

[양념/기타 예시] (condiments — 자유롭게)
${CONDIMENT_HINT.join(', ')}

규칙:
- 메인 재료(ingredients)는 위 "싼 재료"+"적정 재료"에서만 고른다. 비싼 재료는 쓰지 않는다.
- 각 레시피는 "싼 재료"를 1개 이상 포함한다.
- ingredients는 2~4개, 각각 name(목록 표기 그대로)과 amount(분량)을 적는다.
- condiments는 양념·물 등 시세 추적이 필요 없는 재료를 name+amount로 적는다(없으면 빈 배열).
- steps는 3~5개의 짧은 문장. note는 한 문장(싼 재료 언급). 제목은 친근하고 구체적으로.
- 한식 집밥/반찬 위주로 재료 조합이 자연스럽게.`;

const ingredientSchema = {
  type: 'OBJECT',
  properties: { name: { type: 'STRING' }, amount: { type: 'STRING' } },
  required: ['name', 'amount'],
  propertyOrdering: ['name', 'amount'],
};

const body = {
  contents: [{ parts: [{ text: prompt }] }],
  generationConfig: {
    temperature: 0.8,
    maxOutputTokens: 6144,
    thinkingConfig: { thinkingBudget: 0 },
    responseMimeType: 'application/json',
    responseSchema: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          ingredients: { type: 'ARRAY', items: ingredientSchema },
          condiments: { type: 'ARRAY', items: ingredientSchema },
          steps: { type: 'ARRAY', items: { type: 'STRING' } },
          note: { type: 'STRING' },
        },
        required: ['title', 'ingredients', 'steps', 'note'],
        propertyOrdering: ['title', 'ingredients', 'condiments', 'steps', 'note'],
      },
    },
  },
};

let res, data;
for (let attempt = 1; attempt <= 4; attempt++) {
  res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`,
    { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) },
  );
  data = await res.json();
  if (res.ok && !data.error) break;
  const retryable = res.status === 503 || res.status === 429 || res.status >= 500;
  if (!retryable || attempt === 4) {
    throw new Error(`Gemini 오류 ${res.status}: ${JSON.stringify(data.error ?? data).slice(0, 300)}`);
  }
  const wait = attempt * 4000;
  console.warn(`Gemini ${res.status} — ${wait / 1000}s 후 재시도 (${attempt}/3)`);
  await new Promise((r) => setTimeout(r, wait));
}
const cand = data.candidates?.[0] ?? {};
if (cand.finishReason && cand.finishReason !== 'STOP') {
  console.warn(`경고: finishReason=${cand.finishReason} (출력이 잘렸을 수 있음)`);
}
const text = (cand.content?.parts ?? []).map((p) => p.text ?? '').join('');
let raw;
try {
  raw = JSON.parse(text);
} catch (e) {
  throw new Error(`JSON 파싱 실패 (finishReason=${cand.finishReason}). 끝부분: ${text.slice(-200)}`);
}

// 검증: 메인 재료는 ALLOWED만, name+amount 보장
const allowedSet = new Set(ALLOWED);
const cleanList = (arr) =>
  (arr ?? [])
    .map((x) => ({ name: String(x?.name ?? '').trim(), amount: String(x?.amount ?? '').trim() }))
    .filter((x) => x.name);
const expensiveSet = new Set((levels ?? []).filter(([, lv]) => lv === 'expensive').map(([t]) => t));
const recipes = raw
  .map((r) => ({
    title: String(r.title ?? '').trim(),
    ingredients: cleanList(r.ingredients).filter((x) => allowedSet.has(x.name)),
    condiments: cleanList(r.condiments),
    steps: (r.steps ?? []).map(String),
    note: String(r.note ?? '').trim(),
  }))
  .filter((r) => r.title && r.ingredients.length >= 1)
  // 비싼 재료가 든 레시피는 제외(규칙 3) — 런타임 필터와 동일하지만 생성 단계에서 미리 걸러 JSON을 깨끗하게
  .filter((r) => !r.ingredients.some((x) => expensiveSet.has(x.name)));

const out = { generatedAt: new Date().toISOString(), model: MODEL, cheapHint, fairHint, recipes };
writeFileSync(join(root, 'src', 'recipes.gen.json'), JSON.stringify(out, null, 2) + '\n', 'utf8');

console.log(`생성 완료: ${recipes.length}개 → src/recipes.gen.json`);
for (const r of recipes) {
  const ing = r.ingredients.map((i) => `${i.name} ${i.amount}`).join(', ');
  const con = r.condiments.map((i) => i.name).join(', ');
  console.log(`  · ${r.title}\n      재료: ${ing}\n      양념: ${con || '-'}`);
}
const u = data.usageMetadata ?? {};
console.log(`tokens — in: ${u.promptTokenCount}, out: ${u.candidatesTokenCount}`);
