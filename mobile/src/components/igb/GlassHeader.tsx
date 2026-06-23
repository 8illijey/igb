import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * 상단 고정 글래스 헤더 — 콘텐츠가 아래로 스크롤되며 블러된다.
 * 절대배치로 화면 위에 떠 있으므로, 본문 ScrollView는 onHeight로 받은 높이만큼 paddingTop을 줘야 한다.
 * (Figma glass-blur-soft + surface/glass-light 근사)
 */
export function GlassHeader({
  children,
  onHeight,
}: {
  children: React.ReactNode;
  onHeight?: (h: number) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.fixed} onLayout={(e) => onHeight?.(e.nativeEvent.layout.height)}>
      <BlurView intensity={24} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.overlay} />
      <View style={{ paddingTop: insets.top }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  fixed: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, overflow: 'hidden' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.6)' },
});
