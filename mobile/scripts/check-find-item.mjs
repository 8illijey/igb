/**
 * 레시피 재료명 → KAMIS 품목 매칭 자체검증. 프레임워크 없음 —
 * `node --experimental-strip-types scripts/check-find-item.mjs`
 * 2026-09-10: '대파: 파' 별칭 + includes 폴백이 대파를 양파(245-00)로 풀던 버그의 회귀 방지.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';

// 앱 소스는 확장자 없는 상대 임포트(Metro 규칙)고 JSON도 속성 없이 임포트한다 — 테스트에서만 메워준다.
registerHooks({
  resolve(spec, ctx, next) {
    if (spec.startsWith('.') && !/\.[mc]?[jt]s$|\.json$/.test(spec)) {
      for (const ext of ['.ts', '.tsx']) {
        try { return next(spec + ext, ctx); } catch { /* 다음 확장자 */ }
      }
    }
    return next(spec, ctx);
  },
  load(url, ctx, next) {
    if (url.endsWith('.json')) return { format: 'json', shortCircuit: true, source: readFileSync(new URL(url)) };
    // 이미지 테이블은 Metro 전용 require('../assets/*.jpg')라 Node가 못 돈다 — findItem엔 필요 없으니 빈 표로.
    if (url.endsWith('/recipeImages.gen.ts'))
      return { format: 'module', shortCircuit: true, source: 'export const RECIPE_IMAGES = {};' };
    return next(url, ctx);
  },
});

const { findItem } = await import('../src/recipes.ts');
const { PRICE_SNAPSHOT: items } = await import('../src/snapshot.gen.ts');

const key = (name, raw) => { const i = findItem(items, name, raw); return i ? `${i.itemCode}-${i.kindCode} ${i.itemName}` : '없음'; };
const nameOf = (name, raw) => findItem(items, name, raw)?.itemName ?? '없음';

// 2026-10-16: 레시피 고기는 원문 부위로 고른다. 원문이 없으면 설도 1+(가장 비싼 안심 1++가 아니다).
assert.equal(nameOf('소고기'), '한우 설도 1+등급');
assert.equal(nameOf('소고기', '쇠고기등심'), '한우 등심 1+등급');
assert.equal(nameOf('소고기', '소고기(살치살'), '한우 등심 1+등급');
assert.equal(nameOf('소고기', '소고기 우둔살'), '한우 설도 1+등급');
assert.equal(nameOf('소고기', '떡갈비 : 다진소고기'), '한우 설도 1+등급'); // '갈비'에 먼저 걸리지 않는다
assert.equal(nameOf('소고기', '양지머리'), '한우 양지 1+등급');
// 원문이 그냥 '소고기'면 요리 이름으로 — 스테이크는 등심(2026-10-16 새우와스테이크). 원문 부위가 먼저다.
assert.equal(findItem(items, '소고기', '소고기', '새우와스테이크')?.itemName, '한우 등심 1+등급');
assert.equal(findItem(items, '소고기', '소고기우둔살', '토마토소고기찜')?.itemName, '한우 설도 1+등급');
assert.equal(findItem(items, '소고기', '다진소고기', '떡갈비주먹밥')?.itemName, '한우 설도 1+등급');
assert.equal(nameOf('돼지고기', '돼지고기 삼겹살'), '돼지고기 삼겹살');
assert.equal(nameOf('돼지고기', '다진 돼지고기'), '돼지고기 앞다리');

// 핵심 회귀: 대파는 대파다. 양파가 아니다.
assert.equal(key('대파'), '246-00 대파');
assert.equal(key('양파'), '245-00 양파');
// 별칭 경로가 여전히 동작한다
assert.match(key('마늘'), /^258-\d+ 깐마늘/);
assert.match(key('다진 마늘'), /^258-\d+ 깐마늘/);
assert.equal(key('애호박'), '224-01 애호박');
// includes 폴백은 정확 일치가 없을 때만 — '파프리카'가 '파'류로 새지 않는다
assert.equal(key('파프리카'), '256-00 파프리카');
// 없는 재료는 없다고 한다(엉뚱한 품목을 집지 않는다)
assert.equal(key('간장'), '없음');

console.log('OK — findItem 매칭 검증 통과');
