import { ArrowDown, ArrowUp, Minus } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { font, signal, SignalLevel, spacing } from '../../theme/tokens';

const ICONS = { cheap: ArrowDown, fair: Minus, expensive: ArrowUp } as const;

/** 평년 대비 변화율 — 화살표 + % (신호색, 배경 없음) */
export function ChangeIndicator({
  level,
  pct,
  size = 's',
}: {
  level: SignalLevel;
  pct: number | null;
  size?: 's' | 'm';
}) {
  const c = signal[level].main;
  const Icon = ICONS[level];
  return (
    <View style={styles.row}>
      <Icon size={size === 's' ? 16 : 20} color={c} strokeWidth={2} />
      {pct != null && (
        <Text style={[styles.pct, { color: c, fontSize: size === 's' ? 13 : 15 }]}>
          {Math.abs(pct)}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.s1 },
  pct: { fontFamily: font.semibold },
});
