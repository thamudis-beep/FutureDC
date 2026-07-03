---
title: Neocloud
type: concept
tags: [compute, gpu, cloud, market-structure, ai-infrastructure]
created: 2026-04-05
updated: 2026-04-05
sources:
  - ../sources/semianalysis-2026-04-02-h100-rental-price-index.md
  - ../sources/moodys-2026-03-31-coreweave-dtl-a3-rating.md
---

# Neocloud

**Specialty GPU-cloud providers** focused on renting NVIDIA (and AMD) AI
accelerators to hyperscalers and AI labs. Distinct from classical
hyperscalers (AWS, Azure, GCP, OCI) in that AI compute is the core
product, not one service line among many.

## Examples

- **Public**: CoreWeave, Nebius, IREN. [^semi-2026-04]
- **Private / other**: Lambda, Runpod (short-term/spot focus), Neolabs
  tier. [^semi-2026-04]

## Business model

- Buy GPUs + datacenter capacity → rent at $/hr/GPU across tenors.
- Revenue mix skews to **mid-term contracts (3mo–3yr)** and **long-term
  offtakes (4–5yr)**; short-term/spot is residual-capacity monetization. [^semi-2026-04]
- Prefer 1yr+ contracts; 2-3yr preferred; 5yr large offtakes ideal. [^semi-2026-04]
- **Debt-financed** at the project level against long-duration offtake
  contracts — typically via project-finance SPVs backstopped by
  hyperscaler counterparties. [^moodys-2026-03]

## Financing structure (worked example: CoreWeave SPV VIII)

| Element | Value |
|---|---|
| Vehicle | Bankruptcy-remote Delaware SPV |
| Debt | $8.5B Senior Secured DDTL (~47% fixed / 53% floating, 95%+ hedged) |
| Offtaker | Meta (Aa3 stable) — 6yr take-or-pay MSA |
| Assets | NVIDIA GB300 NVL72 across VA, ND, GA |
| Integrator | Dell (Baa3 stable), turnkey |
| SPV rating | A3 stable (vs. CoreWeave parent Ba3 stable) |
| DSCR (Moody's base) | 1.20x through 2031 |
| Structure | Fully amortizing, no refi risk, lender step-in rights, IP license |

Source: [Moody's 2026-03-31](../sources/moodys-2026-03-31-coreweave-dtl-a3-rating.md).

## Current positioning (Q1 2026)

- "In the driver's seat" on negotiations — can demand **higher prepay
  (>20% on 4yr+)**, longer tenors, favorable start/end dates. [^semi-2026-04]
- Some **no longer sell single nodes**. [^semi-2026-04]
- Public equity trading weak despite tightening — 6-12mo lows for
  CoreWeave, Nebius, IREN. [^semi-2026-04]

## Key risks

- **Power-cost volatility** at unhedged sites — primary risk flagged by
  Moody's for CoreWeave SPV VIII (fixed MSA payments mean all opex
  absorbed by project). [^moodys-2026-03]
- **GPU useful life / terminal value** — see [GPU useful life](gpu-useful-life.md).
- **Customer concentration** around a handful of mega-offtakes.

## Related

- [GPU rental market](gpu-rental-market.md), [Hyperscaler offtake](hyperscaler-offtake.md), [GPU useful life](gpu-useful-life.md)
- Entities: [CoreWeave](../entities/coreweave.md), [Meta](../entities/meta.md)

## Open questions

- Unit economics across Neoclouds as memory/server costs stay elevated.
- Stranded-asset risk if silicon shortage eases + demand moderates.

[^semi-2026-04]: [SemiAnalysis 2026-04-02](../sources/semianalysis-2026-04-02-h100-rental-price-index.md)
[^moodys-2026-03]: [Moody's 2026-03-31](../sources/moodys-2026-03-31-coreweave-dtl-a3-rating.md)
