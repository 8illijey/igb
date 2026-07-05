import { Search, X } from 'lucide-react-native';
import React from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, radius, spacing, type } from '../../theme/tokens';

// 웹: 브라우저 기본 파란 focus outline 제거(커스텀 테두리만 사용) + 16px로 Safari 자동 확대 방지
const webInputFix = Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0, fontSize: 16 } as any) : null;

interface Props {
  value?: string;
  onChangeText?: (t: string) => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  /** l=48 단독 배치(홈) / s=40 헤더 내장(44 행 세로 중앙) */
  size?: 'l' | 's';
  editable?: boolean;
  onPress?: () => void;
}

export function SearchField({
  value,
  onChangeText,
  onClear,
  placeholder = '오이, 양파, 계란…',
  autoFocus,
  size = 'l',
  editable = true,
  onPress,
}: Props) {
  const [focused, setFocused] = React.useState(false);
  const body = (
    <View
      style={[
        styles.base,
        { height: size === 'l' ? 48 : 40 },
        focused && styles.focused,
      ]}
    >
      <View style={styles.iconBox}>
        <Search size={20} color={colors.textTertiary} strokeWidth={2} />
      </View>
      <TextInput
        style={[styles.input, webInputFix]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        autoFocus={autoFocus}
        editable={editable}
        pointerEvents={editable ? 'auto' : 'none'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType="search"
      />
      {!!value && onClear && (
        <Pressable onPress={onClear} hitSlop={8} style={styles.iconBox}>
          <X size={20} color={colors.textTertiary} strokeWidth={2} />
        </Pressable>
      )}
    </View>
  );
  if (onPress) return <Pressable onPress={onPress}>{body}</Pressable>;
  return body;
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s2,
    paddingHorizontal: spacing.s3,
    borderRadius: radius.l, // Figma 실값 16
    backgroundColor: colors.bgSecondary,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  focused: { borderColor: colors.borderStrong }, // Figma focused: border/strong(#a7b0b9), bg 그대로
  // minWidth:0 — flex:1 입력란이 내용 크기에 묶여 옆 아이콘을 줄이는 것 방지
  input: { flex: 1, minWidth: 0, ...type.size[15], ...type.w.regular, color: colors.textPrimary, paddingVertical: 0 } as const,
  // 아이콘은 절대 안 줄어들게
  iconBox: { flexShrink: 0, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
});
