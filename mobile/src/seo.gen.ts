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
    "price": 33141
  },
  {
    "key": "112-01",
    "name": "찹쌀",
    "unit": "1kg",
    "price": 5247
  },
  {
    "key": "141-01",
    "name": "콩",
    "unit": "500g",
    "price": 5036
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
    "price": 5444
  },
  {
    "key": "152-01",
    "name": "감자",
    "unit": "100g",
    "price": 334
  },
  {
    "key": "211-02",
    "name": "배추",
    "unit": "1포기",
    "price": 5625
  },
  {
    "key": "212-00",
    "name": "양배추",
    "unit": "1포기",
    "price": 3068
  },
  {
    "key": "213-00",
    "name": "시금치",
    "unit": "100g",
    "price": 2141
  },
  {
    "key": "214-01",
    "name": "적상추",
    "unit": "100g",
    "price": 1495
  },
  {
    "key": "214-02",
    "name": "청상추",
    "unit": "100g",
    "price": 1636
  },
  {
    "key": "215-00",
    "name": "얼갈이배추",
    "unit": "1kg",
    "price": 3244
  },
  {
    "key": "221-00",
    "name": "수박",
    "unit": "1개",
    "price": 26600
  },
  {
    "key": "222-00",
    "name": "참외",
    "unit": "10개",
    "price": 19008
  },
  {
    "key": "223-01",
    "name": "가시오이",
    "unit": "10개",
    "price": 11085
  },
  {
    "key": "223-02",
    "name": "다다기오이",
    "unit": "10개",
    "price": 9548
  },
  {
    "key": "223-03",
    "name": "취청오이",
    "unit": "10개",
    "price": 14262
  },
  {
    "key": "224-01",
    "name": "애호박",
    "unit": "1개",
    "price": 1406
  },
  {
    "key": "224-02",
    "name": "쥬키니호박",
    "unit": "1개",
    "price": 1739
  },
  {
    "key": "225-00",
    "name": "토마토",
    "unit": "1kg",
    "price": 5302
  },
  {
    "key": "231-02",
    "name": "무",
    "unit": "1개",
    "price": 2454
  },
  {
    "key": "232-01",
    "name": "당근",
    "unit": "1kg",
    "price": 3499
  },
  {
    "key": "233-00",
    "name": "열무",
    "unit": "1kg",
    "price": 3472
  },
  {
    "key": "241-00",
    "name": "건고추 화건",
    "unit": "600g",
    "price": 18179
  },
  {
    "key": "241-01",
    "name": "건고추 햇산화건",
    "unit": "600g",
    "price": 17454
  },
  {
    "key": "242-00",
    "name": "풋고추(녹광 등)",
    "unit": "100g",
    "price": 1691
  },
  {
    "key": "242-02",
    "name": "꽈리고추",
    "unit": "100g",
    "price": 1343
  },
  {
    "key": "242-03",
    "name": "청양고추",
    "unit": "100g",
    "price": 1135
  },
  {
    "key": "242-04",
    "name": "오이맛고추",
    "unit": "100g",
    "price": 1072
  },
  {
    "key": "243-00",
    "name": "붉은고추",
    "unit": "100g",
    "price": 1948
  },
  {
    "key": "245-00",
    "name": "양파",
    "unit": "1kg",
    "price": 1983
  },
  {
    "key": "246-00",
    "name": "대파",
    "unit": "1kg",
    "price": 3044
  },
  {
    "key": "246-02",
    "name": "쪽파",
    "unit": "1kg",
    "price": 10567
  },
  {
    "key": "247-00",
    "name": "생강",
    "unit": "1kg",
    "price": 15124
  },
  {
    "key": "248-00",
    "name": "국산고춧가루",
    "unit": "1kg",
    "price": 34364
  },
  {
    "key": "248-01",
    "name": "중국고춧가루",
    "unit": "1kg",
    "price": 13544
  },
  {
    "key": "252-00",
    "name": "미나리",
    "unit": "100g",
    "price": 1788
  },
  {
    "key": "253-00",
    "name": "깻잎",
    "unit": "50g",
    "price": 1535
  },
  {
    "key": "255-00",
    "name": "피망",
    "unit": "100g",
    "price": 1353
  },
  {
    "key": "256-00",
    "name": "파프리카",
    "unit": "1개",
    "price": 1421
  },
  {
    "key": "257-00",
    "name": "멜론",
    "unit": "1개",
    "price": 8770
  },
  {
    "key": "258-01",
    "name": "깐마늘(국산)",
    "unit": "1kg",
    "price": 12205
  },
  {
    "key": "279-00",
    "name": "알배기배추",
    "unit": "1포기",
    "price": 3623
  },
  {
    "key": "280-00",
    "name": "브로콜리",
    "unit": "1개",
    "price": 3057
  },
  {
    "key": "411-05",
    "name": "후지사과",
    "unit": "10개",
    "price": 29139
  },
  {
    "key": "411-06",
    "name": "아오리사과",
    "unit": "10개",
    "price": 19714
  },
  {
    "key": "412-01",
    "name": "신고배",
    "unit": "10개",
    "price": 45992
  },
  {
    "key": "412-04",
    "name": "원황배",
    "unit": "10개",
    "price": 26540
  },
  {
    "key": "413-01",
    "name": "복숭아",
    "unit": "10개",
    "price": 18639
  },
  {
    "key": "414-01",
    "name": "캠벨얼리포도",
    "unit": "1kg",
    "price": 8856
  },
  {
    "key": "414-02",
    "name": "거봉포도",
    "unit": "2kg",
    "price": 17204
  },
  {
    "key": "414-12",
    "name": "샤인머스켓포도",
    "unit": "2kg",
    "price": 17562
  },
  {
    "key": "415-02",
    "name": "감귤",
    "unit": "10개",
    "price": 8889
  },
  {
    "key": "418-02",
    "name": "바나나",
    "unit": "100g",
    "price": 321
  },
  {
    "key": "419-02",
    "name": "참다래(키위)",
    "unit": "10개",
    "price": 11695
  },
  {
    "key": "420-02",
    "name": "파인애플",
    "unit": "1개",
    "price": 7403
  },
  {
    "key": "421-06",
    "name": "오렌지",
    "unit": "10개",
    "price": 11280
  },
  {
    "key": "422-01",
    "name": "방울토마토",
    "unit": "1kg",
    "price": 7288
  },
  {
    "key": "422-02",
    "name": "대추방울토마토",
    "unit": "1kg",
    "price": 5644
  },
  {
    "key": "424-00",
    "name": "레몬",
    "unit": "10개",
    "price": 8932
  },
  {
    "key": "425-00",
    "name": "체리",
    "unit": "100g",
    "price": 2244
  },
  {
    "key": "428-00",
    "name": "망고",
    "unit": "1개",
    "price": 6211
  },
  {
    "key": "430-00",
    "name": "아보카도",
    "unit": "1개",
    "price": 1604
  },
  {
    "key": "4301-21",
    "name": "소고기 안심",
    "unit": "100g",
    "price": 19233
  },
  {
    "key": "4301-22",
    "name": "소고기 등심",
    "unit": "100g",
    "price": 15729
  },
  {
    "key": "4301-36",
    "name": "소고기 설도",
    "unit": "100g",
    "price": 6132
  },
  {
    "key": "4301-40",
    "name": "소고기 양지",
    "unit": "100g",
    "price": 7982
  },
  {
    "key": "4301-50",
    "name": "소고기 갈비",
    "unit": "100g",
    "price": 14294
  },
  {
    "key": "4304-25",
    "name": "돼지고기 앞다리",
    "unit": "100g",
    "price": 1537
  },
  {
    "key": "4304-27",
    "name": "돼지고기 삼겹살",
    "unit": "100g",
    "price": 2958
  },
  {
    "key": "4304-28",
    "name": "돼지고기 갈비",
    "unit": "100g",
    "price": 1583
  },
  {
    "key": "4304-68",
    "name": "돼지고기 목심",
    "unit": "100g",
    "price": 2743
  },
  {
    "key": "4401-31",
    "name": "수입 소고기 갈비",
    "unit": "100g",
    "price": 4417
  },
  {
    "key": "4401-37",
    "name": "수입 소고기 갈비살",
    "unit": "100g",
    "price": 5153
  },
  {
    "key": "4402-27",
    "name": "수입 돼지고기 삼겹살",
    "unit": "100g",
    "price": 1514
  },
  {
    "key": "9901-02",
    "name": "닭고기 육계9호",
    "unit": "1kg",
    "price": 554
  },
  {
    "key": "9901-03",
    "name": "닭고기 육계10호",
    "unit": "1kg",
    "price": 496
  },
  {
    "key": "9901-99",
    "name": "닭고기 육계",
    "unit": "1kg",
    "price": 5538
  },
  {
    "key": "9903-21",
    "name": "계란 10구",
    "unit": "10구",
    "price": 4549
  },
  {
    "key": "9903-23",
    "name": "계란 30구",
    "unit": "30구",
    "price": 6626
  },
  {
    "key": "9908-01",
    "name": "우유",
    "unit": "1L",
    "price": 2957
  }
];
/** 이 파일을 만든 날(YYYYMMDD). 공유 카드 이미지 URL의 캐시 무효화에 쓴다 —
 *  카톡은 OG 이미지를 오래 캐싱해서 주소가 같으면 어제 가격이 계속 보인다. */
export const SEO_BUILD_DAY = '20260826';
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
