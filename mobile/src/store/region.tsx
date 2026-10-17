import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { track } from '../analytics';
import { NATIONWIDE } from '../data/regions';

// 선택 지역(도시명) 저장. favorites.tsx와 같은 패턴.
const STORAGE_KEY = 'igb.region.v1';

interface RegionState {
  /** 선택한 도시명. '전국'이면 전국 평균(기본). */
  region: string;
  setRegion: (name: string) => void;
}

const Ctx = createContext<RegionState | null>(null);

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegionState] = useState<string>(NATIONWIDE);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setRegionState(raw);
    });
  }, []);

  const setRegion = useCallback((name: string) => {
    // 지역 기능이 쓰이는지 보는 유일한 신호(2026-10-16 결정) — GA4 이벤트 'region_select'.
    track('region_select', { region: name });
    setRegionState(name);
    AsyncStorage.setItem(STORAGE_KEY, name);
  }, []);

  const value = useMemo<RegionState>(() => ({ region, setRegion }), [region, setRegion]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRegion(): RegionState {
  const v = useContext(Ctx);
  if (!v) throw new Error('RegionProvider missing');
  return v;
}
