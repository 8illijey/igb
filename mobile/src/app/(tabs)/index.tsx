import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import Head from 'expo-router/head';
import Svg, { Path } from 'react-native-svg';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Asset } from 'expo-asset';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Reanimated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { PriceItem, won } from '../../api/kamis';
import { useVerdicts, useRegionalVerdicts, type Verdict, type RegionalVerdicts } from '../../api/verdicts';
import { EmptyState } from '../../components/igb/EmptyState';
import { GlassHeader } from '../../components/igb/GlassHeader';
import { SearchField } from '../../components/igb/SearchField';
import { SignalChip } from '../../components/igb/SignalChip';
import { Wordmark } from '../../components/igb/Wordmark';
import { RegionSheet } from '../../components/igb/RegionSheet';
import { RegionNote } from '../../components/igb/RegionNote';
import { useRegion } from '../../store/region';
import { NATIONWIDE } from '../../data/regions';
import { itemKey, usePrices } from '../../store/prices';
import { thumbFor } from '../../thumbnails';
import { subjectParticle } from '../../utils/korean';
import { colors, font, radius, signal, SignalLevel, spacing, type } from '../../theme/tokens';
import { OG_DEFAULT_IMAGE } from '../../og';
import { PrivacyLink } from '../../components/igb/PrivacyLink';

const CHIP_LABEL = {cheap: '할인율 1위', fair: '평소 수준이에요', expensive: '비싼 편이에요' } as const;

/**
 * 한 품목의 '표시 뷰' — 전국/지역에 따라 오늘가·판정·비교기준이 달라진다.
 * 전국: 오늘 vs 평년('이맘때 평균'). 지역: 오늘 vs 그 지역 최근 평균('최근 평균').
 * 지역 데이터가 없으면 전국으로 폴백(화면이 깨지지 않게).
 */
type ItemView = {
  today: number | null;
  level: SignalLevel | null;
  basePrice: number | null;
  baseLabel: string;
  pct: number | null;
  /** 지역을 골랐는데 그 도시가 이 품목을 조사하지 않아 전국 값으로 대신했다. */
  nationwide?: boolean;
  /** 평년이 없어 전국 지난 28일 평균으로 판정했다 — 평년 % 와 축이 달라 히어로('할인율 1위')엔 못 선다. */
  r28?: boolean;
};
function itemView(i: PriceItem, region: string, regional: RegionalVerdicts, verdicts: Record<string, Verdict>): ItemView {
  const key = itemKey(i);
  // 도시마다 조사 품목이 다르다(2026-10-16 실측: 춘천은 취청오이·가시오이를 안 하고 쥬키니는 9/2부터 멈춤).
  // 지역 파일이 아직 안 왔으면(regional[region] 없음) 전국 화면 그대로 — 전 품목에 '전국'이 깜빡이지 않게.
  let nationwide = false;
  if (region !== NATIONWIDE && regional[region]) {
    const rv = regional[region][key];
    if (rv && rv.today != null) {
      const pct = rv.recentAvg ? Math.round(((rv.today - rv.recentAvg) / rv.recentAvg) * 100) : null;
      // 홈 히어로는 '최근 평균'만 — 일수(28일)는 상세 차트에서만 표기.
      return { today: rv.today, level: rv.level, basePrice: rv.recentAvg, baseLabel: '최근 평균', pct };
    }
    nationwide = true; // 그 도시 미조사 → 전국 폴백
  }
  // 평년이 없으면 전국 지난 28일 평균으로 판정 — 상세와 같은 값·같은 ±1% 규칙(evalBuy).
  const r28 = verdicts[key]?.recent28Avg;
  if (i.normal == null && r28 && i.today != null) {
    const pct = Math.round(((i.today - r28) / r28) * 100);
    const level: SignalLevel = pct <= -1 ? 'cheap' : pct >= 1 ? 'expensive' : 'fair';
    return { nationwide, r28: true, today: i.today, level, basePrice: r28, baseLabel: '최근 평균', pct };
  }
  return {
    nationwide,
    today: i.today,
    level: verdicts[key]?.level ?? i.level,
    basePrice: i.normal,
    baseLabel: '이맘때 평균',
    pct: i.vsNormalPct ?? null,
  };
}

/**
 * 품목 썸네일 — 웹은 순수 <img>. expo-image는 JS 실행 후에만 DOM에 이미지를 만들어
 * SSG 정적 HTML에서 사진이 빠졌고, LCP(히어로 사진)가 번들 4MB 뒤로 밀렸다(2026-09-03 PSI 23.7s).
 * alt는 a11y·SEO 감사('이미지 alt 없음')도 같이 해소. 네이티브는 기존 expo-image 유지.
 */
function Thumb({ item, eager }: { item: PriceItem; eager?: boolean }) {
  const src = thumbFor(item);
  if (src == null) return null;
  if (Platform.OS === 'web') {
    return (
      <img
        src={Asset.fromModule(src).uri}
        alt={item.itemName}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  }
  return <Image source={src} style={StyleSheet.absoluteFill} contentFit="cover" />;
}

/** 히어로 가격 카운트업 — 첫 도착 1회만 85%→100%를 500ms cubic ease-out으로. reduced motion·비활성 시 즉시 최종값. */
function useCountUp(target: number | null, enabled: boolean): number | null {
  const [v, setV] = useState(target);
  useEffect(() => {
    if (target == null || !enabled) {
      setV(target);
      return;
    }
    const from = Math.round(target * 0.85);
    const t0 = Date.now();
    let raf: number;
    const tick = () => {
      const p = Math.min(1, (Date.now() - t0) / 500);
      const e = 1 - Math.pow(1 - p, 3);
      setV(Math.round(from + (target - from) * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, enabled]);
  return v;
}

// Figma price-right-button (842:4347) 실제 애셋 — 37×37, 굵은 chevron(stroke 3.44).
function PriceChevron() {
  return (
    <Svg width={37} height={37} viewBox="0 0 37 37" fill="none">
      <Path
        d="M9.91187 27.1079L18.5198 18.5L9.91187 9.89209"
        stroke={colors.textPrimary}
        strokeWidth={3.44316}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
// 카드 배지 = 평년 대비 할인율%. cheap은 항상 음수(싸요)라 "주목할 시세"의 차이를 그대로 보여준다.
// (전부 BEST면 정보가 0 → 할인율로 카드끼리 구별. 상세 종합판정은 cheap 게이팅이라 모순 안 남)

/** Figma hero-verdict-card 1:1 — level은 사전계산(평년+최근1년) 우선, 없으면 item.level(평년) */
function HeroVerdictCard({ item, view, animatePrice = false }: { item: PriceItem; view: ItemView; animatePrice?: boolean }) {
  const level = view.level ?? 'fair';
  const c = signal[level];
  const shownPrice = useCountUp(view.today, animatePrice);
  const pct = Math.abs(view.pct ?? 0);
  // 숫자와 판정어 사이는 줄바꿈 안 되는 공백(NBSP).
  // 일반 공백이면 '40% / 싸요'처럼 떨어진다 — word-break: keep-all은 단어 안만 묶고
  // 어절 사이는 그대로 끊기 때문이다(2026-08-25 제보).
  const verdictTail =
    level === 'cheap'
      ? `${pct}%\u00A0싸요`
      : level === 'expensive'
        ? `${pct}%\u00A0비싸요`
        : '평소\u00A0가격이에요';
  // 규격 캡션 — kindName에서 품목명 접두어 제거(토마토(1kg)→1kg). 품종명(다다기계통(10개))은 유지.
  let spec = item.kindName.replace(item.itemName, '').trim();
  if (spec.startsWith('(') && spec.endsWith(')')) spec = spec.slice(1, -1);
  if (!spec) spec = item.unit;
  return (
    <Link href={`/item/${itemKey(item)}`} asChild>
    <Pressable
      // 함수형 style은 쓰지 마라 — Link asChild가 웹에서 함수를 버려 카드 배경·여백이 통째로 빠진다(2026-10-17).
      style={styles.heroCard}
      accessibilityLabel={`${item.itemName} 시세 자세히 보기`}
    >
      <View style={styles.heroTopRow}>
        <SignalChip level={level} label={CHIP_LABEL[level]} showArrow />
        <Text style={styles.captionGrey}>오늘 · KAMIS 소매</Text>
      </View>

      {/* Figma: 평가문구는 카드 상단 풀폭, '…평균보다' / '46% 싸요' 두 줄.
          판정어는 '\n'이 아니라 별도 블록으로 내린다 — 한 Text 안에서 '보다 \n'으로 끊으면
          좁은 화면에서 줄 끝 공백이 한 번 더 접혀 '평균보다 / (빈줄) / 39% 싸요'가 됐다(2026-08-24 아이폰 제보).
          앞 문장은 길면 폭에 맞춰 알아서 접힌다. */}
      <View>
        <Text style={styles.verdict}>
          오늘은 {item.itemName}
          {subjectParticle(item.itemName)} {view.baseLabel}보다
        </Text>
        <Text style={[styles.verdict, { color: c.main, textDecorationLine: 'underline' }]}>{verdictTail}</Text>
      </View>

      <View style={styles.heroMediaRow}>
        {/* Figma hero-verdict-card: 좌측 1:1 썸네일 (없으면 bgTertiary placeholder) */}
        <View style={styles.heroThumb}>
          <Thumb item={item} eager />
        </View>
        {/* 우측 칼럼: 가격+chevron 위, 캡션 아래 (space-between) — Figma title-price */}
        <View style={styles.heroPriceCol}>
          <View style={styles.heroPriceRow}>
            <Text style={styles.heroPrice}>{won(shownPrice)}원</Text>
            <PriceChevron />
          </View>
          <View>
            <Text style={styles.captionSecondary}>{spec}</Text>
            <Text style={styles.captionSecondary}>{view.baseLabel} {won(view.basePrice)}원</Text>
          </View>
        </View>
      </View>
    </Pressable>
    </Link>
  );
}

/** Figma thumbnail-card 1:1 — 사진(placeholder) + xs solid 칩(%·변동없음) + 품명/규격/가격 */
function ThumbnailCard({ item, view, width }: { item: PriceItem; view: ItemView; width?: number }) {
  // 칩 색은 표시한 할인율(%)과 같은 기준으로 묶는다 — 숫자와 색이 따로 놀지 않게(-10%→싸/초록, +53%→비싸/빨강).
  // 비교 기준이 없으면(pct null) 칩을 안 단다 — 0으로 떨어뜨리면 근거 없이 '변동없음'이 뜬다.
  const pct = view.pct;
  const pctLevel: SignalLevel | null = pct == null ? null : pct <= -1 ? 'cheap' : pct >= 1 ? 'expensive' : 'fair';
  // Link로 감싸 웹에선 <a href>가 된다 — 카드가 SSG(스냅샷)로도 그려지므로 크롤러가 이 링크로 상세를 찾는다.
  return (
    <Link href={`/item/${itemKey(item)}`} asChild>
    <Pressable style={StyleSheet.flatten([styles.thumbCard, width != null && { width }])}>
      <View style={styles.thumbMedia}>
        <Thumb item={item} />
        {pctLevel != null && pct != null && (
          <View style={styles.thumbChip}>
            {/* Figma: 화살표 + 무부호 %(fair는 '변동없음'). 방향은 화살표가 표기. */}
            <SignalChip
              level={pctLevel}
              size="xs"
              showArrow
              label={pctLevel === 'fair' ? '변동없음' : `${Math.abs(pct)}%`}
            />
          </View>
        )}
      </View>
      <View>
        <Text style={styles.thumbName} numberOfLines={1}>
          {item.itemName}
        </Text>
        <Text style={styles.thumbPrice} numberOfLines={1}>
          {won(view.today)}원<Text style={styles.thumbUnit}> / {item.unit}</Text>
        </Text>
      </View>
    </Pressable>
    </Link>
  );
}

export default function HomeScreen() {
  const { items, loading, error, refresh } = usePrices();
  // 화면에 뜬 값이 실제로 조사된 날 — 가장 최근 것을 대표로 쓴다.
  const surveyDate = useMemo(() => {
    const ds = items.map((i) => i.surveyDate).filter(Boolean).sort();
    return ds.length ? ds[ds.length - 1] : null;
  }, [items]);
  const verdicts = useVerdicts(); // 사전계산: 평년+최근1년 두 기준 판정 (있으면 우선)
  // 표시 신호 = 사전계산 level(두 기준) 우선, 없으면 item.level(평년)
  const [regionOpen, setRegionOpen] = useState(false);
  const { region } = useRegion();
  // 지역 판정 — 전국이 아닐 때만 받는다. 선택 도시의 오늘가·판정·최근평균으로 화면을 덮는다.
  const { regions: regional } = useRegionalVerdicts(region !== NATIONWIDE);
  // 3열 그리드는 컨테이너 폭을 측정해 열 너비를 채운다(고정 %는 480 등에서 우측 여백이 남음).
  const [gridW, setGridW] = useState(0);
  const colW = gridW > 0 ? Math.floor((gridW - spacing.s3 * 2) / 3) : undefined;
  // 상단 고정 글래스 영역 높이 — ScrollView 콘텐츠를 그만큼 내려 가려지지 않게.
  // 초기값 100 = 웹 실측(헤더 44 + 검색 56). 0으로 시작하면 SSG로 미리 그린 콘텐츠가
  // 하이드레이션 때 100px 통째로 밀려 CLS 0.288이 나왔다(2026-09-03 PSI). onLayout이 보정.
  const [topH, setTopH] = useState(100);

  const viewOf = (i: PriceItem) => itemView(i, region, regional, verdicts);
  // 판정 가능 = 비교 기준(평년·최근평균)이 있어 %가 나온다. KAMIS가 평년을 안 주는 품목(가지·부추·키위 등,
  // 2026-10-16 실측 8개)은 전국 지난 28일 평균(itemView r28)으로 판정하고, 그것도 없으면 칩 없이 싣는다
  // — 홈에서 빼면 사용자도 크롤러도 그 상세로 못 간다.
  const judged = (v: ItemView) => v.pct != null && v.level != null;

  // 진입 연출 게이트 — 스피너를 실제로 본 첫 도착 1회만. 캐시 즉시 페인트·당겨서 새로고침·펼침엔 연출 없음.
  const reduced = useReducedMotion();
  const sawSpinner = useRef(false);
  const didAnimate = useRef(false);
  if (loading && items.length === 0) sawSpinner.current = true;
  const animateEntrance = sawSpinner.current && !didAnimate.current && !reduced && items.length > 0;
  useEffect(() => {
    if (animateEntrance) didAnimate.current = true;
  });
  const ORDER = { cheap: 0, fair: 1, expensive: 2 } as const;
  // 전체 품목 — BEST(싸) → FAIR(적정) → WAIT(비싸) 순, 같은 등급 내 평년 대비 낮은 순. 판정 없는 품목은 그 뒤.
  const ranked = useMemo(
    () =>
      // 고기도 등급(1++·1+·1)·원산지별로 다 보여준다 — 부위별 최저가 하나로 묶었더니 한우가 늘 1등급만
      // 보였다(2026-10-16 예지님 결정으로 되돌림). 최저가 하나는 검색의 인기 TOP10에만 남는다.
      items
        .filter((i) => viewOf(i).today != null)
        .sort((a, b) => {
          const va = viewOf(a);
          const vb = viewOf(b);
          // 전국 폴백 품목은 맨 뒤로 — 그 %는 전국 평년 대비라 도시 '최근 평균' 대비와 같은 줄에 세울 수 없다.
          const n = Number(!!va.nationwide) - Number(!!vb.nationwide);
          if (n !== 0) return n;
          const j = Number(!judged(va)) - Number(!judged(vb));
          if (j !== 0) return j;
          if (!judged(va)) return 0;
          const d = ORDER[va.level!] - ORDER[vb.level!];
          return d !== 0 ? d : (va.pct ?? 0) - (vb.pct ?? 0);
        }),
    [items, verdicts, region, regional],
  );
  // 히어로는 '이 도시에서 싼 것' 자리라 그 도시가 조사한 품목만. 아래 목록엔 다 나온다.
  const local = useMemo(() => ranked.filter((i) => !viewOf(i).nationwide), [ranked, region, regional]);
  const hero = useMemo(
    () => local.find((i) => judged(viewOf(i)) && !viewOf(i).r28 && viewOf(i).level === 'cheap') ?? null,
    [local, region, regional],
  ); // 가장 싼 BEST 품목
  // 전 품목을 접지 않고 다 보여준다(2026-10-16 결정 — '전체보기' 버튼과 하단 '전체 품목' 색인을 같이 뺐다).
  // 카드가 <a href>라 정적 HTML에도 상세 링크가 품목 수만큼 남는다 — 색인이 하던 크롤 경로를 카드가 잇는다.
  const notable = useMemo(() => ranked.filter((i) => i !== hero), [ranked, hero]);
  const firstNationwide = notable.findIndex((i) => viewOf(i).nationwide);

  return (
    <View style={styles.screen}>
      {/* 홈 제목·설명 — 라우트가 <Head>를 안 주면 helmet이 빈 <title>을 심어 전 페이지 제목이 빈다. */}
      <Head>
        <title>오늘 장보기 시세를 한눈에 — 배추·삼겹살·계란 지금 사도 될까 | 이거비싸?</title>
        <meta
          name="description"
          content="배추·양파·삼겹살·계란 등 82개 품목의 오늘 가격. 이맘때 평년과 비교해 지금 사도 되는 값인지 알려드려요. 소매·도매·유기농 시세 제공."
        />
        <link rel="canonical" href="https://igeobissa.com/" />
        {/* og:title·description은 +html.tsx에서 뺐으므로 라우트가 반드시 채워야 한다.
            안 채우면 카톡·슬랙 공유 시 제목 없는 카드가 뜬다. */}
        <meta property="og:title" content="오늘 장보기 시세를 한눈에 | 이거비싸?" />
        <meta
          property="og:description"
          content="배추·양파·삼겹살·계란 등 82개 품목의 오늘 가격. 이맘때 평년과 비교해 지금 사도 되는 값인지 알려드려요."
        />
        <meta property="og:url" content="https://igeobissa.com/" />
        <meta name="twitter:title" content="오늘 장보기 시세를 한눈에 | 이거비싸?" />
        <meta
          name="twitter:description"
          content="배추·양파·삼겹살·계란 등 82개 품목의 오늘 가격. 이맘때 평년과 비교해 지금 사도 되는 값인지 알려드려요."
        />
      <meta property="og:image" content={OG_DEFAULT_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:image" content={OG_DEFAULT_IMAGE} />
      </Head>
      {/* 상단 고정 글래스 — 워드마크 + 검색 입구. 콘텐츠가 아래로 스크롤되며 블러됨 */}
      <GlassHeader onHeight={setTopH}>
        <View style={styles.header}>
          {/* 워드마크는 SVG라 텍스트가 없다 — h1 태그 + aria-label로 시맨틱 제목을 준다(시각 변화 없음) */}
          <View role="heading" aria-level={1} aria-label="이거비싸 — 오늘 장보기 시세">
            <Wordmark />
          </View>
          <Pressable
            onPress={() => setRegionOpen(true)}
            hitSlop={6}
            style={styles.regionPill}
            accessibilityRole="button"
            accessibilityLabel={`지역 ${region}, 변경하기`}
          >
            {/* 메인헤더 location 컴포넌트의 map-pin/fill 아이콘(Figma 1099:7802에서 export) */}
            <Svg width={15} height={18} viewBox="0 0 14 17">
              <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7 0C8.85652 0 10.6374 0.73705 11.9502 2.0498C13.2629 3.36256 14 5.14348 14 7C14 9.2095 12.793 11.3412 11.5439 12.9824C10.2716 14.6541 8.82718 15.9825 8.10449 16.6064C8.08748 16.6211 8.06972 16.6349 8.05176 16.6484C7.74852 16.8765 7.3794 17 7 17C6.6206 17 6.25148 16.8765 5.94824 16.6484C5.93028 16.6349 5.91252 16.6211 5.89551 16.6064C5.17282 15.9825 3.72835 14.6541 2.45605 12.9824C1.20697 11.3412 0 9.2095 0 7C0 5.14348 0.73705 3.36256 2.0498 2.0498C3.36256 0.73705 5.14348 0 7 0ZM7 4.75C5.75736 4.75 4.75 5.75736 4.75 7C4.75 8.24264 5.75736 9.25 7 9.25C8.24264 9.25 9.25 8.24264 9.25 7C9.25 5.75736 8.24264 4.75 7 4.75Z"
                fill={colors.textPrimary}
              />
            </Svg>
            <Text style={styles.regionText}>{region}</Text>
          </Pressable>
        </View>
        <View style={styles.searchWrap}>
          <SearchField editable={false} onPress={() => router.push('/search')} />
        </View>
      </GlassHeader>

      <RegionSheet visible={regionOpen} onClose={() => setRegionOpen(false)} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topH }]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        {/* content-02: grey-50 무대 — 흰 카드들이 배경 대비로 분리 (보더 없음) */}
        <View style={styles.content02}>
        {loading && items.length === 0 ? (
          <ActivityIndicator style={{ marginTop: spacing.s10 }} color={colors.textTertiary} />
        ) : error && items.length === 0 ? (
          <EmptyState title="시세를 불러오지 못했어요" description="아래로 당겨 다시 시도해 보세요" />
        ) : (
          <>
            {hero &&
              (animateEntrance ? (
                <Reanimated.View entering={FadeInDown.duration(300)}>
                  <HeroVerdictCard item={hero} view={viewOf(hero)} animatePrice />
                </Reanimated.View>
              ) : (
                <HeroVerdictCard item={hero} view={viewOf(hero)} />
              ))}

            {notable.length > 0 && (
              <View style={styles.outerCard}>
                <Text style={styles.sectionTitle}>이번 주 주목할 시세</Text>
                <View
                  style={styles.grid}
                  onLayout={(e) => setGridW(e.nativeEvent.layout.width)}
                >
                  {notable.map((i, n) => (
                    <React.Fragment key={itemKey(i)}>
                      {/* 전국 폴백 품목은 맨 뒤에 모여 있다 — 그 묶음 바로 위에 한 번만 안내. Figma 1193:8791 */}
                      {n === firstNationwide && (
                        <RegionNote text={`${region}에선 아래 품목들의 가격을 조사하지 않아,\n전국 평균을 보여드려요.`} />
                      )}
                      {/* 등장 연출은 첫 화면 3줄만 — 전 품목에 n*40ms를 주면 끝 카드가 몇 초 늦게 뜬다 */}
                      {animateEntrance && n < 9 ? (
                        <Reanimated.View entering={FadeInDown.duration(300).delay(60 + n * 40)}>
                          <ThumbnailCard item={i} view={viewOf(i)} width={colW} />
                        </Reanimated.View>
                      ) : (
                        <ThumbnailCard item={i} view={viewOf(i)} width={colW} />
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            )}

            {/* '오후 4시 갱신'이라고 적어뒀었는데 실제와 달랐다(2026-08-26 확인).
                KAMIS 발표 시각은 날마다 다르고, 화면 데이터를 만드는 CI는 17시 넘어 끝난다.
                시각을 단정하는 대신, 지금 보이는 값이 며칠 자인지를 보여준다. */}
            <Text style={styles.source}>
              자료 출처 · KAMIS (한국농수산식품유통공사)
              {surveyDate ? `${'\n'}${surveyDate} 기준` : ''}
            </Text>
            <PrivacyLink />
          </>
        )}

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgSecondary },
  // Figma content-01(853:4131): 검색필드 상·하·좌우 16 패딩
  searchWrap: { padding: spacing.s4 },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: spacing.s4,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  regionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s1,
    // Figma location: 내부 패딩 0, 우측 여백은 헤더 거터(앱 기존 거터 16과 맞춤)
    paddingRight: spacing.s4,
  },
  regionText: { ...type.size[17], ...type.w.semibold, color: colors.textPrimary },
  scroll: { paddingBottom: 140 },
  content01: { padding: spacing.s4, backgroundColor: colors.bgCanvas },
  content02: {
    padding: spacing.s4,
    gap: spacing.s4,
    backgroundColor: colors.bgSecondary,
    flexGrow: 1,
  },

  heroCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.l,
    padding: spacing.s4,
    gap: spacing.s2,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sourceCaption: { flexDirection: 'row', alignItems: 'center', gap: spacing.s1 },
  // Figma media-row: 120 썸네일 + 우측 칼럼(stretch) — 칼럼이 썸네일 높이를 채워 space-between 동작
  heroMediaRow: { flexDirection: 'row', alignItems: 'stretch', gap: spacing.s3 },
  heroThumb: { width: 120, aspectRatio: 1, borderRadius: radius.m, backgroundColor: colors.bgTertiary, overflow: 'hidden' },
  heroPriceCol: { flex: 1, justifyContent: 'space-between', paddingVertical: spacing.s1 }, // Figma title-price py-4
  heroPriceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.s1 },
  verdict: { ...type.size[22], ...type.w.bold, color: colors.textPrimary } as const,
  heroPrice: { ...type.size[28], ...type.w.bold, color: colors.priceNumber } as const,
  captionGrey: { ...type.size[13], ...type.w.regular, color: colors.textTertiary } as const,
  captionSecondary: { ...type.size[13], ...type.w.regular, color: colors.textSecondary } as const,

  outerCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.l,
    padding: spacing.s4,
    gap: spacing.s3,
  },
  sectionTitle: { ...type.size[17], ...type.w.semibold, color: colors.textPrimary } as const,
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s3 },
  // flexGrow 금지 — 마지막 줄 1~2개일 때 칸이 늘어나지 않고 3칸 너비 유지
  thumbCard: { width: '30.5%', gap: spacing.s2 },
  thumbMedia: {
    aspectRatio: 1,
    borderRadius: radius.m,
    backgroundColor: colors.bgTertiary,
    overflow: 'hidden',
  },
  thumbChip: { position: 'absolute', left: spacing.s2, top: spacing.s2 }, // Figma: (8,8) 좌상단
  thumbName: { ...type.size[13], ...type.w.semibold, color: colors.textPrimary } as const,
  thumbPrice: { ...type.size[15], ...type.w.semibold, color: colors.priceNumber } as const,
  thumbUnit: { ...type.size[13], ...type.w.regular, color: colors.priceUnit } as const,
  source: { ...type.size[13], ...type.w.regular, color: colors.textTertiary, textAlign: 'center' } as const,
});
