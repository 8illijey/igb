#!/usr/bin/env python3
"""다품목 백테스트 — '단순예측(flat)을 실제로 이기는 품목이 몇 %인가'를 측정.
의존성 없음. 실행: cd mobile && python3 scripts/forecast_backtest_all.py

모델 후보(전부 1년 시계열로 추정 가능, 정직):
  naive  : 14일간 오늘가 유지(베이스라인)
  rev    : 평균 회귀 — anchor=최근60일평균, dev에 AR(1) φ 추정 → anchor로 수렴
  trend  : 추세 — 최근 14일 기울기 외삽(감쇠)
판정: rev/trend 중 최소 MAE가 naive MAE의 90% 미만이면 confident(이 품목은 예측 가치 있음).
산출: 품목별 MAE 비교 + 전체 confident 비율 + 방향(BEST/WAIT) 분포.
"""
import json, math, os, re, urllib.parse, urllib.request
from datetime import date, timedelta

BASE = "https://www.kamis.or.kr/service/price/xml.do"
CATS = ["100", "200", "400", "500"]
HORIZON, ORIGINS = 14, 30


def load_env():
    env = open(os.path.join(os.path.dirname(__file__), "..", ".env"), encoding="utf-8").read()
    g = lambda k: (re.search(k + r"=(.*)", env).group(1).strip() if re.search(k + r"=(.*)", env) else "")
    return g("EXPO_PUBLIC_KAMIS_KEY"), g("EXPO_PUBLIC_KAMIS_ID")


KEY, ID = load_env()


def fetch(action, timeout=20, **params):
    qs = urllib.parse.urlencode({"p_cert_key": KEY, "p_cert_id": ID, "p_returntype": "json", "action": action, **params})
    try:
        with urllib.request.urlopen(f"{BASE}?{qs}", timeout=timeout) as r:
            return json.loads(r.read().decode("utf-8"))
    except Exception:
        return {}


def parse_price(v):
    if not isinstance(v, str) or v in ("-", "", "0"):
        return None
    try:
        return float(v.replace(",", ""))
    except ValueError:
        return None


def items_of(j):
    """KAMIS 응답에서 item 배열을 안전 추출 — data가 dict/list, item이 단일객체인 경우 모두 처리."""
    d = j.get("data") if isinstance(j, dict) else None
    if isinstance(d, dict):
        it = d.get("item")
        if isinstance(it, list):
            return it
        if isinstance(it, dict):
            return [it]
    return []


def enumerate_items():
    """4개 부류 당일 목록 → (cat,itemCode,kindCode,name) 대표 1건씩(itemCode-kindCode 중복 제거)."""
    today = date.today().isoformat()
    seen, items = set(), []
    for cat in CATS:
        j = fetch("dailyPriceByCategoryList", p_product_cls_code="01", p_country_code="1101",
                  p_regday=today, p_convert_kg_yn="N", p_item_category_code=cat)
        for r in items_of(j):
            ic, kc = str(r.get("item_code", "")), str(r.get("kind_code", "00"))
            if not ic or (ic, kc) in seen:
                continue
            seen.add((ic, kc))
            items.append((cat, ic, kc, str(r.get("item_name", "")), str(r.get("kind_name", ""))))
    return items


def get_series(cat, ic, kc):
    today = date.today()
    start = today - timedelta(days=365)
    ranks = ["1", "2"] if cat == "500" else ["04", "05", "01"]
    for rank in ranks:
        j = fetch("periodProductList", timeout=15, p_productclscode="01",
                  p_startday=start.isoformat(), p_endday=today.isoformat(),
                  p_itemcategorycode=cat, p_itemcode=ic, p_kindcode=kc,
                  p_productrankcode=rank, p_countycode="1101", p_convert_kg_yn="N")
        rows = [r for r in items_of(j) if r.get("countyname") == "평균"]
        pr = [parse_price(r.get("price")) for r in rows]
        pr = [p for p in pr if p is not None]
        if len(pr) >= 90:
            return pr
    return None


# ---- 모델 (입력 hist=과거 가격 리스트, 반환 14일 후 예측가) ----
def f_naive(h):
    return h[-1]


def f_rev(h):
    win = h[-60:] if len(h) >= 60 else h
    anchor = sum(win) / len(win)
    dev = [x - anchor for x in h]
    num = sum(dev[t] * dev[t - 1] for t in range(1, len(dev)))
    den = sum(dev[t - 1] ** 2 for t in range(1, len(dev)))
    phi = max(0.0, min(0.98, num / den)) if den > 0 else 0.0
    return anchor + (phi ** HORIZON) * (h[-1] - anchor)


def f_trend(h):
    n = min(14, len(h))
    seg = h[-n:]
    slope = (seg[-1] - seg[0]) / (n - 1) if n > 1 else 0.0
    # 감쇠 외삽
    val, damp = h[-1], 0.9
    for i in range(HORIZON):
        val += slope * (damp ** i)
    return val


MODELS = {"naive": f_naive, "rev": f_rev, "trend": f_trend}


def backtest(series):
    n = len(series)
    errs = {k: [] for k in MODELS}
    lo = max(HORIZON + 2, n - HORIZON - ORIGINS)
    for o in range(lo, n - HORIZON):
        hist, actual = series[: o + 1], series[o + HORIZON]
        for k, f in MODELS.items():
            errs[k].append(abs(f(hist) - actual) / actual)
    if not errs["naive"]:
        return None
    return {k: sum(v) / len(v) for k, v in errs.items()}


def main():
    print("품목 수집 중…")
    items = enumerate_items()
    print(f"  {len(items)}개 품목. 백테스트 시작(품목당 1년 시계열 수집)…\n")
    rows, confident = [], 0
    for i, (cat, ic, kc, name, kind) in enumerate(items):
        s = get_series(cat, ic, kc)
        if not s or len(s) < HORIZON + ORIGINS + 5:
            continue
        mae = backtest(s)
        if not mae:
            continue
        best = min(("rev", "trend"), key=lambda k: mae[k])
        is_conf = mae[best] < mae["naive"] * 0.9
        if is_conf:
            confident += 1
            f14 = MODELS[best](s)
            chg = (f14 - s[-1]) / s[-1]
            direction = "BEST↑" if chg > 0.02 else "WAIT↓" if chg < -0.02 else "FAIR–"
        else:
            direction = "—"
        rows.append((name, mae["naive"], mae["rev"], mae["trend"], best, is_conf, direction))
        flag = "✅" if is_conf else "  "
        print(f"{flag} {name[:10]:10s} naive {mae['naive']*100:5.1f}% | rev {mae['rev']*100:5.1f}% | trend {mae['trend']*100:5.1f}% | {direction}")

    print(f"\n=== 요약 ===")
    print(f"백테스트 품목 {len(rows)}개 중 confident(단순을 10%+ 이긴) {confident}개 = {confident/max(len(rows),1)*100:.0f}%")
    conf_rows = [r for r in rows if r[5]]
    if conf_rows:
        from collections import Counter
        c = Counter(r[6] for r in conf_rows)
        print(f"방향 분포: {dict(c)}")
    print("\n해석: confident 비율이 의미 있으면(예: 20%+) 그 품목만 BEST/WAIT 노출 → 진짜 예측.")
    print("      거의 0이면 14일 점예측은 품목 불문 비현실적 → '전망+예년 맥락'으로 재설계 권장.")


if __name__ == "__main__":
    main()
