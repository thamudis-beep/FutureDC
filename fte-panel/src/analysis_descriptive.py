"""Cohort medians and IQR of each per-FTE metric by calendar-aligned year, indexed 2019=100.

Each firm is indexed to its own 2019 value first (so size does not dominate), then the
cohort median / quartiles are taken across firms. Firms without a positive 2019 value
are excluded from that metric's index and counted in the `n_excluded` column.
Also writes a levels chart (median real $ per FTE) for revenue and operating income.
"""
from __future__ import annotations

import sys

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from analysis_common import COLORS, cohort_iter, load_panel, stamp
from config import COHORTS, COHORT_LABELS, FIGURES_DIR, INDEX_BASE_YEAR, RESULTS_DIR

METRICS = {
    "rev_per_fte_real": "Revenue / FTE (real 2024 $)",
    "gp_per_fte_real": "Gross profit / FTE (real 2024 $)",
    "oi_per_fte_real": "Operating income / FTE (real 2024 $)",
    "ebitda_per_fte_real": "EBITDA / FTE (real 2024 $)",
    "va_per_fte_real": "(Revenue − COGS − capex) / FTE (real 2024 $)",
    "capex_per_fte_real": "Capex / FTE (real 2024 $)",
    "sbc_per_fte_real": "SBC / FTE (real 2024 $)",
}


def cohort_index(df: pd.DataFrame, metric: str) -> pd.DataFrame:
    rows = []
    for c, label, g in cohort_iter(df):
        base = g[g.cal_year == INDEX_BASE_YEAR].set_index("ticker")[metric]
        base = base[base > 0]
        excluded = g.ticker.nunique() - len(base)
        gi = g[g.ticker.isin(base.index)].copy()
        gi["idx"] = 100 * gi[metric] / gi.ticker.map(base)
        for y, gy in gi.groupby("cal_year"):
            v = gy.idx.dropna()
            if len(v) == 0:
                continue
            rows.append({"cohort": c, "metric": metric, "cal_year": int(y), "n": int(len(v)),
                         "n_excluded_no_base": int(excluded), "median": v.median(),
                         "q25": v.quantile(0.25), "q75": v.quantile(0.75)})
    return pd.DataFrame(rows)


def plot_index(idx: pd.DataFrame, metric: str, title: str, path):
    fig, axes = plt.subplots(2, 3, figsize=(11, 6), sharex=True, sharey=True)
    for ax, c in zip(axes.flat, COHORTS):
        d = idx[idx.cohort == c].sort_values("cal_year")
        ax.set_title(COHORT_LABELS[c], fontsize=9)
        if len(d):
            ax.fill_between(d.cal_year, d.q25, d.q75, color=COLORS[c], alpha=0.18, lw=0, label="IQR")
            ax.plot(d.cal_year, d["median"], color=COLORS[c], lw=2, label="median")
            for x, y, n in zip(d.cal_year, d["median"], d.n):
                ax.annotate(f"n={n}", (x, y), fontsize=5.5, color="#555", xytext=(0, 4), textcoords="offset points", ha="center")
        ax.axhline(100, color="#999", lw=0.8, ls="--")
        ax.axvline(2022.5, color="#333", lw=0.8, ls=":")
    axes[0, 0].legend(fontsize=7, loc="upper left")
    fig.suptitle(f"{title} — cohort median and IQR, firm-indexed {INDEX_BASE_YEAR}=100 (dotted line: FY2023 break)", fontsize=10)
    stamp(fig, "Source: SEC EDGAR companyfacts + 10-K headcount sentences; FRED PCEPI. Calendar-aligned fiscal years.")
    fig.tight_layout()
    fig.savefig(path)
    plt.close(fig)


def plot_levels(df: pd.DataFrame, path):
    fig, axes = plt.subplots(1, 2, figsize=(11, 4))
    for ax, (m, lab) in zip(axes, [("rev_per_fte_real", "Revenue / FTE"), ("oi_per_fte_real", "Operating income / FTE")]):
        for c, label, g in cohort_iter(df):
            med = g.groupby("cal_year")[m].median() / 1e6
            ax.plot(med.index, med.values, color=COLORS[c], lw=2, label=label)
        ax.set_title(f"{lab}, cohort median (real 2024 $M)", fontsize=9)
        ax.axvline(2022.5, color="#333", lw=0.8, ls=":")
    axes[0].legend(fontsize=7)
    stamp(fig, "Source: SEC EDGAR companyfacts + 10-K headcount sentences; FRED PCEPI.")
    fig.tight_layout()
    fig.savefig(path)
    plt.close(fig)


def main(argv=None) -> int:
    df = load_panel()
    all_idx = []
    for m, title in METRICS.items():
        idx = cohort_index(df, m)
        all_idx.append(idx)
        if len(idx):
            plot_index(idx, m, title, FIGURES_DIR / f"cohort_index_{m}.png")
    out = pd.concat(all_idx)
    out.to_csv(RESULTS_DIR / "cohort_index.csv", index=False)
    plot_levels(df, FIGURES_DIR / "cohort_levels.png")
    # headline table: median index in the latest year, by cohort, for the memo
    latest = out[out.metric.isin(["rev_per_fte_real", "oi_per_fte_real"])]
    latest = latest.sort_values("cal_year").groupby(["cohort", "metric"]).tail(1)
    latest.to_csv(RESULTS_DIR / "cohort_index_latest.csv", index=False)
    print(out.groupby(["metric", "cohort"]).tail(1).to_string(index=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
