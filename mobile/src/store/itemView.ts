import { useMemo } from 'react';
import type { PriceItem } from '../api/kamis';
import { useRegionalVerdicts, useVerdicts, type RegionalVerdicts, type Verdict } from '../api/verdicts';
import { NATIONWIDE } from '../data/regions';
import type { SignalLevel } from '../theme/tokens';
import { itemKey, usePrices } from './prices';
import { useRegion } from './region';

/**
 * 한 품목의 '표시 뷰' — 전국/지역에 따라 오늘가·판정·비교기준이 달라진다.
 * 전국: 오늘 vs 평년('이맘때 평균'). 지역: 오늘 vs 그 지역 최근 평균('최근 평균').
 * 지역 데이터가 없으면 전국으로 폴백(화면이 깨지지 않게).
 */
export type ItemView = {
  today: number | null;
  level: SignalLevel | null;
  basePrice: number | null;
  baseLabel: string;
  pct: number | null;
  /** 지역을 골랐는데 그 도시가 이 품목을 조사하지 않아 전국 값으로 대신했다. */
  nationwide?: boolean;
  /** 평년이 없어 전국 지난 28일 평균으로 판정했다 — 평년 % 와 축이 달라 히어로('할인율 1위')엔 못 선다. */
  r28?: boolean;
};
export function itemView(i: PriceItem, region: string, regional: RegionalVerdicts, verdicts: Record<string, Verdict>): ItemView {
  const key = itemKey(i);
  // 도시마다 조사 품목이 다르다(2026-10-16 실측: 춘천은 취청오이·가시오이를 안 하고 쥬키니는 9/2부터 멈춤).
  // 지역 파일이 아직 안 왔으면(regional[region] 없음) 전국 화면 그대로 — 전 품목에 '전국'이 깜빡이지 않게.
  let nationwide = false;
  if (region !== NATIONWIDE && regional[region]) {
    const rv = regional[region][key];
    if (rv && rv.today != null) {
      const pct = rv.recentAvg ? Math.round(((rv.today - rv.recentAvg) / rv.recentAvg) * 100) : null;
      // 홈 히어로는 '최근 평균'만 — 일수(28일)는 상세 차트에서만 표기.
      return { today: rv.today, level: rv.level, basePrice: rv.recentAvg, baseLabel: '최근 평균', pct };
    }
    nationwide = true; // 그 도시 미조사 → 전국 폴백
  }
  // 평년이 없으면 전국 지난 28일 평균으로 판정 — 상세와 같은 값·같은 ±1% 규칙(evalBuy).
  const r28 = verdicts[key]?.recent28Avg;
  if (i.normal == null && r28 && i.today != null) {
    const pct = Math.round(((i.today - r28) / r28) * 100);
    const level: SignalLevel = pct <= -1 ? 'cheap' : pct >= 1 ? 'expensive' : 'fair';
    return { nationwide, r28: true, today: i.today, level, basePrice: r28, baseLabel: '최근 평균', pct };
  }
  return {
    nationwide,
    today: i.today,
    level: verdicts[key]?.level ?? i.level,
    basePrice: i.normal,
    baseLabel: '이맘때 평균',
    pct: i.vsNormalPct ?? null,
  };
}

/**
 * 홈과 같은 오늘가·판정을 입힌 품목 목록 — 레시피(탭·상세·품목 상세 섹션)가 쓴다.
 * usePrices().items는 KAMIS 원값이라 전국에서도 판정이 홈(사전계산 verdicts)과 어긋나고,
 * 지역을 골라도 전국 가격이 나왔다(2026-10-22 예지님: 레시피도 지역 가격을 따라가야 한다).
 * baseLabel은 비교 기준 문구 — 레시피 캡션('이맘때 평균보다'/'최근 평균보다')에 쓴다.
 */
export function useDisplayItems(): { items: PriceItem[]; baseLabel: string } {
  const { items } = usePrices();
  const verdicts = useVerdicts();
  const { region } = useRegion();
  const { regions } = useRegionalVerdicts(region !== NATIONWIDE);
  return useMemo(
    () => ({
      items: items.map((i) => {
        const v = itemView(i, region, regions, verdicts);
        return v.today === i.today && v.level === i.level ? i : { ...i, today: v.today, level: v.level };
      }),
      baseLabel: region !== NATIONWIDE && regions[region] ? '최근 평균' : '이맘때 평균',
    }),
    [items, region, regions, verdicts],
  );
}
