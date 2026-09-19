# 이거비싸? — mobile

KAMIS 농수산물 가격으로 "이거 지금 사도 되나"를 판단해주는 앱. Expo Router 기반이고,
**프로덕션은 웹 정적 export(SSG)** 다. 네이티브(iOS/Android)도 같은 코드로 돌지만 배포 대상은 웹이다.

> 작업 규칙은 루트 [`AGENTS.md`](../AGENTS.md)를 먼저 읽어라. 특히 "라이브 동작은 실행해서 확인한다".
> 이 문서의 외부 시스템 서술에는 `[2026-09-17 확인]` 태그가 붙어 있다 — 지금도 그런지는 `npm run check-live`.

## 스택

| | |
|---|---|
| Expo | `~56.0.11` (SDK 56) |
| React / React Native | `19.2.3` / `0.85.3` |
| 라우팅 | `expo-router` (typedRoutes 켜짐) |
| 모션 | `react-native-reanimated@4.3.1` + `react-native-worklets` |
| 차트·아이콘 | `react-native-svg`, `lucide-react-native` |
| 컴파일러 | React Compiler 켜짐 (`app.json` › `experiments.reactCompiler`) |

버전이 자주 어긋나므로 코드 쓰기 전에 [SDK 56 문서](https://docs.expo.dev/versions/v56.0.0/)를 본다.

## 시작

```bash
npm install
npm start          # expo start (i/a/w 로 플랫폼 선택)
npm run web        # 웹만
npm run check-live # 라이브 데이터가 지금 어느 경로로 오는지 진단 (30초)
```

## 구조

```
src/
  app/            expo-router 라우트 (아래 표)
  api/            kamis.ts · series.ts · shopping.ts · verdicts.ts — 워커/CDN 호출
  components/igb/ 18개 파일 — UI 컴포넌트 17 + usePressScale 훅 (Sparkline, PriceListRow, GlassTabBar, FavoriteHeart …)
  store/          favorites · prices · recentSearches · popularity (Context + AsyncStorage)
  theme/tokens.ts 디자인 토큰 단일 출처 — colors/spacing/radius/type/shadow/motion
  *.gen.*         사전계산 산출물 (seo / thumbnails / recipeImages / snapshot / recipes)
scripts/          사전계산·진단 스크립트 (아래)
public/           빌드에 그대로 실리는 정적 파일 (verdicts.json, baselines.json, series.json, sitemap.xml …)
```

### 라우트

| 경로 | 파일 |
|---|---|
| `/` (홈) | `app/(tabs)/index.tsx` |
| `/favorites` | `app/(tabs)/favorites.tsx` |
| `/recipes` | `app/(tabs)/recipes.tsx` |
| `/item/[key]` | `app/item/[key].tsx` |
| `/recipe/[id]` | `app/recipe/[id].tsx` |
| `/search` | `app/search.tsx` |
| `/privacy` | `app/privacy.tsx` |
| HTML 셸 | `app/+html.tsx` |

새 라우트를 만들면 **반드시 `<Head>`로 제목을 정한다.** 안 주면 helmet이 빈 `<title>`을 심어
제목이 통째로 사라진다(`+html.tsx` 주석 참조).

## 데이터가 오는 곳

| 화면의 값 | 출처 |
|---|---|
| 오늘 가격 | Cloudflare Worker `/kamis` 프록시 (KAMIS 원본 1순위 → 미러 → KV last-good) |
| 이맘때 평균 | KAMIS 공식 `dpr7`(일평년). 우리가 계산한 값이 아니다 |
| 월별 계절 패턴 | `public/baselines.json` — 우리가 계산한 근사치. 금액으로 dpr7과 나란히 쓰지 않는다 |
| 판정(싸/적정/비싸) | `public/verdicts.json` — GitHub Actions가 사전계산해 커밋 |
| 최근 시세 차트 | `public/series.json` — CDN 사전계산 |
| 레시피 | Worker `/recipes` (실패 시 번들된 `src/recipes.gen.json` 폴백) |
| 쇼핑 상품 | `src/coupang-products.json` |

워커 URL은 **하드코딩**돼 있다(`src/api/kamis.ts`, `src/api/shopping.ts`, `src/recipes.ts`).
`EXPO_PUBLIC_KAMIS_URL` env가 Vercel에서 자기 오리진 값으로 오염돼 전 요청이 앱 HTML을 받은 사고가
있었기 때문이다 — env로 되돌리지 마라.

## 배포 [2026-09-17 확인]

- 운영 URL: **https://igeobissa.com**
- Vercel 프로젝트가 GitHub `8illijey/igb` 에 연결돼 있고 `rootDirectory=mobile`. **`main` 푸시 시 자동 배포.**
- 빌드 명령(`vercel.json`): `npx expo export -p web` → `gen-og.mjs` → `copy-item-images.mjs`
- 현재 규모: 품목 **90개** · 레시피 **30개** 프리렌더, `sitemap.xml` **123 URL**
- `vercel.json`의 rewrites가 `/item/:key` → `/item/:key.html` 식으로 SSG 산출물에 매핑한다.
  라우트를 추가하면 rewrite도 같이 추가해야 새로고침 시 404가 안 난다.

## npm 스크립트

| 스크립트 | 하는 일 |
|---|---|
| `start` / `web` / `ios` / `android` | Expo 개발 서버 |
| `check-live` | **라이브 데이터 경로 진단** — 평년이 KAMIS 공식값인지 우리 주입값인지, verdicts가 언제 갱신됐는지 |
| `gen-recipes` | Gemini로 레시피 프로토타입 생성 → `src/recipes.gen.json` (운영 레시피는 워커가 식약처 DB로 만든다) |
| `refresh-coupang` | 쿠팡 파트너스 상품·가격 갱신. **한도 주의** → `scripts/README-coupang.md` |
| `import-images` / `import-recipe-images` | 품목·레시피 이미지 반입 |
| `lint` | `expo lint` |

### 사전계산 스크립트 (npm 스크립트로 노출 안 된 것 포함)

| 파일 | 산출물 | 실행 주체 |
|---|---|---|
| `build-verdicts.mjs` | `public/verdicts.json` | GitHub Actions `verdicts.yml` |
| `build-baselines.mjs` | `public/baselines.json` | GitHub Actions `baselines.yml` |
| `gen-seo.mjs` | `src/seo.gen.ts`, `public/robots.txt`, `public/sitemap.xml` | 수동 |
| `gen-og.mjs` | `dist/og/*` 공유 카드 | Vercel 빌드 |
| `refresh-coupang-products.mjs` | `src/coupang-products.json` | `npm run refresh-coupang` |
| `check-live.mjs` | (출력만) | `npm run check-live` |

## 자동화 [2026-09-17 확인]

`.github/workflows/` (리포 루트):

| 워크플로 | 주기 | 비고 |
|---|---|---|
| `verdicts.yml` | 하루 3회 **16:30 · 17:30 · 18:30 KST** | GitHub cron이 통째로 누락되는 날이 잦아 3회로 벌려 걸고, 성공한 날은 guard가 스킵 |
| `baselines.yml` | 주 1회 (월 04:40 KST) | 과거 5년 기반이라 하루 사이 거의 안 변한다 |
| `health.yml` | 매시 | 프로덕션 감시 + verdicts CI 워치독(재발화) |
| `coupang.yml` | 16:20 KST 예정 | **아직 커밋 안 됨 + 시크릿 미등록 — 돌지 않는다** |

워커에도 매시 워치독 cron이 따로 있다(`10 7-13 * * *`). GitHub cron이 죽은 날 verdicts를 재발화한다.

## 폰트

Pretendard. 웹과 네이티브가 경로가 다르다:

- **웹**: `+html.tsx`가 `public/fonts/pretendard-subset.css`를 스크립트로 주입한다(동적 삽입이라 렌더 비차단).
  jsdelivr의 동적 서브셋 woff2에서 화면에 실제 쓰인 유니코드 구간만 받는다(전체 2.2MB → ~100-300KB).
- **네이티브**: `_layout.tsx`가 `assets/fonts/*.woff2` 3종을 `expo-font`로 로드한다. 웹에선 로드하지 않는다.

자세한 건 [`assets/fonts/README.md`](assets/fonts/README.md), 타입 스케일은 [`docs/typography.md`](docs/typography.md).

## 더 읽을 것

- [`../AGENTS.md`](../AGENTS.md) — 작업 규칙 (먼저 읽기)
- [`AGENTS.md`](AGENTS.md) — mobile 고유 주의사항
- [`scripts/VERDICTS.md`](scripts/VERDICTS.md) — 판정 사전계산
- [`scripts/README-coupang.md`](scripts/README-coupang.md) — 쿠팡 갱신과 한도
- [`../worker/README.md`](../worker/README.md) — 워커 구조
- [`plans/`](plans/) — 과거 모션 작업 계획 (전부 구현 완료, 기록용)
