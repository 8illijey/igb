import { ChevronDown, MapPin } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { REGIONS, regionLabel, regionOf, type RegionKey } from '../../api/regions';
import { useRegion } from '../../store/region';
import { colors, radius, spacing, type } from '../../theme/tokens';

const OPTIONS: { key: RegionKey; label: string; thin?: true }[] = [
  { key: 'all', label: '전국' },
  ...REGIONS.map((r) => ({ key: r.name as RegionKey, label: r.name, thin: r.thin })),
];

/** 표본 1~2곳 지역 안내 — 두 시안이 함께 쓴다. */
export function RegionNote() {
  const { region } = useRegion();
  if (!regionOf(region)?.thin) return null;
  return (
    <Text style={styles.note}>{regionLabel(region)}은 조사 판매처가 1~2곳뿐이라 한 매장 가격에 가까워요.</Text>
  );
}

/**
 * 시안 A — 드롭다운. 헤더 한 줄만 쓰고 목록은 눌러야 펼쳐진다.
 * 메뉴는 Modal로 띄운다 — GlassHeader가 overflow:hidden이라 안에서 그리면 잘린다.
 */
export function RegionDropdown() {
  const { region, setRegion } = useRegion();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`지역 선택, 현재 ${regionLabel(region)}`}
        style={styles.trigger}
      >
        <MapPin size={14} color={colors.textSecondary} />
        <Text style={styles.triggerText}>{regionLabel(region)}</Text>
        <ChevronDown size={14} color={colors.textTertiary} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.scrim} onPress={() => setOpen(false)}>
          {/* 시트 자체를 누를 땐 닫히지 않게 — 배경 Pressable로 이벤트가 올라가는 걸 막는다. */}
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>지역 선택</Text>
            <ScrollView style={styles.sheetScroll}>
              {OPTIONS.map((o) => {
                const on = o.key === region;
                return (
                  <Pressable
                    key={o.key}
                    onPress={() => {
                      setRegion(o.key);
                      setOpen(false);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    style={styles.row}
                  >
                    <Text style={[styles.rowText, on && styles.rowTextOn]}>{o.label}</Text>
                    {o.thin && <Text style={styles.rowHint}>판매처 1~2곳</Text>}
                    {on && <Text style={styles.check}>✓</Text>}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

/** 시안 B — 칩. 한 번에 다 보이고 한 번 눌러 바뀐다. 대신 헤더가 한 줄 더 두꺼워진다. */
export function RegionChips() {
  const { region, setRegion } = useRegion();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
      {OPTIONS.map((o) => {
        const on = o.key === region;
        return (
          <Pressable
            key={o.key}
            onPress={() => setRegion(o.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${o.label} 시세로 보기`}
            style={[styles.chip, on && styles.chipOn]}
          >
            <Text style={[styles.chipText, on && styles.chipTextOn]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  note: {
    ...type.size[13],
    ...type.w.regular,
    color: colors.textTertiary,
    paddingHorizontal: spacing.s4,
    paddingBottom: spacing.s2,
  } as const,

  // 시안 A
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s1,
    paddingHorizontal: spacing.s3,
    paddingVertical: spacing.s1,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.bgElevated,
  },
  triggerText: { ...type.size[13], ...type.w.semibold, color: colors.textPrimary } as const,
  scrim: { flex: 1, backgroundColor: colors.overlayScrim, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.l,
    borderTopRightRadius: radius.l,
    paddingTop: spacing.s4,
    paddingBottom: spacing.s6,
    maxHeight: '70%',
  },
  sheetTitle: {
    ...type.size[17],
    ...type.w.semibold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.s4,
    paddingBottom: spacing.s2,
  } as const,
  sheetScroll: { paddingHorizontal: spacing.s2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s2,
    paddingHorizontal: spacing.s3,
    paddingVertical: spacing.s3,
    borderRadius: radius.s,
  },
  rowText: { ...type.size[15], ...type.w.regular, color: colors.textSecondary, flex: 1 } as const,
  rowTextOn: { color: colors.textPrimary, ...type.w.semibold } as const,
  rowHint: { ...type.size[13], ...type.w.regular, color: colors.textTertiary } as const,
  check: { ...type.size[15], ...type.w.semibold, color: colors.textPrimary } as const,

  // 시안 B
  chipRow: { flexDirection: 'row', gap: spacing.s2, paddingHorizontal: spacing.s4, paddingBottom: spacing.s2 },
  chip: {
    paddingHorizontal: spacing.s3,
    paddingVertical: spacing.s1,
    borderRadius: radius.full,
    backgroundColor: colors.bgSecondary,
  },
  chipOn: { backgroundColor: colors.textPrimary },
  chipText: { ...type.size[13], ...type.w.semibold, color: colors.textTertiary } as const,
  chipTextOn: { color: colors.bgElevated },
});
