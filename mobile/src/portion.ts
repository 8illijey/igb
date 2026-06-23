import { PriceItem } from './api/kamis';

// 무게 단위(kg/g)로 시세가 매겨지는 품목을 레시피에서 '개/대'로 쓸 때의 1단위 평균중량(g). 대략값.
const GRAMS_PER_PIECE: Record<string, number> = {
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
