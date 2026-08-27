// 자동 생성 — scripts/gen-seo.mjs. 직접 수정 금지.
// 검색엔진용 품목 목록. 이름은 앱의 labelOf(홈 목록과 동일 규칙)로 만들어진다.
export interface SeoItem {
  key: string;
  name: string;
  unit: string;
  /** 빌드 시점 가격 — 정적 HTML의 제목에 쓴다. 라이브 값이 오면 그걸로 덮는다. */
  price: number | null;
}
export const SEO_ITEMS: SeoItem[] = [
  {
    "key": "111-01",
    "name": "쌀 20kg",
    "unit": "20kg",
    "price": 61446
  },
  {
    "key": "111-10",
    "name": "쌀 10kg",
    "unit": "10kg",
    "price": 34365
  },
  {
    "key": "112-01",
    "name": "찹쌀",
    "unit": "1kg",
    "price": 5249
  },
  {
    "key": "141-01",
    "name": "콩",
    "unit": "500g",
    "price": 5043
  },
  {
    "key": "142-00",
    "name": "팥",
    "unit": "500g",
    "price": 13723
  },
  {
    "key": "143-00",
    "name": "녹두",
    "unit": "500g",
    "price": 12186
  },
  {
    "key": "151-00",
    "name": "고구마",
    "unit": "1kg",
    "price": 5406
  },
  {
    "key": "152-01",
    "name": "감자",
    "unit": "100g",
    "price": 335
  },
  {
    "key": "211-02",
    "name": "배추",
    "unit": "1포기",
    "price": 5118
  },
  {
    "key": "212-00",
    "name": "양배추",
    "unit": "1포기",
    "price": 3201
  },
  {
    "key": "213-00",
    "name": "시금치",
    "unit": "100g",
    "price": 2216
  },
  {
    "key": "214-01",
    "name": "적상추",
    "unit": "100g",
    "price": 1572
  },
  {
    "key": "214-02",
    "name": "청상추",
    "unit": "100g",
    "price": 1550
  },
  {
    "key": "215-00",
    "name": "얼갈이배추",
    "unit": "1kg",
    "price": 3207
  },
  {
    "key": "221-00",
    "name": "수박",
    "unit": "1개",
    "price": 26422
  },
  {
    "key": "222-00",
    "name": "참외",
    "unit": "10개",
    "price": 17754
  },
  {
    "key": "223-01",
    "name": "가시오이",
    "unit": "10개",
    "price": 11027
  },
  {
    "key": "223-02",
    "name": "다다기오이",
    "unit": "10개",
    "price": 9955
  },
  {
    "key": "223-03",
    "name": "취청오이",
    "unit": "10개",
    "price": 15374
  },
  {
    "key": "224-01",
    "name": "애호박",
    "unit": "1개",
    "price": 1692
  },
  {
    "key": "224-02",
    "name": "쥬키니호박",
    "unit": "1개",
    "price": 1713
  },
  {
    "key": "225-00",
    "name": "토마토",
    "unit": "1kg",
    "price": 6427
  },
  {
    "key": "231-02",
    "name": "무",
    "unit": "1개",
    "price": 2488
  },
  {
    "key": "232-01",
    "name": "당근",
    "unit": "1kg",
    "price": 3756
  },
  {
    "key": "233-00",
    "name": "열무",
    "unit": "1kg",
    "price": 3421
  },
  {
    "key": "241-00",
    "name": "건고추 화건",
    "unit": "600g",
    "price": 18183
  },
  {
    "key": "241-01",
    "name": "건고추 햇산화건",
    "unit": "600g",
    "price": 17605
  },
  {
    "key": "242-00",
    "name": "풋고추(녹광 등)",
    "unit": "100g",
    "price": 1671
  },
  {
    "key": "242-02",
    "name": "꽈리고추",
    "unit": "100g",
    "price": 1371
  },
  {
    "key": "242-03",
    "name": "청양고추",
    "unit": "100g",
    "price": 1136
  },
  {
    "key": "242-04",
    "name": "오이맛고추",
    "unit": "100g",
    "price": 1070
  },
  {
    "key": "243-00",
    "name": "붉은고추",
    "unit": "100g",
    "price": 1888
  },
  {
    "key": "245-00",
    "name": "양파",
    "unit": "1kg",
    "price": 2005
  },
  {
    "key": "246-00",
    "name": "대파",
    "unit": "1kg",
    "price": 3011
  },
  {
    "key": "246-02",
    "name": "쪽파",
    "unit": "1kg",
    "price": 10259
  },
  {
    "key": "247-00",
    "name": "생강",
    "unit": "1kg",
    "price": 15117
  },
  {
    "key": "248-00",
    "name": "국산고춧가루",
    "unit": "1kg",
    "price": 34424
  },
  {
    "key": "248-01",
    "name": "중국고춧가루",
    "unit": "1kg",
    "price": 13654
  },
  {
    "key": "252-00",
    "name": "미나리",
    "unit": "100g",
    "price": 1826
  },
  {
    "key": "253-00",
    "name": "깻잎",
    "unit": "50g",
    "price": 1498
  },
  {
    "key": "255-00",
    "name": "피망",
    "unit": "100g",
    "price": 1637
  },
  {
    "key": "256-00",
    "name": "파프리카",
    "unit": "1개",
    "price": 1516
  },
  {
    "key": "257-00",
    "name": "멜론",
    "unit": "1개",
    "price": 8838
  },
  {
    "key": "258-01",
    "name": "깐마늘(국산)",
    "unit": "1kg",
    "price": 10125
  },
  {
    "key": "279-00",
    "name": "알배기배추",
    "unit": "1포기",
    "price": 3999
  },
  {
    "key": "280-00",
    "name": "브로콜리",
    "unit": "1개",
    "price": 3277
  },
  {
    "key": "411-05",
    "name": "후지사과",
    "unit": "10개",
    "price": 29213
  },
  {
    "key": "411-06",
    "name": "아오리사과",
    "unit": "10개",
    "price": 19654
  },
  {
    "key": "412-01",
    "name": "신고배",
    "unit": "10개",
    "price": 45673
  },
  {
    "key": "412-04",
    "name": "원황배",
    "unit": "10개",
    "price": 25409
  },
  {
    "key": "413-01",
    "name": "복숭아",
    "unit": "10개",
    "price": 18167
  },
  {
    "key": "414-01",
    "name": "캠벨얼리포도",
    "unit": "1kg",
    "price": 8075
  },
  {
    "key": "414-02",
    "name": "거봉포도",
    "unit": "2kg",
    "price": 16652
  },
  {
    "key": "414-12",
    "name": "샤인머스켓포도",
    "unit": "2kg",
    "price": 17358
  },
  {
    "key": "415-02",
    "name": "감귤",
    "unit": "10개",
    "price": 8238
  },
  {
    "key": "418-02",
    "name": "바나나",
    "unit": "100g",
    "price": 312
  },
  {
    "key": "419-02",
    "name": "참다래(키위)",
    "unit": "10개",
    "price": 11645
  },
  {
    "key": "420-02",
    "name": "파인애플",
    "unit": "1개",
    "price": 7408
  },
  {
    "key": "421-06",
    "name": "오렌지",
    "unit": "10개",
    "price": 17713
  },
  {
    "key": "422-01",
    "name": "방울토마토",
    "unit": "1kg",
    "price": 9179
  },
  {
    "key": "422-02",
    "name": "대추방울토마토",
    "unit": "1kg",
    "price": 5758
  },
  {
    "key": "424-00",
    "name": "레몬",
    "unit": "10개",
    "price": 8940
  },
  {
    "key": "425-00",
    "name": "체리",
    "unit": "100g",
    "price": 2319
  },
  {
    "key": "428-00",
    "name": "망고",
    "unit": "1개",
    "price": 6090
  },
  {
    "key": "430-00",
    "name": "아보카도",
    "unit": "1개",
    "price": 1607
  },
  {
    "key": "4301-21",
    "name": "소고기 안심",
    "unit": "100g",
    "price": 17893
  },
  {
    "key": "4301-22",
    "name": "소고기 등심",
    "unit": "100g",
    "price": 15680
  },
  {
    "key": "4301-36",
    "name": "소고기 설도",
    "unit": "100g",
    "price": 6226
  },
  {
    "key": "4301-40",
    "name": "소고기 양지",
    "unit": "100g",
    "price": 7700
  },
  {
    "key": "4301-50",
    "name": "소고기 갈비",
    "unit": "100g",
    "price": 8804
  },
  {
    "key": "4304-25",
    "name": "돼지고기 앞다리",
    "unit": "100g",
    "price": 1544
  },
  {
    "key": "4304-27",
    "name": "돼지고기 삼겹살",
    "unit": "100g",
    "price": 2866
  },
  {
    "key": "4304-28",
    "name": "돼지고기 갈비",
    "unit": "100g",
    "price": 1568
  },
  {
    "key": "4304-68",
    "name": "돼지고기 목심",
    "unit": "100g",
    "price": 2676
  },
  {
    "key": "4401-31",
    "name": "수입 소고기 갈비",
    "unit": "100g",
    "price": 4386
  },
  {
    "key": "4401-37",
    "name": "수입 소고기 갈비살",
    "unit": "100g",
    "price": 5130
  },
  {
    "key": "4402-27",
    "name": "수입 돼지고기 삼겹살",
    "unit": "100g",
    "price": 1507
  },
  {
    "key": "9901-24",
    "name": "닭고기 절단육",
    "unit": "1kg",
    "price": null
  },
  {
    "key": "9901-99",
    "name": "닭고기 육계",
    "unit": "1kg",
    "price": 5585
  },
  {
    "key": "9903-21",
    "name": "계란 10구",
    "unit": "10구",
    "price": 4154
  },
  {
    "key": "9903-23",
    "name": "계란 30구",
    "unit": "30구",
    "price": 7315
  },
  {
    "key": "9908-01",
    "name": "우유",
    "unit": "1L",
    "price": 2983
  }
];
/** 이 파일을 만든 날(YYYYMMDD). 공유 카드 이미지 URL의 캐시 무효화에 쓴다 —
 *  카톡은 OG 이미지를 오래 캐싱해서 주소가 같으면 어제 가격이 계속 보인다. */
export const SEO_BUILD_DAY = '20260827';
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
