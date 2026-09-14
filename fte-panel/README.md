# Tech-sector productivity per FTE, 2015–2026

A reproducible firm-year panel of revenue, gross profit and operating income per
full-time employee for public US tech companies, five tech cohorts plus a non-tech
control, built from free sources only (SEC EDGAR XBRL + 10-K text, FRED), with the
tests needed to say whether the post-ChatGPT period (FY2023 on) shows a break in
per-FTE output that survives the obvious confounds.

The brief and rules are in the project description; the honest state of the data is in
`DATA_QUALITY.md`; the findings are in `MEMO.md`.

## Rebuild

```
pip install -r requirements.txt
export SEC_USER_AGENT="Your Name you@example.com"   # SEC requires this
make pilot        # NVDA GOOGL CRM ACN PG end to end, ~2 minutes
make all          # full sample
make demo         # synthetic fixtures, no network — proves the pipeline runs end to end
```

Every raw response is cached under `data/raw/` with a `.meta.json` sidecar (URL, time,
SHA-256). Set `FTE_REFRESH=1` to re-download.

## Layout

| path | what |
|---|---|
| `companies.yaml` | the sample: ticker, CIK, fiscal-year-end month, cohort, filing form, notes |
| `benchmarks.yaml` | sanity benchmarks that `make check` fails loudly on |
| `ai_deployment_flags.yaml` | manual, source-cited flags of disclosed internal AI deployment (empty until filled) |
| `private_ai_natives.yaml` | placeholder for private AI-native firms; excluded from every regression |
| `src/fetch_*.py` | SEC ticker file, companyfacts, submissions + annual reports, FRED, layoffs.fyi CSV |
| `src/parse_facts.py` | annual XBRL values with tag fallbacks and restatement logging |
| `src/parse_headcount.py` | headcount sentence extraction + scoring, AI-term counts |
| `src/llm_fallback.py` | optional (`HEADCOUNT_LLM=1`) tie-breaker that only picks among extracted sentences |
| `src/build_panel.py` | merge, deflate to 2024 $, per-FTE metrics, growth gaps, overhiring residual |
| `src/checks.py` | benchmarks and plausibility checks |
| `src/analysis_*.py` | cohort indices, break tests, DiD / event study + placebo, decomposition, capex |
| `src/write_data_quality.py`, `src/write_memo.py` | generate `DATA_QUALITY.md` and fill `MEMO.md` from `results/` |
| `data/panel.csv` | the deliverable panel |
| `figures/`, `results/` | charts and machine-readable results |

## Panel columns (data/panel.csv)

Identity: `ticker cohort sector fiscal_year cal_year fy_start fy_end currency usd form`.
`fiscal_year` is the year the fiscal year ends (the company's own label); `cal_year`
shifts fiscal years ending January–May back one year so cross-firm comparisons line up.

Financials (reporting currency, as filed, most recently filed value for the period):
`revenue cost_of_revenue gross_profit operating_income ebitda net_income capex sbc rnd dna
value_added`, each with a `<name>_tag` column naming the XBRL tag used
(`derived:` when computed), and `financials_source_url`.

Headcount: `headcount headcount_sentence headcount_method headcount_score
includes_part_time mentions_contractors ambiguous section_found headcount_source_url
dei_employees headcount_vs_dei_reldiff`.

Metrics: `rev_per_fte gp_per_fte oi_per_fte ebitda_per_fte va_per_fte capex_per_fte
sbc_per_fte rnd_per_fte` (nominal) and `*_real` (2024 dollars, PCE-deflated),
`capex_to_rev cogs_share sbc_to_rev oi_margin`, `deflator_pce deflator_cpi deflator_months`.

Dynamics: `headcount_growth revenue_growth revenue_growth_real decoupling
d_log_rev_per_fte_real overhire_resid overhire_resid_2021 overhire_resid_2022
pretrend_headcount_growth`. Context: `ai_per_10k_words ml_per_10k_words ai_terms_total
words layoff_events layoff_total layoff_sources`.
