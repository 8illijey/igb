# IGB Typography — 사이즈×굵기 2축

> Figma `Foundation / Typography` (node 25-3) 스펙을 코드 문서로 옮긴 것.
> 역할(role)이 아니라 **사이즈를 먼저 고르고, 굵기를 얹어** 조합한다(토스식).
> **같은 사이즈는 line-height·자간을 공유**한다 — 예: 본문과 보조 가격이 똑같이 `size 15`.
> 가격 등 자릿수 정렬은 `tabularNums`(Tabular Figures)를 함께 얹는다.

## 사이즈 스케일

| size | line-height | 비율 | 자간(tracking) | 쓰이는 굵기 | 용도 예시 |
|----:|----:|----:|----:|---|---|
| **12** | 18 | 150% | 0 | SemiBold | 작은 라벨 (`label-s`) |
| **13** | 19.5 | 150% | 0 | Regular · SemiBold | 캡션·출처·날짜 / 칩·버튼 라벨 |
| **15** | 22.5 | 150% | -0.5% | Regular · SemiBold · Bold | 본문 / 보조 가격(TNUM)·버튼M / 버튼L |
| **16** | 24 | 150% | -0.5% | SemiBold | 라벨 (`label-l`) |
| **17** | 25.5 | 150% | -1% | SemiBold · Bold | 카드/리스트 품목명 / 버튼XL |
| **20** | 29 | 145% | -1% | Bold | 섹션 타이틀 |
| **22** | 31.02 | 141% | -2% | Bold | 판단 문장 / 리스트 행 가격(TNUM) |
| **24** | 33.12 | 138% | -2% | Bold | 페이지 타이틀 |
| **28** | 36.96 | 132% | -3.5% | Bold | 큰 가격 (상세 헤드) |
| **32** | 40.32 | 126% | -4% | Bold | 큰 헤드 |

## 굵기 축 (weight)

| 토큰 | 폰트 |
|---|---|
| `regular` | Pretendard Regular (400) |
| `semibold` | Pretendard SemiBold (600) |
| `bold` | Pretendard Bold (700) |
| `extrabold` | Pretendard ExtraBold (800) — 워드마크 등 |

## 코드 사용법

```tsx
// 사이즈 + 굵기 조합
<Text style={[type.size[15], type.w.regular]}>본문</Text>
<Text style={[type.size[17], type.w.semibold]}>카드 품목명</Text>

// 가격 = 사이즈 + 굵기 + 자릿수 정렬(tabularNums)
<Text style={[type.size[28], type.w.bold, tabularNums]}>2,766원</Text>
```

`StyleSheet.create` 안에서는 두 객체를 펼쳐서 쓴다:

```tsx
title: { ...type.size[17], ...type.w.semibold, color: colors.textPrimary },
```

---

## 변경 내역 (역할 기반 → 사이즈×굵기)

**1. 구조: 역할 → 사이즈 2축**
- 기존: `display / h1 / h2 / title / body / caption / label / button-* / price-*` (역할 15종)
- 변경: `size[n] × weight` 조합. 같은 사이즈는 한 가지 LH·자간을 공유.

**2. line-height를 사이즈별로 통일**
- ≤17: **150%**, 20: 145%, 22: 141%, 24: 138%, 28: 132%, 32: 126%
- (기존엔 같은 사이즈라도 역할마다 LH가 달랐음 — 예: 13의 caption 145% / label 125%)

**3. 값 변경**
| 항목 | 기존 | 현재 |
|---|---|---|
| 큰 가격(price-xl) | 32px | **28px** |
| 13 라벨 LH | 16.25 | **19.5** (150%) |
| 15 보조가격 LH | 18 | **22.5** (150%) |
| 22 자간 | -1.5% | **-2%** |
| 32 자간 | -2% | **-4%** |
| 28 자간 | (신규) | **-3.5%** |

**4. 신규 사이즈 추가**: `12`(label-s), `16`(label-l)

---

_출처: Figma `IGB-Design-System` › `Foundation / Typography` (25-3) 텍스트 스타일 실값 동기화. 코드 토큰은 `src/theme/tokens.ts`의 `type.size` / `type.w`._
