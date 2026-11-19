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
    "price": 63351,
    "normal": 57963,
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
    "price": 35292,
    "normal": 31647,
    "minMonth": 6,
    "maxMonth": 10,
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
    "price": 5171,
    "normal": 4865,
    "minMonth": 7,
    "maxMonth": 6,
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
    "price": 7822,
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
    "price": 5696,
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
    "price": 5053,
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
    "price": 5059,
    "normal": 5033,
    "minMonth": 12,
    "maxMonth": 1,
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
    "price": 13332,
    "normal": 10936,
    "minMonth": 12,
    "maxMonth": 1,
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
    "price": 12281,
    "normal": 11502,
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
    "price": 5079,
    "normal": 5209,
    "minMonth": 7,
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
    "price": 316,
    "normal": 343,
    "minMonth": 8,
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
    "key": "211-03",
    "name": "배추",
    "unit": "1포기",
    "price": 2353,
    "normal": 3036,
    "minMonth": 5,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "212-00",
    "name": "양배추",
    "unit": "1포기",
    "price": 4143,
    "normal": 3758,
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
    "price": 1076,
    "normal": 870,
    "minMonth": 4,
    "maxMonth": 8,
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
    "price": 1223,
    "normal": 1052,
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
    "normal": 1176,
    "minMonth": 10,
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
    "price": 2455,
    "normal": 3082,
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
    "price": 3476,
    "normal": 3954,
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
    "price": 20382,
    "normal": 21875,
    "minMonth": 9,
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
    "price": 13976,
    "normal": 17399,
    "minMonth": 10,
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
    "price": 10438,
    "normal": 9926,
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
    "price": 15564,
    "normal": 16379,
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
    "price": 1568,
    "normal": 1491,
    "minMonth": 5,
    "maxMonth": 9,
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
    "price": 2419,
    "normal": 2153,
    "minMonth": 5,
    "maxMonth": 1,
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
    "price": 4112,
    "normal": 6679,
    "minMonth": 6,
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
    "key": "226-00",
    "name": "딸기",
    "unit": "500g",
    "price": 16971,
    "normal": 18577,
    "minMonth": 4,
    "maxMonth": 11,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "231-02",
    "name": "무 고랭지",
    "unit": "1개",
    "price": 1863,
    "normal": 2500,
    "minMonth": 7,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "231-03",
    "name": "가을무",
    "unit": "1개",
    "price": 1813,
    "normal": 1981,
    "minMonth": 4,
    "maxMonth": 12,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "232-01",
    "name": "당근",
    "unit": "1kg",
    "price": 4660,
    "normal": 4269,
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
    "price": 2883,
    "normal": 3437,
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
    "price": 16373,
    "normal": 18600,
    "minMonth": 10,
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
    "price": 1710,
    "normal": 1663,
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
    "price": 1573,
    "normal": 1205,
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
    "price": 1164,
    "normal": 981,
    "minMonth": 5,
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
    "price": 927,
    "normal": 1076,
    "minMonth": 5,
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
    "price": 2002,
    "normal": 1769,
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
    "price": 2056,
    "normal": 1947,
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
    "price": 2465,
    "normal": 3076,
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
    "price": 3914,
    "normal": 6868,
    "minMonth": 4,
    "maxMonth": 8,
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
    "price": 8883,
    "normal": 9389,
    "minMonth": 11,
    "maxMonth": 6,
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
    "price": 30110,
    "normal": 31359,
    "minMonth": 11,
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
    "price": 13638,
    "normal": 13733,
    "minMonth": 9,
    "maxMonth": 11,
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
    "price": 3468,
    "normal": 2751,
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
    "price": 1862,
    "normal": 1425,
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
    "price": 1489,
    "normal": 1276,
    "minMonth": 7,
    "maxMonth": 1,
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
    "price": 779,
    "normal": 755,
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
    "price": 1388,
    "normal": 1464,
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
    "price": 1256,
    "normal": 1350,
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
    "price": 10914,
    "normal": 10296,
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
    "price": 11253,
    "normal": 9316,
    "minMonth": 2,
    "maxMonth": 6,
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
    "price": 2769,
    "normal": 2915,
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
    "normal": 2967,
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
    "price": 17113,
    "normal": 19998,
    "minMonth": 11,
    "maxMonth": 12,
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
    "price": 23058,
    "normal": 21700,
    "minMonth": 10,
    "maxMonth": 8,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "411-08",
    "name": "사과 시나노골드",
    "unit": "10개",
    "price": 17112,
    "normal": 16468,
    "minMonth": 8,
    "maxMonth": 12,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "412-01",
    "name": "배",
    "unit": "10개",
    "price": 27069,
    "normal": 24861,
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
    "normal": null,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "414-12",
    "name": "샤인머스켓포도",
    "unit": "2kg",
    "price": 10907,
    "normal": 18685,
    "minMonth": 11,
    "maxMonth": 7,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "415-01",
    "name": "노지감귤",
    "unit": "10개",
    "price": 3529,
    "normal": 3004,
    "minMonth": 10,
    "maxMonth": 2,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "415-02",
    "name": "시설감귤",
    "unit": "10개",
    "price": 6274,
    "normal": null,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "416-00",
    "name": "단감",
    "unit": "5개",
    "price": 5798,
    "normal": 5100,
    "minMonth": 4,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "418-02",
    "name": "바나나",
    "unit": "100g",
    "price": 296,
    "normal": 282,
    "minMonth": 11,
    "maxMonth": 2,
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
    "price": 7435,
    "normal": 5982,
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
    "price": 12355,
    "normal": 14860,
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
    "normal": 10546,
    "minMonth": 7,
    "maxMonth": 1,
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
    "price": 7333,
    "normal": 10259,
    "minMonth": 7,
    "maxMonth": 9,
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
    "price": 9128,
    "normal": 8540,
    "minMonth": 10,
    "maxMonth": 7,
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
    "price": 5454,
    "normal": 5955,
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
    "price": 10677,
    "normal": 11120,
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
    "price": 1919,
    "normal": 1852,
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
    "price": 19888,
    "normal": 14328,
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
    "price": 17199,
    "normal": 14212,
    "minMonth": 12,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-21-03",
    "name": "한우 안심 1등급",
    "unit": "100g",
    "price": 16836,
    "normal": 12543,
    "minMonth": 12,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-22",
    "name": "한우 등심 1++등급",
    "unit": "100g",
    "price": 16593,
    "normal": 12872,
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
    "price": 13865,
    "normal": 11359,
    "minMonth": 1,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-22-03",
    "name": "한우 등심 1등급",
    "unit": "100g",
    "price": 12056,
    "normal": 9516,
    "minMonth": 2,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-36",
    "name": "한우 설도 1++등급",
    "unit": "100g",
    "price": 6403,
    "normal": 4384,
    "minMonth": 2,
    "maxMonth": 8,
    "seasonMonths": null,
    "normalMonths": [
      5029,
      5041,
      4884,
      5050,
      5031,
      5147,
      5255,
      5056,
      5135,
      5125,
      4823,
      4956
    ]
  },
  {
    "key": "4301-36-02",
    "name": "한우 설도 1+등급",
    "unit": "100g",
    "price": 5481,
    "normal": 4464,
    "minMonth": 1,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-36-03",
    "name": "한우 설도 1등급",
    "unit": "100g",
    "price": 5213,
    "normal": 4258,
    "minMonth": 12,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-40",
    "name": "한우 양지 1++등급",
    "unit": "100g",
    "price": 8091,
    "normal": 5959,
    "minMonth": 12,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": [
      6652,
      6693,
      6011,
      6017,
      6194,
      6454,
      6538,
      6456,
      6779,
      6694,
      6664,
      6458
    ]
  },
  {
    "key": "4301-40-02",
    "name": "한우 양지 1+등급",
    "unit": "100g",
    "price": 7189,
    "normal": 6115,
    "minMonth": 9,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-40-03",
    "name": "한우 양지 1등급",
    "unit": "100g",
    "price": 6981,
    "normal": 5720,
    "minMonth": 9,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-50",
    "name": "한우 갈비 1++등급",
    "unit": "100g",
    "price": 8538,
    "normal": 11046,
    "minMonth": 4,
    "maxMonth": 8,
    "seasonMonths": null,
    "normalMonths": [
      7963,
      7920,
      8275,
      8606,
      8370,
      8647,
      7740,
      7746,
      8274,
      8338,
      8121,
      8021
    ]
  },
  {
    "key": "4301-50-02",
    "name": "한우 갈비 1+등급",
    "unit": "100g",
    "price": 7214,
    "normal": 7223,
    "minMonth": 4,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-50-03",
    "name": "한우 갈비 1등급",
    "unit": "100g",
    "price": 6875,
    "normal": 7064,
    "minMonth": 7,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4304-25",
    "name": "돼지고기 앞다리",
    "unit": "100g",
    "price": 1524,
    "normal": 1546,
    "minMonth": 3,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4304-27",
    "name": "돼지고기 삼겹살",
    "unit": "100g",
    "price": 2819,
    "normal": 2566,
    "minMonth": 3,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4304-28",
    "name": "돼지고기 갈비",
    "unit": "100g",
    "price": 1569,
    "normal": 1433,
    "minMonth": 4,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": [
      1422,
      1413,
      1360,
      1367,
      1403,
      1418,
      1434,
      1423,
      1515,
      1496,
      1460,
      1433
    ]
  },
  {
    "key": "4304-68",
    "name": "돼지고기 목심",
    "unit": "100g",
    "price": 2606,
    "normal": 2453,
    "minMonth": 3,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": [
      2357,
      2292,
      2190,
      2257,
      2516,
      2610,
      2618,
      2547,
      2602,
      2630,
      2471,
      2436
    ]
  },
  {
    "key": "437-01",
    "name": "키위",
    "unit": "10개",
    "price": 14885,
    "normal": 12481,
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
    "price": 4764,
    "normal": 4187,
    "minMonth": 9,
    "maxMonth": 11,
    "seasonMonths": null,
    "normalMonths": [
      4216,
      4163,
      4041,
      4094,
      4254,
      4259,
      4227,
      4274,
      4189,
      4287,
      4306,
      4296
    ]
  },
  {
    "key": "4401-31-82",
    "name": "호주산 소고기 갈비",
    "unit": "100g",
    "price": 4015,
    "normal": 4301,
    "minMonth": 9,
    "maxMonth": 3,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4401-37",
    "name": "미국산 소고기 갈비살",
    "unit": "100g",
    "price": 5943,
    "normal": 4524,
    "minMonth": 3,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": [
      4111,
      4394,
      4278,
      4179,
      4512,
      4666,
      4486,
      4609,
      4677,
      4707,
      4774,
      4339
    ]
  },
  {
    "key": "4401-37-82",
    "name": "호주산 소고기 갈비살",
    "unit": "100g",
    "price": 5306,
    "normal": 3691,
    "minMonth": 6,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4402-27",
    "name": "수입 돼지고기 삼겹살",
    "unit": "100g",
    "price": 1511,
    "normal": 1512,
    "minMonth": 10,
    "maxMonth": 7,
    "seasonMonths": null,
    "normalMonths": [
      1471,
      1459,
      1468,
      1473,
      1506,
      1460,
      1470,
      1498,
      1483,
      1487,
      1493,
      1509
    ]
  },
  {
    "key": "9901-24",
    "name": "닭고기 절단육",
    "unit": "1kg",
    "price": null,
    "normal": null,
    "minMonth": null,
    "maxMonth": null,
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
    "price": 5351,
    "normal": 5443,
    "minMonth": 10,
    "maxMonth": 5,
    "seasonMonths": null,
    "normalMonths": [
      5688,
      6050,
      6032,
      6074,
      6026,
      5768,
      6156,
      6046,
      5792,
      5585,
      5428,
      5340
    ]
  },
  {
    "key": "9903-21",
    "name": "계란 10구",
    "unit": "10구",
    "price": 4061,
    "normal": 4112,
    "minMonth": 1,
    "maxMonth": 6,
    "seasonMonths": null,
    "normalMonths": [
      4101,
      3897,
      5303,
      3884,
      3760,
      3833,
      3885,
      4023,
      4106,
      4508,
      4278,
      4285
    ]
  },
  {
    "key": "9903-23",
    "name": "계란 30구",
    "unit": "30구",
    "price": 7243,
    "normal": 6722,
    "minMonth": 2,
    "maxMonth": 6,
    "seasonMonths": null,
    "normalMonths": [
      6673,
      6701,
      6580,
      6828,
      6902,
      6937,
      6841,
      6958,
      6748,
      6896,
      6769,
      6882
    ]
  },
  {
    "key": "9908-01",
    "name": "우유",
    "unit": "1L",
    "price": 2971,
    "normal": 2970,
    "minMonth": 5,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": [
      2947,
      2963,
      3046,
      3007,
      2969,
      2936,
      2905,
      2916,
      2916,
      2951,
      2969,
      2988
    ]
  }
];
/** 이 파일을 만든 날(YYYYMMDD). 공유 카드 이미지 URL의 캐시 무효화에 쓴다 —
 *  카톡은 OG 이미지를 오래 캐싱해서 주소가 같으면 어제 가격이 계속 보인다. */
export const SEO_BUILD_DAY = '20261119';
export const SEO_BY_KEY: Record<string, SeoItem> = Object.fromEntries(SEO_ITEMS.map((i) => [i.key, i]));

/** 레시피 상세를 정적으로 내리기 위한 목록. 주소는 순번이 아니라 제목 슬러그다. */
export interface SeoRecipe {
  slug: string;
  title: string;
}
export const SEO_RECIPES: SeoRecipe[] = [
  {
    "slug": "돼지고기-숙주덮밥",
    "title": "돼지고기 숙주덮밥"
  },
  {
    "slug": "함박스테이크",
    "title": "함박스테이크"
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
    "slug": "완자된장국",
    "title": "완자된장국"
  },
  {
    "slug": "굴림만두된장국",
    "title": "굴림만두된장국"
  },
  {
    "slug": "양배추감자전",
    "title": "양배추감자전"
  },
  {
    "slug": "코코넛밀크카레",
    "title": "코코넛밀크카레"
  },
  {
    "slug": "오색볶음면",
    "title": "오색볶음면"
  },
  {
    "slug": "맥적구이",
    "title": "맥적구이"
  },
  {
    "slug": "오렌지마리네이드-돼지고기",
    "title": "오렌지마리네이드 돼지고기"
  },
  {
    "slug": "견과류통삼겹살찜",
    "title": "견과류통삼겹살찜"
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
    "slug": "두유-마-떡갈비",
    "title": "두유 마 떡갈비"
  },
  {
    "slug": "떡갈비와-미니잡곡밥",
    "title": "떡갈비와 미니잡곡밥"
  },
  {
    "slug": "떡갈비주먹밥",
    "title": "떡갈비주먹밥"
  },
  {
    "slug": "함초떡갈비",
    "title": "함초떡갈비"
  },
  {
    "slug": "떡완자조림",
    "title": "떡완자조림"
  },
  {
    "slug": "미니함박스테이크",
    "title": "미니함박스테이크"
  },
  {
    "slug": "라이스버거떡갈비",
    "title": "라이스버거떡갈비"
  },
  {
    "slug": "두부-카프리제",
    "title": "두부 카프리제"
  },
  {
    "slug": "햄버거스테이크",
    "title": "햄버거스테이크"
  },
  {
    "slug": "떡갈비찜",
    "title": "떡갈비찜"
  },
  {
    "slug": "토마토돼지고기해장국",
    "title": "토마토돼지고기해장국"
  },
  {
    "slug": "들깨된장육개장",
    "title": "들깨된장육개장"
  },
  {
    "slug": "매실소스를-곁들인-돼지고기만두",
    "title": "매실소스를 곁들인 돼지고기만두"
  }
];
