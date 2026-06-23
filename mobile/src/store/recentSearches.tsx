import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'igb.recentSearches.v1';
const CAP = 10; // 최근 검색어 최대 보관 개수

interface RecentSearchesState {
  recents: string[];
  add: (term: string) => void;
  remove: (term: string) => void;
  clear: () => void;
}

const Ctx = createContext<RecentSearchesState | null>(null);

export function RecentSearchesProvider({ children }: { children: React.ReactNode }) {
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setRecents(JSON.parse(raw));
    });
  }, []);

  const persist = (next: string[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  };

  const add = useCallback((term: string) => {
    const t = term.trim();
    if (!t) return;
    // 최신을 맨 앞으로, 중복 제거, 최대 CAP개
    setRecents((prev) => persist([t, ...prev.filter((x) => x !== t)].slice(0, CAP)));
  }, []);

  const remove = useCallback((term: string) => {
    setRecents((prev) => persist(prev.filter((x) => x !== term)));
  }, []);

  const clear = useCallback(() => {
    setRecents(persist([]));
  }, []);

  const value = useMemo<RecentSearchesState>(
    () => ({ recents, add, remove, clear }),
    [recents, add, remove, clear],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRecentSearches(): RecentSearchesState {
  const v = useContext(Ctx);
  if (!v) throw new Error('RecentSearchesProvider missing');
  return v;
}
