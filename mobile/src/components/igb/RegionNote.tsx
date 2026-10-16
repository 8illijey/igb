import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, radius, spacing, type } from '../../theme/tokens';

// Figma info/fill 아이콘 path 그대로 (1205:8853)
const INFO_FILL =
  'M12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1ZM12 11C11.4477 11 11 11.4477 11 12V16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16V12C13 11.4477 12.5523 11 12 11ZM12 7C11.4477 7 11 7.44772 11 8C11 8.55228 11.4477 9 12 9H12.0098C12.5621 9 13.0098 8.55228 13.0098 8C13.0098 7.44772 12.5621 7 12.0098 7H12Z';

/**
 * 지역 미조사 안내 — 그 도시가 조사하지 않아 전국 값을 대신 보여줄 때.
 * Figma 1193:8791(박스) · 1212:11911(상세 배너). bleed=화면 폭 꽉 찬 각진 띠(탭 바로 위·아래).
 */
export function RegionNote({ text, bleed = false }: { text: string; bleed?: boolean }) {
  return (
    <View style={[styles.box, bleed && styles.bleed]}>
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Path d={INFO_FILL} fill={colors.textTertiary} />
      </Svg>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // bg/secondary, radius/m, 패딩 16·12, gap 12, 13/Regular text/secondary
  box: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s3,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s3,
    borderRadius: radius.m,
    backgroundColor: colors.bgSecondary,
  },
  bleed: { borderRadius: 0 },
  text: { ...type.size[13], ...type.w.regular, color: colors.textSecondary, flexShrink: 1 } as const,
});
