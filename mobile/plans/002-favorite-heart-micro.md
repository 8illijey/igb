# 002 — 즐겨찾기 하트 마이크로 인터랙션 (스케일 스프링 + 햅틱)

- **Status**: DONE (2026-08-07)
- **Commit**: bf73639
- **Severity**: MEDIUM
- **Category**: Missed opportunities
- **Estimated scope**: 1 file (`app/item/[key].tsx`의 Header) + expo-haptics 설치, ~40 lines

## Problem

상세 화면 헤더의 관심(하트) 토글이 색만 즉시 바뀌고 아무 반응이 없다. 저장 액션은 사용자가 "됐다"는 확인을 기대하는 순간인데 피드백이 0이다.

```tsx
// src/app/item/[key].tsx:758-773 — current
function Header({ title, fav, onFav }: { title: string; fav: boolean; onFav: () => void }) {
  const favColor = fav ? colors.iconActive : colors.iconInactive;
  return (
    <View style={styles.header}>
      ...
      <Pressable style={styles.iconBtn} onPress={onFav} hitSlop={4}>
        <Heart size={24} color={favColor} fill={fav ? favColor : 'none'} strokeWidth={2} />
      </Pressable>
    </View>
  );
}
```

## Target

- **켤 때(추가)**: 하트가 `scale 1 → 0.8 (80ms, ease-out) → withSpring(1, { duration: 500, dampingRatio: 0.7 })` — 살짝 튀는 pop. 동시에 네이티브에서 `Haptics.impactAsync(ImpactFeedbackStyle.Medium)`.
- **끌 때(제거)**: 스프링 없이 `withTiming(1, 120ms)` 복귀만 + `Haptics.selectionAsync()`. 제거는 조용하게 — 비대칭 타이밍.
- **reduced motion**: 스케일 시퀀스 생략, 색 전환만. 햅틱은 유지.
- 웹: 햅틱 no-op (Platform 분기), 스케일 애니메이션은 동일 동작.

## Repo conventions to follow

- 모션 토큰은 001 플랜이 만드는 `src/theme/tokens.ts`의 `motion`을 쓴다. 001이 아직 안 됐다면 이 플랜에서 동일 정의를 추가한다(중복 정의 금지 — 있으면 재사용).
- 아이콘은 `lucide-react-native`의 `Heart`를 이미 사용 중 — 교체하지 않는다.
- 한국어 주석, 기존 파일 스타일 유지.

## Steps

1. `npx expo install expo-haptics` (이 플랜에서 유일하게 허용된 의존성 추가).
2. `Header`의 하트 Pressable 내부를 `Animated.View`로 감싸고 스케일 shared value 적용:
   ```tsx
   const scale = useSharedValue(1);
   const reduced = useReducedMotion();
   const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
   const handleFav = () => {
     if (!fav) {
       // 추가 — pop + 미디엄 임팩트
       if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
       if (!reduced) {
         scale.value = withSequence(
           withTiming(0.8, { duration: 80, easing: motion.easeOut }),
           withSpring(1, { duration: 500, dampingRatio: 0.7 }),
         );
       }
     } else {
       // 제거 — 조용히
       if (Platform.OS !== 'web') Haptics.selectionAsync();
       if (!reduced) scale.value = withTiming(1, { duration: 120 });
     }
     onFav();
   };
   ```
3. `fill` 전환은 기존 즉시 스왑 유지 — SVG fill은 애니메이트하지 않는다(비용 대비 무가치).

## Boundaries

- 홈/검색의 다른 즐겨찾기 진입점이 있어도 손대지 않는다 — 이 플랜은 상세 Header만.
- `useFavorites` 스토어 로직 변경 금지.
- expo-haptics 외 의존성 추가 금지.
- 코드가 commit bf73639과 다르면 멈추고 보고.

## Verification

- **Mechanical**: `npx tsc --noEmit` 통과, `npx expo export -p web` 성공(웹에서 expo-haptics import가 빌드를 깨지 않는지).
- **Feel check**: (가능하면 실기기) 하트 켜기 — pop이 한 번만 튀고 과하게 출렁이지 않는지(dampingRatio 0.7 기준, 오버슈트 1회). 연타 시 애니메이션이 처음부터 재시작하지 않고 이어지는지. 끄기는 튀지 않고 담백한지.
- **Done when**: 켜기=pop+진동, 끄기=조용한 복귀, 웹 빌드 무사.
