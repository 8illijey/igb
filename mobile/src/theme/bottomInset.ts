import { spacing } from './tokens';

/**
 * 스크롤 목록 하단 여백 — 끝까지 내렸을 때 마지막 줄이 탭바에 가리지 않게.
 *
 * 탭바는 화면 위에 떠 있어(position: fixed/absolute) 스크롤 영역을 밀어내지 않는다.
 * 그래서 목록 스스로 탭바가 먹는 만큼 아래를 비워둬야 마지막 줄까지 보인다.
 *
 * 매직넘버(140)를 쓰지 않고 탭바 실측 구성에서 계산한다 — 탭바 높이가 바뀌면
 * 여기도 같이 따라온다.
 *   아이콘+라벨 62 + 바닥 띄움 12 = 74가 탭바가 차지하는 높이(2026-08-24 실측)
 *   + s6(24)는 마지막 줄이 탭바에 딱 붙어 보이지 않게 하는 숨 쉴 틈
 *
 * 브라우저 하단 주소창은 여기서 더할 필요가 없다 — 루트 높이가 100%(=주소창을
 * 뺀 보이는 높이)라 스크롤 영역 자체가 이미 주소창 위에서 끝난다.
 */
const TABBAR_HEIGHT = 62; // GlassTabBar pill: 아이콘 24 + 라벨 + 상하 padding
const TABBAR_BOTTOM = spacing.s3; // GlassTabBar wrap의 bottom

export const scrollBottomInset = TABBAR_HEIGHT + TABBAR_BOTTOM + spacing.s6;
