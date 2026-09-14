"""parse_facts selection rules on a synthetic companyfacts document."""
import json
import os
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
tmp = tempfile.mkdtemp()
os.environ["FTE_DATA_DIR"] = tmp
sys.path.insert(0, str(HERE.parent / "src"))
sys.path.insert(0, str(HERE))
import make_fixtures  # noqa: E402
from config import RAW_DIR  # noqa: E402
import parse_facts  # noqa: E402


def main():
    p = RAW_DIR / "companyfacts" / "CIK0001108524.json"      # CRM fixture: tag switch + derived GP
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(make_fixtures.facts_json("CRM")))
    firm = {"ticker": "CRM", "cik": "0001108524", "cohort": "software", "fye_month": 1}
    rows, log = parse_facts.parse_one(firm)
    years = [r["fiscal_year"] for r in rows]
    assert years == list(range(2015, 2027)), years
    tags = {r["fiscal_year"]: r["revenue_tag"] for r in rows}
    assert tags[2016] == "us-gaap:SalesRevenueNet" and tags[2020] == "us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax", tags
    assert all(r["gross_profit_tag"] == "derived:revenue-cost_of_revenue" for r in rows)
    assert all(abs(r["gross_profit"] - (r["revenue"] - r["cost_of_revenue"])) < 1 for r in rows)
    # quarterly / nine-month entries never leak in: every fiscal window is ~365 days
    for r in rows:
        assert r["fy_start"] < r["fy_end"] and r["fy_end"][5:7] == "01"
    # restated comparative for FY2019 is logged as a variant, and the latest filed value wins
    v = [l for l in log if l["concept"] == "revenue" and l["fy_end"].startswith("2019")][0]
    assert v["n_variants"] == 2 and 0.002 < v["max_rel_dev"] < 0.004, v
    assert v["filed"] >= "2020-03-01", v["filed"]   # the comparative filed ~410 days after period end wins
    # 10-K/A duplicate of 2020 operating income does not create a second row
    assert sum(1 for r in rows if r["fiscal_year"] == 2020) == 1
    print("parse_facts: tag fallback, derived gross profit, quarterly filter, restatement log OK")


if __name__ == "__main__":
    main()
