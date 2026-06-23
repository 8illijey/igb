import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchAllCategories, PriceItem } from '../api/kamis';

interface PricesState {
  items: PriceItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  /** itemCode-kindCode 로 단건 조회 (정확 일치) */
  find: (key: string) => PriceItem | undefined;
  /**
   * 저장된 키(즐겨찾기 등) 해석 — 정확 일치 우선, 없으면 같은 itemCode가 유일할 때(채소·과일)
   * 오늘 대표 단위로 폴백한다. 대표 단위는 신호에 따라 매일 바뀌어 저장된 kindCode가 어긋날 수 있다.
   * 고기는 한 itemCode에 부위가 여러 개(갈비·등심)라 폴백 시 오인되므로 정확 일치만 허용.
   */
  resolve: (key: string) => PriceItem | undefined;
}

const Ctx = createContext<PricesState | null>(null);

export const itemKey = (i: Pick<PriceItem, 'itemCode' | 'kindCode'>) =>
  `${i.itemCode}-${i.kindCode}`;

export function PricesProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchAllCategories());
    } catch (e) {
      setError(e instanceof Error ? e.message : '시세를 불러오지 못했어요');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<PricesState>(
    () => ({
      items,
      loading,
      error,
      refresh,
      find: (key) => items.find((i) => itemKey(i) === key),
      resolve: (key) => {
        const exact = items.find((i) => itemKey(i) === key);
        if (exact) return exact;
        const code = key.split('-')[0];
        const sameCode = items.filter((i) => i.itemCode === code);
        return sameCode.length === 1 ? sameCode[0] : undefined;
      },
    }),
    [items, loading, error, refresh],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrices(): PricesState {
  const v = useContext(Ctx);
  if (!v) throw new Error('PricesProvider missing');
  return v;
}
