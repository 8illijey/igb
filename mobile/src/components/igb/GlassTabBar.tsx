import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, motion, palette, radius, shadow, spacing } from '../../theme/tokens';
import { HeartIcon, HouseIcon, RecipeIcon } from './TabIcons';
import { AnimatedPressable, usePressScale } from './usePressScale';
import { easeOut } from './usePressScale';

type TabIcon = (p: { size?: number; color: string; filled?: boolean }) => React.ReactElement;
const TAB_META: Record<string, { label: string; icon: TabIcon }> = {
  index: { label: '홈', icon: HouseIcon },
  favorites: { label: '관심목록', icon: HeartIcon },
  recipes: { label: '레시피', icon: RecipeIcon },
};

interface TabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (e: { type: string; target: string; canPreventDefault: boolean }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
}

/** iOS 26 글래스 필 근사 — 플로팅 + blur + 선택 pill이 탭 사이를 슬라이드. Figma Tab Bar 기준. */
export function GlassTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const tabs = state.routes.filter((r) => TAB_META[r.name]);
  const [cols, setCols] = React.useState<Record<number, { x: number; width: number }>>({});
  const x = useSharedValue(0);
  const w = useSharedValue(0);
  const mounted = React.useRef(false);

  React.useEffect(() => {
    const c = cols[state.index];
    if (!c) return;
    if (!mounted.current || reduced) {
      x.value = c.x;
      w.value = c.width;
      mounted.current = true;
    } else {
      const cfg = { duration: motion.base, easing: easeOut };
      x.value = withTiming(c.x, cfg);
      w.value = withTiming(c.width, cfg);
    }
  }, [state.index, cols, reduced]);

  const indicatorStyle = useAnimatedStyle(() => ({ width: w.value, transform: [{ translateX: x.value }] }));

  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, spacing.s3) }]} pointerEvents="box-none">
      <BlurView intensity={40} tint="light" style={styles.pill}>
        <View style={styles.pillOverlay} />
        {cols[state.index] && <Animated.View style={[styles.tabSelected, styles.indicator, indicatorStyle]} />}
        {state.routes.map((route, idx) => {
          const meta = TAB_META[route.name];
          if (!meta) return null;
          const selected = state.index === idx;
          return (
            <TabButton
              key={route.key}
              meta={meta}
              selected={selected}
              onLayout={(e) => {
                const { x: lx, width } = e.nativeEvent.layout;
                setCols((c) => (c[idx]?.x === lx && c[idx]?.width === width ? c : { ...c, [idx]: { x: lx, width } }));
              }}
              onPress={() => {
                const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!selected && !e.defaultPrevented) navigation.navigate(route.name);
              }}
            />
          );
        })}
      </BlurView>
    </View>
  );
}

/** 개별 탭 — press 스케일 피드백. 선택 배경은 부모의 슬라이드 인디케이터가 담당. */
function TabButton({
  meta,
  selected,
  onPress,
  onLayout,
}: {
  meta: { label: string; icon: TabIcon };
  selected: boolean;
  onPress: () => void;
  onLayout: (e: { nativeEvent: { layout: { x: number; width: number } } }) => void;
}) {
  const press = usePressScale();
  const Icon = meta.icon;
  // 선택 시 디자인시스템 primary, 비선택은 inactive. fill=선택, stroke=비선택
  const color = selected ? palette.brandPrimary : colors.iconInactive;
  return (
    <AnimatedPressable
      style={[styles.tab, press.style]}
      onLayout={onLayout}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
    >
      <Icon size={24} color={color} filled={selected} />
      <Text style={[styles.label, { color }]}>{meta.label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    // 웹은 fixed — iOS 사파리는 fixed 요소를 '보이는 영역' 기준으로 놓아
    // 하단 주소창 위에 앉힌다. absolute로 두면 주소창에 걸려 잘렸다(2026-08-24 제보).
    position: (Platform.OS === 'web' ? 'fixed' : 'absolute') as 'absolute',
    left: spacing.s6,
    right: spacing.s6,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    borderRadius: radius.full,
    overflow: 'hidden',
    padding: spacing.s1,
    width: '100%',
    ...Platform.select({
      android: { backgroundColor: 'rgba(255,255,255,0.92)' },
    }),
    ...shadow.glassFloating, // Figma shadow-glass-floating 실값
  },
  pillOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surfaceGlassLight, // surface/glass-light
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: spacing.s2,
    borderRadius: radius.full,
  },
  tabSelected: { backgroundColor: colors.bgTertiary },
  // 슬라이드하는 선택 배경 — 탭 아래 절대배치(padding 안쪽, 실측 x/width로 이동)
  indicator: { position: 'absolute', top: spacing.s1, bottom: spacing.s1, left: 0, borderRadius: radius.full },
  label: { fontSize: 10, fontFamily: font.semibold },
});
