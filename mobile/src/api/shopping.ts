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
 * 키는 품종까지 구분하는 '245-00'이 우선 — 소고기 안심/등심/갈비처럼 itemCode가 같고 부위만 다른
 * 상세페이지가 같은 상품을 보여주면 안 되기 때문. 없으면 품목 대표('245')로 떨어진다.
 */
export function coupangProducts(key: string): CoupangProduct[] {
  const table = coupangProductsData as Record<string, CoupangProduct[]>;
  return table[key] ?? table[codeOf(key)] ?? [];
}

/** 클릭 집계 — 실패해도 사용자 흐름에 영향 없음 */
export function trackShoppingClick(store: string, key: string): void {
  fetch(`${WORKER_BASE}/click?store=${store}&item=${encodeURIComponent(codeOf(key))}`, { method: 'POST' }).catch(() => {});
}
