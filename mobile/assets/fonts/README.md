# 폰트

## Pretendard (Regular/SemiBold/Bold/ExtraBold)
앱 UI 본문·제목. web은 woff2를 쓰고 otf는 Node 스크립트에서 참조한다.

## GangwonEdu-TteunTteun.otf (강원교육튼튼체)
공유 카드(OG) 이미지 `scripts/gen-og.mjs` 전용. 앱 번들에는 들어가지 않는다.

- 저작권: 강원특별자치도교육청
- 출처: https://www.gwe.go.kr/main/content.do?key=bTIzMDcyMTEyMDc3MTU=
- 조건: 누구나 무료로 자유롭게 사용 가능(출처 표기 권장). 웹·모바일 등 매체에
  별도 허가절차 없이 쓸 수 있다. 금지되는 건 서체 자체를 유료로 양도·판매하는 행위뿐이다.

피그마 시안은 어도비 폰트 JJZukinie로 되어 있으나, 어도비 폰트는 셀프호스팅
(빌드 서버에 폰트 파일을 두는 것)에 별도 라이선스가 필요해 쓸 수 없다.
목업과 대조(폭/높이 비율·잉크 밀도)한 결과 강원교육튼튼체가 가장 근접해 이걸 골랐다.
