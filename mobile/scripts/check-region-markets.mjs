/**
 * 지역별 판매처 집계 자체검증. 프레임워크 없음 — `node scripts/check-region-markets.mjs`.
 * 네트워크는 스텁한다(원본/미러 폴백 때문에 실응답이 비결정적이라 테스트로 못 쓴다).
 */
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

// 앱 소스는 확장자 없는 상대 임포트(Metro 규칙)라 Node ESM이 못 찾는다 — 테스트에서만 .ts를 붙여준다.
registerHooks({
  resolve(spec, ctx, next) {
    if (spec.startsWith('.') && !/\.[mc]?[jt]s$/.test(spec)) {
      try { return next(spec + '.ts', ctx); } catch { /* 원래 이름으로 재시도 */ }
    }
    return next(spec, ctx);
  },
});

const { fetchMarketPrices } = await import('../src/api/kamis.ts');

const row = (countyname, marketname, price, regday = '09/08') => ({
  itemname: [], kindname: [], countyname, marketname, yyyy: '2026', regday, price,
});

const FIXTURE = [
  row('평균', [], '6,155'),            // 집계 의사행 — 판매처 아님
  row('평년', [], '6,404'),            // 집계 의사행
  row('서울', [], '9,999'),            // marketname이 빈 배열 — 이름 없는 행
  row('서울', '경동', '6,300', '09/07'), // 같은 판매처의 이전 조사일
  row('서울', '경동', '6,400', '09/08'), // → 최신이 이겨야 한다
  row('서울', 'B-유통', '5,800'),
  row('부산', '부전', '5,000'),
  row('부산', 'D-유통', '5,600'),
  row('세종', 'C-유통', '5,980'),      // 표본 1곳
  row('춘천', '중앙', '6,800'),        // 12곳 목록 밖
];

globalThis.fetch = async () => ({ ok: true, json: async () => ({ data: { item: FIXTURE } }) });

const item = { categoryCode: '200', itemCode: '211', kindCode: '02', rankCode: '04' };
const { all, byRegion } = await fetchMarketPrices(item, '01');

// 전국 — 집계 의사행·이름 없는 행 제외, 판매처 6곳
assert.equal(all.count, 6, `전국 표본 6곳이어야 하는데 ${all.count}`);
assert.equal(all.avg, 5930, `전국 평균 5930이어야 하는데 ${all.avg}`); // (6400+5800+5000+5600+5980+6800)/6

// 같은 판매처는 최신 조사일만 — 경동 6,300(09/07)이 아니라 6,400(09/08)
assert.ok(!byRegion['서울'].markets.some((m) => m.price === 6300), '이전 조사일이 살아남았다');

// 지역 필터
assert.equal(byRegion['부산'].count, 2);
assert.equal(byRegion['부산'].avg, 5300);
assert.deepEqual(
  byRegion['부산'].markets,
  [{ market: '전통시장', price: 5000 }, { market: '대형마트·체인슈퍼', price: 5600 }],
  '부산 업태 집계가 다르다',
);

// 표본 1곳도 값은 나오되 count로 드러나야 한다(UI가 '참고용' 문구를 붙이는 근거)
assert.equal(byRegion['세종'].count, 1);

// 12곳 목록 밖 지역은 키가 없다
assert.ok(!('춘천' in byRegion), '목록 밖 지역이 들어왔다');

// 표본 0인 지역은 키를 만들지 않는다 — UI가 '데이터 없음'과 '0원'을 구분한다
assert.ok(!('대구' in byRegion), '표본 없는 지역에 키가 생겼다');

console.log('OK — 지역 집계 검증 통과');
