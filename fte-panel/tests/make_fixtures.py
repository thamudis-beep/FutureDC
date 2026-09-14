"""Generate SYNTHETIC fixtures shaped exactly like the SEC / FRED responses the fetchers cache.

Nothing here is a real financial figure. The generator exists so `make demo` can exercise
every stage of the pipeline — tag fallbacks, quarterly filtering, restatement logging,
10-K/A handling, headcount sentence scoring, the review queue, deflation, the benchmark
check, every analysis script — without network access. Values are chosen so the two
benchmarks in benchmarks.yaml pass for the fixture firms; a third fixture year is made
deliberately ambiguous so the review queue is exercised.

usage: python tests/make_fixtures.py demo/data
"""
from __future__ import annotations

import hashlib
import json
import sys
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))
import yaml  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(sys.argv[1] if len(sys.argv) > 1 else "demo/data")
RAW = OUT / "raw"

ALL = {f["ticker"]: f for f in yaml.safe_load(open(ROOT / "companies.yaml"))["firms"]}

# Synthetic paths (FAKE): revenue in FY2024 (USD), revenue growth, headcount FY2022,
# headcount growth pre-2022 and post-2022, cost share, margin, capex share, SBC share,
# fiscal-year-end (month, day), the noun the filing uses, and whether the firm's
# post-2022 reports are AI-heavy (drives the AI-mention treatment split).
# NVDA/GOOGL are calibrated so the benchmark check passes. Two firms per cohort so every
# analysis script has something to estimate on.
P = {
    "NVDA":  dict(rev24=90e9,  g=0.35, hc22=19_500,  hpre=0.10, hpost=0.08,  cogs=0.30, oi=0.55, capex=0.02, sbc=0.04, fye=(1, 26),  phr="employees",  ai=True),
    "AMD":   dict(rev24=25e9,  g=0.10, hc22=25_000,  hpre=0.12, hpost=0.02,  cogs=0.50, oi=0.10, capex=0.03, sbc=0.05, fye=(12, 28), phr="employees",  ai=False),
    "GOOGL": dict(rev24=350e9, g=0.12, hc22=190_000, hpre=0.14, hpost=-0.04, cogs=0.42, oi=0.30, capex=0.15, sbc=0.06, fye=(12, 31), phr="employees",  ai=True),
    "MSFT":  dict(rev24=245e9, g=0.14, hc22=221_000, hpre=0.08, hpost=0.00,  cogs=0.30, oi=0.44, capex=0.18, sbc=0.04, fye=(6, 30),  phr="people",     ai=True),
    "NFLX":  dict(rev24=39e9,  g=0.15, hc22=12_800,  hpre=0.15, hpost=0.03,  cogs=0.55, oi=0.26, capex=0.01, sbc=0.01, fye=(12, 31), phr="employees",  ai=False),
    "UBER":  dict(rev24=44e9,  g=0.17, hc22=32_800,  hpre=0.10, hpost=-0.02, cogs=0.60, oi=0.06, capex=0.01, sbc=0.05, fye=(12, 31), phr="employees",  ai=True),
    "CRM":   dict(rev24=35e9,  g=0.15, hc22=79_000,  hpre=0.20, hpost=-0.04, cogs=0.25, oi=0.15, capex=0.02, sbc=0.08, fye=(1, 31),  phr="people",     ai=False),
    "NOW":   dict(rev24=11e9,  g=0.23, hc22=20_400,  hpre=0.22, hpost=0.10,  cogs=0.21, oi=0.10, capex=0.06, sbc=0.16, fye=(12, 31), phr="employees",  ai=True),
    "ACN":   dict(rev24=65e9,  g=0.06, hc22=720_000, hpre=0.09, hpost=0.02,  cogs=0.68, oi=0.15, capex=0.01, sbc=0.03, fye=(8, 31),  phr="associates", ai=True),
    "IBM":   dict(rev24=63e9,  g=0.02, hc22=290_000, hpre=-0.03, hpost=-0.01, cogs=0.44, oi=0.15, capex=0.03, sbc=0.02, fye=(12, 31), phr="employees",  ai=False),
    "PG":    dict(rev24=84e9,  g=0.03, hc22=106_000, hpre=0.01, hpost=0.01,  cogs=0.50, oi=0.22, capex=0.04, sbc=0.01, fye=(6, 30),  phr="employees",  ai=False),
    "KO":    dict(rev24=47e9,  g=0.05, hc22=79_000,  hpre=-0.02, hpost=0.00, cogs=0.40, oi=0.28, capex=0.04, sbc=0.01, fye=(12, 31), phr="employees",  ai=False),
}
firms = {t: ALL[t] for t in P}
MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


def meta(path: Path, url: str):
    b = path.read_bytes()
    path.with_suffix(path.suffix + ".meta.json").write_text(json.dumps(
        {"url": url, "fetched_at": "fixture", "status": 200, "bytes": len(b),
         "sha256": hashlib.sha256(b).hexdigest(), "fixture": True}, indent=1))


def fy_end(t: str, fy: int) -> date:
    m, d = P[t]["fye"]
    return date(fy, m, d)


def series(t: str, fy: int) -> dict:
    p = P[t]
    import math
    seed = sum(ord(ch) for ch in t)
    wob_r = 1 + 0.04 * math.sin(1.7 * fy + seed)            # deterministic wobble, ±4%
    wob_h = 1 + 0.03 * math.cos(2.3 * fy + seed)            # ±3%
    rev = p["rev24"] * (1 + p["g"]) ** (fy - 2024) * (wob_r if fy not in (2024, 2025) else 1)
    hc = p["hc22"] * (1 + (p["hpre"] if fy <= 2022 else p["hpost"])) ** (fy - 2022) * (wob_h if fy not in (2024, 2025) else 1)
    return {"revenue": round(rev), "cogs": round(rev * p["cogs"]), "oi": round(rev * p["oi"]),
            "ni": round(rev * p["oi"] * 0.8), "capex": round(rev * p["capex"]), "sbc": round(rev * p["sbc"]),
            "rnd": round(rev * 0.12), "dna": round(rev * 0.05), "hc": int(round(hc, -2)),
            "capex": round(rev * p["capex"] * (1 + 0.5 * math.sin(3.1 * fy + seed)))}


def facts_json(t: str) -> dict:
    cik = int(firms[t]["cik"])
    us: dict[str, list] = {}

    def add(tag, e):
        us.setdefault(tag, []).append(e)

    for fy in range(2015, 2027):
        end = fy_end(t, fy)
        if end > date(2026, 8, 1):
            continue
        start = date(end.year - 1, end.month, end.day) + timedelta(days=1)
        s = series(t, fy)
        accn = f"{cik:010d}-{str(fy)[2:]}-{100000 + fy}"
        filed = (end + timedelta(days=45)).isoformat()
        base = {"start": start.isoformat(), "end": end.isoformat(), "accn": accn, "fy": fy, "fp": "FY", "form": "10-K", "filed": filed}
        rev_tag = ("Revenues" if fy <= 2017 else "RevenueFromContractWithCustomerExcludingAssessedTax") if t != "PG" else "Revenues"
        if t == "CRM" and fy <= 2018:
            rev_tag = "SalesRevenueNet"
        add(rev_tag, {**base, "val": s["revenue"]})
        # the same period re-reported as a comparative in next year's 10-K (restated 0.3% in one year)
        val_next = s["revenue"] * (1.003 if fy == 2019 else 1.0)
        add(rev_tag, {**base, "val": round(val_next), "accn": accn.replace(str(fy)[2:], str(fy + 1)[2:], 1),
                      "fy": fy + 1, "filed": (end + timedelta(days=410)).isoformat()})
        # quarterly and nine-month entries that must be filtered out
        q_end = start + timedelta(days=90)
        add(rev_tag, {"start": start.isoformat(), "end": q_end.isoformat(), "val": round(s["revenue"] / 4),
                      "accn": accn + "Q", "fy": fy, "fp": "Q1", "form": "10-Q", "filed": (q_end + timedelta(days=40)).isoformat()})
        add(rev_tag, {"start": start.isoformat(), "end": (start + timedelta(days=270)).isoformat(), "val": round(s["revenue"] * 0.75),
                      "accn": accn + "Q3", "fy": fy, "fp": "Q3", "form": "10-Q", "filed": (start + timedelta(days=300)).isoformat()})
        cogs_tag = "CostOfRevenue" if t in ("NVDA", "GOOGL", "CRM") else "CostOfGoodsAndServicesSold"
        add(cogs_tag, {**base, "val": s["cogs"]})
        if t != "CRM":                                   # CRM: gross profit must be derived
            add("GrossProfit", {**base, "val": s["revenue"] - s["cogs"]})
        add("OperatingIncomeLoss", {**base, "val": s["oi"]})
        add("NetIncomeLoss", {**base, "val": s["ni"]})
        add("PaymentsToAcquirePropertyPlantAndEquipment", {**base, "val": s["capex"]})
        add("ShareBasedCompensation", {**base, "val": s["sbc"]})
        add("ResearchAndDevelopmentExpense", {**base, "val": s["rnd"]})
        add("DepreciationDepletionAndAmortization", {**base, "val": s["dna"]})
        if fy == 2020:                                   # a 10-K/A duplicate of one year
            add("OperatingIncomeLoss", {**base, "val": s["oi"], "form": "10-K/A", "accn": accn + "A",
                                        "filed": (end + timedelta(days=120)).isoformat()})
    facts = {"us-gaap": {tag: {"label": tag, "description": "SYNTHETIC FIXTURE", "units": {"USD": ents}} for tag, ents in us.items()}}
    if t in ("NVDA", "PG"):                              # dei headcount for cross-check (PG 2021 deliberately 8% off)
        dei = []
        for fy in range(2019, 2026):
            end = fy_end(t, fy)
            hc = series(t, fy)["hc"]
            if t == "PG" and fy == 2021:
                hc = int(hc * 1.08)
            dei.append({"end": end.isoformat(), "val": hc, "accn": f"{cik:010d}-{str(fy)[2:]}-{100000 + fy}", "fy": fy,
                        "fp": "FY", "form": "10-K", "filed": (end + timedelta(days=45)).isoformat()})
        facts["dei"] = {"EntityNumberOfEmployees": {"label": "Entity Number Of Employees", "units": {"pure": dei}}}
    return {"cik": cik, "entityName": f"{t} SYNTHETIC FIXTURE", "facts": facts}


def tenk_html(t: str, fy: int) -> str:
    end = fy_end(t, fy)
    s = series(t, fy)
    prev = series(t, fy - 1)["hc"]
    dstr = f"{MONTH[end.month - 1]} {end.day}, {end.year}"
    pstr = f"{MONTH[end.month - 1]} {end.day}, {end.year - 1}"
    phr = P[t]["phr"]
    ai_n = {2015: 0, 2016: 1, 2017: 2, 2018: 3, 2019: 4, 2020: 5, 2021: 6, 2022: 8}.get(fy, 10 + 12 * (fy - 2022) * (3 if P[t]["ai"] else 1))
    ai = " ".join(["We continue to invest in artificial intelligence, machine learning and generative AI across our products."] * ai_n)
    if t == "ACN":
        sent = f"As of {dstr}, we had approximately {s['hc']:,} employees, compared to approximately {prev:,} as of {pstr}."
    elif t == "CRM":
        sent = f"As of {dstr}, we employed approximately {s['hc']:,} {phr} worldwide, up from approximately {prev:,} as of {pstr}."
    elif t == "PG":
        sent = f"Total number of employees. As of {dstr}, we had approximately {s['hc']:,} employees."
    else:
        sent = f"As of {dstr}, we had {s['hc']:,} {phr} in 35 countries."
    ambiguous = t == "CRM" and fy == 2016
    extra = f" Our total workforce, including approximately 2,500 contractors, was approximately {int(s['hc'] * 1.12):,} people as of {dstr}." if ambiguous else ""
    return f"""<html><head><title>{t} 10-K FY{fy} SYNTHETIC</title><style>p{{margin:0}}</style></head><body>
<div>TABLE OF CONTENTS</div><table><tr><td>Item 1.</td><td>Business</td><td>3</td></tr><tr><td></td><td>Human Capital</td><td>9</td></tr>
<tr><td>Item 1A.</td><td>Risk Factors</td><td>12</td></tr></table>
<p><b>PART I</b></p><p><b>Item 1. Business</b></p>
<p>SYNTHETIC FIXTURE. {t} designs, builds and sells things. Revenue in fiscal {fy} was ${s['revenue']/1e9:,.1f}&nbsp;billion. {ai}</p>
<p>We operate 42 offices totaling approximately 6,000,000 square feet and serve approximately 250,000 customers.</p>
<p><b>Human Capital Resources</b></p>
<p>{sent}{extra} We also engage contractors and temporary workers for certain functions. Approximately 45% of our employees are in engineering.</p>
<p>Employee headcount increased by {s['hc'] - prev:,} during fiscal {fy}.</p>
<p><b>Item 5. Market for Registrant's Common Equity</b></p>
<p>As of {dstr}, there were approximately 3,100 stockholders of record of our common stock.</p>
</body></html>"""


def submissions_json(t: str) -> dict:
    cik = int(firms[t]["cik"])
    rec = {k: [] for k in ("accessionNumber", "filingDate", "reportDate", "form", "primaryDocument", "primaryDocDescription")}

    def add(accn, filed, rd, form, doc):
        rec["accessionNumber"].append(accn); rec["filingDate"].append(filed); rec["reportDate"].append(rd)
        rec["form"].append(form); rec["primaryDocument"].append(doc); rec["primaryDocDescription"].append(form)

    for fy in range(2015, 2027):
        end = fy_end(t, fy)
        if end > date(2026, 8, 1):
            continue
        accn = f"{cik:010d}-{str(fy)[2:]}-{100000 + fy}"
        add(accn, (end + timedelta(days=45)).isoformat(), end.isoformat(), "10-K", f"{t.lower()}-10k-{fy}.htm")
        add(accn + "Q", (end + timedelta(days=130)).isoformat(), (end + timedelta(days=90)).isoformat(), "10-Q", f"{t.lower()}-10q.htm")
        add(accn + "8", (end + timedelta(days=10)).isoformat(), end.isoformat(), "8-K", "ex99.htm")
        if fy == 2020:
            add(accn + "A", (end + timedelta(days=120)).isoformat(), end.isoformat(), "10-K/A", f"{t.lower()}-10ka-{fy}.htm")
    return {"cik": f"{cik:010d}", "name": f"{t} SYNTHETIC", "filings": {"recent": rec, "files": []}}


def fred_csv(series_id: str, base: float, rate: float) -> str:
    lines = ["observation_date," + series_id]
    d = date(2014, 1, 1)
    i = 0
    while d <= date(2026, 8, 1):
        lines.append(f"{d.isoformat()},{base * (1 + rate) ** (i / 12):.3f}")
        i += 1
        d = date(d.year + (d.month == 12), d.month % 12 + 1, 1)
    return "\n".join(lines) + "\n"


def main():
    RAW.mkdir(parents=True, exist_ok=True)
    p = RAW / "sec" / "company_tickers.json"
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps({str(i): {"cik_str": int(f["cik"]), "ticker": t, "title": f"{t} SYNTHETIC"} for i, (t, f) in enumerate(firms.items())}))
    meta(p, "https://www.sec.gov/files/company_tickers.json")
    for t, f in firms.items():
        cik = f["cik"]
        p = RAW / "companyfacts" / f"CIK{cik}.json"
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(json.dumps(facts_json(t)))
        meta(p, f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json")
        p = RAW / "submissions" / f"CIK{cik}.json"
        p.parent.mkdir(parents=True, exist_ok=True)
        sub = submissions_json(t)
        p.write_text(json.dumps(sub))
        meta(p, f"https://data.sec.gov/submissions/CIK{cik}.json")
        for accn, form, doc, rd in zip(sub["filings"]["recent"]["accessionNumber"], sub["filings"]["recent"]["form"],
                                       sub["filings"]["recent"]["primaryDocument"], sub["filings"]["recent"]["reportDate"]):
            if form not in ("10-K", "10-K/A"):
                continue
            fp = RAW / "filings" / t / f"{accn}_{doc}"
            fp.parent.mkdir(parents=True, exist_ok=True)
            fp.write_text(tenk_html(t, int(rd[:4])))
            meta(fp, f"https://www.sec.gov/Archives/edgar/data/{int(cik)}/{accn.replace('-', '')}/{doc}")
    for sid, base, rate in (("PCEPI", 100.0, 0.025), ("CPIAUCSL", 235.0, 0.03)):
        p = RAW / "fred" / f"{sid}.csv"
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(fred_csv(sid, base, rate))
        meta(p, f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={sid}")
    demo_yaml = OUT.parent / "companies_demo.yaml"
    demo_yaml.write_text("# SYNTHETIC demo subset of companies.yaml (same tickers/CIKs, fixture data)\n" +
                         yaml.safe_dump({"firms": list(firms.values())}, sort_keys=False))
    print(f"synthetic fixtures for {list(firms)} written under {RAW}; sample file {demo_yaml}")


if __name__ == "__main__":
    main()
