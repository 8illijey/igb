import { LucideIcon, SearchX } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, type } from '../../theme/tokens';

interface Props {
  icon?: LucideIcon;
  title: string;
  description?: string;
}

/** 데이터 부재를 추측 없이 솔직히 알린다. 신호색 금지 — 무채색 전용. */
export function EmptyState({ icon: Icon = SearchX, title, description }: Props) {
  return (
    <View style={styles.wrap}>
      <Icon size={32} color={colors.iconInactive} strokeWidth={2} />
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.desc}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: spacing.s10, gap: spacing.s2 },
  title: { ...type.size[15], ...type.w.regular, color: colors.textSecondary, marginTop: spacing.s2 } as const,
  desc: { ...type.size[13], ...type.w.regular, color: colors.textTertiary, textAlign: 'center' } as const,
});
