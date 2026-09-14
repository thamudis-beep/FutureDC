"""Difference-in-differences / event study on AI exposure.

Treatment (--treatment):
  mentions  (default) firm-level mean AI-term intensity in its FY2023-2024 annual
            reports (ai_per_10k_words) above the WITHIN-COHORT median. Note this is
            measured after the break; a firm that adopted AI and then talked about it is
            treated by construction, so this is a heterogeneity split, not an instrument.
  disclosed manual flag from ai_deployment_flags.yaml (quantified internal deployment).

Specification (event study):
  y_it = α_i + λ_{cohort(i),t} + Σ_{k≠2022} β_k · Treated_i · 1[t=k] + ε_it
with cohort×year fixed effects (so treated and control firms are compared inside the
same cohort), SEs clustered by firm. Outcomes: log real revenue/FTE and log real
operating income/FTE (loss years drop out of the log — the count is reported).

Static DiD: β on Treated×Post2023, with and without overhire_2022×Post as a control.
Placebo: sample 2015-2022, fake post = year>=2018, same treated flag.
"""
from __future__ import annotations

import argparse
import json
import sys

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import statsmodels.formula.api as smf
import yaml

from analysis_common import load_panel, safe_log, stamp
from config import BREAK_YEAR, FIGURES_DIR, PLACEBO_BREAK_YEAR, RESULTS_DIR, ROOT

OUTCOMES = {"log_rev_per_fte_real": "log real revenue / FTE", "log_oi_per_fte_real": "log real operating income / FTE"}
EVENT_YEARS = list(range(2019, 2027))
BASE_YEAR = 2022


def treated_by_mentions(df: pd.DataFrame) -> pd.Series:
    post = df[df.cal_year.isin([2023, 2024]) & df.ai_per_10k_words.notna()]
    firm = post.groupby("ticker").agg(cohort=("cohort", "first"), ai=("ai_per_10k_words", "mean"))
    firm["cohort_median"] = firm.groupby("cohort").ai.transform("median")
    return (firm.ai > firm.cohort_median).astype(int)


def treated_by_disclosure() -> pd.Series:
    flags = yaml.safe_load(open(ROOT / "ai_deployment_flags.yaml"))["firms"] or []
    return pd.Series({f["ticker"]: 1 for f in flags}, dtype=int)


def cohort_year_fe(d: pd.DataFrame) -> str:
    """Cohort×year dummies with the base year dropped in EVERY cohort. Firm dummies already
    span each cohort's mean, so a full set of cohort×year dummies would be collinear with
    them (one redundancy per cohort); dropping the base year per cohort removes it."""
    cols = []
    for c in sorted(d.cohort.unique()):
        for t in sorted(d.cal_year.unique()):
            if t == BASE_YEAR:
                continue
            col = f"cy_{c}_{t}"
            d[col] = ((d.cohort == c) & (d.cal_year == t)).astype(float)
            if d[col].sum() > 0:
                cols.append(col)
    return " + ".join(cols)


def fit(d: pd.DataFrame, formula: str):
    return smf.ols(formula, data=d).fit(cov_type="cluster", cov_kwds={"groups": pd.factorize(d.ticker)[0]})


def event_study(d: pd.DataFrame, y: str) -> pd.DataFrame:
    d = d[d[y].notna() & d.cal_year.isin(EVENT_YEARS)].copy()
    fe = cohort_year_fe(d)
    terms = []
    for k in EVENT_YEARS:
        if k == BASE_YEAR:
            continue
        col = f"ev_{k}"
        d[col] = d.treated * (d.cal_year == k).astype(float)
        if d[col].sum() > 0:
            terms.append(col)
    m = fit(d, f"{y} ~ {' + '.join(terms)} + C(ticker) + {fe}")
    rows = [{"year": BASE_YEAR, "coef": 0.0, "se": 0.0, "lo": 0.0, "hi": 0.0, "n": int(len(d))}]
    ci = m.conf_int()
    for t in terms:
        k = int(t.split("_")[1])
        rows.append({"year": k, "coef": float(m.params[t]), "se": float(m.bse[t]),
                     "lo": float(ci.loc[t, 0]), "hi": float(ci.loc[t, 1]), "n": int(len(d))})
    return pd.DataFrame(rows).sort_values("year")


def static_did(d: pd.DataFrame, y: str, brk: int, years: tuple[int, int], control: bool) -> dict:
    d = d[d[y].notna() & d.cal_year.between(*years)].copy()
    d["post"] = (d.cal_year >= brk).astype(float)
    d["tp"] = d.treated * d.post
    f = f"{y} ~ tp + C(ticker) + {cohort_year_fe(d)}"
    if control:
        d = d[d.overhire_resid_2022.notna()].copy()
        d["op"] = d.overhire_resid_2022 * d.post
        f += " + op"
    if d.tp.sum() == 0 or d.ticker.nunique() < 4:
        return {"coef": np.nan, "se": np.nan, "p": np.nan, "lo": np.nan, "hi": np.nan, "n": int(len(d)),
                "n_treated": int(d[d.treated == 1].ticker.nunique()), "n_control": int(d[d.treated == 0].ticker.nunique())}
    m = fit(d, f)
    ci = m.conf_int().loc["tp"]
    return {"coef": float(m.params["tp"]), "se": float(m.bse["tp"]), "p": float(m.pvalues["tp"]),
            "lo": float(ci[0]), "hi": float(ci[1]), "n": int(len(d)),
            "n_treated": int(d[d.treated == 1].ticker.nunique()), "n_control": int(d[d.treated == 0].ticker.nunique())}


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--treatment", choices=["mentions", "disclosed"], default="mentions")
    a = ap.parse_args(argv)
    df = load_panel()
    df = df[df.cohort != "nontech"] if a.treatment == "mentions" else df   # AI-mention split is within tech cohorts
    tr = treated_by_mentions(df) if a.treatment == "mentions" else treated_by_disclosure()
    df["treated"] = df.ticker.map(tr).fillna(0).astype(int) if a.treatment == "disclosed" else df.ticker.map(tr)
    df = df[df.treated.notna()].copy()
    df["treated"] = df.treated.astype(int)
    for y in OUTCOMES:
        df[y] = safe_log(df[y.replace("log_", "")])
    n_loss = int((df.oi_per_fte_real <= 0).sum())
    if df.treated.nunique() < 2:
        print(f"treatment={a.treatment}: {'no treated' if df.treated.max() == 0 else 'no control'} firms — "
              f"nothing to estimate (fill ai_deployment_flags.yaml, or check ai_mentions.csv).")
        (RESULTS_DIR / f"did_{a.treatment}.json").write_text(json.dumps({"treatment": a.treatment, "skipped": True}))
        return 0

    out = {"treatment": a.treatment, "n_treated_firms": int(df[df.treated == 1].ticker.nunique()),
           "n_control_firms": int(df[df.treated == 0].ticker.nunique()), "oi_loss_years_dropped": n_loss,
           "treated_tickers": sorted(df[df.treated == 1].ticker.unique().tolist()), "static": {}, "placebo": {}}
    es_all = []
    for y in OUTCOMES:
        es = event_study(df, y)
        es["outcome"] = y
        es_all.append(es)
        out["static"][y] = {"raw": static_did(df, y, BREAK_YEAR, (2019, 2026), control=False),
                            "overhire_control": static_did(df, y, BREAK_YEAR, (2019, 2026), control=True)}
        out["placebo"][y] = static_did(df, y, PLACEBO_BREAK_YEAR, (2015, 2022), control=False)
    es_df = pd.concat(es_all)
    es_df.to_csv(RESULTS_DIR / f"event_study_{a.treatment}.csv", index=False)
    (RESULTS_DIR / f"did_{a.treatment}.json").write_text(json.dumps(out, indent=1))

    fig, axes = plt.subplots(1, 2, figsize=(10, 3.8))
    for ax, (y, lab) in zip(axes, OUTCOMES.items()):
        d = es_df[es_df.outcome == y]
        ax.errorbar(d.year, d.coef, yerr=[d.coef - d.lo, d.hi - d.coef], fmt="o-", color="#1f4e79", capsize=3, ms=4)
        ax.axhline(0, color="#999", lw=0.8)
        ax.axvline(BREAK_YEAR - 0.5, color="#333", lw=0.8, ls=":")
        ax.set_title(f"{lab}: treated × year (base {BASE_YEAR}), 95% CI", fontsize=9)
        ax.set_xlabel("calendar-aligned fiscal year")
    fig.suptitle(f"Event study — treated = {'above-cohort-median AI-term intensity in FY23–24 10-Ks' if a.treatment == 'mentions' else 'disclosed internal AI deployment'} "
                 f"({out['n_treated_firms']} treated / {out['n_control_firms']} control firms)", fontsize=9)
    stamp(fig, "Firm FE + cohort×year FE, SE clustered by firm. Log outcomes; operating-loss years drop out of the OI panel.")
    fig.tight_layout()
    fig.savefig(FIGURES_DIR / f"event_study_{a.treatment}.png")
    plt.close(fig)
    print(json.dumps(out, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main())
