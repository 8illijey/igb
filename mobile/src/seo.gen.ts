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
    "price": 63338,
    "normal": 58440,
    "minMonth": 8,
    "maxMonth": 11,
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
    "key": "111-05",
    "name": "20kg(햅쌀)",
    "unit": "20kg",
    "price": 64134,
    "normal": null,
    "minMonth": 8,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "111-10",
    "name": "쌀 10kg",
    "unit": "10kg",
    "price": 35663,
    "normal": 31286,
    "minMonth": 8,
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
    "key": "111-11",
    "name": "10kg(햅쌀)",
    "unit": "10kg",
    "price": 35677,
    "normal": null,
    "minMonth": 11,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "112-01",
    "name": "찹쌀",
    "unit": "1kg",
    "price": 5145,
    "normal": 5001,
    "minMonth": 7,
    "maxMonth": 5,
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
    "price": 7825,
    "normal": null,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9,
      10,
      11
    ],
    "normalMonths": null
  },
  {
    "key": "115-01",
    "name": "현미",
    "unit": "1kg",
    "price": 5687,
    "normal": null,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9,
      10,
      11
    ],
    "normalMonths": null
  },
  {
    "key": "121-04",
    "name": "보리쌀",
    "unit": "1kg",
    "price": 5067,
    "normal": null,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9,
      10,
      11
    ],
    "normalMonths": null
  },
  {
    "key": "141-01",
    "name": "콩",
    "unit": "500g",
    "price": 5050,
    "normal": 5261,
    "minMonth": 2,
    "maxMonth": 11,
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
    "price": 13414,
    "normal": 11041,
    "minMonth": 12,
    "maxMonth": 8,
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
    "price": 12259,
    "normal": 11472,
    "minMonth": 2,
    "maxMonth": 10,
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
    "price": 4804,
    "normal": 5008,
    "minMonth": 11,
    "maxMonth": 5,
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
    "price": 338,
    "normal": 334,
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
    "key": "211-02",
    "name": "배추 여름(고랭지)",
    "unit": "1포기",
    "price": 4506,
    "normal": 4812,
    "minMonth": 5,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "211-03",
    "name": "가을배추",
    "unit": "1포기",
    "price": 2465,
    "normal": 3638,
    "minMonth": 5,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "212-00",
    "name": "양배추",
    "unit": "1포기",
    "price": 4428,
    "normal": 4171,
    "minMonth": 5,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": [
      3713,
      3638,
      3714,
      4150,
      4472,
      3521,
      3457,
      3869,
      3936,
      4195,
      3821,
      3330
    ]
  },
  {
    "key": "213-00",
    "name": "시금치",
    "unit": "100g",
    "price": 959,
    "normal": 1134,
    "minMonth": 4,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": [
      794,
      916,
      724,
      619,
      667,
      798,
      1546,
      2404,
      2412,
      1304,
      888,
      774
    ]
  },
  {
    "key": "214-01",
    "name": "적상추",
    "unit": "100g",
    "price": 1203,
    "normal": 1531,
    "minMonth": 5,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": [
      1053,
      983,
      840,
      811,
      816,
      876,
      1527,
      1715,
      1782,
      1455,
      1157,
      953
    ]
  },
  {
    "key": "214-02",
    "name": "청상추",
    "unit": "100g",
    "price": 1221,
    "normal": 1672,
    "minMonth": 5,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": [
      1166,
      1106,
      992,
      950,
      971,
      1023,
      1669,
      1860,
      1917,
      1594,
      1278,
      1041
    ]
  },
  {
    "key": "215-00",
    "name": "얼갈이배추",
    "unit": "1kg",
    "price": 2232,
    "normal": 3554,
    "minMonth": 10,
    "maxMonth": 2,
    "seasonMonths": null,
    "normalMonths": [
      3295,
      3746,
      3338,
      2865,
      2423,
      2327,
      3471,
      4123,
      3938,
      3107,
      3162,
      3208
    ]
  },
  {
    "key": "216-00",
    "name": "갓",
    "unit": "1kg",
    "price": 3252,
    "normal": 4099,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      11,
      12,
      1
    ],
    "normalMonths": null
  },
  {
    "key": "221-00",
    "name": "수박",
    "unit": "1개",
    "price": 19460,
    "normal": 24280,
    "minMonth": 11,
    "maxMonth": 3,
    "seasonMonths": null,
    "normalMonths": [
      25313,
      26725,
      26981,
      23909,
      20050,
      19496,
      21832,
      26461,
      24707,
      21974,
      23391,
      26204
    ]
  },
  {
    "key": "223-01",
    "name": "가시오이",
    "unit": "10개",
    "price": 13859,
    "normal": 16206,
    "minMonth": 6,
    "maxMonth": 1,
    "seasonMonths": null,
    "normalMonths": [
      20154,
      21537,
      20439,
      15614,
      11806,
      11664,
      15438,
      16069,
      16753,
      16462,
      17466,
      18461
    ]
  },
  {
    "key": "223-02",
    "name": "다다기오이",
    "unit": "10개",
    "price": 10771,
    "normal": 12513,
    "minMonth": 6,
    "maxMonth": 1,
    "seasonMonths": null,
    "normalMonths": [
      11147,
      11099,
      9832,
      7223,
      6035,
      5713,
      8061,
      9489,
      10657,
      10152,
      9681,
      10247
    ]
  },
  {
    "key": "223-03",
    "name": "취청오이",
    "unit": "10개",
    "price": 15042,
    "normal": 16509,
    "minMonth": 10,
    "maxMonth": 1,
    "seasonMonths": null,
    "normalMonths": [
      16060,
      16845,
      15532,
      13356,
      10876,
      10281,
      13514,
      14094,
      14648,
      13581,
      15555,
      15575
    ]
  },
  {
    "key": "224-01",
    "name": "애호박",
    "unit": "1개",
    "price": 1834,
    "normal": 2059,
    "minMonth": 5,
    "maxMonth": 2,
    "seasonMonths": null,
    "normalMonths": [
      2162,
      2251,
      2023,
      1440,
      1139,
      1144,
      1128,
      1377,
      1743,
      1508,
      1506,
      1623
    ]
  },
  {
    "key": "224-02",
    "name": "쥬키니호박",
    "unit": "1개",
    "price": 1954,
    "normal": 2591,
    "minMonth": 5,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": [
      2157,
      2437,
      2327,
      1746,
      1499,
      1509,
      1685,
      2208,
      2462,
      2317,
      2237,
      2057
    ]
  },
  {
    "key": "225-00",
    "name": "토마토",
    "unit": "1kg",
    "price": 3938,
    "normal": 8082,
    "minMonth": 7,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": [
      5209,
      5817,
      6202,
      5326,
      4562,
      3856,
      4346,
      5586,
      7419,
      8854,
      6972,
      5484
    ]
  },
  {
    "key": "231-02",
    "name": "무 고랭지",
    "unit": "1개",
    "price": 1863,
    "normal": 2008,
    "minMonth": 7,
    "maxMonth": 12,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "231-03",
    "name": "가을무",
    "unit": "1개",
    "price": 1824,
    "normal": 2233,
    "minMonth": 6,
    "maxMonth": 1,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "232-01",
    "name": "당근",
    "unit": "1kg",
    "price": 4648,
    "normal": 4399,
    "minMonth": 12,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": [
      3413,
      3663,
      3714,
      3951,
      3615,
      3309,
      3229,
      3552,
      4279,
      4530,
      4279,
      3534
    ]
  },
  {
    "key": "233-00",
    "name": "열무",
    "unit": "1kg",
    "price": 2722,
    "normal": 4408,
    "minMonth": 10,
    "maxMonth": 2,
    "seasonMonths": null,
    "normalMonths": [
      3304,
      3605,
      3330,
      2823,
      2484,
      2373,
      3655,
      4146,
      3950,
      3304,
      3507,
      3520
    ]
  },
  {
    "key": "241-00",
    "name": "건고추",
    "unit": "600g",
    "price": 16523,
    "normal": 16675,
    "minMonth": 11,
    "maxMonth": 8,
    "seasonMonths": null,
    "normalMonths": [
      19652,
      20093,
      21162,
      20518,
      20972,
      21136,
      21141,
      20858,
      18444,
      17391,
      18153,
      19305
    ]
  },
  {
    "key": "242-00",
    "name": "풋고추(녹광 등)",
    "unit": "100g",
    "price": 1708,
    "normal": 1974,
    "minMonth": 12,
    "maxMonth": 2,
    "seasonMonths": null,
    "normalMonths": [
      1532,
      2115,
      2103,
      1717,
      1479,
      1456,
      1735,
      1619,
      1734,
      1701,
      1728,
      1283
    ]
  },
  {
    "key": "242-02",
    "name": "꽈리고추",
    "unit": "100g",
    "price": 1498,
    "normal": 1598,
    "minMonth": 8,
    "maxMonth": 2,
    "seasonMonths": null,
    "normalMonths": [
      1474,
      1638,
      1462,
      1304,
      1184,
      1147,
      1255,
      1197,
      1512,
      1487,
      1229,
      1160
    ]
  },
  {
    "key": "242-03",
    "name": "청양고추",
    "unit": "100g",
    "price": 1188,
    "normal": 1310,
    "minMonth": 11,
    "maxMonth": 2,
    "seasonMonths": null,
    "normalMonths": [
      1191,
      1557,
      1412,
      918,
      831,
      889,
      1039,
      968,
      1152,
      1083,
      1017,
      1003
    ]
  },
  {
    "key": "242-04",
    "name": "오이맛고추",
    "unit": "100g",
    "price": 1002,
    "normal": 1288,
    "minMonth": 8,
    "maxMonth": 2,
    "seasonMonths": null,
    "normalMonths": [
      1460,
      1779,
      1603,
      1140,
      1016,
      995,
      1207,
      1116,
      1325,
      1234,
      1125,
      1061
    ]
  },
  {
    "key": "243-00",
    "name": "붉은고추",
    "unit": "100g",
    "price": 1918,
    "normal": 2239,
    "minMonth": 8,
    "maxMonth": 12,
    "seasonMonths": null,
    "normalMonths": [
      1608,
      1594,
      2177,
      2765,
      2003,
      1823,
      1638,
      1429,
      1546,
      1813,
      1830,
      2009
    ]
  },
  {
    "key": "245-00",
    "name": "양파",
    "unit": "1kg",
    "price": 2143,
    "normal": 1939,
    "minMonth": 7,
    "maxMonth": 1,
    "seasonMonths": null,
    "normalMonths": [
      2283,
      2452,
      2805,
      2556,
      2013,
      1953,
      1910,
      1969,
      2017,
      2146,
      1969,
      2129
    ]
  },
  {
    "key": "246-00",
    "name": "대파",
    "unit": "1kg",
    "price": 2312,
    "normal": 2948,
    "minMonth": 4,
    "maxMonth": 12,
    "seasonMonths": null,
    "normalMonths": [
      3182,
      3407,
      3154,
      2355,
      2527,
      2463,
      2571,
      2846,
      2791,
      2958,
      2984,
      3288
    ]
  },
  {
    "key": "246-02",
    "name": "쪽파",
    "unit": "1kg",
    "price": 3939,
    "normal": 8353,
    "minMonth": 4,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": [
      9820,
      9351,
      6050,
      4981,
      6331,
      7945,
      9900,
      10392,
      8674,
      8738,
      7097,
      8008
    ]
  },
  {
    "key": "247-00",
    "name": "생강",
    "unit": "1kg",
    "price": 8318,
    "normal": 8554,
    "minMonth": 11,
    "maxMonth": 1,
    "seasonMonths": null,
    "normalMonths": [
      12222,
      12455,
      12571,
      13054,
      13248,
      13414,
      13832,
      14110,
      14594,
      12701,
      9734,
      12902
    ]
  },
  {
    "key": "248-00",
    "name": "국산고춧가루",
    "unit": "1kg",
    "price": 29708,
    "normal": 30295,
    "minMonth": 12,
    "maxMonth": 8,
    "seasonMonths": null,
    "normalMonths": [
      34155,
      35695,
      35199,
      34800,
      35542,
      36030,
      36617,
      36475,
      36658,
      35883,
      31895,
      32246
    ]
  },
  {
    "key": "248-01",
    "name": "중국고춧가루",
    "unit": "1kg",
    "price": 13658,
    "normal": 12844,
    "minMonth": 4,
    "maxMonth": 1,
    "seasonMonths": null,
    "normalMonths": [
      13029,
      13017,
      13022,
      13236,
      13338,
      13333,
      13333,
      13333,
      13333,
      13554,
      13733,
      13724
    ]
  },
  {
    "key": "251-00",
    "name": "가지",
    "unit": "3개",
    "price": 2936,
    "normal": null,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9,
      10,
      11
    ],
    "normalMonths": null
  },
  {
    "key": "252-00",
    "name": "미나리",
    "unit": "100g",
    "price": 1485,
    "normal": 1420,
    "minMonth": 5,
    "maxMonth": 2,
    "seasonMonths": null,
    "normalMonths": [
      1625,
      1629,
      1416,
      1194,
      1096,
      1083,
      1337,
      1666,
      1848,
      1907,
      1519,
      1708
    ]
  },
  {
    "key": "253-00",
    "name": "깻잎",
    "unit": "50g",
    "price": 1497,
    "normal": 1468,
    "minMonth": 7,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": [
      1524,
      1437,
      1312,
      1191,
      1225,
      1110,
      1131,
      1464,
      1755,
      1572,
      1340,
      1289
    ]
  },
  {
    "key": "254-00",
    "name": "부추",
    "unit": "100g",
    "price": 846,
    "normal": null,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9,
      10,
      11
    ],
    "normalMonths": null
  },
  {
    "key": "255-00",
    "name": "피망",
    "unit": "100g",
    "price": 1408,
    "normal": 1757,
    "minMonth": 8,
    "maxMonth": 2,
    "seasonMonths": null,
    "normalMonths": [
      1842,
      2049,
      1847,
      1502,
      1293,
      1283,
      1194,
      1081,
      1451,
      1395,
      1472,
      1343
    ]
  },
  {
    "key": "256-00",
    "name": "파프리카",
    "unit": "1개",
    "price": 1322,
    "normal": 1915,
    "minMonth": 7,
    "maxMonth": 2,
    "seasonMonths": null,
    "normalMonths": [
      1799,
      2031,
      1855,
      1561,
      1297,
      1170,
      1126,
      1624,
      1986,
      1798,
      1437,
      1375
    ]
  },
  {
    "key": "257-00",
    "name": "멜론",
    "unit": "1개",
    "price": 9921,
    "normal": 11066,
    "minMonth": 8,
    "maxMonth": 2,
    "seasonMonths": null,
    "normalMonths": [
      14324,
      14600,
      15912,
      14858,
      12619,
      9913,
      8631,
      9133,
      9769,
      9703,
      10067,
      13849
    ]
  },
  {
    "key": "258-01",
    "name": "깐마늘(국산)",
    "unit": "1kg",
    "price": 10265,
    "normal": 10126,
    "minMonth": 11,
    "maxMonth": 3,
    "seasonMonths": null,
    "normalMonths": [
      9737,
      9853,
      10090,
      10515,
      10392,
      10232,
      10198,
      10189,
      9920,
      10144,
      9506,
      10065
    ]
  },
  {
    "key": "279-00",
    "name": "알배기배추",
    "unit": "1포기",
    "price": 2779,
    "normal": 3738,
    "minMonth": 7,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": [
      2542,
      2807,
      3118,
      3189,
      2731,
      2018,
      2606,
      3677,
      4585,
      3984,
      3129,
      2467
    ]
  },
  {
    "key": "280-00",
    "name": "브로콜리",
    "unit": "1개",
    "price": 2256,
    "normal": 3626,
    "minMonth": 7,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": [
      2228,
      2371,
      2728,
      3383,
      2637,
      1895,
      2228,
      3053,
      4102,
      3833,
      3150,
      2303
    ]
  },
  {
    "key": "411-05",
    "name": "후지사과",
    "unit": "10개",
    "price": 18472,
    "normal": 25011,
    "minMonth": 11,
    "maxMonth": 3,
    "seasonMonths": null,
    "normalMonths": [
      22677,
      23750,
      23483,
      23046,
      24698,
      26387,
      26354,
      27003,
      26369,
      29803,
      20714,
      21922
    ]
  },
  {
    "key": "411-07",
    "name": "홍로사과",
    "unit": "10개",
    "price": 24472,
    "normal": 26860,
    "minMonth": 10,
    "maxMonth": 2,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "411-08",
    "name": "사과 시나노골드",
    "unit": "10개",
    "price": 16805,
    "normal": null,
    "minMonth": 8,
    "maxMonth": 1,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "412-01",
    "name": "배",
    "unit": "10개",
    "price": 25567,
    "normal": 29166,
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
    "key": "414-01",
    "name": "캠벨얼리포도",
    "unit": "1kg",
    "price": 7971,
    "normal": 8122,
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
    "key": "414-12",
    "name": "샤인머스켓포도",
    "unit": "2kg",
    "price": 11014,
    "normal": 17090,
    "minMonth": 11,
    "maxMonth": 7,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "415-01",
    "name": "노지감귤",
    "unit": "10개",
    "price": 3868,
    "normal": 3465,
    "minMonth": 11,
    "maxMonth": 2,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "415-02",
    "name": "시설감귤",
    "unit": "10개",
    "price": 6274,
    "normal": 5923,
    "minMonth": 11,
    "maxMonth": 3,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "416-00",
    "name": "단감",
    "unit": "5개",
    "price": 5944,
    "normal": 6280,
    "minMonth": 4,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "418-02",
    "name": "바나나",
    "unit": "100g",
    "price": 282,
    "normal": 310,
    "minMonth": 11,
    "maxMonth": 5,
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
    "price": 7475,
    "normal": 6967,
    "minMonth": 8,
    "maxMonth": 1,
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
    "price": 12190,
    "normal": 14835,
    "minMonth": 9,
    "maxMonth": 2,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "422-01",
    "name": "방울토마토",
    "unit": "1kg",
    "price": 9136,
    "normal": 11636,
    "minMonth": 7,
    "maxMonth": 2,
    "seasonMonths": null,
    "normalMonths": [
      11367,
      11290,
      11441,
      10391,
      8232,
      7783,
      7599,
      9203,
      10658,
      11178,
      10741,
      11125
    ]
  },
  {
    "key": "422-02",
    "name": "대추방울토마토",
    "unit": "1kg",
    "price": 7260,
    "normal": 10551,
    "minMonth": 7,
    "maxMonth": 12,
    "seasonMonths": null,
    "normalMonths": [
      9122,
      9339,
      9825,
      8460,
      6519,
      5890,
      6758,
      8861,
      11676,
      11183,
      10023,
      9260
    ]
  },
  {
    "key": "424-00",
    "name": "레몬",
    "unit": "10개",
    "price": 9104,
    "normal": 10215,
    "minMonth": 10,
    "maxMonth": 4,
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
    "key": "428-00",
    "name": "망고",
    "unit": "1개",
    "price": 4779,
    "normal": 5712,
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
    "price": 11710,
    "normal": null,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9,
      10,
      11
    ],
    "normalMonths": null
  },
  {
    "key": "430-00",
    "name": "아보카도",
    "unit": "1개",
    "price": 1754,
    "normal": 2051,
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
    "name": "한우 안심 1++등급",
    "unit": "100g",
    "price": 19054,
    "normal": 14855,
    "minMonth": 12,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": [
      17390,
      16994,
      17011,
      16771,
      16611,
      16601,
      16402,
      16402,
      17058,
      17411,
      17432,
      17017
    ]
  },
  {
    "key": "4301-21-02",
    "name": "한우 안심 1+등급",
    "unit": "100g",
    "price": 17066,
    "normal": 14390,
    "minMonth": 12,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-21-03",
    "name": "한우 안심 1등급",
    "unit": "100g",
    "price": 16645,
    "normal": 13158,
    "minMonth": 12,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-22",
    "name": "한우 등심 1++등급",
    "unit": "100g",
    "price": 15682,
    "normal": 13398,
    "minMonth": 12,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": [
      14597,
      14300,
      13773,
      13577,
      13434,
      14330,
      14211,
      14181,
      14029,
      14982,
      15217,
      14692
    ]
  },
  {
    "key": "4301-22-02",
    "name": "한우 등심 1+등급",
    "unit": "100g",
    "price": 14585,
    "normal": 11710,
    "minMonth": 2,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-22-03",
    "name": "한우 등심 1등급",
    "unit": "100g",
    "price": 12186,
    "normal": 10171,
    "minMonth": 12,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-36",
    "name": "한우 설도 1++등급",
    "unit": "100g",
    "price": 5559,
    "normal": 4535,
    "minMonth": 2,
    "maxMonth": 8,
    "seasonMonths": null,
    "normalMonths": [
      4695,
      4977,
      5478,
      4962,
      4892,
      4765,
      5187,
      4938,
      5011,
      5119,
      4904,
      4822
    ]
  },
  {
    "key": "4301-36-02",
    "name": "한우 설도 1+등급",
    "unit": "100g",
    "price": 5048,
    "normal": 4554,
    "minMonth": 1,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-36-03",
    "name": "한우 설도 1등급",
    "unit": "100g",
    "price": 4936,
    "normal": 4296,
    "minMonth": 9,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-40",
    "name": "한우 양지 1++등급",
    "unit": "100g",
    "price": 7633,
    "normal": 6319,
    "minMonth": 12,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-40-02",
    "name": "한우 양지 1+등급",
    "unit": "100g",
    "price": 7077,
    "normal": 6128,
    "minMonth": 9,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-40-03",
    "name": "한우 양지 1등급",
    "unit": "100g",
    "price": 6960,
    "normal": 5726,
    "minMonth": 9,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-50",
    "name": "한우 갈비 1++등급",
    "unit": "100g",
    "price": 8550,
    "normal": 9054,
    "minMonth": 2,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-50-02",
    "name": "한우 갈비 1+등급",
    "unit": "100g",
    "price": 7153,
    "normal": 7198,
    "minMonth": 1,
    "maxMonth": 8,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-50-03",
    "name": "한우 갈비 1등급",
    "unit": "100g",
    "price": 7008,
    "normal": 6751,
    "minMonth": 12,
    "maxMonth": 6,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4304-25",
    "name": "돼지고기 앞다리",
    "unit": "100g",
    "price": 1587,
    "normal": 1422,
    "minMonth": 4,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4304-27",
    "name": "돼지고기 삼겹살",
    "unit": "100g",
    "price": 2862,
    "normal": 2581,
    "minMonth": 3,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4304-28",
    "name": "돼지고기 갈비",
    "unit": "100g",
    "price": 1555,
    "normal": 1460,
    "minMonth": 4,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4304-68",
    "name": "돼지고기 목심",
    "unit": "100g",
    "price": 2705,
    "normal": 2422,
    "minMonth": 3,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "437-01",
    "name": "키위",
    "unit": "10개",
    "price": 13905,
    "normal": null,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9,
      10,
      11
    ],
    "normalMonths": null
  },
  {
    "key": "4401-31",
    "name": "미국산 소고기 갈비",
    "unit": "100g",
    "price": 4757,
    "normal": 4307,
    "minMonth": 9,
    "maxMonth": 7,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4401-31-82",
    "name": "호주산 소고기 갈비",
    "unit": "100g",
    "price": 4096,
    "normal": 4288,
    "minMonth": 9,
    "maxMonth": 7,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4401-37",
    "name": "미국산 소고기 갈비살",
    "unit": "100g",
    "price": 5676,
    "normal": 4478,
    "minMonth": 5,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4401-37-82",
    "name": "호주산 소고기 갈비살",
    "unit": "100g",
    "price": 5306,
    "normal": 4114,
    "minMonth": 6,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4402-27",
    "name": "수입 돼지고기 삼겹살",
    "unit": "100g",
    "price": 1537,
    "normal": 1494,
    "minMonth": 4,
    "maxMonth": 7,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "9901-24",
    "name": "닭고기 절단육",
    "unit": "1kg",
    "price": null,
    "normal": 7970,
    "minMonth": 12,
    "maxMonth": 4,
    "seasonMonths": null,
    "normalMonths": [
      8230,
      8474,
      8418,
      8530,
      8598,
      8178,
      8644,
      8721,
      9660,
      8305,
      8304,
      8155
    ]
  },
  {
    "key": "9901-99",
    "name": "닭고기 육계",
    "unit": "1kg",
    "price": 5656,
    "normal": 5457,
    "minMonth": 12,
    "maxMonth": 4,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "9903-21",
    "name": "계란 10구",
    "unit": "10구",
    "price": 4084,
    "normal": 3507,
    "minMonth": 12,
    "maxMonth": 6,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "9903-23",
    "name": "계란 30구",
    "unit": "30구",
    "price": 7354,
    "normal": 6662,
    "minMonth": 2,
    "maxMonth": 6,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "9908-01",
    "name": "우유",
    "unit": "1L",
    "price": 2984,
    "normal": 2923,
    "minMonth": 5,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": null
  }
];
/** 이 파일을 만든 날(YYYYMMDD). 공유 카드 이미지 URL의 캐시 무효화에 쓴다 —
 *  카톡은 OG 이미지를 오래 캐싱해서 주소가 같으면 어제 가격이 계속 보인다. */
export const SEO_BUILD_DAY = '20261112';
export const SEO_BY_KEY: Record<string, SeoItem> = Object.fromEntries(SEO_ITEMS.map((i) => [i.key, i]));

/** 레시피 상세를 정적으로 내리기 위한 목록. 주소는 순번이 아니라 제목 슬러그다. */
export interface SeoRecipe {
  slug: string;
  title: string;
}
export const SEO_RECIPES: SeoRecipe[] = [
  {
    "slug": "토마토오리볶음",
    "title": "토마토오리볶음"
  },
  {
    "slug": "고구마-찰-빵",
    "title": "고구마 찰 빵"
  },
  {
    "slug": "콩가루-소보로",
    "title": "콩가루 소보로"
  },
  {
    "slug": "바질향이-향긋한-고구마-찰-바케트",
    "title": "바질향이 향긋한 고구마 찰 바케트"
  },
  {
    "slug": "단호박-양고기볶음",
    "title": "단호박 양고기볶음"
  },
  {
    "slug": "치즈-두부-튀김",
    "title": "치즈 두부 튀김"
  },
  {
    "slug": "고구마-공갈빵",
    "title": "고구마 공갈빵"
  },
  {
    "slug": "자색고구마-버터크림-빵",
    "title": "자색고구마 버터크림 빵"
  },
  {
    "slug": "고구마-김치",
    "title": "고구마 김치"
  },
  {
    "slug": "토마토카레-채소볶음밥",
    "title": "토마토카레 채소볶음밥"
  },
  {
    "slug": "퀴노아닭가슴살샐러드",
    "title": "퀴노아닭가슴살샐러드"
  },
  {
    "slug": "망고샐러드",
    "title": "망고샐러드"
  },
  {
    "slug": "꽃밥",
    "title": "꽃밥"
  },
  {
    "slug": "김말이두부스테이크",
    "title": "김말이두부스테이크"
  },
  {
    "slug": "닭고기채소스파게티",
    "title": "닭고기채소스파게티"
  },
  {
    "slug": "토마토두루치기",
    "title": "토마토두루치기"
  },
  {
    "slug": "카레가자미조림",
    "title": "카레가자미조림"
  },
  {
    "slug": "닭갈비볶음면",
    "title": "닭갈비볶음면"
  },
  {
    "slug": "파프리카-물김치",
    "title": "파프리카 물김치"
  },
  {
    "slug": "삼색샌드위치",
    "title": "삼색샌드위치"
  },
  {
    "slug": "로제소스라면",
    "title": "로제소스라면"
  },
  {
    "slug": "산나물된장찌개",
    "title": "산나물된장찌개"
  },
  {
    "slug": "토마토소스닭갈비",
    "title": "토마토소스닭갈비"
  },
  {
    "slug": "고구마두부스테이크",
    "title": "고구마두부스테이크"
  },
  {
    "slug": "복분자소스를-곁들인-닭테린",
    "title": "복분자소스를 곁들인 닭테린"
  },
  {
    "slug": "라이스버거떡갈비",
    "title": "라이스버거떡갈비"
  },
  {
    "slug": "새우와스테이크",
    "title": "새우와스테이크"
  },
  {
    "slug": "소고기볼게살타르",
    "title": "소고기볼게살타르"
  },
  {
    "slug": "오징어구이",
    "title": "오징어구이"
  },
  {
    "slug": "냉토마토파스타",
    "title": "냉토마토파스타"
  }
];
