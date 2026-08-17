import * as Haptics from 'expo-haptics';
import React from 'react';
import { PanResponder, Platform, StyleSheet, Text, View } from 'react-native';
import Reanimated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { SeriesPoint, won } from '../../api/kamis';
import { colors, signal, SignalLevel, spacing, type } from '../../theme/tokens';
import { Tooltip, TooltipPosition } from './Tooltip';

const CUR_YEAR = String(new Date().getFullYear());
// 발견성 힌트(크로스헤어 스윕)는 세션당 1회 — 상세 들락날락할 때마다 나오면 소음.
let hintShown = false;
const easeInOut = Easing.bezier(0.77, 0, 0.175, 1);
// 작년(이전 연도) 날짜면 연도 접두 — 1년 차트에서 구분. 예: "25/10/02", 올해는 "10/02".
const fmtDate = (p: SeriesPoint) => (p.year && p.year !== CUR_YEAR ? `${p.year.slice(2)}/${p.date}` : p.date);

interface Props {
  series: SeriesPoint[];
  /** 가로 기준선(점선) — '이맘때 평균'. 값 표기는 카드 서브타이틀이 담당하고, 여기선 '평균' 라벨만. */
  baseline: number | null;
  level: SignalLevel;
  height?: number;
}

/** 최근 추이 라인 + 평균 기준선 + 오늘 시세 툴팁. 가로 드래그(스크럽)로 특정 날짜 시세 조회(주식차트식). */
export function Sparkline({ series, baseline, level, height = 140 }: Props) {
  const [width, setWidth] = React.useState(0);
  const [sel, setSel] = React.useState<number | null>(null); // 스크럽 선택 인덱스
  const [ttW, setTtW] = React.useState(112); // 툴팁 폭(center 배치용) — 기본값으로 첫프레임 점프 방지
  const c = signal[level];

  // PanResponder가 최신 geometry를 보도록 ref (stale closure 방지)
  const geom = React.useRef({ width: 0, n: 0 });
  geom.current = { width, n: series.length };
  const idxFromX = (lx: number) => {
    const { width: w, n } = geom.current;
    if (w <= 0 || n <= 1) return 0;
    return Math.max(0, Math.min(n - 1, Math.round((lx / w) * (n - 1))));
  };

  // 발견성 힌트 — 데이터가 처음 그려지고 600ms 뒤 크로스헤어가 한 번 훑고 사라진다(세션 1회).
  const reduced = useReducedMotion();
  const hintX = useSharedValue(0);
  const hintOpacity = useSharedValue(0);
  const hintStyle = useAnimatedStyle(() => ({
    opacity: hintOpacity.value,
    transform: [{ translateX: hintX.value }],
  }));
  const killHint = () => {
    cancelAnimation(hintX);
    hintOpacity.value = withTiming(0, { duration: 80 });
  };
  React.useEffect(() => {
    if (hintShown || reduced || width <= 0 || series.length < 2) return;
    hintShown = true;
    const t = setTimeout(() => {
      hintX.value = width;
      hintOpacity.value = withTiming(0.5, { duration: 200 });
      hintX.value = withSequence(
        withTiming(width * 0.4, { duration: 450, easing: easeInOut }),
        withTiming(width, { duration: 450, easing: easeInOut }),
      );
      hintOpacity.value = withDelay(900, withTiming(0, { duration: 200 }));
    }, 600);
    return () => clearTimeout(t);
  }, [width, series.length, reduced]);

  // 스크럽 틱 — 포인트가 바뀔 때만 셀렉션 햅틱(연속 발화 방지). 웹 no-op.
  const selRef = React.useRef<number | null>(null);
  const scrubTo = (lx: number) => {
    const i = idxFromX(lx);
    if (selRef.current !== i && Platform.OS !== 'web') Haptics.selectionAsync();
    selRef.current = i;
    setSel(i);
  };
  const scrubEnd = () => {
    selRef.current = null;
    setSel(null);
  };
  // 가로 드래그만 캡처 → 세로 스크롤은 부모로 통과. 손 떼면 '오늘'로 복귀.
  const pan = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 4,
        onPanResponderGrant: (e) => {
          killHint();
          scrubTo(e.nativeEvent.locationX);
        },
        onPanResponderMove: (e) => scrubTo(e.nativeEvent.locationX),
        onPanResponderRelease: scrubEnd,
        onPanResponderTerminate: scrubEnd,
      }),
    [],
  );

  if (series.length < 2) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>추이 데이터가 충분하지 않아요</Text>
      </View>
    );
  }

  const values = series.map((p) => p.price);
  const base = baseline != null ? [baseline] : [];
  const min = Math.min(...values, ...base);
  const max = Math.max(...values, ...base);
  // 작은 변동이 급등처럼 보이지 않도록 표시 폭을 기준가의 최소 ~30%로 보장하고 가운데 둔다.
  const ref = baseline ?? (min + max) / 2;
  const span = Math.max(max - min, ref * 0.3, 1);
  const mid = (min + max) / 2;
  const pad = span * 0.12;
  const lo = mid - span / 2 - pad;
  const hi = mid + span / 2 + pad;
  const y = (v: number) => height - ((v - lo) / (hi - lo)) * height;
  const x = (i: number) => (values.length <= 1 ? 0 : (i / (values.length - 1)) * width);

  const line = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;
  const TOOLTIP_H = 42; // 버블(≈36) + 꼬리(5.6)
  const TAIL_H = 6; // 꼬리 높이(top variant에서 버블을 점 아래로 밀 때)

  const active = sel != null ? sel : values.length - 1; // 표시 인덱스 (스크럽 or 오늘)
  // 최신 조사가 '오늘'이 아니면(주말·공휴일·KAMIS 4시 갱신 전 등) '오늘 시세' 대신 실제 조사날짜로 표기.
  const lastP = series[values.length - 1];
  const now = new Date();
  const [lm, ld] = lastP.date.split('/').map(Number);
  const isToday = lastP.year === String(now.getFullYear()) && lm === now.getMonth() + 1 && ld === now.getDate();
  const todayLabel = isToday ? '오늘 시세' : fmtDate(lastP);
  const endAxisLabel = isToday ? '오늘' : fmtDate(lastP);
  const activeV = values[active];

  return (
    <View>
      <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)} {...pan.panHandlers}>
        {width > 0 && (
          <Svg width={width} height={height}>
            <Path d={area} fill={c.main} fillOpacity={0.14} />
            {/* 이맘때 평균 — 가로 점선 */}
            {baseline != null && (
              <Line x1={0} x2={width} y1={y(baseline)} y2={y(baseline)} stroke={colors.borderStrong} strokeDasharray="4 4" strokeWidth={1} />
            )}
            <Path d={line} stroke={c.main} strokeWidth={2} fill="none" />
            {/* 스크럽 크로스헤어 — 세로선 + 선택 점 */}
            {sel != null && (
              <>
                <Line x1={x(sel)} x2={x(sel)} y1={0} y2={height} stroke={colors.borderStrong} strokeDasharray="3 3" strokeWidth={1} />
                <Circle cx={x(sel)} cy={y(values[sel])} r={4.5} fill={c.main} stroke="#fff" strokeWidth={1.5} />
              </>
            )}
            {/* 오늘 점 (스크럽 중엔 숨김) */}
            {sel == null && <Circle cx={width} cy={y(values[values.length - 1])} r={4} fill={c.main} />}
          </Svg>
        )}
        {/* 발견성 힌트 스윕 — '만질 수 있는 차트'라는 신호. 스크럽 시작 시 즉시 소멸(killHint). */}
        <Reanimated.View pointerEvents="none" style={[styles.hintLine, hintStyle]} />
        {/* '평균' 라벨 — 점선 좌측. 실제 값은 카드 서브타이틀('이맘때 평균 X원')이 보여준다. */}
        {baseline != null && width > 0 && (
          <Text style={[styles.refLabel, { left: 0, top: Math.max(0, Math.min(height - 20, y(baseline) - 10)) }]}>평균</Text>
        )}
        {/* 툴팁 — 스크럽이면 그 날짜, 아니면 '오늘 시세'. 좌표 zone으로 variant/위치 선택.
            가로: 0~⅓ left, ⅓~⅔ center, ⅔~1 right / 세로: 0~½ top(아래로), ½~1 bottom(위로). */}
        {width > 0 &&
          (() => {
            const px = x(active);
            const py = y(activeV);
            const hz = px < width / 3 ? 'left' : px < (2 * width) / 3 ? 'center' : 'right';
            const vt = py < height / 2 ? 'top' : 'bottom';
            const variant = `${vt}-${hz}` as TooltipPosition;
            const top = vt === 'bottom' ? py - TOOLTIP_H : py + TAIL_H;
            const pos: { top: number; left?: number; right?: number } = {
              top: Math.max(0, Math.min(height - 8, top)),
            };
            if (hz === 'right') pos.right = Math.max(0, Math.min(width - 40, width - px));
            else if (hz === 'left') pos.left = Math.max(0, px);
            else pos.left = Math.max(0, Math.min(width - ttW, px - ttW / 2));
            return (
              <View
                style={[styles.tooltipWrap, pos]}
                pointerEvents="none"
                onLayout={(e) => {
                  const w = e.nativeEvent.layout.width;
                  setTtW((prev) => (Math.abs(w - prev) > 1 ? w : prev));
                }}
              >
                <Tooltip
                  label={sel != null ? fmtDate(series[active]) : todayLabel}
                  value={`${won(activeV)}원`}
                  position={variant}
                />
              </View>
            );
          })()}
      </View>
      <View style={styles.dateRow}>
        <Text style={styles.dateText}>{fmtDate(series[0])}</Text>
        <Text style={styles.dateText}>{endAxisLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgSecondary, borderRadius: 8 },
  emptyText: { ...type.size[13], ...type.w.regular, color: colors.textTertiary } as const,
  // '평균' 라벨 — 라인과 겹쳐도 읽히도록 흰 배경.
  refLabel: {
    position: 'absolute',
    ...type.size[13], ...type.w.regular,
    color: colors.textSecondary,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 3,
    borderRadius: 3,
    overflow: 'hidden',
  } as const,
  tooltipWrap: { position: 'absolute' },
  hintLine: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 1, backgroundColor: colors.borderStrong },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.s1 },
  dateText: { ...type.size[13], ...type.w.regular, color: colors.textTertiary } as const,
});
