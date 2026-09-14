"""Validate every CIK in companies.yaml against SEC's own ticker file.

Writes data/interim/cik_check.csv and exits non-zero if any CIK disagrees with
https://www.sec.gov/files/company_tickers.json. Hand-typed CIKs are the one piece of
"typed" data in the project, so they are checked before anything else runs.
"""
from __future__ import annotations

import json
import sys

import pandas as pd

from config import INTERIM_DIR, RAW_DIR, firms_from_args
from http_cache import fetch

TICKERS_URL = "https://www.sec.gov/files/company_tickers.json"


def main(argv=None) -> int:
    firms = firms_from_args(argv)
    path = fetch(TICKERS_URL, RAW_DIR / "sec" / "company_tickers.json")
    table = json.loads(path.read_text())
    by_ticker = {v["ticker"].upper(): (str(v["cik_str"]).zfill(10), v["title"]) for v in table.values()}
    rows, bad = [], []
    for f in firms:
        sec_cik, title = by_ticker.get(f["ticker"], (None, None))
        ok = sec_cik == f["cik"]
        rows.append({"ticker": f["ticker"], "yaml_cik": f["cik"], "sec_cik": sec_cik,
                     "sec_title": title, "match": ok, "source_url": TICKERS_URL})
        if not ok:
            bad.append(f"{f['ticker']}: companies.yaml has {f['cik']}, SEC has {sec_cik} ({title})")
    df = pd.DataFrame(rows)
    df.to_csv(INTERIM_DIR / "cik_check.csv", index=False)
    print(df.to_string(index=False))
    if bad:
        print("\nCIK MISMATCHES — fix companies.yaml before continuing:\n  " + "\n  ".join(bad), file=sys.stderr)
        return 1
    print(f"\nAll {len(firms)} CIKs match SEC.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
