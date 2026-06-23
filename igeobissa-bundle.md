# 이거비싸? (IGB) — 프로젝트 전체 번들

> 마트에서 10초, 사도 될지 알려주는 1인가구 장보기 앱. KAMIS 가격 데이터를 신호등으로 가공.
> 생성: 2026-06-13 16:11

## 목차
1. Product Context (product.md)
2. Design System (design.md)
3. 앱 소스 구조 (파일 트리)
4. 앱 소스 전문 (mobile/src)

---

# 1. Product Context

# Product Context

> 이 앱이 누구를 위해, 무엇을 해결하고, 어떤 톤으로 작동하는지의 기록.
> 디자인 시스템 토큰과 규칙은 `design.md` 참조.

---

## 1. Overview

> 마트에서 10초, 사도 될지 알려주는 1인가구 장보기 앱.
> KAMIS 가격 데이터를 정보가 아닌 판단으로, 일회성이 아닌 감각으로 가공한다.

---

## 2. Persona

### 이수진, 32세

| 항목 | 내용 |
|---|---|
| 가구 형태 | 1인가구 (서울 거주) |
| 소득 | 월 약 300만 원, 생활비 비중 40% |
| 식비 비중 | 식료품·비주류음료 12.2% (통계청 2024) |
| 장보기 패턴 | 평일 동네 마트 + 주말 쿠팡 정기배송 병행 |
| 시장 규모 | 전국 30대 1인가구 140만 명 (통계청) |
| 체감 상황 | 2025년 농축수산물 5.6% 상승 |

### Pain

> "이 오이 4,500원, 비싼 건가?"

- 공식물가와 체감물가의 구조적 갭
- 마트에서 가격표를 봐도 판단 기준 없음
- 매번 찜찜함이 누적됨

### Success Criteria

- 마트 앞 10초 판단 가능
- 자연스러운 시세 감각 형성
- 식비 관리 의지를 행동으로 연결

---

## 3. Positioning

> 같은 KAMIS 데이터, 다른 가공.
> 정보가 아닌 판단을, 일회성이 아닌 감각을.

### 차별 좌표 (vs 기존 서비스)

| 서비스 | 한계 |
|---|---|
| KAMIS, 농사로, NH오늘농사 | 농민·유통업자용 — 일반 소비자에겐 너무 복잡 |
| 한국소비자원 참가격 | 정부 사이트 UX, 모바일 비최적화 |

→ "일반 소비자가 마트에서 켜는 도구"는 부재. 이 자리.

### 가치 구조

```
A. 판단 도구    마트 앞 10초 판단     ← 진입점
B. 감각 형성    매주 시세 콘텐츠     ← Retention
C. 큐레이션     이번 주 장보기 추천   ← Phase 3 이후
```

---

## 4. Hypotheses

핵심 가설 3개. 모든 디자인 결정의 기준.

| ID | 가설 | 검증 방법 |
|---|---|---|
| **H1** | 숫자보다 신호등이 먼저 와야 마트 앞 10초 판단이 가능하다 | 휴리스틱 테스트 5명 — 시그널 vs 그래프 그룹 판단 속도 |
| **H2** | '현재 vs 평년'이 '현재 vs 어제'보다 판단에 도움된다 | 5명 인터뷰 — 두 비교 보여주고 어느 쪽이 도움 됐는지 |
| **H4** | 마트 시나리오는 가입 마찰을 견디지 못한다 | A/B 테스트 — 강제 가입 vs 게스트 우선 |

### 보류 가설 (MVP 출시 후 검증)

- **H3** 주간 요약을 받으면 자연스레 재방문 빈도가 늘고, 사용자가 시세 감각을 갖게 된다
- **H5** 마트 시나리오에서 사용자는 카테고리 탐색이 아닌 직접 검색을 한다 (자명도 높음)


---

# 2. Design System

---
name: 이거비싸?
design_system_name: IGB Design System (IGBDS)
slug: igb
category: utility / price-signal
last_updated: "2026-05-29"
sources:
  - product.md (이거비싸? Product Context)
  - toss design.md (절제·신뢰 톤, 무채색 캔버스, OKLCH 토큰 구조 참조)
  - line design.md (LDSG opacity 기반 state 처리, 토큰 추상화 참조)
  - gmarket design.md (커머스 가격 표기·상태색 10단계 구조 참조)
  - KAMIS 농수산물 가격정보 API (데이터 출처)
related_services:
  - toss
  - line-design-system
  - gmarket
lang: ko
logo: null
---

# 이거비싸? (IGB) — design.md

> 마트에서 10초, 사도 될지 알려주는 1인가구 장보기 앱.
> KAMIS 가격 데이터를 정보가 아닌 **판단**으로, 일회성이 아닌 **감각**으로 가공한다.
> 제품 맥락·페르소나·가설은 `product.md` 참조. 본 문서는 시각 토큰·컴포넌트·규칙에 한정한다.

---

## Brand & Style

이거비싸?의 시각 정체성은 한 문장으로 요약된다 — **"조용한 무대 위, 신호등만 말한다."**

이 시스템은 토스의 절제된 무채색 캔버스를 무대로 빌려오되, 토스의 핵심 원칙 하나를 의도적으로 깬다. 토스는 "화면당 단일 강조색"을 철칙으로 두지만(`fill-brand` 하나만 primary CTA에 예약), 이거비싸?는 신호등 3색(비쌈/적정/쌈)을 **한 화면에 동시에** 보여줘야 하는 제품이다 — 품목 리스트에서 오이는 orange, 양파는 green이 공존한다. 따라서 IGBDS의 규칙은 "단일 강조색"이 아니라 **"신호등 3색 외에는 어떤 색도 강조로 승격하지 않는다"**는 더 엄격한 형태로 재정의된다. 브랜드 포인트색조차 신호등과 경쟁하지 않도록 채도를 낮춰 무대를 양보한다.

이 결정의 근거는 product.md의 **H1**이다 — "숫자보다 신호등이 먼저 와야 마트 앞 10초 판단이 가능하다." 신호등을 화면의 주인공으로 세우려면 무대(캔버스·크롬·텍스트·보더)는 반드시 조용해야 한다. 지마켓처럼 캔버스 자체가 채도 높은 포인트색으로 라우드하면, 신호등 3색이 배경 채도에 묻혀 "먼저 오는" 효과가 죽는다. 그래서 캔버스는 토스식 cool-grey 틴트의 거의 무채색 화이트로 고정하고, 채도는 오직 신호등에만 허락한다.

대상 사용자는 서울 거주 30대 1인가구(전국 약 140만 명, 통계청)이며, 핵심 사용 맥락은 **마트 앞·한 손·짧은 시선**이다. 이 옥외 한 손 환경 때문에 터치 타깃과 명도 대비를 토스·지마켓보다 더 공격적으로 잡는다(터치 최소 44×44px — iOS HIG 표준이자 헤더 바 높이 44와 정합, 신호등 컬러 위 텍스트 대비 4.5:1 이상). 또 product.md의 **H4**("마트 시나리오는 가입 마찰을 견디지 못한다")에 따라, **게스트 우선 동선**이 1급 시민이다 — 로그인 없이 검색→판단까지 도달하는 흐름이 컴포넌트 차원에서 보장된다.

감성 톤은 **차분한 신뢰 + 단호한 신호**다. 라인의 정서적 친근함(옅은 그림자·둥근 모서리)보다, 이 앱이 주는 orange를 믿고 구매를 보류해도 되는 **판단의 신뢰성**이 우선한다. 모서리는 토스만큼 공격적으로 둥글리지 않고(과한 라운드는 도구보다 장난감으로 읽힌다), 중간 반경으로 절제한다. 그림자는 floating 표면에만 옅게 등장하고, 표면 분리는 1px 헤어라인 디바이더가 담당한다.

Voice는 토스의 **해요체 + 위임형**을 따른다 — "지금은 비싼 편이에요", "예년보다 12% 높아요"처럼 판단을 대신 내려주는 위임형 어조를 쓰되, 단정하지 않고 근거(예년 대비 %)를 함께 말한다. 본 카탈로그 메타 문서는 `~다` 평서체로 기술하며, 해요체는 product surface 카피에 한해 적용되는 규칙이다.

---

## Colors

IGBDS 컬러는 **2축 구조**다 — (1) 신호등 축(Signal): 제품의 의미를 나르는 유일한 라우드 컬러, (2) 중성 무대 축(Stage): 캔버스·텍스트·보더·브랜드를 모두 흡수하는 조용한 cool-grey 계열. 토스의 4계층(base→semantic→component) alias 구조를 따르되, 신호등 축이 의미의 중심이라는 점이 토스·지마켓과 결정적으로 다르다.

모든 값은 OKLCH를 유일 정전(canonical)으로 둔다.

### Signal (신호등 — 유일한 강조 축)

**신호등 멘탈 모델(good/fair/poor)** 기반.

- **cheap (green, `#007a17`)**: 사용자에게 좋은 값. 사면 좋은 자리.
- **fair (warm-grey, `#61564d`, L=0.46)**: 예년 수준, 신호로서 의미 없는 중립. 채도 0.020(warm 60°)으로 stage 쿨톤(247°)과 hue 분리. 명도는 cheap·expensive와 비슷하게 맞춰 strong type 자리에서 흰 텍스트 대비 확보(7.13). 회색 채도가 0에 가까워 명도 변화로 "중립" 의미가 안 바뀐다.
- **expensive (orange, `#b83d00`)**: 사용자에게 주의 자리. 빨강보다 부드러운 톤으로 '위험' 아닌 '주의'.

세 멘탈 모델 변천 — 초기 자연 모델(`cheap=초록`) → 금융 모델(`cheap=파랑`, 2026.06 첫째 주) → 신호등/평가 모델(현재). 사용자 일상 경험과 가장 가까운 모델로 정착.

**3토큰 구조 통일**: `cheap`·`fair`·`expensive` 모두 `X` / `X-weak` / `X-on(흰색)` 동일 구조. `fair-text`는 `fair` 명도 0.46 정착으로 불필요해져 삭제(v3.1 정리).

```yaml
# Cheap (쌈) — green (사면 좋음)
signal-cheap:              oklch(0.500 0.165 145)   # 신호 텍스트·아이콘·강한 표면 (#007a17)
signal-cheap-weak:         oklch(0.950 0.040 145)   # 카드 배경 워시 (#dff6de)
signal-cheap-on:           oklch(1.000 0.000 0)     # 강한 표면 위 텍스트 = white

# Fair (적정) — neutral-grey (신호 없음 = 무채색, 2026-06-13 중립화: warm tint 제거)
signal-fair:               oklch(0.490 0.001 60)    # 신호 텍스트·아이콘·강한 표면 (#616060)
signal-fair-weak:          oklch(0.945 0.002 60)    # 카드 배경 워시 (#eeeceb)
signal-fair-on:            oklch(1.000 0.000 0)     # 강한 표면 위 텍스트 = white (3토큰 통일)

# Expensive (비쌈) — orange (주의)
signal-expensive:          oklch(0.530 0.175 45)    # 신호 텍스트·아이콘·강한 표면 (#b83d00)
signal-expensive-weak:     oklch(0.950 0.040 45)    # 카드 배경 워시 (#ffe7d9)
signal-expensive-on:       oklch(1.000 0.000 0)     # 강한 표면 위 텍스트 = white
```

### Brand (무대에 양보하는 포인트)

무채색 stage 톤(grey-900 기반). 신호 3색이 무대를 차지하도록 강조색을 자제. CTA·tab 활성·search focus·wordmark "?" 같은 인터랙티브·정체성 자리에 사용. **가격 판단 자리에는 절대 등장하지 않음.** 브랜드를 무채색으로 둠으로써 화면 안의 어떤 신호 컬러(green/warm-grey/orange)와도 hue 경쟁이 발생하지 않는다.

```yaml
brand-primary:     oklch(0.234 0.030 254)   # CTA·tab 활성·focus (= stage/grey-900)
brand-primary-alt: oklch(0.150 0.030 254)   # pressed 단계 (한 단계 더 어둡게)
brand-weak:        oklch(0.957 0.005 247)   # brand 배경 워시 (= stage/grey-100)
```

### Stage (중성 무대 — cool-grey 틴트)

캔버스·텍스트·보더 전부. 토스식 cool-blue 틴트 중성색으로, 순수 검정/회색을 쓰지 않아 신호등 채도가 더 또렷하게 떠 보이도록 한다.

```yaml
grey-900: oklch(0.234 0.030 254)   # primary text (never pure black)
grey-700: oklch(0.452 0.028 253)   # secondary text
grey-500: oklch(0.652 0.020 252)   # tertiary text / placeholder
grey-400: oklch(0.752 0.016 251)   # disabled text / strong line
grey-300: oklch(0.840 0.012 248)   # strong divider
grey-200: oklch(0.913 0.008 247)   # default divider / border
grey-100: oklch(0.957 0.005 247)   # secondary surface
grey-50:  oklch(0.978 0.003 247)   # card / sheet surface wash
white:    oklch(1.000 0.000 0)     # 기본 캔버스
```

### Semantic alias

product-facing 색은 시맨틱 alias로 호출하고, base 팔레트는 새 role을 만들 때만 직접 참조한다(토스 규약).

```yaml
# Surface
bg-canvas:        white            # 전체 앱 기본 배경
bg-secondary:     grey-50          # 카드·시트 표면
bg-elevated:      white            # floating 표면

# Semantic alias — Favorite
favorite-active:   brand-primary    # 별 채움 (무채색, 신호와 분리)
favorite-inactive: border-strong    # 미즐겨찾기 외곽선

# Text
text-primary:     grey-900         # 품목명·제목·본문
text-secondary:   grey-700         # 부가 설명
text-tertiary:    grey-500         # 캡션·비활성
text-on-signal:   (각 signal-*-on) # 신호 표면 위 텍스트

# Border
border-default:   grey-200         # 기본 헤어라인 디바이더
border-strong:    grey-400
border-focus:     brand-primary    # 입력 포커스 (1.5px)

# Price / number — KAMIS 가격 숫자 전용
price-number:     grey-900         # 가격 숫자 본체
price-unit:       grey-500         # 단위('원'·'/kg')는 한 단계 약하게

# State (신호 의미가 아닌 시스템 상태)
overlay-scrim:        oklch(0 0 0 / 0.50)   # 시트·다이얼로그 딤
overlay-press:        oklch(0 0 0 / 0.10)   # pressed tint
disabled-opacity:     0.40                  # 일반 표면 위 컴포넌트 disabled
disabled-glass-opacity: 0.30                # glass 표면 위 컴포넌트 disabled (별도 토큰)

# Glass (iOS 26 호환 floating 표면 — 단독 색 아니라 recipe의 base 레이어)
surface-glass-light:  rgba(255, 255, 255, 0.65)   # 라이트 모드 glass pill base.
                                                  # alpha+alias 비호환으로 직접 RGBA.
                                                  # 단독 사용 금지 — Glass pill recipe와 함께만.
```

- **{colors.signal-expensive} / {colors.signal-fair} / {colors.signal-cheap}**: 이 시스템에서 채도(또는 warm tint)를 가진 유일한 의미 컬러. "지금 사면 비싼가/싼가" 판단을 나른다. cheap·expensive는 채도 있는 hue, fair는 채도 거의 없는 warm-grey — 셋 다 동일한 3토큰 구조(`X` / `X-weak` / `X-on=white`).
- **State 처리**: 신호등 컬러 자체는 상태에 따라 새 hex를 만들지 않고, 라인(LDSG)식으로 `{colors.overlay-press}`를 얹거나 opacity로 처리한다.
- **fair와 stage 분리 (2026-06-13 개정)**: fair를 완전 중립(#616060, C≈0.001)으로 바꾸면서 v3.1의 "warm hue 미세 분리" 논리는 폐기됐다. 이제 fair와 stage 회색의 분리는 색이 아니라 **문맥과 형태**가 담당한다 — fair는 항상 칩/점/화살표(−·→) 같은 신호 표면 안에서만 등장하고, stage 회색은 텍스트·보더로만 쓰인다. "신호 없음 = 무채색"이라는 의미는 오히려 더 정직해졌다. 대비 검산: fair 위 흰 텍스트 6.27:1(AA+, 구 7.13), fair on fair-weak 5.32:1(AA).
- **Disabled 두 종**: `disabled-opacity`(0.40)는 일반 표면 위 컴포넌트, `disabled-glass-opacity`(0.30)는 glass 표면 위 컴포넌트 전용이다. glass는 자체 투명도가 있어 0.40을 곱하면 비활성이 거의 사라져 보이므로 한 단계 진하게(=0.30) 잡는다.

---

## Typography

본문/UI 서체는 **Pretendard Variable**을 기본으로 둔다. 토스(TPS)·지마켓(Gmarket Sans)처럼 자체 서체를 만들 자원이 없는 단계의 서비스이므로, 한+영 neogrotesque의 사실상 표준인 Pretendard를 1차로 채택한다. KAMIS 가격 숫자는 tabular figure로 정렬해 리스트에서 자릿수가 흔들리지 않게 한다.

```yaml
font-family-sans: >
  "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont,
  "Apple SD Gothic Neo", "Noto Sans KR", Roboto, sans-serif

font-feature-numeric-tabular:      "tabular-nums"   # 가격 리스트·시세 숫자 (기본)
font-feature-numeric-proportional: "proportional-nums"  # 단일 강조 가격
```

### Type ramp

마트 앞 한 손·짧은 시선 환경을 고려해, **신호 판단 라인은 일반 본문보다 크고 굵게** 잡는다. "지금 비싼 편이에요" 같은 판단 문장이 가장 먼저 읽혀야 한다.

```yaml
display:     { size: 32, line-height: 1.25, tracking: -0.02em,  weight: 700 }  # 단일 품목 상세 헤드 가격
signal-lead: { size: 22, line-height: 1.30, tracking: -0.015em, weight: 700 }  # 판단 문장 ("비싼 편이에요")
h1:          { size: 24, line-height: 1.30, tracking: -0.02em,  weight: 700 }  # 페이지 타이틀
h2:          { size: 20, line-height: 1.35, tracking: -0.015em, weight: 700 }  # 섹션 타이틀
title:       { size: 17, line-height: 1.45, tracking: -0.01em,  weight: 600 }  # 카드/리스트 품목명
body:        { size: 15, line-height: 1.50, tracking: -0.005em, weight: 400 }  # 본문 (한글 가독성 1.5)
caption:     { size: 13, line-height: 1.45, tracking: 0,        weight: 400 }  # 예년 대비·출처·날짜
label:       { size: 13, line-height: 1.25, tracking: 0,        weight: 600 }  # 칩 라벨 (button size=s와 동일 스펙)
button-label-xl: { size: 17, line-height: 1.25, tracking: 0,    weight: 700 }  # button size=xl 전용
button-label-l:  { size: 15, line-height: 1.25, tracking: 0,    weight: 700 }  # button size=l 전용
button-label-m:  { size: 15, line-height: 1.25, tracking: 0,    weight: 600 }  # button size=m 전용
button-label-s:  { size: 13, line-height: 1.25, tracking: 0,    weight: 600 }  # button size=s 전용 (= label 동일)
price-lg:    { size: 22, line-height: 1.20, tracking: -0.01em,  weight: 700 }  # 리스트 행 가격 (tabular)
price-sm:    { size: 15, line-height: 1.20, tracking: 0,        weight: 600 }  # 보조 가격 (tabular)
```

- 판단 문장은 `{typography.signal-lead}`(22/700) — 숫자보다 먼저 읽히도록 가격보다 크거나 같게 둔다(H1 직접 반영).
- 가격 숫자는 `{typography.price-lg/sm}` + `{typography.font-feature-numeric-tabular}` 고정.
- "원"·"/kg" 같은 단위는 `{colors.price-unit}`로 한 단계 약하게(지마켓의 가격/단위 분리 차용).

### 판단 강조 패턴 (signal-lead + range emphasis)

`{typography.signal-lead}` 판단 문장 안의 **핵심 % 또는 판단 단어 한 묶음**에 신호색 + underline을 함께 적용해, 한 문장 안에서 시선이 멈출 자리를 명시한다. 토큰이 아니라 패턴이며, signal-lead 본문 한 자리에서만 발동한다.

```
"오늘은 양파가 평소보다 [12% 싸요]."
                       ↑ range fill: signal/cheap + UNDERLINE
```

- 강조 범위는 **숫자 + 신호 단어** 한 묶음만(예: "12% 싸요" / "18% 비싸요" / "평소 가격"). 문장 전체에 색을 깔지 않는다 — 신호의 강도가 분산된다.
- 강조 색은 같은 행/카드의 신호 컬러와 같은 토큰: `{colors.signal-expensive}`(orange) / `{colors.signal-cheap}`(green) / `{colors.signal-fair}`(warm-grey).
- Figma에서는 텍스트 노드에 `setRangeFills`로 신호 변수를 bind하고, `setRangeTextDecoration`을 `UNDERLINE`로 설정한다. text style 자체에는 underline이 없다 — 패턴이 문장의 의미 단위에만 적용되기 때문.
- "평소 가격"(fair)처럼 % 가 없는 경우에도 같은 패턴 — 단 fair는 warm-grey 자체가 cheap/expensive보다 시선 강도가 약하므로(신호 없음 의미와 일치), 같은 행의 신호 chip 또는 dot으로 보강 권장.
- 본 패턴은 **판단 문장 1개당 1회**가 표준. 한 문장에 강조 두 곳 이상은 신호 분산을 유발한다.
- Hero Verdict Card·시세 요약 헤드라인 등 "위임형 판단" 어휘 자리 한정 — 일반 본문/캡션에는 사용 금지.

---

## Spacing

베이스 단위 4px, 4~64px 사다리. 토스·지마켓이 공유하는 4·8 그리드를 따른다.

```yaml
space-1:   4
space-2:   8     # 밀접 결합 (라벨 + 입력)
space-3:  12
space-4:  16     # list-row 간격 / 페이지 outer padding
space-5:  20
space-6:  24     # 섹션 간 간격
space-8:  32
space-10: 40
space-16: 64
```

룰 오브 섬 — **16px** 화면 outer padding, **16px** 리스트 행 간격, **8px** 밀접 결합(품목명+단위), **24px** 섹션 구분. 마트 환경의 한 손 사용을 위해 리스트 행 자체 높이는 넉넉히(최소 64px) 잡아 터치 타깃을 확보한다.

### Safe-area (iOS 화면 템플릿)

iOS Status Bar(62) · Tab Bar(91) 안전영역 위에 home 콘텐츠를 정렬하기 위한 layout-driven 상수. 화면 템플릿마다 반복되는 magic number를 토큰화.

```yaml
safe-area-top:    64    # Status Bar(62) + 2 breathing
safe-area-bottom: 120   # Tab Bar(91) + 24 floating gap + ~5 home indicator
```

- 화면 외곽 wrapper의 paddingTop = `{spacing.safe-area-top}`, paddingBottom = `{spacing.safe-area-bottom}`.
- 일반 spacing 사다리(`space-1..16`)와 **분리**된 별도 그룹 — 4 그리드는 만족하지만 "디자인 의도의 간격"이 아니라 "디바이스 호환 영역"이다. spacing 룰 오브 섬에 끼우지 말 것.
- Figma Primitives 컬렉션에 FLOAT/GAP scope로 정의. design.md ↔ Figma 동기화 시 raw 숫자 그대로(× 1, 단위 변환 없음).
- `main-header` 컴포넌트 내부의 status bar 영역 높이 **44는 의도된 값** — 화면 템플릿 safe-area(Status Bar 62 기준)와 별개. 교정 대상 아님.

---

## Rounded

중간 반경. 토스만큼 공격적으로 둥글리지 않는다 — 판단 도구는 장난감이 아니라 신뢰할 도구로 읽혀야 한다.

```yaml
radius-xs:   4    # 작은 뱃지
radius-s:    8    # 칩·태그·입력 필드
radius-m:   12    # 버튼·카드 (기본)
radius-l:   16    # 시트·다이얼로그
radius-xl:  20    # 대형 카드·hero
radius-full: 999  # 신호 점(dot)·원형 칩·아바타
```

- 버튼·품목 카드 기본 `{rounded.radius-m}`(12px).
- 시그널 칩은 `{rounded.radius-s}`(8px) 또는 full pill 중 선택 — 단독 신호 점은 full.
- 시트·다이얼로그 `{rounded.radius-l}`(16px).

### Border Width

```yaml
border-width-100: 1px      # 기본 헤어라인 (가장 널리 사용)
border-width-150: 1.5px    # 입력 포커스 강조
border-width-200: 2px      # 신호 카드 좌측 accent rail (신호색 전용)
```

두께는 `border-width`(CSS 속성명 정합), 색은 `border`로 분리. Figma의 Weight 필드엔 `border-width` 변수가, Stroke 필드엔 `border` 색이 들어간다.

신호 카드는 좌측 2px accent rail에만 신호색을 허용한다(나머지 보더는 무채색 헤어라인).

---

## Elevation & Depth

평면이 기본. 그림자는 floating/modal 표면에만 옅게 등장하며, 색은 모두 cool-navy 베이스 낮은 알파(0.04~0.12)로 통일한다(토스·지마켓 공통 기조).

```yaml
shadow-1: 0 1px 2px oklch(0.234 0.030 254 / 0.05), 0 1px 1px oklch(0.234 0.030 254 / 0.04)   # 카드
shadow-2: 0 4px 12px oklch(0.234 0.030 254 / 0.08), 0 1px 2px oklch(0.234 0.030 254 / 0.05)  # 팝오버·메뉴
shadow-3: 0 8px 24px oklch(0.234 0.030 254 / 0.10)                                            # 다이얼로그·토스트
shadow-sheet: 0 -2px 12px oklch(0.234 0.030 254 / 0.06)                                       # 바텀시트
shadow-glass-floating: 0 8px 40px rgba(0, 0, 0, 0.12)                                          # glass pill / floating UI 전용
glass-blur-soft: GLASS effect, radius 7                                                        # iOS 26 호환 신규 효과 타입 (BACKGROUND_BLUR 아님)
```

- pressed state는 그림자가 아니라 `{colors.overlay-press}` overlay로 처리한다(토스식).
- skeleton shimmer 대신 3-dot 또는 신호색 펄스 로더를 쓴다.
- `glass-blur-soft`는 Figma의 **GLASS** effect 타입(iOS 26 호환). 기존 BACKGROUND_BLUR와 다른 노드 효과이며, floating UI 작업 시 GLASS만 쓴다(BACKGROUND_BLUR 사용 금지).
- `shadow-glass-floating`은 일반 cool-navy shadow(`shadow-1/2/3`)와 분리한다 — glass는 채도 없는 순수 black low-alpha를 깔아야 컬러 시프트 없이 떠 보인다.

### Glass pill recipe (iOS 26 floating 표면 패턴)

floating 탭 바·플로팅 토글·glass FAB처럼 캔버스 위에 떠야 하는 표면의 표준 조합. **세 레이어 + 두 효과**의 결합으로만 만들고, 단일 색 alias로 환원하지 않는다(시각 효과가 블렌드 모드에 의존하기 때문).

| 레이어 | 내용 | 블렌드 |
|---|---|---|
| 1. base | `{colors.surface-glass-light}` (white α0.65) | NORMAL |
| 2. burn-tint | `#dddddd` opacity 1 (raw, recipe 전용) | **COLOR_BURN** |
| 3. darken-tint | `#f7f7f7` opacity 1 (raw, recipe 전용) | **DARKEN** |
| eff. blur | `{elevation.glass-blur-soft}` (GLASS, r7) | — |
| eff. shadow | `{elevation.shadow-glass-floating}` (0/8/40/α0.12) | NORMAL |

- 세 fill은 **반드시 위 순서로 stacking**한다. 순서가 바뀌면 톤이 무너진다.
- `#ddd`·`#f7f7f7`은 별도 primitive로 분리하지 않는다 — recipe 안에서만 의미를 가지는 raw tint이며 stage/grey-* (blue-tint)와 도리어 충돌한다.
- pill 형태(`{rounded.radius-full}` 또는 충분히 큰 px)에서만 쓴다. 사각형 카드에는 부적합(블렌드 모드가 모서리 가까이서 어색해진다).
- 안쪽에 selection chip을 올릴 때는 LINEAR_BURN 블렌드 규칙(아래)을 함께 적용한다.

### LINEAR_BURN 블렌드 규칙 (glass 위 chip·label)

glass surface 위에 올라가는 **selection chip 배경**과 **inactive label 텍스트**는 NORMAL이 아니라 `LINEAR_BURN` 블렌드 모드로 합성한다. 일반 알파 합성보다 어두운 영역이 더 깊어져 glass 톤과 톤-맞춤이 이루어진다 — iOS 26 톤의 핵심 어휘 중 하나.

- Light 모드 selection chip 배경: `{colors.bg-secondary}` (grey-50) + `LINEAR_BURN`
- Light 모드 inactive label: `{colors.text-primary}` (grey-900) + `LINEAR_BURN`
- Dark 모드 대응: `LINEAR_DODGE`(add)로 뒤집는다 — burn↔dodge 대칭.
- glass surface가 **아닌** 일반 캔버스 위 chip·label은 그대로 NORMAL을 유지한다(이 규칙은 glass 컨텍스트 한정).

### Motion

```yaml
ease:     cubic-bezier(0.22, 0.61, 0.36, 1)   # 기본 ease-out
dur-fast: 120   # 버튼 press
dur-base: 200   # 토글·신호 전환
dur-slow: 320   # 시트·다이얼로그
```

바운스 오버슈트·parallax·320ms 초과 fade 없음. 신호 색이 바뀔 때(예: 비교 기준 토글)는 `{motion.dur-base}` 안에서 색만 전환한다.

---

## Shapes

기하 언어는 **중간 라운드 + 평면 표면 + 헤어라인 보더 + 신호 점(dot)**으로 요약된다.

이 시스템의 시그니처 도형은 **신호 점(signal dot)** — 신호색으로 채운 `{rounded.radius-full}` 원형이다. 품목 리스트에서 각 행 좌측 또는 가격 옆에 작은 신호 점을 두어, 색만으로 비쌈/적정/쌈을 한눈에 스캔하게 한다(H1의 "신호등이 먼저"를 가장 작은 단위로 구현). 색맹 접근성을 위해 점에는 항상 텍스트 라벨이나 아이콘(↑/−/↓)을 동반한다.

아이콘은 아웃라인 기본 + 신호 자리에서만 fill, 24px 워크호스, `currentColor` 상속. 외부 컬러 직접 주입은 신호 자리(신호색 상속)를 제외하고 금지한다.

### Iconography

아이콘 세트는 **Lucide**(오픈소스, MIT 라이선스)를 채택한다. 자체 아이콘 세트를 제작할 단계가 아닌 서비스이므로, Feather 계열의 검증된 아웃라인 라이브러리를 1차로 쓴다. Lucide의 기본 사양은 이 시스템의 아이콘 규칙과 그대로 일치한다 — 24×24 그리드, stroke 2px, `currentColor` 상속, `stroke-linecap`/`stroke-linejoin`은 round, fill 없는 아웃라인.

```yaml
icon-library:    Lucide                  # MIT, currentColor 상속, fill 없는 outline
icon-grid:       24                       # 24×24 기본 그리드
icon-stroke:     2                         # 기본 stroke 2px (Lucide 기본값)
icon-linecap:    round
icon-linejoin:   round
icon-color:      currentColor             # 외부 컬러 직접 주입 금지 (신호 자리만 신호색 상속)

# 사이즈 (텍스트 em 기준이 아닌 고정 px)
icon-size-s:     16    # 칩 내부·캡션 옆
icon-size-m:     20    # 리스트 행·입력 필드
icon-size-l:     24    # 워크호스 (버튼·헤더)
icon-size-xl:    32    # 빈 상태·강조
```

#### 신호 방향 아이콘 (Signal Direction)

신호의 비쌈/적정/쌈을 색 없이도 구분하게 하는 **화살표 3종**이다. 색맹 접근성과 마트 옥외 시인성을 위해 신호 표면에는 항상 이 화살표가 동반된다(색 단독 사용 금지 규칙의 실체). 가격이 예년보다 "올라갔다/같다/내려갔다"를 직관적으로 나르는 방향 메타포다.

```yaml
signal-icon-expensive:  "arrow-up"      # ↑ 비쌈 — 예년보다 높음, currentColor = signal-expensive
signal-icon-fair:       "minus"         # − 적정 — 예년 수준,   currentColor = signal-fair
signal-icon-cheap:      "arrow-down"    # ↓ 쌈   — 예년보다 낮음, currentColor = signal-cheap
```

- 세 아이콘 모두 Lucide 기본 아이콘이라 일반 아이콘과 stroke·코너가 자동으로 통일된다(자체 화살표를 섞을 때 생기는 시각 불일치 회피).
- 신호 아이콘은 `currentColor`로 같은 행의 신호색을 상속한다 — 아이콘에 색을 직접 박지 않는다.
- "−"(적정)은 흰 배경 대비를 위해 `{colors.signal-fair}`(warm-grey, L=0.46)를 상속한다 — 흰 배경 대비 7.13:1 통과.

#### 자주 쓰는 일반 아이콘 (Lucide 키)

```yaml
search:        "search"          # 검색 필드
back:          "chevron-left"    # 뒤로 — Figma back-button은 이 글리프를 flatten한 raw Vector (의도, 인스턴스 교체 불필요)
forward:       "chevron-right"   # 이동·더보기
close:         "x"               # 닫기
bookmark:      "bookmark"        # 관심 품목
toggle-compare:"repeat"          # 비교 기준 전환
info:          "info"            # 출처·근거 안내
empty:         "search-x"        # 빈 상태 (검색 결과 없음)
```

---

## Components

핵심 표면은 셋이다 — **품목 시세 카드**(판단의 단위), **신호 칩/점**(H1의 신호등), **게스트 검색 동선**(H4의 마찰 제거). 토큰은 prose에서 `{group.name}`으로 호출한다.

### signal-chip

신호등의 최소 단위. 비쌈/적정/쌈 3상태, Small·Medium 2사이즈. 색만으로 의미를 전달하지 않도록 **아이콘(↑/−/↓) + 라벨**을 항상 동반한다(색맹 접근성).

```tsx
<SignalChip
  level="expensive"        // 'expensive' | 'fair' | 'cheap'
  size="m"                 // 's' | 'm'
  showLabel={true}         // 라벨 텍스트 동반 (기본 true, 색 단독 사용 금지)
>
  비싼 편
</SignalChip>
```

- expensive: `{colors.signal-expensive-weak}` 배경 + `{colors.signal-expensive}` 텍스트/아이콘.
- fair: `{colors.signal-fair-weak}` 배경 + `{colors.signal-fair}` 텍스트(대비 6.13:1).
- cheap: `{colors.signal-cheap-weak}` 배경 + `{colors.signal-cheap}` 텍스트/아이콘.

**size=xs는 사진/이미지 overlay 전용 강조 형식**이다. weak type(옅은 배경)이 아닌 strong type(진한 신호색 배경 + `signal-on` 흰 텍스트). 세 level(cheap·fair·expensive) **모두 동일 구조** — fair 명도가 cheap·expensive와 맞춰진 v3.1 정착으로 가능해진 통일이다. 의도: 이미지 위 시각 대비 확보. xs 사양: padding 2/6, gap 2, icon 12px, label 11/SemiBold raw, cornerRadius pill. 색 매핑: cheap=`{signal-cheap}` bg + `{signal-cheap-on}` text(흰), fair=`{signal-fair}` bg + `{signal-fair-on}` text(흰), expensive=`{signal-expensive}` bg + `{signal-expensive-on}` text(흰). 일반 텍스트 컨텍스트(카드 안, list 안)에선 size=s 또는 size=m을 쓰고, **xs는 photo overlay 자리에만** 사용한다.

### signal-dot

라벨 없는 초소형 신호 표시. 리스트 행 좌측·가격 옆에서 스캔용으로 쓴다. `{rounded.radius-full}`. **단독으로는 의미를 확정하지 못하므로 항상 같은 행의 텍스트 신호와 함께** 둔다.

```tsx
<SignalDot level="cheap" size={8} />
```

### price-item-card

판단의 핵심 단위. KAMIS 품목 하나의 시세를 "판단 문장 → 가격 → 예년 대비"의 위계로 보여준다. 좌측 2px 신호 accent rail이 카드의 유일한 신호색이며, 나머지 표면은 무채색이다.

구조: 신호 칩 → 판단 문장(`{typography.signal-lead}`) → 현재 가격(`{typography.price-lg}`, tabular) → 예년 대비 캡션(`{typography.caption}`).

```tsx
<PriceItemCard
  name="오이"
  level="expensive"
  lead="지금은 비싼 편이에요"
  price={4500}
  unit="개"
  vsNormal="+12%"          // 예년 대비 (product.md H2: '현재 vs 예년')
  source="KAMIS 2026.05.29"
/>
```

- 판단 문장이 가격보다 **위에, 같거나 큰 크기**로 온다(H1).
- 비교 기준은 '현재 vs 예년'이 기본(H2) — '현재 vs 어제'는 보조.
- 출처·날짜 캡션은 `{colors.text-tertiary}`로 신뢰성 근거를 항상 노출한다.

### price-list-row

여러 품목을 스캔하는 리스트 단위. 한 화면에 신호 3색이 공존할 수 있는 유일한 표면이다. 최소 높이 64px(터치 타깃). 좌측 40×40 썸네일(`{rounded.radius-s}`, placeholder `{colors.bg-tertiary}`) + 품목명 + 우측 가격/신호 칩. 신호는 우측 칩이 전달하므로 좌측에 signal-dot을 중복하지 않는다(2026-06-12, dot → thumbnail 교체).

```tsx
<PriceListRow
  left={<Thumbnail src={item.image} size={40} />}
  name="양파"
  price={1980}
  unit="kg"
  right={<SignalChip level="cheap" size="s">싼 편</SignalChip>}
/>
```

### comparison-toggle

비교 기준 전환. '예년 대비' ↔ '어제 대비'를 토글한다(H2 검증 동선). **배치 규칙(2026-06-13): 토글은 자기가 바꾸는 범위의 머리에 둔다** — 상세 화면에서 hero 판단문·차트 기준선·스탯이 모두 전환되므로 차트 내부가 아니라 hero 첫 행(신호 칩 우측)에 배치. 차트에는 "예년 기준선" 범례만 남긴다. **어휘 결정(2026-06-12): 비교 기준은 '평년'이 아니라 '예년'** — KAMIS 내부 용어(평년)보다 일상어에 가까워 마트 앞 10초 판단 어휘와 결이 맞다. UI 카피 전체에 적용(product.md의 가설 서술 원문만 '평년' 유지). 라인(LDSG) switch처럼 즉시 영향을 미치는 컨텍스트에만 쓴다 — 토글 즉시 신호와 % 가 `{motion.dur-base}`로 전환된다.

```tsx
<ComparisonToggle
  value="vsNormal"         // 'vsNormal' | 'vsYesterday'
  onChange={handleChange}
/>
```

### search-field

게스트 우선 동선의 입구. 로그인 없이 바로 품목을 검색한다(H4). `{rounded.radius-s}`, `{colors.bg-secondary}` resting, 포커스 시 1.5px `{colors.border-focus}`. 높이는 **size 2단**(2026-06-12, 인스턴스 수동 축소 규칙 대체):

| size | height | 자리 |
|---|---|---|
| `l` | 48 | 단독 배치 — 홈 입구 (기본) |
| `s` | 40 | `main-header type=search` 내장 — 44 행 안 세로 중앙(상하 2px). hit area 44는 행이 담당 — "아이콘 24 + 44×44 hit area"와 동일 패턴 |

```tsx
<SearchField placeholder="오이, 양파, 계란…" autoFocus />
```

### guest-cta

게스트가 가입 없이 핵심 가치를 경험하게 하는 1차 액션. `{colors.brand-primary}` 배경 + 흰 텍스트. **신호색을 쓰지 않는다** — 게스트 동선은 판단(신호)이 아니라 진입이므로 무대 색(brand)을 쓴다.

```tsx
<GuestCTA size="l">바로 시세 보기</GuestCTA>
```

- Figma 구현(2026-06-12): 별도 스타일이 아니라 **button size=l/variant=primary 인스턴스를 감싼 시맨틱 래퍼 컴포넌트** — 시각 캐논은 button 한 곳에서 관리한다. brand-primary(#141f2c) 위 흰 텍스트 대비 16.64:1(AAA).

### button

XL/L/M/S 4단. height·radius·label이 함께 변한다(토스 패턴). 신호 판단에는 쓰지 않고, 일반 액션(검색·저장·공유)에만 쓴다.

| 사이즈 | height | radius | label |
|---|---|---|---|
| XL | 56 | `{rounded.radius-m}` (12) | `{typography.label}` 17/700 |
| L  | 48 | `{rounded.radius-m}` (12) | `{typography.label}` 15/700 |
| M  | 40 | `{rounded.radius-s}` (8)  | `{typography.label}` 15/600 |
| S  | 32 | `{rounded.radius-s}` (8)  | `{typography.label}` 13/600 |

- primary: `{colors.brand-primary}` 배경 + 흰 텍스트.
- secondary: `{colors.bg-secondary}` 배경 + `{colors.text-primary}`.
- ghost: 투명 + `{colors.brand-primary}` 라벨.
- pressed = `{colors.overlay-press}` overlay, disabled = 전체 노드 `{colors.disabled-opacity}`(0.40).

### bottom-cta

화면 최하단 고정 56pt 액션. 좌우 16px padding, 위쪽 `white → transparent` 보호 그라디언트, `env(safe-area-inset-*)` 자동 인식(토스 차용).

### bottom-sheet

dialog의 1차 모바일 대체. `{elevation.shadow-sheet}`, `{colors.overlay-scrim}` 딤, 상단 `{rounded.radius-l}`(16). 사용처가 정의된 동선에만 배치한다(예: 관심 품목 옵션, 단위·등급 선택). **'비교 기준 선택'은 사용처가 아니다** — 기준이 2개뿐이라 comparison-toggle의 즉시 전환이 담당(2026-06-12 역할 정리).

### toast

`{colors.grey-900}` 표면 + 흰 라벨, `{rounded.radius-m}`, `{elevation.shadow-3}`. "관심 품목에 추가했어요" 같은 짧은 확인.

### empty-state

검색 결과 없음·KAMIS 데이터 미수집 품목 안내. 판단 도구이므로 **데이터가 없을 때 추측하지 않고 솔직히 부재를 알린다**(product.md의 신뢰성 원칙). 신호색을 쓰지 않는 무채색 일러스트 + 안내 문구.

### segmented-control
화면 내 상호배타 뷰 전환. track 위에 선택 pill이 이동하는 형식.

- track: {colors.bg-secondary} 배경, cornerRadius pill.
- 선택 pill: {colors.bg-elevated} 배경, 그림자 최소(elevation-1).
- 라벨 selected: {colors.text-primary} / unselected: {colors.text-tertiary}.
- clipsContent 기본 true → track 라운드 위해 명시 처리.

<SegmentedControl
  value="retail"                    // 선택 세그먼트 key
  options={['retail','wholesale','eco']}   // 소매 | 도매 | 친환경
  fullWidth                         // 라벨 균등 분할
/>

### detail-chart
상세 화면 추세 표시. sparkline 확장형(상단 라벨·기준선·끝점 동반). 
**`{component.surface-card}`에 담아** 단독 표면이 아니라 카드 블록으로 둔다.

- 컨테이너: `{component.surface-card}` (bg-elevated, radius-m 12, shadow-1, clipsContent false). 
  padding은 기본 16이 아니라 `{spacing.space-5}`(20)로 오버라이드 — 차트 시각 요소가 숨 쉴 공간 확보.
- 라인: {colors.signal-cheap}.
- area fill: {colors.signal-cheap} 직접 RGBA(저채도). alias+alpha 미지원 → 직접 RGBA.
- 기준선: {colors.border-strong} 점선 + 라벨 슬롯.
- 끝점: signal-dot 인스턴스(라인과 동일 level).
- 상단 라벨: 좌 periodLabel {colors.text-primary} / 우 "예년 = 100" {colors.text-tertiary}.
- 하단 캡션: "예년 = 여러 해 같은 시기의 평균이에요" {colors.text-tertiary} {typography.caption}.
- strokeWeight·아이콘 width는 setBoundVariable 무음 실패 → raw 값.
- clipsContent 카드 false 명시.

<DetailChart
  data={prices14d}                  // 최근 14일
  baseline={normalYear}             // 예년 = 100 기준선
  level="cheap"                     // 라인·끝점 신호 매핑
  periodLabel="최근 14일"
  baselineLabel="예년"
/>

### surface-card

통계 그리드·detail-chart 등 **무채색 정보 블록을 담는 범용 컨테이너**. 
price-item-card(신호 판단 전용, 좌측 accent rail 있음)와 분리된, 신호색 없는 중립 카드다. 
이름 붙은 recipe로 두어 화면마다 배경·radius·padding을 손으로 조합하지 않게 한다.

| 속성 | 토큰 |
|---|---|
| 배경 | `{colors.bg-elevated}` (white) |
| radius | `{rounded.radius-m}` (12) |
| shadow | `{elevation.shadow-1}` |
| padding | `{spacing.space-4}` (16, 기본) |
| 내부 행 간격 | `{spacing.space-4}` (16) |

- 신호색을 쓰지 않는다 — 신호는 카드 *안의* chip/dot/차트 라인이 나르고, 컨테이너 자체는 무채색 무대다.
- clipsContent 기본 true → 차트 끝점·라벨이 잘리지 않도록 **false 명시**.
- 카드끼리의 외부 간격은 `{spacing.space-6}`(24, 섹션 구분).
- padding은 기본 16이며, 시각 요소가 숨 쉴 공간이 필요한 경우(detail-chart) 인스턴스에서 `{spacing.space-5}`(20)로 오버라이드한다.

---

## Do's and Don'ts

### Do

- 신호 판단 자리에는 **신호등 3색만** 쓴다 — `{colors.signal-expensive}`(비쌈) / `{colors.signal-fair}`(적정) / `{colors.signal-cheap}`(쌈). 다른 색을 판단색으로 승격시키지 않는다.
- 판단 문장(`{typography.signal-lead}`)을 가격 숫자보다 **위에, 같거나 큰 크기**로 둔다 — H1("숫자보다 신호등이 먼저")의 직접 구현이다.
- 비교 기준은 **'현재 vs 예년'을 기본**으로 둔다(H2) — '현재 vs 어제'는 보조 옵션.
  ('예년' = 여러 해 같은 시기 평균. KAMIS 검증상 주간 평균은 신호 반전이 잦아 
  예년을 베이스라인으로 확정. 화면 라벨은 '예년'으로 통일하고 뜻은 차트 캡션이 푼다.)
- 신호는 **색 + 아이콘(↑/−/↓) + 라벨** 셋을 함께 쓴다 — 색맹 접근성과 옥외 시인성을 위해 색 단독 사용을 금지한다. 신호 방향은 Lucide의 `arrow-up`(비쌈) / `minus`(적정) / `arrow-down`(쌈)으로 고정한다.
- 아이콘은 Lucide를 쓰고 `{colors.icon-color}`(currentColor)를 상속하게 둔다 — 신호 자리(신호색 상속)를 제외하고 색 직접 주입을 금지한다.
- 가격 숫자는 `{typography.font-feature-numeric-tabular}`로 정렬하고, 단위('원'·'/kg')는 `{colors.price-unit}`로 한 단계 약하게 둔다.
- KAMIS 출처·기준일을 `{component.price-item-card}`에 항상 노출한다 — 판단의 근거가 신뢰성을 만든다.
- 게스트 진입 동선(`{component.guest-cta}`·`{component.search-field}`)은 로그인 없이 도달 가능하게 유지한다(H4).
- product 카피는 **해요체 + 위임형**으로 쓴다 — "지금은 비싼 편이에요"처럼 판단을 대신 내리되 근거를 함께 말한다.
- 캔버스·크롬은 `{colors.bg-canvas}`(무채색 화이트)로 조용히 둔다 — 신호등에 무대를 양보한다.

### Don't

- 브랜드색(`{colors.brand-primary}`)을 신호 판단 자리에 쓰지 않는다 — 브랜드색은 진입·링크·포커스 전용이며, 판단은 신호등 몫이다.
- 캔버스·크롬에 채도 높은 포인트색을 깔지 않는다 — 신호등이 배경에 묻혀 H1이 무너진다(지마켓식 라우드 캔버스 회피).
- 신호 색을 hex/rgba로 새로 정의하지 않는다 — `{colors.signal-*}` 토큰으로만 참조한다.
- 신호 점(`{component.signal-dot}`)을 텍스트 신호 없이 단독으로 의미 확정에 쓰지 않는다.
- `{colors.signal-fair}` raw를 흰 배경 위 본문 글자에 올린 뒤 가독성 점검 없이 두지 않는다 — L=0.46이라 흰 배경 대비 7.13:1로 통과하지만, body 글자가 stage `text-secondary`(grey-700)와 명도가 거의 같아 의미가 뭉친다. 신호의 의미가 있는 자리(칩·점·강조)에만 쓰고, 본문 글자는 stage 텍스트 토큰에 위임.
- KAMIS 데이터가 없는 품목에 신호를 추측해 띄우지 않는다 — `{component.empty-state}`로 부재를 솔직히 알린다.
- 가입을 검색·판단 앞에 강제로 끼우지 않는다(H4).
- 마케팅 과장("초특가", "역대급")·챗봇 톤("~해보세요!")·단정형 `-다` 카피를 쓰지 않는다 — 해요체 위임형이 표준이다.
- iOS류 squircle·과한 큐트 라운드를 쓰지 않는다 — `{rounded.*}` 사다리(기본 12px) 안에서 절제한다.
- 그림자를 강하게 깔지 않는다 — 표면 분리는 1px `{colors.border-default}` 헤어라인이 담당한다.

---

## Responsive Behavior

이거비싸?는 **모바일 우선·한 손 사용** 전제로 잠겨 있다. 마트 앞 옥외 환경이 1차 컨텍스트다.

| Context | Key Changes |
|---|---|
| Mobile (≤ 640px) | 기본 환경 — 단일 컬럼, `{component.bottom-cta}`로 최하단 액션, `{component.bottom-sheet}`를 dialog 1차 대체로 사용 |
| Tablet/Desktop (> 640px) | 부수적 surface — 단일 컬럼 유지 권장, 리스트 폭만 확장 |

- **터치 타깃**: 모든 인터랙티브 표면 최소 44×44px (iOS HIG 표준, 헤더 바 높이 44와 정합). `{component.price-list-row}`는 행 전체(최소 64px)가 hit area. 헤더 아이콘 버튼은 아이콘 24 + 44×44 hit area.
- **신호 대비**: v3.1 색 체계의 6개 핵심 짝(weak 배경 위 텍스트 + strong 표면 위 on-텍스트)이 모두 WCAG AA(4.5:1)를 통과한다 — cheap-text on cheap-weak 4.84 / cheap-on(white) on cheap 5.53 / fair on fair-weak 6.13 / fair-on(white) on fair 7.13 / expensive-text on expensive-weak 4.77 / expensive-on(white) on expensive 5.67. 세 level 모두 strong 표면 위는 흰 텍스트로 통일(`X-on` = `#ffffff` 일관). 실측값은 토큰 산출 단계에서 culori + coloraide 양쪽으로 cross-validate.
- **한 손 도달성**: 1차 액션은 `{component.bottom-cta}`로 화면 하단 엄지 영역에 둔다.

---

## Known Gaps

다운스트림 구현 시 별도 근거 위에서 확정해야 하는 항목이다.

- **신호 임계값(threshold) 정의**: "비쌈/적정/쌈"을 가르는 예년 대비 % 경계(예: +10% 이상 비쌈, ±10% 적정, −10% 이하 쌈)는 디자인 토큰이 아니라 제품 로직이다 — product 데이터 검증 위에서 확정해야 한다.
- ~~**brand-primary 대비**~~ (2026-06-12 해소): "흰 텍스트 4.02 미달"은 brand가 파랑이던 시절 기록. 현 brand-primary(= grey-900 `#141f2c`)는 흰 텍스트 대비 **16.64:1 (AAA)** — culori 검증 완료. "색 재편 시 prose 동기화 별도" 함정의 실례로 남겨둔다.
- **OKLCH→hex 변환 손실**: 토큰을 culori로 OKLCH→sRGB 변환해 Figma hex로 저장한다. v3 신호색은 채도(C) 값을 의도적으로 낮춰(0.020~0.175) 모두 sRGB 게멋 안에 들어와 클리핑 손실이 없으나, OKLCH가 canonical이고 hex는 sRGB 폴백이라는 원칙은 유지된다 — 후속 채도 상향 조정 시 게멋 검증 필수.
- **overlay 토큰의 alias 한계**: Figma Variables가 alias와 알파 오버라이드를 동시에 지원하지 않아 `overlay/scrim`·`overlay/press`는 Semantic 컬렉션에 직접 RGBA로 정의했다. 다른 semantic 변수는 모두 Primitives alias이지만 이 둘만 예외이며, Primitives `black/pure`를 변경해도 자동 반영되지 않으므로 함께 갱신해야 한다.
- **shadow·overlay 색의 변수 alias 불가**: Color + alpha를 요구하는 자리(overlay, shadow)는 모두 변수 alias 대신 직접 RGBA로 정의 — Figma 변수의 alias+알파 동시 미지원 제약. `grey-900` 변경 시 자동 반영 안 됨.
- **Lucide 아이콘 width 바인딩 우회**: Lucide 아이콘 인스턴스에 width 변수를 바인딩하면 Figma Plugin API가 무음으로 거부한다(height는 정상 바인딩). `constrainProportions = true` 설정으로 우회 가능 — Lucide는 항상 정사각이라 의미적으로 안전하다. 다른 아이콘 라이브러리 도입 시 재검토 필요.
- **Auto Layout frame의 clipContent 기본값 함정**: Figma 구현 시 Auto Layout frame은 `clipsContent = true`가 기본이라 내용이 잘려 보인다. docs 페이지·컴포넌트 컨테이너 등 잘릴 의도가 없는 자리는 새 frame 생성 직후 **명시적으로 `clipsContent = false`로 설정**해야 한다. 정해진 박스 안 표현(아이콘 마스킹·이미지 자르기 등)에만 예외로 `true` 명시. width 바인딩(constrainProportions)·alias+알파 미지원과 함께 MCP 작업 시 반복되는 함정이다.
- **strokeWeight 변수 바인딩 무음 거부**: Frame의 `strokeWeight`(선 두께)를 변수에 바인딩하면 Plugin API가 에러 없이 거부한다. 현재는 raw 숫자로 박혀 시각상 정상이나 토큰 자동 반영 안 됨. icon width 바인딩과 같은 패턴 — 선·치수 필드 변수 바인딩의 신뢰성 문제.
- **OPACITY scope 변수의 단위 함정**: Figma OPACITY scope 변수는 0-100 단위, CSS는 0-1 단위. design.md↔Figma 동기화 시 OPACITY 변수만 ×100/÷100 변환 필요. 현재 `opacity/disabled`는 design.md=`0.40`, Figma 변수=`40`으로 저장. 노드의 `opacity` 속성은 0-1 단위(변수와 다름)이므로 노드에 직접 박을 때는 `0.40`을 그대로 쓴다.
- **variant 전환은 자손 오버라이드를 리셋한다**: 인스턴스의 variant를 `setProperties`로 전환하면 그 인스턴스 **자손에 걸어둔 오버라이드(중첩 인스턴스 swap, 텍스트 characters 등)가 새 variant의 기본값으로 리셋**된다. 2026-06-12 두 자리에서 재현 — (1) Tab Bar 탭 Selected 전환 시 하트 아이콘이 기본 집 아이콘으로 복귀, (2) signal-chip level 전환 시 재료명 텍스트 오버라이드 소실. 워크플로우 규칙: **variant 전환을 먼저, 오버라이드는 그 후에** 적용한다. 자동화 스크립트에서 전환과 오버라이드를 한 호출에 섞을 때는 순서를 강제하고, 전환 후 시각 검증(스크린샷)으로 오버라이드 생존을 확인한다.
- **BOOLEAN component property의 바인딩 한계**: Figma `componentPropertyReferences`로 BOOLEAN이 직접 바인딩할 수 있는 노드 필드는 `visible`·`characters`·`mainComponent` 셋뿐. `layoutSizingHorizontal`(fullWidth 같은 가변 사이징), `opacity`(disabled 페이드), `layoutGrow` 등 layout/visual 토글은 BOOLEAN으로 직결 불가. **fullWidth는 컴포넌트가 아니라 인스턴스 단계에서 수동으로 `layoutSizingHorizontal = 'FILL'` 적용** 규칙. **disabled는 VARIANT로 승격**해 disabled=true variant 자체에 opacity 0.40을 박는 패턴.
- **Button height 토큰 raw 유지**: button size=s/m/l/xl의 height(32/40/48/56)는 4-grid 사다리 안에 들어가지만 spacing(GAP scope) 토큰의 의미와 어긋나 별도 height 토큰 시리즈를 만들지 않고 size variant별 raw로 유지한다. 추후 컨트롤 height 토큰 체계가 필요하면 재검토.
- **fair(neutral-grey) 색맹·환경 검증** (2026-06-13 개정): `signal-fair`는 완전 중립(#616060)으로, stage 회색과의 구분은 hue가 아니라 문맥·형태(칩/점/화살표 표면 한정 사용)에 의존한다. 마트 옥외 밝은 조명·노안 사용자 조건에서 이 문맥 분리가 충분한지 실사용 테스트 필요. cheap(green)/expensive(orange) 짝은 적록 색맹 가장 까다로운 분리이므로 화살표 아이콘(↑/−·→/↓) 동반 규칙이 색맹 보조의 1차 수단이다.
- **중립 색의 명도 ≠ 의미**: 채도가 0에 가까운 토큰(warm-grey `signal/fair`, stage `grey/*`)은 채도가 의미를 정의하므로 명도는 자유 변수다. fair 명도를 0.62→0.46으로 낮춰도 "중립" 의미는 유지된다(채도 0.020 그대로). 반면 채도 있는 토큰(cheap green, expensive orange)은 명도 변경이 채도 인지에 영향을 주므로 보수적으로 — 명도 ↓ 시 채도가 ↓ 보이는 OKLCH 인지 효과를 고려.
- **토큰 진화의 부수효과 (우회 토큰 자연 삭제)**: 캐논(`X-on` 흰색 일관 같은)으로 한 차원이 정착하면, 그 차원을 우회하기 위해 만든 보조 토큰이 자연스럽게 redundant가 된다 — 시스템 단순화 신호. v3.1에서 fair 명도가 cheap·expensive와 맞춰지자 옛 우회 토큰 `signal/fair-text`(어두운 warm-grey 텍스트 전용)가 `signal/fair` 자체와 같은 자리를 차지해 삭제됐다. 단, 우회 토큰 삭제는 모든 참조(alias·paint·componentPropertyReference 세 자리)에서 재바인딩이 완료된 후에만.
- **dead variable 정의 확장**: "dead"는 단순 "이름이 안 쓰임"이 아니라 세 자리 모두 0이어야 한다 — (1) 다른 변수의 alias로 참조 0건, (2) 노드의 `boundVariables`(paint·opacity·padding 등)에 0건, (3) 컴포넌트 `componentPropertyReferences`(VARIANT/BOOLEAN/TEXT 바인딩)에 0건. 한 자리만 확인 후 삭제하면 hanging reference 발생 — 이번 세션 fair xs text가 dead var `220:2633`에 hanging하여 fallback white(#ffffff)로 표시된 게 그 예. 삭제 전 세 자리를 Plugin API로 모두 스캔하는 audit이 안전선.
- **scroll container의 padding 패턴**: 가로 scroll 자식을 갖는 카드는 outer wrapper에 horizontal padding을 두면 scroll 시 첫·마지막 카드만 빈 공간이 남는다. wrapper padding=0으로 하고 자식 list에 양끝 padding을 위임하는 게 표준(scroll 끝에서 자연스러운 페이딩). wrapper에 `clipsContent=true`로 잘려 보이는 부분을 마스킹하면서 자식이 padding을 책임지는 분업.
- **padding 변수 바인딩 신뢰 가능 (반증)**: spacing/* 변수를 Auto Layout frame의 `paddingLeft/Right/Top/Bottom`에 바인딩하면 silent reject 없이 정상 적용된다 — `strokeWeight`·icon `width`의 무음 거부와 대비된다. 신뢰성 우선순위: 색·투명도·padding은 신뢰 가능, 선 두께·치수 필드는 의심. 새 함정 후보 식별 시 이 분류로 우선 의심.
- **다크 모드**: 본 문서는 라이트 모드 전용이다. 마트 환경이 주로 실내 조명이라 우선순위가 낮지만, 다크 대응 시 신호 3색의 명도·채도를 다크 캔버스 기준으로 재매핑해야 한다.
- **자체 서체**: 현재 Pretendard로 출발한다. 토스(TPS)·지마켓(Gmarket Sans)처럼 브랜드 서체를 만들 단계가 되면 가격 숫자 tabular figure 품질을 1차 기준으로 검토한다.
- **타이포 line-height·tracking 미세값**: Type ramp의 값은 권장 출발점이며, 실제 Pretendard 렌더링에서 한글 가독성 기준으로 재측정이 필요하다.
- **로고**: 브랜드 로고는 아직 없다 — 워드마크/심볼 정의가 필요하다. (아이콘 세트는 Iconography 섹션에서 Lucide로 확정됨)
- **신호 아이콘 커스터마이징 여지**: 현재 신호 방향은 Lucide의 `arrow-up`/`minus`/`arrow-down`을 그대로 쓴다. 브랜드 정체성이 성숙하면 신호 화살표만 자체 제작해 시그니처화할 수 있으나, 그 경우에도 Lucide의 24그리드·2px stroke·round cap 사양을 유지해 나머지 아이콘과의 통일성을 깨지 않는다.
- **Figma의 `GLASS` 효과 타입은 `BACKGROUND_BLUR`와 다른 신규 노드 효과**: iOS 26 호환 표면용으로 도입된 별개 타입이며, `radius` 외에 `refraction`·`depth`·`lightAngle`·`lightIntensity`·`dispersion`·`splay` 6개 필드가 모두 필수다. Plugin API는 누락 시 validation error로 에러를 명확히 던진다(다른 무음 거부 함정들과 달리 즉시 잡힘). floating UI 작업 시 항상 `GLASS`를 쓰고 `BACKGROUND_BLUR` 사용 금지 — 시각적으로 비슷해 보여도 굴절·디스퍼젼·라이트 처리가 달라 결과가 다르다. 신규 GLASS 효과를 만들 때는 기존 GLASS 노드의 effect 구조를 그대로 복제하는 게 가장 안전하다.
- **`createEffectStyle()` 비-트랜잭션 함정**: `figma.createEffectStyle()`는 빈 스타일을 즉시 생성하고, 이후 `style.effects = [...]`가 throw하면 스타일이 빈 채로 남는다. 재시도 시 이름 충돌 발생. 우회: 실패 후 `getLocalEffectStylesAsync()`로 빈 스타일을 찾아 다시 effects만 설정. shadow·overlay alias+α 미지원과 다른 결의 트랜잭션성 함정.
- **LINEAR_BURN 블렌드 패턴 (glass 표면 한정)**: glass surface 위에 올라가는 selection chip 배경과 inactive label 텍스트는 NORMAL 알파 합성이 아니라 `LINEAR_BURN` 블렌드 모드로 합성한다 — 일반 알파보다 어두운 영역이 깊어져 glass 톤과 톤-맞춤이 이루어진다. iOS 26의 시각 어휘 핵심. Dark 모드 대응은 `LINEAR_DODGE`로 대칭. glass surface가 **아닌** 일반 캔버스 위 chip·label은 NORMAL 유지(이 규칙은 glass 컨텍스트 한정). blendMode는 변수 바인딩 대상이 아니므로 노드에 raw로 박힌다.
- **disabled-opacity 두 종 분리 (0.40 vs 0.30)**: 일반 disabled는 `opacity/disabled` = 0.40, glass 위 disabled는 `opacity/disabled-glass` = 0.30으로 분리한다. glass surface는 자체 투명도가 있어 0.40을 곱하면 비활성이 거의 사라져 보인다. 한 단계 진하게(=0.30) 잡아야 glass 위에서도 비활성 식별 가능. 컨텍스트 별 disabled 토큰을 두 개 운용해야 한다는 결정.
- **Glass tint primitive 미분리 (recipe 단위로만 의미)**: glass pill recipe의 두 tint 레이어(`#dddddd` COLOR_BURN, `#f7f7f7` DARKEN)는 별도 primitive 변수로 분리하지 않는다. 순수 무채색(r=g=b)이라 cool-blue tint인 `stage/grey-*` 팔레트와 충돌하고, 블렌드 모드 + 스택 순서와 결합해서만 의미가 발생하기 때문. recipe 안의 raw로 유지하며 `surface/glass-light`(white α0.65)만 변수로 승격. recipe 외부에서 단독 사용 금지.
- **라이브러리 instance 자손 노드의 fills[0]·opacity 변수 바인딩은 무음 거부 없음(반증)**: Tab Bar iPhone 컴포넌트(Apple 라이브러리에서 들고온 nested instance) 자손의 `fills[0]`와 `opacity`에 로컬 변수를 바인딩해도 silent reject 없이 정상 적용됐다(32 variant × 24 BG = 검증 충분). 무음 거부 함정은 `width`(icon)·`strokeWeight` 등 일부 치수 필드에 국한되며, 표준 속성(fill color·node opacity·effectStyleId) 바인딩은 신뢰 가능. 차후 함정 후보 식별 시 "치수·선 두께 vs 색·투명도" 축으로 우선 의심.
- **Semantic alias 연쇄 의존성**: `text/active`·`border/focus`·`bg/primary` 등 semantic 토큰이 `brand/primary`를 alias로 가리키면, brand 변경 시 연쇄 영향. 시스템 변경 전에 어느 semantic이 어느 primitive에 의존하는지 매핑 확인 필수. 본 프로젝트 의존 자리(2026-06-02 기준): `border/focus`·`bg/primary`·`text/active` 모두 `brand/primary` alias — brand 색 재정의 시 tab 활성·search focus·primary CTA가 한 번에 영향받음.
- **색 체계 재편 시 prose 동기화 별도**: Foundation 페이지 description, design.md 본문 같은 prose는 변수 alias로 묶이지 않음. 색 의미 변경 시 prose 텍스트도 함께 수동 갱신 필요 — 변수 값만 바꾸면 시각은 자동 반영되지만 문서·라벨이 옛 어휘에 머문다.
- **디자이너 손 작업의 일반 함정**: naming 컨벤션 비일관(같은 의미 다른 접미사 — 예: `signal/cheap-white` vs `signal/expensive-on` vs `signal/fair-black`), 잔존 dead variable(어디서도 alias 안 받는 토큰), 시스템 룰 우회. 손 작업 후 audit 단계 필수 — Claude Code의 audit이 자동화보다 강한 자리.
- **손 작업과 자동화의 분업 패턴** (세션 누적 발견):
  - 손 작업 강한 영역: glass/blur 효과(iOS pill), 색 OKLCH 산출+검산, 자유 곡선/SVG path
  - 자동화 강한 영역: audit(변수 alias·dead variable·naming 컨벤션 검사), 토큰 일괄 적용, 대량 인스턴스 교체
  - 워크플로우: 디자이너 손 → Claude Code audit → 시스템 동기화 → 시각 회귀 점검

---

## References

- product.md — 이거비싸? Product Context (페르소나·가설 H1/H2/H4·포지셔닝)
- 토스 design.md — 무채색 캔버스·OKLCH 토큰·해요체·bottom-cta·motion 토큰 참조
- 라인 LDSG design.md — opacity 기반 state 처리·토큰 추상화·switch 패턴 참조
- 지마켓 GDS design.md — 가격/단위 분리·상태색 구조·tabular 숫자·8그리드 참조
- KAMIS 농수산물 가격정보 API — 시세 데이터 출처

---

# 3. 앱 소스 구조
```
mobile/src/api/kamis.ts
mobile/src/app/_layout.tsx
mobile/src/app/(tabs)/_layout.tsx
mobile/src/app/(tabs)/favorites.tsx
mobile/src/app/(tabs)/index.tsx
mobile/src/app/(tabs)/recipes.tsx
mobile/src/app/item/[key].tsx
mobile/src/app/search.tsx
mobile/src/components/igb/Buttons.tsx
mobile/src/components/igb/ChangeIndicator.tsx
mobile/src/components/igb/ComparisonToggle.tsx
mobile/src/components/igb/EmptyState.tsx
mobile/src/components/igb/GlassTabBar.tsx
mobile/src/components/igb/PriceListRow.tsx
mobile/src/components/igb/SearchField.tsx
mobile/src/components/igb/SegmentedControl.tsx
mobile/src/components/igb/SignalChip.tsx
mobile/src/components/igb/Sparkline.tsx
mobile/src/components/igb/Wordmark.tsx
mobile/src/store/favorites.tsx
mobile/src/store/prices.tsx
mobile/src/theme/tokens.ts
mobile/src/thumbnails.gen.ts
```

---

# 4. 앱 소스 전문

## `mobile/src/api/kamis.ts`
```tsx
/**
 * KAMIS 농수산물 가격정보 Open API 어댑터.
 * - dailyPriceByCategoryList: 카테고리별 당일/예년(dpr7) 시세 → 신호 계산의 원천
 * - periodProductList: 일별 시계열 → 상세 차트
 * 응답 포맷은 .api-samples/*.json 실응답 기준.
 */
import type { SignalLevel } from '../theme/tokens';

const BASE = 'https://www.kamis.or.kr/service/price/xml.do';
const CERT_KEY = process.env.EXPO_PUBLIC_KAMIS_KEY ?? '';
const CERT_ID = process.env.EXPO_PUBLIC_KAMIS_ID ?? '';

/** 신호 임계값(±10%) — design.md Known Gaps: 제품 로직, 검증 후 조정 대상 */
const THRESHOLD = 0.1;

export const CATEGORIES = [
  { code: '100', name: '식량작물' },
  { code: '200', name: '채소' },
  { code: '400', name: '과일' },
  { code: '500', name: '축산' },
] as const;

export interface PriceItem {
  categoryCode: string;
  itemName: string;
  itemCode: string;
  kindName: string;
  kindCode: string;
  rankCode: string;
  unit: string;
  /** 당일 (dpr1) */
  today: number | null;
  /** 1일전 (dpr2) */
  yesterday: number | null;
  /** 1개월전 (dpr5) */
  monthAgo: number | null;
  /** 1년전 (dpr6) */
  yearAgo: number | null;
  /** 일평년 — UI 어휘 '예년' (dpr7) */
  normal: number | null;
  level: SignalLevel | null;
  /** 예년 대비 % (양수 = 예년보다 비쌈) */
  vsNormalPct: number | null;
  vsYesterdayPct: number | null;
}

export interface SeriesPoint {
  date: string; // MM/DD
  price: number;
}

function parsePrice(v: unknown): number | null {
  if (typeof v !== 'string' || v === '-' || v === '' || v === '0') return null;
  const n = Number(v.replace(/,/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function judge(today: number | null, base: number | null): SignalLevel | null {
  if (today == null || base == null) return null;
  const r = (today - base) / base;
  if (r <= -THRESHOLD) return 'cheap';
  if (r >= THRESHOLD) return 'expensive';
  return 'fair';
}

function pct(today: number | null, base: number | null): number | null {
  if (today == null || base == null) return null;
  return Math.round(((today - base) / base) * 100);
}

function qs(params: Record<string, string>): string {
  return Object.entries({
    p_cert_key: CERT_KEY,
    p_cert_id: CERT_ID,
    p_returntype: 'json',
    ...params,
  })
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
}

function fmtDate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** 시장 구분 — 01 소매 / 02 도매. 친환경은 EcoPriceList 별도 API(예년 없음)라 미지원. */
export type MarketCls = '01' | '02';

/** 카테고리 하나의 당일 시세 목록 (서울 기준) */
export async function fetchCategory(
  categoryCode: string,
  regday?: string,
  cls: MarketCls = '01',
): Promise<PriceItem[]> {
  const url = `${BASE}?${qs({
    action: 'dailyPriceByCategoryList',
    p_product_cls_code: cls,
    p_country_code: '1101', // 서울
    p_regday: regday ?? fmtDate(new Date()),
    p_convert_kg_yn: 'N',
    // 주의: 문서·체감상 'p_category_code'가 아니라 'p_item_category_code'만 동작한다.
    // 잘못된 이름이면 에러 없이 기본 부류(100 식량작물)로 떨어지는 무음 폴백 — 2026-06-13 디버깅으로 확인.
    p_item_category_code: categoryCode,
  })}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`KAMIS HTTP ${res.status}`);
  const json = await res.json();
  const rows: any[] = json?.data?.item ?? [];
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((r) => r.item_name && r.item_code)
    .map((r) => {
      const today = parsePrice(r.dpr1);
      const yesterday = parsePrice(r.dpr2);
      const normal = parsePrice(r.dpr7);
      return {
        categoryCode,
        itemName: String(r.item_name),
        itemCode: String(r.item_code),
        kindName: String(r.kind_name ?? ''),
        kindCode: String(r.kind_code ?? '00'),
        rankCode: String(r.rank_code ?? '04'),
        unit: String(r.unit ?? ''),
        today,
        yesterday,
        monthAgo: parsePrice(r.dpr5),
        yearAgo: parsePrice(r.dpr6),
        normal,
        level: judge(today, normal),
        vsNormalPct: pct(today, normal),
        vsYesterdayPct: pct(today, yesterday),
      };
    });
}

/** 전 카테고리 병렬 수집. 당일 데이터가 비면 어제 날짜로 1회 재시도. */
export async function fetchAllCategories(): Promise<PriceItem[]> {
  const load = async (regday?: string) => {
    const results = await Promise.allSettled(
      CATEGORIES.map((c) => fetchCategory(c.code, regday)),
    );
    return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  };
  let items = await load();
  if (items.every((i) => i.today == null)) {
    // KAMIS는 당일 데이터를 오후 4시경 발행 — 그 전엔 어제 날짜로 폴백
    const y = new Date();
    y.setDate(y.getDate() - 1);
    items = await load(fmtDate(y));
  }
  // 같은 품목·품종이 중복 반환되는 경우 첫 항목만 유지
  const seen = new Set<string>();
  return items.filter((i) => {
    const k = `${i.itemCode}-${i.kindCode}-${i.rankCode}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/**
 * 품목 일별 시계열 (상세 차트, countyname=평균 행만).
 * 주의: period API의 p_productrankcode는 daily의 rank_code와 코드 체계가 다르다 —
 * 축산(500)은 1(상품)/2(중품), 농산은 04/05. daily 계란 rank_code '71'을 그대로 보내면
 * 에러 없이 빈 응답(무음 실패). 후보 코드를 순서대로 시도한다. (2026-06-13 디버깅)
 */
async function fetchPeriodRows(
  item: Pick<PriceItem, 'categoryCode' | 'itemCode' | 'kindCode' | 'rankCode'>,
  days: number,
  cls: MarketCls,
): Promise<any[]> {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  const rankCandidates =
    item.categoryCode === '500' ? ['1', '2'] : [item.rankCode, '04', '05'];

  for (const rank of [...new Set(rankCandidates)]) {
    const url = `${BASE}?${qs({
      action: 'periodProductList',
      p_productclscode: cls,
      p_startday: fmtDate(start),
      p_endday: fmtDate(end),
      p_itemcategorycode: item.categoryCode,
      p_itemcode: item.itemCode,
      p_kindcode: item.kindCode,
      p_productrankcode: rank,
      p_countycode: '1101',
      p_convert_kg_yn: 'N',
    })}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`KAMIS HTTP ${res.status}`);
    const json = await res.json();
    const rows: any[] = json?.data?.item ?? [];
    if (Array.isArray(rows) && rows.length > 0) return rows;
  }
  return [];
}

function rowsToSeries(rows: any[]): SeriesPoint[] {
  return rows
    .filter((r) => r.countyname === '평균')
    .map((r) => ({ date: String(r.regday), price: parsePrice(r.price) }))
    .filter((p): p is SeriesPoint => p.price != null);
}

export async function fetchSeries(
  item: Pick<PriceItem, 'categoryCode' | 'itemCode' | 'kindCode' | 'rankCode'>,
  days = 28,
  cls: MarketCls = '01',
): Promise<SeriesPoint[]> {
  return rowsToSeries(await fetchPeriodRows(item, days, cls));
}

export interface MarketPrice {
  market: string;
  price: number;
}

/** KAMIS 익명 판매처 코드 패턴 (A-대형마트, B`-유통 …) — 브랜드 실명은 비공개 */
const ANON_MARKET = /^[A-Z][`']?-(대형마트|백화점|SSM|생협|유통)$/;
// 'X-유통' = KAMIS의 대형유통업체(대형마트·기업형 체인슈퍼) 익명 코드 — 동네 슈퍼 아님(조사 대상 외)
const TYPE_LABEL: Record<string, string> = { SSM: '기업형 슈퍼', 유통: '대형마트·체인슈퍼' };

/**
 * 판매처별 최신 가격 — 갈 수 있는 곳만 실명으로.
 * 전통시장(실명)은 개별 행("경동시장"), 익명 코드는 묶어봐야 정보 손실이 없으므로
 * 업태 평균 한 줄("유통점 8곳 평균")로 합친다. 싼 순 정렬.
 */
function groupMarkets(rows: any[]): MarketPrice[] {
  const latest = new Map<string, { regday: string; price: number }>();
  for (const r of rows) {
    if (!r.marketname) continue;
    // p_countycode를 줘도 전국 시장 행이 섞여 온다 — 서울 행만 사용 (2026-06-13 확인)
    if (r.countyname !== '서울') continue;
    const p = parsePrice(r.price);
    if (p == null) continue;
    const prev = latest.get(r.marketname);
    if (!prev || String(r.regday) >= prev.regday) {
      latest.set(String(r.marketname), { regday: String(r.regday), price: p });
    }
  }
  const out: MarketPrice[] = [];
  const anonByType = new Map<string, number[]>();
  for (const [name, v] of latest) {
    const m = name.match(ANON_MARKET);
    if (m) {
      const type = TYPE_LABEL[m[1]] ?? m[1];
      anonByType.set(type, [...(anonByType.get(type) ?? []), v.price]);
    } else {
      out.push({ market: name.endsWith('시장') ? name : `${name}시장`, price: v.price });
    }
  }
  for (const [type, prices] of anonByType) {
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length / 10) * 10;
    out.push({ market: prices.length > 1 ? `${type} ${prices.length}곳 평균` : type, price: avg });
  }
  return out.sort((a, b) => a.price - b.price);
}

/** 소매/도매 판매처별 최신 가격 (최근 7일) */
export async function fetchMarketPrices(
  item: Pick<PriceItem, 'categoryCode' | 'itemCode' | 'kindCode' | 'rankCode'>,
  cls: MarketCls = '01',
): Promise<MarketPrice[]> {
  return groupMarkets(await fetchPeriodRows(item, 7, cls));
}

/**
 * 친환경 — periodEcoPriceList(주간 발행). 예년·어제 같은 공식 기준값이 없어
 * 신호 판단 없이 ① 주간 평균 추이 ② 지난주 대비 ③ 판매처별 가격만 제공한다.
 * eco의 kind/rank 코드 체계는 일반 시세와 달라 후보를 순서대로 시도한다.
 */
export interface EcoData {
  series: SeriesPoint[];
  markets: MarketPrice[];
  latest: number | null;
  prevWeek: number | null;
  vsPrevWeekPct: number | null;
  unit: string | null;
}

export async function fetchEco(
  item: Pick<PriceItem, 'categoryCode' | 'itemCode' | 'kindCode'>,
): Promise<EcoData | null> {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 180);
  const kinds = [...new Set([item.kindCode, '00', '01', '02', '03'])];
  for (const kind of kinds) {
    for (const rank of ['07', '08']) {
      const url = `${BASE}?${qs({
        action: 'periodEcoPriceList',
        p_startday: fmtDate(start),
        p_endday: fmtDate(end),
        p_itemcategorycode: item.categoryCode,
        p_itemcode: item.itemCode,
        p_kindcode: kind,
        p_productrankcode: rank,
        p_convert_kg_yn: 'N',
      })}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const json = await res.json();
      const rows: any[] = json?.data?.item ?? [];
      if (!Array.isArray(rows) || rows.length === 0) continue;
      const series = rowsToSeries(rows);
      if (series.length === 0) continue;
      const latest = series[series.length - 1]?.price ?? null;
      const prevWeek = series[series.length - 2]?.price ?? null;
      return {
        series,
        markets: groupMarkets(rows),
        latest,
        prevWeek,
        vsPrevWeekPct:
          latest != null && prevWeek != null
            ? Math.round(((latest - prevWeek) / prevWeek) * 100)
            : null,
        unit: rows.find((r) => r.unit)?.unit ?? null,
      };
    }
  }
  return null;
}

export function won(n: number | null): string {
  if (n == null) return '—';
  return n.toLocaleString('ko-KR');
}
```

## `mobile/src/app/_layout.tsx`
```tsx
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { FavoritesProvider } from '../store/favorites';
import { PricesProvider } from '../store/prices';
import { colors } from '../theme/tokens';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    'Pretendard-Regular': require('../../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-SemiBold': require('../../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('../../assets/fonts/Pretendard-Bold.otf'),
    'Pretendard-ExtraBold': require('../../assets/fonts/Pretendard-ExtraBold.otf'),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <PricesProvider>
      <FavoritesProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bgCanvas },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="search" options={{ animation: 'fade_from_bottom' }} />
          <Stack.Screen name="item/[key]" />
        </Stack>
      </FavoritesProvider>
    </PricesProvider>
  );
}
```

## `mobile/src/app/(tabs)/_layout.tsx`
```tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { GlassTabBar } from '../../components/igb/GlassTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar state={props.state} navigation={props.navigation as never} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: '홈' }} />
      <Tabs.Screen name="favorites" options={{ title: '관심품목' }} />
      <Tabs.Screen name="recipes" options={{ title: '레시피' }} />
    </Tabs>
  );
}
```

## `mobile/src/app/(tabs)/favorites.tsx`
```tsx
import { router } from 'expo-router';
import { Bookmark, User } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/igb/EmptyState';
import { PriceListRow } from '../../components/igb/PriceListRow';
import { Wordmark } from '../../components/igb/Wordmark';
import { useFavorites } from '../../store/favorites';
import { itemKey, usePrices } from '../../store/prices';
import { colors, font, spacing, type } from '../../theme/tokens';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { items } = usePrices();
  const { keys } = useFavorites();

  const favorites = useMemo(
    () => keys.map((k) => items.find((i) => itemKey(i) === k)).filter((i) => i != null),
    [keys, items],
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Wordmark />
        <View style={styles.iconBtn}>
          <User size={24} color={colors.iconInactive} fill={colors.iconInactive} strokeWidth={2} />
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>관심 품목</Text>
          <Text style={styles.count}>{favorites.length}개</Text>
        </View>
        {favorites.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="아직 관심 품목이 없어요"
            description="상세 화면에서 북마크를 누르면 여기에 모여요"
          />
        ) : (
          <View>
            {favorites.map((i, idx) => (
              <View key={itemKey(i!)}>
                {idx > 0 && <View style={styles.divider} />}
                <PriceListRow
                  name={i!.itemName}
                  price={i!.today}
                  unit={i!.unit}
                  level={i!.level}
                  itemCode={i!.itemCode}
                  onPress={() => router.push(`/item/${itemKey(i!)}`)}
                />
              </View>
            ))}
            <Text style={styles.source}>
              자료 출처 · KAMIS (한국농수산식품유통공사) 매일 오후 4시 갱신
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgCanvas },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: spacing.s4,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  wordmark: { fontSize: 20, fontFamily: font.extrabold, color: colors.textPrimary },
  content: { padding: spacing.s4, paddingBottom: 140 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.s2,
  },
  title: { ...type.h2, color: colors.textPrimary } as const,
  count: { ...type.caption, color: colors.textTertiary } as const,
  divider: { height: 1, backgroundColor: colors.borderDefault },
  source: {
    ...type.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.s6,
  } as const,
});
```

## `mobile/src/app/(tabs)/index.tsx`
```tsx
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Info, User } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PriceItem, won } from '../../api/kamis';
import { ChangeIndicator } from '../../components/igb/ChangeIndicator';
import { EmptyState } from '../../components/igb/EmptyState';
import { SearchField } from '../../components/igb/SearchField';
import { SignalChip } from '../../components/igb/SignalChip';
import { Wordmark } from '../../components/igb/Wordmark';
import { itemKey, usePrices } from '../../store/prices';
import { THUMBS } from '../../thumbnails.gen';
import { colors, font, palette, radius, signal, spacing, tabularNums, type } from '../../theme/tokens';

const CHIP_LABEL = { cheap: '제일 저렴해요', fair: '평소 수준이에요', expensive: '비싼 편이에요' } as const;

/** Figma hero-verdict-card 1:1 */
function HeroVerdictCard({ item }: { item: PriceItem }) {
  const level = item.level!;
  const c = signal[level];
  const pct = Math.abs(item.vsNormalPct ?? 0);
  const verdictTail =
    level === 'cheap' ? `${pct}% 싸요` : level === 'expensive' ? `${pct}% 비싸요` : '평소 가격이에요';
  return (
    <View style={styles.heroCard}>
      <View style={styles.heroTopRow}>
        <SignalChip level={level} label={CHIP_LABEL[level]} />
        <View style={styles.sourceCaption}>
          <Info size={16} color={colors.textTertiary} strokeWidth={2} />
          <Text style={styles.captionGrey}>오늘 · KAMIS 소매</Text>
        </View>
      </View>

      <View style={{ gap: spacing.s1 }}>
        <Text style={styles.verdict}>
          오늘은 {item.itemName}가 평소보다{'\n'}
          <Text style={{ color: c.main, textDecorationLine: 'underline' }}>{verdictTail}</Text>
        </Text>
        <View style={styles.heroPriceRow}>
          {/* 중첩 Text — RN에서 서로 다른 크기의 baseline 정렬은 nested Text가 정확하다 */}
          <Text style={[styles.heroPrice, tabularNums]}>
            {won(item.today)}원<Text style={styles.heroUnit}> / {item.unit}</Text>
          </Text>
          {/* Figma: 하단(MAX) 정렬 — 가격 baseline 높이에 맞춤 */}
          <View style={styles.indicatorAlign}>
            <ChangeIndicator level={level} pct={item.vsNormalPct} />
          </View>
        </View>
        <Text style={styles.captionSecondary}>
          {item.kindName || item.unit} · 예년 평균 {won(item.normal)}원
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.heroButton, pressed && { backgroundColor: palette.brandPrimaryAlt }]}
        onPress={() => router.push(`/item/${itemKey(item)}`)}
      >
        <Text style={styles.heroButtonLabel}>자세히 보기</Text>
      </Pressable>
    </View>
  );
}

/** Figma thumbnail-card 1:1 — 사진(placeholder) + xs solid 칩(%·변동없음) + 품명/규격/가격 */
function ThumbnailCard({ item }: { item: PriceItem }) {
  const pct = item.vsNormalPct;
  const chipLabel = item.level === 'fair' ? '변동없음' : `${Math.abs(pct ?? 0)}%`;
  // 이름 아래에는 규격만 — kindName이 "양파(1kg)"처럼 품목명을 포함하므로 제거.
  // 전체가 괄호로 감싸졌을 때만 벗긴다 ("봄(1포기)"의 닫는 괄호 오절단 방지).
  let spec = item.kindName.replace(item.itemName, '').trim();
  if (spec.startsWith('(') && spec.endsWith(')')) spec = spec.slice(1, -1);
  if (!spec) spec = item.unit;
  return (
    <Pressable style={styles.thumbCard} onPress={() => router.push(`/item/${itemKey(item)}`)}>
      <View style={styles.thumbMedia}>
        {THUMBS[item.itemCode] != null && (
          <Image source={THUMBS[item.itemCode]} style={StyleSheet.absoluteFill} contentFit="cover" />
        )}
        {pct != null && (
          <View style={styles.thumbChip}>
            <SignalChip level={item.level!} size="xs" label={chipLabel} />
          </View>
        )}
      </View>
      <View>
        <Text style={styles.thumbName} numberOfLines={1}>
          {item.itemName}
        </Text>
        <Text style={styles.captionGrey} numberOfLines={1}>
          {spec}
        </Text>
        <Text style={[styles.thumbPrice, tabularNums]} numberOfLines={1}>
          {won(item.today)}원<Text style={styles.thumbUnit}> / {item.unit}</Text>
        </Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { items, loading, error, refresh } = usePrices();
  // 주목할 시세 섹션 인라인 펼침 — 별도 화면 없이 섹션이 아래로 쌓이고 홈 스크롤로 본다
  const [expanded, setExpanded] = useState(false);

  const ranked = useMemo(
    () =>
      items
        .filter((i) => i.level && i.today != null && i.vsNormalPct != null)
        .sort((a, b) => Math.abs(b.vsNormalPct!) - Math.abs(a.vsNormalPct!)),
    [items],
  );
  const hero = ranked.find((i) => i.level === 'cheap') ?? ranked[0];
  // 주목할 시세 = 변동이 큰 품목만 (신호 임계값 ±10% 밖 = cheap/expensive). fair는 제외.
  const movers = useMemo(() => ranked.filter((i) => i.level !== 'fair'), [ranked]);
  const notable = expanded ? movers : movers.slice(0, 6);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* main-header type=home: 워드마크 + user */}
      <View style={styles.header}>
        <Wordmark />
        <View style={styles.iconBtn}>
          <User size={24} color={colors.iconInactive} fill={colors.iconInactive} strokeWidth={2} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        {/* content-01: 흰 배경 — 검색 입구 */}
        <View style={styles.content01}>
          <SearchField editable={false} onPress={() => router.push('/search')} />
        </View>

        {/* content-02: grey-50 무대 — 흰 카드들이 배경 대비로 분리 (보더 없음) */}
        <View style={styles.content02}>
        {loading && items.length === 0 ? (
          <ActivityIndicator style={{ marginTop: spacing.s10 }} color={colors.textTertiary} />
        ) : error && items.length === 0 ? (
          <EmptyState title="시세를 불러오지 못했어요" description="아래로 당겨 다시 시도해 보세요" />
        ) : (
          <>
            {hero && <HeroVerdictCard item={hero} />}

            {notable.length > 0 && (
              <View style={styles.outerCard}>
                <Text style={styles.sectionTitle}>이번 주 주목할 시세</Text>
                <View style={styles.grid}>
                  {notable.map((i) => (
                    <ThumbnailCard key={itemKey(i)} item={i} />
                  ))}
                </View>
                <Pressable
                  style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.85 }]}
                  onPress={() => setExpanded((v) => !v)}
                >
                  <Text style={styles.secondaryBtnLabel}>{expanded ? '접기' : '전체보기'}</Text>
                </Pressable>
              </View>
            )}

            <Text style={styles.source}>
              자료 출처 · KAMIS (한국농수산식품유통공사){'\n'}매일 오후 4시 갱신
            </Text>
          </>
        )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgCanvas },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: spacing.s4,
  },
  wordmark: { fontSize: 20, fontFamily: font.extrabold, color: colors.textPrimary },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 140 },
  content01: { padding: spacing.s4, backgroundColor: colors.bgCanvas },
  content02: {
    padding: spacing.s4,
    gap: spacing.s8,
    backgroundColor: colors.bgSecondary,
    flexGrow: 1,
  },

  heroCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.l,
    padding: spacing.s4,
    gap: spacing.s4,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sourceCaption: { flexDirection: 'row', alignItems: 'center', gap: spacing.s1 },
  verdict: { ...type.signalLead, color: colors.textPrimary } as const,
  heroPriceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.s2 },
  heroPrice: { ...type.priceXl, color: colors.priceNumber } as const,
  // 중첩 Text 자식에 lineHeight를 주면 baseline이 깨진다 — lineHeight 없는 전용 스타일
  heroUnit: { fontSize: 13, fontFamily: font.regular, color: colors.priceUnit },
  indicatorAlign: { marginBottom: 6 },
  captionGrey: { ...type.caption, color: colors.textTertiary } as const,
  captionSecondary: { ...type.caption, color: colors.textSecondary } as const,
  heroButton: {
    height: 40,
    borderRadius: radius.s,
    backgroundColor: palette.brandPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s2,
  },
  heroButtonLabel: { ...type.buttonM, color: palette.white } as const,

  outerCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.l,
    padding: spacing.s4,
    gap: spacing.s3,
  },
  sectionTitle: { ...type.title, color: colors.textPrimary } as const,
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s3 },
  thumbCard: { width: '30.5%', flexGrow: 1, gap: spacing.s2 },
  thumbMedia: {
    aspectRatio: 1,
    borderRadius: radius.m,
    backgroundColor: colors.bgTertiary,
    overflow: 'hidden',
  },
  thumbChip: { position: 'absolute', left: spacing.s2, top: spacing.s2 }, // Figma: (8,8) 좌상단
  thumbName: { fontSize: 13, fontFamily: font.semibold, color: colors.textPrimary },
  thumbPrice: { ...type.priceSm, color: colors.priceNumber } as const,
  thumbUnit: { fontSize: 13, fontFamily: font.regular, color: colors.priceUnit },
  secondaryBtn: {
    height: 40,
    borderRadius: radius.s,
    backgroundColor: colors.bgSecondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s2,
  },
  secondaryBtnLabel: { ...type.buttonM, color: colors.textPrimary } as const,
  source: { ...type.caption, color: colors.textTertiary, textAlign: 'center' } as const,
});
```

## `mobile/src/app/(tabs)/recipes.tsx`
```tsx
import { User } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SignalChip } from '../../components/igb/SignalChip';
import { Wordmark } from '../../components/igb/Wordmark';
import { usePrices } from '../../store/prices';
import { PriceItem } from '../../api/kamis';
import { colors, font, radius, spacing, type } from '../../theme/tokens';

const LEVEL_WORD = { cheap: '싼 편', fair: '적정', expensive: '비싼 편' } as const;

/** 시세 신호를 근거로 한 주간 장보기 큐레이션(가치 구조 C). 레시피 자체는 정적 MVP. */
const RECIPES = [
  { title: '양파 듬뿍 카레', ingredients: ['양파', '감자', '당근'] },
  { title: '감자 양파 수프', ingredients: ['감자', '양파'] },
  { title: '계란찜', ingredients: ['계란', '대파'] },
];

function findItem(items: PriceItem[], name: string): PriceItem | undefined {
  return items.find((i) => i.itemName.includes(name) && i.level != null);
}

export default function RecipesScreen() {
  const insets = useSafeAreaInsets();
  const { items } = usePrices();

  const cards = useMemo(
    () =>
      RECIPES.map((r) => {
        const matched = r.ingredients
          .map((n) => ({ name: n, item: findItem(items, n) }))
          .filter((m) => m.item != null);
        const cheapCount = matched.filter((m) => m.item!.level === 'cheap').length;
        return { ...r, matched, cheapCount };
      }).sort((a, b) => b.cheapCount - a.cheapCount),
    [items],
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Wordmark />
        <View style={styles.iconBtn}>
          <User size={24} color={colors.iconInactive} fill={colors.iconInactive} strokeWidth={2} />
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>이번 주 장보기 레시피</Text>
          <Text style={styles.caption}>매주 화요일 갱신</Text>
        </View>
        <Text style={styles.intro}>지금 예년보다 싼 재료로 골랐어요</Text>
        {cards.map((r) => (
          <View key={r.title} style={styles.card}>
            <View style={styles.media} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{r.title}</Text>
              <View style={styles.chips}>
                {r.matched.slice(0, 3).map((m) => (
                  <SignalChip
                    key={m.name}
                    level={m.item!.level!}
                    label={`${m.name} ${LEVEL_WORD[m.item!.level!]}`}
                  />
                ))}
              </View>
              <Text style={styles.caption}>
                {r.matched.length > 0
                  ? r.cheapCount > 0
                    ? `재료 ${r.matched.length}개 중 ${r.cheapCount}개가 예년보다 싸요`
                    : '지금 담으면 무난한 가격이에요'
                  : '재료 시세를 불러오는 중이에요'}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgCanvas },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: spacing.s4,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  wordmark: { fontSize: 20, fontFamily: font.extrabold, color: colors.textPrimary },
  content: { padding: spacing.s4, gap: spacing.s3, paddingBottom: 140 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { ...type.h2, color: colors.textPrimary } as const,
  intro: { ...type.body, color: colors.textSecondary } as const,
  card: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.m,
    overflow: 'hidden',
    backgroundColor: colors.bgCanvas,
  },
  media: { height: 140, backgroundColor: colors.bgTertiary },
  cardBody: { padding: spacing.s3, gap: spacing.s2 },
  cardTitle: { ...type.title, color: colors.textPrimary } as const,
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s1 },
  caption: { ...type.caption, color: colors.textTertiary } as const,
});
```

## `mobile/src/app/item/[key].tsx`
```tsx
import { router, useLocalSearchParams } from 'expo-router';
import { Bell, Bookmark, ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  EcoData,
  fetchCategory,
  fetchEco,
  fetchMarketPrices,
  fetchSeries,
  judge,
  MarketPrice,
  PriceItem,
  SeriesPoint,
  won,
} from '../../api/kamis';
import { ComparisonBasis, ComparisonToggle } from '../../components/igb/ComparisonToggle';
import { EmptyState } from '../../components/igb/EmptyState';
import { SegmentedControl } from '../../components/igb/SegmentedControl';
import { SignalChip } from '../../components/igb/SignalChip';
import { Sparkline } from '../../components/igb/Sparkline';
import { useFavorites } from '../../store/favorites';
import { usePrices } from '../../store/prices';
import { colors, font, radius, signal, spacing, tabularNums, type } from '../../theme/tokens';

type Market = 'retail' | 'eco' | 'wholesale';

export default function ItemDetailScreen() {
  const insets = useSafeAreaInsets();
  const { key } = useLocalSearchParams<{ key: string }>();
  const { find } = usePrices();
  const { isFavorite, toggle } = useFavorites();
  const item = find(key);

  const [basis, setBasis] = useState<ComparisonBasis>('vsNormal');
  const [market, setMarket] = useState<Market>('retail');
  const [series, setSeries] = useState<SeriesPoint[] | null>(null);
  const [markets, setMarkets] = useState<MarketPrice[] | null>(null);
  // 도매: 같은 품목코드를 도매(cls 02) 리스트에서 매칭 (undefined=미로딩, null=없음)
  const [wsItem, setWsItem] = useState<PriceItem | null | undefined>(undefined);
  // 친환경: 주간 발행, 예년 기준 없음 — 신호 없는 별도 표면
  const [eco, setEco] = useState<EcoData | null | undefined>(undefined);

  useEffect(() => {
    if (market !== 'wholesale' || wsItem !== undefined || !item) return;
    fetchCategory(item.categoryCode, undefined, '02')
      .then((list) => {
        const matches = list.filter((x) => x.itemCode === item.itemCode && x.today != null);
        setWsItem(matches.find((x) => x.kindCode === item.kindCode) ?? matches[0] ?? null);
      })
      .catch(() => setWsItem(null));
  }, [market, wsItem, item]);

  useEffect(() => {
    if (market !== 'eco' || eco !== undefined || !item) return;
    fetchEco(item)
      .then(setEco)
      .catch(() => setEco(null));
  }, [market, eco, item]);

  const active = market === 'wholesale' ? wsItem : market === 'retail' ? item : null;
  const cls = market === 'wholesale' ? '02' : '01';

  // 시계열 + 판매처별 가격 (소매·도매)
  useEffect(() => {
    if (market === 'eco' || !active) return;
    setSeries(null);
    setMarkets(null);
    fetchSeries(active, 28, cls)
      .then(setSeries)
      .catch(() => setSeries([]));
    fetchMarketPrices(active, cls)
      .then(setMarkets)
      .catch(() => setMarkets([]));
  }, [key, market, active?.itemCode, active?.kindCode]);

  const view = useMemo(() => {
    if (!active) return null;
    const base = basis === 'vsNormal' ? active.normal : active.yesterday;
    const level = judge(active.today, base) ?? active.level ?? 'fair';
    const pctVal = basis === 'vsNormal' ? active.vsNormalPct : active.vsYesterdayPct;
    return { base, level, pctVal };
  }, [active, basis]);

  if (!item) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Header title="" fav={false} onFav={() => {}} />
        <EmptyState title="품목 정보를 찾지 못했어요" description="목록에서 다시 진입해 보세요" />
      </View>
    );
  }

  const basisWord = basis === 'vsNormal' ? '예년' : '어제';
  const c = view ? signal[view.level] : signal.fair;
  const leadEmphasis =
    !view || view.pctVal == null || view.level === 'fair'
      ? '평소 가격'
      : `${Math.abs(view.pctVal)}% ${view.level === 'cheap' ? '↓' : '↑'}`;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title={item.itemName} fav={isFavorite(key)} onFav={() => toggle(key)} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* content-01: 흰 배경 — 세그먼트 + 판단/가격 헤드 */}
        <View style={styles.content01}>
          <SegmentedControl
            value={market}
            onChange={setMarket}
            options={[
              { value: 'retail', label: '소매' },
              { value: 'eco', label: '친환경' },
              { value: 'wholesale', label: '도매' },
            ]}
          />

          {market === 'eco' ? (
            eco === undefined ? (
              <ActivityIndicator style={{ marginVertical: spacing.s10 }} color={colors.textTertiary} />
            ) : eco === null ? (
              <EmptyState title="친환경 시세가 없는 품목이에요" description="소매 기준으로 확인해 보세요" />
            ) : (
              <View style={styles.hero}>
                {/* 친환경: 예년 기준이 없어 신호등을 켜지 않는다 — 지난주 대비 캡션만 */}
                <Text style={[styles.price, tabularNums]}>
                  {won(eco.latest)}
                  <Text style={styles.unit}> 원 / {eco.unit ?? item.unit} 기준</Text>
                </Text>
                <Text style={styles.ecoLead}>
                  {eco.vsPrevWeekPct == null
                    ? '지난주 비교 데이터가 없어요'
                    : eco.vsPrevWeekPct === 0
                      ? '지난주와 같은 가격이에요'
                      : `지난주보다 ${eco.vsPrevWeekPct > 0 ? '+' : ''}${eco.vsPrevWeekPct}%`}
                  {'  ·  매주 화요일 발행'}
                </Text>
              </View>
            )
          ) : !active || !view ? (
            market === 'wholesale' && wsItem === undefined ? (
              <ActivityIndicator style={{ marginVertical: spacing.s10 }} color={colors.textTertiary} />
            ) : (
              <EmptyState title="도매 시세가 없는 품목이에요" description="소매 기준으로 확인해 보세요" />
            )
          ) : (
            <View style={styles.hero}>
              {/* 토글은 hero·차트·스탯 전체의 비교 기준을 지배 — 지배 범위의 머리에 둔다 */}
              <View style={styles.heroTopRow}>
                <SignalChip
                  level={view.level}
                  label={
                    view.level === 'cheap' ? '제일 저렴해요' : view.level === 'fair' ? '평소 수준이에요' : '비싼 편이에요'
                  }
                />
                <ComparisonToggle value={basis} onChange={setBasis} />
              </View>
              <Text style={[styles.price, tabularNums]}>
                {won(active.today)}
                <Text style={styles.unit}> 원 / {active.unit} 기준</Text>
              </Text>
              <Text style={styles.lead}>
                {basisWord}보다{' '}
                <Text style={{ color: c.main, textDecorationLine: 'underline' }}>{leadEmphasis}</Text>
              </Text>
            </View>
          )}
        </View>

        {/* content-02: grey-50 무대 — 보더 없는 흰 카드들 */}
        {market === 'eco' && eco ? (
          <View style={styles.content02}>
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>주간 추이</Text>
                <Text style={styles.legend}>최근 6개월 · 주 1회</Text>
              </View>
              <Sparkline series={eco.series} baseline={null} level="fair" neutral />
              <Text style={styles.chartFootnote}>
                친환경은 예년 가격 자료가 없어서, 싼지 비싼지 대신 가격 흐름을 보여드려요
              </Text>
            </View>
            <BuySection markets={eco.markets} />
            <Text style={styles.source}>
              자료 출처 · KAMIS {new Date().toISOString().slice(0, 10)} 기준
            </Text>
          </View>
        ) : active && view ? (
          <View style={styles.content02}>
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                {/* 어제 대비는 점 비교 — 28일 창은 헷갈려서 최근 7일로 좁힌다 */}
                <Text style={styles.chartTitle}>{basis === 'vsNormal' ? '최근 28일' : '최근 7일'}</Text>
                <Text style={styles.legend}>{basisWord} 기준선</Text>
              </View>
              {series == null ? (
                <ActivityIndicator style={{ height: 140 }} color={colors.textTertiary} />
              ) : (
                <Sparkline
                  series={basis === 'vsNormal' ? series : series.slice(-7)}
                  baseline={view.base}
                  baselineLabel={basisWord}
                  level={view.level}
                />
              )}
              <Text style={styles.chartFootnote}>
                {basis === 'vsNormal'
                  ? '예년 = 여러 해 같은 시기의 평균이에요'
                  : '점선이 어제 가격이에요. 마지막 점이 오늘이에요'}
              </Text>
            </View>

            <View style={styles.statGrid}>
              <Stat label="오늘" value={active.today} sub="현재" />
              <Stat label="어제" value={active.yesterday} pct={active.vsYesterdayPct} />
              <Stat label="예년" value={active.normal} sub="기준선" />
              <Stat label="1년 전" value={active.yearAgo} pct={pctOf(active.today, active.yearAgo)} />
            </View>

            <BuySection markets={markets} />

            <Text style={styles.source}>
              자료 출처 · KAMIS {new Date().toISOString().slice(0, 10)} 기준
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

/**
 * "이렇게 사면 좋아요" — 판매처별 실가격 (period 응답의 marketname 행, 최근분).
 * 점 색은 상대 신호: 최저가=cheap, 최고가=expensive, 그 외 fair.
 */
function BuySection({ markets }: { markets: MarketPrice[] | null }) {
  if (markets == null) {
    return <ActivityIndicator style={{ marginVertical: spacing.s4 }} color={colors.textTertiary} />;
  }
  if (markets.length === 0) return null;
  const shown = markets.slice(0, 6); // 싼 순 상위 6곳
  const rest = markets.length - shown.length;
  const min = markets[0].price;
  const max = markets[markets.length - 1].price;
  return (
    <View style={styles.buySection}>
      <Text style={styles.buyTitle}>이렇게 사면 좋아요</Text>
      <View style={styles.buyCard}>
        {shown.map((m, idx) => {
          const level = markets.length > 1 && m.price === min ? 'cheap' : markets.length > 1 && m.price === max ? 'expensive' : 'fair';
          return (
            <View key={m.market}>
              {idx > 0 && <View style={styles.buyDivider} />}
              <View style={styles.buyRow}>
                <View style={[styles.buyDot, { backgroundColor: signal[level].main }]} />
                <Text style={styles.buyName}>{m.market}</Text>
                <Text style={[styles.buyPrice, tabularNums]}>{won(m.price)}원</Text>
              </View>
            </View>
          );
        })}
      </View>
      <Text style={styles.buyCaption}>
        싼 곳부터 6곳{rest > 0 ? ` (외 ${rest}곳)` : ''} · 최근 조사가 기준이에요. 매장마다 다를 수 있어요.
      </Text>
    </View>
  );
}

function pctOf(today: number | null, base: number | null): number | null {
  if (today == null || base == null) return null;
  return Math.round(((today - base) / base) * 100);
}

/** main-header type=detail — back + 제목 + bookmark/fill + bell/fill (fill 글리프, 색만 active/inactive) */
function Header({ title, fav, onFav }: { title: string; fav: boolean; onFav: () => void }) {
  const favColor = fav ? colors.iconActive : colors.iconInactive;
  return (
    <View style={styles.header}>
      <Pressable style={styles.iconBtn} onPress={() => router.back()} hitSlop={4}>
        <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <Pressable style={styles.iconBtn} onPress={onFav} hitSlop={4}>
        <Bookmark size={24} color={favColor} fill={favColor} strokeWidth={2} />
      </Pressable>
      <View style={styles.iconBtn}>
        <Bell size={24} color={colors.iconInactive} fill={colors.iconInactive} strokeWidth={2} />
      </View>
    </View>
  );
}

function Stat({
  label,
  value,
  sub,
  pct,
}: {
  label: string;
  value: number | null;
  sub?: string;
  pct?: number | null;
}) {
  const pctColor =
    pct == null
      ? colors.textTertiary
      : pct <= -10
        ? signal.cheap.main
        : pct >= 10
          ? signal.expensive.main
          : colors.textTertiary;
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, tabularNums]}>{won(value)}원</Text>
      {sub ? (
        <Text style={styles.statSub}>{sub}</Text>
      ) : pct != null ? (
        <Text style={[styles.statSub, { color: pctColor }]}>
          {pct > 0 ? '+' : ''}
          {pct}%
        </Text>
      ) : (
        <Text style={styles.statSub}>—</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgCanvas },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s1,
    gap: spacing.s1,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, ...type.title, color: colors.textPrimary, textAlign: 'left' } as const,
  scroll: { paddingBottom: spacing.s16 },
  content01: { padding: spacing.s4, gap: spacing.s6, backgroundColor: colors.bgCanvas },
  content02: { padding: spacing.s4, gap: spacing.s8, backgroundColor: colors.bgSecondary, flexGrow: 1 },
  hero: { gap: spacing.s2 },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: { ...type.priceXl, color: colors.priceNumber } as const,
  // 중첩 Text 자식에 lineHeight를 주면 RN이 부모 라인의 baseline을 깨뜨린다 — lineHeight 없는 전용 스타일
  unit: { fontSize: 13, fontFamily: font.regular, color: colors.priceUnit } as const,
  lead: { ...type.title, color: colors.textPrimary } as const,
  ecoLead: { ...type.body, color: colors.textSecondary } as const,
  chartCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.m,
    padding: spacing.s5,
    gap: spacing.s4,
  },
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chartHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.s2 },
  legend: { ...type.caption, color: colors.textTertiary } as const,
  chartTitle: { ...type.title, color: colors.textPrimary } as const,
  chartFootnote: { ...type.caption, color: colors.textTertiary } as const,
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s2 },
  stat: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.l,
    padding: spacing.s3,
    gap: 2,
  },
  statLabel: { ...type.caption, color: colors.textTertiary } as const,
  statValue: { ...type.priceSm, color: colors.priceNumber } as const,
  statSub: { ...type.caption, color: colors.textTertiary } as const,
  source: { ...type.caption, color: colors.textTertiary, textAlign: 'center' } as const,
  buySection: { gap: spacing.s2 },
  buyTitle: { ...type.title, color: colors.textPrimary } as const,
  buyCard: {
    borderRadius: radius.l,
    backgroundColor: colors.bgElevated,
    overflow: 'hidden',
  },
  buyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s3,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s3,
  },
  buyDot: { width: 8, height: 8, borderRadius: radius.full },
  buyName: { ...type.body, color: colors.textPrimary, flex: 1 } as const,
  buyPrice: { ...type.priceSm, color: colors.priceNumber } as const,
  buyDivider: { height: 1, backgroundColor: colors.borderDefault },
  buyCaption: { ...type.caption, color: colors.textTertiary } as const,
});
```

## `mobile/src/app/search.tsx`
```tsx
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../components/igb/EmptyState';
import { PriceListRow } from '../components/igb/PriceListRow';
import { SearchField } from '../components/igb/SearchField';
import { itemKey, usePrices } from '../store/prices';
import { colors, spacing, type } from '../theme/tokens';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { items } = usePrices();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return items.filter((i) => i.itemName.includes(q) || i.kindName.includes(q));
  }, [items, query]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* 헤더 44 — back 44×44 + search-field size s(40) 세로 중앙 */}
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()} hitSlop={4}>
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <SearchField
            size="s"
            value={query}
            onChangeText={setQuery}
            onClear={() => setQuery('')}
            autoFocus
          />
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
      >
        {query.trim() === '' ? null : results.length === 0 ? (
          <EmptyState
            title="검색 결과가 없어요"
            description="KAMIS에 아직 없는 품목이에요. 다른 품목명으로 검색해 보세요"
          />
        ) : (
          <>
            <Text style={styles.count}>
              ‘{query.trim()}’ 검색 결과 {results.length}건
            </Text>
            {results.map((i, idx) => (
              <View key={itemKey(i)}>
                {idx > 0 && <View style={styles.divider} />}
                <PriceListRow
                  name={`${i.itemName}${i.kindName ? ` (${i.kindName})` : ''}`}
                  price={i.today}
                  unit={i.unit}
                  level={i.level}
                  itemCode={i.itemCode}
                  onPress={() => router.push(`/item/${itemKey(i)}`)}
                />
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgCanvas },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.s1,
    paddingRight: spacing.s4,
    gap: spacing.s1,
  },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.s4, paddingBottom: 140 },
  count: { ...type.caption, color: colors.textTertiary, marginBottom: spacing.s2 } as const,
  divider: { height: 1, backgroundColor: colors.borderDefault },
});
```

## `mobile/src/components/igb/Buttons.tsx`
```tsx
import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, opacity, palette, radius, type } from '../../theme/tokens';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'xl' | 'l' | 'm' | 's';

const HEIGHT: Record<Size, number> = { xl: 56, l: 48, m: 40, s: 32 };
const RADIUS: Record<Size, number> = { xl: radius.m, l: radius.m, m: radius.s, s: radius.s };
const LABEL: Record<Size, object> = {
  xl: type.buttonXl,
  l: type.buttonL,
  m: type.buttonM,
  s: type.buttonS,
};

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  style?: ViewStyle;
}

export function IGButton({
  label,
  onPress,
  variant = 'primary',
  size = 'l',
  disabled,
  style,
}: Props) {
  const bg =
    variant === 'primary' ? palette.brandPrimary : variant === 'secondary' ? colors.bgSecondary : 'transparent';
  const fg = variant === 'primary' ? palette.white : variant === 'secondary' ? colors.textPrimary : palette.brandPrimary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { height: HEIGHT[size], borderRadius: RADIUS[size], backgroundColor: bg },
        pressed && variant === 'primary' && { backgroundColor: palette.brandPrimaryAlt },
        pressed && variant !== 'primary' && { opacity: 0.85 },
        disabled && { opacity: opacity.disabled },
        style,
      ]}
    >
      <Text style={[LABEL[size] as object, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

/** 게스트 1차 액션(H4) — button l/primary 시맨틱 래퍼. 신호색 금지. */
export function GuestCTA({ label = '바로 시세 보기', onPress }: { label?: string; onPress?: () => void }) {
  return <IGButton label={label} onPress={onPress} variant="primary" size="l" style={{ alignSelf: 'stretch' }} />;
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});
```

## `mobile/src/components/igb/ChangeIndicator.tsx`
```tsx
import { ArrowDown, ArrowUp, Minus } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { font, signal, SignalLevel, spacing } from '../../theme/tokens';

const ICONS = { cheap: ArrowDown, fair: Minus, expensive: ArrowUp } as const;

/** 예년 대비 변화율 — 화살표 + % (신호색, 배경 없음) */
export function ChangeIndicator({
  level,
  pct,
  size = 's',
}: {
  level: SignalLevel;
  pct: number | null;
  size?: 's' | 'm';
}) {
  const c = signal[level].main;
  const Icon = ICONS[level];
  return (
    <View style={styles.row}>
      <Icon size={size === 's' ? 16 : 20} color={c} strokeWidth={2} />
      {pct != null && (
        <Text style={[styles.pct, { color: c, fontSize: size === 's' ? 13 : 15 }]}>
          {Math.abs(pct)}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.s1 },
  pct: { fontFamily: font.semibold },
});
```

## `mobile/src/components/igb/ComparisonToggle.tsx`
```tsx
import { Repeat } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, type } from '../../theme/tokens';

export type ComparisonBasis = 'vsNormal' | 'vsYesterday';

const LABEL: Record<ComparisonBasis, string> = {
  vsNormal: '예년 대비',
  vsYesterday: '어제 대비',
};

/**
 * 비교 기준 전환(H2 검증 동선). 탭 즉시 같은 데이터의 신호·%가 전환된다.
 * 시스템 컨트롤 — 신호색 금지.
 */
export function ComparisonToggle({
  value,
  onChange,
}: {
  value: ComparisonBasis;
  onChange: (v: ComparisonBasis) => void;
}) {
  return (
    <Pressable
      onPress={() => onChange(value === 'vsNormal' ? 'vsYesterday' : 'vsNormal')}
      style={({ pressed }) => [styles.base, pressed && { opacity: 0.7 }]}
      hitSlop={6}
    >
      <Repeat size={16} color={colors.textSecondary} strokeWidth={2} />
      <Text style={styles.label}>{LABEL[value]}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s1,
    paddingHorizontal: spacing.s3,
    paddingVertical: spacing.s2,
    borderRadius: radius.full,
    backgroundColor: colors.bgSecondary,
    alignSelf: 'flex-start',
  },
  label: { ...type.label, color: colors.textSecondary } as const,
});
```

## `mobile/src/components/igb/EmptyState.tsx`
```tsx
import { LucideIcon, SearchX } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, type } from '../../theme/tokens';

interface Props {
  icon?: LucideIcon;
  title: string;
  description?: string;
}

/** 데이터 부재를 추측 없이 솔직히 알린다. 신호색 금지 — 무채색 전용. */
export function EmptyState({ icon: Icon = SearchX, title, description }: Props) {
  return (
    <View style={styles.wrap}>
      <Icon size={32} color={colors.iconInactive} strokeWidth={2} />
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.desc}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: spacing.s10, gap: spacing.s2 },
  title: { ...type.body, color: colors.textSecondary, marginTop: spacing.s2 } as const,
  desc: { ...type.caption, color: colors.textTertiary, textAlign: 'center' } as const,
});
```

## `mobile/src/components/igb/GlassTabBar.tsx`
```tsx
import { BlurView } from 'expo-blur';
import { BookOpen, Heart, House, LucideIcon } from 'lucide-react-native';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, palette, radius, shadow, spacing } from '../../theme/tokens';

const TAB_META: Record<string, { label: string; icon: LucideIcon }> = {
  index: { label: '홈', icon: House },
  favorites: { label: '관심품목', icon: Heart },
  recipes: { label: '레시피', icon: BookOpen },
};

interface TabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (e: { type: string; target: string; canPreventDefault: boolean }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
}

/** iOS 26 글래스 필 근사 — 플로팅 + blur + 선택 pill. Figma Tab Bar 기준. */
export function GlassTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, spacing.s3) }]} pointerEvents="box-none">
      <BlurView intensity={40} tint="light" style={styles.pill}>
        <View style={styles.pillOverlay} />
        {state.routes.map((route, idx) => {
          const meta = TAB_META[route.name];
          if (!meta) return null;
          const selected = state.index === idx;
          const Icon = meta.icon;
          const color = selected ? palette.brandPrimary : colors.iconInactive;
          return (
            <Pressable
              key={route.key}
              style={[styles.tab, selected && styles.tabSelected]}
              onPress={() => {
                const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!selected && !e.defaultPrevented) navigation.navigate(route.name);
              }}
            >
              <Icon size={24} color={color} strokeWidth={2} fill={selected ? color : 'none'} />
              <Text style={[styles.label, { color }]}>{meta.label}</Text>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.s6,
    right: spacing.s6,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    borderRadius: radius.full,
    overflow: 'hidden',
    padding: spacing.s1,
    width: '100%',
    ...Platform.select({
      android: { backgroundColor: 'rgba(255,255,255,0.92)' },
    }),
    ...shadow.glassFloating, // Figma shadow-glass-floating 실값
  },
  pillOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surfaceGlassLight, // surface/glass-light
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: spacing.s2,
    borderRadius: radius.full,
  },
  tabSelected: { backgroundColor: colors.bgTertiary },
  label: { fontSize: 10, fontFamily: font.semibold },
});
```

## `mobile/src/components/igb/PriceListRow.tsx`
```tsx
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { won } from '../../api/kamis';
import { THUMBS } from '../../thumbnails.gen';
import { colors, radius, SignalLevel, spacing, tabularNums, type } from '../../theme/tokens';
import { SignalChip } from './SignalChip';

interface Props {
  name: string;
  price: number | null;
  unit: string;
  level: SignalLevel | null;
  /** 품목코드 — 생성된 썸네일 매핑. 없으면 placeholder */
  itemCode?: string;
  onPress?: () => void;
}

/**
 * 품목 스캔 리스트 행 — Figma price-list-row 1:1.
 * 좌: 40 썸네일 + 품목명(15 Regular) / 우: 가격(15 Regular)+단위 + 아이콘-only 신호 배지.
 */
export function PriceListRow({ name, price, unit, level, itemCode, onPress }: Props) {
  const thumb = itemCode ? THUMBS[itemCode] : undefined;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.overlayPress }]}
    >
      <View style={styles.left}>
        {thumb ? (
          <Image source={thumb} style={styles.thumbnail} contentFit="cover" />
        ) : (
          <View style={styles.thumbnail} />
        )}
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
      </View>
      <View style={styles.right}>
        <View style={styles.priceRow}>
          <Text style={[styles.price, tabularNums]}>{won(price)}</Text>
          <Text style={styles.unit}>원 / {unit}</Text>
        </View>
        {level && <SignalChip level={level} size="s" iconOnly />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.s2,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.s3, flexShrink: 1 },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: radius.s,
    backgroundColor: colors.borderDefault,
  },
  name: { ...type.body, color: colors.textPrimary, flexShrink: 1 } as const,
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.s2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.s1 },
  price: { ...type.body, color: colors.textPrimary } as const,
  unit: { ...type.body, color: colors.priceUnit } as const,
});
```

## `mobile/src/components/igb/SearchField.tsx`
```tsx
import { Search, X } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, radius, spacing, type } from '../../theme/tokens';

interface Props {
  value?: string;
  onChangeText?: (t: string) => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  /** l=48 단독 배치(홈) / s=40 헤더 내장(44 행 세로 중앙) */
  size?: 'l' | 's';
  editable?: boolean;
  onPress?: () => void;
}

export function SearchField({
  value,
  onChangeText,
  onClear,
  placeholder = '오이, 양파, 계란…',
  autoFocus,
  size = 'l',
  editable = true,
  onPress,
}: Props) {
  const [focused, setFocused] = React.useState(false);
  const body = (
    <View
      style={[
        styles.base,
        { height: size === 'l' ? 48 : 40 },
        focused && styles.focused,
      ]}
    >
      <Search size={20} color={colors.textTertiary} strokeWidth={2} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        autoFocus={autoFocus}
        editable={editable}
        pointerEvents={editable ? 'auto' : 'none'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType="search"
      />
      {!!value && onClear && (
        <Pressable onPress={onClear} hitSlop={8}>
          <X size={20} color={colors.textTertiary} strokeWidth={2} />
        </Pressable>
      )}
    </View>
  );
  if (onPress) return <Pressable onPress={onPress}>{body}</Pressable>;
  return body;
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s2,
    paddingHorizontal: spacing.s3,
    borderRadius: radius.l, // Figma 실값 16
    backgroundColor: colors.bgSecondary,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  focused: { borderColor: colors.borderFocus }, // bg는 그대로 (Figma focused 상태)
  input: { flex: 1, ...type.body, color: colors.textPrimary, paddingVertical: 0 } as const,
});
```

## `mobile/src/components/igb/SegmentedControl.tsx`
```tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing, type } from '../../theme/tokens';

interface Option<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/** 상호배타 뷰 전환 — track 위 선택 pill. */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.track}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            disabled={o.disabled}
            onPress={() => onChange(o.value)}
            style={[styles.segment, selected && styles.pill, o.disabled && { opacity: 0.4 }]}
          >
            <Text style={[styles.label, { color: selected ? colors.textPrimary : colors.textTertiary }]}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.full,
    padding: spacing.s1,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.s2,
    borderRadius: radius.full,
  },
  pill: {
    backgroundColor: colors.bgElevated,
    ...shadow.s1, // elevation-1
  },
  label: { ...type.label } as const, // Figma 실값: 13 SemiBold
});
```

## `mobile/src/components/igb/SignalChip.tsx`
```tsx
import { ArrowDown, ArrowRight, ArrowUp, Minus } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { font, radius, signal, SignalLevel, spacing, type } from '../../theme/tokens';

const ICONS = { cheap: ArrowDown, fair: Minus, expensive: ArrowUp } as const;
/** xs(사진 오버레이)에서는 fair가 minus가 아니라 → (Figma signal-chip size=xs) */
const ICONS_XS = { cheap: ArrowDown, fair: ArrowRight, expensive: ArrowUp } as const;
const DEFAULT_LABEL = { cheap: '싼 편', fair: '적정', expensive: '비싼 편' } as const;

interface Props {
  level: SignalLevel;
  /** s/m: weak 배경 + 신호색 콘텐츠. xs: solid 신호색 배경 + 흰 콘텐츠 (사진 오버레이) */
  size?: 'xs' | 's' | 'm';
  label?: string;
  /** 행 우측 배지 — 라벨 숨기고 화살표만 (Figma price-list-row) */
  iconOnly?: boolean;
}

export function SignalChip({ level, size = 's', label, iconOnly }: Props) {
  const c = signal[level];
  const solid = size === 'xs';
  const Icon = solid ? ICONS_XS[level] : ICONS[level];
  const iconSize = size === 'xs' ? 12 : size === 's' ? 16 : 20;
  const fg = solid ? c.on : c.main;
  return (
    <View
      style={[
        styles.base,
        solid ? styles.xs : size === 's' ? styles.s : styles.m,
        { backgroundColor: solid ? c.main : c.weak },
      ]}
    >
      <Icon size={iconSize} color={fg} strokeWidth={2} />
      {!iconOnly && (
        <Text style={[solid ? styles.xsLabel : styles.label, { color: fg }]}>
          {label ?? DEFAULT_LABEL[level]}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.s1,
  },
  xs: { padding: spacing.s1, borderRadius: radius.xs, gap: 0 },
  s: { paddingHorizontal: spacing.s2, paddingVertical: spacing.s1, borderRadius: radius.full },
  m: { paddingHorizontal: spacing.s3, paddingVertical: spacing.s2, borderRadius: radius.full },
  label: { fontSize: type.label.fontSize, fontFamily: font.semibold },
  xsLabel: { fontSize: 10, fontFamily: font.semibold },
});
```

## `mobile/src/components/igb/Sparkline.tsx`
```tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { SeriesPoint } from '../../api/kamis';
import { colors, signal, SignalLevel, spacing, type } from '../../theme/tokens';

interface Props {
  series: SeriesPoint[];
  /** 비교 기준선 (점선) — 예년 또는 어제 */
  baseline: number | null;
  baselineLabel?: string;
  level: SignalLevel;
  /** 신호 의미가 없는 데이터(친환경 주간 추이 등) — stage 회색으로 그린다 */
  neutral?: boolean;
  height?: number;
}

/** 최근 추이 라인 + 비교 기준 점선. 색은 현재 신호 레벨을 따른다(neutral이면 무채색). */
export function Sparkline({ series, baseline, baselineLabel = '예년', level, neutral, height = 140 }: Props) {
  const [width, setWidth] = React.useState(0);
  const c = neutral ? { main: colors.textTertiary, weak: colors.bgTertiary, on: '#fff' } : signal[level];

  if (series.length < 2) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>추이 데이터가 충분하지 않아요</Text>
      </View>
    );
  }

  const values = series.map((p) => p.price);
  const all = baseline != null ? [...values, baseline] : values;
  const min = Math.min(...all);
  const max = Math.max(...all);
  const pad = (max - min) * 0.15 || max * 0.05 || 1;
  const lo = min - pad;
  const hi = max + pad;
  const y = (v: number) => height - ((v - lo) / (hi - lo)) * height;
  const x = (i: number) => (i / (series.length - 1)) * width;

  const line = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Path d={area} fill={c.main} fillOpacity={0.14} />
          {baseline != null && (
            <Line
              x1={0}
              x2={width}
              y1={y(baseline)}
              y2={y(baseline)}
              stroke={colors.borderStrong}
              strokeDasharray="4 4"
              strokeWidth={1}
            />
          )}
          <Path d={line} stroke={c.main} strokeWidth={2} fill="none" />
          <Circle cx={x(series.length - 1)} cy={y(values[values.length - 1])} r={4} fill={c.main} />
        </Svg>
      )}
      {baseline != null && width > 0 && <Text style={styles.baselineLabel}>{baselineLabel}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgSecondary, borderRadius: 8 },
  emptyText: { ...type.caption, color: colors.textTertiary } as const,
  baselineLabel: {
    position: 'absolute',
    right: 0,
    top: spacing.s1,
    ...type.caption,
    color: colors.textTertiary,
  } as const,
});
```

## `mobile/src/components/igb/Wordmark.tsx`
```tsx
import React from 'react';
import { SvgXml } from 'react-native-svg';

/**
 * "이거비싸?" 워드마크 — Figma에서 export한 벡터 아웃라인.
 * 원본 서체 JJZukinie(Adobe Fonts)는 웹 임베드 전용 라이선스라 폰트 번들 대신
 * 로고 그래픽으로 사용한다. 색 변경 시 fill 교체.
 */
const XML = `<svg width="89" height="18" viewBox="0 0 89 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.06016 16.68C1.88016 16.68 0.000156313 13.64 0.000156313 8.42C0.000156313 3.2 1.88016 0.160002 6.06016 0.160002C10.2402 0.160002 12.1202 3.2 12.1202 8.42C12.1202 13.64 10.2402 16.68 6.06016 16.68ZM3.92016 8.42C3.92016 10.9 4.56016 12.06 6.06016 12.06C7.56016 12.06 8.20016 10.9 8.20016 8.42C8.20016 5.94 7.56016 4.78 6.06016 4.78C4.56016 4.78 3.92016 5.94 3.92016 8.42ZM12.8802 17.36C13.2202 12.02 13.2202 5.34 12.8802 1.66893e-06H18.1202C17.7802 5.34 17.7802 12.02 18.1202 17.36H12.8802ZM19.4802 16.14C19.9002 14.22 19.9002 11.56 19.4802 9.64C20.1802 9.72 21.0802 9.82 22.0202 9.82C24.2602 9.82 26.6602 9.26 26.7602 6.52L26.8202 5.1H19.9202C20.1202 3.58 20.1202 2.1 19.9202 0.580001H30.2802V7.22C30.2802 14.66 26.1002 16.34 19.4802 16.14ZM30.8802 9.14C31.0002 8.26 31.0002 6.5 30.8802 5.62H32.3802C32.3402 3.66 32.2802 1.76 32.1602 1.66893e-06H37.3202C36.9802 5.34 36.9802 12.02 37.3202 17.36H32.1602C32.3202 14.82 32.4002 12 32.4202 9.14H30.8802ZM38.6402 16.1C39.0002 13.06 39.0002 3.62 38.6402 0.580001H42.7202V5.94H45.9602V0.580001H50.0402C49.6802 3.62 49.6802 13.06 50.0402 16.1H38.6402ZM42.7202 11.58H45.9602V7.74H42.7202V11.58ZM51.2802 17.36C51.6202 12.02 51.6202 5.34 51.2802 1.66893e-06H56.5202C56.1802 5.34 56.1802 12.02 56.5202 17.36H51.2802ZM57.2002 16.14C57.6202 14.22 57.6202 12.08 57.2002 10.18C58.9802 10.24 60.1402 9.7 60.3402 5.64C60.4202 3.98 60.4402 2.04 60.4402 0.400001H63.4002V7.42C63.3802 8.32 63.3002 9.12 63.2202 9.86C64.0402 9.38 64.6802 8.24 64.8002 5.64C64.8802 3.98 64.9002 2.04 64.9002 0.400001H67.8602C67.8602 2.04 67.8802 4 67.9202 5.64C68.0002 8.7 68.1202 10.12 69.8602 10.18C69.4202 12.08 69.4202 14.02 69.8402 15.94C68.2602 16.06 67.1002 15.28 66.4402 13.1C65.4002 15.66 63.5802 16.32 61.4602 16.14C61.5402 15.58 61.6002 14.98 61.6202 14.4C60.5002 15.88 58.9202 16.28 57.2002 16.14ZM70.3002 17.36C70.6402 12.02 70.6402 5.34 70.3002 1.66893e-06H75.4602C75.3402 1.82 75.2602 3.8 75.2402 5.82H76.7802C76.6602 6.98 76.6602 8.18 76.7802 9.34H75.2002C75.2202 12.12 75.3002 14.88 75.4602 17.36H70.3002ZM79.0802 11.24C79.2402 10.08 79.2402 8.5 79.2202 8.04L82.6202 6.7C83.8602 6.22 84.7402 5.84 84.5002 5.12C84.3802 4.76 83.7402 4.58 82.8002 4.58C81.5002 4.58 79.6202 4.94 77.7802 5.7C77.7602 4.82 76.9002 2.28 76.4602 1.5C78.4802 0.760001 80.6202 0.420002 82.5602 0.420002C86.1402 0.420002 89.0002 1.64 89.0002 3.88C89.0002 5.68 87.2402 6.64 85.1402 7.6L84.0202 8.1C83.9802 8.7 83.9802 10.06 84.1602 11.24H79.0802ZM79.0202 14.56C79.0002 13.1 80.0202 12.08 81.6602 12.08C83.3002 12.08 84.2802 13.1 84.3002 14.56C84.3202 16.02 83.3002 17.04 81.6602 17.04C80.0202 17.04 79.0402 16.02 79.0202 14.56Z" fill="#141F2C"/>
</svg>`;

export function Wordmark({ height = 18 }: { height?: number }) {
  const width = (89 / 18) * height;
  return <SvgXml xml={XML} width={width} height={height} />;
}
```

## `mobile/src/store/favorites.tsx`
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'igb.favorites.v1';

interface FavoritesState {
  keys: string[];
  isFavorite: (key: string) => boolean;
  toggle: (key: string) => void;
}

const Ctx = createContext<FavoritesState | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setKeys(JSON.parse(raw));
    });
  }, []);

  const toggle = useCallback((key: string) => {
    setKeys((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo<FavoritesState>(
    () => ({ keys, isFavorite: (k) => keys.includes(k), toggle }),
    [keys, toggle],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFavorites(): FavoritesState {
  const v = useContext(Ctx);
  if (!v) throw new Error('FavoritesProvider missing');
  return v;
}
```

## `mobile/src/store/prices.tsx`
```tsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchAllCategories, PriceItem } from '../api/kamis';

interface PricesState {
  items: PriceItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  /** itemCode-kindCode 로 단건 조회 */
  find: (key: string) => PriceItem | undefined;
}

const Ctx = createContext<PricesState | null>(null);

export const itemKey = (i: Pick<PriceItem, 'itemCode' | 'kindCode'>) =>
  `${i.itemCode}-${i.kindCode}`;

export function PricesProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchAllCategories());
    } catch (e) {
      setError(e instanceof Error ? e.message : '시세를 불러오지 못했어요');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<PricesState>(
    () => ({
      items,
      loading,
      error,
      refresh,
      find: (key) => items.find((i) => itemKey(i) === key),
    }),
    [items, loading, error, refresh],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrices(): PricesState {
  const v = useContext(Ctx);
  if (!v) throw new Error('PricesProvider missing');
  return v;
}
```

## `mobile/src/theme/tokens.ts`
```tsx
/**
 * IGB Design Tokens — Figma Variables/Styles 실값 1:1 포팅 (2026-06-13 동기화).
 * 원본: Figma 파일 aVckg0tEHUX7ZNkiDYZwdR의 IGB / Primitives · IGB / Semantic 컬렉션.
 * 값 변경은 Figma 변수 → 이 파일 순서로 동기화한다.
 */
import type { TextStyle, ViewStyle } from 'react-native';

export const palette = {
  // Signal — 신호등 멘탈 모델, 3토큰 통일(X / X-weak / X-on)
  signalCheap: '#007a17',
  signalCheapWeak: '#dff6de',
  signalCheapOn: '#ffffff',
  signalFair: '#616060', // 중립 그레이 (2026-06-13 fair 중립화)
  signalFairWeak: '#eeeceb', // fair 중립화에 맞춰 warm 베이지 → 중립 (L=0.945, weak 명도대 유지)
  signalFairOn: '#ffffff',
  signalExpensive: '#b83d00',
  signalExpensiveWeak: '#ffe7d9',
  signalExpensiveOn: '#ffffff',

  // Brand (무채색 — 무대에 양보)
  brandPrimary: '#141f2c',
  brandPrimaryAlt: '#030c17',
  brandWeak: '#eef1f4',

  // Stage (cool-grey 틴트)
  grey900: '#141f2c',
  grey700: '#4b5765',
  grey500: '#87919c',
  grey400: '#a7b0b9',
  grey300: '#c5cbd2',
  grey200: '#dee3e7',
  grey100: '#eef1f4',
  grey50: '#f6f8fa',
  white: '#ffffff',
} as const;

export type SignalLevel = 'cheap' | 'fair' | 'expensive';

export const signal: Record<SignalLevel, { main: string; weak: string; on: string }> = {
  cheap: { main: palette.signalCheap, weak: palette.signalCheapWeak, on: palette.signalCheapOn },
  fair: { main: palette.signalFair, weak: palette.signalFairWeak, on: palette.signalFairOn },
  expensive: {
    main: palette.signalExpensive,
    weak: palette.signalExpensiveWeak,
    on: palette.signalExpensiveOn,
  },
};

/** IGB / Semantic 컬렉션 실값 */
export const colors = {
  bgCanvas: '#ffffff',
  bgSecondary: '#f6f8fa',
  bgTertiary: '#dee3e7', // = grey-200 (썸네일 placeholder)
  bgElevated: '#ffffff',
  bgPrimary: palette.brandPrimary,
  textPrimary: '#141f2c',
  textSecondary: '#4b5765',
  textTertiary: '#87919c',
  textActive: palette.brandPrimary,
  borderDefault: '#dee3e7',
  borderStrong: '#a7b0b9',
  borderFocus: palette.brandPrimary,
  borderPrimary: palette.brandPrimary,
  priceNumber: '#141f2c',
  priceUnit: '#87919c',
  iconActive: '#141f2c',
  iconInactive: '#87919c',
  overlayScrim: 'rgba(0,0,0,0.5)',
  overlayPress: 'rgba(0,0,0,0.1)',
  surfaceGlassLight: 'rgba(255,255,255,0.65)',
} as const;

export const spacing = {
  s1: 4, s2: 8, s3: 12, s4: 16, s5: 20, s6: 24, s8: 32, s10: 40, s16: 64,
} as const;

export const radius = { xs: 4, s: 8, m: 12, l: 16, xl: 20, full: 999 } as const;

export const borderWidth = { w100: 1, w150: 1.5, w200: 2 } as const;

export const iconSize = { s: 16, m: 20, l: 24, xl: 32 } as const;

export const opacity = { disabled: 0.4, disabledGlass: 0.3 } as const;

/** Pretendard 정적 웨이트 — expo-font로 로드되는 family 이름 */
export const font = {
  regular: 'Pretendard-Regular',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
  extrabold: 'Pretendard-ExtraBold',
} as const;

/** % letterSpacing → px (RN은 px 단위) */
const ls = (size: number, pct: number) => size * (pct / 100);

/** Type ramp — Figma 텍스트 스타일 실값 (size/lineHeight/letterSpacing/weight) */
export const type = {
  display:    { fontSize: 32, lineHeight: 40,    letterSpacing: ls(32, -2),   fontFamily: font.bold },
  signalLead: { fontSize: 22, lineHeight: 28.6,  letterSpacing: ls(22, -1.5), fontFamily: font.bold },
  h1:         { fontSize: 24, lineHeight: 31.2,  letterSpacing: ls(24, -2),   fontFamily: font.bold },
  h2:         { fontSize: 20, lineHeight: 27,    letterSpacing: ls(20, -1.5), fontFamily: font.bold },
  title:      { fontSize: 17, lineHeight: 24.65, letterSpacing: ls(17, -1),   fontFamily: font.semibold },
  body:       { fontSize: 15, lineHeight: 22.5,  letterSpacing: ls(15, -0.5), fontFamily: font.regular },
  caption:    { fontSize: 13, lineHeight: 18.85, letterSpacing: 0,            fontFamily: font.regular },
  label:      { fontSize: 13, lineHeight: 16.25, letterSpacing: 0,            fontFamily: font.semibold },
  buttonXl:   { fontSize: 17, lineHeight: 21.25, letterSpacing: 0,            fontFamily: font.bold },
  buttonL:    { fontSize: 15, lineHeight: 18.75, letterSpacing: 0,            fontFamily: font.bold },
  buttonM:    { fontSize: 15, lineHeight: 18.75, letterSpacing: 0,            fontFamily: font.semibold },
  buttonS:    { fontSize: 13, lineHeight: 16.25, letterSpacing: 0,            fontFamily: font.semibold },
  priceXl:    { fontSize: 32, lineHeight: 38.4,  letterSpacing: ls(32, -1),   fontFamily: font.bold },
  priceLg:    { fontSize: 22, lineHeight: 26.4,  letterSpacing: ls(22, -1),   fontFamily: font.bold },
  priceSm:    { fontSize: 15, lineHeight: 18,    letterSpacing: 0,            fontFamily: font.semibold },
} as const;

/** 가격 숫자 전용 — tabular figures */
export const tabularNums: TextStyle = { fontVariant: ['tabular-nums'] };

/**
 * Elevation — Figma effect 스타일 실값.
 * RN은 그림자 1겹만 지원하므로 다층 섀도는 주 레이어 기준. elevation은 Android.
 */
export const shadow: Record<string, ViewStyle> = {
  s1: {
    shadowColor: palette.grey900, shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 }, shadowRadius: 2, elevation: 1,
  },
  s2: {
    shadowColor: palette.grey900, shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 3,
  },
  s3: {
    shadowColor: palette.grey900, shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 8 }, shadowRadius: 24, elevation: 6,
  },
  sheet: {
    shadowColor: palette.grey900, shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: -2 }, shadowRadius: 12, elevation: 8,
  },
  glassFloating: {
    shadowColor: '#000000', shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 }, shadowRadius: 40, elevation: 8,
  },
};
```

## `mobile/src/thumbnails.gen.ts`
```tsx
// 자동 생성 — scripts/generate-thumbnails.mjs. 직접 수정 금지.
export const THUMBS: Record<string, number> = {

};
```

