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
  /** 전국 지난 28일 평균 — 평년이 없는 품목에만 실린다. 그 품목의 홈·상세 판정 기준. */
  recent28Avg?: number;
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

/** verdicts.json 한 벌 — items와 그 값들의 조사일(date). */
interface VerdictsPayload {
  date: string | null;
  items: Record<string, Verdict>;
}

async function fetchVerdicts(): Promise<VerdictsPayload> {
  for (const url of VERDICTS_URLS) {
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const json = await r.json();
      const items = (json?.items ?? {}) as Record<string, Verdict>;
      // 빈 맵은 '성공했지만 쓸모없는 응답' — 다음 소스를 더 시도한다.
      // date는 items의 기준 조사일이다. 상세가 라이브 사다리 값과 어느 쪽이 최신인지
      // 비교하는 데 쓰므로 같이 들고 나간다 — 예전엔 여기서 버렸다.
      if (Object.keys(items).length) return { date: (json?.date as string) ?? null, items };
    } catch {
      // 다음 소스로
    }
  }
  return { date: null, items: {} }; // 전부 실패 → 빈 맵. 앱은 기기 계산으로 폴백한다.
}

let cache: Promise<VerdictsPayload> | null = null;
function load(): Promise<VerdictsPayload> {
  if (!cache) cache = fetchVerdicts();
  return cache;
}

/** 사전계산 판정 맵 (itemCode-kindCode → Verdict). */
export function useVerdicts(): Record<string, Verdict> {
  const [v, setV] = useState<Record<string, Verdict>>({});
  useEffect(() => {
    let alive = true;
    load().then((m) => alive && setV(m.items));
    return () => {
      alive = false;
    };
  }, []);
  return v;
}

/** 위 판정들의 기준 조사일(YYYY-MM-DD). 아직 못 받았으면 null. */
export function useVerdictsDate(): string | null {
  const [d, setD] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    load().then((m) => alive && setD(m.date));
    return () => {
      alive = false;
    };
  }, []);
  return d;
}

// ── 지역별 판정 (scripts/build-verdicts-regional.mjs) ──
// 평년(dpr7)은 어느 지역이든 전국 단일값이라 지역 기준선으로 못 쓴다(2026-10 라이브 확인).
// 그래서 지역은 '그 지역 최근 평균'(recentAvg, 기본 28일) 한 기준으로만 판정한다. 전국은 기존 평년+최근 그대로.
// 지역/품목이 없으면 앱이 전국 verdicts로 폴백한다.
export interface RegionalVerdict {
  level: SignalLevel;
  today: number | null;
  /** 그 지역 최근 N일(windowDays) 평균 — 판정·표시 기준선 */
  recentAvg: number | null;
  /**
   * 고기만 — 축산물품질평가원 시·도 값(2026-10-16). KAMIS가 고기를 도시별로 안 줘서 상세 차트용 가격열을
   * 같이 싣는다(날짜는 payload.meatDates와 같은 순서, 조사 없는 날은 null).
   */
  s?: (number | null)[];
  /** 그 도시가 아니라 속한 시·도 값을 빌려 썼을 때 그 이름(수원 → '경기'). */
  sido?: string;
}
/** 도시명 → (itemCode-kindCode → RegionalVerdict) */
export type RegionalVerdicts = Record<string, Record<string, RegionalVerdict>>;

const REGIONAL_URLS = [
  typeof document !== 'undefined'
    ? '/verdicts-regional.json'
    : 'https://igeobissa.com/verdicts-regional.json',
  'https://raw.githubusercontent.com/8illijey/igb/main/mobile/public/verdicts-regional.json',
];

/** 지역 판정 한 벌 — 도시별 판정 + 기준선 창(windowDays, '최근 N일 평균' 라벨에 쓴다). */
export interface RegionalPayload {
  regions: RegionalVerdicts;
  windowDays: number | null;
  /** 고기 가격열(s)의 날짜(YYYY-MM-DD). 고기 지역값이 없는 파일이면 null. */
  meatDates: string[] | null;
}

async function fetchRegional(): Promise<RegionalPayload> {
  for (const url of REGIONAL_URLS) {
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const j = await r.json();
      const regions = (j?.regions ?? {}) as RegionalVerdicts;
      if (Object.keys(regions).length) {
        return {
          regions,
          windowDays: typeof j?.windowDays === 'number' ? j.windowDays : null,
          meatDates: Array.isArray(j?.meatDates) ? (j.meatDates as string[]) : null,
        };
      }
    } catch {
      // 다음 소스로
    }
  }
  return { regions: {}, windowDays: null, meatDates: null };
}

let regionalCache: Promise<RegionalPayload> | null = null;

/** 지역 판정. enabled=false(전국)면 받지 않는다 — 전국 사용자에겐 80KB를 안 내려준다. */
export function useRegionalVerdicts(enabled: boolean): RegionalPayload {
  const [m, setM] = useState<RegionalPayload>({ regions: {}, windowDays: null, meatDates: null });
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    if (!regionalCache) regionalCache = fetchRegional();
    regionalCache.then((x) => alive && setM(x));
    return () => {
      alive = false;
    };
  }, [enabled]);
  return m;
}
