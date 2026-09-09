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
    "price": 61210,
    "normal": 55323,
    "minMonth": 8,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "111-10",
    "name": "쌀 10kg",
    "unit": "10kg",
    "price": 34702,
    "normal": 29974,
    "minMonth": 8,
    "maxMonth": 3,
    "seasonMonths": null
  },
  {
    "key": "112-01",
    "name": "찹쌀",
    "unit": "1kg",
    "price": 5193,
    "normal": 4274,
    "minMonth": 7,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "113-01",
    "name": "혼식곡",
    "unit": "1kg",
    "price": 7787,
    "normal": null,
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
    "price": 5710,
    "normal": null,
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
    "price": 5163,
    "normal": null,
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
    "price": 5053,
    "normal": 5289,
    "minMonth": 12,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "142-00",
    "name": "팥",
    "unit": "500g",
    "price": 13709,
    "normal": 9147,
    "minMonth": 12,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "143-00",
    "name": "녹두",
    "unit": "500g",
    "price": 12216,
    "normal": 11457,
    "minMonth": 2,
    "maxMonth": 8,
    "seasonMonths": null
  },
  {
    "key": "151-00",
    "name": "고구마",
    "unit": "1kg",
    "price": 4414,
    "normal": 5773,
    "minMonth": 7,
    "maxMonth": 5,
    "seasonMonths": null
  },
  {
    "key": "152-01",
    "name": "감자",
    "unit": "100g",
    "price": 320,
    "normal": 357,
    "minMonth": 8,
    "maxMonth": 4,
    "seasonMonths": null
  },
  {
    "key": "211-02",
    "name": "배추",
    "unit": "1포기",
    "price": 6141,
    "normal": 6404,
    "minMonth": 5,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "212-00",
    "name": "양배추",
    "unit": "1포기",
    "price": 3081,
    "normal": 4148,
    "minMonth": 5,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "213-00",
    "name": "시금치",
    "unit": "100g",
    "price": 2404,
    "normal": 2762,
    "minMonth": 4,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "214-01",
    "name": "적상추",
    "unit": "100g",
    "price": 1880,
    "normal": 1866,
    "minMonth": 5,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "214-02",
    "name": "청상추",
    "unit": "100g",
    "price": 1919,
    "normal": 2107,
    "minMonth": 5,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "215-00",
    "name": "얼갈이배추",
    "unit": "1kg",
    "price": 3783,
    "normal": 4329,
    "minMonth": 5,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "221-00",
    "name": "수박",
    "unit": "1개",
    "price": 24028,
    "normal": 28286,
    "minMonth": 7,
    "maxMonth": 3,
    "seasonMonths": null
  },
  {
    "key": "222-00",
    "name": "참외",
    "unit": "10개",
    "price": 17086,
    "normal": 24536,
    "minMonth": 7,
    "maxMonth": 3,
    "seasonMonths": null
  },
  {
    "key": "223-01",
    "name": "가시오이",
    "unit": "10개",
    "price": 11180,
    "normal": 13969,
    "minMonth": 6,
    "maxMonth": 1,
    "seasonMonths": null
  },
  {
    "key": "223-02",
    "name": "다다기오이",
    "unit": "10개",
    "price": 11452,
    "normal": 12963,
    "minMonth": 5,
    "maxMonth": 1,
    "seasonMonths": null
  },
  {
    "key": "223-03",
    "name": "취청오이",
    "unit": "10개",
    "price": 14354,
    "normal": 15586,
    "minMonth": 6,
    "maxMonth": 1,
    "seasonMonths": null
  },
  {
    "key": "224-01",
    "name": "애호박",
    "unit": "1개",
    "price": 2791,
    "normal": 2169,
    "minMonth": 5,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "224-02",
    "name": "쥬키니호박",
    "unit": "1개",
    "price": 2165,
    "normal": 2155,
    "minMonth": 5,
    "maxMonth": 11,
    "seasonMonths": null
  },
  {
    "key": "225-00",
    "name": "토마토",
    "unit": "1kg",
    "price": 6016,
    "normal": 7103,
    "minMonth": 7,
    "maxMonth": 11,
    "seasonMonths": null
  },
  {
    "key": "231-02",
    "name": "무",
    "unit": "1개",
    "price": 2400,
    "normal": 2823,
    "minMonth": 7,
    "maxMonth": 12,
    "seasonMonths": null
  },
  {
    "key": "232-01",
    "name": "당근",
    "unit": "1kg",
    "price": 3947,
    "normal": 4836,
    "minMonth": 11,
    "maxMonth": 5,
    "seasonMonths": null
  },
  {
    "key": "233-00",
    "name": "열무",
    "unit": "1kg",
    "price": 3780,
    "normal": 4327,
    "minMonth": 5,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "241-00",
    "name": "건고추 화건",
    "unit": "600g",
    "price": 17847,
    "normal": 17980,
    "minMonth": 10,
    "maxMonth": 8,
    "seasonMonths": null
  },
  {
    "key": "241-01",
    "name": "건고추 햇산화건",
    "unit": "600g",
    "price": 17454,
    "normal": 17351,
    "minMonth": 11,
    "maxMonth": 4,
    "seasonMonths": null
  },
  {
    "key": "242-00",
    "name": "풋고추(녹광 등)",
    "unit": "100g",
    "price": 1647,
    "normal": 1585,
    "minMonth": 12,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "242-02",
    "name": "꽈리고추",
    "unit": "100g",
    "price": 1412,
    "normal": 1715,
    "minMonth": 8,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "242-03",
    "name": "청양고추",
    "unit": "100g",
    "price": 1198,
    "normal": 1238,
    "minMonth": 11,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "242-04",
    "name": "오이맛고추",
    "unit": "100g",
    "price": 1106,
    "normal": 1205,
    "minMonth": 5,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "243-00",
    "name": "붉은고추",
    "unit": "100g",
    "price": 1966,
    "normal": 1676,
    "minMonth": 9,
    "maxMonth": 12,
    "seasonMonths": null
  },
  {
    "key": "245-00",
    "name": "양파",
    "unit": "1kg",
    "price": 1869,
    "normal": 2116,
    "minMonth": 7,
    "maxMonth": 1,
    "seasonMonths": null
  },
  {
    "key": "246-00",
    "name": "대파",
    "unit": "1kg",
    "price": 2649,
    "normal": 3092,
    "minMonth": 4,
    "maxMonth": 12,
    "seasonMonths": null
  },
  {
    "key": "246-02",
    "name": "쪽파",
    "unit": "1kg",
    "price": 9445,
    "normal": 9499,
    "minMonth": 4,
    "maxMonth": 8,
    "seasonMonths": null
  },
  {
    "key": "247-00",
    "name": "생강",
    "unit": "1kg",
    "price": 15111,
    "normal": 13844,
    "minMonth": 11,
    "maxMonth": 6,
    "seasonMonths": null
  },
  {
    "key": "248-00",
    "name": "국산고춧가루",
    "unit": "1kg",
    "price": 33504,
    "normal": 34137,
    "minMonth": 12,
    "maxMonth": 8,
    "seasonMonths": null
  },
  {
    "key": "248-01",
    "name": "중국고춧가루",
    "unit": "1kg",
    "price": 13544,
    "normal": 13088,
    "minMonth": 10,
    "maxMonth": 8,
    "seasonMonths": null
  },
  {
    "key": "251-00",
    "name": "가지",
    "unit": "3개",
    "price": 2164,
    "normal": null,
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
    "price": 1837,
    "normal": 1662,
    "minMonth": 5,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "253-00",
    "name": "깻잎",
    "unit": "50g",
    "price": 1660,
    "normal": 1544,
    "minMonth": 7,
    "maxMonth": 1,
    "seasonMonths": null
  },
  {
    "key": "254-00",
    "name": "부추",
    "unit": "100g",
    "price": 861,
    "normal": null,
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
    "price": 1679,
    "normal": 1268,
    "minMonth": 8,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "256-00",
    "name": "파프리카",
    "unit": "1개",
    "price": 2070,
    "normal": 2250,
    "minMonth": 7,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "257-00",
    "name": "멜론",
    "unit": "1개",
    "price": 9165,
    "normal": 10324,
    "minMonth": 8,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "258-01",
    "name": "깐마늘(국산)",
    "unit": "1kg",
    "price": 11473,
    "normal": 11092,
    "minMonth": 11,
    "maxMonth": 6,
    "seasonMonths": null
  },
  {
    "key": "279-00",
    "name": "알배기배추",
    "unit": "1포기",
    "price": 4327,
    "normal": 4845,
    "minMonth": 7,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "280-00",
    "name": "브로콜리",
    "unit": "1개",
    "price": 3700,
    "normal": 3627,
    "minMonth": 7,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "411-05",
    "name": "후지사과",
    "unit": "10개",
    "price": 29139,
    "normal": null,
    "minMonth": 7,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "411-06",
    "name": "아오리사과",
    "unit": "10개",
    "price": 19545,
    "normal": 23600,
    "minMonth": 8,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "411-07",
    "name": "홍로사과",
    "unit": "10개",
    "price": 23009,
    "normal": 28015,
    "minMonth": 7,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "412-01",
    "name": "신고배",
    "unit": "10개",
    "price": 45992,
    "normal": 31255,
    "minMonth": 11,
    "maxMonth": 7,
    "seasonMonths": null
  },
  {
    "key": "412-04",
    "name": "원황배",
    "unit": "10개",
    "price": 25402,
    "normal": 30020,
    "minMonth": 11,
    "maxMonth": 7,
    "seasonMonths": null
  },
  {
    "key": "413-01",
    "name": "복숭아",
    "unit": "10개",
    "price": 18767,
    "normal": 23811,
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
    "price": 7282,
    "normal": 9354,
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
    "price": 18698,
    "normal": 22770,
    "minMonth": 12,
    "maxMonth": 11,
    "seasonMonths": null
  },
  {
    "key": "414-12",
    "name": "샤인머스켓포도",
    "unit": "2kg",
    "price": 14564,
    "normal": 30486,
    "minMonth": 11,
    "maxMonth": 7,
    "seasonMonths": null
  },
  {
    "key": "415-02",
    "name": "감귤",
    "unit": "10개",
    "price": 7381,
    "normal": 9477,
    "minMonth": 11,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "418-02",
    "name": "바나나",
    "unit": "100g",
    "price": 338,
    "normal": 320,
    "minMonth": 8,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "419-02",
    "name": "참다래(키위)",
    "unit": "10개",
    "price": 11695,
    "normal": 9053,
    "minMonth": 12,
    "maxMonth": 5,
    "seasonMonths": null
  },
  {
    "key": "420-02",
    "name": "파인애플",
    "unit": "1개",
    "price": 7433,
    "normal": 7266,
    "minMonth": 3,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "421-06",
    "name": "오렌지",
    "unit": "10개",
    "price": 17878,
    "normal": 14513,
    "minMonth": 5,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "422-01",
    "name": "방울토마토",
    "unit": "1kg",
    "price": 6847,
    "normal": 10847,
    "minMonth": 7,
    "maxMonth": 11,
    "seasonMonths": null
  },
  {
    "key": "422-02",
    "name": "대추방울토마토",
    "unit": "1kg",
    "price": 8251,
    "normal": 10445,
    "minMonth": 7,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "424-00",
    "name": "레몬",
    "unit": "10개",
    "price": 8968,
    "normal": 9999,
    "minMonth": 8,
    "maxMonth": 1,
    "seasonMonths": null
  },
  {
    "key": "425-00",
    "name": "체리",
    "unit": "100g",
    "price": 2189,
    "normal": 2817,
    "minMonth": 3,
    "maxMonth": 5,
    "seasonMonths": null
  },
  {
    "key": "428-00",
    "name": "망고",
    "unit": "1개",
    "price": 6974,
    "normal": 6897,
    "minMonth": 4,
    "maxMonth": 12,
    "seasonMonths": null
  },
  {
    "key": "429-02",
    "name": "블루베리",
    "unit": "1kg",
    "price": 11491,
    "normal": null,
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
    "price": 1797,
    "normal": 1858,
    "minMonth": 7,
    "maxMonth": 4,
    "seasonMonths": null
  },
  {
    "key": "4301-21",
    "name": "소고기 안심",
    "unit": "100g",
    "price": 18621,
    "normal": 14672,
    "minMonth": 10,
    "maxMonth": 7,
    "seasonMonths": null
  },
  {
    "key": "4301-22",
    "name": "소고기 등심",
    "unit": "100g",
    "price": 15324,
    "normal": 13339,
    "minMonth": 12,
    "maxMonth": 8,
    "seasonMonths": null
  },
  {
    "key": "4301-36",
    "name": "소고기 설도",
    "unit": "100g",
    "price": 5822,
    "normal": 4536,
    "minMonth": 11,
    "maxMonth": 8,
    "seasonMonths": null
  },
  {
    "key": "4301-40",
    "name": "소고기 양지",
    "unit": "100g",
    "price": 7220,
    "normal": 6278,
    "minMonth": 11,
    "maxMonth": 3,
    "seasonMonths": null
  },
  {
    "key": "4301-50",
    "name": "소고기 갈비",
    "unit": "100g",
    "price": 9032,
    "normal": 8304,
    "minMonth": 10,
    "maxMonth": 8,
    "seasonMonths": null
  },
  {
    "key": "4304-25",
    "name": "돼지고기 앞다리",
    "unit": "100g",
    "price": 1666,
    "normal": 1477,
    "minMonth": 11,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "4304-27",
    "name": "돼지고기 삼겹살",
    "unit": "100g",
    "price": 3004,
    "normal": 2665,
    "minMonth": 3,
    "maxMonth": 6,
    "seasonMonths": null
  },
  {
    "key": "4304-28",
    "name": "돼지고기 갈비",
    "unit": "100g",
    "price": 1594,
    "normal": 1490,
    "minMonth": 4,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "4304-68",
    "name": "돼지고기 목심",
    "unit": "100g",
    "price": 2811,
    "normal": 2540,
    "minMonth": 3,
    "maxMonth": 6,
    "seasonMonths": null
  },
  {
    "key": "437-01",
    "name": "키위",
    "unit": "10개",
    "price": 13976,
    "normal": null,
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
    "price": 4253,
    "normal": 4117,
    "minMonth": 9,
    "maxMonth": 7,
    "seasonMonths": null
  },
  {
    "key": "4401-37",
    "name": "수입 소고기 갈비살",
    "unit": "100g",
    "price": 4698,
    "normal": 4590,
    "minMonth": 5,
    "maxMonth": 7,
    "seasonMonths": null
  },
  {
    "key": "4402-27",
    "name": "수입 돼지고기 삼겹살",
    "unit": "100g",
    "price": 1526,
    "normal": 1484,
    "minMonth": 4,
    "maxMonth": 7,
    "seasonMonths": null
  },
  {
    "key": "9901-24",
    "name": "닭고기 절단육",
    "unit": "1kg",
    "price": null,
    "normal": 9328,
    "minMonth": 12,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "9901-99",
    "name": "닭고기 육계",
    "unit": "1kg",
    "price": 5689,
    "normal": 5922,
    "minMonth": 12,
    "maxMonth": 4,
    "seasonMonths": null
  },
  {
    "key": "9903-21",
    "name": "계란 10구",
    "unit": "10구",
    "price": 4188,
    "normal": 3601,
    "minMonth": 11,
    "maxMonth": 6,
    "seasonMonths": null
  },
  {
    "key": "9903-23",
    "name": "계란 30구",
    "unit": "30구",
    "price": 7158,
    "normal": 6501,
    "minMonth": 11,
    "maxMonth": 6,
    "seasonMonths": null
  },
  {
    "key": "9908-01",
    "name": "우유",
    "unit": "1L",
    "price": 2970,
    "normal": 2903,
    "minMonth": 5,
    "maxMonth": 8,
    "seasonMonths": null
  }
];
/** 이 파일을 만든 날(YYYYMMDD). 공유 카드 이미지 URL의 캐시 무효화에 쓴다 —
 *  카톡은 OG 이미지를 오래 캐싱해서 주소가 같으면 어제 가격이 계속 보인다. */
export const SEO_BUILD_DAY = '20260909';
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
