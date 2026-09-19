# mobile — 작업 주의사항

> 먼저 루트 [`../AGENTS.md`](../AGENTS.md)를 읽어라. 라이브 동작은 실행해서 확인하고,
> 상태를 적을 땐 날짜와 확인 방법을 같이 적는다는 규칙이 거기 있다.
> 구조·배포·스크립트 전반은 [`README.md`](README.md).

## Expo HAS CHANGED

버전은 **Expo SDK 56** (`expo@~56.0.11`, React 19.2.3, RN 0.85.3).
코드를 쓰기 전에 정확한 버전 문서를 읽어라 — https://docs.expo.dev/versions/v56.0.0/

## 프로덕션은 웹 정적 export다 (SSG)

`app.json`의 `web.output: "static"` — 빌드 시 **모든 라우트가 Node에서 한 번 렌더돼 HTML로 떨어진다.**
네이티브처럼 "항상 브라우저에서 처음 실행"이 아니다. 여기서 나오는 함정들:

- **모듈 최상위·첫 렌더에서 `window`/`document`/`localStorage`를 만지면 빌드가 깨진다.**
  기존 코드가 쓰는 두 가지 방식을 따라라:
  - 가드: `if (typeof window === 'undefined') return null;` (`src/analytics.ts:22`)
  - 분기: `typeof document !== 'undefined' ? '/verdicts.json' : 'https://igeobissa.com/verdicts.json'`
    (`src/api/verdicts.ts:46`, `src/api/series.ts:25`) — 프리렌더 시점엔 오리진이 없어 상대경로 fetch가 안 된다.
  - 브라우저에서만 돌아야 하는 스크립트는 `+html.tsx`처럼 문자열로 넣어 `dangerouslySetInnerHTML`로 주입한다.
- **새 라우트를 만들면 반드시 `<Head>`로 제목을 준다.** 안 주면 helmet이 **빈** `<title data-rh>`를
  심어서 제목이 통째로 사라진다(`+html.tsx` 주석, 2026-08-21).
- **새 라우트는 `vercel.json`의 rewrites에도 추가한다.** `/item/:key → /item/:key.html` 식 매핑이 없으면
  새로고침·직접 진입이 SPA 폴백으로 떨어져 정적 HTML이 안 나간다(= 네이버 크롤러가 못 읽는다).
- `Platform.OS === 'web'` 분기는 실제로 자주 필요하다 — 탭바 `position: fixed`, 입력 `outlineStyle`,
  햅틱 no-op 등 (`GlassTabBar.tsx`, `SearchField.tsx`).

## 워커 URL은 하드코딩이다. env로 되돌리지 마라

`src/api/kamis.ts`, `src/api/shopping.ts`, `src/recipes.ts` 모두
`https://igeobissa-recipes.designerxyzi.workers.dev` 를 상수로 들고 있다.
Vercel의 `EXPO_PUBLIC_KAMIS_URL`이 자기 오리진 값으로 오염돼 **전 요청이 앱 HTML을 받은** 사고가
있었다(`src/api/kamis.ts:10` 주석). 편의상 env로 빼고 싶어지지만, 그게 사고의 원인이었다.

## 폰트는 웹/네이티브 경로가 다르다

- **웹**: `_layout.tsx`가 `useFonts({})`로 **아무것도 로드하지 않는다.** 대신 `+html.tsx`가
  `public/fonts/pretendard-subset.css`(jsdelivr 동적 서브셋)를 스크립트로 주입한다.
- **네이티브**: `assets/fonts/*.woff2` 3종을 `expo-font`로 로드한다.
  woff2가 되는 건 `metro.config.js`에서 `assetExts`에 넣어줬기 때문이다.

폰트 가족명(`Pretendard-Regular` 등)이 양쪽에서 **같아야** 하나의 토큰(`theme/tokens.ts`의 `font`)으로
굴러간다. 한쪽만 바꾸면 웹에서 시스템 폰트로 조용히 떨어진다.

## 모션

- 디자인 토큰은 전부 `src/theme/tokens.ts` 하나. 색·간격·타입·그림자·모션 모두 여기서만 온다.
- 이동/등장 애니메이션은 **`useReducedMotion()` 게이트 필수**. 기존 컴포넌트가 전부 그렇게 돼 있다.
- transform·opacity만 애니메이트한다. layout 속성은 쓰지 않는다.
- 배경 맥락은 [`plans/`](plans/) — 전부 구현 완료됐지만 왜 그렇게 했는지가 남아 있다.

## 검증

```bash
npx tsc --noEmit
npx expo export -p web     # SSG가 실제로 깨지는지는 이걸 돌려야 안다
npm run lint
npm run check-live         # 외부 데이터 경로를 단정하기 전에
```

## 쿠팡 파트너스 한도

`npm run refresh-coupang`의 `MAX_SAFE_RPM`을 절대 올리지 마라. 2026-08-17·2026-09-09 두 번
계정이 제한됐다. 디버깅은 `--dry-run --only=`로 좁혀서. → [`scripts/README-coupang.md`](scripts/README-coupang.md)
