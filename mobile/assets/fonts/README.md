# 폰트

## Pretendard

앱 UI 본문·제목. **웹과 네이티브가 다른 경로로 받는다** [2026-09-17 확인]:

| | 어디서 | 무엇을 |
|---|---|---|
| **네이티브** | 이 디렉터리의 `*.woff2` | `_layout.tsx`가 `expo-font`로 Regular/SemiBold/Bold 3종 로드 |
| **웹** | jsdelivr CDN | `+html.tsx`가 `public/fonts/pretendard-subset.css`를 주입 → 동적 서브셋 |

웹에서는 `useFonts({})`로 **아무것도 로드하지 않는다.** 한글 전체 글리프 2.2MB 대신,
화면에 실제 쓰인 유니코드 구간의 조각만 받는다(~100-300KB). 서브셋 CSS는 `@font-face`의
가족명을 앱 토큰과 **같은 이름**(`Pretendard-Regular` 등)으로 별칭 걸어두었다 —
한쪽만 바꾸면 웹에서 조용히 시스템 폰트로 떨어진다.

### `.woff2` vs `.otf`

- `.woff2` 3종(Regular/SemiBold/Bold)만 번들에 들어간다. OTF 4종 6.01MB → woff2 2.99MB로 줄인
  변경이다(2026-08-20 첫 로딩 개선). Metro 기본 `assetExts`엔 woff2가 없어서
  `metro.config.js`에서 직접 넣어줬다 — 지우면 네이티브 폰트가 통째로 안 뜬다.
- `.otf` 4종은 **현재 어느 코드도 참조하지 않는다.** 원본 보관용으로 남아 있다.
- **ExtraBold는 뺐다.** 워드마크가 SVG 아웃라인(`components/igb/Wordmark.tsx`)으로 바뀐 뒤
  참조가 사라져 로드 목록에서 제거했다(~750KB). 파일은 남아 있지만 `type.w`에도 없다.

`display: SWAP`으로 로드한다. 기본값(auto)은 폰트가 올 때까지 텍스트를 숨겨서,
SSG로 미리 그린 화면이 슬로우 4G에서 6초간 백지였다(2026-09-03 PSI, FCP 5.9s).

## GangwonEdu-TteunTteun.otf (강원교육튼튼체)

공유 카드(OG) 이미지 `scripts/gen-og.mjs` 전용. 앱 번들에는 들어가지 않는다.

- 저작권: 강원특별자치도교육청
- 출처: https://www.gwe.go.kr/main/content.do?key=bTIzMDcyMTEyMDc3MTU=
- 조건: 누구나 무료로 자유롭게 사용 가능(출처 표기 권장). 웹·모바일 등 매체에
  별도 허가절차 없이 쓸 수 있다. 금지되는 건 서체 자체를 유료로 양도·판매하는 행위뿐이다.

피그마 시안은 어도비 폰트 JJZukinie로 되어 있으나, 어도비 폰트는 셀프호스팅
(빌드 서버에 폰트 파일을 두는 것)에 별도 라이선스가 필요해 쓸 수 없다.
목업과 대조(폭/높이 비율·잉크 밀도)한 결과 강원교육튼튼체가 가장 근접해 이걸 골랐다.

같은 이유로 워드마크("이거비싸?")는 폰트가 아니라 JJZukinie를 **벡터 아웃라인으로 export한 SVG**다
(`src/components/igb/Wordmark.tsx`). 색을 바꾸려면 SVG의 `fill`을 교체한다.
