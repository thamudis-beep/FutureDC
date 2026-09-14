"""Structural-break tests on per-FTE growth at the FY2023 (calendar-aligned) break.

For each cohort and metric, the unit of observation is the firm-year log growth
g_it = Δ log(metric_it). The model is g = a + b·overhire_2022_i + e, where the
overhiring residual is the firm's FY2022 deviation from its 2015-2019 log-headcount trend.

  * Chow test at 2023: F-test that (a, b) are the same before and after the break.
  * Post-2023 shift: coefficient on 1[year>=2023] with firm-clustered SE, controlling
    for the overhiring residual — the magnitude the Chow test is detecting.
  * sup-F: the Chow F recomputed for every candidate break year 2018..2025; the argmax
    is the data's preferred break. Its p-value is NOT the F-distribution p-value
    (Andrews 1993 critical values apply); it is reported as a location, not a test.
"""
from __future__ import annotations

import sys

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import statsmodels.api as sm
from scipy import stats

from analysis_common import COLORS, cohort_iter, load_panel, safe_log, stamp
from config import BREAK_YEAR, COHORT_LABELS, FIGURES_DIR, RESULTS_DIR

METRICS = ["rev_per_fte_real", "gp_per_fte_real", "oi_per_fte_real"]


def growth_frame(df: pd.DataFrame, metric: str) -> pd.DataFrame:
    parts = []
    for t, g in df.sort_values("fiscal_year").groupby("ticker"):
        g = g.copy()
        gap = g.fiscal_year.diff()
        g["g"] = safe_log(g[metric]).diff().where(gap == 1)
        parts.append(g)
    out = pd.concat(parts)
    out = out[out.g.notna() & out.overhire_resid_2022.notna()]
    return out[["ticker", "cohort", "cal_year", "g", "overhire_resid_2022"]]


def chow(d: pd.DataFrame, brk: int) -> tuple[float, float, int, int]:
    X = sm.add_constant(d[["overhire_resid_2022"]])
    y = d.g
    k = X.shape[1]
    pre, post = d.cal_year < brk, d.cal_year >= brk
    if pre.sum() <= k or post.sum() <= k:
        return np.nan, np.nan, int(pre.sum()), int(post.sum())
    ssr_r = sm.OLS(y, X).fit().ssr
    ssr_u = sm.OLS(y[pre], X[pre]).fit().ssr + sm.OLS(y[post], X[post]).fit().ssr
    n = len(d)
    F = ((ssr_r - ssr_u) / k) / (ssr_u / (n - 2 * k))
    p = 1 - stats.f.cdf(F, k, n - 2 * k)
    return float(F), float(p), int(pre.sum()), int(post.sum())


def post_shift(d: pd.DataFrame, brk: int) -> tuple[float, float, float]:
    X = sm.add_constant(pd.DataFrame({"post": (d.cal_year >= brk).astype(float),
                                      "overhire": d.overhire_resid_2022}))
    groups = pd.factorize(d.ticker)[0]
    if d.ticker.nunique() >= 2:
        m = sm.OLS(d.g, X).fit(cov_type="cluster", cov_kwds={"groups": groups})
    else:                                  # a one-firm cohort: no clustering possible
        m = sm.OLS(d.g, X).fit(cov_type="HC1")
    return float(m.params["post"]), float(m.bse["post"]), float(m.pvalues["post"])


def main(argv=None) -> int:
    df = load_panel()
    rows, supf = [], []
    for metric in METRICS:
        gf = growth_frame(df, metric)
        for c, label, d in cohort_iter(gf):
            F, p, npre, npost = chow(d, BREAK_YEAR)
            b, se, pb = post_shift(d, BREAK_YEAR) if npre > 2 and npost > 2 else (np.nan, np.nan, np.nan)
            cand = {}
            for yr in range(2018, 2026):
                Fy, _, a, bb = chow(d, yr)
                if not np.isnan(Fy):
                    cand[yr] = Fy
                    supf.append({"metric": metric, "cohort": c, "break_year": yr, "F": Fy, "n_pre": a, "n_post": bb})
            best = max(cand, key=cand.get) if cand else None
            rows.append({"metric": metric, "cohort": c, "n_firms": d.ticker.nunique(), "n_obs": len(d),
                         "n_pre": npre, "n_post": npost, "chow_F_2023": F, "chow_p_2023": p,
                         "post2023_growth_shift": b, "post2023_se_cluster": se, "post2023_p": pb,
                         "supF_break_year": best, "supF": cand.get(best, np.nan)})
    res = pd.DataFrame(rows)
    res.to_csv(RESULTS_DIR / "break_tests.csv", index=False)
    sf = pd.DataFrame(supf)
    sf.to_csv(RESULTS_DIR / "supF_by_year.csv", index=False)

    fig, axes = plt.subplots(1, len(METRICS), figsize=(4 * len(METRICS), 3.6), sharey=False)
    for ax, metric in zip(np.atleast_1d(axes), METRICS):
        for c in sf.cohort.unique():
            d = sf[(sf.metric == metric) & (sf.cohort == c)]
            ax.plot(d.break_year, d.F, marker="o", ms=3, color=COLORS[c], label=COHORT_LABELS[c])
        ax.axvline(BREAK_YEAR, color="#333", lw=0.8, ls=":")
        ax.set_title(f"Chow F by candidate break — {metric}", fontsize=8)
        ax.set_xlabel("break year (calendar-aligned)")
    np.atleast_1d(axes)[0].set_ylabel("F")
    np.atleast_1d(axes)[0].legend(fontsize=6)
    stamp(fig, "sup-F: F-distribution p-values do not apply to the maximum over break years (Andrews 1993).")
    fig.tight_layout()
    fig.savefig(FIGURES_DIR / "break_supF.png")
    plt.close(fig)
    with pd.option_context("display.width", 200, "display.float_format", "{:.3f}".format):
        print(res.to_string(index=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
