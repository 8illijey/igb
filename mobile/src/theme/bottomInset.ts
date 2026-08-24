import { Platform } from 'react-native';
import { spacing } from './tokens';

/**
 * 스크롤 목록 하단 여백 — 끝까지 내렸을 때 마지막 줄이 탭바·주소창에 안 가리게.
 *
 * 두 가지를 비워둬야 한다.
 *  1) 떠 있는 탭바가 먹는 높이 — 탭바는 스크롤 영역을 밀어내지 않는다.
 *     62(pill) + 12(bottom) = 74. 매직넘버 대신 구성에서 계산해 탭바가 바뀌면 따라온다.
 *  2) 웹에서 루트를 100vh로 두는 만큼(= 주소창 뒤까지) 스크롤 영역도 그만큼 길어진다.
 *     `100vh - 100dvh`가 곧 주소창이 먹은 높이다.
 *       데스크톱·안드로이드(툴바 숨김) → 0
 *       아이폰 사파리(주소창 표시)     → 40 안팎 (2026-08-24 실측)
 *
 * 네이티브는 주소창이 없어 1번만 쓴다.
 */
const TABBAR_HEIGHT = 62; // GlassTabBar pill 실측
const TABBAR_BOTTOM = spacing.s3; // GlassTabBar wrap의 bottom
const BASE = TABBAR_HEIGHT + TABBAR_BOTTOM + spacing.s6; // + 숨 쉴 틈 = 98

export const scrollBottomInset = (Platform.OS === 'web'
  ? `calc(${BASE}px + (100vh - 100dvh))`
  : BASE) as unknown as number;
