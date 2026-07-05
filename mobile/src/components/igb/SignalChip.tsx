import { ArrowDown, ArrowRight, ArrowUp, Minus } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { font, radius, signal, SignalLevel, spacing, type } from '../../theme/tokens';

const ICONS = { cheap: ArrowDown, fair: Minus, expensive: ArrowUp } as const;
/** xs(사진 오버레이)에서는 fair가 minus가 아니라 → (Figma signal-chip size=xs) */
const ICONS_XS = { cheap: ArrowDown, fair: ArrowRight, expensive: ArrowUp } as const;
const DEFAULT_LABEL = { cheap: '싼 편', fair: '적정', expensive: '비싼 편' } as const;

interface Props {
  level: SignalLevel;
  /** s/m: weak 배경 + 신호색 콘텐츠. xs: solid 신호색 배경 + 흰 콘텐츠 (사진 오버레이) */
  size?: 'xs' | 's' | 'm';
  label?: string;
  /** 행 우측 배지 — 라벨 숨기고 화살표만 (Figma price-list-row) */
  iconOnly?: boolean;
  /** 화살표 아이콘 + 라벨 (Figma 홈 hero·썸네일 칩). 기본은 라벨만(상세·레시피 칩). */
  showArrow?: boolean;
}

export function SignalChip({ level, size = 's', label, iconOnly, showArrow }: Props) {
  const c = signal[level];
  const solid = size === 'xs';
  const Icon = solid ? ICONS_XS[level] : ICONS[level];
  const iconSize = size === 'xs' ? 12 : size === 's' ? 16 : 20;
  const fg = solid ? c.on : c.main;
  const showIcon = iconOnly || showArrow;
  return (
    <View
      style={[
        styles.base,
        solid ? styles.xs : size === 's' ? styles.s : styles.m,
        { backgroundColor: solid ? c.main : c.weak },
      ]}
    >
      {showIcon && <Icon size={iconSize} color={fg} strokeWidth={2} />}
      {!iconOnly && (
        <Text style={[solid ? styles.xsLabel : styles.label, { color: fg }]}>
          {label ?? DEFAULT_LABEL[level]}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.s1,
  },
  xs: { padding: spacing.s1, borderRadius: radius.xs, gap: 2 },
  s: { paddingHorizontal: spacing.s2, paddingVertical: spacing.s1, borderRadius: radius.full },
  m: { paddingHorizontal: spacing.s3, paddingVertical: spacing.s2, borderRadius: radius.full },
  label: { fontSize: type.size[13].fontSize, fontFamily: font.semibold },
  xsLabel: { fontSize: 10, fontFamily: font.semibold },
});
