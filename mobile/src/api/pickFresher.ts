import type { PriceItem } from './kamis';

/**
 * 라이브 일별가와 사전계산(verdicts) 중 **조사일이 더 최신인 쪽**을 고른다.
 *
 * 왜 필요한가 (2026-09-21 실측):
 *  KAMIS 일별가는 한 행에 당일·1일전·1주전·2주전 네 칸뿐이다(kamis.ts의 사다리).
 *  당일·1일전이 둘 다 비면 곧바로 1주전으로 건너뛴다 — 2~6일전 칸이 없다.
 *  주말이 끼면 매주 월요일 오전마다 이 일이 생긴다.
 *
 *    14시 샤인머스켓: 당일(월)·1일전(일) 모두 '-' → 화면에 09-14 값 13,679원
 *    같은 시각 앱이 이미 받아둔 verdicts.json: 09-18 값 12,982원
 *
 *  더 나은 값을 들고도 안 쓰고 일주일 전 값을 보여주고 있었다. 사용자가 "14일 이후로
 *  가격이 안 바뀐다"고 본 게 이것이다.
 *
 * 안전한 이유: verdicts는 CI가 하루 3회 같은 KAMIS에서 구워 커밋한 것이라 출처가 같다.
 * 날짜를 비교해 최신 쪽만 고르므로 라이브가 정상인 평상시엔 아무것도 바뀌지 않는다.
 *
 * 도매(cls=02)엔 적용하지 않는다 — verdicts의 today는 소매가이고 단위도 다르다.
 *
 * 검증: `node src/api/pickFresher.test.mjs`
 */
export function pickFresher(
  raw: PriceItem | null | undefined,
  market: string,
  v: { today: number | null; normal: number | null } | undefined,
  verdictsDate: string | null,
): PriceItem | null | undefined {
  if (!raw || market !== 'retail') return raw;
  if (v?.today == null || !verdictsDate) return raw;
  if (!(raw.surveyDate < verdictsDate)) return raw;
  // normal도 같이 바꾼다 — today와 기준값이 서로 다른 회차에서 오면 '평년 대비 %'가 어긋난다.
  return { ...raw, today: v.today, surveyDate: verdictsDate, normal: v.normal ?? raw.normal };
}
