# 004 — 차트 스크러빙 발견성 + 폴리시 (힌트 스윕·햅틱 틱·툴팁 등장)

- **Status**: DONE (2026-08-07)
- **Commit**: bf73639
- **Severity**: MEDIUM
- **Category**: Missed opportunities / Physicality
- **Estimated scope**: 1 file (`components/igb/Sparkline.tsx`), ~70 lines

## Problem

스크러빙 자체는 이미 있다 — `Sparkline.tsx:38-48`의 PanResponder가 가로 드래그로 날짜·가격을 짚는다. 문제는 셋:

1. **발견성 0**: 차트가 만져진다는 시각 힌트가 없어 기능이 묻혀 있다.
2. **크로스헤어·툴팁이 하드 팝**: 손을 대는 순간 등장 모션 없이 나타난다.
   ```tsx
   // src/components/igb/Sparkline.tsx:100-103 — current: sel 생기면 즉시 렌더
   {sel != null && (
     <>
       <Line x1={x(sel)} x2={x(sel)} y1={0} y2={height} stroke={colors.borderStrong} ... />
   ```
3. **틱 감각 없음**: 데이터 포인트를 넘어갈 때 아무 촉각 피드백이 없다(주식앱들은 인덱스 변경마다 selection 햅틱).

## Target

- **첫 진입 힌트(발견성)**: 상세 화면에서 차트가 데이터를 처음 그린 뒤 600ms 후, 크로스헤어가 `우측(오늘) → 좌측 40% 지점 → 우측 복귀`로 1회 스윕(총 900ms, ease-in-out `Easing.bezier(0.77, 0, 0.175, 1)`, 투명도 0.5). 세션당 1회만(모듈 스코프 flag). reduced motion이면 생략.
- **툴팁·크로스헤어 등장**: opacity 0→1, 120ms ease-out. 사라질 땐 즉시(0ms) — 손을 뗀 순간 오늘 시세 복귀는 지연 없이.
- **햅틱 틱**: 스크럽 중 `sel` 인덱스가 바뀔 때마다 네이티브에서 `Haptics.selectionAsync()`. 웹 no-op. (expo-haptics는 002가 설치 — 없으면 이 플랜에서 `npx expo install expo-haptics`.)

## Repo conventions to follow

- `motion` 토큰(001) 재사용, 없으면 동일 정의 추가.
- SVG는 `react-native-svg` 사용 중 — 크로스헤어 애니메이션은 SVG 요소를 직접 애니메이트하지 말고, **오버레이 `Animated.View`**(절대배치 세로선 1px + 점)로 구현하는 편이 웹·네이티브 공통으로 안전하다. 기존 SVG 크로스헤어는 스크럽 중 렌더 유지, 힌트 스윕만 오버레이로.
- 스크럽 인덱스 계산(`idxFromX`)·PanResponder 구조는 손대지 않는다 — stale closure 방지용 `geom` ref 패턴(Sparkline.tsx:27-35)이 의도적 설계다.

## Steps

1. 모듈 스코프에 `let hintShown = false;` — 세션당 1회 가드.
2. `width > 0 && series.length >= 2`가 처음 참이 된 시점에 600ms 타이머 → 힌트 스윕 실행(shared value `hintX`를 withSequence로 이동, `hintOpacity` 0.5→0). 스윕 중 사용자가 실제 스크럽을 시작하면(`onPanResponderGrant`) 즉시 취소.
3. 툴팁/크로스헤어 래퍼에 `entering` 대신 opacity shared value(등장 120ms, 소멸 즉시) — `sel != null` 전환에 연동.
4. `setSel` 호출부에서 이전 인덱스와 다를 때만 `Haptics.selectionAsync()` (Platform.OS !== 'web').
5. `useReducedMotion()`이면 힌트 스윕 생략 + 등장 페이드 생략(즉시 표시). 햅틱은 유지.

## Boundaries

- 차트 지오메트리(스케일 계산, 30% 폭 보장 로직 Sparkline.tsx:60-68) 변경 금지.
- Tooltip 컴포넌트 내부 변경 금지 — Sparkline 쪽 래퍼에서만.
- PanResponder → gesture-handler 마이그레이션 금지(동작 검증된 코드).
- 코드가 commit bf73639과 다르면 멈추고 보고.

## Verification

- **Mechanical**: `npx tsc --noEmit`, `npx expo export -p web` 통과.
- **Feel check**: 상세 진입 → 잠시 후 크로스헤어가 한 번 훑고 사라지는지(두 번째 진입엔 안 나옴). 스윕 중에 손을 대면 스윕이 즉시 끊기고 내 손가락 위치로 잡히는지. 손을 떼면 지연 없이 오늘 시세로 복귀하는지(소멸에 페이드가 있으면 실패). 실기기에서 스크럽 시 포인트마다 미세한 틱이 오는지 — 틱이 드르륵 몰리면(과발화) 인덱스 변경 가드 누락.
- **Done when**: 첫 진입 힌트 1회 + 등장 페이드 + 인덱스당 틱 1회, 기존 스크럽 동작은 그대로.


> **실행 노트 (2026-08-07)**: 툴팁·크로스헤어 등장 페이드는 구현하지 않음 — 툴팁은 기본 상태(오늘 시세)로 항상 표시되고, 크로스헤어는 손가락을 실시간 추적하는 요소라 등장에 지연을 넣으면 제스처 추적 랙으로 느껴진다(인터럽트 가능성 원칙). 힌트 스윕·햅틱 틱은 계획대로.
