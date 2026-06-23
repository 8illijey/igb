import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'igb.favorites.v1';

interface FavoritesState {
  keys: string[];
  isFavorite: (key: string) => boolean;
  toggle: (key: string) => void;
}

const Ctx = createContext<FavoritesState | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setKeys(JSON.parse(raw));
    });
  }, []);

  const toggle = useCallback((key: string) => {
    setKeys((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo<FavoritesState>(
    () => ({ keys, isFavorite: (k) => keys.includes(k), toggle }),
    [keys, toggle],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFavorites(): FavoritesState {
  const v = useContext(Ctx);
  if (!v) throw new Error('FavoritesProvider missing');
  return v;
}
