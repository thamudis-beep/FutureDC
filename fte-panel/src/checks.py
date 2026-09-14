"""Sanity checks on data/panel.csv. Benchmarks in benchmarks.yaml; exit 1 on a miss."""
from __future__ import annotations

import json
import sys

import pandas as pd
import yaml

from config import DATA_DIR, RESULTS_DIR, ROOT, load_firms


def main(argv=None) -> int:
    cfg = yaml.safe_load(open(ROOT / "benchmarks.yaml"))
    df = pd.read_csv(DATA_DIR / "panel.csv")
    firms = {f["ticker"]: f for f in load_firms()}
    report = {"benchmarks": [], "warnings": [], "failures": []}

    for b in cfg["benchmarks"]:
        row = df[(df.ticker == b["ticker"]) & (df.fiscal_year == b["fiscal_year"])]
        rec = dict(b)
        if row.empty or pd.isna(row.iloc[0][b["metric"]]):
            rec.update(actual=None, status="MISSING")
            if b["ticker"] in firms:
                report["failures"].append(f"benchmark {b['ticker']} FY{b['fiscal_year']} {b['metric']}: no value in panel")
        else:
            actual = float(row.iloc[0][b["metric"]]); b["expected"] = float(b["expected"]); b["tolerance"] = float(b["tolerance"])
            dev = abs(actual - b["expected"]) / b["expected"]
            rec.update(actual=actual, deviation=dev, status="OK" if dev <= b["tolerance"] else "FAIL")
            if dev > b["tolerance"]:
                report["failures"].append(
                    f"benchmark {b['ticker']} FY{b['fiscal_year']} {b['metric']} = {actual:,.0f}, "
                    f"expected ~{b['expected']:,.0f} (off by {dev:.0%}, tolerance {b['tolerance']:.0%}). "
                    f"revenue={row.iloc[0].revenue:,.0f} headcount={row.iloc[0].headcount:,.0f} "
                    f"sentence: {row.iloc[0].headcount_sentence!r}")
        report["benchmarks"].append(rec)

    pl = cfg["plausibility"]
    usd = df[df.usd]
    bad = usd[(usd.rev_per_fte < pl["rev_per_fte_min"]) | (usd.rev_per_fte > pl["rev_per_fte_max"])]
    for r in bad.itertuples():
        report["warnings"].append(f"{r.ticker} FY{r.fiscal_year}: rev/FTE {r.rev_per_fte:,.0f} outside plausible band "
                                  f"(headcount {r.headcount:,.0f}; sentence: {r.headcount_sentence!r})")
    cov = df.groupby("ticker").headcount.apply(lambda s: s.notna().mean())
    for t, c in cov[cov < pl["headcount_coverage_min"]].items():
        report["warnings"].append(f"{t}: headcount resolved for only {c:.0%} of fiscal years")
    dei = df[df.headcount_vs_dei_reldiff > pl["headcount_vs_dei_tol"]]
    for r in dei.itertuples():
        report["warnings"].append(f"{r.ticker} FY{r.fiscal_year}: parsed headcount {r.headcount:,.0f} vs "
                                  f"dei:EntityNumberOfEmployees {r.dei_employees:,.0f} ({r.headcount_vs_dei_reldiff:.1%})")
    fye = df[df.fye_month_observed != df.fye_month_yaml].groupby("ticker").fiscal_year.apply(list)
    for t, yrs in fye.items():
        report["warnings"].append(f"{t}: observed fiscal-year-end month differs from companies.yaml in FY{yrs}")
    neg = df[(df.revenue <= 0) | (df.headcount <= 0)]
    for r in neg.itertuples():
        report["failures"].append(f"{r.ticker} FY{r.fiscal_year}: non-positive revenue or headcount")
    for t, g in df.groupby("ticker"):
        yrs = sorted(g.fiscal_year)
        gaps = [y for y in range(yrs[0], yrs[-1]) if y not in yrs]
        if gaps:
            report["warnings"].append(f"{t}: missing fiscal years {gaps}")

    (RESULTS_DIR / "checks.json").write_text(json.dumps(report, indent=1, default=float))
    for b in report["benchmarks"]:
        a = "n/a" if b.get("actual") is None else f"{b['actual']:,.0f}"
        print(f"benchmark {b['ticker']:6s} FY{b['fiscal_year']} {b['metric']:12s} actual {a:>12s} expected ~{b['expected']:,.0f}  {b['status']}")
    for w in report["warnings"]:
        print("WARN ", w)
    for f in report["failures"]:
        print("FAIL ", f, file=sys.stderr)
    print(f"\n{len(report['failures'])} failures, {len(report['warnings'])} warnings -> {RESULTS_DIR / 'checks.json'}")
    return 1 if report["failures"] else 0


if __name__ == "__main__":
    sys.exit(main())
