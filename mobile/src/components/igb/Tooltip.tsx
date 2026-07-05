import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, palette, radius, spacing, type } from '../../theme/tokens';

export type TooltipPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'top-right'
  | 'top-left'
  | 'top-center';

interface Props {
  label: string;
  value: string;
  /** 값 색 — 기본 흰색(어두운 배경). */
  valueColor?: string;
  /** 꼬리 위치 = 앵커 방향. bottom-*=버블이 앵커 위, top-*=버블이 앵커 아래. -center=꼬리 가운데. */
  position?: TooltipPosition;
}

const TAIL_W = 9.55635;
const TAIL_H = 5.57536;
// 코너용 비대칭 꼬리(한쪽 수직 flush) — Figma 실제 애셋
const TAIL_CORNER = 'M0 0H9.55635V3.57157C9.55635 5.25644 7.60057 6.18631 6.29383 5.12272L0 0Z';
// 센터용 대칭 삼각형 꼬리
const TAIL_CENTER = `M0 0H${TAIL_W}L${TAIL_W / 2} ${TAIL_H}Z`;

/**
 * Figma tooltip 컴포넌트 (853:5493) — 라벨 + 값 + 말풍선 꼬리(6방향).
 * 버블(View)과 꼬리(SVG)를 flush로 붙여 반투명 겹침 없음. 꼬리가 붙는 코너만 각짐(center는 전부 라운드).
 */
export function Tooltip({ label, value, valueColor = palette.white, position = 'bottom-right' }: Props) {
  const isBottom = position.startsWith('bottom');
  const isCenter = position.endsWith('center');
  const isRight = position.endsWith('right');

  const R = radius.s;
  const corners = isCenter
    ? { borderRadius: R }
    : {
        borderTopLeftRadius: position === 'top-left' ? 0 : R,
        borderTopRightRadius: position === 'top-right' ? 0 : R,
        borderBottomLeftRadius: position === 'bottom-left' ? 0 : R,
        borderBottomRightRadius: position === 'bottom-right' ? 0 : R,
      };

  const tail = (
    <Svg
      width={TAIL_W}
      height={TAIL_H}
      viewBox={`0 0 ${TAIL_W} ${TAIL_H}`}
      style={[
        styles.tail,
        // 0.5px 겹쳐 반투명 버블-꼬리 사이 sub-pixel 틈(밝은 seam) 방지
        isBottom ? { bottom: -(TAIL_H - 0.5) } : { top: -(TAIL_H - 0.5) },
        isCenter ? { left: '50%', marginLeft: -TAIL_W / 2 } : isRight ? { right: 0 } : { left: 0 },
        // 코너: 좌/상 방향으로 미러. 센터: 상단이면 세로만 뒤집기.
        isCenter
          ? !isBottom && { transform: [{ scaleY: -1 }] }
          : { transform: [{ scaleX: isRight ? 1 : -1 }, { scaleY: isBottom ? 1 : -1 }] },
      ]}
    >
      <Path d={isCenter ? TAIL_CENTER : TAIL_CORNER} fill="#000000" fillOpacity={0.74} />
    </Svg>
  );

  return (
    <View style={[styles.bubble, corners]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
      {tail}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.s5,
    paddingLeft: spacing.s3,
    paddingRight: spacing.s2,
    paddingVertical: spacing.s2,
    backgroundColor: colors.overlayTooltip,
  },
  tail: { position: 'absolute' },
  label: { ...type.size[13], ...type.w.regular, color: palette.white } as const,
  value: { ...type.size[13], ...type.w.semibold } as const,
});
