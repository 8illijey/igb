/**
 * portionPrice 자체 검증 — 프레임워크 없이 바로 돌아간다.
 *
 *   cd mobile && node src/portion.test.mjs
 *
 * 왜 테스트가 있나: 레시피 재료 금액은 KAMIS 조사 단위(1개·10구·1kg)와 레시피 분량(2g·1개·1큰술)을
 * 환산해 낸다. 2026-10-22 구운 주먹밥에서 무 2g이 2,205원(무 1개 값), 달걀 50g이 4,205원(10구 값)으로 나왔다.
 */
import assert from 'node:assert/strict';
import { portionPrice } from './portion.ts';

const item = (itemCode, unit, today) => ({ itemCode, unit, today });

// ① 개수로 조사되는 품목을 g으로 쓴 경우 — 1단위 평균중량으로 환산 (2026-10-22 실제 상황)
assert.equal(portionPrice(item('231', '1개', 2271), '2g'), 3); // 무 1개 1,500g → 2g ≈ 3원
assert.equal(portionPrice(item('9903', '10구', 4203), '50g'), 350); // 계란 1구 60g → 50g ≈ 350원

// ② 개수 ↔ 개수는 그대로 비례
assert.equal(portionPrice(item('9903', '10구', 4203), '2개'), 841);

// ③ 무게로 조사되는 품목 — g 비례, '개'는 평균중량
assert.equal(portionPrice(item('245', '1kg', 2216), '100g'), 222);
assert.equal(portionPrice(item('245', '1kg', 2216), '1개'), 443); // 양파 1개 200g

// ④ 평균중량을 모르는 품목은 환산하지 않는다(엉뚱한 값보다 단위 가격 표시가 낫다)
assert.equal(portionPrice(item('9999', '1개', 1000), '50g'), null);

console.log('portionPrice ok');
