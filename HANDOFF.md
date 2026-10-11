# HANDOFF — 새 세션 인수인계

> 새 세션에서 "HANDOFF.md 읽고 이어서 작업해줘"라고 하면 이 문서가 맥락을 대신함.
> 최종 갱신: 2026-10-11
>
> **작업 전 [AGENTS.md](AGENTS.md)를 먼저 읽을 것.** 외부 시스템 상태를 단정하기 전에
> `cd mobile && npm run check-live`로 실측하는 규칙이 거기 있다.
> 아래 [확인 날짜]가 붙은 숫자는 그 날의 값이다. 지금 값은 다시 재야 한다.

## 지금 무엇인가

**운영 중인 서비스**다. https://igeobissa.com — KAMIS 가격 데이터로 "지금 사도 되는 값인지"를
싸요/평소/비싼편으로 판정해 보여준다. 지금 주 작업은 **지역(내 도시) 선택 기능 출시**다.

## 현재 상태 [2026-10-11 확인]

| 항목 | 상태 | 확인 방법 |
|---|---|---|
| 서비스 | https://igeobissa.com 운영 중. 라이브는 main 기준이라 **지역 기능은 아직 없다** | 브라우저 / `cd mobile && npm run check-live` |
| 호스팅 | Vercel. 리포 `8illijey/igb`(**공개 저장소**), rootDirectory `mobile`, main 푸시 시 자동 배포 | Vercel 대시보드 |
| 런타임 | Expo ~56.0.11 / React 19.2.3 / React Native 0.85.3. 웹 정적 빌드 | `mobile/package.json` |
| 콘텐츠 | sitemap 120 URL (품목 상세 + 레시피 등) | `mobile/public/sitemap.xml` |
| 워커 | `igeobissa-recipes.designerxyzi.workers.dev` (Cloudflare). 마지막 변경 2026-09-17 | `cd worker && npx wrangler deploy` (수동) |
| 데이터 경로 | 워커가 KAMIS 원본 1순위 → 실패 시 공공데이터포털 미러 → KV last-good | `npm run check-live` |
| 애널리틱스 | GA4 `G-TV6GZBZXQ4` + Microsoft Clarity `y9vcmep20b` | 각 콘솔 |
| 마케팅 | 쓰레드 `@igeobissa`를 Aside SNS 루틴이 매일 운영(데일리 시세 글 17:30, 댓글 답장). 인스타는 2026-10-10부터 중단 | 루틴 기록 / 다음 액션 사이트 › 이거비싸 › 마케팅 |

### 화면

홈 · 관심품목 · 레시피 (탭 3개) + 품목 상세 + 레시피 상세 + 검색 + 개인정보처리방침.
로그인·회원가입 없음. 관심품목·최근 검색어(그리고 지역 기능이 들어가면 고른 지역 `igb.region.v1`)는 기기 로컬에만 남는다.

### 자동화 (`.github/workflows/`, 전부 main에 커밋돼 가동 중)

| 워크플로 | 주기 | 비고 |
|---|---|---|
| `verdicts.yml` | 하루 3회 16:30 · 17:30 · 18:30 KST | 앞 회차가 성공하면 뒤 회차는 건너뜀 |
| `baselines.yml` | 주 1회 (월 04:40 KST) | |
| `health.yml` | 매시 | verdicts 누락 시 재발화하는 워치독 포함 |
| `coupang.yml` | 매일 | 2026-09-17부터 매일 "쿠팡 상품·가격 갱신" 커밋이 쌓이고 있다. **한도를 절대 올리지 마라** (2026-08-17, 09-09에 이용제한 두 번). `mobile/scripts/README-coupang.md` |

**verdicts를 하루 3회 거는 이유:** GitHub cron은 지연·누락이 잦고(2026-08-28 실사고: 예약이
11시간 밀려 차트가 하루 종일 전날짜였다), KAMIS 기간별 API는 품목마다 게시가 늦어 16:05에는
절반만 받힌다(2026-09-09). 시간대를 벌리고, 앞 회차가 성공했으면 뒤 회차는 건너뛴다.

## 진행 중: 지역(내 도시) 선택 기능

쓰레드에서 "지역마다 가격이 다르다"는 반응이 많아 2026-10-10에 시작했다. **코드는 거의 끝났고, 한 번도 커밋하지 않았다.**

**무엇을 하나** — 홈 헤더의 📍칩에서 도시를 고르면, 그 도시 가격으로 오늘가·판정·%·기준선을 보여준다. 기본값은 '전국'.

**정해진 것**
- KAMIS 소매 일별가는 **22개 조사도시** 단위다(서울·부산·대구·인천·광주·대전·울산·세종·수원·성남·고양·용인·춘천·강릉·청주·천안·전주·순천·포항·안동·창원·제주).
  시·도로 묶어 평균 내지 않는다(경기 4개 도시끼리도 오이 격차 105%). 도시 그대로 보여준다.
- **지역 기준선은 '그 도시의 최근 28일 평균'**이다. 평년(dpr7)은 어느 지역이든 전국 단일값이고, 과거 연도 지역 데이터가 없어 지역 평년을 계산할 수 없다.
  문구도 나눈다: 전국 = "이맘때 평균", 지역 = "최근 평균".
- 연간 흐름(월별)과 판매처별 평균은 지역 데이터가 없어 전국 값을 유지한다.
- UI는 바텀시트(새 의존성 없이 RN Modal + 스프링 슬라이드·그래버 드래그로 닫기·햅틱).

**파일 (전부 미커밋)**
- 새 파일: `mobile/src/data/regions.ts`, `mobile/src/store/region.tsx`, `mobile/src/components/igb/RegionSheet.tsx`,
  `mobile/scripts/build-verdicts-regional.mjs`, `mobile/public/verdicts-regional.json`
- 수정: `mobile/src/api/kamis.ts`, `mobile/src/api/verdicts.ts`(`useRegionalVerdicts`, `fetchRegionalSeries`), `mobile/src/app/(tabs)/index.tsx`, `mobile/src/app/_layout.tsx`, `mobile/src/app/item/[key].tsx`
- 지역 데이터 빌드: `build-verdicts-regional.mjs`를 워커 프록시로 실행(`KAMIS_PROXY=.../kamis`) → `public/verdicts-regional.json` `{date, windowDays, regions: {도시: {itemKey: {level, today, recentAvg}}}}`

**남은 일 (순서대로)**
1. **예지님 결정 3가지** — 사이트 '다음 액션'(localhost:4321) › 이거비싸 › 할 일에서 고른다.
   ① 도매·유기농 탭도 지역 가격으로 바꿀지(도매만 / 둘 다 / 소매만 유지. 유기농은 24개 중 9개 품목만 지역 데이터가 있음)
   ② 예전 지역 초안 PR #2(12개 도시, 전국 평년과 비교하던 버린 방식)를 닫을지
   ③ 최신 main에서 새 브랜치를 따 지역 기능만 올릴지(추천) / 지금 브랜치째 올릴지
2. 빌드 스크립트 기본 기간을 40일 → **28일**로 (40일이면 일부 도시가 KAMIS 1000행 상한에 잘린다)
3. `vercel.json` 캐시 대상에 `verdicts-regional.json` 추가
4. 커밋·PR·배포. `b.html`, `tmp-check/`, `mobile/scripts/.photos/`, `gen-gemini-images.mjs`, `fetch-item-photos.mjs`, `worker/scripts/`, `.agents/`는 지역 기능과 무관하니 빼고 올린다
5. 매일 자동화: `verdicts.yml`에 지역 빌드 단계 추가. 지역 빌드가 실패해도 전국 판정 갱신은 막지 않게
6. 배포 뒤 쓰레드에 출시 알리기 (SNS 루틴에 맡길 수 있음)

**알려진 것** — 홈의 "Unexpected text node" 콘솔 에러는 지역 기능 전부터 있던 버그다. 지역 작업에서 쫓지 말 것.

## 저장소 상태 [2026-10-11 확인]

- 로컬 작업 브랜치는 `chore/drop-price-season`. main에 없는 커밋 2개가 있다(PR 없음):
  `7345905` 품목 상세의 '가격이 오르는 시기' 문단 제거, `55f5989` 품종이 사라지면 형제 품종 가격이 그 이름으로 보이던 버그 수정.
  **라이브에는 아직 '가격이 오르는 시기' 문단이 보인다.** 지역 기능과 따로 올릴 것.
- 원격 브랜치 `feat/region-prices`(= PR #2, 버린 방식), `feat/recipe-coupang`, `chore/gitignore-local-artifacts`가 남아 있다. 정리 대상.
- `stash@{0}`(seo/snapshot 로컬 수정)는 쓸모없어졌다.

## 그 밖에 열려 있는 일

1. **신선 고르기·보관법 카드 이미지** — Figma에 `fresh-card`·캐러셀 인디케이터(14개 변형)를 만들었고 코드에는 없다.
   이미지 3장은 Gemini API 무료 등급 429로 막혀 있다. 프롬프트 3개와 `mobile/scripts/gen-gemini-images.mjs`는 준비돼 있다(결제 등록 또는 gemini.google.com에서 직접 생성 중 결정 필요).
   고르는 법·손질·보관 정보를 주는 공공 API는 없다(2026-10-09 확인) → 직접 작성해야 한다.
2. **검색 색인** — 구글 색인 약 10개(2026-09-24), 네이버 약 15개(2026-09-25, 서치어드바이저 소유확인·사이트맵 정상).
   의심: sitemap의 모든 URL이 lastmod를 오늘 날짜로 선언. 사이트 제목 43자 → 38자(네이버 권장 40자) 제안은 아직 미반영.
3. **실사용자가 적다** — GA4 최근 28일 활성 115명 중 실제 한국 사용자 약 46명(하루 1.6명) [2026-09-17 확인]. 지표는 46 쪽을 기준으로 볼 것.
   쓰레드 최근 30일 조회 3,644회(+101.5%), 새 팔로워 0명 [2026-10-11, SNS 루틴 기록].
4. **H1 사용자 테스트 미실시** — `user-test-kit.md`에 설계가 준비돼 있다. 라이브 화면으로 바로 돌릴 수 있다.

## 수익화

쿠팡 파트너스 제휴 링크(품목 상세 페이지)가 유일하다. 광고는 미도입(2026-09-10에 "광고보다 유저 수가 먼저"로 결정).

## 디자인

- Figma 파일 키 `aVckg0tEHUX7ZNkiDYZwdR` (IGB Design System). 지역 바텀시트용 `location-row`, `location-list` 컴포넌트가 있다
- 토큰·규칙은 `design.md`. 픽셀 대조 절차는 개인 스킬 `design-fidelity`(`~/.claude/skills/design-fidelity/SKILL.md`)
  — 저장소에 있던 사본(`design-fidelity-SKILL.md`)은 원본과 갈라져서 2026-10-11에 지웠다

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
| `mobile/plans/` | 모션 개선 계획 001~004 (2026-08 전부 구현 완료, 기록용) |
| `worker/README.md` | 워커 구조 |

대화 기록(`conversation-log.md`, `대화록-*.md`, `대화기록_내_메시지.md`)과 6/13 스냅샷(`igeobissa-bundle.md`)은
**공개 저장소에 둘 수 없어서 2026-10-11에 저장소 밖 `~/projects/igeobissa-archive/`로 옮겼다.** 다시 저장소에 넣지 말 것.

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
  design.md는 그 뒤로 늘어 701줄(2026-09-17)이고, 대화기록(`대화기록_내_메시지.md`, 23,485줄)은
  2026-10-11에 저장소 밖 `~/projects/igeobissa-archive/`로 옮겼다. 덱을 다시 쓴다면 수치를 다시 셀 것.
