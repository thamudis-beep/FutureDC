"""Decompose each firm's FY2022 -> latest change in real revenue/FTE.

P = R/H. With R0,H0 at FY2022 and R1,H1 at the latest fiscal year (>= FY2024):
  revenue effect   = R1/H0 − R0/H0   (revenue growth on constant headcount)
  headcount effect = R0/H1 − R0/H0   (headcount change on constant revenue)
  interaction      = ΔP − revenue effect − headcount effect
Headcount changes are tagged with layoffs.fyi events in FY2023..latest when that file
was supplied; otherwise the tag says the source was not available.
Waterfall chart for the 10 largest firms by latest real revenue.
"""
from __future__ import annotations

import sys

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from analysis_common import COLORS, load_panel, stamp
from config import FIGURES_DIR, RESULTS_DIR

BASE = 2022


def main(argv=None) -> int:
    df = load_panel()
    rows = []
    for t, g in df.groupby("ticker"):
        b = g[g.fiscal_year == BASE]
        l = g[g.fiscal_year >= 2024].sort_values("fiscal_year")
        if b.empty or l.empty:
            continue
        b, l = b.iloc[0], l.iloc[-1]
        R0, H0, R1, H1 = b.revenue_real, b.headcount, l.revenue_real, l.headcount
        P0, P1 = R0 / H0, R1 / H1
        rev_eff = R1 / H0 - P0
        hc_eff = R0 / H1 - P0
        inter = (P1 - P0) - rev_eff - hc_eff
        span = g[g.fiscal_year.between(BASE + 1, int(l.fiscal_year))]
        ev = span.layoff_events.sum(min_count=1) if "layoff_events" in span else np.nan
        tot = span.layoff_total.sum(min_count=1) if "layoff_total" in span else np.nan
        if pd.isna(ev):
            tag = "layoffs.fyi not supplied" if df.layoff_events.isna().all() else "no layoffs.fyi record (attrition / freeze / not tracked)"
        else:
            tag = f"layoffs.fyi: {int(ev)} events, {tot:,.0f} reported laid off" if pd.notna(tot) else f"layoffs.fyi: {int(ev)} events"
        rows.append({"ticker": t, "cohort": b.cohort, "base_year": BASE, "latest_year": int(l.fiscal_year),
                     "rev_per_fte_base": P0, "rev_per_fte_latest": P1, "change": P1 - P0, "pct_change": P1 / P0 - 1,
                     "revenue_effect": rev_eff, "headcount_effect": hc_eff, "interaction": inter,
                     "headcount_base": H0, "headcount_latest": H1, "headcount_pct": H1 / H0 - 1,
                     "revenue_latest_real": R1, "headcount_tag": tag})
    res = pd.DataFrame(rows).sort_values("revenue_latest_real", ascending=False)
    res.to_csv(RESULTS_DIR / "decomposition.csv", index=False)

    top = res.head(10)
    n = len(top)
    if n:
        fig, axes = plt.subplots(2, 5, figsize=(14, 6))
        for ax, r in zip(axes.flat, top.itertuples()):
            steps = [("FY22", r.rev_per_fte_base, "#7f7f7f"), ("rev", r.revenue_effect, "#4f81bd"),
                     ("heads", r.headcount_effect, "#c0504d"), ("inter.", r.interaction, "#9bbb59"),
                     (f"FY{str(r.latest_year)[2:]}", r.rev_per_fte_latest, COLORS[r.cohort])]
            cum = 0.0
            for i, (lab, v, col) in enumerate(steps):
                if i in (0, 4):
                    ax.bar(i, v / 1e6, color=col)
                    cum = v
                else:
                    ax.bar(i, v / 1e6, bottom=cum / 1e6, color=col)
                    cum += v
            ax.set_xticks(range(5), [s[0] for s in steps], fontsize=7)
            ax.set_title(f"{r.ticker}  {r.pct_change:+.0%}  (heads {r.headcount_pct:+.0%})", fontsize=8)
            ax.text(0.02, 0.97, r.headcount_tag, transform=ax.transAxes, fontsize=5.5, va="top", color="#555")
        for ax in list(axes.flat)[n:]:
            ax.axis("off")
        axes[0, 0].set_ylabel("real revenue / FTE, 2024 $M")
        fig.suptitle(f"Revenue/FTE change FY{BASE} → latest, split into revenue growth at constant headcount, headcount change at constant revenue, interaction", fontsize=9)
        stamp(fig, "Source: SEC EDGAR companyfacts + 10-K headcount; FRED PCEPI; layoffs.fyi where supplied.")
        fig.tight_layout()
        fig.savefig(FIGURES_DIR / "decomposition_waterfall.png")
        plt.close(fig)
    with pd.option_context("display.width", 220, "display.float_format", "{:,.0f}".format):
        print(res[["ticker", "cohort", "latest_year", "rev_per_fte_base", "rev_per_fte_latest", "revenue_effect",
                   "headcount_effect", "interaction", "headcount_tag"]].to_string(index=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
