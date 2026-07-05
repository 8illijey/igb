/**
 * IGB Design Tokens — Figma Variables/Styles 실값 1:1 포팅 (2026-06-13 동기화).
 * 원본: Figma 파일 aVckg0tEHUX7ZNkiDYZwdR의 IGB / Primitives · IGB / Semantic 컬렉션.
 * 값 변경은 Figma 변수 → 이 파일 순서로 동기화한다.
 */
import type { TextStyle, ViewStyle } from 'react-native';

export const palette = {
  // Signal — 신호등 멘탈 모델, 3토큰 통일(X / X-weak / X-on)
  signalCheap: '#007a17',
  signalCheapWeak: '#dff6de',
  signalCheapOn: '#ffffff',
  signalFair: '#616060', // 중립 그레이 (2026-06-13 fair 중립화)
  signalFairWeak: '#eeeceb', // fair 중립화에 맞춰 warm 베이지 → 중립 (L=0.945, weak 명도대 유지)
  signalFairOn: '#ffffff',
  signalExpensive: '#b83d00',
  signalExpensiveWeak: '#ffe7d9',
  signalExpensiveOn: '#ffffff',

  // Brand (무채색 — 무대에 양보)
  brandPrimary: '#141f2c',
  brandPrimaryAlt: '#030c17',
  brandWeak: '#eef1f4',

  // Stage (cool-grey 틴트)
  grey900: '#141f2c',
  grey700: '#4b5765',
  grey500: '#87919c',
  grey400: '#a7b0b9',
  grey300: '#c5cbd2',
  grey200: '#dee3e7',
  grey100: '#eef1f4',
  grey50: '#f6f8fa',
  white: '#ffffff',
} as const;

export type SignalLevel = 'cheap' | 'fair' | 'expensive';

export const signal: Record<SignalLevel, { main: string; weak: string; on: string }> = {
  cheap: { main: palette.signalCheap, weak: palette.signalCheapWeak, on: palette.signalCheapOn },
  fair: { main: palette.signalFair, weak: palette.signalFairWeak, on: palette.signalFairOn },
  expensive: {
    main: palette.signalExpensive,
    weak: palette.signalExpensiveWeak,
    on: palette.signalExpensiveOn,
  },
};

/** IGB / Semantic 컬렉션 실값 */
export const colors = {
  bgCanvas: '#ffffff',
  bgSecondary: '#f6f8fa',
  bgTertiary: '#dee3e7', // = grey-200 (썸네일 placeholder)
  bgElevated: '#ffffff',
  bgPrimary: palette.brandPrimary,
  textPrimary: '#141f2c',
  textSecondary: '#4b5765',
  textTertiary: '#87919c',
  textActive: palette.brandPrimary,
  borderDefault: '#dee3e7',
  borderStrong: '#a7b0b9',
  borderFocus: palette.brandPrimary,
  borderPrimary: palette.brandPrimary,
  priceNumber: '#141f2c',
  priceUnit: '#87919c',
  iconActive: '#141f2c',
  iconInactive: '#87919c',
  overlayScrim: 'rgba(0,0,0,0.5)',
  overlayPress: 'rgba(0,0,0,0.1)',
  overlayTooltip: 'rgba(0,0,0,0.74)', // 툴팁 배경 (Figma overlay/tooltip)
  surfaceGlassLight: 'rgba(255,255,255,0.65)',
} as const;

export const spacing = {
  s1: 4, s2: 8, s3: 12, s4: 16, s5: 20, s6: 24, s8: 32, s10: 40, s16: 64,
} as const;

export const radius = { xs: 4, s: 8, m: 12, l: 16, xl: 20, full: 999 } as const;

export const borderWidth = { w100: 1, w150: 1.5, w200: 2 } as const;

export const iconSize = { s: 16, m: 20, l: 24, xl: 32 } as const;

export const opacity = { disabled: 0.4, disabledGlass: 0.3 } as const;

/** Pretendard 정적 웨이트 — expo-font로 로드되는 family 이름 */
export const font = {
  regular: 'Pretendard-Regular',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
  extrabold: 'Pretendard-ExtraBold',
} as const;

/** % letterSpacing → px (RN은 px 단위) */
const ls = (size: number, pct: number) => size * (pct / 100);

/**
 * Type ramp — 사이즈×굵기 2축 (토스식). 역할이 아니라 '사이즈'로 고른 뒤 '굵기'를 얹는다.
 *  - type.size[n] : fontSize + lineHeight + letterSpacing (Figma 텍스트 스타일 실값, n=폰트 사이즈)
 *  - type.w.*     : fontFamily(굵기). size와 조합해서 쓴다.
 *  - 가격 등 자릿수 정렬은 tabularNums를 함께 얹는다.
 *  예) 본문        [type.size[15], type.w.regular]
 *      카드 품목명  [type.size[17], type.w.semibold]
 *      큰 가격      [type.size[28], type.w.bold, tabularNums]
 */
export const type = {
  size: {
    12: { fontSize: 12, lineHeight: 18,    letterSpacing: 0 },
    13: { fontSize: 13, lineHeight: 19.5,  letterSpacing: 0 },
    15: { fontSize: 15, lineHeight: 22.5,  letterSpacing: ls(15, -0.5) },
    16: { fontSize: 16, lineHeight: 24,    letterSpacing: ls(16, -0.5) },
    17: { fontSize: 17, lineHeight: 25.5,  letterSpacing: ls(17, -1) },
    20: { fontSize: 20, lineHeight: 29,    letterSpacing: ls(20, -1) },
    22: { fontSize: 22, lineHeight: 31.02, letterSpacing: ls(22, -2) },
    24: { fontSize: 24, lineHeight: 33.12, letterSpacing: ls(24, -2) },
    28: { fontSize: 28, lineHeight: 36.96, letterSpacing: ls(28, -3.5) },
    32: { fontSize: 32, lineHeight: 40.32, letterSpacing: ls(32, -4) },
  },
  w: {
    regular:   { fontFamily: font.regular },
    semibold:  { fontFamily: font.semibold },
    bold:      { fontFamily: font.bold },
    extrabold: { fontFamily: font.extrabold },
  },
} as const;

/** 가격 숫자 전용 — tabular figures */
export const tabularNums: TextStyle = { fontVariant: ['tabular-nums'] };

/**
 * Elevation — Figma effect 스타일 실값.
 * RN은 그림자 1겹만 지원하므로 다층 섀도는 주 레이어 기준. elevation은 Android.
 */
export const shadow: Record<string, ViewStyle> = {
  s1: {
    shadowColor: palette.grey900, shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 }, shadowRadius: 2, elevation: 1,
  },
  s2: {
    shadowColor: palette.grey900, shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 3,
  },
  s3: {
    shadowColor: palette.grey900, shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 8 }, shadowRadius: 24, elevation: 6,
  },
  sheet: {
    shadowColor: palette.grey900, shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: -2 }, shadowRadius: 12, elevation: 8,
  },
  glassFloating: {
    shadowColor: '#000000', shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 }, shadowRadius: 40, elevation: 8,
  },
};
