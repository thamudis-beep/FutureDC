"""Layoff context from layoffs.fyi (descriptive only).

layoffs.fyi is an Airtable embed with no stable public export URL, so this step reads a
CSV the analyst downloads by hand from the Airtable view ("Download CSV") into
data/raw/layoffs_fyi/layoffs.csv, and records the download URL + date in
data/raw/layoffs_fyi/SOURCE.txt. The Kaggle mirror format (company,total_laid_off,date,...)
is accepted too. Company names are matched exactly (case-insensitive) to `layoffs_names`
in companies.yaml. Output: data/interim/layoffs_by_firm_year.csv.

If the file is absent the step succeeds with an empty table and the panel carries
layoff_* = NA — it never guesses.
"""
from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd

from config import INTERIM_DIR, RAW_DIR, load_firms

CSV = RAW_DIR / "layoffs_fyi" / "layoffs.csv"
SOURCE_NOTE = RAW_DIR / "layoffs_fyi" / "SOURCE.txt"


def _col(df: pd.DataFrame, *cands: str) -> str | None:
    low = {c.lower().strip(): c for c in df.columns}
    for c in cands:
        if c.lower() in low:
            return low[c.lower()]
    return None


def main(argv=None) -> int:
    cols = ["ticker", "fiscal_year", "n_events", "laid_off_total", "laid_off_reported_events", "sources"]
    if not CSV.exists():
        pd.DataFrame(columns=cols).to_csv(INTERIM_DIR / "layoffs_by_firm_year.csv", index=False)
        print(f"NOTE: {CSV} not found — layoffs.fyi context skipped (panel layoff_* columns will be NA).\n"
              f"      Download the CSV from the layoffs.fyi Airtable view, save it there, and note the URL "
              f"and date in {SOURCE_NOTE}.")
        return 0
    if not SOURCE_NOTE.exists():
        print(f"{CSV} exists but {SOURCE_NOTE} is missing; record where and when it was downloaded.",
              file=sys.stderr)
        return 1
    raw = pd.read_csv(CSV)
    c_company = _col(raw, "Company", "company")
    c_n = _col(raw, "# Laid Off", "total_laid_off", "Laid Off")
    c_date = _col(raw, "Date", "date")
    c_src = _col(raw, "Source", "source")
    if not (c_company and c_date):
        print(f"cannot find company/date columns in {CSV}: {list(raw.columns)}", file=sys.stderr)
        return 1
    raw["_company"] = raw[c_company].astype(str).str.strip().str.lower()
    raw["_date"] = pd.to_datetime(raw[c_date], errors="coerce")
    raw["_n"] = pd.to_numeric(raw[c_n], errors="coerce") if c_n else float("nan")

    fin_path = INTERIM_DIR / "financials.csv"
    fin = pd.read_csv(fin_path) if fin_path.exists() else None
    out = []
    for f in load_firms():
        names = {n.lower() for n in f["layoffs_names"]}
        ev = raw[raw["_company"].isin(names)].dropna(subset=["_date"])
        if ev.empty:
            continue
        # assign each event to the firm's fiscal year using observed fiscal windows when known
        if fin is not None and (fin.ticker == f["ticker"]).any():
            win = fin[fin.ticker == f["ticker"]][["fiscal_year", "fy_start", "fy_end"]]
            for _, w in win.iterrows():
                m = ev[(ev["_date"] >= pd.Timestamp(w.fy_start)) & (ev["_date"] <= pd.Timestamp(w.fy_end))]
                if len(m):
                    out.append({"ticker": f["ticker"], "fiscal_year": int(w.fiscal_year), "n_events": len(m),
                                "laid_off_total": m["_n"].sum(min_count=1),
                                "laid_off_reported_events": int(m["_n"].notna().sum()),
                                "sources": "; ".join(m[c_src].dropna().astype(str)) if c_src else ""})
        else:
            for fy, m in ev.groupby(ev["_date"].dt.year):
                out.append({"ticker": f["ticker"], "fiscal_year": int(fy), "n_events": len(m),
                            "laid_off_total": m["_n"].sum(min_count=1),
                            "laid_off_reported_events": int(m["_n"].notna().sum()),
                            "sources": "; ".join(m[c_src].dropna().astype(str)) if c_src else ""})
    df = pd.DataFrame(out, columns=cols)
    df.to_csv(INTERIM_DIR / "layoffs_by_firm_year.csv", index=False)
    print(f"wrote {len(df)} firm-years of layoff events from {CSV}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
