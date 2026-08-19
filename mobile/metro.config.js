// Metro 기본 assetExts엔 woff2가 없다 — 웹 폰트를 woff2로 쓰려면 직접 넣어야 한다.
// (Pretendard OTF 4종 6.01MB → woff2 4종 2.99MB. 2026-08-20 첫 로딩 개선)
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
if (!config.resolver.assetExts.includes('woff2')) config.resolver.assetExts.push('woff2');

module.exports = config;
