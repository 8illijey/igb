import { THUMBS } from './thumbnails.gen';

/**
 * 품목 썸네일 조회 — 종류별 이미지(`{itemCode}_{kindCode}`)가 있으면 우선,
 * 없으면 품목 대표(`{itemCode}`). 둘 다 없으면 undefined(placeholder).
 */
export function thumbFor(item: { itemCode: string; kindCode?: string }): number | undefined {
  if (item.kindCode) {
    const k = THUMBS[`${item.itemCode}_${item.kindCode}`];
    if (k != null) return k;
  }
  return THUMBS[item.itemCode];
}
