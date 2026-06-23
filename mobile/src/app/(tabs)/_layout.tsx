import { Tabs } from 'expo-router';
import React from 'react';
import { GlassTabBar } from '../../components/igb/GlassTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar state={props.state} navigation={props.navigation as never} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: '홈' }} />
      <Tabs.Screen name="favorites" options={{ title: '관심품목' }} />
      <Tabs.Screen name="recipes" options={{ title: '레시피' }} />
    </Tabs>
  );
}
