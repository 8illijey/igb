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
    "price": 62900,
    "normal": 54776,
    "minMonth": 7,
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
    "name": "쌀 20kg",
    "unit": "20kg",
    "price": 65233,
    "normal": 51066,
    "minMonth": 8,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "111-10",
    "name": "쌀 10kg",
    "unit": "10kg",
    "price": 38600,
    "normal": 32429,
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
    "name": "쌀 10kg",
    "unit": "10kg",
    "price": 35457,
    "normal": 32954,
    "minMonth": 8,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "112-01",
    "name": "찹쌀",
    "unit": "1kg",
    "price": 5606,
    "normal": 4212,
    "minMonth": 7,
    "maxMonth": 11,
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
    "price": 8777,
    "normal": 7879,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9,
      10
    ],
    "normalMonths": null
  },
  {
    "key": "115-01",
    "name": "현미",
    "unit": "1kg",
    "price": 5858,
    "normal": 5685,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9,
      10
    ],
    "normalMonths": null
  },
  {
    "key": "121-04",
    "name": "보리쌀",
    "unit": "1kg",
    "price": 4553,
    "normal": 5164,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9,
      10
    ],
    "normalMonths": null
  },
  {
    "key": "141-01",
    "name": "콩",
    "unit": "500g",
    "price": 5126,
    "normal": 5204,
    "minMonth": 2,
    "maxMonth": 6,
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
    "normal": 9435,
    "minMonth": 12,
    "maxMonth": 11,
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
    "price": 12646,
    "normal": 12919,
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
    "price": 5104,
    "normal": 4805,
    "minMonth": 7,
    "maxMonth": 3,
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
    "price": 352,
    "normal": 308,
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
    "name": "배추",
    "unit": "1포기",
    "price": 4533,
    "normal": 4913,
    "minMonth": 5,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "212-00",
    "name": "양배추",
    "unit": "1포기",
    "price": 4734,
    "normal": 4291,
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
    "price": 737,
    "normal": 1018,
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
    "price": 964,
    "normal": 1486,
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
    "price": 973,
    "normal": 1588,
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
    "price": 1923,
    "normal": 3034,
    "minMonth": 6,
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
    "key": "221-00",
    "name": "수박",
    "unit": "1개",
    "price": 18900,
    "normal": 20326,
    "minMonth": 7,
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
    "price": 9117,
    "normal": 16426,
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
    "price": 5383,
    "normal": 10569,
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
    "price": 6215,
    "normal": 13540,
    "minMonth": 6,
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
    "price": 1050,
    "normal": 1626,
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
    "price": 1655,
    "normal": 2289,
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
    "price": 5638,
    "normal": 9248,
    "minMonth": 7,
    "maxMonth": 11,
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
    "name": "무",
    "unit": "1개",
    "price": 2241,
    "normal": 2474,
    "minMonth": 7,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "232-01",
    "name": "당근",
    "unit": "1kg",
    "price": 4248,
    "normal": 4269,
    "minMonth": 4,
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
    "price": 1701,
    "normal": 3473,
    "minMonth": 6,
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
    "price": 17425,
    "normal": 16969,
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
    "name": "풋고추",
    "unit": "100g",
    "price": 1686,
    "normal": 1737,
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
    "price": 1466,
    "normal": 1371,
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
    "price": 1206,
    "normal": 1080,
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
    "price": 999,
    "normal": 1183,
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
    "price": 2560,
    "normal": 1789,
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
    "price": 2136,
    "normal": 2142,
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
    "price": 2974,
    "normal": 3082,
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
    "price": 3980,
    "normal": 8292,
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
    "price": 12493,
    "normal": 11882,
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
    "price": 32833,
    "normal": 34961,
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
    "price": 14000,
    "normal": 13673,
    "minMonth": 11,
    "maxMonth": 8,
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
    "price": 2300,
    "normal": 2381,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9,
      10
    ],
    "normalMonths": null
  },
  {
    "key": "252-00",
    "name": "미나리",
    "unit": "100g",
    "price": 1943,
    "normal": 1828,
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
    "price": 1276,
    "normal": 1483,
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
    "price": 698,
    "normal": 736,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9,
      10
    ],
    "normalMonths": null
  },
  {
    "key": "255-00",
    "name": "피망",
    "unit": "100g",
    "price": 1324,
    "normal": 1414,
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
    "price": 1554,
    "normal": 1722,
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
    "price": 9675,
    "normal": 9399,
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
    "price": 10973,
    "normal": 10248,
    "minMonth": 11,
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
    "price": 3134,
    "normal": 3550,
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
    "price": 2788,
    "normal": 3515,
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
    "key": "411-07",
    "name": "홍로사과",
    "unit": "10개",
    "price": 21800,
    "normal": 21948,
    "minMonth": 10,
    "maxMonth": 2,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "411-08",
    "name": "사과 시나노골드",
    "unit": "10개",
    "price": 20500,
    "normal": 21062,
    "minMonth": 8,
    "maxMonth": 2,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "412-01",
    "name": "배",
    "unit": "10개",
    "price": 26988,
    "normal": 25936,
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
    "price": 8310,
    "normal": 8072,
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
    "price": 18900,
    "normal": 25859,
    "minMonth": 12,
    "maxMonth": 11,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "414-12",
    "name": "샤인머스켓포도",
    "unit": "2kg",
    "price": 10622,
    "normal": 19255,
    "minMonth": 11,
    "maxMonth": 7,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "415-01",
    "name": "노지감귤",
    "unit": "10개",
    "price": 3258,
    "normal": 3269,
    "minMonth": 10,
    "maxMonth": 2,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "415-02",
    "name": "시설감귤",
    "unit": "10개",
    "price": 7418,
    "normal": 6004,
    "minMonth": 11,
    "maxMonth": 3,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "416-00",
    "name": "단감",
    "unit": "5개",
    "price": 7110,
    "normal": 5737,
    "minMonth": 11,
    "maxMonth": 2,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "418-02",
    "name": "바나나",
    "unit": "100g",
    "price": 339,
    "normal": 297,
    "minMonth": 8,
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
    "price": 7323,
    "normal": 6813,
    "minMonth": 3,
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
    "price": 12567,
    "normal": 12980,
    "minMonth": 9,
    "maxMonth": 2,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "422-01",
    "name": "방울토마토",
    "unit": "1kg",
    "price": 9935,
    "normal": 11298,
    "minMonth": 7,
    "maxMonth": 11,
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
    "price": 8666,
    "normal": 11077,
    "minMonth": 7,
    "maxMonth": 11,
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
    "price": 8258,
    "normal": 8344,
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
    "key": "428-00",
    "name": "망고",
    "unit": "1개",
    "price": 5832,
    "normal": 5500,
    "minMonth": 4,
    "maxMonth": 9,
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
    "price": 10915,
    "normal": 11567,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9,
      10
    ],
    "normalMonths": null
  },
  {
    "key": "430-00",
    "name": "아보카도",
    "unit": "1개",
    "price": 2000,
    "normal": 1957,
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
    "price": 19786,
    "normal": 15072,
    "minMonth": 12,
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
    "key": "4301-21-02",
    "name": "한우 안심 1+등급",
    "unit": "100g",
    "price": 17186,
    "normal": 14472,
    "minMonth": 12,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-21-03",
    "name": "한우 안심 1등급",
    "unit": "100g",
    "price": 16798,
    "normal": 13287,
    "minMonth": 11,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-22",
    "name": "한우 등심 1++등급",
    "unit": "100g",
    "price": 16630,
    "normal": 13611,
    "minMonth": 12,
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
    "key": "4301-22-02",
    "name": "한우 등심 1+등급",
    "unit": "100g",
    "price": 13855,
    "normal": 12328,
    "minMonth": 11,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-22-03",
    "name": "한우 등심 1등급",
    "unit": "100g",
    "price": 12002,
    "normal": 10328,
    "minMonth": 12,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-36",
    "name": "한우 설도 1++등급",
    "unit": "100g",
    "price": 6274,
    "normal": 4776,
    "minMonth": 11,
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
    "key": "4301-36-02",
    "name": "한우 설도 1+등급",
    "unit": "100g",
    "price": 5487,
    "normal": 4530,
    "minMonth": 11,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-36-03",
    "name": "한우 설도 1등급",
    "unit": "100g",
    "price": 4968,
    "normal": 4195,
    "minMonth": 11,
    "maxMonth": 4,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-40",
    "name": "한우 양지 1++등급",
    "unit": "100g",
    "price": 8046,
    "normal": 6443,
    "minMonth": 11,
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
    "key": "4301-40-02",
    "name": "한우 양지 1+등급",
    "unit": "100g",
    "price": 7145,
    "normal": 6335,
    "minMonth": 9,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-40-03",
    "name": "한우 양지 1등급",
    "unit": "100g",
    "price": 7084,
    "normal": 5783,
    "minMonth": 9,
    "maxMonth": 3,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-50",
    "name": "한우 갈비 1++등급",
    "unit": "100g",
    "price": 9101,
    "normal": 9170,
    "minMonth": 2,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": [
      7844,
      7779,
      7621,
      7658,
      7991,
      9050,
      7954,
      7442,
      7542,
      7583,
      7496,
      7465
    ]
  },
  {
    "key": "4301-50-02",
    "name": "한우 갈비 1+등급",
    "unit": "100g",
    "price": 7180,
    "normal": 7021,
    "minMonth": 11,
    "maxMonth": 8,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4301-50-03",
    "name": "한우 갈비 1등급",
    "unit": "100g",
    "price": 6826,
    "normal": 6622,
    "minMonth": 12,
    "maxMonth": 6,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4304-25",
    "name": "돼지고기 앞다리",
    "unit": "100g",
    "price": 1670,
    "normal": 1454,
    "minMonth": 11,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": [
      1419,
      1351,
      1352,
      1349,
      1409,
      1435,
      1476,
      1460,
      1484,
      1474,
      1445,
      1462
    ]
  },
  {
    "key": "4304-27",
    "name": "돼지고기 삼겹살",
    "unit": "100g",
    "price": 2910,
    "normal": 2739,
    "minMonth": 3,
    "maxMonth": 9,
    "seasonMonths": null,
    "normalMonths": [
      2548,
      2424,
      2338,
      2456,
      2691,
      2804,
      2803,
      2724,
      2795,
      2813,
      2656,
      2647
    ]
  },
  {
    "key": "4304-28",
    "name": "돼지고기 갈비",
    "unit": "100g",
    "price": 1561,
    "normal": 1461,
    "minMonth": 4,
    "maxMonth": 9,
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
    "price": 2749,
    "normal": 2567,
    "minMonth": 3,
    "maxMonth": 9,
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
    "price": 16317,
    "normal": 15232,
    "minMonth": null,
    "maxMonth": null,
    "seasonMonths": [
      9,
      10
    ],
    "normalMonths": null
  },
  {
    "key": "4401-31",
    "name": "미국산 소고기 갈비",
    "unit": "100g",
    "price": 4618,
    "normal": 4295,
    "minMonth": 9,
    "maxMonth": 7,
    "seasonMonths": null,
    "normalMonths": [
      4114,
      4131,
      4126,
      4136,
      4316,
      4305,
      4146,
      4221,
      4147,
      4274,
      4336,
      4312
    ]
  },
  {
    "key": "4401-31-82",
    "name": "호주산 소고기 갈비",
    "unit": "100g",
    "price": 4430,
    "normal": 4299,
    "minMonth": 9,
    "maxMonth": 7,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4401-37",
    "name": "미국산 소고기 갈비살",
    "unit": "100g",
    "price": 5855,
    "normal": 4472,
    "minMonth": 5,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": [
      4312,
      4383,
      4322,
      4330,
      4379,
      4675,
      4488,
      4586,
      4681,
      4737,
      4577,
      4446
    ]
  },
  {
    "key": "4401-37-82",
    "name": "호주산 소고기 갈비살",
    "unit": "100g",
    "price": 6779,
    "normal": 4826,
    "minMonth": 6,
    "maxMonth": 10,
    "seasonMonths": null,
    "normalMonths": null
  },
  {
    "key": "4402-27",
    "name": "수입 돼지고기 삼겹살",
    "unit": "100g",
    "price": 1521,
    "normal": 1490,
    "minMonth": 4,
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
    "normal": 8497,
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
    "price": 5897,
    "normal": 5694,
    "minMonth": 12,
    "maxMonth": 4,
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
    "price": 4203,
    "normal": 3547,
    "minMonth": 11,
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
    "price": 6775,
    "normal": 6922,
    "minMonth": 11,
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
    "price": 2966,
    "normal": 2931,
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
export const SEO_BUILD_DAY = '20261025';
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
    "slug": "닭고기채소스파게티",
    "title": "닭고기채소스파게티"
  },
  {
    "slug": "파프리카볶음밥",
    "title": "파프리카볶음밥"
  },
  {
    "slug": "닭고기라이스롤",
    "title": "닭고기라이스롤"
  },
  {
    "slug": "수삼매운닭찜",
    "title": "수삼매운닭찜"
  },
  {
    "slug": "닭고기또띠아",
    "title": "닭고기또띠아"
  },
  {
    "slug": "카레탄두리치킨과-닭가슴살냉채",
    "title": "카레탄두리치킨과 닭가슴살냉채"
  },
  {
    "slug": "닭고기월남쌈",
    "title": "닭고기월남쌈"
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
    "slug": "초계탕과-사색곤약",
    "title": "초계탕과 사색곤약"
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
    "slug": "삼계치킨롤",
    "title": "삼계치킨롤"
  },
  {
    "slug": "머쉬룸-닭스테이크",
    "title": "머쉬룸 닭스테이크"
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
    "slug": "세가지샐러드",
    "title": "세가지샐러드"
  },
  {
    "slug": "닭고기-완자삼계죽",
    "title": "닭고기 완자삼계죽"
  },
  {
    "slug": "감닭떡갈비",
    "title": "감닭떡갈비"
  },
  {
    "slug": "미역볶음밥",
    "title": "미역볶음밥"
  },
  {
    "slug": "닭가슴살청포묵비빔밥",
    "title": "닭가슴살청포묵비빔밥"
  },
  {
    "slug": "닭고기볶음밥",
    "title": "닭고기볶음밥"
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
    "slug": "룰룰랄라",
    "title": "룰룰랄라"
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
