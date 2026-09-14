"""Capital deepening vs labour productivity, and the COGS pass-through check.

1. Cross-section: Δlog(real revenue/FTE) FY2022→latest regressed on Δlog(real capex/FTE),
   with cohort dummies and HC1 SEs. Scatter with ticker labels.
2. Confound (c): median cost-of-revenue share by year for the software cohort — a rising
   share after 2022 is consistent with AI spend moving from payroll to vendors.
"""
from __future__ import annotations

import json
import sys

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import statsmodels.formula.api as smf

from analysis_common import COLORS, cohort_iter, load_panel, safe_log, stamp
from config import COHORT_LABELS, FIGURES_DIR, RESULTS_DIR

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
        rows.append({"ticker": t, "cohort": b.cohort,
                     "d_log_rev_fte": np.log(l.rev_per_fte_real) - np.log(b.rev_per_fte_real),
                     "d_log_capex_fte": (np.log(l.capex_per_fte_real) - np.log(b.capex_per_fte_real))
                     if (l.capex_per_fte_real > 0 and b.capex_per_fte_real > 0) else np.nan,
                     "d_capex_to_rev": l.capex_to_rev - b.capex_to_rev,
                     "capex_to_rev_latest": l.capex_to_rev})
    cs = pd.DataFrame(rows).dropna(subset=["d_log_rev_fte", "d_log_capex_fte"])
    cs.to_csv(RESULTS_DIR / "capex_vs_productivity.csv", index=False)
    out = {"n": int(len(cs))}
    if len(cs) >= 6:
        m1 = smf.ols("d_log_rev_fte ~ d_log_capex_fte", cs).fit(cov_type="HC1")
        m2 = smf.ols("d_log_rev_fte ~ d_log_capex_fte + C(cohort)", cs).fit(cov_type="HC1")
        for k, m in (("pooled", m1), ("cohort_fe", m2)):
            ci = m.conf_int().loc["d_log_capex_fte"]
            out[k] = {"beta": float(m.params["d_log_capex_fte"]), "se": float(m.bse["d_log_capex_fte"]),
                      "p": float(m.pvalues["d_log_capex_fte"]), "lo": float(ci[0]), "hi": float(ci[1]), "r2": float(m.rsquared)}
    (RESULTS_DIR / "capex_vs_productivity.json").write_text(json.dumps(out, indent=1))

    fig, ax = plt.subplots(figsize=(7.5, 5.5))
    for c, label, g in cohort_iter(cs):
        ax.scatter(g.d_log_capex_fte, g.d_log_rev_fte, color=COLORS[c], label=label, s=28)
        for r in g.itertuples():
            ax.annotate(r.ticker, (r.d_log_capex_fte, r.d_log_rev_fte), fontsize=6, xytext=(3, 2), textcoords="offset points")
    if "pooled" in out:
        xs = np.linspace(cs.d_log_capex_fte.min(), cs.d_log_capex_fte.max(), 20)
        b0, b1 = m1.params["Intercept"], m1.params["d_log_capex_fte"]
        ax.plot(xs, b0 + b1 * xs, color="#333", lw=1, ls="--",
                label=f"pooled OLS: β={b1:.2f} (95% CI {out['pooled']['lo']:.2f}, {out['pooled']['hi']:.2f})")
    ax.axhline(0, color="#999", lw=0.6); ax.axvline(0, color="#999", lw=0.6)
    ax.set_xlabel(f"Δ log real capex / FTE, FY{BASE} → latest")
    ax.set_ylabel(f"Δ log real revenue / FTE, FY{BASE} → latest")
    ax.set_title("Is the per-head gain capital deepening?", fontsize=10)
    ax.legend(fontsize=7)
    stamp(fig, "Source: SEC EDGAR companyfacts (PaymentsToAcquirePropertyPlantAndEquipment) + 10-K headcount; FRED PCEPI.")
    fig.tight_layout()
    fig.savefig(FIGURES_DIR / "capex_vs_productivity.png")
    plt.close(fig)

    # COGS share pass-through check
    sw = load_panel(need_headcount=False)
    sw = sw[sw.cogs_share.notna()]
    share = sw.groupby(["cohort", "cal_year"]).cogs_share.median().reset_index()
    share.to_csv(RESULTS_DIR / "cogs_share_by_cohort_year.csv", index=False)
    fig, ax = plt.subplots(figsize=(7, 4))
    for c, label, g in cohort_iter(share):
        g = g.sort_values("cal_year")
        ax.plot(g.cal_year, g.cogs_share, color=COLORS[c], lw=2 if c == "software" else 1, label=label,
                alpha=1 if c == "software" else 0.6)
    ax.axvline(2022.5, color="#333", lw=0.8, ls=":")
    ax.set_ylabel("median cost of revenue / revenue")
    ax.set_title("Pass-through check: cost-of-revenue share by cohort", fontsize=10)
    ax.legend(fontsize=7)
    stamp(fig, "Source: SEC EDGAR companyfacts (CostOfRevenue / Revenues).")
    fig.tight_layout()
    fig.savefig(FIGURES_DIR / "cogs_share.png")
    plt.close(fig)
    print(json.dumps(out, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main())
