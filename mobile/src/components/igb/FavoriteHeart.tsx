import * as Haptics from 'expo-haptics';
import { Heart } from 'lucide-react-native';
import React from 'react';
import { Platform, Pressable, StyleProp, ViewStyle } from 'react-native';
import Reanimated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { colors, motion } from '../../theme/tokens';
import { easeOut } from './usePressScale';

/**
 * 관심(하트) 토글 — 상세·레시피 공용. 비대칭 피드백:
 * 추가는 pop 스프링 + 미디엄 햅틱, 제거는 조용한 복귀 + 셀렉션 햅틱. reduced motion이면 색 전환만.
 */
export function FavoriteHeart({
  fav,
  onToggle,
  size = 24,
  hitSlop = 8,
  style,
}: {
  fav: boolean;
  onToggle: () => void;
  size?: number;
  hitSlop?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const color = fav ? colors.iconActive : colors.iconInactive;
  const handle = () => {
    if (!fav) {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (!reduced) {
        scale.value = withSequence(
          withTiming(0.8, { duration: 80, easing: easeOut }),
          withSpring(1, { duration: 500, dampingRatio: 0.7 }),
        );
      }
    } else {
      if (Platform.OS !== 'web') Haptics.selectionAsync();
      if (!reduced) scale.value = withTiming(1, { duration: motion.fast });
    }
    onToggle();
  };
  return (
    <Pressable onPress={handle} hitSlop={hitSlop} style={style}>
      <Reanimated.View style={heartStyle}>
        <Heart size={size} color={color} fill={fav ? color : 'none'} strokeWidth={2} />
      </Reanimated.View>
    </Pressable>
  );
}
