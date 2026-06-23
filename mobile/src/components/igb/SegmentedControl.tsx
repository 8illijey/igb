import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing, type } from '../../theme/tokens';

interface Option<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/** 상호배타 뷰 전환 — track 위 선택 pill. */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.track}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            disabled={o.disabled}
            onPress={() => onChange(o.value)}
            style={[styles.segment, selected && styles.pill, o.disabled && { opacity: 0.4 }]}
          >
            <Text style={[styles.label, { color: selected ? colors.textPrimary : colors.textTertiary }]}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.full,
    padding: spacing.s1,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.s2,
    borderRadius: radius.full,
  },
  pill: {
    backgroundColor: colors.bgElevated,
    ...shadow.s1, // elevation-1
  },
  label: { ...type.label } as const, // Figma 실값: 13 SemiBold
});
