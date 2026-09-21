/**
 * pickFresher 자체 검증 — 프레임워크 없이 바로 돌아간다.
 *
 *   cd mobile && node src/api/pickFresher.test.mjs
 *
 * 왜 테스트가 있나: 이 함수가 틀리면 화면에 **일주일 전 가격이 오늘 가격으로** 뜬다.
 * 2026-09-21 14시에 실제로 그랬는데, 재현 조건(주말 다음 평일 오전 + 아직 당일치 미게시)이
 * 하루 중 몇 시간뿐이라 브라우저로 확인하기 어렵다. 그래서 그날의 실제 날짜·값을 고정해 둔다.
 */
import assert from 'node:assert/strict';
import { pickFresher } from './pickFresher.ts';

const live = (date, today, normal = 100) => ({ surveyDate: date, today, normal, unit: '2kg' });

// ① 사다리가 주말을 건너뛴 경우 — verdicts가 더 최신이면 그쪽 (2026-09-21 14시 실제 상황)
{
  const r = pickFresher(live('2026-09-14', 13679), 'retail', { today: 12982, normal: 26338 }, '2026-09-18');
  assert.equal(r.today, 12982, '더 최신인 verdicts 값을 써야 한다');
  assert.equal(r.surveyDate, '2026-09-18');
  assert.equal(r.normal, 26338, 'today를 바꿨으면 기준값도 같은 회차 것이어야 한다');
  assert.equal(r.unit, '2kg', '나머지 필드는 보존되어야 한다');
}

// ② 라이브가 더 최신이면 손대지 않는다 — 평상시 대부분이 여기로 온다
{
  const raw = live('2026-09-21', 12653);
  assert.equal(pickFresher(raw, 'retail', { today: 12982, normal: 1 }, '2026-09-18'), raw);
}

// ③ 날짜가 같으면 라이브 유지 — 같은 날이면 라이브가 더 최근에 조회된 값이다
{
  const raw = live('2026-09-18', 12900);
  assert.equal(pickFresher(raw, 'retail', { today: 12982, normal: 1 }, '2026-09-18'), raw);
}

// ④ 도매엔 적용하지 않는다 — verdicts의 today는 소매가라 단위가 다르다
{
  const raw = live('2026-09-14', 13679);
  assert.equal(pickFresher(raw, 'wholesale', { today: 12982, normal: 1 }, '2026-09-18'), raw);
}

// ⑤ verdicts가 없거나(제철 끝난 품목) 아직 안 왔으면 라이브 그대로
{
  const raw = live('2026-09-07', 20878);
  assert.equal(pickFresher(raw, 'retail', undefined, '2026-09-21'), raw, 'verdicts에 없는 품목');
  assert.equal(pickFresher(raw, 'retail', { today: null, normal: null }, '2026-09-21'), raw, 'today 없음');
  assert.equal(pickFresher(raw, 'retail', { today: 1, normal: 1 }, null), raw, '조사일 미도착');
}

// ⑥ verdicts에 normal이 없으면 라이브 normal을 물려받는다
{
  const r = pickFresher(live('2026-09-14', 13679, 555), 'retail', { today: 12982, normal: null }, '2026-09-18');
  assert.equal(r.normal, 555);
}

console.log('pickFresher: 6개 경우 모두 통과');
