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
    "price": 61396
  },
  {
    "key": "111-10",
    "name": "쌀 10kg",
    "unit": "10kg",
    "price": 33024
  },
  {
    "key": "112-01",
    "name": "찹쌀",
    "unit": "1kg",
    "price": 5276
  },
  {
    "key": "141-01",
    "name": "콩",
    "unit": "500g",
    "price": 5013
  },
  {
    "key": "142-00",
    "name": "팥",
    "unit": "500g",
    "price": 13738
  },
  {
    "key": "143-00",
    "name": "녹두",
    "unit": "500g",
    "price": 12155
  },
  {
    "key": "151-00",
    "name": "고구마",
    "unit": "1kg",
    "price": 5356
  },
  {
    "key": "152-01",
    "name": "감자",
    "unit": "100g",
    "price": 316
  },
  {
    "key": "211-02",
    "name": "배추",
    "unit": "1포기",
    "price": 5684
  },
  {
    "key": "212-00",
    "name": "양배추",
    "unit": "1포기",
    "price": 3012
  },
  {
    "key": "213-00",
    "name": "시금치",
    "unit": "100g",
    "price": 2095
  },
  {
    "key": "214-01",
    "name": "적상추",
    "unit": "100g",
    "price": 1512
  },
  {
    "key": "214-02",
    "name": "청상추",
    "unit": "100g",
    "price": 1648
  },
  {
    "key": "215-00",
    "name": "얼갈이배추",
    "unit": "1kg",
    "price": 3263
  },
  {
    "key": "221-00",
    "name": "수박",
    "unit": "1개",
    "price": 26210
  },
  {
    "key": "222-00",
    "name": "참외",
    "unit": "10개",
    "price": 18856
  },
  {
    "key": "223-01",
    "name": "가시오이",
    "unit": "10개",
    "price": 11091
  },
  {
    "key": "223-02",
    "name": "다다기오이",
    "unit": "10개",
    "price": 9623
  },
  {
    "key": "223-03",
    "name": "취청오이",
    "unit": "10개",
    "price": 14392
  },
  {
    "key": "224-01",
    "name": "애호박",
    "unit": "1개",
    "price": 1311
  },
  {
    "key": "224-02",
    "name": "쥬키니호박",
    "unit": "1개",
    "price": 1785
  },
  {
    "key": "225-00",
    "name": "토마토",
    "unit": "1kg",
    "price": 5037
  },
  {
    "key": "231-02",
    "name": "무",
    "unit": "1개",
    "price": 2459
  },
  {
    "key": "232-01",
    "name": "당근",
    "unit": "1kg",
    "price": 3504
  },
  {
    "key": "233-00",
    "name": "열무",
    "unit": "1kg",
    "price": 3365
  },
  {
    "key": "241-00",
    "name": "건고추 화건",
    "unit": "600g",
    "price": 18536
  },
  {
    "key": "241-01",
    "name": "건고추 햇산화건",
    "unit": "600g",
    "price": 17197
  },
  {
    "key": "242-00",
    "name": "풋고추(녹광 등)",
    "unit": "100g",
    "price": 1688
  },
  {
    "key": "242-02",
    "name": "꽈리고추",
    "unit": "100g",
    "price": 1340
  },
  {
    "key": "242-03",
    "name": "청양고추",
    "unit": "100g",
    "price": 1140
  },
  {
    "key": "242-04",
    "name": "오이맛고추",
    "unit": "100g",
    "price": 1075
  },
  {
    "key": "243-00",
    "name": "붉은고추",
    "unit": "100g",
    "price": 1977
  },
  {
    "key": "245-00",
    "name": "양파",
    "unit": "1kg",
    "price": 1993
  },
  {
    "key": "246-00",
    "name": "대파",
    "unit": "1kg",
    "price": 3050
  },
  {
    "key": "246-02",
    "name": "쪽파",
    "unit": "1kg",
    "price": 10549
  },
  {
    "key": "247-00",
    "name": "생강",
    "unit": "1kg",
    "price": 15013
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
    "price": 1762
  },
  {
    "key": "253-00",
    "name": "깻잎",
    "unit": "50g",
    "price": 1513
  },
  {
    "key": "255-00",
    "name": "피망",
    "unit": "100g",
    "price": 1300
  },
  {
    "key": "256-00",
    "name": "파프리카",
    "unit": "1개",
    "price": 1396
  },
  {
    "key": "257-00",
    "name": "멜론",
    "unit": "1개",
    "price": 8742
  },
  {
    "key": "258-01",
    "name": "깐마늘(국산)",
    "unit": "1kg",
    "price": 11826
  },
  {
    "key": "279-00",
    "name": "알배기배추",
    "unit": "1포기",
    "price": 3613
  },
  {
    "key": "280-00",
    "name": "브로콜리",
    "unit": "1개",
    "price": 3065
  },
  {
    "key": "411-05",
    "name": "후지사과",
    "unit": "10개",
    "price": 24500
  },
  {
    "key": "411-06",
    "name": "아오리사과",
    "unit": "10개",
    "price": 16667
  },
  {
    "key": "412-01",
    "name": "신고배",
    "unit": "10개",
    "price": 43300
  },
  {
    "key": "412-04",
    "name": "원황배",
    "unit": "10개",
    "price": 27067
  },
  {
    "key": "413-01",
    "name": "복숭아",
    "unit": "10개",
    "price": 18278
  },
  {
    "key": "414-01",
    "name": "캠벨얼리포도",
    "unit": "1kg",
    "price": 10175
  },
  {
    "key": "414-02",
    "name": "거봉포도",
    "unit": "2kg",
    "price": 16775
  },
  {
    "key": "414-12",
    "name": "샤인머스켓포도",
    "unit": "2kg",
    "price": 17744
  },
  {
    "key": "415-02",
    "name": "감귤",
    "unit": "10개",
    "price": 8455
  },
  {
    "key": "418-02",
    "name": "바나나",
    "unit": "100g",
    "price": 310
  },
  {
    "key": "419-02",
    "name": "참다래(키위)",
    "unit": "10개",
    "price": 11630
  },
  {
    "key": "420-02",
    "name": "파인애플",
    "unit": "1개",
    "price": 6657
  },
  {
    "key": "421-06",
    "name": "오렌지",
    "unit": "10개",
    "price": 11750
  },
  {
    "key": "422-01",
    "name": "방울토마토",
    "unit": "1kg",
    "price": 7077
  },
  {
    "key": "422-02",
    "name": "대추방울토마토",
    "unit": "1kg",
    "price": 5752
  },
  {
    "key": "424-00",
    "name": "레몬",
    "unit": "10개",
    "price": 9073
  },
  {
    "key": "425-00",
    "name": "체리",
    "unit": "100g",
    "price": 2490
  },
  {
    "key": "428-00",
    "name": "망고",
    "unit": "1개",
    "price": 6793
  },
  {
    "key": "430-00",
    "name": "아보카도",
    "unit": "1개",
    "price": 1737
  },
  {
    "key": "4301-21",
    "name": "소고기 안심",
    "unit": "100g",
    "price": 17903
  },
  {
    "key": "4301-22",
    "name": "소고기 등심",
    "unit": "100g",
    "price": 15674
  },
  {
    "key": "4301-36",
    "name": "소고기 설도",
    "unit": "100g",
    "price": 6237
  },
  {
    "key": "4301-40",
    "name": "소고기 양지",
    "unit": "100g",
    "price": 7686
  },
  {
    "key": "4301-50",
    "name": "소고기 갈비",
    "unit": "100g",
    "price": 8515
  },
  {
    "key": "4304-25",
    "name": "돼지고기 앞다리",
    "unit": "100g",
    "price": 1520
  },
  {
    "key": "4304-27",
    "name": "돼지고기 삼겹살",
    "unit": "100g",
    "price": 2880
  },
  {
    "key": "4304-28",
    "name": "돼지고기 갈비",
    "unit": "100g",
    "price": 1576
  },
  {
    "key": "4304-68",
    "name": "돼지고기 목심",
    "unit": "100g",
    "price": 2656
  },
  {
    "key": "4401-31",
    "name": "수입 소고기 갈비",
    "unit": "100g",
    "price": 4393
  },
  {
    "key": "4401-37",
    "name": "수입 소고기 갈비살",
    "unit": "100g",
    "price": 5039
  },
  {
    "key": "4402-27",
    "name": "수입 돼지고기 삼겹살",
    "unit": "100g",
    "price": 1510
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
    "price": 5559
  },
  {
    "key": "9903-21",
    "name": "계란 10구",
    "unit": "10구",
    "price": 4184
  },
  {
    "key": "9903-23",
    "name": "계란 30구",
    "unit": "30구",
    "price": 7218
  },
  {
    "key": "9908-01",
    "name": "우유",
    "unit": "1L",
    "price": 2980
  }
];
export const SEO_BY_KEY: Record<string, SeoItem> = Object.fromEntries(SEO_ITEMS.map((i) => [i.key, i]));
