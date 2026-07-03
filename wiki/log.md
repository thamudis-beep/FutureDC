---
title: Wiki Log
type: log
updated: 2026-04-04
---

# Log

Append-only chronological record. Every entry starts with
`## [YYYY-MM-DD] <op> | <title>` so it is grep-parseable:

```
grep "^## \[" wiki/log.md | tail -10
```

Never edit past entries; only append.

---

## [2026-04-04] init | wiki scaffolded

Created initial wiki structure per `CLAUDE.md` schema. Empty
`index.md`, `overview.md`, and directories `entities/`, `concepts/`,
`sources/`, `syntheses/`. Ready for first ingest.

## [2026-04-05] ingest | SemiAnalysis — The Great GPU Shortage (H100 1Y Rental Price Index)

First ingest. Dated 2026-04-02. Established compute-supply-chain anchor for
the wiki: H100 1yr rentals +40% Oct-25 → Mar-26, on-demand sold out,
Aug-Sep 2026 capacity fully booked, self-reinforcing upcycle thesis.
Created source summary, 2 entities (SemiAnalysis, Anthropic), and 4
concept pages (gpu-rental-market, neocloud, compute-demand-drivers,
gpu-useful-life). Rewrote `overview.md` with working thesis. Updated
`index.md`.

## [2026-04-05] ingest | Moody's — A3 on CoreWeave Compute Acquisition Co. VIII

Dated 2026-03-31. $8.5B SPV DDTL financing GB300 NVL72 under 6yr Meta MSA
across VA/ND/GA; Dell turnkey. SPV A3 vs. CoreWeave parent Ba3 — concrete
instance of the hyperscaler-backstopped offtake structure abstractly
described by SemiAnalysis (~5-notch uplift). Primary risk flagged: power
cost, not GPU obsolescence. Created source summary + 3 entities (Moody's,
CoreWeave, Meta) + `hyperscaler-offtake` concept; cross-linked and
updated `gpu-useful-life`, `neocloud`, `gpu-rental-market` with Moody's
evidence. Updated `overview.md` and `index.md`.
