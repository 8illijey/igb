/**
 * igeobissa 레시피 Worker
 * - 매주(cron) 라이브 KAMIS cheap 품목으로 식약처 '조리식품 레시피 DB'(COOKRCP01)를 필터 → KV 캐시
 *   (공공데이터라 저작권 자유, 단계별 설명+실사진 포함)
 * - GET /recipes : 캐시된 레시피 JSON 반환(CORS 허용). 캐시 없으면 즉시 1회 생성.
 * - POST /generate?token=ADMIN_TOKEN : 수동 재생성(테스트/강제 갱신)
 */
export interface Env {
  RECIPES_KV: KVNamespace;
  FOODSAFETY_KEY: string;
  KAMIS_KEY: string;
  KAMIS_ID: string;
  ADMIN_TOKEN?: string;
}

const KV_KEY = 'recipes:latest';
const FOOD_BASE = 'http://openapi.foodsafetykorea.go.kr/api';

// 시세 추적 메인 재료 풀(신호칩이 붙는 품목명)
const ALLOWED = [
  '양파', '감자', '고구마', '배추', '양배추', '무', '당근', '대파', '마늘', '깐마늘', '애호박',
  '오이', '시금치', '상추', '토마토', '방울토마토', '파프리카', '버섯', '콩나물', '두부',
  '계란', '닭고기', '돼지고기', '소고기', '고등어', '오징어', '명태',
];
const ALIAS: Record<string, string> = { 애호박: '호박', 대파: '파', 소고기: '소', 돼지고기: '돼지', 닭고기: '닭', 깐마늘: '깐마늘(국산)' };
// 긴 토큰부터 매칭 — '방울토마토'를 '토마토'로, '파프리카'를 '파(대파)'로 오인하지 않게.
const ALLOWED_BY_LEN = [...ALLOWED].sort((a, b) => b.length - a.length);

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

const pad2 = (n: number) => String(n).padStart(2, '0');
const STEP_KEYS = Array.from({ length: 20 }, (_, i) => pad2(i + 1));
// 식약처 이미지·첨부는 http로 옴 — HTTPS 웹앱에서 mixed-content로 막히므로 https로 강제(실측: https 200).
const httpsify = (u: string) => u.replace(/^http:\/\//i, 'https://');
// 단계 설명 정리 — 앞 "1. " 번호, 뒤 한 글자 영문(원본의 이미지 참조 a/b/c) 제거.
// 식약처 MANUAL은 내부에 \n이 박혀 있어 줄바꿈이 어색하게 끊김 → 공백 1칸으로 합친다. 앞 "1." 번호·뒤 이미지참조 영문 제거.
const cleanStep = (s: string) => s.replace(/\s+/g, ' ').replace(/^\s*\d+\.\s*/, '').replace(/\s*[A-Za-z]\s*$/, '').trim();

/** RCP_PARTS_DTLS 한 청크 파싱. 두 포맷 + 줄머리 헤더 처리:
 *  · 괄호형 "감자(30g)" → name=감자, amount=30g
 *  · 공백형 "두부 20g(2×2×2cm)" → name=두부, amount=20g (뒤 설명 괄호 제거)
 *  · "재료 쌀(100g)"처럼 줄머리 헤더(재료/양념/육수…)는 떼어낸다. 분량 없는 줄(요리명)은 버린다. */
function parseChunk(raw: string): { name: string; amount: string } | null {
  const chunk = raw.replace(/^(재료|양념|육수|소스|고명|기타|주재료|부재료)\s+/, '').replace(/[•*■]/g, '').trim();
  const paren = chunk.match(/^([^()\d]+?)\s*\(([^()]*\d[^()]*)\)\s*$/); // 이름(분량) — 이름엔 숫자 없음
  if (paren) return { name: paren[1].trim(), amount: paren[2].trim() };
  const di = chunk.search(/\d/);
  if (di <= 0) return null;
  const name = chunk.slice(0, di).trim();
  const amount = chunk.slice(di).replace(/\s*\([^()]*\)\s*$/, '').trim(); // 뒤 설명 괄호 제거
  return name ? { name, amount } : null;
}

function parseParts(parts: string): { name: string; amount: string }[] {
  return parts
    .split(/\r?\n|,/)
    .map((s) => parseChunk(s.trim()))
    .filter((x): x is { name: string; amount: string } => x != null);
}

/** 청크명이 시세 추적 품목이면 표준 토큰(매칭 일관성) 반환. 긴 토큰부터 검사.
 *  ponytail: '쪽파'가 별칭 '파'에 걸려 대파로 태깅될 수 있음 — 가격만 살짝 어긋나는 희귀 엣지라 둠. */
function trackedToken(name: string): string | null {
  for (const t of ALLOWED_BY_LEN) {
    const q = ALIAS[t] ?? t;
    if (name.includes(t) || name.includes(q)) return t;
  }
  return null;
}

/** 식약처 COOKRCP01 — 재료명으로 레시피 검색(최대 40개). */
async function fetchByIngredient(env: Env, token: string): Promise<any[]> {
  const url = `${FOOD_BASE}/${env.FOODSAFETY_KEY}/COOKRCP01/json/1/40/RCP_PARTS_DTLS=${encodeURIComponent(token)}`;
  try {
    const j: any = await (await fetch(url)).json();
    const rows = j?.COOKRCP01?.row;
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

/** 식약처 row 1개 → 앱 레시피 객체. cheapSet/expensiveSet으로 cheapCount·hasExpensive 계산(목록 정렬·필터용). */
function buildRecipe(r: any, cheapSet: Set<string>, expensiveSet: Set<string>) {
  const tracked = new Map<string, string>(); // 표준토큰 → 분량
  const condiments: { name: string; amount: string }[] = [];
  for (const p of parseParts(String(r.RCP_PARTS_DTLS ?? ''))) {
    const tok = trackedToken(p.name);
    if (tok) {
      if (!tracked.has(tok)) tracked.set(tok, p.amount);
    } else condiments.push(p);
  }
  const ingredients = [...tracked].map(([name, amount]) => ({ name, amount }));
  const steps: string[] = [];
  const stepImages: string[] = [];
  for (const k of STEP_KEYS) {
    const t = cleanStep(String(r[`MANUAL${k}`] ?? ''));
    if (!t) continue;
    steps.push(t);
    stepImages.push(httpsify(String(r[`MANUAL_IMG${k}`] ?? '')));
  }
  return {
    title: String(r.RCP_NM ?? '').trim(),
    ingredients,
    condiments,
    steps,
    note: String(r.RCP_NA_TIP ?? '').replace(/\s+/g, ' ').trim(),
    heroImage: httpsify(String(r.ATT_FILE_NO_MK || r.ATT_FILE_NO_MAIN || '')),
    stepImages,
    cheapCount: ingredients.filter((i) => cheapSet.has(i.name)).length,
    hasExpensive: ingredients.some((i) => expensiveSet.has(i.name)),
    // 식약처 단계사진 화질: `/uploadimg/cook/20_…` = 181×125 저해상도(크게 보면 깨짐), `/uploadimg/YYYYMMDD/…` = 고해상도.
    // 저해상도 단계사진이 있으면 후순위로 — 크게보기 모달에서 안 깨지게.
    lowResSteps: stepImages.filter(Boolean).some((u) => u.includes('/uploadimg/cook/')),
  };
}

/** 재료명으로 식약처 레시피 검색 → 앱 레시피 목록(싼/비싼 판단은 클라가 라이브 시세로). */
export async function searchRecipes(env: Env, q: string) {
  if (!env.FOODSAFETY_KEY) throw new Error('FOODSAFETY_KEY missing');
  const url = `${FOOD_BASE}/${env.FOODSAFETY_KEY}/COOKRCP01/json/1/50/RCP_PARTS_DTLS=${encodeURIComponent(q)}`;
  let rows: any[] = [];
  try {
    rows = (await (await fetch(url)).json())?.COOKRCP01?.row ?? [];
  } catch {}
  const empty = new Set<string>();
  const recipes = (Array.isArray(rows) ? rows : [])
    .map((r) => buildRecipe(r, empty, empty))
    .filter((r) => r.title && r.heroImage && r.steps.length >= 2)
    .sort((a, b) => Number(a.lowResSteps) - Number(b.lowResSteps)) // 고화질 단계사진 우선
    .map(({ cheapCount, hasExpensive, lowResSteps, ...r }) => r);
  return { source: 'foodsafetykorea', query: q, recipes };
}

/** 이번 주 싼 재료로 식약처 공공 레시피를 필터·정리 → { generatedAt, source, cheapHint, fairHint, recipes } */
export async function generate(env: Env) {
  if (!env.FOODSAFETY_KEY) throw new Error('FOODSAFETY_KEY missing');
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
  const cheapSet = new Set(cheapHint);
  const expensiveSet = new Set((levels ?? []).filter(([, lv]) => lv === 'expensive').map(([t]) => t));

  // 싼 재료별로 레시피 수집(최대 8종) → RCP_SEQ로 중복 제거
  const raw = (await Promise.all(cheapHint.slice(0, 8).map((t) => fetchByIngredient(env, t)))).flat();
  const bySeq = new Map<string, any>();
  for (const r of raw) if (r?.RCP_SEQ && !bySeq.has(String(r.RCP_SEQ))) bySeq.set(String(r.RCP_SEQ), r);

  // 사진 있고, 추적 재료 1개+, 단계 2개+, 스텝에 '?'(식약처 원본에서 깨진 스텝참조) 없는 것.
  // (비싼 재료 있어도 버리지 않고 뒤로 랭크 — 빈/적은 목록 방지)
  const recipes = [...bySeq.values()]
    .map((r) => buildRecipe(r, cheapSet, expensiveSet))
    .filter(
      (r) =>
        r.title &&
        r.heroImage &&
        r.ingredients.length >= 1 &&
        r.steps.length >= 2 &&
        !r.steps.some((s: string) => s.includes('?')),
    )
    // 고화질 단계사진 우선 → 싼 재료 많은 순 → 비싼 재료 적은 순 → 재료 많은 순
    .sort(
      (a, b) =>
        Number(a.lowResSteps) - Number(b.lowResSteps) ||
        b.cheapCount - a.cheapCount ||
        Number(a.hasExpensive) - Number(b.hasExpensive) ||
        b.ingredients.length - a.ingredients.length,
    )
    .slice(0, 30)
    .map(({ cheapCount, hasExpensive, lowResSteps, ...r }) => r);

  return { generatedAt: new Date().toISOString(), source: 'foodsafetykorea', cheapHint, fairHint, recipes };
}

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
};

/** 생성 결과를 KV에 저장. 빈 결과(식약처 일시 장애 등)는 10분만 캐시 — 좋은 캐시를 영구히 덮지 않고 곧 자동 재시도. */
function storeRecipes(env: Env, data: { recipes: unknown[] }): Promise<void> {
  return env.RECIPES_KV.put(KV_KEY, JSON.stringify(data), data.recipes.length ? undefined : { expirationTtl: 600 });
}

export default {
  // 매주 cron — 생성해서 KV에 저장
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(generate(env).then((data) => storeRecipes(env, data)));
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
      await storeRecipes(env, data);
      return Response.json(data, { headers: CORS });
    }

    // KAMIS 프록시 — cert를 서버에서 주입해 클라이언트 키 노출 제거.
    // 클라이언트는 cert 없이 KAMIS 파라미터만 보내고, 여기서 cert_key/cert_id를 붙여 포워딩한다.
    if (url.pathname === '/kamis') {
      const ALLOWED_ACTIONS = new Set(['dailyPriceByCategoryList', 'periodProductList', 'periodEcoPriceList']);
      if (!ALLOWED_ACTIONS.has(url.searchParams.get('action') ?? '')) {
        return new Response('bad action', { status: 400, headers: CORS });
      }
      if (!env.KAMIS_KEY || !env.KAMIS_ID) {
        return new Response('not configured', { status: 503, headers: CORS });
      }
      const params = new URLSearchParams(url.search);
      params.set('p_cert_key', env.KAMIS_KEY);
      params.set('p_cert_id', env.KAMIS_ID);
      params.set('p_returntype', 'json');
      const upstream = await fetch(`${KAMIS_BASE}?${params.toString()}`);
      // KAMIS는 요청 파라미터(cert 포함)를 응답 condition에 echo한다 → 제거해야 키가 안 샌다.
      let text = await upstream.text();
      let parsed = false;
      try {
        const j = JSON.parse(text);
        delete j.condition;
        text = JSON.stringify(j);
        parsed = true;
      } catch {
        // 비-JSON(에러 페이지 등): cert 두 값 모두 마스킹. 검증 못한 본문이므로 캐시 금지.
        text = text.split(env.KAMIS_KEY).join('***').split(env.KAMIS_ID).join('***');
      }
      return new Response(text, {
        status: upstream.status,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': parsed ? 'public, max-age=300' : 'no-store',
          ...CORS,
        },
      });
    }

    // 레시피 검색 — 재료명으로 식약처 라이브 조회 (캐시 1시간)
    if (url.pathname === '/recipes/search') {
      const q = (url.searchParams.get('q') ?? '').trim();
      if (!q) return Response.json({ recipes: [] }, { headers: CORS });
      const data = await searchRecipes(env, q);
      return new Response(JSON.stringify(data), {
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=3600', ...CORS },
      });
    }

    // 레시피 조회 (캐시 우선, 없으면 즉시 생성)
    if (url.pathname === '/recipes' || url.pathname === '/') {
      let cached = await env.RECIPES_KV.get(KV_KEY);
      if (!cached) {
        const data = await generate(env);
        cached = JSON.stringify(data);
        await storeRecipes(env, data);
      }
      return new Response(cached, {
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=3600', ...CORS },
      });
    }
    // 쇼핑 아웃링크 클릭 집계 — 일별 카운터. 바디 없는 단순 POST라 preflight 불필요.
    if (req.method === 'POST' && url.pathname === '/click') {
      const store = url.searchParams.get('store') ?? '';
      const item = url.searchParams.get('item') ?? '';
      if (!/^[a-z]{1,20}$/.test(store) || !/^[\d-]{1,20}$/.test(item))
        return new Response('bad request', { status: 400, headers: CORS });
      const key = `click:${new Date().toISOString().slice(0, 10)}:${store}:${item}`;
      // ponytail: KV는 원자 증가가 없어 동시 클릭이 드물게 유실될 수 있음 — 저트래픽 MVP 허용, 필요 시 Durable Object로
      const cur = parseInt((await env.RECIPES_KV.get(key)) ?? '0', 10);
      await env.RECIPES_KV.put(key, String(cur + 1));
      return new Response('ok', { headers: CORS });
    }

    // 클릭 집계 조회 — { "2026-07-03:coupang:245": 3, ... }
    if (url.pathname === '/clicks') {
      if (env.ADMIN_TOKEN && url.searchParams.get('token') !== env.ADMIN_TOKEN)
        return new Response('forbidden', { status: 403, headers: CORS });
      const list = await env.RECIPES_KV.list({ prefix: 'click:' });
      const out: Record<string, number> = {};
      for (const k of list.keys) out[k.name.slice(6)] = parseInt((await env.RECIPES_KV.get(k.name)) ?? '0', 10);
      return Response.json(out, { headers: CORS });
    }

    return new Response('not found', { status: 404, headers: CORS });
  },
};
