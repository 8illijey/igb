/**
 * 지역별 시세 대상 12곳.
 *
 * code는 KAMIS `p_country_code`(일별)·`p_countycode`(기간별) 체계다.
 * 일별 조회에선 이 값이 실제로 동작한다 — 지역별 오늘가가 다르게 온다(2026-09-09 확인:
 * 배추 전국 6,155 / 서울 6,266 / 부산 5,388 / 세종 5,980). 추가 요청 없이 파라미터만 바뀐다.
 * 기간별 조회에선 무시되고 24개 지역 행이 전부 오므로 응답의 `countyname`으로 갈라 쓴다.
 *
 * ── 평년에 대해 (2026-09-09 조사) ────────────────────────────────────────────
 * 평년(dpr7)은 p_country_code와 무관하게 전 지역 동일한 전국 단일값이다.
 * 지역별 평년을 직접 만들 수도 없다 — periodProductList의 지역 상세는 최근 1년치뿐이고,
 * 13개월 이전을 요청하면 **에러 없이 최근 데이터가 돌아온다**(무음 폴백). 평년은 5년 평균이라
 * 1년치로 만들면 build-baselines가 이미 고친 순환 버그(자체 1년 평균을 '평년'이라 부르던 것)로 되돌아간다.
 *
 * 그래서 판정은 '지역 오늘가 vs 전국 평년'이고, 화면이 그 기준을 밝힌다.
 * 지역 수준차를 계수로 보정하는 안은 표본이 얇은 지역에서 무너져 보류했다(아래 thin 참고).
 */
export interface Region {
  code: string;
  /** 응답 countyname과 정확히 일치해야 한다 — 기간별 조회의 매칭 키 */
  name: string;
  /**
   * 조사 판매처가 1~2곳뿐이라 그 지역 값이 '동네 시세'가 아니라 '한 매장 값'에 가까운 곳.
   * 2026-09-09 배추 기준 실측: 세종·성남·고양·용인 각 1곳(서울 8, 부산 4, 대구 3).
   * 같은 이유로 전국 대비 가격비가 해마다 10%p 넘게 흔들린다(성남 1.00→0.88, 고양 1.00→0.86).
   */
  thin?: true;
}

export const REGIONS: Region[] = [
  { code: '1101', name: '서울' },
  { code: '2100', name: '부산' },
  { code: '2200', name: '대구' },
  { code: '2300', name: '인천' },
  { code: '2401', name: '광주' },
  { code: '2501', name: '대전' },
  { code: '2601', name: '울산' },
  { code: '2701', name: '세종', thin: true },
  { code: '3111', name: '수원' },
  { code: '3112', name: '성남', thin: true },
  { code: '3138', name: '고양', thin: true },
  { code: '3145', name: '용인', thin: true },
];

/** 'all' = 전국(기존 동작). 그 외는 Region.name. */
export type RegionKey = 'all' | string;

const BY_NAME = new Map(REGIONS.map((r) => [r.name, r]));

export const isRegionKey = (v: string): boolean => v === 'all' || BY_NAME.has(v);
export const regionOf = (key: RegionKey): Region | null => (key === 'all' ? null : BY_NAME.get(key) ?? null);
/** KAMIS 조회에 넣을 지역 코드. 전국이면 null — 파라미터를 아예 빼야 전국 평균이 온다. */
export const regionCode = (key: RegionKey): string | null => regionOf(key)?.code ?? null;
/** 화면 라벨 — 전국이면 '전국'. */
export const regionLabel = (key: RegionKey): string => (key === 'all' ? '전국' : key);
