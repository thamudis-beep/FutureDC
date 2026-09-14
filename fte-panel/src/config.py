"""Paths, sample definition and shared constants.

Everything reads the sample from companies.yaml. Output locations can be redirected
with FTE_DATA_DIR / FTE_FIGURES_DIR / FTE_RESULTS_DIR so a fixture-driven run
(`make demo`) never writes into data/.
"""
from __future__ import annotations

import os
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.environ.get("FTE_DATA_DIR", ROOT / "data"))
RAW_DIR = DATA_DIR / "raw"
INTERIM_DIR = DATA_DIR / "interim"
FIGURES_DIR = Path(os.environ.get("FTE_FIGURES_DIR", ROOT / "figures"))
RESULTS_DIR = Path(os.environ.get("FTE_RESULTS_DIR", ROOT / "results"))
COMPANIES_YAML = Path(os.environ.get("FTE_COMPANIES", ROOT / "companies.yaml"))

for _d in (RAW_DIR, INTERIM_DIR, FIGURES_DIR, RESULTS_DIR):
    _d.mkdir(parents=True, exist_ok=True)

FIRST_YEAR = 2015
LAST_YEAR = 2026
BASE_DEFLATOR_YEAR = 2024      # real figures are in 2024 dollars
INDEX_BASE_YEAR = 2019         # cohort indices are 2019 = 100
BREAK_YEAR = 2023              # first post-ChatGPT fiscal year (calendar-aligned)
PLACEBO_BREAK_YEAR = 2018

COHORTS = ["hyperscaler", "internet", "software", "semis", "itservices", "nontech"]
COHORT_LABELS = {
    "hyperscaler": "Hyperscalers",
    "internet": "Internet / ads / marketplaces",
    "software": "Software / SaaS",
    "semis": "Semis / AI infra",
    "itservices": "IT services",
    "nontech": "Non-tech control",
}

ANNUAL_FORMS = {"10-K", "10-K/A", "10-KT", "10-KT/A", "20-F", "20-F/A", "40-F", "40-F/A"}


def sec_user_agent() -> str:
    """SEC requires a User-Agent that identifies the requester (name + email)."""
    ua = os.environ.get("SEC_USER_AGENT", "").strip()
    if not ua or "@" not in ua:
        raise SystemExit(
            "Set SEC_USER_AGENT to '<your name or org> <your email>' before fetching from EDGAR "
            "(https://www.sec.gov/os/accessing-edgar-data)."
        )
    return ua


def load_firms(only: list[str] | None = None, pilot: bool = False) -> list[dict]:
    with open(COMPANIES_YAML) as fh:
        firms = yaml.safe_load(fh)["firms"]
    for f in firms:
        f["cik"] = str(f["cik"]).zfill(10)
        f.setdefault("form", "10-K")
        f.setdefault("pilot", False)
        f.setdefault("layoffs_names", [f["ticker"]])
    if pilot:
        firms = [f for f in firms if f.get("pilot")]
    if only:
        want = {t.upper() for t in only}
        missing = want - {f["ticker"] for f in firms}
        if missing:
            raise SystemExit(f"Tickers not in companies.yaml: {sorted(missing)}")
        firms = [f for f in firms if f["ticker"] in want]
    return firms


def firms_from_args(argv: list[str] | None = None) -> list[dict]:
    """Common CLI: `script.py [--pilot] [TICKER ...]`."""
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("tickers", nargs="*")
    p.add_argument("--pilot", action="store_true", help="only the five pilot firms")
    a = p.parse_args(argv)
    return load_firms(only=a.tickers or None, pilot=a.pilot)


def calendar_year(fy_end: str) -> int:
    """Calendar-year alignment: fiscal years ending Jan-May belong to the prior calendar year
    (the Compustat convention). NVDA FY ending Jan 2025 -> 2024; MSFT FY ending Jun 2024 -> 2024."""
    y, m = int(fy_end[:4]), int(fy_end[5:7])
    return y - 1 if m <= 5 else y
