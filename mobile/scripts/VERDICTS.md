# 서버 사전계산 (verdicts)

홈·상세가 쓰는 **평년 + 최근 1년 평균 두 기준 판정**을 하루 1회 미리 계산한다.
기기에서 품목별 365일을 받지 않아 **홈 일관성 + 상세 즉시 로딩**을 얻는다.

## 흐름

```
build-verdicts.mjs ──(하루 1회)──▶ public/verdicts.json ──▶ 앱(useVerdicts)
  KAMIS 365일·평년 → evalBuy        { itemCode-kindCode: { level, recentAvg } }
```

- **홈**: `verdicts[key].level`(싸/적정/비싸)로 선정·표시. 없으면 평년+낡은평년 폴백.
- **상세**: `verdicts[key].recentAvg`로 추천을 **365 기기 호출 없이 즉시** 확정(차트·연간흐름만 365 대기).
- 파일이 없거나 항목이 빠지면 **기존 기기 계산으로 자동 폴백** — 깨지지 않는다.

## 지금 바로 테스트 (수동)

```bash
cd mobile
node scripts/build-verdicts.mjs     # public/verdicts.json 생성 (KAMIS 접속 필요)
npx expo start --web                 # /verdicts.json 서빙됨 → 홈·상세 반영 확인
```

배포 반영: `npx expo export -p web && npx vercel deploy --prebuilt --prod`

## 자동화 (하루 1회)

`.github/workflows/verdicts.yml` 가 매일 16:05 KST에 실행 → `verdicts.json` 커밋.

**전제 / 셋업:**
1. 이 레포를 GitHub에 push (현재 git 레포 아님 → `git init` 후 origin 연결).
2. GitHub → Settings → Secrets → Actions 에 `KAMIS_KEY`, `KAMIS_ID` 등록.
3. 앱이 최신 JSON을 읽도록 — 둘 중 하나:
   - **Vercel을 GitHub 연동**: 커밋 시 자동 재배포 → `/verdicts.json` 갱신 (기본값 그대로).
   - **GitHub raw 직독**: `mobile/.env` 에
     `EXPO_PUBLIC_VERDICTS_URL=https://raw.githubusercontent.com/<owner>/<repo>/main/mobile/public/verdicts.json`
     설정 → 재배포 없이도 매일 갱신분을 읽음(네이티브 앱도 이 방식 필요).

> 네이티브(iOS/Android)는 동일출처 `/verdicts.json`이 없으므로 **반드시** `EXPO_PUBLIC_VERDICTS_URL`(절대 URL)을 설정해야 사전계산을 쓴다. 미설정 시 기기 계산 폴백.
