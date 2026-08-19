# 쿠팡 파트너스 상품 일일 갱신

`scripts/refresh-coupang-products.mjs` → `src/coupang-products.json`

상세페이지 "지금 쿠팡에서 사기" 카드 3개의 원본 데이터. 매일 16:20 KST에 Aside 루틴이 돌린다.

---

## 반드시 지킬 것 — 분당 호출 한도

파트너스 웹 API는 **분당 50회** 제한이고, **3회 초과하면 계정 이용이 제한**된다.

> 2026-08-17 최초 201개 일괄 생성 중 2회 초과 → 24시간 차단(다음날 16:13까지)을 실제로 맞았다.
> 남은 한도는 **1회**뿐이라고 생각하고 다뤄야 한다.

그래서:

- 스크립트는 기본 **RPM 35**로 스스로를 늦춘다. 이 값을 올리지 말 것.
- 응답에 `rCode: 429`가 보이면 **남은 품목을 버리고 즉시 중단**한다. 재시도하지 않는다.
- 중단된 회차는 기존 JSON을 덮어쓰지 않고 어제 값을 그대로 유지한 뒤 exit code 2로 끝난다.
- 손으로 디버깅할 땐 `--only=245 --dry-run`으로 한두 품목만 건드릴 것.

## 딥링크 재사용

딥링크는 상품(`vendorItemId`)에 1:1로 붙는 영구 URL이다. 같은 상품에 "링크 생성"을 또 해도
목적지가 똑같은 링크가 하나 더 생길 뿐, 실적 집계도 동일하다.

그래서 매일:

1. 품목별로 상품 3개를 **다시 고르고**,
2. 어제와 같은 상품이면 **기존 URL을 물려받고 가격만 갱신**,
3. 새로 들어온 상품에 대해서만 링크를 생성한다.

보통 201개 중 신규 생성은 한 자릿수다. 이게 위 한도를 지키는 유일한 방법이다.
그래서 JSON의 `vendorItemId` 필드는 지우면 안 된다 — 재사용 매칭 키다.

## 데이터 키

키는 `itemCode-kindCode` (예: `4301-21` 소고기 안심). itemCode만으로 묶으면
소고기 안심/등심/설도/양지/갈비가 전부 같은 상품을 보게 된다.
`shopping.ts`의 `coupangProducts()`는 전체 키 → 품목 대표(`4301`) 순으로 찾는다.

### 유기농 네임스페이스 `eco:`

상세의 **유기농·무농약 탭 전용** 상품은 `eco:itemCode-kindCode`에 따로 들어있다.

이게 있어야 하는 이유: 예전엔 유기농 탭이 일반 상품을 그대로 공유해서,
대추방울토마토 **유기농 시세 12,150원/kg** 바로 아래에 **일반 5,550원** 상품이 붙어
다른 물건 가격으로 읽혔다(2026-08-20 수정).

- 검색어 = `유기농 {일반 검색어}`
- 제목에 `유기농·유기재배·무농약·친환경` 중 하나가 없으면 탈락 (`ECO_TOKENS`)
- `GAP`·`무항생제`는 친환경 인증이 아니라 배제 (`ECO_EXCLUDE`)
- KAMIS에 유기농 시세가 있는 품목(`ECO_KEYS`, 2026-08-20 기준 82개 중 29개)에만 돌려
  헛호출을 안 만든다
- 후보가 0개면 키를 안 만들고, 앱은 쓼핑 섹션을 아예 감춘다.
  없는 걸 일반 상품으로 메꾸지 않는다 — 그게 원래 문제였다.

유기농 품목이 늘면 `ECO_KEYS`에 키를 추가한다.
어느 품목에 유기농 시세가 있는지는 KAMIS `periodEcoPriceList`로 확인한다
(rank `07`=유기농, `08`=무농약).

---

## 실행 방법

### A. Aside 루틴 (매일 자동)

파트너스 API는 로그인 세션이 필요한데, 크롬 프로필에 세션이 있으므로 Aside REPL의
`fetch`(사용자 쿠키 동봉)를 그대로 쓴다. 별도 쿠키 추출이 필요 없다.

```js
const REPO = '/Users/yeji/Documents/projects/igeobissa/mobile';
const OUT = REPO + '/src/coupang-products.json';

// 1) 스크립트 로드 (top-level import/export가 없어 eval 가능하게 작성돼 있음)
eval(await fs.readFile(REPO + '/scripts/refresh-coupang-products.mjs', 'utf8'));
const { build, serialize } = globalThis.IGB_COUPANG;

// 2) 파트너스 호출기 — REPL fetch가 로그인 쿠키를 들고 간다
const partnersPost = async (path, body) => {
  const res = await fetch('https://partners.coupang.com' + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
};

// 3) 실행
const prev = JSON.parse(await fs.readFile(OUT, 'utf8'));
const { data, stats } = await build({ partnersPost, prev, log: console.log });

// 4) 기록 (중단됐어도 data는 어제 값으로 채워져 있어 안전)
await fs.writeFile(OUT, serialize(data));
console.log(JSON.stringify(stats, null, 1));
```

그 다음 이 파일 하나만 커밋 + 푸시한다. 작업 중인 다른 변경사항은 절대 같이 담지 않는다:

```bash
cd /Users/yeji/Documents/projects/igeobissa
git pull --ff-only          # verdicts CI가 매일 16:05에 푸시한다. 안 하면 push가 거절된다.
git add mobile/src/coupang-products.json
git commit -m "chore: 쿠팡 상품·가격 갱신 $(date +%F)" || echo "변동 없음"
git push
```

Vercel 프로젝트(mobile)는 `8illijey/igb`에 연결돼 있고 rootDirectory가 `mobile`이라,
main에 push하면 프로덕션 배포가 자동으로 걸린다. 배포를 따로 트리거하지 않는다.
2~4분 뒤 https://igeobissa.vercel.app 이 200인지, 번들에 `link.coupang.com`이 있는지로 검증한다.

> 2026-08-17 이전엔 Git 연동이 없어 `vercel --prod` 수동 배포였고, 그래서 프로덕션이
> 7월 19일 상태에 한 달 넘게 멈춰 있었다. 그때 CLI 토큰도 며칠 만에 만료돼 자동화가 불가능했다.
> 지금 구조는 토큰에 의존하지 않는다.

### B. 수동 / CLI

로그인한 크롬에서 `partners.coupang.com` 요청의 `Cookie` 헤더를 통째로 복사해서:

```bash
cd mobile
COUPANG_PARTNERS_COOKIE='PCID=...; sid=...' npm run refresh-coupang
```

옵션:

| 옵션 | 뜻 |
| --- | --- |
| `--dry-run` | 파일을 쓰지 않고 결과만 출력 |
| `--only=245,211` | 특정 itemCode만 (디버깅용) |
| `--rpm=20` | 분당 호출 상한 낮추기 (올리지 말 것) |

---

## 품목이 늘거나 바뀌었을 때

KAMIS가 품목을 추가하면 `KEYWORDS`에 검색어가 없어 건너뛰고, 로그에
`(검색어 미정의)`로 남는다. 조용히 빠지지 않으니 로그만 보면 된다.
`KEYWORDS`(검색어) / `TOKENS`(상품명에 반드시 포함) / `EXCLUDE`(포함되면 탈락) 세 곳을 같이 채운다.

`EXCLUDE`가 필요한 이유: "양배추"·"알배기배추"가 "배추" 검색에 섞여 들어와
품목끼리 서로를 잡아먹는다. 새 품목을 넣을 땐 이웃 품목과 겹치는지 먼저 본다.

## 가격 표시 주의

`price`는 갱신 시점의 판매가 스냅샷이다. 쿠팡 가격은 수시로 바뀌므로 상세화면 하단의
"정확한 가격은 판매처에서 확인하세요" 문구는 유지해야 한다 (파트너스 표시의무와 별개).
