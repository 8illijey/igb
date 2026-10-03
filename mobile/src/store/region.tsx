import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isRegionKey, type RegionKey } from '../api/regions';

const STORAGE_KEY = 'igb.region.v1';

interface RegionState {
  region: RegionKey;
  setRegion: (r: RegionKey) => void;
  /** 저장값을 읽기 전에는 false — 이때 지역 기준으로 시세를 받으면 전국으로 한 번 헛돈다. */
  ready: boolean;
}

const Ctx = createContext<RegionState | null>(null);

/** PricesProvider보다 바깥에 있어야 한다 — 시세 조회가 지역을 읽는다. */
export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegionState] = useState<RegionKey>('all');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      // 목록에서 빠진 지역이 저장돼 있을 수 있다(코드 변경) — 모르는 값이면 전국으로.
      .then((raw) => { if (raw && isRegionKey(raw)) setRegionState(raw); })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const setRegion = useCallback((r: RegionKey) => {
    setRegionState(r);
    AsyncStorage.setItem(STORAGE_KEY, r).catch(() => {});
  }, []);

  const value = useMemo<RegionState>(() => ({ region, setRegion, ready }), [region, setRegion, ready]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRegion(): RegionState {
  const v = useContext(Ctx);
  if (!v) throw new Error('RegionProvider missing');
  return v;
}
