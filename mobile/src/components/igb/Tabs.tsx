import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../../theme/tokens';

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
    return (
      <View style={styles.pillRow}>
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <Pressable
              key={o.value}
              disabled={o.disabled}
              onPress={() => onChange(o.value)}
              style={[styles.pill, selected && styles.pillSelected, o.disabled && { opacity: 0.4 }]}
            >
              <Text style={styles.pillLabel}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  }
  return (
    <View style={styles.underlineRow}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            disabled={o.disabled}
            onPress={() => onChange(o.value)}
            style={[styles.underlineCol, o.disabled && { opacity: 0.4 }]}
          >
            <View style={styles.underlineTextWrap}>
              <Text style={[styles.underlineLabel, { color: selected ? colors.textPrimary : colors.textTertiary }]}>
                {o.label}
              </Text>
            </View>
            <View style={[styles.underlineBar, selected && { backgroundColor: colors.textPrimary }]} />
          </Pressable>
        );
      })}
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
  // 일반/유기농·무농약 — 작은 pill 토글
  pillRow: { flexDirection: 'row', gap: spacing.s2, alignSelf: 'flex-start' },
  pill: { paddingHorizontal: spacing.s2, paddingVertical: spacing.s2, borderRadius: radius.s },
  pillSelected: { backgroundColor: colors.bgSecondary },
  pillLabel: { fontSize: 13, lineHeight: 16.25, fontFamily: font.semibold, color: colors.textTertiary } as const,
});
