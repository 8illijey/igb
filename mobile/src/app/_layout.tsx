import { useFonts } from 'expo-font';
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
  const [loaded] = useFonts({
    'Pretendard-Regular': require('../../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-SemiBold': require('../../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('../../assets/fonts/Pretendard-Bold.otf'),
    'Pretendard-ExtraBold': require('../../assets/fonts/Pretendard-ExtraBold.otf'),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

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
