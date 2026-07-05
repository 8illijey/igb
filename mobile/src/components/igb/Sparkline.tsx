import React from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { SeriesPoint, won } from '../../api/kamis';
import { colors, signal, SignalLevel, spacing, type } from '../../theme/tokens';
import { Tooltip, TooltipPosition } from './Tooltip';

const CUR_YEAR = String(new Date().getFullYear());
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
  // 가로 드래그만 캡처 → 세로 스크롤은 부모로 통과. 손 떼면 '오늘'로 복귀.
  const pan = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 4,
        onPanResponderGrant: (e) => setSel(idxFromX(e.nativeEvent.locationX)),
        onPanResponderMove: (e) => setSel(idxFromX(e.nativeEvent.locationX)),
        onPanResponderRelease: () => setSel(null),
        onPanResponderTerminate: () => setSel(null),
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
  // 마지막 조사가 오래됐으면(친환경 등 최근 조사 없음) '오늘 시세' 대신 실제 조사날짜로 표기.
  const lastP = series[values.length - 1];
  const lastAge = lastP.year ? (Date.now() - Date.parse(`${lastP.year}/${lastP.date}`)) / 86400000 : 0;
  const stale = lastAge > 14; // 2주 넘게 최신 조사 없음
  const todayLabel = stale ? fmtDate(lastP) : '오늘 시세';
  const endAxisLabel = stale ? fmtDate(lastP) : '오늘';
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
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.s1 },
  dateText: { ...type.size[13], ...type.w.regular, color: colors.textTertiary } as const,
});
