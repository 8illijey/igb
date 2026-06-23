import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * 웹 정적 export의 HTML 셸. (네이티브엔 영향 없음)
 * - 핀치/더블탭 확대 차단(viewport + touch-action)
 * - 사진 길게눌러 저장 / 드래그 / 컨텍스트 메뉴 차단
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* 확대(핀치/더블탭) 차단 */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
        <script dangerouslySetInnerHTML={{ __html: GUARD_JS }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const GLOBAL_CSS = `
/* 길게눌러 저장/콜아웃, 텍스트 선택 차단 */
* { -webkit-touch-callout: none; -webkit-user-select: none; -moz-user-select: none; user-select: none; }
/* 입력은 선택 가능해야 함 */
input, textarea { -webkit-user-select: text; user-select: text; }
/* 이미지 저장/드래그 차단 */
img { -webkit-user-drag: none; user-drag: none; pointer-events: none; }
/* 핀치/더블탭 줌 차단(스크롤은 허용) */
html, body { touch-action: pan-x pan-y; -ms-touch-action: pan-x pan-y; }
/* 스크롤바 숨김 — 스크롤바가 나타날 때 너비가 튀는 것 방지 (스크롤 자체는 유지) */
::-webkit-scrollbar { display: none; width: 0; height: 0; }
* { scrollbar-width: none; -ms-overflow-style: none; }
html, body { overflow-x: hidden; }
`;

const GUARD_JS = `
// 길게눌러/우클릭 저장 메뉴 차단
document.addEventListener('contextmenu', function (e) { e.preventDefault(); }, { passive: false });
// iOS Safari 핀치 줌 차단
document.addEventListener('gesturestart', function (e) { e.preventDefault(); }, { passive: false });
document.addEventListener('gesturechange', function (e) { e.preventDefault(); }, { passive: false });
// 더블탭 줌 차단
var lastTouch = 0;
document.addEventListener('touchend', function (e) {
  var now = Date.now();
  if (now - lastTouch <= 300) { e.preventDefault(); }
  lastTouch = now;
}, { passive: false });
`;
