/**
 * igeobissa 레시피 Worker
 * - 매주(cron) 라이브 KAMIS cheap/fair 품목으로 Gemini 레시피 생성 → KV 캐시
 * - GET /recipes : 캐시된 레시피 JSON 반환(CORS 허용). 캐시 없으면 즉시 1회 생성.
 * - POST /generate?token=ADMIN_TOKEN : 수동 재생성(테스트/강제 갱신)
 *
 * 생성 로직은 mobile/scripts/gen-recipes.mjs 와 동일하다.
 */
export interface Env {
  RECIPES_KV: KVNamespace;
  GEMINI_API_KEY: string;
  KAMIS_KEY: string;
  KAMIS_ID: string;
  ADMIN_TOKEN?: string;
}

const KV_KEY = 'recipes:latest';
const MODEL = 'gemini-2.5-flash';

// 시세 추적 메인 재료 풀(신호칩이 붙는 품목명)
const ALLOWED = [
  '양파', '감자', '고구마', '배추', '양배추', '무', '당근', '대파', '마늘', '깐마늘', '애호박',
  '오이', '시금치', '상추', '토마토', '방울토마토', '파프리카', '버섯', '콩나물', '두부',
  '계란', '닭고기', '돼지고기', '소고기', '고등어', '오징어', '명태',
];
const ALIAS: Record<string, string> = { 애호박: '호박', 대파: '파', 소고기: '소', 돼지고기: '돼지', 닭고기: '닭', 깐마늘: '깐마늘(국산)' };
const CONDIMENT_HINT = ['된장', '고추장', '간장', '소금', '설탕', '다진 마늘', '고춧가루', '식용유', '참기름', '물'];

const KAMIS_BASE = 'https://www.kamis.or.kr/service/price/xml.do';

type Level = 'cheap' | 'fair' | 'expensive';

/** ALLOWED 품목의 라이브 cheap/fair/expensive 판정 (예년 대비 ±10%). 실패 시 null. */
async function liveLevels(env: Env): Promise<[string, Level | null][] | null> {
  if (!env.KAMIS_KEY || !env.KAMIS_ID) return null;
  const day = new Date().toISOString().slice(0, 10);
  const num = (s: unknown) => {
    const n = parseFloat(String(s).replace(/,/g, ''));
    return isNaN(n) ? null : n;
  };
  const live = new Map<string, Level>();
  for (const cat of ['100', '200', '400', '500']) {
    const qs = `p_cert_key=${env.KAMIS_KEY}&p_cert_id=${env.KAMIS_ID}&p_returntype=json&action=dailyPriceByCategoryList&p_product_cls_code=01&p_country_code=1101&p_regday=${day}&p_convert_kg_yn=N&p_item_category_code=${cat}`;
    let j: any;
    try {
      j = await (await fetch(`${KAMIS_BASE}?${qs}`)).json();
    } catch {
      continue;
    }
    const rows = j?.data?.item;
    for (const it of Array.isArray(rows) ? rows : []) {
      const t = num(it.dpr1);
      const nrm = num(it.dpr7);
      if (t == null || nrm == null || t <= 0) continue;
      const pct = Math.round(((t - nrm) / nrm) * 100);
      if (pct <= -90) continue; // 데이터 결손 제외
      const nm = String(it.item_name);
      if (!live.has(nm)) live.set(nm, pct <= -10 ? 'cheap' : pct >= 10 ? 'expensive' : 'fair');
    }
  }
  if (!live.size) return null;
  const levelOf = (token: string): Level | null => {
    const q = ALIAS[token] ?? token;
    for (const [nm, lv] of live) if (nm === q) return lv;
    for (const [nm, lv] of live) if (nm.includes(q)) return lv;
    for (const [nm, lv] of live) if (q.includes(nm) && nm.length >= 2) return lv;
    return null;
  };
  return ALLOWED.map((t) => [t, levelOf(t)]);
}

const INGREDIENT_SCHEMA = {
  type: 'OBJECT',
  properties: { name: { type: 'STRING' }, amount: { type: 'STRING' } },
  required: ['name', 'amount'],
  propertyOrdering: ['name', 'amount'],
};

/** 라이브 시세 기반 레시피 생성 → { generatedAt, cheapHint, fairHint, recipes } */
export async function generate(env: Env) {
  const levels = await liveLevels(env);
  let cheapHint: string[], fairHint: string[];
  if (levels) {
    cheapHint = levels.filter(([, lv]) => lv === 'cheap').map(([t]) => t);
    fairHint = levels.filter(([, lv]) => lv === 'fair').map(([t]) => t);
  } else {
    cheapHint = ['감자', '양배추', '고구마', '토마토'];
    fairHint = ['양파', '무', '당근', '대파', '오이', '애호박'];
  }
  if (cheapHint.length === 0) cheapHint = fairHint.slice(0, 3);

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
            ingredients: { type: 'ARRAY', items: INGREDIENT_SCHEMA },
            condiments: { type: 'ARRAY', items: INGREDIENT_SCHEMA },
            steps: { type: 'ARRAY', items: { type: 'STRING' } },
            note: { type: 'STRING' },
          },
          required: ['title', 'ingredients', 'steps', 'note'],
          propertyOrdering: ['title', 'ingredients', 'condiments', 'steps', 'note'],
        },
      },
    },
  };

  let data: any;
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${env.GEMINI_API_KEY}`,
      { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) },
    );
    data = await res.json();
    if (res.ok && !data.error) break;
    if (attempt === 4 || !(res.status === 503 || res.status === 429 || res.status >= 500)) {
      throw new Error(`Gemini ${res.status}: ${JSON.stringify(data?.error ?? data).slice(0, 200)}`);
    }
    await new Promise((r) => setTimeout(r, attempt * 4000));
  }

  const text = (data.candidates?.[0]?.content?.parts ?? []).map((p: any) => p.text ?? '').join('');
  const raw = JSON.parse(text);

  const allowedSet = new Set(ALLOWED);
  const expensiveSet = new Set((levels ?? []).filter(([, lv]) => lv === 'expensive').map(([t]) => t));
  const clean = (arr: any[]) =>
    (arr ?? [])
      .map((x: any) => ({ name: String(x?.name ?? '').trim(), amount: String(x?.amount ?? '').trim() }))
      .filter((x) => x.name);
  const recipes = (raw as any[])
    .map((r) => ({
      title: String(r.title ?? '').trim(),
      ingredients: clean(r.ingredients).filter((x) => allowedSet.has(x.name)),
      condiments: clean(r.condiments),
      steps: (r.steps ?? []).map(String),
      note: String(r.note ?? '').trim(),
    }))
    .filter((r) => r.title && r.ingredients.length >= 1)
    .filter((r) => !r.ingredients.some((x) => expensiveSet.has(x.name)));

  return { generatedAt: new Date().toISOString(), model: MODEL, cheapHint, fairHint, recipes };
}

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
};

export default {
  // 매주 cron — 생성해서 KV에 저장
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(
      generate(env).then((data) => env.RECIPES_KV.put(KV_KEY, JSON.stringify(data))),
    );
  },

  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

    // 수동 재생성(관리자 토큰)
    if (req.method === 'POST' && url.pathname === '/generate') {
      if (!env.ADMIN_TOKEN || url.searchParams.get('token') !== env.ADMIN_TOKEN) {
        return new Response('forbidden', { status: 403, headers: CORS });
      }
      const data = await generate(env);
      await env.RECIPES_KV.put(KV_KEY, JSON.stringify(data));
      return Response.json(data, { headers: CORS });
    }

    // 레시피 조회 (캐시 우선, 없으면 즉시 생성)
    if (url.pathname === '/recipes' || url.pathname === '/') {
      let cached = await env.RECIPES_KV.get(KV_KEY);
      if (!cached) {
        const data = await generate(env);
        cached = JSON.stringify(data);
        await env.RECIPES_KV.put(KV_KEY, cached);
      }
      return new Response(cached, {
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=3600', ...CORS },
      });
    }
    return new Response('not found', { status: 404, headers: CORS });
  },
};
