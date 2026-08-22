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
        {/* 전 페이지 공통 메타만 둔다. 제목·설명·canonical·og:url은 라우트가 <Head>로 준다.
            여기에 같은 걸 또 두면 head에 title이 두 개 남아 크롤러가 헷갈린다(2026-08-21 정리).
            주의: 라우트가 <Head>를 안 주면 helmet이 **빈** <title data-rh>를 심어 제목이 사라진다.
            새 라우트를 만들면 반드시 <Head>로 제목을 정할 것. */}
        {/* 구글 서치콘솔 소유권 확인(URL 접두어 속성). 지우면 인증이 풀린다.
            가비아 DNS에 TXT를 못 넣어 도메인 속성 대신 URL 접두어로 등록했다(2026-08-22). */}
        <meta name="google-site-verification" content="Icvvq1P86jYLoo9mgWVVFEC6qkUIleZH2wSDSEvCfj0" />
        <meta name="theme-color" content="#f6f8fa" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* 공유 프리뷰 공통값 — 개별 제목·설명·URL은 라우트에서. */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="이거비싸?" />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:image" content="https://igeobissa.com/og.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://igeobissa.com/og.png" />
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
