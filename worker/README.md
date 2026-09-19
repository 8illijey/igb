# igeobissa Worker

이름은 `igeobissa-recipes`지만 **레시피 전용이 아니다.** 앱이 외부로 나가는 거의 모든 요청이 여기를 지난다.

- **KAMIS 프록시** — 인증키를 서버에서 주입해 클라이언트 노출을 없애고, 상류 장애 때 폴백을 댄다.
- **레시피** — 라이브 KAMIS의 cheap/fair 품목으로 식약처 '조리식품 레시피 DB'(COOKRCP01)를 필터해 KV 캐시.
- **쇼핑 아웃링크 집계·트램펄린**
- **verdicts CI 워치독** — GitHub cron이 죽은 날 워크플로를 재발화.

배포 주소: `https://igeobissa-recipes.designerxyzi.workers.dev` [2026-09-17 확인]

> 라이브가 지금 어느 경로로 도는지는 주석이 아니라 실행으로 확인한다:
> `cd mobile && npm run check-live`

## 엔드포인트

| 경로 | 설명 |
|---|---|
| `GET /kamis?action=…` | KAMIS 프록시. 허용 action 3종: `dailyPriceByCategoryList`, `periodProductList`, `periodEcoPriceList` |
| `GET /recipes` (= `GET /`) | 캐시된 레시피 JSON. 캐시 없으면 즉시 1회 생성 |
| `GET /recipes/search?q=…` | 재료명(또는 `by=title`)으로 식약처 라이브 조회, 1시간 캐시 |
| `POST /generate?token=<ADMIN_TOKEN>` | 레시피 수동 재생성 |
| `POST /click?store=&item=` | 쇼핑 아웃링크 클릭 일별 카운터 |
| `GET /clicks?token=<ADMIN_TOKEN>` | 클릭 집계 조회 |
| `GET /go?u=<base64url>` | 제휴 몰 딥링크 302 트램펄린 (허용 도메인 화이트리스트) |

전부 CORS 허용. `OPTIONS`는 preflight로 바로 응답한다.

## `/kamis` 데이터 경로 — 순서가 핵심이다

```
① KAMIS 원본 (www.kamis.or.kr)        ← 1순위. 평상시 여기서 온다
      ↓ 타임아웃 8s / 방화벽 차단 페이지 / 빈 응답
② 공공데이터포털 미러 (apis.data.go.kr) ← 원본 포맷으로 변환. 1~2일 지연
      ↓ 미러도 실패
③ KV last-good                         ← 마지막 정상 응답 (홈 목록 질의에만)
```

**`baselines.json`의 dpr7(평년) 주입은 ②번 미러 경로에서만 일어난다.**
원본이 살아 있으면 `dpr1~dpr7` 전부 KAMIS 공식값이고 주입 코드는 실행되지 않는다.
[2026-09-17 확인] 네 카테고리 124행 모두 원본 응답이었다.

응답 판별자 — 이게 있으면 원본, 없으면 미러 변환:

| | 원본 | 미러 변환 |
|---|---|---|
| `day7` 라벨 | `"일평년"` | 없음 |
| `dpr5`(1개월전)·`dpr6`(1년전) | 실값 | `'-'` |
| 응답 헤더 | — | `x-igb-mirror: 1` |
| KV 폴백일 때 | — | `x-igb-stale: 1` |

### 왜 이렇게 생겼나

- **서킷 브레이커**: 원본이 타임아웃/비JSON을 주면 10분간 원본을 건너뛴다. 차단 중에 매 요청이
  8초를 태우면 유기농 탭 같은 화면이 통째로 늘어진다. isolate 메모리라 배포 시 리셋된다.
- **브라우저 UA 필수**: KAMIS 방화벽이 UA 없는 요청을 무응답으로 막는다(2026-07-17 확인).
  모든 KAMIS fetch에 `KAMIS_HEADERS`를 붙인다.
- **`condition` 삭제**: KAMIS는 요청 파라미터를 응답에 echo한다 — 지우지 않으면 인증키가 샌다.
  파싱 실패한 본문도 키 문자열을 마스킹한 뒤에만 내보낸다.
- **KV last-good을 홈 목록에만 거는 이유**: 기간 질의까지 걸었더니 키가 3,444개로 불어나
  무료 티어 일일 쓰기 1,000회를 5일 중 3일 초과했고 Cloudflare가 차단 메일을 보냈다(2026-08-21).
  지금 상세 차트는 `series.json`(CDN 사전계산)이 담당하므로 기간 질의를 KV로 지킬 이유가 없다.
  같은 이유로 put 전에 get으로 값이 같은지 본다 — 중복 put이 한도를 태운 사고가 따로 있었다(2026-08-09).
- **`baselines.json` 소스 순서**: ① `https://igeobissa.com/…` ② GitHub raw.
  raw를 1순위로 뒀던 것이 2026-08-18 새벽 장애의 직접 원인이다 — raw가 429를 지속하자
  빈 맵이 돌아왔고 dpr7 주입이 전부 `'-'`가 돼 앱 홈 목록이 통째로 비었다.

## cron

`wrangler.toml`:

| 트리거 | 하는 일 |
|---|---|
| `0 19 * * 1` | 매주 화 04:00 KST — 레시피 재생성 |
| `10 7-13 * * *` | 매일 16:10~22:10 KST 매시 — **verdicts CI 워치독** |

워치독은 `mobile/public/series.json`의 마지막 커밋 시각을 보고, 오늘 16시 이후 갱신이
없으면 GitHub `verdicts.yml`을 `workflow_dispatch`한다. GitHub cron이 통째로 누락되는 날이
잦아서 붙였다(2026-08-31: 예약 3회 전부 불발). 헛발화는 워크플로의 guard가 흡수하므로
**커밋 조회에 실패해도 발화한다** — 침묵이 하루치 데이터를 잃는 쪽이라서.
dispatch가 204가 아니면 throw + 디스코드 알림. 무음 실패가 워치독을 무력화한 의심 사례가 있었다(2026-09-02).

## 배포 [2026-09-17 확인]

**수동이다.** GitHub Actions에 워커 배포 워크플로가 없다 — 앱(Vercel)처럼 `main` 푸시로 나가지 않는다.
마지막 배포는 2026-09-09.

```sh
cd worker
npm install
npx wrangler deploy
```

Cloudflare 인증은 둘 중 하나:

```sh
export CLOUDFLARE_ACCOUNT_ID=...   # mobile/.env 의 CF_ACCOUNT_ID
export CLOUDFLARE_API_TOKEN=...    # mobile/.env 의 CF_API_TOKEN (Workers/KV 편집 권한)
```

로그 보기: `npx wrangler tail` · 로컬: `npx wrangler dev`

### 최초 1회 셋업

```sh
# KV 네임스페이스 — 출력된 id를 wrangler.toml 의 RECIPES_KV id에 붙여넣는다
npx wrangler kv namespace create RECIPES_KV
```

시크릿(`npx wrangler secret put <이름>`):

| 이름 | 용도 | 없으면 |
|---|---|---|
| `KAMIS_KEY` / `KAMIS_ID` | KAMIS 인증 | `/kamis`가 503 |
| `FOODSAFETY_KEY` | 식약처 레시피 DB | 레시피 생성 불가 |
| `DATAGO_KEY` | 공공데이터포털 미러 | 미러 폴백 없음 (원본 죽으면 KV뿐) |
| `ADMIN_TOKEN` | `/generate`·`/clicks` 보호 | `/generate` 항상 403 |
| `GITHUB_TOKEN` | verdicts 워치독 (`actions:write`) | 워치독 cron이 아무것도 안 함 |
| `DISCORD_WEBHOOK` | 워치독 실패 알림 | 알림 생략 |

## 앱 연결

**env가 아니라 하드코딩이다.** `mobile/src/api/kamis.ts`, `mobile/src/api/shopping.ts`,
`mobile/src/recipes.ts`가 워커 URL을 상수로 들고 있다. `EXPO_PUBLIC_KAMIS_URL`이 Vercel에서
자기 오리진 값으로 오염돼 전 요청이 앱 HTML을 받은 사고 때문이다 — env로 되돌리지 마라.

레시피는 워커 실패 시 번들된 `mobile/src/recipes.gen.json`으로 폴백한다.

## 레시피 생성 로직

워커는 **식약처 공공데이터**(COOKRCP01)를 쓴다 — 저작권이 자유롭고 단계별 설명과 실사진이 딸려 있다.
`mobile/scripts/gen-recipes.mjs`는 **Gemini로 만드는 별개의 프로토타입**이다. 둘은 같은 코드가 아니다
(재료 화이트리스트 `ALLOWED`만 공유한다). 운영에 나가는 건 워커 쪽이다.
