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
        {/* 네이버 서치어드바이저 소유확인. 구글과 같은 메타태그 방식으로 통일했다(2026-08-22). */}
        <meta name="naver-site-verification" content="1aeb61369aa03f299df9bce52b610814e03871ae" />
        <meta name="theme-color" content="#f6f8fa" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* 공유 프리뷰 공통값 — 개별 제목·설명·URL은 라우트에서. */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="이거비싸?" />
        <meta property="og:locale" content="ko_KR" />
        {/* card 종류만 공통. 이미지는 라우트가 <Head>로 준다 —
            상세는 품목별 카드라 여기서 고정하면 중복 태그가 생긴다. */}
        <meta name="twitter:card" content="summary_large_image" />
        <ScrollViewStyleReset />
        {/* GA4 — 유입 경로와 재방문을 보려고 깔았다(2026-08-25).
            async라 렌더를 막지 않는다. 사이트가 SPA라 페이지 이동은
            gtag의 기본 SPA 감지(History API)가 잡는다. */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
        <script dangerouslySetInnerHTML={{ __html: GA_INIT }} />
        {/* Microsoft Clarity — 스크롤 히트맵·세션 리플레이(2026-08-28).
            GA4로는 페이지 '안에서' 어디까지 보다 나갔는지를 모른다 — scroll(90%) 눈금 하나뿐이라
            분포가 안 나온다. 쿠팡 섹션이 첫 화면 밖(전체 높이의 70% 지점)이라 그 분포가 필요하다.
            단, 이 앱은 document가 아니라 내부 div가 스크롤한다(RN Web ScrollView).
            스크롤 히트맵이 그 구조에서 잡힐지는 붙여봐야 안다 — 안 잡히면 빼자. */}
        <script dangerouslySetInnerHTML={{ __html: CLARITY_INIT }} />
        <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
        <script dangerouslySetInnerHTML={{ __html: GUARD_JS }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

/** GA4 측정 ID — 속성 'igeobissa.com', 계정 '이거비싸'(designerxyzi@gmail.com). */
const GA_ID = 'G-TV6GZBZXQ4';

const GA_INIT = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');
`;

/** Clarity 프로젝트 ID — 프로젝트 '이거비싸?'(designerxyzi@gmail.com). */
const CLARITY_ID = 'y9vcmep20b';

const CLARITY_INIT = `
(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${CLARITY_ID}");
`;

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
/* 한국어는 어절 단위로 줄바꿈해야 한다. 브라우저 기본(normal)은 글자 사이 아무 데서나 끊어서
   좁은 화면에서 '이맘때 평균보 / 다'처럼 낱글자가 다음 줄로 떨어진다(2026-08-24 아이폰 제보).
   RN Web이 word-break를 따로 지정하지 않아 여기서 한 번에 건다. 끊을 데가 없는 긴 문자열은
   RN Web이 이미 넣어둔 overflow-wrap: break-word가 처리한다. */
#root, #root * { word-break: keep-all; }
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
