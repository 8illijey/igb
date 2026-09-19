# HANDOFF — 새 세션 인수인계

> 새 세션에서 "HANDOFF.md 읽고 이어서 작업해줘"라고 하면 이 문서가 맥락을 대신함.
> 최종 갱신: 2026-09-17
>
> **작업 전 [AGENTS.md](AGENTS.md)를 먼저 읽을 것.** 외부 시스템 상태를 단정하기 전에
> `cd mobile && npm run check-live`로 실측하는 규칙이 거기 있다.

## 지금 무엇인가

**운영 중인 서비스**다. https://igeobissa.com — KAMIS 가격 데이터로 "지금 사도 되는 값인지"를
싸요/평소/비싼편으로 판정해 보여준다. 포트폴리오 챕터 제작이 주 작업이던 시기는 지났다
(그 기록은 맨 아래 [지난 기록](#지난-기록)).

## 현재 상태 [2026-09-17 확인]

| 항목 | 상태 | 확인 방법 |
|---|---|---|
| 서비스 | https://igeobissa.com 운영 중 | 브라우저 접속 / `cd mobile && npm run check-live` |
| 호스팅 | Vercel. 리포 `8illijey/igb`, rootDirectory `mobile`, main 푸시 시 자동 배포 | Vercel 대시보드 |
| 런타임 | Expo ~56.0.11 / React 19.2.3 / React Native 0.85.3. 웹 정적 빌드 | `mobile/package.json` |
| 콘텐츠 | 품목 90개, 레시피 30개 프리렌더, sitemap 123 URL | `mobile/public/sitemap.xml` |
| 워커 | `igeobissa-recipes.designerxyzi.workers.dev` (Cloudflare). 마지막 배포 2026-09-09 | `cd worker && npx wrangler deploy` (수동) |
| 데이터 경로 | 워커가 KAMIS 원본 1순위 → 실패 시 공공데이터포털 미러 → KV last-good | `npm run check-live` |
| 애널리틱스 | GA4 `G-TV6GZBZXQ4` + Microsoft Clarity `y9vcmep20b` | 각 콘솔 |

### 화면

홈 · 관심품목 · 레시피 (탭 3개) + 품목 상세 + 레시피 상세 + 검색 + 개인정보처리방침.
로그인·회원가입 없음. 관심품목과 최근 검색어는 기기 로컬(AsyncStorage)에만 남는다.

### 자동화 (`.github/workflows/`)

| 워크플로 | 주기 | 상태 |
|---|---|---|
| `verdicts.yml` | 하루 3회 16:30 · 17:30 · 18:30 KST | 커밋됨, 가동 중 |
| `baselines.yml` | 주 1회 (월 04:40 KST) | 커밋됨 |
| `health.yml` | 매시 | 커밋됨. verdicts 누락 시 재발화하는 워치독 포함 |
| `coupang.yml` | 매일 16:20 KST로 설계 | **미커밋 + API 시크릿 미등록** |

**verdicts를 하루 3회 거는 이유:** GitHub cron은 지연·누락이 잦고(2026-08-28 실사고: 예약이
11시간 밀려 차트가 하루 종일 전날짜였다), KAMIS 기간별 API는 품목마다 게시가 늦어 16:05에는
절반만 받힌다(2026-09-09). 시간대를 벌리고, 앞 회차가 성공했으면 뒤 회차는 건너뛴다.

## 지금 열려 있는 일

1. **쿠팡 상품 갱신이 멈춰 있다.** `coupang.yml`이 아직 미커밋이고 API 시크릿도 GitHub에
   등록되지 않아, 상세 페이지의 쿠팡 상품·가격은 2026-09-09 이후 갱신되지 않았다
   [2026-09-17 확인]. 워크플로 커밋 + 시크릿 등록이 남은 일.
   **한도를 절대 올리지 마라** — 2026-08-17과 2026-09-09에 실제로 두 번 이용제한을 당했다.
   자세한 건 `mobile/scripts/README-coupang.md`.
2. **검색 색인이 거의 안 잡힌다.** Google Search Console 기준 색인 4개 / 미색인 118개,
   주 사유 "발견됨 - 현재 색인이 생성되지 않음" [2026-09-17 확인, GSC].
   프리렌더·sitemap·구조화 데이터는 이미 들어가 있으므로, 원인은 기술적 색인 가능성보다
   크롤 우선순위 쪽일 가능성이 높다. 진단 필요.
3. **실사용자가 적다.** GA4 최근 28일 활성 사용자 115명이지만 상당수가 봇·데이터센터이고,
   실제 한국 사용자는 약 46명(하루 1.6명) [2026-09-17 확인, GA4].
   지표를 볼 때 115가 아니라 46을 기준으로 삼을 것.
4. **H1 사용자 테스트 미실시.** `user-test-kit.md`에 설계가 준비돼 있으나 아직 돌리지 않았다.
   이제는 재현 목업이 아니라 라이브 화면으로 바로 돌릴 수 있다.

## 수익화

쿠팡 파트너스 제휴 링크(품목 상세 페이지)가 유일하다. 광고는 미도입.

## 디자인

- Figma 파일 키 `aVckg0tEHUX7ZNkiDYZwdR`
- 디자인 토큰 마지막 동기화 2026-06-13 — 그 이후 Figma에서 바뀐 값은 코드에 반영되지 않았을 수 있다
- 토큰·규칙은 `design.md`, 픽셀 대조 절차는 `design-fidelity-SKILL.md`

## 문서 지도

| 문서 | 내용 |
|---|---|
| [AGENTS.md](AGENTS.md) | **필독.** 라이브 확인 규칙, 데이터 출처 요약, 쿠팡 한도 |
| [README.md](README.md) | 저장소 구성 개요 |
| [product.md](product.md) | 누구를 위해 무엇을 푸는가, 가설 |
| [design.md](design.md) | 디자인 시스템 |
| [user-test-kit.md](user-test-kit.md) | H1 테스트 진행 키트 |
| `mobile/AGENTS.md` | Expo 버전 주의 |
| `mobile/scripts/VERDICTS.md` | 판정 사전계산 |
| `mobile/scripts/README-coupang.md` | 쿠팡 갱신 절차와 한도 |
| `worker/README.md` | 워커 구조 |

---

# 지난 기록

> 아래는 지나간 작업의 기록이다. 현재 상태로 읽지 말 것.

## 포트폴리오 챕터 제작 (2026-07-09 시점 기록)

기존 포트폴리오(`yejikim_portfolio.pdf`, 51p)에 **5번째 프로젝트로 들어갈 「이거비싸?」 챕터**를
만들던 작업. 포지셔닝: 프로덕트 디자이너가 AI(Claude Code·Figma MCP)와 1인 팀으로
기획→디자인→개발→배포까지 약 5주 만에 완주한 과정 + 'AI와 일하는 법'.

**[2026-09-17 확인] 아래 파일 중 저장소에 남아 있는 것은 `validation-page-snippet.html` 하나뿐이다.**
`portfolio-designer-ai.html`, `portfolio-designer-ai-script.md`, `portfolio-deck-template.html`,
`portfolio-artifact.html`은 git에 추적된 적이 없고 현재 작업 트리에도 없다.
루트 `PORTFOLIO.md`는 커밋 `576f928`에서 삭제됐다. 덱을 다시 만들려면 스크린샷 원본부터
다시 확보해야 한다. (확인: `git log --all --diff-filter=D --name-only`)

| 파일 | 역할 |
|---|---|
| `portfolio-designer-ai.html` | 최종 산출물. 10페이지 슬라이드 + 페이지별 발표 대본(토글 가능) |
| `portfolio-designer-ai-script.md` | 대본 md 버전 (P1~P10 + 예상 질문 7개) |
| `portfolio-deck-template.html` | 편집용 템플릿. `__IMG0__`(홈), `__IMG1__`(상세), `__IMG6__`(히어로카드) 토큰 |
| `validation-page-snippet.html` | 사용자 검증 페이지(덱에서 제외). 테스트 후 재삽입용 |
| `portfolio-artifact.html` | (구버전) 앱 스크린샷 base64 원본 소스 |

**빌드 방법**: 템플릿의 `__IMG*__` 토큰을 `portfolio-artifact.html`에서 정규식
`data:image/png;base64,...`로 추출한 [0], [1], [6]번째 이미지로 치환 →
`portfolio-designer-ai.html`로 저장.

### 덱 구조 (10페이지)

1. 표지 — 고스트 넘버 "05", 폰 목업(홈), 역할/기간/협업 메타
2. 문제 정의 — 타이틀 "기준 가격은 6개, 판단은 0개" / 좌: 니즈(+5.6%, 12.2%) / 우: KAMIS 표 재현 / 하단: "숫자 6개를 답 하나로 줄였다"
3. 디자인 기준 2개 — "화면을 만들며 정한 두 가지 기준" (신호 먼저 / 색=신호) + 기각안 목업
4. 협업 구조 — 발산(AI)→판단(나)→구현(AI)→검증(나) 루프 + 기각 사례 2 (예측 기능, AI 레시피)
5. 발견01 문서 — design.md 에디터 창 + 구두지시 vs 문서 비교
6. 발견02 그럴듯함 — "제일 저렴해요" Before(목업)/After(실화면) + 검증 4축
7. 발견03 규칙화 — design-fidelity.md 창 + 64vs56px 검출 그래픽
8. 발견04 지시의 진화 — 초반/후반 채팅 버블 ("엉 만들어봐")
9. 팀 기여 3 + ai-rules 파일트리 + 90일
10. 회고(다크) — Insight / Next Step

### 확정된 스타일 규칙 (여전히 유효)

- 기존 포트폴리오 문법: 라이트 그레이 과정 페이지 + 다크 회고, 넘버 킥커, 얇은줄+굵은줄 헤드라인, 명사형 종결
- **은유 금지** (박제/간극/완주/무대/소모품 등 전부 제거됨), **문장 내 대시(—) 금지** (라벨 구분용만 허용)
- 근거 없는 주장 금지 — 실측 안 된 수치·인과는 쓰지 않기로 함 (예: "갭이 가장 큰 품목군" 삭제됨)
- 없는 화면은 만들되 반드시 "재현 목업" 라벨
- '이맘때 평균' 비교축 결정은 피드백 이후에 정해진 것이라 P3에서 **의도적으로 삭제됨** — 다시 넣지 말 것

### 당시 남은 일 (미완)

1. 5명 H1 테스트 → 결과 수치로 `validation-page-snippet.html`을 P9(팀 기여) 앞에 재삽입,
   페이지 번호 10→11로 갱신 — **미실시**
2. (옵션) KAMIS 표 재현 → 실제 스크린샷 교체 (kamis.or.kr 기간별 가격정보, 오이 itemcode 223)
3. (옵션) "어제 기준 신호가 N일 중 M일 뒤집힘" — 축적된 일일 데이터로 계산해 P3 근거 강화
4. (옵션) 표지 고스트 넘버 "05"는 기존 포트폴리오 목차 순번에 맞춰 조정

### 당시 주의사항

- 덱 전체가 통일해 쓰던 앱 실측 수치: 다다기 오이 당일 5,120원 / 이맘때 평균 8,433원 = 39% 싸요.
  **이 값은 당시 스냅샷이다.** 라이브 가격은 매일 바뀌므로 지금 화면과 다르다.
- 검증 페이지의 [N.N초] 등 플레이스홀더에 **가짜 수치 넣지 말 것** (면접 리스크)
- design.md 686줄, 대화기록 2만여 줄, 기간 약 5주, "2,000+ 메시지" — 덱에서 쓰던 검증된 숫자들.
  design.md는 그 뒤로 늘어 **현재 701줄**이고 `대화기록_내_메시지.md`는 23,485줄이다
  [2026-09-17 확인: `wc -l design.md 대화기록_내_메시지.md`]. 덱을 다시 쓴다면 수치를 다시 셀 것.
