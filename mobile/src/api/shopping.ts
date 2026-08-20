// 쇼핑 아웃링크 — 상세화면 "지금 쿠팡에서 사기" 섹션의 데이터 레이어 (쿠팡 파트너스 전용).
// 상품 리스트는 coupang-products.json — scripts/refresh-coupang-products.mjs가 매일 갱신한다.
// 클릭 집계: Worker POST /click (fire-and-forget)
import coupangProductsData from '../coupang-products.json';

// 워커 URL 하드코딩 — EXPO_PUBLIC_KAMIS_URL env 오염 사고 방지(kamis.ts 참조).
const WORKER_BASE = 'https://igeobissa-recipes.designerxyzi.workers.dev';

/** verdicts 키('245-00') 또는 itemCode('245') → itemCode */
const codeOf = (key: string) => key.split('-')[0];

export type CoupangProduct = {
  name: string;
  price: number;
  /** 쿠팡 상품 이미지 URL. 비면 회색 placeholder. */
  imageUrl?: string;
  /** 제휴 딥링크. */
  url: string;
  /** 배송 유형 — 공식 로고 분기. 없으면 배지 없음. */
  status?: RocketType;
  /** 갱신 스크립트가 '같은 상품'을 알아보고 딥링크를 재사용하는 식별자. 표시에는 쓰지 않는다. */
  vendorItemId?: number;
  productId?: number;
};

type RocketType = 'rocket' | 'seller_rocket' | 'rocket_fresh';

/** 쿠팡 공식 배송 로고 (변형 금지, 실제 상품 배송 유형에만 사용). */
export const ROCKET_LOGO: Record<RocketType, string> = {
  rocket: 'https://image.coupangcdn.com/image/coupang/rds/logo/xhdpi/logo_rocket_medium.png',
  seller_rocket: 'https://image.coupangcdn.com/image/coupang/rds/logo/xhdpi/logo_rocket_merchant_medium_v3_r3.png',
  rocket_fresh: 'https://image.coupangcdn.com/image/coupang/rds/logo/xhdpi/logo_fresh_medium.png',
};
/** 로고 원본 비율(height 16 기준 width). rocket 128x32(4:1), seller 158x32(≈4.94:1), fresh 150x32(≈4.69:1). */
export const ROCKET_LOGO_W: Record<RocketType, number> = { rocket: 64, seller_rocket: 79, rocket_fresh: 75 };

/**
 * 품목의 쿠팡 상품 리스트. 없으면 빈 배열(섹션 숨김).
 *
 * 찾는 순서: 품종까지 일치하는 키('4301-21') → 품목 대표 키('245'). 그게 없으면 안 보여준다.
 *
 * 예전엔 3순위로 '같은 품목의 다른 품종 아무거나'가 있었다. 대표 품종이 날마다 바뀌던 시절,
 * 키가 어긋나면 섹션이 통째로 사라져서 넣은 안전망이었다. 지금은 두 가지 이유로 뺐다.
 *  · 홈이 품종을 각각 독립 항목으로 보여주므로 품종마다 자기 키가 있다.
 *  · 갱신 스크립트가 이번 회차에 못 뽑은 키를 지우지 않고 직전 값을 유지하므로 키가 안 사라진다.
 * 남겨두면 해롭기만 했다 — 2026-08-20 갱신이 411-05를 놓치자 후지사과 페이지에
 * 아오리사과 상품이 붙었고, 쪽파 페이지엔 대파가 붙었다. 없으면 없다고 하는 게 낫다.
 */
export function coupangProducts(key: string, market: 'retail' | 'eco' = 'retail'): CoupangProduct[] {
  const table = coupangProductsData as Record<string, CoupangProduct[]>;
  // 유기농·무농약 탭은 eco: 상품만. 일반 상품으로 폴백하면 유기농 시세 옆에 일반 가격이 붙어
  // 다른 물건처럼 읽힌다(2026-08-20: 대추방울토마토 유기농 12,150원/kg 아래 일반 5,550원).
  const ns = market === 'eco' ? 'eco:' : '';
  return table[`${ns}${key}`] ?? table[`${ns}${codeOf(key)}`] ?? [];
}

/** 클릭 집계 — 실패해도 사용자 흐름에 영향 없음 */
export function trackShoppingClick(store: string, key: string): void {
  fetch(`${WORKER_BASE}/click?store=${store}&item=${encodeURIComponent(codeOf(key))}`, { method: 'POST' }).catch(() => {});
}
