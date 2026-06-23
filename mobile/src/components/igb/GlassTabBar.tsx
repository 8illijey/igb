import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, palette, radius, shadow, spacing } from '../../theme/tokens';
import { HeartIcon, HouseIcon, RecipeIcon } from './TabIcons';

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

/** iOS 26 글래스 필 근사 — 플로팅 + blur + 선택 pill. Figma Tab Bar 기준. */
export function GlassTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, spacing.s3) }]} pointerEvents="box-none">
      <BlurView intensity={40} tint="light" style={styles.pill}>
        <View style={styles.pillOverlay} />
        {state.routes.map((route, idx) => {
          const meta = TAB_META[route.name];
          if (!meta) return null;
          const selected = state.index === idx;
          const Icon = meta.icon;
          // 선택 시 디자인시스템 primary, 비선택은 inactive. fill=선택, stroke=비선택
          const color = selected ? palette.brandPrimary : colors.iconInactive;
          return (
            <Pressable
              key={route.key}
              style={[styles.tab, selected && styles.tabSelected]}
              onPress={() => {
                const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!selected && !e.defaultPrevented) navigation.navigate(route.name);
              }}
            >
              <Icon size={24} color={color} filled={selected} />
              <Text style={[styles.label, { color }]}>{meta.label}</Text>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
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
  label: { fontSize: 10, fontFamily: font.semibold },
});
