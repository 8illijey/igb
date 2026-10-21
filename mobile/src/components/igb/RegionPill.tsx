import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRegion } from '../../store/region';
import { colors, spacing, type } from '../../theme/tokens';
import { RegionSheet } from './RegionSheet';

/**
 * 메인 헤더 우측 📍지역 버튼 + 지역 바텀시트. 홈·레시피 탭이 같은 헤더를 쓴다 —
 * 레시피 판정도 고른 도시 가격을 따르므로(2026-10-22) 거기서도 지역을 바꿀 수 있어야 한다.
 */
export function RegionPill() {
  const [open, setOpen] = useState(false);
  const { region } = useRegion();
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={6}
        style={styles.pill}
        accessibilityRole="button"
        accessibilityLabel={`지역 ${region}, 변경하기`}
      >
        {/* 메인헤더 location 컴포넌트의 map-pin/fill 아이콘(Figma 1099:7802에서 export) */}
        <Svg width={15} height={18} viewBox="0 0 14 17">
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7 0C8.85652 0 10.6374 0.73705 11.9502 2.0498C13.2629 3.36256 14 5.14348 14 7C14 9.2095 12.793 11.3412 11.5439 12.9824C10.2716 14.6541 8.82718 15.9825 8.10449 16.6064C8.08748 16.6211 8.06972 16.6349 8.05176 16.6484C7.74852 16.8765 7.3794 17 7 17C6.6206 17 6.25148 16.8765 5.94824 16.6484C5.93028 16.6349 5.91252 16.6211 5.89551 16.6064C5.17282 15.9825 3.72835 14.6541 2.45605 12.9824C1.20697 11.3412 0 9.2095 0 7C0 5.14348 0.73705 3.36256 2.0498 2.0498C3.36256 0.73705 5.14348 0 7 0ZM7 4.75C5.75736 4.75 4.75 5.75736 4.75 7C4.75 8.24264 5.75736 9.25 7 9.25C8.24264 9.25 9.25 8.24264 9.25 7C9.25 5.75736 8.24264 4.75 7 4.75Z"
            fill={colors.textPrimary}
          />
        </Svg>
        <Text style={styles.text}>{region}</Text>
      </Pressable>
      <RegionSheet visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s1,
    // Figma location: 내부 패딩 0, 우측 여백은 헤더 거터(앱 기존 거터 16과 맞춤)
    paddingRight: spacing.s4,
  },
  text: { ...type.size[17], ...type.w.semibold, color: colors.textPrimary },
});
