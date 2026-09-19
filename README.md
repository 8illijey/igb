# 이거비싸? (IGB)

KAMIS 농수산물 가격 API 기반 장보기 시세 판단 서비스.

마트 앞에서 "지금 사면 비싼가/싼가" 10초 판단을 돕는다.
90개 품목의 오늘 소매·도매·유기농 시세를 이맘때 평균과 비교해 싸요/평소/비싼편으로 알려준다.

**운영 중** — https://igeobissa.com

> 이 README에 시스템 상태를 단정하는 문장을 쓰지 마라. 시간이 지나면 거짓말이 된다.
> 지금 무엇이 어디서 오는지는 `cd mobile && npm run check-live`로 확인한다.
> 작업 규칙은 [AGENTS.md](AGENTS.md)를 먼저 읽을 것.

## 구성

| 위치 | 역할 |
|---|---|
| `mobile/` | Expo 앱 (웹으로 정적 빌드 → Vercel) |
| `worker/` | Cloudflare Worker — KAMIS 프록시, 레시피 API, 장애 시 미러 폴백 |
| `mobile/scripts/` | 사전계산 — 판정·평년·SEO·OG 이미지·쿠팡 상품 |
| `.github/workflows/` | 매일 자동 갱신 (판정·평년·헬스체크·쿠팡) |

## 데이터 출처

- KAMIS Open API — 농수산물 가격. 워커가 프록시하며 원본 장애 시 공공데이터포털 미러로 폴백
- 쿠팡 파트너스 API — 상세 페이지 상품 카드

## 문서

- [AGENTS.md](AGENTS.md) — **작업 전 필독.** 라이브 확인 규칙, 데이터 출처 요약
- [mobile/scripts/VERDICTS.md](mobile/scripts/VERDICTS.md) — 판정 사전계산
- [mobile/scripts/README-coupang.md](mobile/scripts/README-coupang.md) — 쿠팡 갱신 절차와 API 한도
- [worker/README.md](worker/README.md) — 워커 구조
- [design.md](design.md) — 디자인 시스템
