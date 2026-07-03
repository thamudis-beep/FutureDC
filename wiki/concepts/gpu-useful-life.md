---
title: GPU Useful Life & Terminal Value
type: concept
tags: [accounting, depreciation, terminal-value, compute, gpu, roic]
created: 2026-04-05
updated: 2026-04-05
sources:
  - ../sources/semianalysis-2026-04-02-h100-rental-price-index.md
  - ../sources/moodys-2026-03-31-coreweave-dtl-a3-rating.md
---

# GPU Useful Life & Terminal Value

Live debate on **how long AI GPUs (H100/H200/Blackwell) economically
perform** — i.e., how long they generate rental cash flows at
commercially meaningful prices before being displaced by newer
accelerators or commoditized.

## Why it matters

- Sets **depreciation schedules** on hyperscaler + Neocloud balance sheets
  → affects reported earnings and ROIC. [^semi-2026-04]
- Anchors **equity valuation** of Neoclouds (terminal-value tails). [^semi-2026-04]
- Drives **debt tenor and DSCR** assumptions in project finance. [^moodys-2026-03]

## Positions

### Public-market (pre-2026) / financial-analyst consensus

- **Steep fall in GPU rental rates** as successive generations ramp. [^semi-2026-04]
- **6-year depreciation period** deemed aggressive; analysts "chastised"
  Neoclouds/hyperscalers using it. [^semi-2026-04]
- Expected Hopper prices to **drop sharply** as Blackwell ramped (lower
  Blackwell $/FLOP). [^semi-2026-04]
- Narrative: **oversupply + commoditization** → low terminal value.

### SemiAnalysis (2026-04)

- Exactly the opposite happened in late 2025: **H100 prices firmed and
  then accelerated**. [^semi-2026-04]
- **H100 contracts being renewed at original 2-3yr rates**, some
  extending to 4yr through 2028. [^semi-2026-04]
- Thesis: higher rental rates **extend economic useful life** of existing
  GPUs → invested capital generates cash flows for longer before
  reinvestment is needed. [^semi-2026-04]
- Useful life is endogenous to demand, not fixed by generation cadence.

### Moody's (2026-03, implied)

- In rating CoreWeave SPV VIII A3 stable, Moody's flags **power costs,
  install timelines, counterparty credit, force majeure** as primary
  risks. [^moodys-2026-03]
- **GPU obsolescence / terminal value is not in the primary risk list**. [^moodys-2026-03]
- Debt is **fully amortizing inside the 6yr MSA** → terminal-value
  question is structurally punted (no residual equity risk from GPUs
  after debt retires). [^moodys-2026-03]

## Evidence

| Data point | Source |
|---|---|
| H100 1yr rentals +40% Oct-25 → Mar-26 | [^semi-2026-04] |
| H100 renewals at original price, some to 2028 | [^semi-2026-04] |
| Training workloads still prefer H100 on $/perf | [^semi-2026-04] |
| GB300 NVL72 winning **inference-at-scale** on MoE | [^semi-2026-04] |
| 6yr MSA structure (Meta-CoreWeave) treats GPU as productive through 2031 | [^moodys-2026-03] |

## Open questions

- What is the right **economic half-life** of H100/H200 in a high-demand
  regime (vs. assumed 3–4yr)?
- Does **training-vs-inference workload split** by generation persist
  (H100 → training, Blackwell → inference MoE)?
- If demand moderates, how quickly does pricing normalize — and does
  useful life shorten symmetrically?
- Will accounting depreciation schedules move to 6+ years across the
  industry?

## Related

- [GPU rental market](gpu-rental-market.md), [Neocloud](neocloud.md), [Hyperscaler offtake](hyperscaler-offtake.md)
- Entities: [SemiAnalysis](../entities/semianalysis.md), [Moody's](../entities/moodys.md), [CoreWeave](../entities/coreweave.md)

[^semi-2026-04]: [SemiAnalysis 2026-04-02](../sources/semianalysis-2026-04-02-h100-rental-price-index.md)
[^moodys-2026-03]: [Moody's 2026-03-31](../sources/moodys-2026-03-31-coreweave-dtl-a3-rating.md)
