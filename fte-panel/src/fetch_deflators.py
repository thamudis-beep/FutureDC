"""Fetch FRED price indices used to express figures in 2024 dollars.

PCEPI  — PCE price index (BEA, via FRED), monthly, index 2017=100
CPIAUCSL — CPI-U all items, SA, monthly, index 1982-84=100
The FRED CSV endpoint needs no API key. Writes data/interim/deflators_monthly.csv.
"""
from __future__ import annotations

import sys

import pandas as pd

from config import INTERIM_DIR, RAW_DIR
from http_cache import FetchError, fetch

SERIES = ["PCEPI", "CPIAUCSL"]


def fred_url(series: str) -> str:
    return f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={series}"


def main(argv=None) -> int:
    frames = []
    for s in SERIES:
        try:
            p = fetch(fred_url(s), RAW_DIR / "fred" / f"{s}.csv", sec=False)
        except FetchError as e:
            print(f"{s}: {e}", file=sys.stderr)
            return 1
        df = pd.read_csv(p)
        date_col = "observation_date" if "observation_date" in df.columns else "DATE"
        df = df.rename(columns={date_col: "date"})
        df["date"] = pd.to_datetime(df["date"])
        df[s] = pd.to_numeric(df[s], errors="coerce")
        df[f"{s}_source_url"] = fred_url(s)
        frames.append(df[["date", s, f"{s}_source_url"]])
    out = frames[0]
    for f in frames[1:]:
        out = out.merge(f, on="date", how="outer")
    out = out.sort_values("date")
    out.to_csv(INTERIM_DIR / "deflators_monthly.csv", index=False)
    print(f"wrote {len(out)} months ({out.date.min().date()} – {out.date.max().date()}) "
          f"to {INTERIM_DIR / 'deflators_monthly.csv'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
