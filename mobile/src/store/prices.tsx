import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchAllCategories, PriceItem } from '../api/kamis';
import { PRICE_SNAPSHOT } from '../snapshot.gen';

// 가격 목록 캐시 — 첫 로드는 KAMIS를 최대 4~28콜(주말 백필) 치므로 10초+. 이전 결과를 즉시 그려
// (stale-while-revalidate) 체감 로딩을 없앤다. 새로고침은 항상 백그라운드로 돌아 최신으로 교체.
const CACHE_KEY = 'igb.prices.snapshot';

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
  // 초기값 = 빌드 시점 스냅샷(매일 CI가 갱신) — SSG 정적 HTML에 실제 카드가 담기고(LCP 대책),
  // 첫 방문도 스피너 없이 즉시 그려진다. 캐시·라이브 응답이 오는 순서대로 교체된다.
  const [items, setItems] = useState<PriceItem[]>(PRICE_SNAPSHOT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fresh = await fetchAllCategories();
      // 장애 중 '데이터 없음' 정상 JSON이 오면 빈 목록이 성공으로 캐시를 덮는다(2026-07-15 실제 발생) — 실패로 취급해 이전 화면 유지.
      if (!fresh.length) throw new Error('시세 응답이 비어 있어요');
      setItems(fresh);
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fresh)).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : '시세를 불러오지 못했어요');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    // 캐시 즉시 그리기 — 네트워크보다 먼저 화면을 채운다(빈 스피너 제거). 날짜 무관(stale 허용).
    AsyncStorage.getItem(CACHE_KEY)
      .then((raw) => {
        if (!alive || !raw) return;
        const cached = JSON.parse(raw) as PriceItem[];
        if (Array.isArray(cached) && cached.length) {
          // 번들 스냅샷 위에만 덮는다 — 이미 fresh(라이브)가 왔으면 유지. 캐시는 스냅샷보다
          // 최신일 수 있다(사용자가 오후 갱신 후 방문했던 경우).
          setItems((cur) => (cur === PRICE_SNAPSHOT ? cached : cur));
          setLoading(false);
        }
      })
      .catch(() => {});
    refresh();
    return () => {
      alive = false;
    };
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
