import { useEffect, useState } from 'react';
import type { SignalLevel } from '../theme/tokens';

/**
 * 서버 사전계산 판정 — scripts/build-verdicts.mjs 가 하루 1회 만든 verdicts.json.
 * 평년 + 최근 1년 평균 두 기준 종합(level)과 최근 1년 평균(recentAvg)을 담는다.
 * 홈: level로 '싸/적정/비싸' 일관 표시. 상세: recentAvg로 추천을 365일 기기 호출 없이 즉시 확정.
 */
export interface Verdict {
  level: SignalLevel;
  recentAvg: number | null;
  today: number | null;
  normal: number | null;
  /** 12개월 평균(연간 흐름). 계절 품종 분할 품목은 달마다 주력 품종으로 채워짐. */
  months?: (number | null)[];
  /** 도매(cls=02) 최근 1년 평균 + 연간 흐름 — 상세 도매 탭이 365일 기기 호출 없이 즉시 쓰도록. */
  wholesaleRecentAvg?: number | null;
  wholesaleMonths?: (number | null)[];
  /** 연간 흐름이 여러 계절 품종(봄·여름·가을·월동)에 걸쳐 있음 — 안내 표시용 */
  spanVarieties?: boolean;
  /** 대표 품종명 — 분할 품목 히어로에 표시 (예: "봄배추") */
  variety?: string;
  /** 이번 달 실제 조사된 품종들 + 가격 (싼 순) — 연간 흐름 캡션용 */
  thisMonthVarieties?: { name: string; price: number }[];
}

// 기본은 웹 동일출처 정적(/verdicts.json). 외부 호스팅(GitHub raw·Vercel Blob 등)은 env로 덮어쓴다.
const VERDICTS_URL = process.env.EXPO_PUBLIC_VERDICTS_URL || '/verdicts.json';

let cache: Promise<Record<string, Verdict>> | null = null;
function load(): Promise<Record<string, Verdict>> {
  if (!cache) {
    cache = fetch(VERDICTS_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`verdicts HTTP ${r.status}`))))
      .then((j) => (j?.items ?? {}) as Record<string, Verdict>)
      .catch(() => ({})); // 없거나 실패 → 빈 맵. 앱은 기기 계산으로 폴백한다.
  }
  return cache;
}

/** 사전계산 판정 맵 (itemCode-kindCode → Verdict). */
export function useVerdicts(): Record<string, Verdict> {
  const [v, setV] = useState<Record<string, Verdict>>({});
  useEffect(() => {
    let alive = true;
    load().then((m) => alive && setV(m));
    return () => {
      alive = false;
    };
  }, []);
  return v;
}
