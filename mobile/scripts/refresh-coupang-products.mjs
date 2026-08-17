/**
 * 쿠팡 파트너스 상품·딥링크 일일 갱신 — mobile/src/coupang-products.json 재생성.
 *
 * 하는 일
 *  1) KAMIS(워커 프록시)에서 앱과 동일한 로직으로 품목 목록을 뽑는다 (itemCode-kindCode 단위).
 *  2) 품목마다 파트너스 상품검색으로 후보를 받아 로켓프레시/로켓 > 리뷰수 > 가격합리성으로 3개 고른다.
 *  3) 어제와 같은 상품(vendorItemId 일치)이면 **기존 딥링크를 재사용**하고, 새로 들어온 상품만 링크를 생성한다.
 *
 * 딥링크를 재사용하는 이유 — 최적화가 아니라 필수다.
 *  · 딥링크는 상품에 1:1로 붙는 영구 URL이라, 같은 상품에 다시 만들어도 목적지가 동일한 링크만 늘어난다.
 *  · 파트너스 웹 API는 **분당 50회** 제한이고, 3회 초과하면 계정 이용이 제한된다.
 *    (2026-08-17 최초 201개 일괄 생성 중 2회 초과 → 24시간 차단을 실제로 맞음)
 *  · 그래서 이 스크립트는 분당 상한(RPM)을 스스로 지키고, 429를 보면 **즉시 중단**한다.
 *    남은 품목을 포기하더라도 3회째 위반은 만들지 않는다.
 *
 * 실행 방법 두 가지 — 파트너스 API는 로그인 세션(쿠키)이 필요하다.
 *  A) Aside 브라우저 세션 (일일 루틴이 쓰는 경로). scripts/README-coupang.md 참고.
 *  B) 수동/CLI:  COUPANG_PARTNERS_COOKIE='...' node scripts/refresh-coupang-products.mjs
 *     쿠키는 로그인한 크롬의 partners.coupang.com 요청 헤더에서 통째로 복사.
 *     옵션: --dry-run(파일 미기록)  --only=245,211(특정 itemCode만)  --rpm=35
 *
 * 산출물: mobile/src/coupang-products.json  (키 = `itemCode-kindCode`)
 */

(function () {
  // ── 상수 ────────────────────────────────────────────────────────────────
  const KAMIS_BASE = 'https://igeobissa-recipes.designerxyzi.workers.dev/kamis';
  const CATEGORIES = ['100', '200', '400', '500'];
  const SEARCH_SIZE = 36;
  const PICK_N = 3;

  /** 파트너스 웹 API 분당 한도는 50. 여유를 크게 두고 35로 돈다(초과 1회의 대가가 너무 크다). */
  const DEFAULT_RPM = 35;

  /** KAMIS 품목명 → 쿠팡 검색어 */
  const KEYWORDS = {
    쌀: '쌀 10kg', 찹쌀: '찹쌀', 콩: '백태 콩', 팥: '팥', 녹두: '녹두', 고구마: '고구마', 감자: '감자',
    배추: '배추', 양배추: '양배추', 시금치: '시금치', 상추: '상추', 얼갈이배추: '얼갈이배추',
    수박: '수박', 참외: '참외', 오이: '오이', 호박: '애호박', 토마토: '토마토', 무: '무',
    당근: '당근', 열무: '열무', 건고추: '건고추', 풋고추: '풋고추', 붉은고추: '홍고추', '깐마늘(국산)': '깐마늘',
    양파: '양파', 파: '대파', 생강: '생강', 미나리: '미나리', 깻잎: '깻잎', 피망: '피망', 파프리카: '파프리카',
    멜론: '멜론', 방울토마토: '방울토마토', 고춧가루: '고춧가루', 알배기배추: '알배기배추', 브로콜리: '브로콜리',
    사과: '사과', 배: '배 신고배', 복숭아: '복숭아', 포도: '포도 샤인머스캣', 바나나: '바나나', 레몬: '레몬',
    체리: '체리', 참다래: '키위', 파인애플: '파인애플', 망고: '망고', 감귤: '감귤', 오렌지: '오렌지', 아보카도: '아보카도',
    '소고기 안심': '소고기 안심', '소고기 등심': '한우 등심 구이용', '소고기 설도': '소고기 설도',
    '소고기 양지': '소고기 양지', '소고기 갈비': '한우 갈비',
    '돼지고기 앞다리': '돼지고기 앞다리살', '돼지고기 삼겹살': '삼겹살', '돼지고기 갈비': '돼지갈비', '돼지고기 목심': '돼지고기 목살',
    '수입 소고기 갈비': '수입 소갈비', '수입 소고기 갈비살': '수입 소갈비살', '수입 돼지고기 삼겹살': '수입 삼겹살',
    '닭고기 육계9호': '생닭 9호', '닭고기 육계10호': '생닭 10호', '닭고기 육계12호': '생닭 12호', '닭고기 육계(kg)': '닭고기 생닭',
    계란: '계란 10구', 우유: '우유 1L',
  };

  /** 상품명에 이 중 하나는 반드시 있어야 함 — 엉뚱한 상품(가공식품·굿즈) 배제 */
  /**
   * 품종별 검색어 — `itemCode-kindCode` 키. KEYWORDS(품목명)보다 우선한다.
   *
   * KAMIS는 한 품목을 품종으로 나눠 조사한다. 포도만 해도 츠벨얼리(1kg)·거봉(2kg)·
   * 샤인머스켓(2kg)이 각각 오고 단위도 다르다. 앱은 그중 '오늘 신호가 가장 좋은'
   * 품종 하나를 대표로 보여주므로 대표는 날마다 바뀜 수 있다.
   * 상품을 품목 단위로만 갖고 있으면 츠벨얼리 페이지에 샤인머스캣을 붙이는 오정보가 된다
   * (2026-08-18 실제 발생). 그래서 품종이 서로 다른 상품인 것은 따로 뽑는다.
   * 고기류는 이미 부위별로 KEYWORDS에 들어있어 여기 안 적는다.
   */
  const KIND_KEYWORDS = {
    '111-01': '쌀 20kg', '111-10': '쌀 10kg',
    '214-01': '적상추', '214-02': '청상추',
    '223-01': '가시오이', '223-02': '다다기오이', '223-03': '취청오이',
    '224-01': '애호박', '224-02': '쥐키니 호박',
    '241-00': '건고추', '241-01': '햇 건고추',
    '242-00': '풋고추', '242-02': '꾬리고추', '242-03': '청양고추', '242-04': '오이맛고추',
    '246-00': '대파', '246-02': '쪽파',
    '248-00': '국산 고춧가루', '248-01': '중국산 고춧가루',
    '411-05': '부사 사과', '411-06': '아오리 사과',
    '412-01': '신고배', '412-04': '원황배',
    '414-01': '츠벨얼리 포도', '414-02': '거봉 포도', '414-12': '샤인머스캣',
    '422-01': '방울토마토', '422-02': '대추방울토마토',
    '9903-21': '계란 10구', '9903-23': '계란 30구',
  };

  /** 품종별 필수 토큰 — 없으면 TOKENS(품목)을 쓴다. */
  const KIND_TOKENS = {
    '214-01': ['적상추'], '214-02': ['청상추'],
    '223-02': ['다다기'], '223-03': ['취청'],
    '224-02': ['쥐키니'],
    '242-02': ['꾬리'], '242-03': ['청양'], '242-04': ['오이맛', '오이고추'],
    '246-02': ['쪽파'],
    '411-06': ['아오리', '쓰가루'],
    '412-04': ['원황'],
    '414-02': ['거봉'], '414-12': ['샤인머스캣', '샤인 머스캣'],
    '422-02': ['대추방울', '대추 방울'],
    '9903-23': ['30구'],
    '111-10': ['쌀'],
  };

  /** 품종별 배제어 — 형제 품종이 서로를 잔아먹지 않게. */
  const KIND_EXCLUDE = {
    '214-01': ['청상추'], '214-02': ['적상추'],
    '223-01': ['다다기', '취청'],
    '224-01': ['쥐키니'],
    '242-00': ['꾬리', '청양', '오이맛'],
    '246-00': ['쪽파'],
    '411-05': ['아오리', '쓰가루'],
    '412-01': ['원황'],
    '414-01': ['샤인', '거봉'],
    '422-01': ['대추방울', '대추 방울'],
    '9903-21': ['30구'],
  };

  const TOKENS = {
    쌀: ['쌀'], 찹쌀: ['찹쌀'], 콩: ['백태', '메주콩', '흰콩', '콩'], 팥: ['팥'], 녹두: ['녹두'],
    고구마: ['고구마'], 감자: ['감자'], 배추: ['배추'], 양배추: ['양배추'], 시금치: ['시금치'],
    상추: ['상추'], 얼갈이배추: ['얼갈이'], 수박: ['수박'], 참외: ['참외'], 오이: ['오이'], 호박: ['호박'],
    토마토: ['토마토'], 무: ['무 ', '무,', '무우', '조선무', '알타리', '총각무', '다발무'],
    당근: ['당근'], 열무: ['열무'], 건고추: ['건고추', '태양초', '마른고추'],
    풋고추: ['풋고추', '청양고추', '오이맛', '고추'], 붉은고추: ['홍고추', '붉은고추'], '깐마늘(국산)': ['마늘'],
    양파: ['양파'], 파: ['대파', '쪽파'], 생강: ['생강'], 미나리: ['미나리'], 깻잎: ['깻잎'],
    피망: ['피망'], 파프리카: ['파프리카'], 멜론: ['멜론'], 방울토마토: ['방울토마토', '대추방울', '스테비아'],
    고춧가루: ['고춧가루', '고추가루'], 알배기배추: ['알배기', '알배추', '쌈배추'], 브로콜리: ['브로콜리'],
    사과: ['사과'], 배: ['배 ', '신고배', '원황', '배,', '나주배'], 복숭아: ['복숭아'],
    포도: ['포도', '샤인머스캣', '거봉'], 바나나: ['바나나'], 레몬: ['레몬'], 체리: ['체리'],
    참다래: ['키위', '참다래'], 파인애플: ['파인애플'], 망고: ['망고'],
    감귤: ['감귤', '귤', '한라봉', '천혜향'], 오렌지: ['오렌지'], 아보카도: ['아보카도'],
    '소고기 안심': ['안심'], '소고기 등심': ['등심'], '소고기 설도': ['설도', '우둔', '홍두깨'],
    '소고기 양지': ['양지'], '소고기 갈비': ['갈비'],
    '돼지고기 앞다리': ['앞다리'], '돼지고기 삼겹살': ['삼겹'], '돼지고기 갈비': ['갈비'], '돼지고기 목심': ['목살', '목심'],
    '수입 소고기 갈비': ['갈비'], '수입 소고기 갈비살': ['갈비살', '갈비'], '수입 돼지고기 삼겹살': ['삼겹'],
    '닭고기 육계9호': ['닭', '생닭', '통닭'], '닭고기 육계10호': ['닭', '생닭', '통닭'],
    '닭고기 육계12호': ['닭', '생닭', '통닭'], '닭고기 육계(kg)': ['닭'],
    계란: ['계란', '달걀'], 우유: ['우유'],
  };

  /** 상품명에 이게 있으면 탈락 — 품목끼리 잡아먹는 것 방지(배추↔양배추·알배기, 무↔배추 등) */
  const EXCLUDE = {
    배추: ['양배추', '알배기', '알배추', '쌈배추', '쌈용', '얼갈이', '김치'],
    무: ['배추', '무말랭이', '무순', '메밀', '무염'],
    파: ['파프리카', '파인애플', '파슬리'],
    콩: ['콩나물', '두부', '콩기름', '땅콩'],
  };

  /** KAMIS 조사 기준의 원산지 — 국산 품목에 수입육이, 수입 품목에 한우가 붙는 것을 막는다 */
  const DOMESTIC_CODES = ['4301', '4304', '9901', '9903', '9908'];
  const IMPORTED_CODES = ['4401', '4402'];
  const DOMESTIC_WORDS = ['한우', '한돈', '국내산', '국산', '횡성', '토종'];
  const IMPORTED_WORDS = ['호주산', '미국산', '캐나다산', '뉴질랜드', '수입', '스페인산', '칠레산', '멕시코산'];

  const NAME_FIX = { 소: '소고기', 돼지: '돼지고기', 닭: '닭고기' };
  const MEAT_CODES = new Set(['4301', '4304', '4401', '4402', '9901']);

  // ── 유틸 ────────────────────────────────────────────────────────────────
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const fmtDate = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const parsePrice = (v) => {
    if (typeof v !== 'string' || v === '-' || v === '' || v === '0') return null;
    const n = Number(v.replace(/,/g, ''));
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  /** 파트너스 응답의 배송 유형 → shopping.ts의 status(공식 로고 분기) */
  function statusOf(deliveryChargeType, badges) {
    const d = [...(deliveryChargeType || []), ...(badges || [])];
    if (d.includes('ROCKET_FRESH')) return 'rocket_fresh';
    if (d.includes('ROCKET_MERCHANT') || d.includes('SELLER_ROCKET')) return 'seller_rocket';
    if (d.includes('ROCKET')) return 'rocket';
    return undefined;
  }

  /**
   * 분당 상한을 지키는 호출기. 60초 슬라이딩 윈도로 세고, 한도에 닿으면 창이 빌 때까지 잔다.
   * 파트너스 한도 초과는 3회 누적 시 계정 제한이라, 넉넉히 늦추는 쪽이 항상 옳다.
   */
  function createLimiter(rpm) {
    const stamps = [];
    const minGap = Math.ceil(60000 / rpm);
    let last = 0;
    return async function throttle() {
      const now = Date.now();
      const gap = now - last;
      if (gap < minGap) await sleep(minGap - gap);
      while (true) {
        const t = Date.now();
        while (stamps.length && t - stamps[0] > 60000) stamps.shift();
        if (stamps.length < rpm) break;
        await sleep(60000 - (t - stamps[0]) + 250);
      }
      last = Date.now();
      stamps.push(last);
    };
  }

  /** 파트너스가 분당 한도 초과를 알릴 때 던지는 전용 에러 — 잡으면 전체를 즉시 접는다. */
  class RateLimitError extends Error {
    constructor(message) {
      super(message);
      this.name = 'RateLimitError';
    }
  }

  // ── 1) KAMIS 품목 목록 ──────────────────────────────────────────────────
  async function fetchCategory(categoryCode, regday) {
    const url =
      `${KAMIS_BASE}?p_returntype=json&action=dailyPriceByCategoryList&p_product_cls_code=01` +
      `&p_country_code=1101&p_regday=${regday}&p_convert_kg_yn=N&p_item_category_code=${categoryCode}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`KAMIS HTTP ${res.status}`);
    const json = await res.json();
    const rows = json?.data?.item ?? [];
    if (!Array.isArray(rows)) return [];
    return rows
      .filter((r) => r.item_name && r.item_code)
      .map((r) => {
        // 앱 kamis.ts와 동일한 '일별가 사다리' — 매일 조사하지 않는 품목의 가격이 증발하지 않게.
        const ladder = [r.dpr1, r.dpr2, r.dpr3, r.dpr4].map(parsePrice);
        const today = ladder.find((v) => v != null) ?? null;
        const base = NAME_FIX[String(r.item_name)] ?? String(r.item_name);
        const kindName = String(r.kind_name ?? '');
        const itemCode = String(r.item_code);
        return {
          itemCode,
          kindCode: String(r.kind_code ?? '00'),
          itemName: MEAT_CODES.has(itemCode) && kindName ? `${base} ${kindName}` : base,
          unit: String(r.unit ?? ''),
          today,
        };
      });
  }

  /** 앱 fetchAllCategories와 같은 규칙 — '충분히 채워진 영업일'을 만날 때까지 거슬러 간다. */
  async function fetchCatalog(log) {
    const load = async (regday) => {
      const rs = await Promise.allSettled(CATEGORIES.map((c) => fetchCategory(c, regday)));
      return rs.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
    };
    const filled = (arr) => arr.filter((i) => i.today != null).length;
    let items = await load(fmtDate(new Date()));
    for (let back = 1; back <= 7 && filled(items) < 30; back++) {
      const d = new Date();
      d.setDate(d.getDate() - back);
      const next = await load(fmtDate(d));
      if (filled(next) > filled(items)) items = next;
    }
    // 품목·품종 1행 → 표시명 1행 (앱과 동일한 2단 중복 제거)
    const seenKey = new Set();
    const seenName = new Set();
    const out = [];
    for (const it of items) {
      const k = `${it.itemCode}-${it.kindCode}`;
      // 품종별 검색어가 정의된 품종은 전부 남긴다. 예전엔 품목명당 1개만 남겨,
      // 대표 품종이 바뀜 날 그 페이지의 상품이 통째로 사라졌다(2026-08-18).
      if (seenKey.has(k)) continue;
      if (!KIND_KEYWORDS[k] && seenName.has(it.itemName)) continue;
      seenKey.add(k);
      seenName.add(it.itemName);
      out.push(it);
    }
    log(`KAMIS 품목 ${out.length}개 (가격 있는 행 ${filled(items)})`);
    return out;
  }

  // ── 2) 상품 선정 ────────────────────────────────────────────────────────
  function scoreProduct(p, item) {
    if (p.type !== 'PRODUCT' || p.isSoldOut || p.travel) return -1;
    const title = p.title || '';
    const kindKey = `${item.itemCode}-${item.kindCode}`;
    const tokens = KIND_TOKENS[kindKey] || TOKENS[item.itemName] || [item.itemName];
    if (!tokens.some((t) => title.includes(t.trim()))) return -1;
    for (const bad of [...(EXCLUDE[item.itemName] || []), ...(KIND_EXCLUDE[kindKey] || [])])
      if (title.includes(bad)) return -1;

    let s = 0;
    const dct = p.deliveryChargeType || [];
    if (dct.includes('ROCKET_FRESH')) s += 60;
    else if (dct.includes('ROCKET')) s += 45;
    if (p.retail) s += 25; // 쿠팡 직매입(곰곰 등) — 품절·가격이 안정적
    s += Math.min(30, Math.log10((p.ratingCount || 0) + 1) * 8);
    if ((p.ratingAverage || 0) >= 4.5) s += 6;

    const price = p.salesPrice || 0;
    if (price < 1000) s -= 10; // 액세서리·낱개 미끼상품
    if (price > 60000) s -= 25;
    else if (price > 35000) s -= 10;

    if (DOMESTIC_CODES.includes(item.itemCode)) {
      if (DOMESTIC_WORDS.some((w) => title.includes(w))) s += 40;
      if (IMPORTED_WORDS.some((w) => title.includes(w))) s -= 45;
    }
    if (IMPORTED_CODES.includes(item.itemCode)) {
      if (IMPORTED_WORDS.some((w) => title.includes(w))) s += 40;
      if (DOMESTIC_WORDS.some((w) => title.includes(w))) s -= 45;
    }
    return s;
  }

  function pickTop(products, item) {
    const ranked = products
      .map((p) => ({ p, s: scoreProduct(p, item) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s);
    const seenProduct = new Set();
    const seenTitle = new Set();
    const seenPrice = new Set();
    const out = [];
    for (const { p } of ranked) {
      const norm = (p.title || '').replace(/[\s,]/g, '').slice(0, 25);
      // 같은 상품·같은 이름·같은 가격(브랜드만 다른 동일 상품)은 한 자리만 차지하게
      if (seenProduct.has(p.productId) || seenTitle.has(norm) || seenPrice.has(p.salesPrice)) continue;
      seenProduct.add(p.productId);
      seenTitle.add(norm);
      seenPrice.add(p.salesPrice);
      out.push(p);
      if (out.length === PICK_N) break;
    }
    return out;
  }

  // ── 3) 메인 파이프라인 ──────────────────────────────────────────────────
  /**
   * @param {(path: string, body: object) => Promise<any>} partnersPost 파트너스 API 호출기(세션 보유 측이 주입)
   * @param {Record<string, Array>} prev 기존 coupang-products.json — 딥링크 재사용 원본
   * @param {(msg: string) => void} log
   * @param {number} rpm 분당 호출 상한
   * @param {string[]|null} only 특정 itemCode만 (테스트용)
   */
  async function build({ partnersPost, prev = {}, log = console.log, rpm = DEFAULT_RPM, only = null } = {}) {
    const throttle = createLimiter(rpm);
    const call = async (path, body) => {
      await throttle();
      const json = await partnersPost(path, body);
      if (json && String(json.rCode) === '429') throw new RateLimitError(json.rMessage || '분당 한도 초과');
      if (json && json.rCode && String(json.rCode) !== '0') throw new Error(`${path} rCode=${json.rCode} ${json.rMessage || ''}`);
      return json;
    };

    // 기존 링크를 vendorItemId로 색인 — 품목이 바뀌어도 같은 상품이면 링크를 물려받는다.
    const linkByVendorItem = new Map();
    for (const list of Object.values(prev)) {
      for (const p of list || []) {
        if (p && p.vendorItemId != null && p.url) linkByVendorItem.set(String(p.vendorItemId), p.url);
      }
    }
    log(`기존 딥링크 ${linkByVendorItem.size}개 색인`);

    let catalog = await fetchCatalog(log);
    if (only && only.length) catalog = catalog.filter((i) => only.includes(i.itemCode));

    const data = {};
    const stats = { items: 0, products: 0, reused: 0, created: 0, searchCalls: 0, linkCalls: 0, skipped: [], aborted: null };

    for (const item of catalog) {
      const key = `${item.itemCode}-${item.kindCode}`;
      const keyword = KIND_KEYWORDS[key] || KEYWORDS[item.itemName];
      if (!keyword) {
        // KAMIS가 새 품목을 추가하면 여기로 떨어진다. 조용히 빠뜨리지 말고 남긴다.
        stats.skipped.push(`${key} ${item.itemName} (검색어 미정의)`);
        continue;
      }
      try {
        const res = await call('/api/v1/search', {
          page: { pageNumber: 0, size: SEARCH_SIZE },
          filter: keyword,
          deliveryTypes: [],
        });
        stats.searchCalls++;
        const picks = pickTop(res?.data?.products || [], item);
        if (!picks.length) {
          stats.skipped.push(`${key} ${item.itemName} (후보 0개)`);
          continue;
        }

        const list = [];
        for (const p of picks) {
          const vid = String(p.vendorItemId);
          let url = linkByVendorItem.get(vid);
          if (url) {
            stats.reused++;
          } else {
            const gen = await call('/api/v1/banner/iframe/url', {
              product: {
                type: 'PRODUCT',
                itemId: p.itemId,
                productId: p.productId,
                vendorItemId: p.vendorItemId,
                image: p.image,
                title: p.title,
                discountRate: p.discountRate || 0,
                originPrice: p.originPrice,
                salesPrice: p.salesPrice,
                travel: 'false',
              },
            });
            stats.linkCalls++;
            url = gen?.data?.shortUrl;
            if (!url) {
              stats.skipped.push(`${key} ${p.title} (링크 생성 실패)`);
              continue;
            }
            linkByVendorItem.set(vid, url);
            stats.created++;
          }
          list.push({
            name: p.title,
            price: p.salesPrice,
            imageUrl: p.image,
            url,
            status: statusOf(p.deliveryChargeType, p.badges),
            vendorItemId: p.vendorItemId,
            productId: p.productId,
          });
        }
        if (list.length) {
          data[key] = list;
          stats.items++;
          stats.products += list.length;
        }
      } catch (e) {
        if (e instanceof RateLimitError) {
          // 3회째 초과 = 계정 제한. 남은 품목을 버리더라도 여기서 확실히 멈춘다.
          stats.aborted = `분당 한도 초과로 중단 — ${e.message}`;
          log(`!! ${stats.aborted}`);
          break;
        }
        stats.skipped.push(`${key} ${item.itemName} (${e.message})`);
      }
    }

    // 중단됐어도 이전 데이터를 지우지 않는다 — 못 돈 품목은 어제 값을 그대로 유지.
    if (stats.aborted) {
      for (const [k, v] of Object.entries(prev)) if (!data[k]) data[k] = v;
    }

    log(
      `품목 ${stats.items} / 상품 ${stats.products} / 링크 재사용 ${stats.reused} · 신규 ${stats.created} ` +
        `/ API 호출 검색 ${stats.searchCalls} + 링크 ${stats.linkCalls}`,
    );
    if (stats.skipped.length) log(`건너뜀 ${stats.skipped.length}건: ${stats.skipped.join(' | ')}`);
    return { data, stats };
  }

  // 키 순서를 안정적으로 — 커밋 diff가 '실제 변경'만 보이게 한다.
  function serialize(data) {
    const keys = Object.keys(data).sort((a, b) => {
      const [ac, ak] = a.split('-');
      const [bc, bk] = b.split('-');
      return ac === bc ? ak.localeCompare(bk) : Number(ac) - Number(bc);
    });
    const ordered = {};
    for (const k of keys) ordered[k] = data[k];
    return JSON.stringify(ordered, null, 2) + '\n';
  }

  globalThis.IGB_COUPANG = { build, fetchCatalog, serialize, KEYWORDS, RateLimitError, DEFAULT_RPM };

  // ── Node CLI ────────────────────────────────────────────────────────────
  const isNodeCli =
    typeof process !== 'undefined' &&
    Array.isArray(process.argv) &&
    /refresh-coupang-products\.mjs$/.test(process.argv[1] || '');

  if (isNodeCli) {
    (async () => {
      const fs = await import('node:fs/promises');
      const pathMod = await import('node:path');
      // import.meta.url을 쓰지 않는다 — 이 파일은 Aside REPL에서 eval로도 로드되는데,
      // import.meta가 소스에 있으면 모듈 밖이라 파싱 단계에서 터진다(README-coupang.md 참고).
      const here = pathMod.dirname(pathMod.resolve(process.argv[1]));
      const outPath = pathMod.join(here, '..', 'src', 'coupang-products.json');

      const arg = (name) => (process.argv.find((a) => a.startsWith(`--${name}=`)) || '').split('=')[1];
      const dryRun = process.argv.includes('--dry-run');
      const rpm = Number(arg('rpm')) || DEFAULT_RPM;
      const only = arg('only') ? arg('only').split(',').map((s) => s.trim()) : null;

      const cookie = process.env.COUPANG_PARTNERS_COOKIE;
      if (!cookie) {
        console.error(
          'COUPANG_PARTNERS_COOKIE 가 없습니다.\n' +
            '로그인한 크롬에서 partners.coupang.com 요청의 Cookie 헤더를 통째로 복사해 넣으세요.\n' +
            "예) COUPANG_PARTNERS_COOKIE='PCID=...; sid=...' node scripts/refresh-coupang-products.mjs",
        );
        process.exit(1);
      }

      const partnersPost = async (path, body) => {
        const res = await fetch(`https://partners.coupang.com${path}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: cookie,
            Origin: 'https://partners.coupang.com',
            Referer: 'https://partners.coupang.com/',
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
          },
          body: JSON.stringify(body),
        });
        return res.json();
      };

      let prev = {};
      try {
        prev = JSON.parse(await fs.readFile(outPath, 'utf8'));
      } catch {
        console.log('기존 coupang-products.json 없음 — 전부 새로 생성합니다.');
      }

      const { data, stats } = await build({ partnersPost, prev, rpm, only });
      if (dryRun) {
        console.log('--dry-run: 파일을 쓰지 않았습니다.');
      } else {
        await fs.writeFile(outPath, serialize(data), 'utf8');
        console.log(`기록 완료 → ${outPath}`);
      }
      // 한도 초과로 중단된 회차는 실패로 알린다(스케줄러가 조용히 넘어가지 않도록).
      if (stats.aborted) process.exit(2);
    })().catch((e) => {
      console.error(e);
      process.exit(1);
    });
  }
})();
