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

Voice는 토스의 **해요체 + 위임형**을 따른다 — "지금은 비싼 편이에요", "평년보다 12% 높아요"처럼 판단을 대신 내려주는 위임형 어조를 쓰되, 단정하지 않고 근거(평년 대비 %)를 함께 말한다. 본 카탈로그 메타 문서는 `~다` 평서체로 기술하며, 해요체는 product surface 카피에 한해 적용되는 규칙이다.

---

## Colors

IGBDS 컬러는 **2축 구조**다 — (1) 신호등 축(Signal): 제품의 의미를 나르는 유일한 라우드 컬러, (2) 중성 무대 축(Stage): 캔버스·텍스트·보더·브랜드를 모두 흡수하는 조용한 cool-grey 계열. 토스의 4계층(base→semantic→component) alias 구조를 따르되, 신호등 축이 의미의 중심이라는 점이 토스·지마켓과 결정적으로 다르다.

모든 값은 OKLCH를 유일 정전(canonical)으로 둔다.

### Signal (신호등 — 유일한 강조 축)

**신호등 멘탈 모델(good/fair/poor)** 기반.

- **cheap (green, `#007a17`)**: 사용자에게 좋은 값. 사면 좋은 자리.
- **fair (warm-grey, `#61564d`, L=0.46)**: 평년 수준, 신호로서 의미 없는 중립. 채도 0.020(warm 60°)으로 stage 쿨톤(247°)과 hue 분리. 명도는 cheap·expensive와 비슷하게 맞춰 strong type 자리에서 흰 텍스트 대비 확보(7.13). 회색 채도가 0에 가까워 명도 변화로 "중립" 의미가 안 바뀐다.
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
caption:     { size: 13, line-height: 1.45, tracking: 0,        weight: 400 }  # 평년 대비·출처·날짜
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

신호의 비쌈/적정/쌈을 색 없이도 구분하게 하는 **화살표 3종**이다. 색맹 접근성과 마트 옥외 시인성을 위해 신호 표면에는 항상 이 화살표가 동반된다(색 단독 사용 금지 규칙의 실체). 가격이 평년보다 "올라갔다/같다/내려갔다"를 직관적으로 나르는 방향 메타포다.

```yaml
signal-icon-expensive:  "arrow-up"      # ↑ 비쌈 — 평년보다 높음, currentColor = signal-expensive
signal-icon-fair:       "minus"         # − 적정 — 평년 수준,   currentColor = signal-fair
signal-icon-cheap:      "arrow-down"    # ↓ 쌈   — 평년보다 낮음, currentColor = signal-cheap
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

판단의 핵심 단위. KAMIS 품목 하나의 시세를 "판단 문장 → 가격 → 평년 대비"의 위계로 보여준다. 좌측 2px 신호 accent rail이 카드의 유일한 신호색이며, 나머지 표면은 무채색이다.

구조: 신호 칩 → 판단 문장(`{typography.signal-lead}`) → 현재 가격(`{typography.price-lg}`, tabular) → 평년 대비 캡션(`{typography.caption}`).

```tsx
<PriceItemCard
  name="오이"
  level="expensive"
  lead="지금은 비싼 편이에요"
  price={4500}
  unit="개"
  vsNormal="+12%"          // 평년 대비 (product.md H2: '현재 vs 평년')
  source="KAMIS 2026.05.29"
/>
```

- 판단 문장이 가격보다 **위에, 같거나 큰 크기**로 온다(H1).
- 비교 기준은 '현재 vs 평년'이 기본(H2) — '현재 vs 어제'는 보조.
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

비교 기준 전환. '평년 대비' ↔ '어제 대비'를 토글한다(H2 검증 동선). **배치 규칙(2026-06-13): 토글은 자기가 바꾸는 범위의 머리에 둔다** — 상세 화면에서 hero 판단문·차트 기준선·스탯이 모두 전환되므로 차트 내부가 아니라 hero 첫 행(신호 칩 우측)에 배치. 차트에는 "평년 기준선" 범례만 남긴다. **어휘 결정(2026-06-22 정정): 비교 기준은 '평년'** — 2026-06-12엔 일상어 '예년'을 택했으나, 평년값이 단순 평균이 아니라 **KAMIS 정의(최근 5년 중 최고·최저를 뺀 같은 시기 평균)**라서 정확한 기술용어 '평년'으로 회귀. UI 카피 전체 '평년'으로 통일하고, 상세 차트 범례에 평년 정의를 info 캡션으로 명시한다. 라인(LDSG) switch처럼 즉시 영향을 미치는 컨텍스트에만 쓴다 — 토글 즉시 신호와 % 가 `{motion.dur-base}`로 전환된다.

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
- 상단 라벨: 좌 periodLabel {colors.text-primary} / 우 "평년 = 100" {colors.text-tertiary}.
- 하단 캡션: "평년 = 여러 해 같은 시기의 평균이에요" {colors.text-tertiary} {typography.caption}.
- strokeWeight·아이콘 width는 setBoundVariable 무음 실패 → raw 값.
- clipsContent 카드 false 명시.

<DetailChart
  data={prices14d}                  // 최근 14일
  baseline={normalYear}             // 평년 = 100 기준선
  level="cheap"                     // 라인·끝점 신호 매핑
  periodLabel="최근 14일"
  baselineLabel="평년"
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
- 비교 기준은 **'현재 vs 평년'을 기본**으로 둔다(H2) — '현재 vs 어제'는 보조 옵션.
  ('평년' = 여러 해 같은 시기 평균. KAMIS 검증상 주간 평균은 신호 반전이 잦아 
  평년을 베이스라인으로 확정. 화면 라벨은 '평년'으로 통일하고 뜻은 차트 캡션이 푼다.)
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

- ~~**신호 임계값(threshold) 정의**~~ (2026-06-19 확정): "비쌈/적정/쌈"을 가르는 경계는 **평년·어제 공통 ±1%**로 확정. 0보다 싸면 "싸요"/비싸면 "비싸요", ±1% 안만 "비슷"(일별 잔진동 흡수). 초기값 ±10%는 −9%(예: 소고기 갈비 7,904 vs 평년 8,675)까지 "평소"로 묻어 거의 모든 품목이 fair로 떨어지는 검증 실패가 있었다 — 1%로 좁혀 신호가 실제로 뜨게 함. 디자인 토큰이 아니라 제품 로직이라 향후 데이터로 재조정 가능. (구현: `api/kamis.ts` THRESHOLD, 평년·어제 모두 `judge()` 단일 경로)
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
