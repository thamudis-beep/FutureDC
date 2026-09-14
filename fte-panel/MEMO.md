# Memo: is there an AI break in tech output per employee?

> **Not yet run on real data.** The SEC and FRED hosts were unreachable from the environment this pipeline was built in, so every slot below reads [pending]. Run `make pilot`, then `make all`, and the tables fill from `results/`. The reading rules in sections 2 and 4 were fixed before any result was seen and should be applied as written.

_Numbers in this memo are filled by `src/write_memo.py` from `results/`; run `make all` to regenerate. Sample: [pending] firms, [pending] firm-years, FY2015–FY[pending], USD filers with a resolved headcount. Real values in 2024 dollars (PCE)._

## 1. What the data show

**Levels and trend.** Cohort medians of real revenue per FTE, each firm indexed to its own 2019:

[pending]

**Break at FY2023.** Per-firm log growth of real revenue/FTE, controlling for the FY2022 overhiring residual (deviation from the firm's 2015–19 log-headcount trend). The post-2023 column is the mean shift in annual growth; the Chow test asks whether the growth process changed at 2023; sup-F is the break year the data prefer, which is only informative if it is 2023.

[pending]

**Decomposition FY2022 → latest.** Of the [pending] firms with both years, [pending] owe more of their revenue/FTE change to a smaller denominator than to revenue growth at constant headcount. The ten largest are in `figures/decomposition_waterfall.png`. [pending]

## 2. What can be attributed to AI, and what cannot

The identifying comparison is within-cohort: firms whose FY2023–24 annual reports are AI-heavy versus firms in the same cohort that are not, with firm and cohort×year fixed effects, so sector-wide cost-cutting, the interest-rate regime and the overhiring hangover common to a cohort are differenced out. Treated firms ([pending]): [pending].

[pending]

Event-study coefficients by year are in `figures/event_study_mentions.png`; the pre-2022 coefficients are the parallel-trends check. **Placebo** (2015–22 sample, fake break at 2018): [pending]

Reading rules, fixed before the numbers were seen:

- A post-2023 growth shift that is significant for software and semis but not for IT services or non-tech, with a flat pre-trend and a null placebo, is consistent with an AI-era break. It is still not proof of AI causation: the treatment is what firms *say*, measured after the break.
- A shift that is equally present in non-tech, or that vanishes once the overhiring residual is included, is reversion, not AI.
- If the sup-F picks 2021 or 2022 rather than 2023, the break is the hiring cycle.
- Capital deepening: `figures/capex_vs_productivity.png`. Δlog capex/FTE explains Δlog revenue/FTE with β = [pending] (95% CI [pending], n = [pending]); a large positive β with NVDA and the hyperscalers driving it means the per-head gain is bought with capital, not with software.
- Pass-through: median cost-of-revenue share in software moved from [pending] (2022) to [pending] ([pending]). A rising share alongside rising revenue/FTE means AI spend moved off the payroll to vendors and looks like productivity in a per-employee ratio.
- Contractor substitution is unmeasurable in filings; [pending] firm-years mention contractors in the employee section and are flagged in the panel.

## 3. Effect sizes

Static difference-in-differences on log real revenue/FTE, treated × post-2023: [pending]. With the overhiring residual × post control: [pending]. On log real operating income/FTE: [pending] ([pending] operating-loss firm-years drop out of the log).

Per-cohort post-2023 growth shifts with firm-clustered standard errors are in the table above and in `results/break_tests.csv`.

## 4. What would change my mind

- **Toward AI causation:** the treated-minus-control gap opening only from 2023, no pre-trend, null placebo; the gap surviving the overhiring control; the gap present in gross profit and operating income per head, not only revenue (so it is not price); cost-of-revenue share flat (so it is not vendor pass-through); the effect concentrated in firms with a quantified disclosure in `ai_deployment_flags.yaml`, not merely AI-heavy prose.
- **Away from it:** the same break in the non-tech control; the effect disappearing under cohort×year fixed effects; sup-F at 2021–22; capex/FTE explaining most of the cross-section; headcount effects dominating the decomposition with layoffs.fyi tags on the largest movers; per-FTE gains that reverse when 2025–26 hiring resumes.
- **Data that would sharpen this:** average rather than year-end headcount; contractor and outsourcing spend; the private AI-native firms in `private_ai_natives.yaml` once their figures are cited; exchange rates to bring TSM, Wipro and Spotify into the USD sample.

Data caveats, every parsing failure and every imputed or derived value: `DATA_QUALITY.md`.
