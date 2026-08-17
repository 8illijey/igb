# 모션·인터랙션 개선 계획 (improve-animations 감사, 2026-08-07)

감사 결론: 앱 전체에 모션이 사실상 전무 (스켈레톤 펄스·검색 페이드 2건뿐). reanimated 4.3.1 설치돼 있으나 미사용. 교정보다 **추가**가 레버리지의 전부.

| # | 계획 | 심각도 | 상태 |
|---|---|---|---|
| [001](001-transition-motion-pack.md) | 전환 모션 팩 — 세그먼트 pill·탭 밑줄 슬라이드 + 전역 press 피드백 | MEDIUM | DONE |
| [002](002-favorite-heart-micro.md) | 즐겨찾기 하트 스케일 스프링 + 햅틱 | MEDIUM | DONE |
| [003](003-home-entrance.md) | 홈 진입 스태거 + 히어로 가격 카운트업 | LOW | DONE |
| [004](004-sparkline-scrub-polish.md) | 차트 스크러빙 발견성 힌트 + 햅틱 틱 + 툴팁 등장 | MEDIUM | DONE |

## 실행 순서와 의존성

1. **001 먼저** — `motion` 토큰(easing·duration)을 `src/theme/tokens.ts`에 만든다. 002·003·004가 이 토큰을 재사용한다.
2. **002** — expo-haptics를 설치한다(004도 사용).
3. **004** — 002가 설치한 expo-haptics 전제.
4. **003** — 독립적, 아무 때나.

각 플랜은 자기완결이라 순서를 바꿔도 되지만(토큰·haptics 중복 정의 가드 포함), 위 순서가 중복 작업이 없다.

## 공통 규칙

- 모든 이동 애니메이션은 reduced motion 게이트 필수 (`useReducedMotion`).
- transform·opacity만 애니메이트. layout 속성 금지.
- 검증은 항상 `npx tsc --noEmit` + `npx expo export -p web` + 플랜별 feel check.
