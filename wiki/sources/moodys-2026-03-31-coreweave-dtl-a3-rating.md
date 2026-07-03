---
title: "Moody's — A3 rating on CoreWeave Compute Acquisition Co. VIII ($8.5B DDTL)"
type: source
tags: [compute, gpu, project-finance, coreweave, meta, credit-rating, offtake, msa, gb300]
created: 2026-04-05
updated: 2026-04-05
raw: ../../raw/moodys-2026-03-31-coreweave-dtl-a3-rating.md
---

# Moody's — A3 on CoreWeave SPV ($8.5B DDTL for Meta GB300 cluster) (2026-03-31)

## Bibliographic

- **Analysts**: Radi Annab (VP Senior Analyst), Kurt Krummenacker (Associate MD)
- **Publication**: [Moody's Ratings](../entities/moodys.md) (Moody's Canada Inc.)
- **Date**: 2026-03-31
- **Type**: rating action (first-time assignment)
- **Raw**: [../../raw/moodys-2026-03-31-coreweave-dtl-a3-rating.md](../../raw/moodys-2026-03-31-coreweave-dtl-a3-rating.md)

## TL;DR

Moody's assigns **A3 (stable)** to a **$8.5B Senior Secured Delayed Draw Term Loan** for **CoreWeave Compute Acquisition Co. VIII, LLC** — a bankruptcy-remote SPV financing **NVIDIA GB300 NVL72 servers** deployed across three sites (VA/ND/GA) under a **6-year take-or-pay MSA with Meta**. Dell provides turnkey integration. **SPV gets investment-grade (A3) while CoreWeave parent is junk (Ba3)** — the credit uplift is the concrete mechanism of the "hyperscaler backstop" structure. Base-case DSCR **1.20x** (Moody's), stressed floor **1.11x**. Primary risk flagged: **power-price volatility**, not GPU obsolescence.

## Key claims

1. **Facility**: ~$8.5B Senior Secured DDTL, fully amortizing, matures <5yr after 15-month delayed-draw period.
2. **Tranche mix**: $4,041M fixed + $4,459M floating (floating ≥95% hedged to maturity).
3. **Assets**: NVIDIA GB300 NVL72 servers at 3 sites — Virginia, North Dakota, Georgia.
4. **Counterparty**: 6-year take-or-pay MSA with **Meta Platforms (Aa3 stable)**. Payments are fixed and usage-independent. MSA cannot be terminated for convenience.
5. **Ratings uplift**: SPV rated **A3** vs. CoreWeave parent **Ba3 stable** → ~5-notch uplift from the ring-fenced project-finance structure backed by Meta's Aa3 credit.
6. **Structural protections**:
   - Level-3 testing commissioning gate before drawdowns.
   - Direct agreement with Meta granting lenders cure, assignment, replacement contract rights.
   - License of CoreWeave operational IP → operations continue through CoreWeave bankruptcy.
7. **OEM**: Dell Inc. (Baa3 stable) delivers turnkey integration.
8. **Operating track record**: CoreWeave ~3 years in AI GPU-as-a-service at hyperscaler scale; historical **SLA breaches <1%** (excluding scheduled maintenance, power, hardware, FM, customer-side).
9. **DSCR**: borrower base 1.26x (through 2031); Moody's base 1.20x; stressed downsides maintain floor **>1.11x**.
10. **Primary risk**: **power-price volatility at unhedged sites**. Fixed Meta payments mean all opex (power, DC, capex) absorbed by project.
11. **Power mitigations**: long-dated fixed-for-floating hedge at largest site; dynamic power-cost reserve mechanism; 3-month liquidity reserve covering debt service + opex + hedge settlements.
12. **Refinancing risk**: none — fully amortizes inside MSA term.
13. **Key downgrade triggers**: install-timeline failure, power-cost blowout, Meta credit deterioration, force majeure.
14. SPV is Delaware-organized, bankruptcy-remote, ring-fenced from CoreWeave parent credit.

## How this updates the wiki

- **Instantiates** the hyperscaler-backstopped offtake structure described abstractly by [SemiAnalysis](semianalysis-2026-04-02-h100-rental-price-index.md) (claim #10) with **concrete numbers**: $8.5B, 6yr, Meta-CoreWeave-Dell, GB300 NVL72.
- **Challenges** the public-market "GPU terminal-value collapse" narrative: Moody's stresses DSCRs under severe downside and maintains IG. GPU obsolescence is *not* flagged as a primary risk.
- Introduces **power cost** as the dominant project-finance risk for AI clusters — a thread to pull on in future sources.
- Confirms CoreWeave operating performance (SLA <1% breach rate) and limited track record (~3yr).

## Entities touched

- [Moody's](../entities/moodys.md) — rating agency
- [CoreWeave](../entities/coreweave.md) — project sponsor, Ba3 stable
- [Meta](../entities/meta.md) — MSA offtaker, Aa3 stable
- (Dell, Baa3 stable — OEM integrator, mentioned inline)

## Concepts touched

- [Hyperscaler offtake](../concepts/hyperscaler-offtake.md) — concrete instantiation
- [GPU rental market](../concepts/gpu-rental-market.md) — long-term-offtake segment
- [GPU useful life](../concepts/gpu-useful-life.md) — Moody's credit view
- [Compute demand drivers](../concepts/compute-demand-drivers.md) — Meta's build-out as signal
