# Tech-sector productivity per FTE panel — rebuild everything from raw with one command.
#
#   make all                 full sample (needs SEC_USER_AGENT="Name email@example.com")
#   make pilot               the five validation firms only (NVDA GOOGL CRM ACN PG)
#   make FIRMS="NVDA AMD"    any subset
#   make demo                end-to-end run on 12 synthetic firms (no network); writes to demo/
#   make test                unit tests for the headcount parser + demo run
#
# Data hosts: data.sec.gov, www.sec.gov, fred.stlouisfed.org. Optional: layoffs.fyi CSV by hand.
PY      ?= python3
SRC     := src
FIRMS   ?=
PILOT   := NVDA GOOGL CRM ACN PG
export PYTHONPATH := $(SRC)

.PHONY: all pilot fetch ciks facts filings headcount deflators layoffs panel check analysis memo quality demo test clean

all: ciks facts filings headcount deflators layoffs panel check analysis quality memo

pilot:
	$(MAKE) all FIRMS="$(PILOT)"

fetch: ciks facts filings deflators

ciks:
	$(PY) $(SRC)/fetch_tickers.py $(FIRMS)

facts:
	$(PY) $(SRC)/fetch_facts.py $(FIRMS)
	$(PY) $(SRC)/parse_facts.py $(FIRMS)

filings:
	$(PY) $(SRC)/fetch_filings.py $(FIRMS)

headcount:
	$(PY) $(SRC)/parse_headcount.py $(FIRMS)

deflators:
	$(PY) $(SRC)/fetch_deflators.py

layoffs:
	$(PY) $(SRC)/fetch_layoffs.py

panel:
	$(PY) $(SRC)/build_panel.py

check:
	$(PY) $(SRC)/checks.py

analysis:
	$(PY) $(SRC)/analysis_descriptive.py
	$(PY) $(SRC)/analysis_break.py
	$(PY) $(SRC)/analysis_did.py --treatment mentions
	$(PY) $(SRC)/analysis_did.py --treatment disclosed || true
	$(PY) $(SRC)/analysis_decomp.py
	$(PY) $(SRC)/analysis_capex.py

quality:
	$(PY) $(SRC)/write_data_quality.py

memo:
	$(PY) $(SRC)/write_memo.py

# ---- offline validation ----------------------------------------------------------
demo:
	rm -rf demo && $(PY) tests/make_fixtures.py demo/data
	FTE_DATA_DIR=demo/data FTE_FIGURES_DIR=demo/figures FTE_RESULTS_DIR=demo/results FTE_DOCS_DIR=demo \
	FTE_COMPANIES=demo/companies_demo.yaml SEC_USER_AGENT="fixture run nobody@example.com" $(MAKE) all

test:
	$(PY) tests/test_headcount.py
	$(PY) tests/test_parse_facts.py
	$(MAKE) demo

clean:
	rm -rf data/interim results figures demo
