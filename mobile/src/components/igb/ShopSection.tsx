import { Image } from 'expo-image';
import React, { useEffect, useRef } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { track } from '../../analytics';
import { won } from '../../api/kamis';
import { coupangProducts, CoupangProduct, ROCKET_LOGO, ROCKET_LOGO_W, trackShoppingClick } from '../../api/shopping';
import { colors, radius, spacing, type } from '../../theme/tokens';

/** GA4 이커머스 items[] 한 칸. 표시용이 아니라 계측 전용이다. */
function gaItem(p: CoupangProduct, idx: number, itemCode: string, itemName: string, market: string) {
  return {
    // vendorItemId는 상품 단위로 영구적이라(딥링크 재사용 키와 동일) 날마다 값이 안 흔들린다.
    // 없으면 productId, 그것도 없으면 상품명 — 최소한 집계는 되게.
    item_id: String(p.vendorItemId ?? p.productId ?? p.name),
    item_name: p.name,
    // 품목명을 카테고리로 넣으면 '배추 상품들'처럼 품목 단위로 묶어 볼 수 있다.
    item_category: itemName,
    // 품종까지 구분되는 라우트 키('211-02'). 같은 품목의 다른 품종을 갈라 보려고 넣는다.
    item_category2: itemCode,
    // 일반/유기농 탭 구분 — 유기농은 단가가 배 이상이라 섞으면 평균이 왜곡된다. 레시피는 'recipe'.
    item_category3: market,
    index: idx + 1,
    price: p.price,
    quantity: 1,
  };
}

type GaItem = ReturnType<typeof gaItem>;

/**
 * 섹션이 화면에 절반 이상 들어왔을 때 한 번만 view_item_list를 쏜다.
 * 이 섹션은 페이지 맨 아래라 첫 화면 밖이다 — 마운트 시점에 쏘면 안 본 노출까지 센다.
 * 네이티브엔 IntersectionObserver가 없어 조용히 건너뛴다(웹 계측만).
 */
function useViewItemList(listId: string, listName: string, items: GaItem[]) {
  const ref = useRef<View | null>(null);
  // items는 렌더마다 새 배열이다. 의존성에 넣으면 매번 관찰을 다시 시작해 노출이 여러 번 찍히므로
  // ref로 들고 있다가 발화 시점의 최신값을 읽는다.
  const latest = useRef(items);
  // 렌더 중 ref 대입은 react-hooks/refs가 막는다 — 커밋 후 이펙트에서 갱신한다(발화보다 먼저 돈다).
  useEffect(() => {
    latest.current = items;
  });
  const count = items.length;
  useEffect(() => {
    if (count === 0) return;
    const node = ref.current as unknown as Element | null;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        track('view_item_list', {
          item_list_id: listId,
          item_list_name: listName,
          currency: 'KRW',
          items: latest.current,
        });
      },
      { threshold: 0.5 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [listId, listName, count]);
  return ref;
}

/** 상품 한 행 — 이미지·(재료명)·상품명·로켓 배지·가격. Figma 933:2564 1:1. */
function ProductRow({
  p,
  label,
  onPress,
}: {
  p: CoupangProduct;
  /** 레시피에서 '이 상품이 어느 재료인지'. 품목 상세는 품목 하나라 안 쓴다. */
  label?: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.thumb}>
        {p.imageUrl ? <Image source={{ uri: p.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
      </View>
      <View style={styles.info}>
        {label && <Text style={styles.label}>{label}</Text>}
        <Text style={styles.name} numberOfLines={2}>
          {p.name}
        </Text>
        <View style={styles.priceRow}>
          {p.status && (
            <Image
              source={{ uri: ROCKET_LOGO[p.status] }}
              style={{ height: 16, width: ROCKET_LOGO_W[p.status] }}
              contentFit="contain"
            />
          )}
          <Text style={styles.price}>{won(p.price)}원</Text>
        </View>
      </View>
    </Pressable>
  );
}

/** 쿠팡 파트너스 표시의무 — 수수료 고지 필수. */
const DISCLOSURE =
  '이 게시물은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다. 정확한 가격은 판매처에서 확인하세요.';

function openProduct(p: CoupangProduct, ga: GaItem, listId: string, listName: string, clickKey: string) {
  // 기존 워커 집계는 그대로 둔다 — GA가 광고 차단기에 막혀도 남는 백업이다.
  trackShoppingClick('coupang', clickKey);
  // GA4 추천 이벤트. 커스텀 이름을 쓰면 상품명·품목이 '맞춤 측정기준'을 등록해야만 보고서에 뜨는데,
  // select_item은 items[]가 기본 측정기준이라 GA 관리화면에서 아무것도 안 해도 상품별로 쪼개 볼 수 있다.
  track('select_item', { item_list_id: listId, item_list_name: listName, currency: 'KRW', items: [ga] });
  Linking.openURL(p.url);
}

const DETAIL = { id: 'coupang_detail', name: '지금 쿠팡에서 사기' };

/** 품목 상세 — 그 품목의 쿠팡 상품 전부. */
export function ShopSection({
  itemCode,
  itemName,
  market = 'retail',
}: {
  itemCode: string;
  itemName: string;
  market?: 'retail' | 'eco';
}) {
  const products = coupangProducts(itemCode, market);
  const gaItems = products.map((p, i) => gaItem(p, i, itemCode, itemName, market));
  const ref = useViewItemList(DETAIL.id, DETAIL.name, gaItems);
  if (products.length === 0) return null;
  return (
    <View style={styles.section} ref={ref}>
      <Text style={styles.title}>{DETAIL.name}</Text>
      <View style={styles.card}>
        {products.map((p, idx) => (
          <View key={idx}>
            {idx > 0 && <View style={styles.divider} />}
            <ProductRow p={p} onPress={() => openProduct(p, gaItems[idx], DETAIL.id, DETAIL.name, itemCode)} />
          </View>
        ))}
      </View>
      <Text style={styles.caption}>{DISCLOSURE}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.s2 },
  title: { ...type.size[17], ...type.w.semibold, color: colors.textPrimary } as const,
  card: { borderRadius: radius.l, backgroundColor: colors.bgElevated, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s3,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s3,
    minHeight: 80,
  },
  thumb: { width: 56, height: 56, borderRadius: radius.s, backgroundColor: colors.bgSecondary, overflow: 'hidden' },
  info: { flex: 1, gap: spacing.s1 },
  label: { ...type.size[13], ...type.w.semibold, color: colors.textTertiary } as const,
  name: { ...type.size[15], ...type.w.regular, color: colors.textPrimary } as const,
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.s2 },
  price: { ...type.size[15], ...type.w.semibold, color: colors.priceNumber } as const,
  divider: { height: 1, backgroundColor: colors.borderDefault },
  caption: { ...type.size[13], ...type.w.regular, color: colors.textTertiary } as const,
});
