import { useEffect, useState } from 'react';
import type { SeriesPoint } from './kamis';

/**
 * 서버 사전계산 일별 시계열 — scripts/build-verdicts.mjs 가 하루 1회 만든 series.json.
 *
 * 왜 필요한가: 상세를 열 때마다 앱이 1년치를 KAMIS에서 새로 받았다. 1년 단일 조회는
 * 15s 타임아웃에 걸려서 92일 4분할 병렬로 쪼갰는데, 2026-08-20 실측으로 분할 하나가
 * 3~7초였다(가장 느린 청크 6.95s). 28일 차트·판매처까지 합쳐 상세 진입 한 번에
 * KAMIS 기간조회가 7개씩 날아갔고, '최근 시세' 차트는 그동안 스켈레톤이었다.
 *
 * 이 데이터는 verdicts 빌드가 이미 받아두고 월평균만 뽑은 뒤 버리던 것이라
 * KAMIS 추가 호출 없이 같이 저장한다. 앱은 CDN에서 한 번 받아 모든 품목이 공유한다.
 *
 * 형식: { "211-02": { r: [["2026-08-20", 4985], …], w: […] } }  (r=소매, w=도매)
 */
type RawPoint = [string, number];
interface RawSeries {
  r?: RawPoint[];
  w?: RawPoint[];
}

// verdicts.ts와 같은 순서·같은 이유 — 배포된 사이트가 1순위, GitHub raw는 429가 잦아 2순위.
const SERIES_URLS = [
  typeof document !== 'undefined' ? '/series.json' : 'https://igeobissa.com/series.json',
  'https://raw.githubusercontent.com/8illijey/igb/main/mobile/public/series.json',
];

async function fetchSeriesFile(): Promise<Record<string, RawSeries>> {
  for (const url of SERIES_URLS) {
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const items = ((await r.json())?.items ?? {}) as Record<string, RawSeries>;
      if (Object.keys(items).length) return items;
    } catch {
      // 다음 소스로
    }
  }
  return {}; // 전부 실패 → 빈 맵. 앱은 라이브 365일 호출로 폴백한다.
}

let cache: Promise<Record<string, RawSeries>> | null = null;
function load(): Promise<Record<string, RawSeries>> {
  if (!cache) cache = fetchSeriesFile();
  return cache;
}

/**
 * "2026-08-20" → { date: "08/20", year: "2026" } — 앱 차트가 쓰는 SeriesPoint 형태로.
 * 변환 결과를 캐시해 같은 배열 참조를 돌려준다 — 매 렌더마다 새 배열을 만들면
 * 이걸 의존성으로 쓰는 useEffect가 무한히 다시 도다.
 */
const pointCache = new Map<string, SeriesPoint[] | null>();
function toPoints(cacheKey: string, raw: RawPoint[] | undefined): SeriesPoint[] | null {
  if (pointCache.has(cacheKey)) return pointCache.get(cacheKey)!;
  const v =
    !raw || raw.length === 0
      ? null
      : raw.map(([ymd, price]) => ({
          date: ymd.slice(5).replace('-', '/'),
          year: ymd.slice(0, 4),
          price,
        }));
  pointCache.set(cacheKey, v);
  return v;
}

/**
 * 사전계산 시계열 조회. undefined = 아직 로딩, null = 이 품목/시장은 없음(라이브로 폴백).
 */
export function usePrecomputedSeries(
  key: string,
  market: 'retail' | 'wholesale',
): SeriesPoint[] | null | undefined {
  const [map, setMap] = useState<Record<string, RawSeries> | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    load().then((m) => alive && setMap(m));
    return () => {
      alive = false;
    };
  }, []);
  if (map === undefined) return undefined;
  const w = market === 'wholesale';
  return toPoints(`${key}|${w ? 'w' : 'r'}`, w ? map[key]?.w : map[key]?.r);
}
