"""Assemble the firm-year panel: financials + headcount + deflators + AI mentions + layoffs.

Writes data/panel.csv. Every headcount value carries its sentence and archive URL; every
financial value carries the companyfacts URL and the XBRL tag it came from.
"""
from __future__ import annotations

import sys

import numpy as np
import pandas as pd

from config import BASE_DEFLATOR_YEAR, DATA_DIR, INTERIM_DIR, load_firms

PER_FTE = {
    "rev_per_fte": "revenue",
    "gp_per_fte": "gross_profit",
    "oi_per_fte": "operating_income",
    "ebitda_per_fte": "ebitda",
    "va_per_fte": "value_added",         # revenue - cost of revenue - capex
    "capex_per_fte": "capex",
    "sbc_per_fte": "sbc",
    "rnd_per_fte": "rnd",
}


def fy_deflator(defl: pd.DataFrame, series: str, start: str, end: str) -> tuple[float, int]:
    """Average index over the fiscal window; returns (value, n_months_available)."""
    w = defl[(defl.date >= pd.Timestamp(start)) & (defl.date <= pd.Timestamp(end))][series].dropna()
    return (float(w.mean()) if len(w) else np.nan), int(len(w))


def overhiring_residuals(g: pd.DataFrame) -> pd.DataFrame:
    """Fit log(headcount) on a linear trend over FY2015-2019 (>=4 points), extrapolate,
    and return the deviation of every year from that trend. The 2021 and 2022
    deviations are the overhiring-hangover controls."""
    g = g.sort_values("fiscal_year").copy()
    g["overhire_resid"] = np.nan
    pre = g[(g.fiscal_year.between(2015, 2019)) & g.headcount.gt(0)]
    if len(pre) < 4:
        return g
    x, y = pre.fiscal_year.values.astype(float), np.log(pre.headcount.values.astype(float))
    b, a = np.polyfit(x, y, 1)
    ok = g.headcount.gt(0)
    g.loc[ok, "overhire_resid"] = np.log(g.loc[ok, "headcount"].astype(float)) - (a + b * g.loc[ok, "fiscal_year"])
    g["pretrend_headcount_growth"] = b
    return g


def main(argv=None) -> int:
    firms = {f["ticker"]: f for f in load_firms()}
    fin = pd.read_csv(INTERIM_DIR / "financials.csv")
    hc = pd.read_csv(INTERIM_DIR / "headcount.csv")
    ai = pd.read_csv(INTERIM_DIR / "ai_mentions.csv") if (INTERIM_DIR / "ai_mentions.csv").exists() else pd.DataFrame()
    defl = pd.read_csv(INTERIM_DIR / "deflators_monthly.csv", parse_dates=["date"])
    lay_p = INTERIM_DIR / "layoffs_by_firm_year.csv"
    lay = pd.read_csv(lay_p) if lay_p.exists() else pd.DataFrame(columns=["ticker", "fiscal_year"])

    hc_cols = ["ticker", "fiscal_year", "headcount", "headcount_sentence", "headcount_method", "headcount_score",
               "includes_part_time", "mentions_contractors", "ambiguous", "section_found", "source_url"]
    hc = hc[[c for c in hc_cols if c in hc.columns]].rename(columns={"source_url": "headcount_source_url"})
    hc.loc[hc.get("ambiguous", False) == True, "headcount"] = np.nan   # unresolved -> NA, never a guess
    df = fin.rename(columns={"source_url": "financials_source_url"}).merge(hc, on=["ticker", "fiscal_year"], how="left")
    if len(ai):
        aic = ai[["ticker", "fiscal_year", "words", "ai_terms_total", "ai_per_10k_words", "ml_per_10k_words",
                  "artificial_intelligence", "generative_ai", "large_language_model"]]
        df = df.merge(aic, on=["ticker", "fiscal_year"], how="left")
    if len(lay):
        df = df.merge(lay.rename(columns={"n_events": "layoff_events", "laid_off_total": "layoff_total",
                                          "sources": "layoff_sources"}),
                      on=["ticker", "fiscal_year"], how="left")
    else:
        df["layoff_events"] = np.nan
        df["layoff_total"] = np.nan

    df["sector"] = df.ticker.map(lambda t: firms[t].get("sector", ""))
    df["form_type"] = df.ticker.map(lambda t: firms[t]["form"])
    df["usd"] = df.currency.eq("USD")

    # headcount cross-check against dei:EntityNumberOfEmployees where present
    both = df.headcount.notna() & df.dei_employees.notna() & df.dei_employees.gt(0)
    df["headcount_vs_dei_reldiff"] = np.nan
    df.loc[both, "headcount_vs_dei_reldiff"] = (df.loc[both, "headcount"] - df.loc[both, "dei_employees"]).abs() / df.loc[both, "dei_employees"]

    # deflators: fiscal-window average relative to calendar-2024 average
    base_pce, _ = fy_deflator(defl, "PCEPI", f"{BASE_DEFLATOR_YEAR}-01-01", f"{BASE_DEFLATOR_YEAR}-12-31")
    base_cpi, _ = fy_deflator(defl, "CPIAUCSL", f"{BASE_DEFLATOR_YEAR}-01-01", f"{BASE_DEFLATOR_YEAR}-12-31")
    pce, cpi, nm = [], [], []
    for r in df.itertuples():
        v, n = fy_deflator(defl, "PCEPI", r.fy_start, r.fy_end)
        c, _ = fy_deflator(defl, "CPIAUCSL", r.fy_start, r.fy_end)
        pce.append(base_pce / v if v and n else np.nan)
        cpi.append(base_cpi / c if c and n else np.nan)
        nm.append(n)
    df["deflator_pce"], df["deflator_cpi"], df["deflator_months"] = pce, cpi, nm

    # derived aggregates
    df["ebitda"] = df.operating_income + df.dna
    df["value_added"] = df.revenue - df.cost_of_revenue - df.capex
    df["capex_to_rev"] = df.capex / df.revenue
    df["cogs_share"] = df.cost_of_revenue / df.revenue
    df["sbc_to_rev"] = df.sbc / df.revenue
    df["oi_margin"] = df.operating_income / df.revenue
    for k, base in PER_FTE.items():
        df[k] = df[base] / df.headcount
        df[f"{k}_real"] = df[k] * df.deflator_pce
    df["revenue_real"] = df.revenue * df.deflator_pce

    # growth, decoupling and overhiring residual, per firm
    df = df.sort_values(["ticker", "fiscal_year"])
    parts = []
    for t, g in df.groupby("ticker", sort=False):
        g = g.copy()
        gap = g.fiscal_year.diff()
        g["headcount_growth"] = np.log(g.headcount).diff().where(gap == 1)
        g["revenue_growth_real"] = np.log(g.revenue_real).diff().where(gap == 1)
        g["revenue_growth"] = np.log(g.revenue).diff().where(gap == 1)
        g["decoupling"] = g.revenue_growth_real - g.headcount_growth
        g["d_log_rev_per_fte_real"] = np.log(g.rev_per_fte_real).diff().where(gap == 1)
        g = overhiring_residuals(g)
        for yr in (2021, 2022):
            v = g.loc[g.fiscal_year == yr, "overhire_resid"]
            g[f"overhire_resid_{yr}"] = float(v.iloc[0]) if len(v) and pd.notna(v.iloc[0]) else np.nan
        parts.append(g)
    df = pd.concat(parts)

    front = ["ticker", "cohort", "sector", "fiscal_year", "cal_year", "fy_start", "fy_end", "currency", "usd", "form",
             "revenue", "revenue_real", "cost_of_revenue", "gross_profit", "operating_income", "ebitda", "net_income",
             "capex", "sbc", "rnd", "dna", "value_added", "headcount", "dei_employees", "headcount_vs_dei_reldiff"]
    cols = front + [c for c in df.columns if c not in front]
    df = df[cols]
    out = DATA_DIR / "panel.csv"
    df.to_csv(out, index=False)
    n_hc = int(df.headcount.notna().sum())
    print(f"wrote {len(df)} firm-years, {df.ticker.nunique()} firms, {n_hc} with headcount -> {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
