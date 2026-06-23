#!/usr/bin/env python3
"""가격예측 모델 프로토타입 — 실제 양파(245) 데이터로 v1 모델이 말이 되는지 검증.
의존성 없음(표준 라이브러리만). 실행: cd mobile && python3 scripts/forecast_spike.py

모델 v1 (정직성 우선, 1년+계절 앵커):
  - 계절 성분 = '작년 동기 아날로그': 1년 윈도우의 앞부분(≈오늘-1년)에서 같은 14일 구간이
    어떤 비율로 움직였는지를 오늘 수준에 투영. (KAMIS가 1년치만 주므로 평년/작년이 유일한 계절 신호)
  - 변동성 = 최근 60일 일간 로그수익률 표준편차 → 호라이즌별 구간 → 확률(lognormal CDF).
  - 방향: 14일 후 예측 vs 오늘 (±2% deadband). 하락이면 WAIT, 상승이면 BEST, 그 사이 FAIR.
  - confident: 최근 30개 시점 rolling 백테스트에서 모델 MAE < 단순(flat) MAE 일 때만 True.
    "예측이 단순 추정도 못 이기면 자신없음 → 숨긴다."
"""
import json
import math
import os
import re
import urllib.parse
import urllib.request
from datetime import date, timedelta

BASE = "https://www.kamis.or.kr/service/price/xml.do"


def load_env():
    p = os.path.join(os.path.dirname(__file__), "..", ".env")
    env = open(p, encoding="utf-8").read()

    def g(k):
        m = re.search(k + r"=(.*)", env)
        return m.group(1).strip() if m else ""

    return g("EXPO_PUBLIC_KAMIS_KEY"), g("EXPO_PUBLIC_KAMIS_ID")


KEY, ID = load_env()


def fetch(action, **params):
    qs = urllib.parse.urlencode(
        {"p_cert_key": KEY, "p_cert_id": ID, "p_returntype": "json", "action": action, **params}
    )
    with urllib.request.urlopen(f"{BASE}?{qs}", timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def parse_price(v):
    if not isinstance(v, str) or v in ("-", "", "0"):
        return None
    try:
        return float(v.replace(",", ""))
    except ValueError:
        return None


def get_series():
    """최근 1년 일별 평균가 → [(date, price)] 오름차순. regday가 MM/DD라 연도 복원."""
    today = date.today()
    start = today - timedelta(days=365)
    j = fetch(
        "periodProductList",
        p_productclscode="01",
        p_startday=start.isoformat(),
        p_endday=today.isoformat(),
        p_itemcategorycode="200",
        p_itemcode="245",
        p_kindcode="00",
        p_productrankcode="04",
        p_countycode="1101",
        p_convert_kg_yn="N",
    )
    rows = [r for r in (j.get("data", {}).get("item") or []) if r.get("countyname") == "평균"]
    pts = []
    for r in rows:
        pr = parse_price(r.get("price"))
        if pr is None:
            continue
        pts.append((str(r.get("regday")), pr))
    # MM/DD → 연도 복원: 시작연도부터, 월이 줄면 연도++
    out = []
    yr = start.year
    prev_m = None
    for md, pr in pts:
        mm = int(md.split("/")[0])
        if prev_m is not None and mm < prev_m:
            yr += 1
        prev_m = mm
        dd = int(md.split("/")[1])
        out.append((date(yr, mm, dd), pr))
    out.sort(key=lambda x: x[0])
    return out


def get_pyeon():
    """오늘 평년(dpr7) — 맥락/앵커용(모델 수식엔 직접 안 씀)."""
    j = fetch(
        "dailyPriceByCategoryList",
        p_product_cls_code="01",
        p_country_code="1101",
        p_regday=date.today().isoformat(),
        p_convert_kg_yn="N",
        p_item_category_code="200",
    )
    for r in j.get("data", {}).get("item") or []:
        if str(r.get("item_code")) == "245":
            return parse_price(r.get("dpr7"))
    return None


def norm_cdf(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))


def daily_sigma(prices, win=60):
    rets = [math.log(prices[i] / prices[i - 1]) for i in range(1, len(prices)) if prices[i - 1] > 0]
    rets = rets[-win:]
    if len(rets) < 5:
        return 0.0
    m = sum(rets) / len(rets)
    return math.sqrt(sum((r - m) ** 2 for r in rets) / (len(rets) - 1))


def seasonal_forecast(series, horizon=14):
    """series: [(date,price)] 오름차순. 작년 동기 아날로그를 오늘 수준에 투영."""
    prices = [p for _, p in series]
    today_p = prices[-1]
    # 아날로그 기준: 윈도우 앞부분(≈오늘-1년). 거기서 같은 14일 비율 변화를 가져온다.
    base = 0
    if len(prices) <= horizon + 2:
        return None
    a0 = prices[base]
    path = []
    for h in range(1, horizon + 1):
        ratio = prices[base + h] / a0 if a0 > 0 else 1.0
        path.append(today_p * ratio)
    return today_p, path


def model(series):
    res = seasonal_forecast(series)
    if res is None:
        return None
    today_p, path = res
    prices = [p for _, p in series]
    sig = daily_sigma(prices)
    f14 = path[-1]
    # 구간(80%) + 확률
    sig14 = sig * math.sqrt(14)
    lo = [path[h] * math.exp(-1.2816 * sig * math.sqrt(h + 1)) for h in range(14)]
    hi = [path[h] * math.exp(+1.2816 * sig * math.sqrt(h + 1)) for h in range(14)]
    # P(14일 후 < 오늘) under lognormal(mean=ln f14, sd=sig14)
    p_down = norm_cdf((math.log(today_p) - math.log(f14)) / sig14) if sig14 > 0 else 0.5
    chg = (f14 - today_p) / today_p
    if chg > 0.02:
        direction, prob = "up(BEST)", 1 - p_down
    elif chg < -0.02:
        direction, prob = "down(WAIT)", p_down
    else:
        direction, prob = "flat(FAIR)", max(p_down, 1 - p_down)
    low_day = min(range(14), key=lambda h: path[h]) + 1
    return dict(today=today_p, path=path, lo=lo, hi=hi, f14=f14, chg=chg,
               direction=direction, prob=prob, low_day=low_day, sigma=sig)


def backtest(series, origins=30, horizon=14):
    """rolling-origin: 모델 MAE% vs 단순(flat) MAE%. 모델이 이기면 confident."""
    errs_m, errs_n = [], []
    n = len(series)
    for o in range(n - horizon - origins, n - horizon):
        if o <= horizon + 2:
            continue
        hist = series[:o + 1]
        m = model(hist)
        if not m:
            continue
        actual = series[o + horizon][1]
        errs_m.append(abs(m["path"][-1] - actual) / actual)
        errs_n.append(abs(hist[-1][1] - actual) / actual)  # naive = flat
    if not errs_m:
        return None
    return sum(errs_m) / len(errs_m), sum(errs_n) / len(errs_n)


def main():
    print("KAMIS 양파(245) 1년 시계열 수집 중…")
    series = get_series()
    print(f"  수집 {len(series)}일  {series[0][0]} ~ {series[-1][0]}")
    pyeon = get_pyeon()
    m = model(series)
    if not m:
        print("데이터 부족 — 모델 불가")
        return
    print(f"\n오늘가 {m['today']:.0f}원 | 평년 {pyeon}원 | 일변동성 {m['sigma']*100:.2f}%/일")
    print(f"14일 후 예측 {m['f14']:.0f}원 ({m['chg']*100:+.1f}%) | 방향 {m['direction']} | 확률 {m['prob']*100:.0f}%")
    print(f"최저가 예상일 D+{m['low_day']}")
    print("\n14일 경로 (예측 / 80%구간):")
    for h in range(14):
        print(f"  D+{h+1:2d}  {m['path'][h]:7.0f}  [{m['lo'][h]:7.0f} ~ {m['hi'][h]:7.0f}]")
    bt = backtest(series)
    if bt:
        mae_m, mae_n = bt
        verdict = "✅ confident (모델>단순)" if mae_m < mae_n else "⚠️ 숨김 (단순도 못 이김)"
        print(f"\n백테스트(14일,30시점): 모델 MAE {mae_m*100:.1f}% vs 단순(flat) {mae_n*100:.1f}% → {verdict}")
    else:
        print("\n백테스트 불가(표본 부족)")


if __name__ == "__main__":
    main()
