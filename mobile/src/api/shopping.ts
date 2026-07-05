// 쇼핑 아웃링크 — 상세화면 "지금 온라인에서 사기" 섹션의 데이터 레이어.
// - 네이버: 검색 URL 패턴으로 자동 생성 (API 미사용 → 약관 제약 없음, 수익 없음)
// - 쿠팡: 파트너스 '간편 링크'(검색결과 페이지)를 수동 생성해 coupang-links.json에 채움.
//   링크 없는 품목은 쿠팡 행을 숨긴다. 가격 숫자는 표시하지 않는다(실시간 조회 불가 → 오정보 방지).
// - 클릭 집계: Worker POST /click (fire-and-forget)
import coupangLinks from '../coupang-links.json';

const WORKER_BASE =
  (process.env.EXPO_PUBLIC_KAMIS_URL ?? 'https://igeobissa-recipes.designerxyzi.workers.dev/kamis').replace(/\/kamis$/, '');

/** itemCode → 쇼핑몰 검색 키워드. KAMIS 품목명 그대로 검색하면 엉뚱한 결과가 나오는 것만 통용명으로 교정. */
export const SHOPPING_KEYWORDS: Record<string, string> = {
  '111': '쌀 20kg',
  '112': '찹쌀 1kg',
  '141': '백태 흰콩',
  '142': '팥 500g',
  '143': '녹두 500g',
  '151': '고구마',
  '152': '감자',
  '211': '배추',
  '212': '양배추',
  '213': '시금치',
  '214': '청상추',
  '215': '얼갈이배추',
  '221': '수박',
  '222': '참외',
  '223': '오이',
  '224': '애호박',
  '225': '토마토',
  '231': '무 채소',
  '232': '당근',
  '233': '열무',
  '241': '건고추',
  '242': '꽈리고추',
  '243': '홍고추',
  '245': '양파',
  '246': '대파',
  '247': '생강',
  '248': '고춧가루 국산',
  '252': '미나리',
  '253': '깻잎',
  '255': '피망',
  '256': '파프리카',
  '257': '멜론',
  '258': '깐마늘',
  '279': '알배추',
  '280': '브로콜리',
  '411': '사과',
  '412': '배 과일',
  '418': '바나나',
  '419': '키위',
  '420': '파인애플',
  '421': '오렌지',
  '422': '방울토마토',
  '424': '레몬',
  '425': '체리',
  '428': '망고',
  '430': '아보카도',
  '4301': '소고기 갈비',
  '4304': '돼지고기 목심',
  '4401': '수입 소고기 갈비',
  '4402': '수입 삼겹살',
  '9901': '생닭',
  '9903': '계란 30구',
  '9908': '흰우유 1L',
};

/** verdicts 키('245-00') 또는 itemCode('245') → itemCode */
const codeOf = (key: string) => key.split('-')[0];

export function shoppingKeyword(key: string): string | null {
  return SHOPPING_KEYWORDS[codeOf(key)] ?? null;
}

/** 네이버쇼핑 검색 결과 URL — 키워드만 있으면 전 품목 커버 */
export function naverShoppingUrl(key: string): string | null {
  const kw = shoppingKeyword(key);
  return kw ? `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(kw)}` : null;
}

/** 쿠팡 파트너스 링크 — coupang-links.json에 있는 품목만. 없으면 행 숨김. */
export function coupangUrl(key: string): string | null {
  return (coupangLinks as Record<string, string>)[codeOf(key)] ?? null;
}

// 링크프라이스 제휴 — 검색 URL을 딥링크로 감싸 키워드만으로 전 품목 커버(쿠팡처럼 품목별 수동 링크 불필요).
// 가입 후 AF ID(EXPO_PUBLIC_LINKPRICE_AFID)를 env에 넣고, 몰별 머천트 코드는
// 링크프라이스 관리자 > 제휴 승인된 머천트 상세에서 확인해 채운다. 둘 중 하나라도 비면 그 몰 행은 숨김.
const LINKPRICE_AFID = process.env.EXPO_PUBLIC_LINKPRICE_AFID ?? '';

export const LINKPRICE_MALLS = [
  { id: 'kurly', name: '마켓컬리', merchant: '', search: (kw: string) => `https://www.kurly.com/search?sword=${encodeURIComponent(kw)}` },
  { id: 'emart', name: '이마트몰', merchant: '', search: (kw: string) => `https://emart.ssg.com/search.ssg?target=all&query=${encodeURIComponent(kw)}` },
] as const;
export type LinkpriceMall = (typeof LINKPRICE_MALLS)[number];

/** 링크프라이스 딥링크 — 클릭이 click.linkprice.com을 경유해 몰 검색결과로 간다(경유가 수수료 귀속의 전부). */
export function linkpriceUrl(mall: LinkpriceMall, key: string): string | null {
  const kw = shoppingKeyword(key);
  if (!kw || !LINKPRICE_AFID || !mall.merchant) return null;
  return `https://click.linkprice.com/click.php?m=${mall.merchant}&a=${LINKPRICE_AFID}&l=0000&u=${encodeURIComponent(mall.search(kw))}`;
}

/** 클릭 집계 — 실패해도 사용자 흐름에 영향 없음 */
export function trackShoppingClick(store: string, key: string): void {
  fetch(`${WORKER_BASE}/click?store=${store}&item=${encodeURIComponent(codeOf(key))}`, { method: 'POST' }).catch(() => {});
}
