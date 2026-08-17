# 001 — 전환 모션 팩: 세그먼트 pill 슬라이드 + 탭 밑줄 슬라이드 + 전역 press 피드백

- **Status**: DONE (2026-08-07)
- **Commit**: bf73639
- **Severity**: MEDIUM
- **Category**: Easing & duration / Missed opportunities
- **Estimated scope**: 5 files (`SegmentedControl.tsx`, `Tabs.tsx`, `PriceListRow.tsx`, `Buttons.tsx`, `ComparisonToggle.tsx`), ~120 lines

## Problem

앱 전체에 상태 전환 애니메이션이 0건이다. 모든 선택 UI가 스타일 이진 스왑으로 순간이동한다.

```tsx
// src/components/igb/SegmentedControl.tsx:31 — current: 선택 pill이 배경색 스왑으로 순간이동
<Pressable
  key={o.value}
  disabled={o.disabled}
  onPress={() => onChange(o.value)}
  style={[styles.segment, selected && styles.pill, o.disabled && { opacity: 0.4 }]}
>
```

```tsx
// src/components/igb/Tabs.tsx:63 — current: 밑줄이 배경색 토글로 점프
<View style={[styles.underlineBar, selected && { backgroundColor: colors.textPrimary }]} />
```

```tsx
// src/components/igb/PriceListRow.tsx:30 — current: pressed 배경 즉시 스왑 (전환 0ms)
style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.overlayPress }]}
```

```tsx
// src/components/igb/Buttons.tsx:53-59 — current
style={({ pressed }) => [
  ...
  pressed && variant === 'primary' && { backgroundColor: palette.brandPrimaryAlt },
  pressed && variant !== 'primary' && { opacity: 0.85 },
]}
```

```tsx
// src/components/igb/ComparisonToggle.tsx:27 — current
style={({ pressed }) => [styles.base, pressed && { opacity: 0.7 }]}
```

상세 화면의 소매/도매/유기농 세그먼트는 이 앱 최고빈도 조작이고, 홈 리스트 행은 모든 탐색의 진입점이다. `react-native-reanimated@4.3.1`이 설치돼 있으나 소스에서 한 줄도 쓰이지 않는다.

## Target

- **선택 인디케이터 이동**(pill·밑줄): `withTiming(x, { duration: 200, easing: Easing.bezier(0.23, 1, 0.32, 1) })` — 강한 ease-out. 인디케이터를 절대배치 1개로 바꾸고 translateX로 이동.
- **press 피드백**: press-in `scale 0.97` + 기존 opacity/배경. in 120ms / out 180ms, 같은 bezier. 스프링 불필요(단순 눌림).
- **reduced motion**: `useReducedMotion()`(reanimated 제공)이 true면 duration 0으로 즉시 점프. opacity 피드백은 유지.

## Repo conventions to follow

- 디자인 토큰은 전부 `src/theme/tokens.ts` (`colors`, `spacing`, `radius`, `type`, `shadow`). 모션 토큰도 여기에 추가한다:
  ```ts
  // src/theme/tokens.ts에 추가
  import { Easing } from 'react-native-reanimated';
  export const motion = {
    easeOut: Easing.bezier(0.23, 1, 0.32, 1),
    fast: 120,
    base: 200,
  } as const;
  ```
- 컴포넌트는 함수형 + StyleSheet.create, 한국어 주석. 기존 파일의 주석 밀도를 따른다.
- 이 repo는 Expo web 빌드(`npx expo export -p web`)가 프로덕션이다 — reanimated 코드는 웹에서도 동작해야 한다(reanimated 4는 web 지원, 특별 처리 불요).

## Steps

1. `src/theme/tokens.ts`에 위 `motion` 토큰 추가.
2. **SegmentedControl.tsx**: 선택 pill을 각 세그먼트의 조건부 스타일에서 분리 — track 안에 절대배치 `Animated.View`(styles.pill 배경+그림자) 1개를 두고, `onLayout`으로 각 세그먼트의 x/width를 기록, `value` 변경 시 `withTiming(seg.x, { duration: motion.base, easing: motion.easeOut })` + width도 함께 애니메이트. `useReducedMotion()`이면 duration 0. 라벨 색은 기존 조건부 유지.
3. **Tabs.tsx**(underline variant만): 같은 패턴 — 절대배치 밑줄 `Animated.View` 1개(height 2, backgroundColor colors.textPrimary), translateX+width를 withTiming으로. pill variant는 손대지 않는다.
4. **press 피드백 훅** 신규 `src/components/igb/usePressScale.ts`:
   ```ts
   // press-in 0.97 스케일 — 전역 공용. reduced motion이면 스케일 생략(opacity 피드백만 남음).
   import { useReducedMotion, useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
   import { motion } from '../../theme/tokens';
   export function usePressScale() {
     const reduced = useReducedMotion();
     const scale = useSharedValue(1);
     const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
     const onPressIn = () => { if (!reduced) scale.value = withTiming(0.97, { duration: motion.fast, easing: motion.easeOut }); };
     const onPressOut = () => { if (!reduced) scale.value = withTiming(1, { duration: 180, easing: motion.easeOut }); };
     return { style, onPressIn, onPressOut };
   }
   ```
5. `PriceListRow.tsx`, `Buttons.tsx`, `ComparisonToggle.tsx`에 훅 적용 — Pressable을 `Animated.View`로 감싸거나 `Animated.createAnimatedComponent(Pressable)` 사용. 기존 pressed 배경/opacity 스타일은 그대로 둔다(색 피드백 유지).

## Boundaries

- `GlassTabBar.tsx`(하단 탭바)는 이 플랜 범위 밖 — 네비게이션 상태와 얽혀 있어 별도 판단 필요.
- 마크업 구조 변경은 인디케이터 절대배치 분리에 필요한 최소한만.
- 새 의존성 추가 금지 (reanimated는 이미 설치됨).
- 코드가 commit bf73639과 다르면(드리프트) 멈추고 보고.

## Verification

- **Mechanical**: `cd mobile && npx tsc --noEmit` 통과. `npx expo export -p web` 성공.
- **Feel check**: 상세 화면에서 소매↔도매↔유기농 연타 — pill이 **현재 위치에서 이어서** 이동해야 함(매번 처음부터 다시 시작하면 실패). 홈 리스트 행을 꾹 누르면 0.97로 눌리고 떼면 복귀. 크롬 DevTools Rendering 패널에서 `prefers-reduced-motion: reduce` 설정 → 이동은 즉시 점프하되 색 피드백은 남는지.
- **Done when**: 위 세 조작 모두에서 순간이동이 사라지고, tsc·웹 빌드가 깨끗함.
