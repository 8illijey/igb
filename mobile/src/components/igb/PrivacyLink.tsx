import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, spacing, type } from '../../theme/tokens';

/**
 * 홈 푸터의 개인정보 처리방침 링크.
 *
 * 개인정보보호법상 요건은 '홈페이지 첫 화면 하단(footer)에 지속 게재'다.
 * 그래서 홈에만 둔다 — 관심목록·레시피까지 넣을 의무는 없다.
 * 명칭도 규정상 '개인정보 처리방침'으로 고정한다(취급방침 등 다른 이름 불가).
 */
export function PrivacyLink() {
  return (
    <Link href="/privacy" style={styles.link}>
      <Text style={styles.label}>개인정보 처리방침</Text>
    </Link>
  );
}

const styles = StyleSheet.create({
  link: { alignSelf: 'center', marginTop: spacing.s2, paddingVertical: spacing.s1 },
  label: {
    ...type.size[13],
    ...type.w.regular,
    color: colors.textTertiary,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});
