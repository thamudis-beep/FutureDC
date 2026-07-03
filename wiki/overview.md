---
title: AI Economics — Overview
type: overview
tags: [ai-economics]
created: 2026-04-04
updated: 2026-04-05
---

# AI Economics — Overview

Top-level synthesis of the domain. Revised whenever a new source materially
shifts the picture.

## Scope

How artificial intelligence — broadly, systems that automate cognitive work —
reshapes:

- **Labor**: wages, skill demand, task composition, displacement, complementarity.
- **Productivity**: firm-level and aggregate TFP, diffusion lags, measurement.
- **Markets**: market structure, concentration, pricing, entry.
- **Capital & compute**: GPUs as a factor of production, project finance, useful life, capex cycles.
- **Institutions**: policy, regulation, education, safety nets.
- **Distribution**: inequality, geography, winners and losers.

## Working thesis (as of 2026-04-05)

Early seed sources anchor the **compute-supply-chain** side of the story:

1. **The 2025–2026 GPU rental cycle is a self-reinforcing upcycle, not a
   commoditization.** H100 1-yr contracts rose ~40% Oct-25 → Mar-26; all
   capacity booked through Aug–Sep 2026; H100s renewing at original rates
   through 2028. Public-market sentiment on Neoclouds (CoreWeave, Nebius,
   IREN) lags fundamentals. [^semi-2026-04]
2. **Demand is ROI-driven and currently inelastic.** Drivers: agentic
   workloads (Claude Code → Anthropic ARR $9B → $25B+ in one quarter),
   open-weight models (GLM, Kimi K2.5), native media generation (Seedance,
   Nano Banana). Claimed 5–10x ROI on AI tools vs. cost → far runway
   before prices curtail demand. [^semi-2026-04]
3. **Capex is flowing through hyperscaler-backstopped project finance.**
   Worked example: $8.5B CoreWeave SPV financing GB300 NVL72 for Meta on
   6yr take-or-pay MSA — SPV rated **A3** vs. parent **Ba3** (~5-notch
   uplift from ring-fenced structure + IG counterparty). Primary risk
   flagged is **power-cost volatility**, not GPU obsolescence. [^moodys-2026-03]
4. **GPU useful life is endogenous to demand.** SemiAnalysis: rising
   rents extend economic life, improve ROIC. Moody's: amortizes inside
   6yr MSA, terminal-value question sidestepped structurally. Public
   markets: still pricing obsolescence risk. [^semi-2026-04] [^moodys-2026-03]

## Open questions

- **Demand durability**: How much of the agentic-workload surge is
  experimentation vs. durable production?
- **Elasticity**: At what price point does ROI-driven demand become
  price-elastic?
- **Power**: Power-cost volatility is the dominant project-finance risk
  per Moody's — needs its own page once power sources accrue.
- **Supply resolution**: Does GB300 ramp in 2026 + resolution of silicon
  shortages ease pricing, or does token demand outrun supply additions?
- **Labor & distribution side**: Still unrepresented in current sources.
  Need ingests on productivity, wages, displacement, inequality.
- **Public-market dislocation**: Does CoreWeave/Nebius/IREN share-price
  narrative re-rate or do fundamentals revert first?

## Key sources

See [sources/](sources/) and the [index](index.md).

[^semi-2026-04]: [SemiAnalysis 2026-04-02](sources/semianalysis-2026-04-02-h100-rental-price-index.md)
[^moodys-2026-03]: [Moody's 2026-03-31](sources/moodys-2026-03-31-coreweave-dtl-a3-rating.md)
