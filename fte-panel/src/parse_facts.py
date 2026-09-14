"""Extract annual financial facts from cached companyfacts JSON.

Output: data/interim/financials.csv, one row per firm-fiscal-year, plus
data/interim/financials_log.csv recording for every value which tag was used, which
filing it came from, and whether other filings reported a different value for the
same period (restatements).

Selection rule for an annual value of a duration concept:
  * fp == 'FY' and form in ANNUAL_FORMS
  * period length 340-380 days (drops quarterly and cumulative-to-date facts)
  * for one period end, prefer the MOST RECENTLY FILED value (restated basis); all
    distinct earlier values are logged with their relative difference.
Tag fallbacks are tried in order per firm-year, so a firm that switched from
SalesRevenueNet to RevenueFromContractWithCustomerExcludingAssessedTax in 2018 gets a
continuous series, with the tag recorded on every row.
"""
from __future__ import annotations

import json
import sys
from datetime import date

import pandas as pd

from config import ANNUAL_FORMS, FIRST_YEAR, INTERIM_DIR, LAST_YEAR, calendar_year, firms_from_args
from fetch_facts import facts_path, facts_url

# concept -> ordered list of (taxonomy, tag). First tag with a value for the year wins.
CONCEPTS: dict[str, list[tuple[str, str]]] = {
    "revenue": [
        ("us-gaap", "Revenues"),
        ("us-gaap", "RevenueFromContractWithCustomerExcludingAssessedTax"),
        ("us-gaap", "SalesRevenueNet"),
        ("us-gaap", "RevenueFromContractWithCustomerIncludingAssessedTax"),
        ("us-gaap", "SalesRevenueServicesNet"),
        ("us-gaap", "SalesRevenueGoodsNet"),
        ("ifrs-full", "Revenue"),
        ("ifrs-full", "RevenueFromContractsWithCustomers"),
    ],
    "cost_of_revenue": [
        ("us-gaap", "CostOfRevenue"),
        ("us-gaap", "CostOfGoodsAndServicesSold"),
        ("us-gaap", "CostOfGoodsSold"),
        ("us-gaap", "CostOfServices"),
        ("us-gaap", "CostOfGoodsAndServiceExcludingDepreciationDepletionAndAmortization"),
        ("ifrs-full", "CostOfSales"),
    ],
    "gross_profit": [("us-gaap", "GrossProfit"), ("ifrs-full", "GrossProfit")],
    "operating_income": [
        ("us-gaap", "OperatingIncomeLoss"),
        ("ifrs-full", "ProfitLossFromOperatingActivities"),
    ],
    "net_income": [
        ("us-gaap", "NetIncomeLoss"),
        ("us-gaap", "ProfitLoss"),
        ("ifrs-full", "ProfitLoss"),
        ("ifrs-full", "ProfitLossAttributableToOwnersOfParent"),
    ],
    "capex": [
        ("us-gaap", "PaymentsToAcquirePropertyPlantAndEquipment"),
        ("us-gaap", "PaymentsToAcquireProductiveAssets"),
        ("us-gaap", "PaymentsToAcquireOtherPropertyPlantAndEquipment"),
        ("ifrs-full", "PurchaseOfPropertyPlantAndEquipmentClassifiedAsInvestingActivities"),
    ],
    "sbc": [
        ("us-gaap", "ShareBasedCompensation"),
        ("us-gaap", "AllocatedShareBasedCompensationExpense"),
        ("ifrs-full", "AdjustmentsForSharebasedPayments"),
    ],
    "rnd": [
        ("us-gaap", "ResearchAndDevelopmentExpense"),
        ("us-gaap", "ResearchAndDevelopmentExpenseExcludingAcquiredInProcessCost"),
        ("ifrs-full", "ResearchAndDevelopmentExpense"),
    ],
    "dna": [
        ("us-gaap", "DepreciationDepletionAndAmortization"),
        ("us-gaap", "DepreciationAndAmortization"),
        ("us-gaap", "DepreciationAmortizationAndAccretionNet"),
        ("us-gaap", "Depreciation"),
        ("ifrs-full", "DepreciationAndAmortisationExpense"),
    ],
}
# instant concept, used only to cross-check the parsed 10-K headcount
DEI_EMPLOYEES = ("dei", "EntityNumberOfEmployees")


def _days(a: str, b: str) -> int:
    return (date.fromisoformat(b) - date.fromisoformat(a)).days


def _annual_entries(units: dict, *, duration: bool) -> tuple[str, list[dict]]:
    """Pick the unit (prefer USD, else the single unit present) and filter to annual facts."""
    if not units:
        return "", []
    unit = "USD" if "USD" in units else ("pure" if "pure" in units else sorted(units)[0])
    out = []
    for e in units[unit]:
        if e.get("fp") != "FY" or e.get("form") not in ANNUAL_FORMS:
            continue
        if duration:
            if not e.get("start") or not (340 <= _days(e["start"], e["end"]) <= 380):
                continue
        out.append(e)
    return unit, out


def _pick_latest(entries: list[dict]) -> dict[str, dict]:
    """Group by period end; keep the most recently filed value and log variants."""
    by_end: dict[str, list[dict]] = {}
    for e in entries:
        by_end.setdefault(e["end"], []).append(e)
    picked = {}
    for end, es in by_end.items():
        es = sorted(es, key=lambda x: (x["filed"], x.get("accn", "")))
        chosen = es[-1]
        vals = sorted({float(x["val"]) for x in es})
        max_dev = 0.0
        if len(vals) > 1 and chosen["val"] not in (0, None):
            max_dev = max(abs(v - float(chosen["val"])) / abs(float(chosen["val"])) for v in vals)
        picked[end] = {**chosen, "n_variants": len(vals), "max_rel_dev": max_dev}
    return picked


def parse_one(firm: dict) -> tuple[list[dict], list[dict]]:
    cik = firm["cik"]
    p = facts_path(cik)
    if not p.exists():
        raise FileNotFoundError(f"{firm['ticker']}: {p} missing — run fetch_facts first")
    facts = json.loads(p.read_text())["facts"]
    url = facts_url(cik)

    series: dict[str, dict[str, dict]] = {}     # concept -> end -> entry
    for concept, tags in CONCEPTS.items():
        merged: dict[str, dict] = {}
        for taxo, tag in tags:
            units = facts.get(taxo, {}).get(tag, {}).get("units", {})
            unit, ents = _annual_entries(units, duration=True)
            for end, e in _pick_latest(ents).items():
                if end not in merged:            # earlier tag in priority order wins
                    merged[end] = {**e, "tag": f"{taxo}:{tag}", "unit": unit}
                else:                            # log disagreement between tags
                    a, b = float(merged[end]["val"]), float(e["val"])
                    if a and abs(a - b) / abs(a) > 0.01:
                        merged[end].setdefault("alt_tags", []).append(
                            {"tag": f"{taxo}:{tag}", "val": b, "rel_diff": abs(a - b) / abs(a)})
        series[concept] = merged

    dei_units = facts.get("dei", {}).get("EntityNumberOfEmployees", {}).get("units", {})
    _, dei_ents = _annual_entries(dei_units, duration=False)
    dei_by_end = _pick_latest(dei_ents)

    ends = sorted({end for s in series.values() for end in s})
    rows, log = [], []
    for end in ends:
        fy = int(end[:4])
        if fy < FIRST_YEAR or fy > LAST_YEAR:
            continue
        rev = series["revenue"].get(end)
        if rev is None:
            continue                                   # a year without revenue is not a panel year
        row = {"ticker": firm["ticker"], "cik": cik, "cohort": firm["cohort"],
               "fiscal_year": fy, "fy_end": end, "cal_year": calendar_year(end),
               "fy_start": rev["start"], "currency": rev["unit"],
               "form": rev["form"], "accn": rev.get("accn"), "filed": rev["filed"],
               "source_url": url}
        for concept in CONCEPTS:
            e = series[concept].get(end)
            row[concept] = float(e["val"]) if e else None
            row[f"{concept}_tag"] = e["tag"] if e else None
            if e:
                log.append({"ticker": firm["ticker"], "fy_end": end, "concept": concept,
                            "tag": e["tag"], "unit": e["unit"], "val": float(e["val"]),
                            "form": e["form"], "accn": e.get("accn"), "filed": e["filed"],
                            "n_variants": e["n_variants"], "max_rel_dev": round(e["max_rel_dev"], 4),
                            "alt_tags": json.dumps(e.get("alt_tags", [])) if e.get("alt_tags") else "",
                            "source_url": url})
        # derived gross profit when the tag is absent (banks never have it; then both are None)
        if row["gross_profit"] is None and row["cost_of_revenue"] is not None:
            row["gross_profit"] = row["revenue"] - row["cost_of_revenue"]
            row["gross_profit_tag"] = "derived:revenue-cost_of_revenue"
        # instant headcount from dei, if the filer tagged it (most don't)
        dei = None
        for dend, e in dei_by_end.items():
            if abs(_days(dend, end)) <= 45:
                dei = float(e["val"])
        row["dei_employees"] = dei
        row["fye_month_observed"] = int(end[5:7])
        row["fye_month_yaml"] = firm.get("fye_month")
        rows.append(row)
    return rows, log


def main(argv=None) -> int:
    firms = firms_from_args(argv)
    rows, log, failed = [], [], []
    for f in firms:
        try:
            r, l = parse_one(f)
            if not r:
                failed.append(f"{f['ticker']}: no annual revenue facts found in companyfacts")
            rows += r
            log += l
            print(f"{f['ticker']:6s} {len(r)} fiscal years "
                  f"({min((x['fiscal_year'] for x in r), default='-')}–{max((x['fiscal_year'] for x in r), default='-')})")
        except FileNotFoundError as e:
            failed.append(str(e))
    df = pd.DataFrame(rows).sort_values(["ticker", "fy_end"])
    df.to_csv(INTERIM_DIR / "financials.csv", index=False)
    pd.DataFrame(log).to_csv(INTERIM_DIR / "financials_log.csv", index=False)
    print(f"\nwrote {len(df)} firm-years to {INTERIM_DIR / 'financials.csv'}")
    if failed:
        print("\nPROBLEMS:\n  " + "\n  ".join(failed), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
