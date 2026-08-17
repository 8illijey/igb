import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, font, motion, radius, spacing } from '../../theme/tokens';
import { easeOut } from './usePressScale';

interface Option<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/**
 * IGB Tab (Figma 704-4140).
 * - variant 'underline' (size l): 풀폭 2탭 — 활성 = 진한 텍스트 + 2px 밑줄, 비활성 = 회색. 하단 0.5px 헤어라인.
 * - variant 'pill' (size s): 작은 토글 — 선택 = 연한 pill 배경(bgSecondary). 좌측 정렬.
 * 가로 패딩 없음 — 부모(content 패딩)에 맞춘다.
 */
export function Tabs<T extends string>({
  value,
  options,
  onChange,
  variant = 'underline',
}: {
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  variant?: 'underline' | 'pill';
}) {
  if (variant === 'pill') {
    return <PillTabs value={value} options={options} onChange={onChange} />;
  }
  return <UnderlineTabs value={value} options={options} onChange={onChange} />;
}

/** 선택 인디케이터가 칸 사이를 슬라이드하는 공용 훅 — 칸 위치는 onLayout 실측(gap 있어 계산식 대신). */
function useIndicator<T extends string>(options: Option<T>[], value: T) {
  const reduced = useReducedMotion();
  const x = useSharedValue(0);
  const w = useSharedValue(0);
  const mounted = React.useRef(false);
  const [cols, setCols] = React.useState<Record<number, { x: number; width: number }>>({});
  const idx = Math.max(0, options.findIndex((o) => o.value === value));

  React.useEffect(() => {
    const c = cols[idx];
    if (!c) return;
    if (!mounted.current || reduced) {
      x.value = c.x;
      w.value = c.width;
      mounted.current = true;
    } else {
      const cfg = { duration: motion.base, easing: easeOut };
      x.value = withTiming(c.x, cfg);
      w.value = withTiming(c.width, cfg);
    }
  }, [idx, cols, reduced]);

  const onColLayout = (i: number) => (e: { nativeEvent: { layout: { x: number; width: number } } }) => {
    const { x: lx, width } = e.nativeEvent.layout;
    setCols((c) => (c[i]?.x === lx && c[i]?.width === width ? c : { ...c, [i]: { x: lx, width } }));
  };
  return { x, w, cols, idx, onColLayout };
}

/** pill variant — 선택 pill(연한 배경)이 칸 사이를 슬라이드. */
function PillTabs<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
}) {
  const { x, w, cols, idx, onColLayout } = useIndicator(options, value);
  const pillStyle = useAnimatedStyle(() => ({ width: w.value, transform: [{ translateX: x.value }] }));
  return (
    <View style={styles.pillRow}>
      {cols[idx] && <Animated.View style={[styles.pillSelected, styles.pillIndicator, pillStyle]} />}
      {options.map((o, i) => (
        <Pressable
          key={o.value}
          disabled={o.disabled}
          onPress={() => onChange(o.value)}
          onLayout={onColLayout(i)}
          style={[styles.pill, o.disabled && { opacity: 0.4 }]}
        >
          <Text style={styles.pillLabel}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** 밑줄 variant — 활성 밑줄 1개가 탭 사이를 슬라이드. 칸 위치는 onLayout으로 실측(gap 있어 계산식 대신). */
function UnderlineTabs<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
}) {
  const { x, w, cols, idx, onColLayout } = useIndicator(options, value);
  const barStyle = useAnimatedStyle(() => ({ width: w.value, transform: [{ translateX: x.value }] }));

  return (
    <View style={styles.underlineRow}>
      {options.map((o, i) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            disabled={o.disabled}
            onPress={() => onChange(o.value)}
            onLayout={onColLayout(i)}
            style={[styles.underlineCol, o.disabled && { opacity: 0.4 }]}
          >
            <View style={styles.underlineTextWrap}>
              <Text style={[styles.underlineLabel, { color: selected ? colors.textPrimary : colors.textTertiary }]}>
                {o.label}
              </Text>
            </View>
            <View style={styles.underlineBar} />
          </Pressable>
        );
      })}
      {cols[idx] && <Animated.View style={[styles.underlineBarActive, barStyle]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  // 소매/도매 — 풀폭 밑줄 탭 (하단 헤어라인은 부모가 full-bleed로 그림)
  underlineRow: {
    flexDirection: 'row',
    gap: spacing.s4,
  },
  underlineCol: { flex: 1, gap: spacing.s1, alignItems: 'stretch' },
  underlineTextWrap: { height: 44, alignItems: 'center', justifyContent: 'center' },
  underlineLabel: { fontSize: 16, lineHeight: 22.5, fontFamily: font.semibold } as const,
  underlineBar: { height: 2, borderRadius: radius.full, backgroundColor: 'transparent' },
  underlineBarActive: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    borderRadius: radius.full,
    backgroundColor: colors.textPrimary,
  },
  // 일반/유기농·무농약 — 작은 pill 토글
  pillRow: { flexDirection: 'row', gap: spacing.s2, alignSelf: 'flex-start' },
  pill: { paddingHorizontal: spacing.s2, paddingVertical: spacing.s2, borderRadius: radius.s },
  pillSelected: { backgroundColor: colors.bgSecondary },
  // 슬라이드하는 선택 pill 배경 — 라벨 아래 절대배치(실측 x/width로 이동)
  pillIndicator: { position: 'absolute', top: 0, bottom: 0, left: 0, borderRadius: radius.s },
  pillLabel: { fontSize: 13, lineHeight: 16.25, fontFamily: font.semibold, color: colors.textTertiary } as const,
});
