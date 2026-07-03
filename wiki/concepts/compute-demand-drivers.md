---
title: Compute Demand Drivers
type: concept
tags: [compute, demand, workloads, agents, inference, tokens]
created: 2026-04-05
updated: 2026-04-05
sources: [../sources/semianalysis-2026-04-02-h100-rental-price-index.md]
---

# Compute Demand Drivers

What is actually consuming GPU compute and driving the 2025–2026 rental
price surge. Organized by workload type.

## Agentic / multi-step workflows

- **Multi-agent workflows** executing multi-step plans, high concurrency,
  continuous iteration → **parabolic growth in token + compute
  consumption**. [^semi-2026-04]
- Per-task token consumption dwarfs single-shot chat because each step
  iterates on prior outputs.
- **Claude Code** is the canonical example.

### Claude Code

- Developed by [Anthropic](../entities/anthropic.md).
- SemiAnalysis self-report: billions of tokens consumed over 7 days at
  ~$5/M tok avg; claims **return on tools ≥10x cost**. [^semi-2026-04]
- Projected by SemiAnalysis to be **20%+ of all daily commits globally by
  EOY 2026**. [^semi-2026-04]
- Drove Anthropic ARR from ~$9B → $25B+ in a single quarter. [^semi-2026-04]

## Open-weight model adoption

- Models like **GLM** and **Kimi K2.5** drove a **late-2025 surge** in
  open-model inference use cases. [^semi-2026-04]
- Captured by Neoclouds/hyperscalers via inference endpoints and by AI
  labs running internal training/inference on H100/H200. [^semi-2026-04]

## Native media generation

- **Seedance** (video) and **Nano Banana** (image/video) drove massive
  token-throughput increases in early 2026 as users generate and refine
  media at scale. [^semi-2026-04]
- Inference-heavy, often on latest Blackwell systems (GB300 NVL72 for
  large MoE). [^semi-2026-04]

## Training demand

- Training workloads often favor **H100** on a price-performance basis
  (not Blackwell) → explains surprising persistence of H100 demand
  post-Blackwell ramp. [^semi-2026-04]
- Capital raises by Anthropic, OpenAI, and "Neolabs" translate directly
  into GPU demand. [^semi-2026-04]

## ROI argument

SemiAnalysis thesis: if AI tools deliver **5–10x ROI** on user time, there
is a long runway before prices curtail demand. The token demand curve is
shifted up and out and is **relatively inelastic in the current regime**. [^semi-2026-04]

## Demand-side feedbacks

1. Memory-cost spike → OEM server repricing → project slow-rolls → supply
   withholding → tighter market. [^semi-2026-04]
2. Rental-price rise → Neoclouds race to lock hardware → tighter supply. [^semi-2026-04]
3. Higher rental prices → longer GPU useful life → better Neocloud ROIC. [^semi-2026-04]

## Related

- [GPU rental market](gpu-rental-market.md), [GPU useful life](gpu-useful-life.md)
- Entities: [Anthropic](../entities/anthropic.md)

## Open questions

- When (if) ROI-driven demand becomes price-elastic.
- Inference vs. training split in the demand mix.
- How much of agentic-workload growth is durable vs. experimentation.

[^semi-2026-04]: [SemiAnalysis 2026-04-02](../sources/semianalysis-2026-04-02-h100-rental-price-index.md)
