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
    "price": 61404,
    "normal": 54046,
    "minMonth": 8,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "111-10",
    "name": "쌀 10kg",
    "unit": "10kg",
    "price": 33883,
    "normal": 30500,
    "minMonth": 8,
    "maxMonth": 3,
    "seasonMonths": null
  },
  {
    "key": "112-01",
    "name": "찹쌀",
    "unit": "1kg",
    "price": 5201,
    "normal": 4279,
    "minMonth": 7,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "113-01",
    "name": "혼식곡",
    "unit": "1kg",
    "price": 7406,
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
    "price": 5672,
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
    "price": 5234,
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
    "price": 5005,
    "normal": 5218,
    "minMonth": 2,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "142-00",
    "name": "팥",
    "unit": "500g",
    "price": 13595,
    "normal": 9151,
    "minMonth": 5,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "143-00",
    "name": "녹두",
    "unit": "500g",
    "price": 10822,
    "normal": 11452,
    "minMonth": 2,
    "maxMonth": 8,
    "seasonMonths": null
  },
  {
    "key": "151-00",
    "name": "고구마",
    "unit": "1kg",
    "price": 4562,
    "normal": 5566,
    "minMonth": 7,
    "maxMonth": 5,
    "seasonMonths": null
  },
  {
    "key": "152-01",
    "name": "감자",
    "unit": "100g",
    "price": 286,
    "normal": 335,
    "minMonth": 9,
    "maxMonth": 4,
    "seasonMonths": null
  },
  {
    "key": "211-02",
    "name": "배추",
    "unit": "1포기",
    "price": 5877,
    "normal": 6765,
    "minMonth": 5,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "212-00",
    "name": "양배추",
    "unit": "1포기",
    "price": 3057,
    "normal": 4304,
    "minMonth": 5,
    "maxMonth": 3,
    "seasonMonths": null
  },
  {
    "key": "213-00",
    "name": "시금치",
    "unit": "100g",
    "price": 1770,
    "normal": 2543,
    "minMonth": 4,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "214-01",
    "name": "적상추",
    "unit": "100g",
    "price": 1771,
    "normal": 1884,
    "minMonth": 5,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "214-02",
    "name": "청상추",
    "unit": "100g",
    "price": 1826,
    "normal": 2140,
    "minMonth": 5,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "215-00",
    "name": "얼갈이배추",
    "unit": "1kg",
    "price": 3297,
    "normal": 4166,
    "minMonth": 6,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "221-00",
    "name": "수박",
    "unit": "1개",
    "price": 23233,
    "normal": 26939,
    "minMonth": 7,
    "maxMonth": 3,
    "seasonMonths": null
  },
  {
    "key": "222-00",
    "name": "참외",
    "unit": "10개",
    "price": 16621,
    "normal": 25193,
    "minMonth": 7,
    "maxMonth": 3,
    "seasonMonths": null
  },
  {
    "key": "223-01",
    "name": "가시오이",
    "unit": "10개",
    "price": 12311,
    "normal": 13443,
    "minMonth": 5,
    "maxMonth": 1,
    "seasonMonths": null
  },
  {
    "key": "223-02",
    "name": "다다기오이",
    "unit": "10개",
    "price": 10743,
    "normal": 12079,
    "minMonth": 5,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "223-03",
    "name": "취청오이",
    "unit": "10개",
    "price": 14695,
    "normal": 14663,
    "minMonth": 6,
    "maxMonth": 1,
    "seasonMonths": null
  },
  {
    "key": "224-01",
    "name": "애호박",
    "unit": "1개",
    "price": 2279,
    "normal": 2138,
    "minMonth": 5,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "224-02",
    "name": "쥬키니호박",
    "unit": "1개",
    "price": 2516,
    "normal": 2439,
    "minMonth": 5,
    "maxMonth": 11,
    "seasonMonths": null
  },
  {
    "key": "225-00",
    "name": "토마토",
    "unit": "1kg",
    "price": 7217,
    "normal": 7462,
    "minMonth": 7,
    "maxMonth": 11,
    "seasonMonths": null
  },
  {
    "key": "231-02",
    "name": "무",
    "unit": "1개",
    "price": 2134,
    "normal": 2711,
    "minMonth": 4,
    "maxMonth": 12,
    "seasonMonths": null
  },
  {
    "key": "232-01",
    "name": "당근",
    "unit": "1kg",
    "price": 3827,
    "normal": 4992,
    "minMonth": 4,
    "maxMonth": 5,
    "seasonMonths": null
  },
  {
    "key": "233-00",
    "name": "열무",
    "unit": "1kg",
    "price": 3170,
    "normal": 4065,
    "minMonth": 6,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "241-00",
    "name": "건고추",
    "unit": "600g",
    "price": 17588,
    "normal": 17741,
    "minMonth": 10,
    "maxMonth": 11,
    "seasonMonths": null
  },
  {
    "key": "242-00",
    "name": "풋고추(녹광 등)",
    "unit": "100g",
    "price": 2071,
    "normal": 1852,
    "minMonth": 12,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "242-02",
    "name": "꽈리고추",
    "unit": "100g",
    "price": 1529,
    "normal": 1835,
    "minMonth": 8,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "242-03",
    "name": "청양고추",
    "unit": "100g",
    "price": 1405,
    "normal": 1422,
    "minMonth": 11,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "242-04",
    "name": "오이맛고추",
    "unit": "100g",
    "price": 1262,
    "normal": 1344,
    "minMonth": 8,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "243-00",
    "name": "붉은고추",
    "unit": "100g",
    "price": 2396,
    "normal": 1820,
    "minMonth": 8,
    "maxMonth": 12,
    "seasonMonths": null
  },
  {
    "key": "245-00",
    "name": "양파",
    "unit": "1kg",
    "price": 1874,
    "normal": 2082,
    "minMonth": 7,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "246-00",
    "name": "대파",
    "unit": "1kg",
    "price": 2875,
    "normal": 3237,
    "minMonth": 4,
    "maxMonth": 12,
    "seasonMonths": null
  },
  {
    "key": "246-02",
    "name": "쪽파",
    "unit": "1kg",
    "price": 9446,
    "normal": 9101,
    "minMonth": 4,
    "maxMonth": 8,
    "seasonMonths": null
  },
  {
    "key": "247-00",
    "name": "생강",
    "unit": "1kg",
    "price": 15141,
    "normal": 14221,
    "minMonth": 11,
    "maxMonth": 7,
    "seasonMonths": null
  },
  {
    "key": "248-00",
    "name": "국산고춧가루",
    "unit": "1kg",
    "price": 33700,
    "normal": 34223,
    "minMonth": 12,
    "maxMonth": 8,
    "seasonMonths": null
  },
  {
    "key": "248-01",
    "name": "중국고춧가루",
    "unit": "1kg",
    "price": 13544,
    "normal": 13085,
    "minMonth": 10,
    "maxMonth": 8,
    "seasonMonths": null
  },
  {
    "key": "251-00",
    "name": "가지",
    "unit": "3개",
    "price": 2598,
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
    "price": 1931,
    "normal": 1685,
    "minMonth": 5,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "253-00",
    "name": "깻잎",
    "unit": "50g",
    "price": 1910,
    "normal": 1597,
    "minMonth": 7,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "254-00",
    "name": "부추",
    "unit": "100g",
    "price": 841,
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
    "price": 2503,
    "normal": 1310,
    "minMonth": 8,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "256-00",
    "name": "파프리카",
    "unit": "1개",
    "price": 2536,
    "normal": 2310,
    "minMonth": 7,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "257-00",
    "name": "멜론",
    "unit": "1개",
    "price": 9136,
    "normal": 10370,
    "minMonth": 8,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "258-01",
    "name": "깐마늘(국산)",
    "unit": "1kg",
    "price": 10598,
    "normal": 10624,
    "minMonth": 11,
    "maxMonth": 6,
    "seasonMonths": null
  },
  {
    "key": "279-00",
    "name": "알배기배추",
    "unit": "1포기",
    "price": 4600,
    "normal": 5055,
    "minMonth": 7,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "280-00",
    "name": "브로콜리",
    "unit": "1개",
    "price": 3931,
    "normal": 3992,
    "minMonth": 7,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "411-07",
    "name": "사과",
    "unit": "10개",
    "price": 22936,
    "normal": 27413,
    "minMonth": 9,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "412-01",
    "name": "신고배",
    "unit": "10개",
    "price": 30914,
    "normal": 31609,
    "minMonth": 11,
    "maxMonth": 7,
    "seasonMonths": null
  },
  {
    "key": "412-04",
    "name": "원황배",
    "unit": "10개",
    "price": 31238,
    "normal": 29770,
    "minMonth": 11,
    "maxMonth": 7,
    "seasonMonths": null
  },
  {
    "key": "413-01",
    "name": "복숭아",
    "unit": "10개",
    "price": 19405,
    "normal": 24104,
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
    "price": 6856,
    "normal": 9197,
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
    "price": 17829,
    "normal": 23479,
    "minMonth": 1,
    "maxMonth": 11,
    "seasonMonths": null
  },
  {
    "key": "414-12",
    "name": "샤인머스켓포도",
    "unit": "2kg",
    "price": 12982,
    "normal": 27582,
    "minMonth": 11,
    "maxMonth": 7,
    "seasonMonths": null
  },
  {
    "key": "415-02",
    "name": "감귤",
    "unit": "10개",
    "price": 7354,
    "normal": 9284,
    "minMonth": 11,
    "maxMonth": 3,
    "seasonMonths": null
  },
  {
    "key": "418-02",
    "name": "바나나",
    "unit": "100g",
    "price": 333,
    "normal": 320,
    "minMonth": 8,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "420-02",
    "name": "파인애플",
    "unit": "1개",
    "price": 7386,
    "normal": 7398,
    "minMonth": 3,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "421-06",
    "name": "오렌지",
    "unit": "10개",
    "price": 11272,
    "normal": 12079,
    "minMonth": 9,
    "maxMonth": 2,
    "seasonMonths": null
  },
  {
    "key": "422-01",
    "name": "방울토마토",
    "unit": "1kg",
    "price": 8324,
    "normal": 11041,
    "minMonth": 7,
    "maxMonth": 11,
    "seasonMonths": null
  },
  {
    "key": "422-02",
    "name": "대추방울토마토",
    "unit": "1kg",
    "price": 9182,
    "normal": 11722,
    "minMonth": 7,
    "maxMonth": 11,
    "seasonMonths": null
  },
  {
    "key": "424-00",
    "name": "레몬",
    "unit": "10개",
    "price": 7539,
    "normal": 9769,
    "minMonth": 9,
    "maxMonth": 1,
    "seasonMonths": null
  },
  {
    "key": "425-00",
    "name": "체리",
    "unit": "100g",
    "price": 2019,
    "normal": 2813,
    "minMonth": 3,
    "maxMonth": 5,
    "seasonMonths": null
  },
  {
    "key": "428-00",
    "name": "망고",
    "unit": "1개",
    "price": 7787,
    "normal": 7045,
    "minMonth": 4,
    "maxMonth": 9,
    "seasonMonths": null
  },
  {
    "key": "429-02",
    "name": "블루베리",
    "unit": "1kg",
    "price": 11480,
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
    "price": 1898,
    "normal": 1967,
    "minMonth": 7,
    "maxMonth": 4,
    "seasonMonths": null
  },
  {
    "key": "4301-21",
    "name": "소고기 안심",
    "unit": "100g",
    "price": 19625,
    "normal": 14629,
    "minMonth": 10,
    "maxMonth": 7,
    "seasonMonths": null
  },
  {
    "key": "4301-22",
    "name": "소고기 등심",
    "unit": "100g",
    "price": 16538,
    "normal": 13698,
    "minMonth": 12,
    "maxMonth": 8,
    "seasonMonths": null
  },
  {
    "key": "4301-36",
    "name": "소고기 설도",
    "unit": "100g",
    "price": 5841,
    "normal": 4593,
    "minMonth": 11,
    "maxMonth": 8,
    "seasonMonths": null
  },
  {
    "key": "4301-40",
    "name": "소고기 양지",
    "unit": "100g",
    "price": 7889,
    "normal": 6423,
    "minMonth": 11,
    "maxMonth": 3,
    "seasonMonths": null
  },
  {
    "key": "4301-50",
    "name": "소고기 갈비",
    "unit": "100g",
    "price": 8081,
    "normal": 8019,
    "minMonth": 10,
    "maxMonth": 8,
    "seasonMonths": null
  },
  {
    "key": "4304-25",
    "name": "돼지고기 앞다리",
    "unit": "100g",
    "price": 1675,
    "normal": 1476,
    "minMonth": 11,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "4304-27",
    "name": "돼지고기 삼겹살",
    "unit": "100g",
    "price": 2931,
    "normal": 2744,
    "minMonth": 3,
    "maxMonth": 6,
    "seasonMonths": null
  },
  {
    "key": "4304-28",
    "name": "돼지고기 갈비",
    "unit": "100g",
    "price": 1666,
    "normal": 1509,
    "minMonth": 4,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "4304-68",
    "name": "돼지고기 목심",
    "unit": "100g",
    "price": 2741,
    "normal": 2582,
    "minMonth": 3,
    "maxMonth": 6,
    "seasonMonths": null
  },
  {
    "key": "437-01",
    "name": "키위",
    "unit": "10개",
    "price": 12633,
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
    "price": 4274,
    "normal": 4165,
    "minMonth": 9,
    "maxMonth": 7,
    "seasonMonths": null
  },
  {
    "key": "4401-37",
    "name": "수입 소고기 갈비살",
    "unit": "100g",
    "price": 5290,
    "normal": 4594,
    "minMonth": 5,
    "maxMonth": 7,
    "seasonMonths": null
  },
  {
    "key": "4402-27",
    "name": "수입 돼지고기 삼겹살",
    "unit": "100g",
    "price": 1531,
    "normal": 1486,
    "minMonth": 4,
    "maxMonth": 7,
    "seasonMonths": null
  },
  {
    "key": "9901-24",
    "name": "닭고기 절단육",
    "unit": "1kg",
    "price": null,
    "normal": 8593,
    "minMonth": 12,
    "maxMonth": 10,
    "seasonMonths": null
  },
  {
    "key": "9901-99",
    "name": "닭고기 육계",
    "unit": "1kg",
    "price": 5723,
    "normal": 5784,
    "minMonth": 12,
    "maxMonth": 4,
    "seasonMonths": null
  },
  {
    "key": "9903-21",
    "name": "계란 10구",
    "unit": "10구",
    "price": 4194,
    "normal": 3577,
    "minMonth": 11,
    "maxMonth": 6,
    "seasonMonths": null
  },
  {
    "key": "9903-23",
    "name": "계란 30구",
    "unit": "30구",
    "price": 7110,
    "normal": 6326,
    "minMonth": 11,
    "maxMonth": 6,
    "seasonMonths": null
  },
  {
    "key": "9908-01",
    "name": "우유",
    "unit": "1L",
    "price": 2973,
    "normal": 2906,
    "minMonth": 5,
    "maxMonth": 8,
    "seasonMonths": null
  }
];
/** 이 파일을 만든 날(YYYYMMDD). 공유 카드 이미지 URL의 캐시 무효화에 쓴다 —
 *  카톡은 OG 이미지를 오래 캐싱해서 주소가 같으면 어제 가격이 계속 보인다. */
export const SEO_BUILD_DAY = '20260919';
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
