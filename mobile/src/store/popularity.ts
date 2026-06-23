import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useReducer } from 'react';

/**
 * 인기 품목 — 상세 화면을 연 횟수(클릭량)를 itemCode별로 누적한다.
 * 서버 분석이 없는 동안의 로컬 신호. 검색 화면의 '인기 품목 TOP'에 쓰인다.
 */
const STORAGE_KEY = 'igb.popularity';

let counts: Record<string, number> = {};
let loaded = false;
const listeners = new Set<() => void>();

async function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  try {
    counts = JSON.parse((await AsyncStorage.getItem(STORAGE_KEY)) || '{}') || {};
  } catch {
    counts = {};
  }
  listeners.forEach((l) => l());
}

/** 상세 조회 1회 = +1. itemCode 기준(대표 단위가 매일 바뀌어도 안정적). */
export function bumpPopularity(itemCode: string) {
  if (!itemCode) return;
  counts = { ...counts, [itemCode]: (counts[itemCode] ?? 0) + 1 };
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(counts)).catch(() => {});
  listeners.forEach((l) => l());
}

/** itemCode → 조회수 맵. 변경 시 리렌더. */
export function usePopularity(): Record<string, number> {
  const [, force] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    listeners.add(force);
    ensureLoaded();
    return () => {
      listeners.delete(force);
    };
  }, []);
  return counts;
}
