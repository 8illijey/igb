// GA4 이벤트 전송 — 웹 전용 얇은 래퍼.
//
// gtag 자체는 +html.tsx의 인라인 스크립트가 window에 심는다(측정 ID G-TV6GZBZXQ4).
// 여기서는 "있으면 쏘고 없으면 조용히 넘어간다"만 한다. 이유:
//  · 네이티브(iOS/Android)엔 window·gtag가 없다.
//  · 정적 export(SSG) 프리렌더는 Node에서 도는데 거기도 window가 없다.
//  · gtag 스크립트가 async라 초기 렌더 시점엔 아직 안 붙어 있을 수 있고,
//    광고 차단기가 통째로 막기도 한다. 그 어느 경우에도 앱이 죽으면 안 된다.
//
// 주의: 여기서 절대 throw하지 않는다. 계측 실패가 사용자 흐름(아웃링크 이동 등)을
// 막는 건 본말전도다.

type Primitive = string | number | boolean | null | undefined;

/** GA4 이벤트 매개변수. items 배열(추천 이커머스 이벤트)까지 허용한다. */
export type TrackParams = Record<string, Primitive | Record<string, Primitive>[]>;

type GtagFn = (command: 'event', name: string, params?: TrackParams) => void;

/** 웹이면 window.gtag, 아니면 null. */
function gtagOrNull(): GtagFn | null {
  if (typeof window === 'undefined') return null;
  const fn = (window as unknown as { gtag?: unknown }).gtag;
  return typeof fn === 'function' ? (fn as GtagFn) : null;
}

/**
 * GA4로 이벤트 한 건. 실패는 전부 삼킨다.
 *
 * 이름은 GA4 추천 이벤트명(select_item, view_item_list 등)을 그대로 쓰는 걸 권한다.
 * 추천 이름을 쓰면 items[].item_name / item_id가 별도 '맞춤 측정기준' 등록 없이
 * 바로 보고서 측정기준으로 잡힌다. 커스텀 이름을 쓰면 매개변수가 보고서에
 * 안 나와서 GA 관리화면에서 측정기준을 일일이 등록해야 하고, 그것도 등록한
 * 시점 이후 데이터만 채워진다.
 */
export function track(name: string, params: TrackParams = {}): void {
  // ponytail: gtag가 없으면 그냥 버린다 — 큐잉·재시도 없음.
  // 천장: 스크립트가 닿기 전에 누른 첫 클릭은 유실된다(async 로드 창, 보통 <1s).
  // 그게 실제로 문제가 되면 dataLayer.push로 바꿔라 — gtag 스니펙이 배열을 먼저
  // 선언해두므로 로드 전 push도 나중에 소비된다.
  const gtag = gtagOrNull();
  if (!gtag) return;
  try {
    gtag('event', name, params);
  } catch {
    // 계측 실패는 무시 — 사용자 흐름이 우선이다.
  }
}
