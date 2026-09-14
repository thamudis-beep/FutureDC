"""List and download each firm's annual reports (10-K / 20-F / 40-F primary documents).

Uses the EDGAR submissions API (data.sec.gov/submissions/CIK##########.json plus its
paginated `files`), keeps one filing per fiscal-year report date (the original, not the
/A amendment, unless only the amendment exists), and stores the primary document under
data/raw/filings/<ticker>/. Writes data/interim/filings.csv with the archive URL of
every document so each headcount value can cite its source.
"""
from __future__ import annotations

import json
import sys

import pandas as pd

from config import FIRST_YEAR, INTERIM_DIR, LAST_YEAR, RAW_DIR, calendar_year, firms_from_args
from http_cache import FetchError, fetch

ANNUAL = {"10-K", "10-KT", "20-F", "40-F"}
AMEND = {"10-K/A", "10-KT/A", "20-F/A", "40-F/A"}


def submissions_url(cik: str) -> str:
    return f"https://data.sec.gov/submissions/CIK{cik}.json"


def doc_url(cik: str, accn: str, primary_doc: str) -> str:
    return f"https://www.sec.gov/Archives/edgar/data/{int(cik)}/{accn.replace('-', '')}/{primary_doc}"


def list_annual_filings(cik: str) -> list[dict]:
    p = fetch(submissions_url(cik), RAW_DIR / "submissions" / f"CIK{cik}.json")
    sub = json.loads(p.read_text())
    pages = [sub["filings"]["recent"]]
    for extra in sub["filings"].get("files", []):
        ep = fetch(f"https://data.sec.gov/submissions/{extra['name']}",
                   RAW_DIR / "submissions" / extra["name"])
        pages.append(json.loads(ep.read_text()))
    rows = []
    for page in pages:
        n = len(page["accessionNumber"])
        for i in range(n):
            form = page["form"][i]
            if form not in ANNUAL | AMEND:
                continue
            rows.append({"accn": page["accessionNumber"][i], "form": form,
                         "filed": page["filingDate"][i], "report_date": page["reportDate"][i],
                         "primary_doc": page["primaryDocument"][i],
                         "primary_desc": page.get("primaryDocDescription", [""] * n)[i]})
    # one filing per report date: original beats amendment; latest original if several
    best: dict[str, dict] = {}
    for r in sorted(rows, key=lambda r: (r["form"] in AMEND, r["filed"])):
        rd = r["report_date"]
        if rd not in best or (best[rd]["form"] in AMEND and r["form"] in ANNUAL):
            best[rd] = r
    return sorted(best.values(), key=lambda r: r["report_date"])


def main(argv=None) -> int:
    firms = firms_from_args(argv)
    out, failed = [], []
    for f in firms:
        try:
            filings = list_annual_filings(f["cik"])
        except FetchError as e:
            failed.append(f"{f['ticker']}: {e}")
            continue
        n = 0
        for r in filings:
            fy = int(r["report_date"][:4])
            if fy < FIRST_YEAR or fy > LAST_YEAR:
                continue
            url = doc_url(f["cik"], r["accn"], r["primary_doc"])
            dest = RAW_DIR / "filings" / f["ticker"] / f"{r['accn']}_{r['primary_doc'].split('/')[-1]}"
            try:
                fetch(url, dest)
                status = "ok"
            except FetchError as e:
                status = f"fetch_failed: {e}"
                failed.append(f"{f['ticker']} {r['accn']}: {e}")
            out.append({"ticker": f["ticker"], "cik": f["cik"], "fiscal_year": fy,
                        "cal_year": calendar_year(r["report_date"]), "fy_end": r["report_date"],
                        "form": r["form"], "accn": r["accn"], "filed": r["filed"],
                        "primary_doc": r["primary_doc"], "local_path": str(dest),
                        "source_url": url, "status": status})
            n += 1
        print(f"{f['ticker']:6s} {n} annual reports")
    df = pd.DataFrame(out)
    df.to_csv(INTERIM_DIR / "filings.csv", index=False)
    print(f"\nwrote {len(df)} filings to {INTERIM_DIR / 'filings.csv'}")
    if failed:
        print("\nFAILED:\n  " + "\n  ".join(failed), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
