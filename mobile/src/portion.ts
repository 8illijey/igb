import type { PriceItem } from './api/kamis';

// 1단위(개·대·포기·구) 평균중량(g). 대략값. 양쪽으로 쓴다 —
//  · 무게로 조사되는 품목(양파 1kg)을 레시피가 '1개'로 쓸 때
//  · 개수로 조사되는 품목(무 1개, 계란 10구)을 레시피가 '2g'·'50g'으로 쓸 때. 예전엔 이 경우 환산을 못 해
//    조사 단위 가격을 그대로 보여 무 2g이 2,205원, 달걀 50g이 4,205원으로 나왔다(2026-10-22 구운 주먹밥).
const GRAMS_PER_PIECE: Record<string, number> = {
  // 개수로 조사되는 품목 (2026-10-22 스냅숏 기준 단위: 포기·개·구)
  '211': 2500, // 배추 1포기
  '212': 1500, // 양배추 1포기
  '221': 7000, // 수박 1개
  '223': 200, // 오이 1개
  '224': 300, // 애호박 1개
  '231': 1500, // 무 1개
  '251': 150, // 가지 1개
  '256': 200, // 파프리카 1개
  '257': 1500, // 멜론 1개
  '279': 1000, // 알배기배추 1포기
  '280': 400, // 브로콜리 1개
  '411': 300, // 사과 1개
  '412': 600, // 배 1개
  '415': 100, // 감귤 1개
  '416': 200, // 단감 1개
  '420': 1500, // 파인애플 1개
  '421': 200, // 오렌지 1개
  '424': 120, // 레몬 1개
  '428': 300, // 망고 1개
  '430': 200, // 아보카도 1개
  '437': 100, // 키위 1개
  '9903': 60, // 계란 1구(특란)
  // 무게로 조사되는 품목
  '111': 75, // 쌀 1공기(밥) ≈ 생쌀 75g
  '151': 200, // 고구마 1개
  '152': 170, // 감자 1개
  '225': 180, // 토마토 1개
  '232': 180, // 당근 1개
  '245': 200, // 양파 1개
  '246': 90, // 대파 1대
};

// 부피 단위 → 무게(g) 대략값 (다진 마늘 등 양념용).
const SPOON_GRAMS: Record<string, number> = { 큰술: 10, 작은술: 3.3, 컵: 160 };

// 개수 단위. 같은 군끼리는 1:1로 본다 (계란 '개'=KAMIS '구', 양배추 '통'=KAMIS '포기').
const COUNT_UNITS = ['개', '구', '알', '통', '포기', '마리', '대', '쪽', '공기'];
const COUNT_GROUP: Record<string, string> = {
  개: '개', 구: '개', 알: '개', 마리: '마리', 통: '포기', 포기: '포기', 대: '대',
};

/** "1/8통", "2개", "1/2큰술" → { qty: 0.125, unit: '통' }. 분수·소수·정수 지원. '약간' 등은 null. */
function parseQty(s: string): { qty: number; unit: string } | null {
  const m = s.trim().match(/^(\d+\/\d+|\d*\.?\d+)\s*(.*)$/);
  if (!m) return null;
  let q: number;
  if (m[1].includes('/')) {
    const [a, b] = m[1].split('/').map(Number);
    q = b ? a / b : NaN;
  } else q = parseFloat(m[1]);
  if (isNaN(q)) return null;
  return { qty: q, unit: m[2].trim() };
}

/** 레시피에 '들어가는 만큼'의 가격(원). KAMIS 단위↔레시피 분량을 환산. 추정 불가하면 null. */
export function portionPrice(item: PriceItem, amount: string): number | null {
  if (item.today == null) return null;
  const a = parseQty(amount);
  if (!a || !a.unit) return null;

  const unit = item.unit ?? '';
  const kgM = unit.match(/([\d.]+)\s*kg/i);
  const gM = unit.match(/([\d.]+)\s*g(?![a-z])/i);
  const kamisGrams = kgM ? parseFloat(kgM[1]) * 1000 : gM ? parseFloat(gM[1]) : null;
  const cntM = unit.match(/(\d+)\s*(개|구|알|포기|마리|통)/);

  const aCount = COUNT_UNITS.find((k) => a.unit.includes(k));
  const aSpoon = Object.keys(SPOON_GRAMS).find((k) => a.unit.includes(k));
  const aKg = /kg/i.test(a.unit);
  const aG = /g(?![a-z])/i.test(a.unit) && !aKg;

  // 1) KAMIS가 개수 단위(개/구/포기…) — 같은 개수군이면 1:1로 비례
  if (cntM) {
    const perOne = item.today / parseInt(cntM[1], 10);
    const kamisGroup = COUNT_GROUP[cntM[2]] ?? cntM[2];
    if (aCount && (COUNT_GROUP[aCount] ?? aCount) === kamisGroup) {
      return Math.round(perOne * a.qty);
    }
    // 레시피가 무게(g·kg·큰술)로 적었으면 1단위 평균중량으로 개수를 환산한다.
    const per = GRAMS_PER_PIECE[item.itemCode];
    const grams = aKg ? a.qty * 1000 : aG ? a.qty : aSpoon ? a.qty * SPOON_GRAMS[aSpoon] : null;
    if (per != null && grams != null) return Math.round((perOne * grams) / per);
    return null;
  }

  // 2) KAMIS가 무게 단위(kg/g) — 레시피 분량을 g으로 환산해 비례
  if (kamisGrams) {
    const perGram = item.today / kamisGrams;
    let grams: number | null = null;
    if (aKg) grams = a.qty * 1000;
    else if (aG) grams = a.qty;
    else if (aCount && GRAMS_PER_PIECE[item.itemCode] != null) grams = a.qty * GRAMS_PER_PIECE[item.itemCode];
    else if (aSpoon) grams = a.qty * SPOON_GRAMS[aSpoon];
    if (grams != null) return Math.round(perGram * grams);
  }
  return null;
}
