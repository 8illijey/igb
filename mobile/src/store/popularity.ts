import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useReducer } from 'react';

/**
 * 인기 품목 — 상세 화면을 연 횟수(클릭량)를 품목 키(itemKey, 등급·원산지까지)별로 누적한다.
 * 2026-10-16 이전엔 itemCode 단위였다 — 한우 등급이 품목으로 갈리면서 한 번 열면 15개가 같이 올랐다.
 * 예전 itemCode 기록은 새 키와 안 맞아 순위에서 빠진다(기기 로컬이라 감수).
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

/** 상세 조회 1회 = +1. 품목 키 기준. */
export function bumpPopularity(key: string) {
  if (!key) return;
  counts = { ...counts, [key]: (counts[key] ?? 0) + 1 };
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(counts)).catch(() => {});
  listeners.forEach((l) => l());
}

/** 품목 키 → 조회수 맵. 변경 시 리렌더. */
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
