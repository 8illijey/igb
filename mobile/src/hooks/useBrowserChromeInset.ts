import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/**
 * 브라우저 UI가 화면 아래를 덮는 높이(px).
 *
 * iOS 사파리의 하단 주소·툴바는 `env(safe-area-inset-bottom)`에 잡히지 않는다.
 * 툴바가 떠 있을 때 safe-area-inset-bottom은 0이라, 하단 고정 요소를 그 값만 보고
 * 배치하면 툴바 뒤에 깔린다(2026-08-24 아이폰 제보 — 탭바가 사파리 툴바에 가려짐).
 *
 * 레이아웃 뷰포트(window.innerHeight)와 실제로 보이는 영역(visualViewport)의 차이가
 * 곧 브라우저 UI가 먹은 높이다. 데스크톱·안드로이드·PWA 홈화면에선 0이 나온다.
 *
 * 키보드가 올라올 때도 visualViewport는 줄어든다. 그때까지 따라 올리면 탭바가
 * 키보드 위로 튀어오르므로, 브라우저 UI 높이로 볼 수 있는 범위(120px)까지만 반영한다.
 */
const MAX_CHROME_HEIGHT = 120;

export function useBrowserChromeInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const vv = window.visualViewport;

    const update = () => {
      const hidden = window.innerHeight - (vv.height + vv.offsetTop);
      setInset(hidden > 0 && hidden <= MAX_CHROME_HEIGHT ? Math.round(hidden) : 0);
    };

    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return inset;
}
