---
title: "SemiAnalysis — The Great GPU Shortage (H100 1Y Rental Price Index launch)"
type: source
tags: [compute, gpu, rental-market, neocloud, pricing, claude-code, inference, capex]
created: 2026-04-05
updated: 2026-04-05
raw: ../../raw/semianalysis-2026-04-02-h100-rental-price-index.md
---

# SemiAnalysis — The Great GPU Shortage (2026-04-02)

## Bibliographic

- **Authors**: Daniel Nishball, Jordan Nanos, Cheang Kang Wen + 2 others; guest post by Nigel Chiang
- **Publication**: [SemiAnalysis](../entities/semianalysis.md) (research newsletter)
- **Date**: 2026-04-02
- **Raw**: [../../raw/semianalysis-2026-04-02-h100-rental-price-index.md](../../raw/semianalysis-2026-04-02-h100-rental-price-index.md)

## TL;DR

H100 1-year rental contracts up **~40%** (Oct 2025 → Mar 2026, $1.70 → $2.35/hr/GPU). On-demand sold out across all GPU types. All capacity coming online through **Aug-Sep 2026 already booked**. Drivers: agentic workloads (Claude Code), open-weight models (GLM, Kimi K2.5), native media generation (Seedance, Nano Banana), and Anthropic ARR tripling ($9B → $25B in one quarter). Public-market sentiment on Neoclouds (CoreWeave, Nebius, IREN) remains bearish despite tightening — the "oversupply and commoditization" narrative persists. SemiAnalysis thesis: **pricing is a self-reinforcing upcycle** (tight supply → secure hardware → tighter supply).

## Key claims

1. **H100 1-yr contract price rose ~40% in 6 months**, $1.70/hr (Oct 2025) → $2.35/hr (Mar 2026).
2. **Anthropic ARR tripled in one quarter**: $9B (EOY 2025) → $25B+ (as of publication).
3. **Blackwell supply is booked through Aug–Sep 2026**; Hopper capacity "not coming off contract at all" for most providers.
4. H100 contracts being **renewed at original 2-3yr rates**; some renewed for 4 years through 2028.
5. AWS p6-b200 **spot at $14/hr/GPU**.
6. **Claude Code projected to be 20%+ of daily commits globally by end of 2026** (SemiAnalysis "Claude Commits Daily" tracker).
7. Memory pricing parabolic in 1Q26: LPDDR5 tracking ~4x YoY, DDR5 ~5x YoY.
8. OEMs repriced AI servers **above** component-cost inflation → margin-risk management → supply slow-rolls → further tightening.
9. **Market structure** has three segments:
   - **Short-term** (on-demand, spot, <3mo): fixed-price, utilization-adjusted (Runpod, Lambda).
   - **Mid-term** (3mo–3yr+): price-discovered contracts, most volume by value, 1yr as marginal-demand indicator.
   - **Long-term offtakes** (4–5yr, 5yr most popular): AI-lab-dominated, 50–100MW clusters (~24k–48k GB300 NVL72 GPUs), bare-metal, often hyperscaler-backstopped.
10. Hyperscaler backstop structure: Hyperscaler acts as direct offtaker to Neocloud, on-sells to AI Lab. Gives Neocloud AAA-rated counterparty for debt financing, teens-IRR lock-in; Hyperscaler captures slice of project revenue without balance-sheet expansion.
11. Index methodology: monthly survey of **100+ market participants** (Neoclouds, buyers), 25th–75th percentile range, validated by transaction data.
12. **Public-market sentiment mispriced**: CoreWeave, Nebius, IREN at low end of 6-12mo trading range despite supply tightening.
13. Beneficiaries with shorter-duration contracts + large H100 install bases + near-term capacity additions.
14. Check-points to watch: (a) GB300 ramp pace vs. token demand, (b) silicon shortage (TSMC N3, HBM, DRAM, NAND), (c) AI-lab ARR growth.

## How this updates the wiki

- **Establishes the baseline state of the GPU rental market (Q1 2026)** — this is the first source, so all concept pages and the overview anchor on it.
- Introduces the **neocloud / hyperscaler / AI-lab** market structure as the frame for future compute-economics sources.
- Flags the **public-market-vs-private-market dislocation** on GPU terminal value as a live open question.

## Entities touched

- [SemiAnalysis](../entities/semianalysis.md) — publisher
- [Anthropic](../entities/anthropic.md) — ARR data point
- [CoreWeave](../entities/coreweave.md) — neocloud, share-price-sentiment example
- [Meta](../entities/meta.md) — hyperscaler backstop reference

## Concepts touched

- [GPU rental market](../concepts/gpu-rental-market.md) — primary topic
- [Neocloud](../concepts/neocloud.md) — core market actor
- [Hyperscaler offtake](../concepts/hyperscaler-offtake.md) — backstop structure
- [Compute demand drivers](../concepts/compute-demand-drivers.md) — Claude Code, agents, media gen
- [GPU useful life](../concepts/gpu-useful-life.md) — terminal value / depreciation debate
