"""Download the XBRL companyfacts JSON for every firm into data/raw/companyfacts/."""
from __future__ import annotations

import sys

from config import RAW_DIR, firms_from_args
from http_cache import FetchError, fetch


def facts_url(cik: str) -> str:
    return f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"


def facts_path(cik: str):
    return RAW_DIR / "companyfacts" / f"CIK{cik}.json"


def main(argv=None) -> int:
    firms = firms_from_args(argv)
    failed = []
    for f in firms:
        try:
            p = fetch(facts_url(f["cik"]), facts_path(f["cik"]))
            print(f"{f['ticker']:6s} {p} ({p.stat().st_size/1e6:.1f} MB)")
        except FetchError as e:
            failed.append(f"{f['ticker']}: {e}")
            print(f"{f['ticker']:6s} FAILED {e}", file=sys.stderr)
    if failed:
        print(f"\n{len(failed)} companyfacts downloads failed.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
