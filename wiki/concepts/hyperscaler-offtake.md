---
title: Hyperscaler Offtake
type: concept
tags: [project-finance, contracting, compute, msa, credit-uplift]
created: 2026-04-05
updated: 2026-04-05
sources:
  - ../sources/semianalysis-2026-04-02-h100-rental-price-index.md
  - ../sources/moodys-2026-03-31-coreweave-dtl-a3-rating.md
---

# Hyperscaler Offtake

A **project-finance structure** for Neocloud GPU clusters where a
hyperscaler (AWS, Azure, GCP, Meta, etc.) signs a long-term take-or-pay
Master Services Agreement (MSA) backstopping a bankruptcy-remote SPV that
owns the GPU infrastructure. The SPV uses the MSA cash flows to service
debt.

## Why it exists

1. **Neoclouds** get AAA-adjacent credit counterparty → favorable debt
   terms matched to contract tenor → locks in ~teens project IRR, removes
   duration + GPU-price risk. [^semi-2026-04]
2. **Hyperscalers** gain balance-sheet-light access to GPU capacity —
   collect a slice of project economics without expanding their own
   balance sheet. Can on-sell the compute to an AI Lab. [^semi-2026-04]
3. **AI Labs** get massive compute allocations in one deal without having
   to raise / deploy own project debt. [^semi-2026-04]

Structure is a win-win-win in the current (tight) market. [^semi-2026-04]

## Mechanics

- Large bilateral contracts, typically 4–5yr (5yr preferred). [^semi-2026-04]
- 50–100MW clusters (~24k–48k GB300 NVL72 GPUs per deal). [^semi-2026-04]
- **Bare-metal** deals — AI Lab customizes storage, networking, CPU,
  interconnect layers. [^semi-2026-04]
- Common pattern: Hyperscaler = direct MSA offtaker → on-sells compute to
  AI Lab downstream. [^semi-2026-04]

## Credit-uplift mechanism

The ring-fenced SPV can be rated **multiple notches above the Neocloud
parent** because: [^moodys-2026-03]

- Revenue is fixed, usage-independent, non-terminable for convenience.
- Counterparty is investment-grade hyperscaler.
- Lender protections: direct agreement with offtaker, cure/step-in/replacement
  rights, license of operator IP (continues through parent bankruptcy).
- Fully amortizing debt inside MSA tenor → no refi risk.

## Worked example: CoreWeave Compute Acquisition Co. VIII, LLC

| Field | Value |
|---|---|
| Sponsor | CoreWeave (Ba3) |
| Offtaker | Meta (Aa3) |
| Integrator | Dell (Baa3) |
| Assets | NVIDIA GB300 NVL72 |
| Sites | VA, ND, GA |
| Tenor | 6yr MSA |
| Debt | $8.5B Senior Secured DDTL |
| SPV rating | **A3 stable** |
| Uplift | ~5 notches above sponsor |
| DSCR (Moody's base) | 1.20x through 2031 |

Source: [Moody's 2026-03-31](../sources/moodys-2026-03-31-coreweave-dtl-a3-rating.md).

## Primary risks

- **Power cost at unhedged sites** (dominant per Moody's — fixed MSA
  payments mean all opex absorbed by project). [^moodys-2026-03]
- Install/commissioning timeline → pricing penalties, termination rights. [^moodys-2026-03]
- Offtaker credit deterioration. [^moodys-2026-03]
- Force majeure events at the project site(s). [^moodys-2026-03]

GPU obsolescence / terminal value is **notably absent** from Moody's
primary risk list.

## Economic significance

Long-term offtakes represent "a very large proportion of the overall
Neocloud GPU rental market" by value. [^semi-2026-04] They are the
channel through which **frontier-AI capex shows up in credit markets** —
a distinct financing track from hyperscaler on-balance-sheet capex or
AI-lab equity raises.

## Related

- [Neocloud](neocloud.md), [GPU rental market](gpu-rental-market.md), [GPU useful life](gpu-useful-life.md)
- Entities: [CoreWeave](../entities/coreweave.md), [Meta](../entities/meta.md), [Moody's](../entities/moodys.md)

## Open questions

- How many such SPV structures exist across CoreWeave, Nebius, etc.
- Aggregate dollar volume of hyperscaler-backstopped GPU project debt
  outstanding.
- Whether AI-lab-direct offtakes (no hyperscaler intermediation) can
  achieve similar credit uplift.

[^semi-2026-04]: [SemiAnalysis 2026-04-02](../sources/semianalysis-2026-04-02-h100-rental-price-index.md)
[^moodys-2026-03]: [Moody's 2026-03-31](../sources/moodys-2026-03-31-coreweave-dtl-a3-rating.md)
