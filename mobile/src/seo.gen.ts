// 자동 생성 — scripts/gen-seo.mjs. 직접 수정 금지.
// 검색엔진용 품목 목록. 이름은 앱의 labelOf(홈 목록과 동일 규칙)로 만들어진다.
export interface SeoItem {
  key: string;
  name: string;
  unit: string;
  /** 빌드 시점 가격 — 정적 HTML의 제목에 쓴다. 라이브 값이 오면 그걸로 덮는다. */
  price: number | null;
  /** 이맘때 평년 평균(verdicts) — 정적 본문의 비교 문장에 쓴다. */
  normal: number | null;
  /** 연중 가장 싼/비싼 달(1~12). 조사월 6개 이상일 때만 값이 있다. */
  minMonth: number | null;
  maxMonth: number | null;
  /** 제철 품목(조사월 6개 미만)의 조사월 목록 — 철 시작 달부터 정렬. */
  seasonMonths: number[] | null;
  /** 5년 평년의 월별 평균(1~12월, 소매). 연중 조사 품목(실측 300일 이상)만 값이 있다. */
  normalMonths: (number | null)[] | null;
}
export const SEO_ITEMS: SeoItem[] = [
  {
    "key": "111-01",
    "name": "쌀 20kg",
    "unit": "20kg",
    "price": 63988,
    "normal": 53887,
    "minMonth": 7,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": [
      54287,
      53777,
      52971,
      51993,
      53247,
      53578,
      53992,
      54292,
      53620,
      54147,
      55158,
      55404
    ]
  },
  {
    "key": "111-10",
    "name": "쌀 10kg",
    "unit": "10kg",
    "price": 36238,
    "normal": 30885,
    "minMonth": 6,
    "maxMonth": 3,
    "seasonMonths": null,
    "normalMonths": [
      29690,
      29007,
      28691,
      29060,
      29086,
      28501,
      28556,
      27912,
      29856,
      31845,
      30226,
      30354
    ]
  },
  {
    "key": "112-01",
    "name": "찹쌀",
    "unit": "1kg",
    "price": 4914,
    "normal": 4297,
    "minMonth": 7,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": [
      4383,
      4326,
      4431,
      4215,
      4310,
      4283,
      4220,
      4285,
      4240,
      4236,
      4244,
      4373
    ]
  },
  {
    "key": "113-01",
    "name": "혼식곡",
    "unit": "1kg",
    "price": 7694,
    "normal": null,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9
    ],
    "normalMonths": null
  },
  {
    "key": "115-01",
    "name": "현미",
    "unit": "1kg",
    "price": 5639,
    "normal": null,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9
    ],
    "normalMonths": null
  },
  {
    "key": "121-04",
    "name": "보리쌀",
    "unit": "1kg",
    "price": 4773,
    "normal": null,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9
    ],
    "normalMonths": null
  },
  {
    "key": "141-01",
    "name": "콩",
    "unit": "500g",
    "price": 4970,
    "normal": 5200,
    "minMonth": 2,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": [
      5113,
      5159,
      5159,
      5137,
      5124,
      5249,
      5284,
      5215,
      5110,
      5184,
      5064,
      5099
    ]
  },
  {
    "key": "142-00",
    "name": "팥",
    "unit": "500g",
    "price": 13220,
    "normal": 9149,
    "minMonth": 12,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": [
      8909,
      8846,
      9309,
      9550,
      9432,
      9391,
      9405,
      9501,
      9395,
      9357,
      9326,
      9740
    ]
  },
  {
    "key": "143-00",
    "name": "녹두",
    "unit": "500g",
    "price": 12074,
    "normal": 11238,
    "minMonth": 2,
    "maxMonth": 6,
    "seasonMonths": null,
    "normalMonths": [
      12661,
      12686,
      13031,
      12675,
      12748,
      12749,
      12391,
      12436,
      12366,
      12828,
      12701,
      12743
    ]
  },
  {
    "key": "151-00",
    "name": "고구마",
    "unit": "1kg",
    "price": 4849,
    "normal": 5516,
    "minMonth": 11,
    "maxMonth": 6,
    "seasonMonths": null,
    "normalMonths": [
      4961,
      4854,
      4894,
      4974,
      5091,
      5000,
      5152,
      5416,
      5193,
      4913,
      4803,
      4709
    ]
  },
  {
    "key": "152-01",
    "name": "감자",
    "unit": "100g",
    "price": 286,
    "normal": 343,
    "minMonth": 9,
    "maxMonth": 4,
    "seasonMonths": null,
    "normalMonths": [
      327,
      378,
      394,
      425,
      474,
      396,
      311,
      299,
      305,
      315,
      316,
      343
    ]
  },
  {
    "key": "411-07",
    "name": "사과",
    "unit": "10개",
    "price": 22595,
    "normal": 20944,
    "minMonth": 9,
    "maxMonth": 8,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "412-01",
    "name": "신고배",
    "unit": "10개",
    "price": 31218,
    "normal": 30564,
    "minMonth": 11,
    "maxMonth": 7,
    "seasonMonths": null,
    "normalMonths": [
      32014,
      35188,
      36842,
      36111,
      37006,
      35423,
      35907,
      36233,
      28262,
      27256,
      25500,
      28316
    ]
  },
  {
    "key": "412-04",
    "name": "원황배",
    "unit": "10개",
    "price": 29322,
    "normal": 33750,
    "minMonth": 11,
    "maxMonth": 7,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "413-01",
    "name": "복숭아",
    "unit": "10개",
    "price": 19243,
    "normal": 17000,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      7,
      8,
      9
    ],
    "normalMonths": null
  },
  {
    "key": "414-01",
    "name": "캠벨얼리포도",
    "unit": "1kg",
    "price": 7668,
    "normal": 8174,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      7,
      8,
      9,
      10,
      11
    ],
    "normalMonths": null
  },
  {
    "key": "414-02",
    "name": "거봉포도",
    "unit": "2kg",
    "price": 18727,
    "normal": 23010,
    "minMonth": 11,
    "maxMonth": 7,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "414-12",
    "name": "샤인머스켓포도",
    "unit": "2kg",
    "price": 13651,
    "normal": 23636,
    "minMonth": 11,
    "maxMonth": 7,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "415-02",
    "name": "감귤",
    "unit": "10개",
    "price": 7113,
    "normal": 7375,
    "minMonth": 11,
    "maxMonth": 3,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "418-02",
    "name": "바나나",
    "unit": "100g",
    "price": 328,
    "normal": 308,
    "minMonth": 8,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": [
      287,
      300,
      304,
      305,
      298,
      297,
      294,
      291,
      299,
      296,
      286,
      291
    ]
  },
  {
    "key": "420-02",
    "name": "파인애플",
    "unit": "1개",
    "price": 7399,
    "normal": 6817,
    "minMonth": 3,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": [
      6066,
      6162,
      5957,
      6205,
      6379,
      6344,
      5966,
      6097,
      6707,
      6773,
      6434,
      6237
    ]
  },
  {
    "key": "421-06",
    "name": "오렌지",
    "unit": "10개",
    "price": 11554,
    "normal": 11703,
    "minMonth": 9,
    "maxMonth": 2,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "424-00",
    "name": "레몬",
    "unit": "10개",
    "price": 8160,
    "normal": 8612,
    "minMonth": 9,
    "maxMonth": 1,
    "seasonMonths": null,
    "normalMonths": [
      8910,
      8968,
      8818,
      8809,
      9153,
      9305,
      8816,
      8547,
      8543,
      8499,
      8499,
      9143
    ]
  },
  {
    "key": "425-00",
    "name": "체리",
    "unit": "100g",
    "price": 2059,
    "normal": 3023,
    "minMonth": 3,
    "maxMonth": 5,
    "seasonMonths": null,
    "normalMonths": [
      2544,
      2040,
      2397,
      2195,
      3096,
      2283,
      1787,
      2036,
      2820,
      3209,
      3687,
      3295
    ]
  },
  {
    "key": "428-00",
    "name": "망고",
    "unit": "1개",
    "price": 7535,
    "normal": 7091,
    "minMonth": 4,
    "maxMonth": 12,
    "seasonMonths": null,
    "normalMonths": [
      5771,
      5186,
      4064,
      3822,
      3875,
      3978,
      4479,
      6315,
      6814,
      6126,
      5772,
      5421
    ]
  },
  {
    "key": "429-02",
    "name": "블루베리",
    "unit": "1kg",
    "price": 11584,
    "normal": 11264,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9
    ],
    "normalMonths": null
  },
  {
    "key": "430-00",
    "name": "아보카도",
    "unit": "1개",
    "price": 1837,
    "normal": 1859,
    "minMonth": 7,
    "maxMonth": 4,
    "seasonMonths": null,
    "normalMonths": [
      2022,
      2125,
      2269,
      2223,
      2139,
      2107,
      1826,
      1696,
      1880,
      1888,
      1866,
      1978
    ]
  },
  {
    "key": "4301-21",
    "name": "소고기 안심",
    "unit": "100g",
    "price": 19535,
    "normal": 14813,
    "minMonth": 10,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": [
      15959,
      15578,
      14902,
      14988,
      15008,
      14961,
      15100,
      15439,
      15850,
      15740,
      15680,
      15499
    ]
  },
  {
    "key": "4301-22",
    "name": "소고기 등심",
    "unit": "100g",
    "price": 16494,
    "normal": 13498,
    "minMonth": 10,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": [
      12428,
      12163,
      11514,
      11341,
      11423,
      11788,
      12053,
      11970,
      12232,
      12509,
      12634,
      12204
    ]
  },
  {
    "key": "4301-36",
    "name": "소고기 설도",
    "unit": "100g",
    "price": 6163,
    "normal": 4693,
    "minMonth": 10,
    "maxMonth": 8,
    "seasonMonths": null,
    "normalMonths": [
      4758,
      4779,
      4662,
      4589,
      4552,
      4660,
      4806,
      4630,
      4640,
      4658,
      4595,
      4745
    ]
  },
  {
    "key": "4301-40",
    "name": "소고기 양지",
    "unit": "100g",
    "price": 7921,
    "normal": 6010,
    "minMonth": 10,
    "maxMonth": 3,
    "seasonMonths": null,
    "normalMonths": [
      6554,
      6549,
      6183,
      5975,
      6217,
      6324,
      6358,
      6251,
      6325,
      6482,
      6458,
      6543
    ]
  },
  {
    "key": "4301-50",
    "name": "소고기 갈비",
    "unit": "100g",
    "price": 9523,
    "normal": 8405,
    "minMonth": 12,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4304-25",
    "name": "돼지고기 앞다리",
    "unit": "100g",
    "price": 1697,
    "normal": 1476,
    "minMonth": 4,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4304-27",
    "name": "돼지고기 삼겹살",
    "unit": "100g",
    "price": 3046,
    "normal": 2760,
    "minMonth": 3,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4304-28",
    "name": "돼지고기 갈비",
    "unit": "100g",
    "price": 1680,
    "normal": 1517,
    "minMonth": 4,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4304-68",
    "name": "돼지고기 목심",
    "unit": "100g",
    "price": 2857,
    "normal": 2578,
    "minMonth": 3,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "437-01",
    "name": "키위",
    "unit": "10개",
    "price": 13890,
    "normal": 13599,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9
    ],
    "normalMonths": null
  },
  {
    "key": "4401-31",
    "name": "수입 소고기 갈비",
    "unit": "100g",
    "price": 4314,
    "normal": 4236,
    "minMonth": 9,
    "maxMonth": 12,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4401-37",
    "name": "수입 소고기 갈비살",
    "unit": "100g",
    "price": 5587,
    "normal": 4616,
    "minMonth": 5,
    "maxMonth": 11,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4402-27",
    "name": "수입 돼지고기 삼겹살",
    "unit": "100g",
    "price": 1519,
    "normal": 1487,
    "minMonth": 4,
    "maxMonth": 11,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "9901-24",
    "name": "닭고기 절단육",
    "unit": "1kg",
    "price": null,
    "normal": 7861,
    "minMonth": 12,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "9901-99",
    "name": "닭고기 육계",
    "unit": "1kg",
    "price": 5456,
    "normal": 5641,
    "minMonth": 12,
    "maxMonth": 4,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "9903-21",
    "name": "계란 10구",
    "unit": "10구",
    "price": 4208,
    "normal": 3519,
    "minMonth": 11,
    "maxMonth": 6,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "9903-23",
    "name": "계란 30구",
    "unit": "30구",
    "price": 6882,
    "normal": 6452,
    "minMonth": 11,
    "maxMonth": 6,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "9908-01",
    "name": "우유",
    "unit": "1L",
    "price": 2981,
    "normal": 2917,
    "minMonth": 5,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": null
  }
];
/** 이 파일을 만든 날(YYYYMMDD). 공유 카드 이미지 URL의 캐시 무효화에 쓴다 —
 *  카톡은 OG 이미지를 오래 캐싱해서 주소가 같으면 어제 가격이 계속 보인다. */
export const SEO_BUILD_DAY = '20260930';
export const SEO_BY_KEY: Record<string, SeoItem> = Object.fromEntries(SEO_ITEMS.map((i) => [i.key, i]));

/** 레시피 상세를 정적으로 내리기 위한 목록. 주소는 순번이 아니라 제목 슬러그다. */
export interface SeoRecipe {
  slug: string;
  title: string;
}
export const SEO_RECIPES: SeoRecipe[] = [
  {
    "slug": "닭가슴살-두부선",
    "title": "닭가슴살 두부선"
  },
  {
    "slug": "파프리카볶음밥",
    "title": "파프리카볶음밥"
  },
  {
    "slug": "닭고기채소스파게티",
    "title": "닭고기채소스파게티"
  },
  {
    "slug": "수삼매운닭찜",
    "title": "수삼매운닭찜"
  },
  {
    "slug": "카레탄두리치킨과-닭가슴살냉채",
    "title": "카레탄두리치킨과 닭가슴살냉채"
  },
  {
    "slug": "삼계치킨롤",
    "title": "삼계치킨롤"
  },
  {
    "slug": "닭고기-완자삼계죽",
    "title": "닭고기 완자삼계죽"
  },
  {
    "slug": "미역볶음밥",
    "title": "미역볶음밥"
  },
  {
    "slug": "닭고기볶음밥",
    "title": "닭고기볶음밥"
  },
  {
    "slug": "닭고기라이스롤",
    "title": "닭고기라이스롤"
  },
  {
    "slug": "닭고기또띠아",
    "title": "닭고기또띠아"
  },
  {
    "slug": "카레닭-룰라이드",
    "title": "카레닭 룰라이드"
  },
  {
    "slug": "닭강정",
    "title": "닭강정"
  },
  {
    "slug": "룰룰랄라",
    "title": "룰룰랄라"
  },
  {
    "slug": "머쉬룸-닭스테이크",
    "title": "머쉬룸 닭스테이크"
  },
  {
    "slug": "초계탕과-사색곤약",
    "title": "초계탕과 사색곤약"
  },
  {
    "slug": "세가지샐러드",
    "title": "세가지샐러드"
  },
  {
    "slug": "닭고기월남쌈",
    "title": "닭고기월남쌈"
  },
  {
    "slug": "양배추롤",
    "title": "양배추롤"
  },
  {
    "slug": "백김치닭살샐러드",
    "title": "백김치닭살샐러드"
  },
  {
    "slug": "치킨완자스프",
    "title": "치킨완자스프"
  },
  {
    "slug": "닭고기스테이크",
    "title": "닭고기스테이크"
  },
  {
    "slug": "닭가슴살청포묵비빔밥",
    "title": "닭가슴살청포묵비빔밥"
  },
  {
    "slug": "감닭떡갈비",
    "title": "감닭떡갈비"
  },
  {
    "slug": "깐풍파스타",
    "title": "깐풍파스타"
  },
  {
    "slug": "양송이크림볶음밥",
    "title": "양송이크림볶음밥"
  },
  {
    "slug": "둥지튀김",
    "title": "둥지튀김"
  },
  {
    "slug": "호박잎삼계",
    "title": "호박잎삼계"
  },
  {
    "slug": "초계탕",
    "title": "초계탕"
  },
  {
    "slug": "봄옷을-입은-닭",
    "title": "봄옷을 입은 닭"
  }
];
