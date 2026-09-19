/**
 * 라이브 데이터 경로 진단 — "지금" 무엇이 어디서 오는지 한 번에 본다.
 *
 * 왜 있나 (2026-09-17 사고)
 *  build-baselines.mjs 헤더에 2026-08-18자로 "KAMIS가 데이터센터 IP를 차단 → 미러 사용 →
 *  미러엔 dpr7(평년)이 없어 워커가 우리 값을 주입 → 앱이 '평년'이라 부르는 값은 실은
 *  최근 1년 평균"이라고 적혀 있었다. 그 기록을 현재 상태로 읽고, 멀쩡한 공식값을
 *  우리 근사치로 갈아끼우는 변경을 제안하는 사고가 났다.
 *  실제로는 그 사이 KAMIS가 복구됐고 워커는 KAMIS를 1순위로 부른다 — 공식 일평년이 그대로 온다.
 *
 *  주석은 쓰인 시점의 사실이다. 외부 의존(KAMIS·미러·CDN)의 상태는 시간이 지나면 뒤집힌다.
 *  그래서 '읽고 믿는' 대신 '실행해서 보는' 수단을 둔다. 라이브 동작을 단정하기 전에 이걸 먼저 돌려라.
 *
 * 실행: cd mobile && npm run check-live
 * 네트워크만 쓰고 아무것도 고치지 않는다. 종료코드는 항상 0 — 판단은 사람이 한다.
 */
const WORKER = 'https://igeobissa-recipes.designerxyzi.workers.dev/kamis';
const SITE = 'https://igeobissa.com';
const CATEGORIES = ['100', '200', '400', '500'];
/** build-baselines.mjs와 같은 달력(윤일 무시) — 날짜 인덱스가 어긋나면 비교가 무의미하다. */
const CUM = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
const dayIndex = (d = new Date()) => Math.min(364, CUM[d.getMonth()] + (d.getDate() - 1));
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const getJson = async (url) => {
  const r = await fetch(url, { signal: AbortSignal.timeout(25000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
};

console.log(`\n=== 라이브 진단 ${new Date().toLocaleString('ko-KR')} ===\n`);

// ── 1) 평년(dpr7)이 KAMIS 원본인가, 워커가 주입한 값인가 ────────────────────
// 판별자: KAMIS 원본은 day1~day7 라벨과 dpr5(1개월전)·dpr6(1년전)을 준다.
// 워커의 미러 변환 경로는 dpr5·dpr6을 '-'로 비우고 day 라벨이 없다.
let sample = null;
let kamisOrigin = null;
for (const c of CATEGORIES) {
  try {
    const j = await getJson(
      `${WORKER}?p_returntype=json&action=dailyPriceByCategoryList&p_product_cls_code=01` +
        `&p_regday=${ymd(new Date())}&p_convert_kg_yn=N&p_item_category_code=${c}`,
    );
    const rows = j?.data?.item ?? [];
    if (!Array.isArray(rows) || rows.length === 0) {
      console.log(`  카테고리 ${c}: 행 0 — 응답은 왔으나 비었다`);
      continue;
    }
    const isOrigin = rows.some((r) => r.day7 === '일평년');
    kamisOrigin ??= isOrigin;
    const withNormal = rows.filter((r) => r.dpr7 && r.dpr7 !== '-').length;
    console.log(`  카테고리 ${c}: 행 ${rows.length} | 평년 있음 ${withNormal} | ${isOrigin ? 'KAMIS 원본' : '워커 주입(미러 변환)'}`);
    sample ??= rows.find((r) => r.dpr7 && r.dpr7 !== '-');
  } catch (e) {
    console.log(`  카테고리 ${c}: 실패 (${e.message})`);
  }
}
console.log(
  kamisOrigin == null
    ? '\n  → 판정 불가 — 워커 응답을 못 받았다.'
    : kamisOrigin
      ? '\n  → 평년(dpr7)은 KAMIS 공식값이다. baselines.json으로 바꾸면 공식값을 근사치로 낮추는 것이다.'
      : '\n  → KAMIS가 응답하지 않아 워커가 미러 변환 + 평년 주입으로 돌고 있다. 평년 정확도가 떨어진 상태다.',
);

// ── 2) 공식 평년과 우리 근사치(baselines)의 차이 ────────────────────────────
// baselines는 '월별 계절 패턴'의 유일한 출처라 계속 필요하지만, 절대 금액의 기준은 아니다.
// 둘이 몇 % 벌어져 있는지를 보여, 한 화면에 두 숫자를 같이 쓰면 안 된다는 걸 눈으로 확인시킨다.
try {
  const bl = (await getJson(`${SITE}/baselines.json`)) ?? {};
  const items = bl.items ?? {};
  console.log(`\n=== baselines(우리 근사치) ===`);
  console.log(`  생성: ${bl.generatedAt ?? '알 수 없음'} | 품목 ${Object.keys(items).length}`);
  if (sample) {
    const key = `${sample.item_code}-${sample.kind_code}`;
    const ours = items[key]?.days?.[dayIndex()];
    const official = Number(String(sample.dpr7).replace(/,/g, ''));
    if (ours && official) {
      const diff = (((official - ours) / ours) * 100).toFixed(1);
      console.log(`  대조(${sample.item_name} ${key}): 공식 ${official.toLocaleString('ko-KR')}원 vs 우리 ${ours.toLocaleString('ko-KR')}원 (${diff > 0 ? '+' : ''}${diff}%)`);
      console.log('  → 두 값은 같지 않다. 화면에서 둘을 나란히 쓰면 같은 개념에 다른 숫자가 보인다.');
    }
  }
} catch (e) {
  console.log(`\n  baselines.json 실패 (${e.message})`);
}

// ── 3) verdicts 신선도 ──────────────────────────────────────────────────────
try {
  const v = await getJson(`${SITE}/verdicts.json?t=${Date.now()}`);
  const gen = v.generatedAt ? new Date(v.generatedAt) : null;
  const hours = gen ? ((Date.now() - gen.getTime()) / 3600e3).toFixed(1) : '?';
  console.log(`\n=== verdicts(라이브) ===`);
  console.log(`  조사일 ${v.date ?? '?'} | 생성 ${v.generatedAt ?? '?'} (${hours}시간 전)`);
  if (hours !== '?' && Number(hours) > 30) console.log('  → 30시간 넘게 갱신이 없다. verdicts CI를 확인하라.');
} catch (e) {
  console.log(`\n  verdicts.json 실패 (${e.message})`);
}

// ── 4) 저장소 신선도 ────────────────────────────────────────────────────────
// 왜 여기 있나: 2026-09-17에 `git log HEAD..origin/main`으로 "2커밋 뒤처짐"이라 보고했다가
// 실제로는 9커밋이었던 일이 있다. origin/main 참조가 로컬 캐시라 fetch 전엔 낡아 있었다.
// '라이브 데이터가 최신인가'와 '내 체크아웃이 최신인가'는 같은 종류의 질문이라 한자리에서 본다.
try {
  // 셸을 거치지 않는 execFileSync + 인자 배열 — 인자가 전부 상수라도 셸 경유를 만들지 않는다.
  const { execFileSync } = await import('node:child_process');
  const repo = new URL('../..', import.meta.url).pathname;
  const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim();
  git('fetch', 'origin', '--quiet'); // 이걸 안 하면 아래 숫자가 거짓말이 된다
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
  const [behind, ahead] = git('rev-list', '--left-right', '--count', 'HEAD...origin/main').split(/\s+/).map(Number);
  const dirty = git('status', '--porcelain').split('\n').filter(Boolean).length;
  console.log(`\n=== 저장소 ===`);
  console.log(`  브랜치 ${branch} | origin/main 대비 앞선 커밋 ${behind}, 밀린 커밋 ${ahead} | 미커밋 변경 ${dirty}개`);
  if (ahead > 0) console.log(`  → 내 체크아웃이 ${ahead}커밋 낡았다. 파일 내용을 '현재'로 단정하기 전에 git pull을 고려하라.`);
} catch (e) {
  console.log(`\n  저장소 확인 실패 (${e.message.split('\n')[0]})`);
}

console.log('\n주석·문서가 아니라 위 출력이 현재 사실이다.\n');
