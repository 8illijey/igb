#!/usr/bin/env python3
"""날씨 신호 테스트 — '지나간 날씨(시차)가 14일 뒤 가격과 상관이 있나'.
양파(245) 가격 + 목포(165) 기상청 ASOS 일자료를 날짜로 매칭, 시차 날씨 피처와
'앞으로 14일 가격 변화율'의 상관(Pearson)을 본다. 상관이 0 근처면 날씨 무용.
필요: .env 에 KMA_SERVICE_KEY (data.go.kr 디코딩 키).
실행: cd mobile && python3 scripts/weather_signal_test.py
"""
import json, math, os, re, urllib.parse, urllib.request
from datetime import date, timedelta

def load_env():
    env = open(os.path.join(os.path.dirname(__file__), "..", ".env"), encoding="utf-8").read()
    g = lambda k: (re.search(k + r"=(.*)", env).group(1).strip() if re.search(k + r"=(.*)", env) else "")
    return g("EXPO_PUBLIC_KAMIS_KEY"), g("EXPO_PUBLIC_KAMIS_ID"), g("KMA_SERVICE_KEY")

KAMIS_KEY, KAMIS_ID, KMA_KEY = load_env()
KAMIS = "https://www.kamis.or.kr/service/price/xml.do"
ASOS = "http://apis.data.go.kr/1360000/AsosDalyInfoService/getWthrDataList"
STN = "165"   # 목포 (전남 양파 산지 인근)

def get_json(url, timeout=30):
    # data.go.kr WAF가 기본 파이썬 UA를 403으로 막아 — 브라우저 UA 헤더를 붙인다
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))

def parse_price(v):
    if not isinstance(v, str) or v in ("-", "", "0"):
        return None
    try: return float(v.replace(",", ""))
    except ValueError: return None

# ---- 가격(양파) 1년 일별, 날짜 풀(YYYY-MM-DD) 복원 ----
def get_price():
    today = date.today(); start = today - timedelta(days=365)
    qs = urllib.parse.urlencode({"p_cert_key": KAMIS_KEY, "p_cert_id": KAMIS_ID, "p_returntype": "json",
        "action": "periodProductList", "p_productclscode": "01", "p_startday": start.isoformat(),
        "p_endday": today.isoformat(), "p_itemcategorycode": "200", "p_itemcode": "245",
        "p_kindcode": "00", "p_productrankcode": "04", "p_countycode": "1101", "p_convert_kg_yn": "N"})
    j = get_json(f"{KAMIS}?{qs}")
    d = j.get("data"); rows = d.get("item", []) if isinstance(d, dict) else []
    out, yr, prev_m = {}, start.year, None
    for r in rows:
        if r.get("countyname") != "평균": continue
        p = parse_price(r.get("price"))
        if p is None: continue
        mm, dd = map(int, str(r.get("regday")).split("/"))
        if prev_m is not None and mm < prev_m: yr += 1
        prev_m = mm
        out[date(yr, mm, dd)] = p
    return out

# ---- 날씨(목포) 1년 일별: 강수합·평균기온·최고/최저 ----
def get_weather():
    end = date.today() - timedelta(days=1)  # ASOS 일자료는 전날까지만 제공
    start = end - timedelta(days=380)
    qs = urllib.parse.urlencode({"serviceKey": KMA_KEY, "pageNo": "1", "numOfRows": "999",
        "dataType": "JSON", "dataCd": "ASOS", "dateCd": "DAY",
        "startDt": start.strftime("%Y%m%d"), "endDt": end.strftime("%Y%m%d"), "stnIds": STN})
    j = get_json(f"{ASOS}?{qs}")
    try:
        items = j["response"]["body"]["items"]["item"]
    except Exception:
        print("기상청 응답 이상 — 키/신청 확인 필요. 원응답 앞부분:")
        print(json.dumps(j)[:400]); return None
    w = {}
    for it in items:
        try: dt = date.fromisoformat(it["tm"])
        except Exception: continue
        def f(k):
            v = it.get(k, "");
            return float(v) if v not in ("", None) else 0.0
        w[dt] = {"rain": f("sumRn"), "ta": f("avgTa"), "tmax": f("maxTa"), "tmin": f("minTa")}
    return w

def pearson(xs, ys):
    n = len(xs)
    if n < 10: return None
    mx, my = sum(xs)/n, sum(ys)/n
    cov = sum((x-mx)*(y-my) for x, y in zip(xs, ys))
    vx = sum((x-mx)**2 for x in xs); vy = sum((y-my)**2 for y in ys)
    return cov/math.sqrt(vx*vy) if vx > 0 and vy > 0 else None

def main():
    if not KMA_KEY:
        print("KMA_SERVICE_KEY 없음 — .env 에 추가하세요."); return
    print("가격(양파)·날씨(목포) 수집 중…")
    price, weather = get_price(), get_weather()
    if not weather: return
    days = sorted(set(price) & set(weather))
    print(f"  매칭된 날짜 {len(days)}일")
    if len(days) < 60:
        print("  매칭 부족 — 관측소/기간 확인."); return

    # 시차 날씨 피처(과거) vs 앞으로 14일 수익률
    feats = {"rain_prev7": [], "rain_prev14": [], "rain_7to14ago": [],
             "temp_prev7": [], "hotdays_prev14": [], "tempdrop_prev7": []}
    target = []
    idx = {d: i for i, d in enumerate(days)}
    for i, d in enumerate(days):
        fut = d + timedelta(days=14)
        if fut not in price: continue
        # 과거 윈도우(연속 14일 다 있어야)
        win = [d - timedelta(days=k) for k in range(1, 15)]
        if any(w not in weather for w in win): continue
        rains = [weather[w]["rain"] for w in win]          # w[0]=어제 … w[13]=14일전
        temps = [weather[w]["ta"] for w in win]
        tmaxs = [weather[w]["tmax"] for w in win]
        feats["rain_prev7"].append(sum(rains[:7]))
        feats["rain_prev14"].append(sum(rains))
        feats["rain_7to14ago"].append(sum(rains[7:14]))
        feats["temp_prev7"].append(sum(temps[:7])/7)
        feats["hotdays_prev14"].append(sum(1 for t in tmaxs if t >= 30))
        feats["tempdrop_prev7"].append(sum(temps[:7])/7 - sum(temps[7:14])/7)
        target.append((price[fut] - price[d]) / price[d])

    print(f"  표본 {len(target)}개\n=== 시차 날씨 ↔ 14일 후 가격변화 상관 ===")
    for name, xs in feats.items():
        r = pearson(xs, target)
        mark = "  ← 신호 가능" if r is not None and abs(r) >= 0.25 else ""
        print(f"  {name:16s} r = {r:+.2f}{mark}" if r is not None else f"  {name:16s} r = (계산불가)")
    print("\n해석: |r| 0.25+ 가 있으면 날씨가 14일 가격에 신호 있음 → 본격 모델 가치 있음.")
    print("      전부 0 근처면 1년 데이터선 날씨도 14일 예측에 도움 안 됨(다년 필요).")

if __name__ == "__main__":
    main()
