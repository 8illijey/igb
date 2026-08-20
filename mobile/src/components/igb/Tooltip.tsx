import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, palette, radius, spacing, type } from '../../theme/tokens';

export type TooltipPosition =
  /** 앵커가 왼쪽 — 버블이 앵커 오른쪽에 서고 꼬리가 버블 왼쪽 변에서 왼쪽을 가리킨다(<▢). */
  | 'left-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'top-right'
  | 'top-left'
  | 'top-center';

interface Props {
  label?: string;
  value?: string;
  /**
   * 문단 형태 툴팁 — label/value 대신 줄바꿈되는 설명 한 덩어리를 넣을 때.
   * 차트 값 툴팁(날짜+가격)과 같은 버블·꼬리를 쓰되 레이아웃만 세로로 바꾼다.
   */
  text?: string;
  /** 문단 툴팁 최대 폭(기본 220) — 이 폭에서 줄바꿈된다. */
  maxWidth?: number;
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
export function Tooltip({
  label,
  value,
  text,
  maxWidth = 220,
  valueColor = palette.white,
  position = 'bottom-right',
}: Props) {
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

  // 좌측 꼬리(<▢) — 대칭 삼각형을 -90° 돌려 왼쪽을 가리키게 한다.
  // 회전은 요소 중심 기준이라 레이아웃 박스(9.56×5.58)는 그대로고 보이는 모양만 5.58×9.56이 된다.
  // 그래서 '중심'을 기준으로 위치를 잡는다: 세로는 버블 정중앙, 가로는 버블 왼쪽 변에 0.5px 겹치게.
  if (position === 'left-center') {
    return (
      <View style={[styles.bubble, styles.bubbleText, { maxWidth }, { borderRadius: radius.s }]}>
        <Text style={styles.text}>{text}</Text>
        <Svg
          width={TAIL_W}
          height={TAIL_H}
          viewBox={`0 0 ${TAIL_W} ${TAIL_H}`}
          style={[
            styles.tail,
            {
              left: -(TAIL_W / 2 + TAIL_H / 2 - 0.5),
              top: '50%',
              marginTop: -TAIL_H / 2,
              // +90°(시계방향)라야 꼭짓점이 왼쪽을 향한다. 화면 좌표는 y가 아래로 자라므로
              // 아래를 향한 꼭짓점 (0, h/2)는 +90°에서 (−h/2, 0) = 왼쪽으로 간다.
              // −90°로 하면 오른쪽(버블 안쪽)을 향해 세로가 4.78px 어긋난다(2026-08-20 실측).
              transform: [{ rotate: '90deg' }],
            },
          ]}
        >
          <Path d={TAIL_CENTER} fill="#000000" fillOpacity={0.74} />
        </Svg>
      </View>
    );
  }

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

  if (text != null) {
    return (
      <View style={[styles.bubble, styles.bubbleText, { maxWidth }, corners]}>
        <Text style={styles.text}>{text}</Text>
        {tail}
      </View>
    );
  }
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
  // 문단용 — 가로 나열·큰 gap을 끄고 좌우 여백을 같게 맞춘다.
  // paddingLeft/Right를 명시한다 — 축약형 paddingHorizontal은 bubble의 개별 속성에 밀려
  // 좌 12 / 우 8로 짝짝이가 된다(RN Web은 longhand 우선).
  bubbleText: { flexDirection: 'column', gap: 0, paddingLeft: spacing.s3, paddingRight: spacing.s3, paddingVertical: spacing.s2 },
  text: { ...type.size[13], ...type.w.regular, color: palette.white, lineHeight: 18 } as const,
  tail: { position: 'absolute' },
  label: { ...type.size[13], ...type.w.regular, color: palette.white } as const,
  value: { ...type.size[13], ...type.w.semibold } as const,
});
