import { Repeat } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, type } from '../../theme/tokens';
import { AnimatedPressable, usePressScale } from './usePressScale';

export type ComparisonBasis = 'vsNormal' | 'vsYesterday';

const LABEL: Record<ComparisonBasis, string> = {
  vsNormal: '이맘때 대비',
  vsYesterday: '어제 대비',
};

/**
 * 비교 기준 전환(H2 검증 동선). 탭 즉시 같은 데이터의 신호·%가 전환된다.
 * 시스템 컨트롤 — 신호색 금지.
 */
export function ComparisonToggle({
  value,
  onChange,
}: {
  value: ComparisonBasis;
  onChange: (v: ComparisonBasis) => void;
}) {
  const press = usePressScale();
  return (
    <AnimatedPressable
      onPress={() => onChange(value === 'vsNormal' ? 'vsYesterday' : 'vsNormal')}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      style={[styles.base, press.pressed && { opacity: 0.7 }, press.style]}
      hitSlop={6}
    >
      <Repeat size={16} color={colors.textSecondary} strokeWidth={2} />
      <Text style={styles.label}>{LABEL[value]}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s1,
    paddingHorizontal: spacing.s3,
    paddingVertical: spacing.s2,
    borderRadius: radius.full,
    backgroundColor: colors.bgSecondary,
    alignSelf: 'flex-start',
  },
  label: { ...type.size[13], ...type.w.semibold, color: colors.textSecondary } as const,
});
