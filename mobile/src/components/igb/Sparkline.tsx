import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { SeriesPoint, won } from '../../api/kamis';
import { colors, signal, SignalLevel, spacing, tabularNums, type } from '../../theme/tokens';

interface Props {
  series: SeriesPoint[];
  /** 가로 기준선(점선) — 평년처럼 시계열에 없는 '레벨' 비교에만 사용 */
  baseline: number | null;
  baselineLabel?: string;
  level: SignalLevel;
  /** 시계열 안의 특정 시점을 세로선+점으로 강조 (예: 어제). baseline 대신 사용. */
  comparePoint?: { index: number; label: string };
  /**
   * 작년 같은 시기 궤적(점선) — '오늘' 지점부터 오른쪽(미래)으로 뻗는다.
   * 예측이 아니라 과거 사실(작년엔 이 날짜부터 이렇게 움직였다). 데이터 한계로 '이 날짜 이후'만 존재.
   */
  overlay?: SeriesPoint[];
  /** 신호 의미가 없는 데이터(친환경 주간 추이 등) — stage 회색으로 그린다 */
  neutral?: boolean;
  height?: number;
}

/** 최근 추이 라인 + 비교 표기. 오늘값·기준값·시작/오늘 날짜를 라벨로 표기해 읽기 쉽게. */
export function Sparkline({
  series,
  baseline,
  baselineLabel = '평년',
  level,
  comparePoint,
  overlay,
  neutral,
  height = 140,
}: Props) {
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
  const ov = overlay && overlay.length >= 2 ? overlay : null;
  const ovValues = ov ? ov.map((p) => p.price) : [];
  const todayI = series.length - 1; // '오늘' = 본 시계열 마지막 점의 x-인덱스
  // overlay는 오늘 지점부터 오른쪽으로 (ovLen-1)만큼 더 뻗는다 → x 도메인 확장
  const all = [...values, ...ovValues, ...(baseline != null ? [baseline] : [])];
  const min = Math.min(...all);
  const max = Math.max(...all);
  // 작은 변동이 차트를 꽉 채워 급등처럼 보이지 않도록, 표시 폭을 기준가의 최소 ~30%로 보장하고 가운데 둔다.
  const ref = baseline ?? (min + max) / 2;
  const span = Math.max(max - min, ref * 0.3, 1);
  const mid = (min + max) / 2;
  const pad = span * 0.12;
  const lo = mid - span / 2 - pad;
  const hi = mid + span / 2 + pad;
  const y = (v: number) => height - ((v - lo) / (hi - lo)) * height;
  const clampY = (v: number) => Math.max(0, Math.min(height - 16, v));
  // overlay가 있으면 '오늘'을 2/3 지점에 — 과거 28일(좌 2/3) + 작년 +2주(우 1/3, 더 짧으므로)
  const xToday = ov ? width * (2 / 3) : width;
  const xMain = (i: number) => (todayI <= 0 ? 0 : (i / todayI) * xToday);
  const xOv = (j: number) => (ov && ov.length > 1 ? xToday + (j / (ov.length - 1)) * (width - xToday) : xToday);

  const line = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${xMain(i)},${y(v)}`).join(' ');
  const area = `${line} L${xToday},${height} L0,${height} Z`;
  const ovLine = ov ? ov.map((p, j) => `${j === 0 ? 'M' : 'L'}${xOv(j)},${y(p.price)}`).join(' ') : null;
  const ovArea = ovLine ? `${ovLine} L${width},${height} L${xToday},${height} Z` : null;
  const lastV = values[values.length - 1];
  const cp = comparePoint && comparePoint.index >= 0 && comparePoint.index < values.length ? comparePoint : null;
  const cpV = cp ? values[cp.index] : null;

  return (
    <View>
      <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && (
          <Svg width={width} height={height}>
            {/* 작년 궤적 area-fill (연한 회색) */}
            {ovArea && <Path d={ovArea} fill={colors.textTertiary} fillOpacity={0.08} />}
            <Path d={area} fill={c.main} fillOpacity={0.14} />
            {/* 평년: 가로 점선 */}
            {baseline != null && (
              <Line x1={0} x2={width} y1={y(baseline)} y2={y(baseline)} stroke={colors.borderStrong} strokeDasharray="4 4" strokeWidth={1} />
            )}
            {/* 어제: 세로 점선 + 점 */}
            {cp && cpV != null && (
              <Line x1={xMain(cp.index)} x2={xMain(cp.index)} y1={0} y2={height} stroke={colors.borderStrong} strokeDasharray="4 4" strokeWidth={1} />
            )}
            {/* 오늘 지점 세로 구분선 — 본 추이(좌)와 작년 궤적(우)의 경계 */}
            {ov && <Line x1={xToday} x2={xToday} y1={0} y2={height} stroke={colors.borderDefault} strokeWidth={1} />}
            {/* 작년 같은 시기 — 점선, 오늘부터 오른쪽으로 */}
            {ovLine && (
              <Path d={ovLine} stroke={colors.textTertiary} strokeWidth={1.5} fill="none" strokeDasharray="4 4" />
            )}
            <Path d={line} stroke={c.main} strokeWidth={2} fill="none" />
            {cp && cpV != null && <Circle cx={xMain(cp.index)} cy={y(cpV)} r={3.5} fill={colors.textTertiary} />}
            {ov && <Circle cx={xOv(ov.length - 1)} cy={y(ovValues[ovValues.length - 1])} r={3} fill={colors.textTertiary} />}
            <Circle cx={xToday} cy={y(lastV)} r={4} fill={c.main} />
          </Svg>
        )}
        {/* 평년 값 — 가로 점선 위(좌측) */}
        {baseline != null && width > 0 && (
          <Text style={[styles.refLabel, tabularNums, { left: 0, top: clampY(y(baseline) - 8) }]}>
            {baselineLabel} {won(baseline)}원
          </Text>
        )}
        {/* 어제 값 — 세로 점선·점이 만나는 지점 왼쪽 */}
        {cp && cpV != null && width > 0 && (
          <Text style={[styles.refLabel, tabularNums, { right: width - xMain(cp.index) + 6, top: clampY(y(cpV) - 8) }]}>
            {cp.label} {won(cpV)}원
          </Text>
        )}
        {/* 작년 라벨 — 점선 끝(우측) 위 */}
        {ov && width > 0 && (
          <Text style={[styles.refLabel, { right: 0, top: clampY(y(ovValues[ovValues.length - 1]) - 8) }]}>작년</Text>
        )}
        {/* 오늘 값 — 마지막 점 위. overlay면 오늘이 중앙이라 점 위치에 맞춰 좌표 지정 */}
        {width > 0 && (
          <Text
            style={[
              styles.todayLabel,
              tabularNums,
              { top: clampY(y(lastV) - 22), color: c.main },
              ov ? { right: undefined, left: Math.max(0, Math.min(width - 80, xToday - 40)) } : { right: 0 },
            ]}
          >
            오늘 {won(lastV)}원
          </Text>
        )}
      </View>
      {/* x축 — overlay면 '오늘'을 세로선(2/3)에 맞춰 절대배치, 우측에 '작년 +2주' */}
      {width > 0 &&
        (ov ? (
          <View style={styles.dateRowRel}>
            <Text style={[styles.dateText, { position: 'absolute', left: 0 }]}>{series[0].date}</Text>
            <Text style={[styles.dateText, styles.dateToday, { left: xToday }]}>오늘</Text>
            <Text style={[styles.dateText, { position: 'absolute', right: 0 }]}>작년 +2주</Text>
          </View>
        ) : (
          <View style={styles.dateRow}>
            <Text style={styles.dateText}>{series[0].date}</Text>
            <Text style={styles.dateText}>오늘</Text>
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgSecondary, borderRadius: 8 },
  emptyText: { ...type.caption, color: colors.textTertiary } as const,
  // 기준 라벨(평년/어제) — 같은 스타일·색으로 통일. 라인과 겹쳐도 읽히도록 흰 배경.
  refLabel: {
    position: 'absolute',
    ...type.caption,
    color: colors.textSecondary,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 3,
    borderRadius: 3,
    overflow: 'hidden',
  } as const,
  todayLabel: { position: 'absolute', right: 0, ...type.label } as const,
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.s1 },
  // overlay용 — 절대배치로 '오늘'을 세로선(2/3)에 정렬
  dateRowRel: { height: 19, marginTop: spacing.s1 },
  dateToday: { position: 'absolute', transform: [{ translateX: -12 }] },
  dateText: { ...type.caption, color: colors.textTertiary } as const,
});
