"""Fill MEMO.md from results/. Slots without a result read '[pending]'."""
from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

import pandas as pd

from config import COHORT_LABELS, DATA_DIR, RESULTS_DIR, ROOT

DOCS_DIR = Path(os.environ.get("FTE_DOCS_DIR", ROOT))
PENDING = "[pending]"


def fmt(v, spec=".2f"):
    try:
        return format(float(v), spec) if pd.notna(v) else PENDING
    except (TypeError, ValueError):
        return PENDING


def did_line(d: dict | None) -> str:
    if not d or d.get("coef") is None or pd.isna(d.get("coef")):
        return PENDING
    return (f"{d['coef']:+.3f} log points (95% CI {d['lo']:+.3f} to {d['hi']:+.3f}, p = {d['p']:.2f}; "
            f"{d['n_treated']} treated / {d['n_control']} control firms, n = {d['n']})")


def main(argv=None) -> int:
    s: dict[str, str] = {}
    if os.environ.get("FTE_DOCS_DIR"):
        s["demo_banner"] = "> **SYNTHETIC FIXTURE RUN — every number below is generated, none is a real company value.**\n\n"
    elif not (RESULTS_DIR / "did_mentions.json").exists():
        s["demo_banner"] = ("> **Not yet run on real data.** The SEC and FRED hosts were unreachable from the environment this "
                            "pipeline was built in, so every slot below reads [pending]. Run `make pilot`, then `make all`, "
                            "and the tables fill from `results/`. The reading rules in sections 2 and 4 were fixed before any "
                            "result was seen and should be applied as written.\n\n")
    else:
        s["demo_banner"] = ""
    panel = pd.read_csv(DATA_DIR / "panel.csv") if (DATA_DIR / "panel.csv").exists() else None
    if panel is not None:
        u = panel[panel.usd & panel.headcount.notna()]
        s.update(n_firms=str(u.ticker.nunique()), n_firm_years=str(len(u)), last_year=str(int(u.fiscal_year.max())),
                 n_contractor_mentions=str(int((u.mentions_contractors == True).sum())))
    ci = RESULTS_DIR / "cohort_index.csv"
    if ci.exists():
        d = pd.read_csv(ci)
        d = d[d.metric == "rev_per_fte_real"]
        piv = d.pivot_table(index="cohort", columns="cal_year", values="median")
        yrs = [y for y in (2019, 2021, 2022, 2023, 2024, 2025, 2026) if y in piv.columns]
        lines = ["| cohort | n | " + " | ".join(map(str, yrs)) + " |", "|---|---|" + "---|" * len(yrs)]
        for c in piv.index:
            n = int(d[d.cohort == c].n.max())
            lines.append(f"| {COHORT_LABELS.get(c, c)} | {n} | " + " | ".join(("–" if pd.isna(piv.loc[c, y]) else f"{piv.loc[c, y]:.0f}") for y in yrs) + " |")
        s["cohort_index_table"] = "\n".join(lines)
    bt = RESULTS_DIR / "break_tests.csv"
    if bt.exists():
        d = pd.read_csv(bt)
        d = d[d.metric == "rev_per_fte_real"]
        lines = ["| cohort | firms | post-2023 growth shift (se) | Chow F (p) at 2023 | sup-F year |", "|---|---|---|---|---|"]
        for r in d.itertuples():
            lines.append(f"| {COHORT_LABELS.get(r.cohort, r.cohort)} | {r.n_firms} | {fmt(r.post2023_growth_shift, '+.3f')} ({fmt(r.post2023_se_cluster, '.3f')}) "
                         f"| {fmt(r.chow_F_2023, '.2f')} ({fmt(r.chow_p_2023, '.2f')}) | {'' if pd.isna(r.supF_break_year) else int(r.supF_break_year)} |")
        s["break_table"] = "\n".join(lines)
    dc = RESULTS_DIR / "decomposition.csv"
    if dc.exists():
        d = pd.read_csv(dc)
        s["n_decomp"] = str(len(d))
        s["n_headcount_dominant"] = str(int((d.headcount_effect.abs() > d.revenue_effect.abs()).sum()))
        s["layoff_note"] = ("layoffs.fyi was not supplied, so headcount declines are not split into layoffs versus attrition."
                            if d.headcount_tag.str.contains("not supplied").all()
                            else f"{int(d.headcount_tag.str.startswith('layoffs.fyi:').sum())} of them have layoffs.fyi events in the window.")
    dj = RESULTS_DIR / "did_mentions.json"
    if dj.exists():
        d = json.loads(dj.read_text())
        s["n_treated"] = str(d["n_treated_firms"])
        s["treated_list"] = ", ".join(d["treated_tickers"]) or "none"
        st = d["static"]
        rev, oi = st["log_rev_per_fte_real"], st["log_oi_per_fte_real"]
        lines = ["| outcome | treated × post-2023 | 95% CI | p | with overhiring control |", "|---|---|---|---|---|"]
        for lab, x in (("log real revenue/FTE", rev), ("log real operating income/FTE", oi)):
            r, c = x["raw"], x["overhire_control"]
            lines.append(f"| {lab} | {fmt(r['coef'], '+.3f')} | {fmt(r['lo'], '+.3f')} to {fmt(r['hi'], '+.3f')} | {fmt(r['p'])} | {fmt(c['coef'], '+.3f')} (p = {fmt(c['p'])}) |")
        s["did_table"] = "\n".join(lines)
        s["did_rev_line"] = did_line(rev["raw"])
        s["did_rev_ctrl_line"] = did_line(rev["overhire_control"])
        s["did_oi_line"] = did_line(oi["raw"])
        s["oi_loss_years"] = str(d["oi_loss_years_dropped"])
        p = d["placebo"]["log_rev_per_fte_real"]
        s["placebo_line"] = ("treated × post-2018 on revenue/FTE = " + did_line(p) +
                             ". A placebo of the same size as the real estimate means the split is picking up a pre-existing trend.")
    cj = RESULTS_DIR / "capex_vs_productivity.json"
    if cj.exists():
        d = json.loads(cj.read_text())
        if "pooled" in d:
            s["capex_beta"] = fmt(d["pooled"]["beta"])
            s["capex_ci"] = f"{fmt(d['pooled']['lo'])} to {fmt(d['pooled']['hi'])}"
        s["capex_n"] = str(d["n"])
    cs = RESULTS_DIR / "cogs_share_by_cohort_year.csv"
    if cs.exists():
        d = pd.read_csv(cs)
        sw = d[d.cohort == "software"].sort_values("cal_year")
        if len(sw):
            v22 = sw[sw.cal_year == 2022].cogs_share
            s["cogs_sw_2022"] = fmt(v22.iloc[0], ".1%") if len(v22) else PENDING
            s["cogs_sw_latest"] = fmt(sw.cogs_share.iloc[-1], ".1%")
            s["cogs_latest_year"] = str(int(sw.cal_year.iloc[-1]))
    tpl = (ROOT / "src" / "memo_template.md").read_text()
    text = re.sub(r"\{\{(\w+)\}\}", lambda m: s.get(m.group(1), PENDING), tpl)
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    (DOCS_DIR / "MEMO.md").write_text(text)
    words = len(re.findall(r"\b\w+\b", re.sub(r"\|.*\|", "", text)))
    print(f"wrote {DOCS_DIR / 'MEMO.md'} ({words} words outside tables; {text.count(PENDING)} pending slots)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
