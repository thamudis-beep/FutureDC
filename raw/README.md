# raw/

Immutable source documents. Drop articles, papers, PDFs, datasets, and
images here. The LLM reads from this directory but never modifies it.

Conventions:

- Prefer markdown (`.md`) for text sources (use the Obsidian Web Clipper
  browser extension to clip articles).
- Put images and figures under `raw/assets/`.
- Use descriptive, kebab-case filenames, e.g.
  `acemoglu-2024-simple-macroeconomics-of-ai.md`.
- One file per source.

After adding a source, ask the LLM to **ingest** it — see `../CLAUDE.md`.
