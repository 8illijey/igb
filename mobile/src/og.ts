/**
 * 기본 공유 카드(홈·검색·레시피·관심목록) 이미지 주소.
 *
 * 카톡·슬랙은 링크를 처음 읽을 때 OG 이미지를 자기 서버에 저장하고, 그 뒤로는
 * 우리 Cache-Control과 무관하게 저장본을 보여준다. 파일만 갈아끼우면 예전 그림이
 * 계속 뜬다 — 주소가 바뀌어야 새로 긁는다.
 *
 * 상세 페이지는 가격이 매일 바뀌니 seo.gen.ts의 SEO_BUILD_DAY를 붙이지만,
 * 이 이미지는 디자인을 고칠 때만 바뀐다. 매일 주소가 흔들리면 공유처가 매일
 * 다시 받아가므로 수동 버전을 쓴다.
 *
 * ⚠️ public/og.png를 교체하면 이 숫자를 반드시 올려라. 안 올리면 반영이 안 된다.
 */
export const OG_IMAGE_VERSION = 2;
export const OG_DEFAULT_IMAGE = `https://igeobissa.com/og.png?v=${OG_IMAGE_VERSION}`;
