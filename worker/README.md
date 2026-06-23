# igeobissa 레시피 Worker

매주(cron) 라이브 KAMIS cheap/fair 품목으로 Gemini 레시피를 생성해 KV에 캐시하고, 앱에 JSON으로 제공한다.

- `GET /recipes` — 캐시된 레시피 JSON (CORS 허용). 캐시 없으면 즉시 1회 생성.
- `POST /generate?token=<ADMIN_TOKEN>` — 수동 재생성(테스트/강제 갱신).
- cron `0 19 * * 1` — 매주 화요일 04:00 KST 재생성.

생성 로직은 `mobile/scripts/gen-recipes.mjs` 와 동일.

## 배포 (한 번만)

루트 `mobile/.env` 의 키를 그대로 쓴다 (Worker secret으로 등록).

```sh
cd worker
npm install

# Cloudflare 인증 (둘 중 하나)
export CLOUDFLARE_ACCOUNT_ID=...   # mobile/.env 의 CF_ACCOUNT_ID
export CLOUDFLARE_API_TOKEN=...    # mobile/.env 의 CF_API_TOKEN  (Workers/KV 편집 권한 필요)

# 1) KV 네임스페이스 생성 → 출력된 id를 wrangler.toml 의 RECIPES_KV id에 붙여넣기
npx wrangler kv namespace create RECIPES_KV

# 2) 시크릿 등록 (mobile/.env 값)
echo "$GEMINI_API_KEY"        | npx wrangler secret put GEMINI_API_KEY
echo "$EXPO_PUBLIC_KAMIS_KEY" | npx wrangler secret put KAMIS_KEY
echo "$EXPO_PUBLIC_KAMIS_ID"  | npx wrangler secret put KAMIS_ID
echo "<원하는 관리자 토큰>"     | npx wrangler secret put ADMIN_TOKEN

# 3) 배포
npx wrangler deploy
# → https://igeobissa-recipes.<subdomain>.workers.dev 발급

# 4) 첫 생성 확인
curl https://igeobissa-recipes.<subdomain>.workers.dev/recipes | jq '.recipes[].title'
```

## 앱 연결
`mobile/.env` 에 `EXPO_PUBLIC_RECIPES_URL=https://igeobissa-recipes.<subdomain>.workers.dev/recipes` 추가.
앱은 이 URL을 fetch하고, 실패 시 번들된 `recipes.gen.json` 으로 폴백한다.
