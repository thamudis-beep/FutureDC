---
title: GPU Rental Market
type: concept
tags: [compute, gpu, rental, pricing, market-structure, ai-infrastructure]
created: 2026-04-05
updated: 2026-04-05
sources:
  - ../sources/semianalysis-2026-04-02-h100-rental-price-index.md
  - ../sources/moodys-2026-03-31-coreweave-dtl-a3-rating.md
---

# GPU Rental Market

The market for renting NVIDIA (and to a lesser extent AMD) accelerators —
the core input to AI training and inference. Supplied by **hyperscalers**
(AWS, Azure, GCP, OCI), **[neoclouds](neocloud.md)** (CoreWeave, Nebius,
IREN, Lambda, Runpod, etc.), and AI-lab captive capacity. Pricing is
dollar-per-GPU-per-hour across a term structure.

## Market structure (SemiAnalysis 2026)

Three segments, differing by tenor, counterparty, and pricing
dynamics: [^semi-2026-04]

| Segment | Tenor | Buyers | Pricing mechanism |
|---|---|---|---|
| **Short-term** | on-demand, spot, <3mo | residual / burst demand; price-taking tenants | fixed posted price; provider adjusts ad-hoc in response to **utilization** (not price-discovered real-time) |
| **Mid-term contracts** | 3mo–3yr+ | AI natives, smaller AI labs, non-AI-lab enterprise | **bilateral, price-discovered**, most volume by value; 1yr segment = marginal-demand indicator |
| **Long-term offtakes** | 4–5yr (5yr dominant) | Large AI labs (Anthropic, OpenAI, etc.); often hyperscaler-backstopped | negotiated multi-party deals; 50–100MW clusters (~24k–48k GB300 NVL72); bare-metal; debt-financed |

## Current state (Q1 2026)

- **H100 1-yr contract**: ~$2.35/hr/GPU by Mar 2026, up ~40% from $1.70 in Oct 2025. [^semi-2026-04]
- **On-demand sold out** across all major GPU types. [^semi-2026-04]
- AWS p6-b200 **spot at $14/hr/GPU**. [^semi-2026-04]
- **All Blackwell capacity through Aug–Sep 2026 booked**. [^semi-2026-04]
- H100 contracts **renewing at original 2-3yr rates**; some extending to 4yr through 2028. [^semi-2026-04]
- Reports of tenants **subletting** subdivided clusters ("Monaco Grand Prix apartment" analogy). [^semi-2026-04]

## Pricing history

- Before late 2025: consensus expected **Hopper rental prices to fall** as Blackwell ramped (lower Blackwell $/FLOP). [^semi-2026-04]
- Actual: H100 rentals **firmed then accelerated upward** late 2025 → 1Q26. [^semi-2026-04]
- Jan 2026: memory pricing (DRAM, NAND) went **parabolic** (LPDDR5 ~4x YoY, DDR5 ~5x YoY) → **OEM AI-server repricing above cost-pass-through** → supply slow-rolls → market tightens further. [^semi-2026-04]

## Key debates

- **Is this cycle different?** SemiAnalysis: self-reinforcing upcycle, ROIC and useful-life both improve. Public markets: still pricing "oversupply + commoditization" narrative (CoreWeave, Nebius, IREN at 6-12mo share-price lows). [^semi-2026-04]
- **GPU terminal value / useful life** — see [GPU useful life](gpu-useful-life.md).
- **Which tier of provider captures rents**: Neoclouds with short-duration roll-off vs. hyperscalers vs. AI-lab captive.

## Demand drivers

See [compute demand drivers](compute-demand-drivers.md).

## Related

- [Neocloud](neocloud.md), [Hyperscaler offtake](hyperscaler-offtake.md), [GPU useful life](gpu-useful-life.md), [Compute demand drivers](compute-demand-drivers.md)
- Entities: [CoreWeave](../entities/coreweave.md), [Meta](../entities/meta.md), [Anthropic](../entities/anthropic.md), [SemiAnalysis](../entities/semianalysis.md)

## Open questions

- When/if GB300 ramp outpaces token demand enough to loosen the 1yr segment.
- How far up the price curve before ROI on AI tools (reportedly 5-10x) starts to bind.
- Whether public-market sentiment recalibrates or fundamentals roll over first.

[^semi-2026-04]: [SemiAnalysis 2026-04-02](../sources/semianalysis-2026-04-02-h100-rental-price-index.md)
