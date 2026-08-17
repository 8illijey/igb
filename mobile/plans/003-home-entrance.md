# 003 — 홈 진입 연출: 카드 스태거 페이드인 + 히어로 가격 카운트업

- **Status**: DONE (2026-08-07)
- **Commit**: bf73639
- **Severity**: LOW
- **Category**: Missed opportunities
- **Estimated scope**: 1 file (`app/(tabs)/index.tsx`), ~60 lines

## Problem

홈 첫 로드가 스피너 → 전체 콘텐츠 팝인의 하드 스왑이다. 데이터가 "도착했다"는 감각 없이 화면이 한 번에 갈린다.

```tsx
// src/app/(tabs)/index.tsx:183-199 — current: 로딩 분기가 끝나면 전부 즉시 렌더
{loading && items.length === 0 ? (
  <ActivityIndicator style={{ marginTop: spacing.s10 }} color={colors.textTertiary} />
) : ... (
  <>
    {hero && <HeroVerdictCard item={hero} level={lvlOf(hero)} />}
    ...
    {notable.map((i) => (
      <ThumbnailCard key={itemKey(i)} item={i} width={colW} />
    ))}
```

```tsx
// src/app/(tabs)/index.tsx:84 — current: 히어로 가격 정적 텍스트
<Text style={styles.heroPrice}>{won(item.today)}원</Text>
```

## Target

- **스태거**: 스피너를 거쳐 데이터가 처음 도착한 렌더에서만 — 히어로 카드 `FadeInDown.duration(300)`, 주목할 시세 카드들 `FadeInDown.duration(300).delay(60 + i * 40)` (최대 6장이므로 총 ~540ms에 끝남). easing은 001의 `motion.easeOut`.
- **캐시 즉시 페인트 때는 연출 없음**: AsyncStorage 캐시로 스피너 없이 바로 그려지는 재방문 경로에서는 스태거를 걸지 않는다(매번 출렁이면 소음). "스피너를 실제로 보여줬는가"를 ref로 기억해서 그때만 entering을 붙인다.
- **카운트업**: 히어로 가격 숫자가 도착 시 0이 아니라 `현재값의 85% → 100%`를 500ms ease-out으로 굴러 올라간다(0부터 시작하면 싸 보임). 스태거와 같은 조건(첫 도착)에서만. reduced motion이면 즉시 최종값.

## Repo conventions to follow

- `motion` 토큰(001)이 있으면 재사용, 없으면 동일 정의 추가.
- `won()`(천단위 콤마 포맷)은 `src/api/kamis.ts` export — 카운트업 중간값도 반드시 `won()`으로 포맷.
- 카운트업은 의존성 없이 rAF 훅으로:
  ```tsx
  // 숫자 카운트업 — 첫 도착 1회만. reduced motion이면 즉시 최종값.
  function useCountUp(target: number | null, enabled: boolean): number | null {
    const [v, setV] = useState(target);
    useEffect(() => {
      if (target == null || !enabled) { setV(target); return; }
      const from = Math.round(target * 0.85);
      const t0 = Date.now();
      let raf: number;
      const tick = () => {
        const p = Math.min(1, (Date.now() - t0) / 500);
        const e = 1 - Math.pow(1 - p, 3); // cubic ease-out
        setV(Math.round(from + (target - from) * e));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [target, enabled]);
    return v;
  }
  ```

## Steps

1. `index.tsx`에 `sawSpinner` ref: 로딩 분기가 스피너를 렌더할 때 true로 기록. 데이터 도착 후 첫 렌더에서 `animateEntrance = sawSpinner.current && !didAnimate.current` 계산, 연출 후 `didAnimate.current = true`.
2. `HeroVerdictCard`와 `ThumbnailCard`를 감싸는 자리에서 `Animated.View entering={...}` 적용 — `animateEntrance`가 false면 entering 자체를 넘기지 않는다(undefined).
3. `HeroVerdictCard`에 `animatePrice?: boolean` prop 추가 → 내부에서 `useCountUp(item.today, animatePrice)`로 가격 표시. `useReducedMotion()`이면 enabled 강제 false.
4. 스태거 대상은 접힘 상태의 최대 6장까지만 — `expanded`(전체 보기) 전환 시에는 연출 없음.

## Boundaries

- 당겨서 새로고침(RefreshControl) 경로에는 연출 금지 — 첫 도착 1회만.
- 리스트 정렬/필터 로직, `usePrices` 스토어 변경 금지.
- 새 의존성 금지.
- 코드가 commit bf73639과 다르면 멈추고 보고.

## Verification

- **Mechanical**: `npx tsc --noEmit`, `npx expo export -p web` 통과.
- **Feel check**: 시크릿 창(캐시 없음)에서 첫 로드 — 히어로가 먼저, 카드가 40ms 간격으로 뒤따르고 가격이 짧게 굴러 올라오는지. **새로고침(F5) 재방문 — 아무 연출 없이 즉시 페인트**되는지(캐시 경로). 당겨서 새로고침 — 연출 없는지. DevTools에서 reduced-motion 설정 시 전부 즉시 표시.
- **Done when**: 첫 방문 1회만 연출되고, 재방문·새로고침은 기존과 동일하게 즉시.
