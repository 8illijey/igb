import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { won } from '../../api/kamis';
import { thumbFor } from '../../thumbnails';
import { colors, radius, SignalLevel, spacing, type } from '../../theme/tokens';
import { SignalChip } from './SignalChip';
import { AnimatedPressable, usePressScale } from './usePressScale';

interface Props {
  name: string;
  price: number | null;
  unit: string;
  level: SignalLevel | null;
  /** 품목코드 — 생성된 썸네일 매핑. 없으면 placeholder */
  itemCode?: string;
  /** 종류코드 — 있으면 종류별 썸네일 우선(예: 소고기 안심/양지) */
  kindCode?: string;
  onPress?: () => void;
}

/**
 * 품목 스캔 리스트 행 — Figma price-list-row 1:1.
 * 좌: 40 썸네일 + 품목명(15 Regular) / 우: 가격(15 Regular)+단위 + 아이콘-only 신호 배지.
 */
export function PriceListRow({ name, price, unit, level, itemCode, kindCode, onPress }: Props) {
  const thumb = itemCode ? thumbFor({ itemCode, kindCode }) : undefined;
  const press = usePressScale();
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      style={[styles.row, press.pressed && { backgroundColor: colors.overlayPress }, press.style]}
    >
      <View style={styles.left}>
        {thumb ? (
          <Image source={thumb} style={styles.thumbnail} contentFit="cover" />
        ) : (
          <View style={styles.thumbnail} />
        )}
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
      </View>
      <View style={styles.right}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{won(price)}</Text>
          <Text style={styles.unit}>원 / {unit}</Text>
        </View>
        {level && <SignalChip level={level} size="s" iconOnly />}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    // Figma price-list-row 컴포넌트 = 고정 48(콘텐츠 40 중앙정렬). rank-item 등도 이 높이를 따른다.
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.s2,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.s3, flexShrink: 1 },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: radius.s,
    backgroundColor: colors.borderDefault,
  },
  name: { ...type.size[15], ...type.w.regular, color: colors.textPrimary, flexShrink: 1 } as const,
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.s2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.s1 },
  price: { ...type.size[15], ...type.w.regular, color: colors.textPrimary } as const,
  unit: { ...type.size[15], ...type.w.regular, color: colors.priceUnit } as const,
});
