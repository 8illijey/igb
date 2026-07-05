import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, opacity, palette, radius, type } from '../../theme/tokens';

// quiet: 여백 없는 muted 텍스트 버튼(예: '전체 삭제'). Figma button variant=quiet 와 1:1.
type Variant = 'primary' | 'secondary' | 'ghost' | 'quiet';
type Size = 'xl' | 'l' | 'm' | 's';

const HEIGHT: Record<Size, number> = { xl: 56, l: 48, m: 40, s: 32 };
const RADIUS: Record<Size, number> = { xl: radius.m, l: radius.m, m: radius.s, s: radius.s };
const LABEL: Record<Size, object> = {
  xl: { ...type.size[17], ...type.w.bold },
  l: { ...type.size[15], ...type.w.bold },
  m: { ...type.size[15], ...type.w.semibold },
  s: { ...type.size[13], ...type.w.semibold },
};

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  style?: ViewStyle;
}

export function IGButton({
  label,
  onPress,
  variant = 'primary',
  size = 'l',
  disabled,
  style,
}: Props) {
  const bg =
    variant === 'primary'
      ? palette.brandPrimary
      : variant === 'secondary'
        ? colors.bgSecondary
        : 'transparent';
  const fg =
    variant === 'primary'
      ? palette.white
      : variant === 'secondary'
        ? colors.textPrimary
        : variant === 'quiet'
          ? colors.textTertiary
          : palette.brandPrimary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { height: HEIGHT[size], borderRadius: RADIUS[size], backgroundColor: bg },
        // quiet은 텍스트 링크 — 가로 패딩 제거(hug)
        variant === 'quiet' && { paddingHorizontal: 0 },
        pressed && variant === 'primary' && { backgroundColor: palette.brandPrimaryAlt },
        pressed && variant !== 'primary' && { opacity: 0.85 },
        disabled && { opacity: opacity.disabled },
        style,
      ]}
    >
      <Text style={[LABEL[size] as object, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

/** 게스트 1차 액션(H4) — button l/primary 시맨틱 래퍼. 신호색 금지. */
export function GuestCTA({ label = '바로 시세 보기', onPress }: { label?: string; onPress?: () => void }) {
  return <IGButton label={label} onPress={onPress} variant="primary" size="l" style={{ alignSelf: 'stretch' }} />;
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});
