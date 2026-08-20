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
  /**
   * 탭을 그릴지 말지 — 열어봐야 빈 안내문이 뜨는 탭은 버그처럼 보인다(2026-08-20 사용자 지적).
   * 앱은 탭을 누르기 전까지 데이터 유무를 모르므로 서버에서 미리 계산해 넣는다.
   * 필드가 없는 구본 verdicts에선 undefined — 그때는 예전처럼 둘 다 보여준다.
   */
  hasWholesale?: boolean;
  hasEco?: boolean;
  /** 대표 품종명 — 분할 품목 히어로에 표시 (예: "봄배추") */
  variety?: string;
  /** 이번 달 실제 조사된 품종들 + 가격 (싼 순) — 연간 흐름 캡션용 */
  thisMonthVarieties?: { name: string; price: number }[];
}

// 소스를 순서대로 시도한다. EXPO_PUBLIC_* env 주입은 오염 사고가 반복돼 안 쓴다(kamis.ts 참조, 2026-08-09).
//
// 1순위 — 배포된 사이트의 정적 자산. 웹에선 상대경로(동일 출처, 프리뷰 배포에서도 안전),
//   네이티브에선 절대경로. Vercel CDN이라 빠르고 rate limit이 없다.
// 2순위 — GitHub raw. 사이트 배포가 밀렸을 때의 안전망.
//
// 예전엔 raw가 1순위였다 — Vercel이 Git에 연결돼 있지 않아 CI가 verdicts를 푸시해도
// 재배포가 안 돼서 사이트 사본이 묵었기 때문이다. 2026-08-17 Git 연동을 켜면서
// CI 푸시가 곳 배포가 돼 그 이유가 없어졌다.
// 반대로 raw는 429(Too Many Requests)를 자주 던진다. 2026-08-18 새벽에 429가 지속돼
// 앱과 워커가 동시에 평년값을 잃고 홈 목록이 통째로 비는 장애가 났다. 그래서 2순위로 내렸다.
const VERDICTS_URLS = [
  typeof document !== 'undefined' ? '/verdicts.json' : 'https://igeobissa.com/verdicts.json',
  'https://raw.githubusercontent.com/8illijey/igb/main/mobile/public/verdicts.json',
];

async function fetchVerdicts(): Promise<Record<string, Verdict>> {
  for (const url of VERDICTS_URLS) {
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const items = ((await r.json())?.items ?? {}) as Record<string, Verdict>;
      // 빈 맵은 '성공했지만 쓸모없는 응답' — 다음 소스를 더 시도한다.
      if (Object.keys(items).length) return items;
    } catch {
      // 다음 소스로
    }
  }
  return {}; // 전부 실패 → 빈 맵. 앱은 기기 계산으로 폴백한다.
}

let cache: Promise<Record<string, Verdict>> | null = null;
function load(): Promise<Record<string, Verdict>> {
  if (!cache) cache = fetchVerdicts();
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
