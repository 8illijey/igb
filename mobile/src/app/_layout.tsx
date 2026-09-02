import { FontDisplay, useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { FavoritesProvider } from '../store/favorites';
import { PricesProvider } from '../store/prices';
import { RecentSearchesProvider } from '../store/recentSearches';
import { colors } from '../theme/tokens';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // woff2 — OTF 4종 6.01MB가 전부 받혀야 했던 걸 2.99MB로 줄였다(metro.config.js에 assetExts 추가).
  // ExtraBold는 워드마크가 SVG로 바뀐 뒤 참조가 없어 제거(~750KB).
  // display: SWAP — 기본 auto는 폰트 로드까지 텍스트를 숨겨, SSG로 미리 그린 화면이
  // 슬로우 4G에서 6초간 백지였다(2026-09-03 PSI FCP 5.9s). 시스템 폰트로 먼저 그린다.
  // 웹은 여기서 로드하지 않는다 — 전체 글리프 2.2MB 대신 동적 서브셋 CSS가
  // 같은 가족명으로 필요한 조각만 내려준다(+html.tsx, public/fonts/pretendard-subset.css).
  const swap = (uri: number) => ({ uri, display: FontDisplay.SWAP });
  const [loaded] = useFonts(
    Platform.OS === 'web'
      ? {}
      : {
          'Pretendard-Regular': swap(require('../../assets/fonts/Pretendard-Regular.woff2')),
          'Pretendard-SemiBold': swap(require('../../assets/fonts/Pretendard-SemiBold.woff2')),
          'Pretendard-Bold': swap(require('../../assets/fonts/Pretendard-Bold.woff2')),
        },
  );

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  // 폰트를 기다리며 화면을 비워두지 않는다. 예전엔 여기서 null을 되돌려
  // 한글 폰트 수 MB가 다 받아질 때까지 빈 화면이었다 — 처음 들어올 때 로딩이 길던 주원인(2026-08-20).
  // 웹은 폰트가 없어도 시스템 산세리프로 먼저 그려지고(FOUT) 로드되면 자연스럽게 바뀌므로
  // 기다릴 이유가 없다. 네이티브는 미로드 패밀리가 빈 화면으로 보일 수 있어 기존대로 기다린다.
  if (!loaded && Platform.OS !== 'web') return null;

  return (
    <PricesProvider>
      <FavoritesProvider>
        <RecentSearchesProvider>
        <StatusBar style="dark" />
        {/* 웹: 바깥 여백(gutter) 옅은 회색 + 폰 폭(min 375 / max 480) 흰 프레임 가운데. 네이티브는 기기 폭 그대로. */}
        <View style={styles.gutter}>
          <View style={styles.appFrame}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bgCanvas },
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="search" options={{ animation: 'fade_from_bottom' }} />
              <Stack.Screen name="item/[key]" />
              <Stack.Screen name="recipe/[id]" />
            </Stack>
          </View>
        </View>
        </RecentSearchesProvider>
      </FavoritesProvider>
    </PricesProvider>
  );
}

const styles = StyleSheet.create({
  // 바깥 여백 — 웹에서만 회색이 보이고(앱 프레임 양옆), 네이티브는 프레임이 꽉 차 가려진다.
  gutter: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
    ...Platform.select({ web: { alignItems: 'center' }, default: {} }),
  },
  appFrame: {
    flex: 1,
    backgroundColor: colors.bgCanvas,
    width: '100%',
    ...Platform.select({
      web: { minWidth: 375, maxWidth: 480 },
      default: {},
    }),
  },
});
