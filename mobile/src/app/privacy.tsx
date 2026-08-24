import Head from 'expo-router/head';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OG_DEFAULT_IMAGE } from '../og';
import { colors, radius, spacing, type } from '../theme/tokens';

/**
 * 개인정보 처리방침.
 *
 * 실제로 하는 것만 적는다 — 회원가입도, 서버에 남기는 개인정보도 없다.
 * 수집은 방문 통계(GA4) 하나뿐이고, 관심목록은 기기 안에만 있다.
 * 없는 절차를 형식적으로 써넣으면 그게 곧 거짓 고지가 된다.
 */
const UPDATED = '2026년 8월 25일';
const CONTACT = 'designerxyzi@gmail.com';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.h2}>{title}</Text>
      {children}
    </View>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <Text style={styles.body}>{children}</Text>;
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.li}>
      <Text style={styles.bullet}>·</Text>
      <Text style={styles.body}>{children}</Text>
    </View>
  );
}

export default function Privacy() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const title = '개인정보 처리방침 | 이거비싸?';
  const desc =
    '이거비싸?는 회원가입 없이 이용할 수 있고, 이름·연락처 같은 개인정보를 받지 않습니다. 수집하는 항목과 이유를 정리했습니다.';

  return (
    <View style={styles.screen}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href="https://igeobissa.com/privacy" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content="https://igeobissa.com/privacy" />
        <meta property="og:image" content={OG_DEFAULT_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={desc} />
        <meta name="twitter:image" content={OG_DEFAULT_IMAGE} />
      </Head>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.s5 }]}>
        <Text style={styles.h1}>개인정보 처리방침</Text>
        <Text style={styles.updated}>최종 수정 {UPDATED}</Text>

        <View style={styles.callout}>
          <Text style={styles.calloutText}>
            이거비싸?는 회원가입이 없습니다. 이름·전화번호·이메일 같은 개인정보를 받지 않고, 서버에
            저장하지도 않습니다.
          </Text>
        </View>

        <Section title="1. 수집하는 항목">
          <P>방문 통계를 위해 Google Analytics를 사용합니다. 이때 다음이 자동으로 수집됩니다.</P>
          <Li>접속한 페이지와 머문 시간</Li>
          <Li>유입 경로 (검색·소셜미디어·직접 접속 등)</Li>
          <Li>기기·브라우저 종류, 대략적인 접속 지역(도시 단위)</Li>
          <Li>Google Analytics가 부여하는 익명 식별자(쿠키)</Li>
          <P>
            이 정보만으로는 개인을 알아볼 수 없습니다. IP 주소는 Google Analytics 4에서 저장 전에
            익명 처리됩니다.
          </P>
        </Section>

        <Section title="2. 수집하는 이유">
          <P>
            어떤 경로로 들어오고 어떤 품목을 많이 보는지 파악해 서비스를 개선하는 데만 씁니다.
            광고에 활용하거나 제3자에게 판매하지 않습니다.
          </P>
        </Section>

        <Section title="3. 기기에만 저장되는 정보">
          <P>
            관심목록과 최근 검색어는 브라우저 저장소에 보관되며 서버로 전송되지 않습니다. 브라우저
            데이터를 삭제하면 함께 사라집니다.
          </P>
        </Section>

        <Section title="4. 보관 기간">
          <P>
            Google Analytics 데이터는 Google 정책에 따라 보관되며, 기본 보관 기간이 지나면 자동으로
            삭제됩니다.
          </P>
        </Section>

        <Section title="5. 수집 거부 방법">
          <P>
            브라우저의 쿠키 차단 설정을 사용하거나, Google이 제공하는 애널리틱스 차단 부가기능을
            설치하면 수집을 막을 수 있습니다. 차단해도 서비스 이용에는 지장이 없습니다.
          </P>
        </Section>

        <Section title="6. 외부 링크">
          <P>
            상품 링크는 쿠팡 파트너스 활동의 일환이며, 이를 통해 일정액의 수수료를 제공받습니다.
            링크를 눌러 이동한 뒤의 개인정보 처리는 해당 사이트의 방침을 따릅니다.
          </P>
        </Section>

        <Section title="7. 시세 정보 출처">
          <P>
            가격은 KAMIS(한국농수산식품유통공사) 농산물유통정보를 기반으로 하며, 실제 판매가와 다를
            수 있습니다. 구매 전 판매처에서 확인해 주세요.
          </P>
        </Section>

        <Section title="8. 문의">
          <P>개인정보 처리에 관한 문의는 아래로 보내주세요.</P>
          <Text style={styles.contact}>{CONTACT}</Text>
        </Section>

        <Pressable
          style={styles.backBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          accessibilityRole="button"
        >
          <Text style={styles.backLabel}>돌아가기</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgCanvas },
  scroll: { paddingHorizontal: spacing.s4, paddingBottom: 80, maxWidth: 480, width: '100%', alignSelf: 'center' },
  h1: { ...type.size[22], ...type.w.bold, color: colors.textPrimary },
  updated: { ...type.size[13], ...type.w.regular, color: colors.textTertiary, marginTop: spacing.s1 },
  callout: {
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.m,
    padding: spacing.s4,
    marginTop: spacing.s5,
  },
  calloutText: { ...type.size[15], ...type.w.semibold, color: colors.textPrimary, lineHeight: 23 },
  section: { marginTop: spacing.s6 },
  h2: { ...type.size[16], ...type.w.bold, color: colors.textPrimary, marginBottom: spacing.s2 },
  body: { ...type.size[15], ...type.w.regular, color: colors.textSecondary, lineHeight: 24, flex: 1 },
  li: { flexDirection: 'row', gap: spacing.s2, marginBottom: spacing.s1 },
  bullet: { ...type.size[15], color: colors.textTertiary },
  contact: { ...type.size[15], ...type.w.semibold, color: colors.textPrimary, marginTop: spacing.s2 },
  backBtn: {
    marginTop: spacing.s8,
    paddingVertical: spacing.s3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    alignItems: 'center',
  },
  backLabel: { ...type.size[15], ...type.w.semibold, color: colors.textPrimary },
});
