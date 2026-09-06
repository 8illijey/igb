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
}
export const SEO_ITEMS: SeoItem[] = [
  {
    "key": "111-01",
    "name": "쌀 20kg",
    "unit": "20kg",
    "price": 60600,
    "normal": 54275,
    "minMonth": 8,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "111-10",
    "name": "쌀 10kg",
    "unit": "10kg",
    "price": 33756,
    "normal": 28949,
    "minMonth": 8,
    "maxMonth": 3,
    "seasonMonths": null
  },
  {
    "key": "112-01",
    "name": "찹쌀",
    "unit": "1kg",
    "price": 5183,
    "normal": 4183,
    "minMonth": 7,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "113-01",
    "name": "혼식곡",
    "unit": "1kg",
    "price": 7694,
    "normal": 7694,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9
    ]
  },
  {
    "key": "115-01",
    "name": "현미",
    "unit": "1kg",
    "price": 5773,
    "normal": 5710,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9
    ]
  },
  {
    "key": "121-04",
    "name": "보리쌀",
    "unit": "1kg",
    "price": 4679,
    "normal": 4615,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9
    ]
  },
  {
    "key": "141-01",
    "name": "콩",
    "unit": "500g",
    "price": 5085,
    "normal": 5177,
    "minMonth": 2,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "142-00",
    "name": "팥",
    "unit": "500g",
    "price": 13270,
    "normal": 9505,
    "minMonth": 6,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "143-00",
    "name": "녹두",
    "unit": "500g",
    "price": 12704,
    "normal": 12427,
    "minMonth": 2,
    "maxMonth": 6,
    "seasonMonths": null
  },
  {
    "key": "151-00",
    "name": "고구마",
    "unit": "1kg",
    "price": 4546,
    "normal": 5264,
    "minMonth": 11,
    "maxMonth": 6,
    "seasonMonths": null
  },
  {
    "key": "152-01",
    "name": "감자",
    "unit": "100g",
    "price": 301,
    "normal": 318,
    "minMonth": 8,
    "maxMonth": 4,
    "seasonMonths": null
  },
  {
    "key": "211-02",
    "name": "배추",
    "unit": "1포기",
    "price": 6100,
    "normal": 6341,
    "minMonth": 5,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "212-00",
    "name": "양배추",
    "unit": "1포기",
    "price": 3118,
    "normal": 3719,
    "minMonth": 5,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "213-00",
    "name": "시금치",
    "unit": "100g",
    "price": 2326,
    "normal": 2859,
    "minMonth": 4,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "214-01",
    "name": "적상추",
    "unit": "100g",
    "price": 1889,
    "normal": 1844,
    "minMonth": 5,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "214-02",
    "name": "청상추",
    "unit": "100g",
    "price": 1931,
    "normal": 1932,
    "minMonth": 5,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "215-00",
    "name": "얼갈이배추",
    "unit": "1kg",
    "price": 4079,
    "normal": 4104,
    "minMonth": 6,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "221-00",
    "name": "수박",
    "unit": "1개",
    "price": 21733,
    "normal": 25886,
    "minMonth": 7,
    "maxMonth": 3,
    "seasonMonths": null
  },
  {
    "key": "222-00",
    "name": "참외",
    "unit": "10개",
    "price": 18125,
    "normal": 23981,
    "minMonth": 7,
    "maxMonth": 3,
    "seasonMonths": null
  },
  {
    "key": "223-01",
    "name": "가시오이",
    "unit": "10개",
    "price": 14850,
    "normal": 17181,
    "minMonth": 6,
    "maxMonth": 1,
    "seasonMonths": null
  },
  {
    "key": "223-02",
    "name": "다다기오이",
    "unit": "10개",
    "price": 11223,
    "normal": 11501,
    "minMonth": 6,
    "maxMonth": 1,
    "seasonMonths": null
  },
  {
    "key": "223-03",
    "name": "취청오이",
    "unit": "10개",
    "price": 14775,
    "normal": 15808,
    "minMonth": 6,
    "maxMonth": 1,
    "seasonMonths": null
  },
  {
    "key": "224-01",
    "name": "애호박",
    "unit": "1개",
    "price": 3086,
    "normal": 1855,
    "minMonth": 5,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "224-02",
    "name": "쥬키니호박",
    "unit": "1개",
    "price": 1990,
    "normal": 2339,
    "minMonth": 5,
    "maxMonth": 11,
    "seasonMonths": null
  },
  {
    "key": "225-00",
    "name": "토마토",
    "unit": "1kg",
    "price": 7294,
    "normal": 6996,
    "minMonth": 7,
    "maxMonth": 11,
    "seasonMonths": null
  },
  {
    "key": "231-02",
    "name": "무",
    "unit": "1개",
    "price": 2293,
    "normal": 2531,
    "minMonth": 7,
    "maxMonth": 12,
    "seasonMonths": null
  },
  {
    "key": "232-01",
    "name": "당근",
    "unit": "1kg",
    "price": 4114,
    "normal": 4094,
    "minMonth": 7,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "233-00",
    "name": "열무",
    "unit": "1kg",
    "price": 3993,
    "normal": 4204,
    "minMonth": 5,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "241-00",
    "name": "건고추 화건",
    "unit": "600g",
    "price": 16917,
    "normal": 18699,
    "minMonth": 11,
    "maxMonth": 8,
    "seasonMonths": null
  },
  {
    "key": "241-01",
    "name": "건고추 햇산화건",
    "unit": "600g",
    "price": 18350,
    "normal": 18248,
    "minMonth": 11,
    "maxMonth": 8,
    "seasonMonths": null
  },
  {
    "key": "242-00",
    "name": "풋고추",
    "unit": "100g",
    "price": 1655,
    "normal": 1594,
    "minMonth": 12,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "242-02",
    "name": "꽈리고추",
    "unit": "100g",
    "price": 1396,
    "normal": 1414,
    "minMonth": 8,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "242-03",
    "name": "청양고추",
    "unit": "100g",
    "price": 1214,
    "normal": 1097,
    "minMonth": 8,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "242-04",
    "name": "오이맛고추",
    "unit": "100g",
    "price": 1030,
    "normal": 1236,
    "minMonth": 8,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "243-00",
    "name": "붉은고추",
    "unit": "100g",
    "price": 1888,
    "normal": 1426,
    "minMonth": 9,
    "maxMonth": 12,
    "seasonMonths": null
  },
  {
    "key": "245-00",
    "name": "양파",
    "unit": "1kg",
    "price": 1814,
    "normal": 2039,
    "minMonth": 7,
    "maxMonth": 1,
    "seasonMonths": null
  },
  {
    "key": "246-00",
    "name": "대파",
    "unit": "1kg",
    "price": 2747,
    "normal": 2694,
    "minMonth": 4,
    "maxMonth": 12,
    "seasonMonths": null
  },
  {
    "key": "246-02",
    "name": "쪽파",
    "unit": "1kg",
    "price": 11497,
    "normal": 8697,
    "minMonth": 4,
    "maxMonth": 8,
    "seasonMonths": null
  },
  {
    "key": "247-00",
    "name": "생강",
    "unit": "1kg",
    "price": 17200,
    "normal": 14360,
    "minMonth": 11,
    "maxMonth": 6,
    "seasonMonths": null
  },
  {
    "key": "248-00",
    "name": "국산고춧가루",
    "unit": "1kg",
    "price": 37256,
    "normal": 36621,
    "minMonth": 12,
    "maxMonth": 8,
    "seasonMonths": null
  },
  {
    "key": "248-01",
    "name": "중국고춧가루",
    "unit": "1kg",
    "price": 14000,
    "normal": 13333,
    "minMonth": 10,
    "maxMonth": 8,
    "seasonMonths": null
  },
  {
    "key": "251-00",
    "name": "가지",
    "unit": "3개",
    "price": 2029,
    "normal": 1829,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9
    ]
  },
  {
    "key": "252-00",
    "name": "미나리",
    "unit": "100g",
    "price": 2061,
    "normal": 1793,
    "minMonth": 5,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "253-00",
    "name": "깻잎",
    "unit": "50g",
    "price": 1634,
    "normal": 1694,
    "minMonth": 7,
    "maxMonth": 1,
    "seasonMonths": null
  },
  {
    "key": "254-00",
    "name": "부추",
    "unit": "100g",
    "price": 850,
    "normal": 816,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9
    ]
  },
  {
    "key": "255-00",
    "name": "피망",
    "unit": "100g",
    "price": 1709,
    "normal": 1329,
    "minMonth": 8,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "256-00",
    "name": "파프리카",
    "unit": "1개",
    "price": 2031,
    "normal": 1984,
    "minMonth": 7,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "257-00",
    "name": "멜론",
    "unit": "1개",
    "price": 8339,
    "normal": 9769,
    "minMonth": 8,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "258-01",
    "name": "깐마늘(국산)",
    "unit": "1kg",
    "price": 10683,
    "normal": 10029,
    "minMonth": 11,
    "maxMonth": 6,
    "seasonMonths": null
  },
  {
    "key": "279-00",
    "name": "알배기배추",
    "unit": "1포기",
    "price": 4337,
    "normal": 4627,
    "minMonth": 7,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "280-00",
    "name": "브로콜리",
    "unit": "1개",
    "price": 3768,
    "normal": 3808,
    "minMonth": 7,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "411-05",
    "name": "후지사과",
    "unit": "10개",
    "price": 27400,
    "normal": 24368,
    "minMonth": 7,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "411-06",
    "name": "아오리사과",
    "unit": "10개",
    "price": 18233,
    "normal": 18348,
    "minMonth": 8,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "411-07",
    "name": "홍로사과",
    "unit": "10개",
    "price": 26363,
    "normal": 26303,
    "minMonth": 7,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "412-01",
    "name": "신고배",
    "unit": "10개",
    "price": 43300,
    "normal": 25868,
    "minMonth": 11,
    "maxMonth": 7,
    "seasonMonths": null
  },
  {
    "key": "412-04",
    "name": "원황배",
    "unit": "10개",
    "price": 25363,
    "normal": 24434,
    "minMonth": 11,
    "maxMonth": 7,
    "seasonMonths": null
  },
  {
    "key": "413-01",
    "name": "복숭아",
    "unit": "10개",
    "price": 17333,
    "normal": 23399,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      7,
      8,
      9
    ]
  },
  {
    "key": "414-01",
    "name": "캠벨얼리포도",
    "unit": "1kg",
    "price": 7513,
    "normal": 9380,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      7,
      8,
      9,
      10,
      11
    ]
  },
  {
    "key": "414-02",
    "name": "거봉포도",
    "unit": "2kg",
    "price": 18225,
    "normal": 21707,
    "minMonth": 12,
    "maxMonth": 11,
    "seasonMonths": null
  },
  {
    "key": "414-12",
    "name": "샤인머스켓포도",
    "unit": "2kg",
    "price": 14644,
    "normal": 27719,
    "minMonth": 11,
    "maxMonth": 7,
    "seasonMonths": null
  },
  {
    "key": "415-02",
    "name": "감귤",
    "unit": "10개",
    "price": 7834,
    "normal": 8194,
    "minMonth": 11,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "418-02",
    "name": "바나나",
    "unit": "100g",
    "price": 351,
    "normal": 297,
    "minMonth": 8,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "419-02",
    "name": "참다래(키위)",
    "unit": "10개",
    "price": 12193,
    "normal": 8884,
    "minMonth": 12,
    "maxMonth": 5,
    "seasonMonths": null
  },
  {
    "key": "420-02",
    "name": "파인애플",
    "unit": "1개",
    "price": 7213,
    "normal": 6517,
    "minMonth": 3,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "421-06",
    "name": "오렌지",
    "unit": "10개",
    "price": 18300,
    "normal": 13513,
    "minMonth": 5,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "422-01",
    "name": "방울토마토",
    "unit": "1kg",
    "price": 6650,
    "normal": 10774,
    "minMonth": 7,
    "maxMonth": 11,
    "seasonMonths": null
  },
  {
    "key": "422-02",
    "name": "대추방울토마토",
    "unit": "1kg",
    "price": 9249,
    "normal": 10776,
    "minMonth": 7,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "424-00",
    "name": "레몬",
    "unit": "10개",
    "price": 8795,
    "normal": 8663,
    "minMonth": 8,
    "maxMonth": 1,
    "seasonMonths": null
  },
  {
    "key": "425-00",
    "name": "체리",
    "unit": "100g",
    "price": 2336,
    "normal": 2654,
    "minMonth": 3,
    "maxMonth": 5,
    "seasonMonths": null
  },
  {
    "key": "428-00",
    "name": "망고",
    "unit": "1개",
    "price": 7566,
    "normal": 6022,
    "minMonth": 4,
    "maxMonth": 12,
    "seasonMonths": null
  },
  {
    "key": "429-02",
    "name": "블루베리",
    "unit": "1kg",
    "price": 11248,
    "normal": 11653,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9
    ]
  },
  {
    "key": "430-00",
    "name": "아보카도",
    "unit": "1개",
    "price": 1887,
    "normal": 1830,
    "minMonth": 7,
    "maxMonth": 4,
    "seasonMonths": null
  },
  {
    "key": "4301-21",
    "name": "소고기 안심",
    "unit": "100g",
    "price": 18257,
    "normal": 14630,
    "minMonth": 10,
    "maxMonth": 7,
    "seasonMonths": null
  },
  {
    "key": "4301-22",
    "name": "소고기 등심",
    "unit": "100g",
    "price": 14840,
    "normal": 13092,
    "minMonth": 12,
    "maxMonth": 8,
    "seasonMonths": null
  },
  {
    "key": "4301-36",
    "name": "소고기 설도",
    "unit": "100g",
    "price": 5729,
    "normal": 4598,
    "minMonth": 11,
    "maxMonth": 8,
    "seasonMonths": null
  },
  {
    "key": "4301-40",
    "name": "소고기 양지",
    "unit": "100g",
    "price": 7078,
    "normal": 6297,
    "minMonth": 11,
    "maxMonth": 3,
    "seasonMonths": null
  },
  {
    "key": "4301-50",
    "name": "소고기 갈비",
    "unit": "100g",
    "price": 9032,
    "normal": 8221,
    "minMonth": 10,
    "maxMonth": 8,
    "seasonMonths": null
  },
  {
    "key": "4304-25",
    "name": "돼지고기 앞다리",
    "unit": "100g",
    "price": 1643,
    "normal": 1469,
    "minMonth": 11,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "4304-27",
    "name": "돼지고기 삼겹살",
    "unit": "100g",
    "price": 2864,
    "normal": 2677,
    "minMonth": 3,
    "maxMonth": 6,
    "seasonMonths": null
  },
  {
    "key": "4304-28",
    "name": "돼지고기 갈비",
    "unit": "100g",
    "price": 1594,
    "normal": 1476,
    "minMonth": 4,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "4304-68",
    "name": "돼지고기 목심",
    "unit": "100g",
    "price": 2678,
    "normal": 2480,
    "minMonth": 3,
    "maxMonth": 6,
    "seasonMonths": null
  },
  {
    "key": "437-01",
    "name": "키위",
    "unit": "10개",
    "price": 14733,
    "normal": 13655,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9
    ]
  },
  {
    "key": "4401-31",
    "name": "수입 소고기 갈비",
    "unit": "100g",
    "price": 4130,
    "normal": 4015,
    "minMonth": 9,
    "maxMonth": 7,
    "seasonMonths": null
  },
  {
    "key": "4401-37",
    "name": "수입 소고기 갈비살",
    "unit": "100g",
    "price": 4743,
    "normal": 4512,
    "minMonth": 5,
    "maxMonth": 7,
    "seasonMonths": null
  },
  {
    "key": "4402-27",
    "name": "수입 돼지고기 삼겹살",
    "unit": "100g",
    "price": 1518,
    "normal": 1481,
    "minMonth": 4,
    "maxMonth": 7,
    "seasonMonths": null
  },
  {
    "key": "9901-24",
    "name": "닭고기 절단육",
    "unit": "1kg",
    "price": null,
    "normal": 9940,
    "minMonth": 12,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "9901-99",
    "name": "닭고기 육계",
    "unit": "1kg",
    "price": 5702,
    "normal": 5950,
    "minMonth": 12,
    "maxMonth": 4,
    "seasonMonths": null
  },
  {
    "key": "9903-21",
    "name": "계란 10구",
    "unit": "10구",
    "price": 4210,
    "normal": 3601,
    "minMonth": 11,
    "maxMonth": 6,
    "seasonMonths": null
  },
  {
    "key": "9903-23",
    "name": "계란 30구",
    "unit": "30구",
    "price": 7199,
    "normal": 6596,
    "minMonth": 11,
    "maxMonth": 6,
    "seasonMonths": null
  },
  {
    "key": "9908-01",
    "name": "우유",
    "unit": "1L",
    "price": 2968,
    "normal": 2900,
    "minMonth": 5,
    "maxMonth": 8,
    "seasonMonths": null
  }
];
/** 이 파일을 만든 날(YYYYMMDD). 공유 카드 이미지 URL의 캐시 무효화에 쓴다 —
 *  카톡은 OG 이미지를 오래 캐싱해서 주소가 같으면 어제 가격이 계속 보인다. */
export const SEO_BUILD_DAY = '20260906';
export const SEO_BY_KEY: Record<string, SeoItem> = Object.fromEntries(SEO_ITEMS.map((i) => [i.key, i]));

/** 레시피 상세를 정적으로 내리기 위한 목록. 주소는 순번이 아니라 제목 슬러그다. */
export interface SeoRecipe {
  slug: string;
  title: string;
}
export const SEO_RECIPES: SeoRecipe[] = [
  {
    "slug": "함박스테이크",
    "title": "함박스테이크"
  },
  {
    "slug": "닭가슴살-두부선",
    "title": "닭가슴살 두부선"
  },
  {
    "slug": "돼지고기-숙주덮밥",
    "title": "돼지고기 숙주덮밥"
  },
  {
    "slug": "견과류통삼겹살찜",
    "title": "견과류통삼겹살찜"
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
    "slug": "완자된장국",
    "title": "완자된장국"
  },
  {
    "slug": "굴림만두된장국",
    "title": "굴림만두된장국"
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
    "slug": "떡완자조림",
    "title": "떡완자조림"
  },
  {
    "slug": "삼계치킨롤",
    "title": "삼계치킨롤"
  },
  {
    "slug": "오색볶음면",
    "title": "오색볶음면"
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
    "slug": "된장-두부찌개",
    "title": "된장 두부찌개"
  },
  {
    "slug": "묵은지가지말이",
    "title": "묵은지가지말이"
  },
  {
    "slug": "수박즙돼지목심구이",
    "title": "수박즙돼지목심구이"
  },
  {
    "slug": "맑은부대찌개",
    "title": "맑은부대찌개"
  },
  {
    "slug": "나가사키부대찌개",
    "title": "나가사키부대찌개"
  },
  {
    "slug": "꽃밥",
    "title": "꽃밥"
  },
  {
    "slug": "토마토두루치기",
    "title": "토마토두루치기"
  },
  {
    "slug": "두유-마-떡갈비",
    "title": "두유 마 떡갈비"
  },
  {
    "slug": "떡갈비와-미니잡곡밥",
    "title": "떡갈비와 미니잡곡밥"
  },
  {
    "slug": "닭고기라이스롤",
    "title": "닭고기라이스롤"
  },
  {
    "slug": "떡갈비주먹밥",
    "title": "떡갈비주먹밥"
  },
  {
    "slug": "미니함박스테이크",
    "title": "미니함박스테이크"
  },
  {
    "slug": "닭고기또띠아",
    "title": "닭고기또띠아"
  },
  {
    "slug": "카레닭-룰라이드",
    "title": "카레닭 룰라이드"
  }
];
