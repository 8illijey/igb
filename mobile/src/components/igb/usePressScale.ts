import { useState } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { motion } from '../../theme/tokens';

export const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const easeOut = Easing.bezier(...motion.easeOutBezier);

/**
 * press-in 0.97 스케일 — 전역 공용 press 피드백.
 * reduced motion이면 스케일 생략(색·opacity 피드백은 호출부의 pressed 조건부 스타일이 담당).
 * Pressable의 함수형 style은 reanimated 스타일과 못 섞이므로 pressed를 state로도 돌려준다.
 */
export function usePressScale() {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const [pressed, setPressed] = useState(false);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const onPressIn = () => {
    setPressed(true);
    if (!reduced) scale.value = withTiming(0.97, { duration: motion.fast, easing: easeOut });
  };
  const onPressOut = () => {
    setPressed(false);
    if (!reduced) scale.value = withTiming(1, { duration: 180, easing: easeOut });
  };
  return { style, pressed, onPressIn, onPressOut };
}
