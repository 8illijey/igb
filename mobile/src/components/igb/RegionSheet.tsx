import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { REGIONS } from '../../data/regions';
import { useRegion } from '../../store/region';
import { colors, radius, spacing, type } from '../../theme/tokens';
import { SearchField } from './SearchField';

// iOS식 easeOutQuint (tokens.motion.easeOutBezier). 올라올 땐 이 커브, 내려갈 땐 easeIn.
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

/**
 * 지역(내 도시) 선택 바텀시트. Figma 'bottom-sheet' + 'location-list' 반영.
 * Apple식 인터랙션: 스프링/ease-out 슬라이드업 · 백드롭 페이드 · 그래버 드래그로 닫기 ·
 * 선택 시 햅틱 · 눌림 하이라이트. 애니메이션은 transform/opacity만, useReducedMotion 게이트.
 */
export function RegionSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { region, setRegion } = useRegion();
  const [q, setQ] = useState('');
  const [render, setRender] = useState(visible); // 퇴장 애니 동안 언마운트를 늦춘다
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const { height: SCREEN_H } = useWindowDimensions();
  const ty = useSharedValue(SCREEN_H); // 시트 translateY (0=열림, SCREEN_H=화면 밖)

  const animateIn = () => {
    if (reduced) { ty.value = 0; return; }
    ty.value = withTiming(0, { duration: 360, easing: EASE_OUT });
  };
  const animateOut = (done: () => void) => {
    if (reduced) { ty.value = SCREEN_H; done(); return; }
    ty.value = withTiming(SCREEN_H, { duration: 260, easing: Easing.in(Easing.cubic) }, (fin) => {
      if (fin) runOnJS(done)();
    });
  };

  useEffect(() => {
    if (visible) setRender(true);
    else if (render) animateOut(() => setRender(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (render) animateIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [render]);

  const list = useMemo(() => {
    const t = q.trim();
    return t ? REGIONS.filter((r) => r.includes(t)) : REGIONS;
  }, [q]);

  const pick = (name: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setRegion(name);
    setQ('');
    onClose();
  };

  // 그래버/헤더에서만 드래그 — 목록 스크롤과 충돌 방지
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      ty.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 100 || e.velocityY > 700) runOnJS(onClose)();
      else ty.value = withSpring(0, { damping: 18, stiffness: 180, mass: 0.6 });
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }] }));
  const scrimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ty.value, [0, SCREEN_H], [0.5, 0], Extrapolation.CLAMP),
  }));

  return (
    <Modal visible={render} transparent animationType="none" onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.root}>
        <Animated.View style={[styles.scrim, scrimStyle]} pointerEvents="none" />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="닫기" />
        <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom }, sheetStyle]}>
          <GestureDetector gesture={pan}>
            <View>
              <View style={styles.grabberZone}>
                <View style={styles.grabber} />
              </View>
              <View style={styles.headerRow}>
                {/* 닫기 버튼 44×44 (접근성 터치 타깃). 안의 X 아이콘은 Figma대로 20슬롯/10px */}
                <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn} accessibilityLabel="닫기">
                  {/* Figma close(1118:8670): 20 슬롯 안 10px X(5~15), stroke 1.667 round, text/secondary */}
                  <Svg width={20} height={20} viewBox="0 0 20 20">
                    <Path d="M5 5L15 15M15 5L5 15" stroke={colors.textSecondary} strokeWidth={1.667} strokeLinecap="round" />
                  </Svg>
                </Pressable>
                <Text style={styles.title}>지역 선택</Text>
                <View style={styles.closeBtn} />
              </View>
            </View>
          </GestureDetector>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          >
            {list.map((name, i) => {
              const selected = name === region;
              return (
                <View key={name}>
                  <Pressable
                    onPress={() => pick(name)}
                    style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text style={[styles.rowLabel, selected && styles.rowLabelSel]}>{name}</Text>
                    {selected && <Check size={18} color={colors.borderPrimary} strokeWidth={2.5} />}
                  </Pressable>
                  {i < list.length - 1 && <View style={styles.divider} />}
                </View>
              );
            })}
            {list.length === 0 && <Text style={styles.empty}>검색 결과가 없어요</Text>}
          </ScrollView>

          <View style={styles.searchWrap}>
            <SearchField value={q} onChangeText={setQ} onClear={() => setQ('')} placeholder="검색" />
          </View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '85%',
    backgroundColor: colors.bgCanvas,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    // 웹: 앱 프레임(_layout.tsx maxWidth 480)과 같은 폭으로 가운데. 네이티브는 기기 폭 그대로.
    ...Platform.select({ web: { maxWidth: 480, marginHorizontal: 'auto' as const }, default: {} }),
  },
  // Figma grabber-zone: height 15, 그래버 중앙정렬
  grabberZone: { height: 15, alignItems: 'center', justifyContent: 'center' },
  grabber: { width: 36, height: 4, borderRadius: radius.full, backgroundColor: colors.borderDefault },
  // Figma body: paddingTop 8, 제목 중앙 · close 좌측(x12)
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.s2,
    paddingHorizontal: spacing.s3,
  },
  closeBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { ...type.size[17], ...type.w.semibold, color: colors.textPrimary },
  // Figma: 제목→목록 gap 16, 목록은 좌우 16 인셋(선택 배경·구분선이 끝까지 안 가고 들여짐)
  list: { flexShrink: 1, marginTop: spacing.s4 },
  listContent: { paddingHorizontal: spacing.s4 },
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowPressed: { backgroundColor: colors.bgSecondary },
  rowLabel: { ...type.size[15], ...type.w.regular, color: colors.textPrimary },
  rowLabelSel: { ...type.w.semibold },
  divider: { height: 1, backgroundColor: colors.borderDefault },
  empty: {
    ...type.size[15],
    ...type.w.regular,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: spacing.s8,
  },
  searchWrap: { paddingHorizontal: spacing.s4, paddingTop: spacing.s3, paddingBottom: spacing.s3 },
});
