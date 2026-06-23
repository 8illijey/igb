#!/usr/bin/env python3
"""방향 적중률 백테스트 — 이 기능의 진짜 질문: '14일 후 오른다/내린다 방향을 자주 맞히나?'
(금액 MAE가 아니라 방향. 적중률 자체가 정직한 확률 %가 된다.)
실행: cd mobile && python3 scripts/forecast_direction_test.py
"""
import json, math, os, re, urllib.parse, urllib.request
from datetime import date, timedelta

BASE = "https://www.kamis.or.kr/service/price/xml.do"
CATS = ["100", "200", "400", "500"]
HORIZON, ORIGINS = 14, 30
DEADBAND = 0.03  # ±3% 밖일 때만 방향을 '확신'(commit)


def load_env():
    env = open(os.path.join(os.path.dirname(__file__), "..", ".env"), encoding="utf-8").read()
    g = lambda k: (re.search(k + r"=(.*)", env).group(1).strip() if re.search(k + r"=(.*)", env) else "")
    return g("EXPO_PUBLIC_KAMIS_KEY"), g("EXPO_PUBLIC_KAMIS_ID")


KEY, ID = load_env()


def fetch(action, timeout=15, **p):
    qs = urllib.parse.urlencode({"p_cert_key": KEY, "p_cert_id": ID, "p_returntype": "json", "action": action, **p})
    try:
        with urllib.request.urlopen(f"{BASE}?{qs}", timeout=timeout) as r:
            return json.loads(r.read().decode("utf-8"))
    except Exception:
        return {}


def items_of(j):
    d = j.get("data") if isinstance(j, dict) else None
    if isinstance(d, dict):
        it = d.get("item")
        return it if isinstance(it, list) else ([it] if isinstance(it, dict) else [])
    return []


def parse_price(v):
    if not isinstance(v, str) or v in ("-", "", "0"):
        return None
    try:
        return float(v.replace(",", ""))
    except ValueError:
        return None


def enumerate_items():
    today = date.today().isoformat()
    seen, out = set(), []
    for cat in CATS:
        j = fetch("dailyPriceByCategoryList", p_product_cls_code="01", p_country_code="1101",
                  p_regday=today, p_convert_kg_yn="N", p_item_category_code=cat)
        for r in items_of(j):
            ic, kc = str(r.get("item_code", "")), str(r.get("kind_code", "00"))
            if ic and (ic, kc) not in seen:
                seen.add((ic, kc))
                out.append((cat, ic, kc, str(r.get("item_name", ""))))
    return out


def get_series(cat, ic, kc):
    today = date.today(); start = today - timedelta(days=365)
    for rank in (["1", "2"] if cat == "500" else ["04", "05", "01"]):
        j = fetch("periodProductList", p_productclscode="01", p_startday=start.isoformat(),
                  p_endday=today.isoformat(), p_itemcategorycode=cat, p_itemcode=ic, p_kindcode=kc,
                  p_productrankcode=rank, p_countycode="1101", p_convert_kg_yn="N")
        pr = [parse_price(r.get("price")) for r in items_of(j) if r.get("countyname") == "평균"]
        pr = [p for p in pr if p is not None]
        if len(pr) >= 90:
            return pr
    return None


def f_rev(h):
    win = h[-60:] if len(h) >= 60 else h
    a = sum(win) / len(win); dev = [x - a for x in h]
    num = sum(dev[t] * dev[t - 1] for t in range(1, len(dev)))
    den = sum(dev[t - 1] ** 2 for t in range(1, len(dev)))
    phi = max(0.0, min(0.98, num / den)) if den > 0 else 0.0
    return a + (phi ** HORIZON) * (h[-1] - a)


def f_trend(h):
    n = min(14, len(h)); seg = h[-n:]
    slope = (seg[-1] - seg[0]) / (n - 1) if n > 1 else 0.0
    v = h[-1]
    for i in range(HORIZON):
        v += slope * (0.9 ** i)
    return v


def directional(series, f):
    """commit(±3% 밖 예측)했을 때 방향 적중률 + commit 횟수. base = 실제 상승빈도."""
    n = len(series); hit = commit = ups = total = 0
    for o in range(max(HORIZON + 2, n - HORIZON - ORIGINS), n - HORIZON):
        hist, actual = series[: o + 1], series[o + HORIZON]
        chg = (f(hist) - hist[-1]) / hist[-1]
        act = (actual - hist[-1]) / hist[-1]
        total += 1; ups += 1 if act > 0 else 0
        if abs(chg) >= DEADBAND:
            commit += 1
            if (chg > 0) == (act > 0):
                hit += 1
    return hit, commit, ups, total


def main():
    print("품목 수집 중…")
    items = enumerate_items()
    print(f"  {len(items)}개. 방향 적중률 백테스트…\n")
    good = []
    for cat, ic, kc, name in items:
        s = get_series(cat, ic, kc)
        if not s or len(s) < HORIZON + ORIGINS + 5:
            continue
        best = None
        for mname, f in (("rev", f_rev), ("trend", f_trend)):
            hit, commit, ups, total = directional(s, f)
            if commit >= 8:
                rate = hit / commit
                if best is None or rate > best[1]:
                    best = (mname, rate, commit, ups / total)
        if best:
            mname, rate, commit, base = best
            flag = "✅" if rate >= 0.65 else "  "
            good.append((name, rate, commit, base, mname, rate >= 0.65))
            print(f"{flag} {name[:10]:10s} 방향적중 {rate*100:4.0f}% ({commit}회 확신, {mname}) | 실제상승빈도 {base*100:3.0f}%")
    print("\n=== 요약 ===")
    strong = [g for g in good if g[5]]
    print(f"방향 확신 가능 품목 {len(good)}개 중 적중률 65%+ : {len(strong)}개")
    for name, rate, commit, base, mname, _ in sorted(strong, key=lambda x: -x[1]):
        print(f"   {name}: {rate*100:.0f}% (n={commit})")
    print("\n해석: 적중률 65%+ 가 여럿이면 그 품목·그 확률로 BEST/WAIT 정직하게 노출 가능.")
    print("      거의 없거나 50%(동전) 근처면 방향도 예측 불가 → 위치 기반으로.")


if __name__ == "__main__":
    main()
