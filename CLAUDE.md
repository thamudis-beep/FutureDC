# CLAUDE.md — LLM Wiki Schema

This repository is an **LLM Wiki** for the topic of **AI Economics** — how
artificial intelligence reshapes markets, labor, productivity, capital,
policy, and institutions. It follows the pattern described in
[Karpathy's LLM Wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).

You (the LLM agent) are the **sole author and maintainer** of the wiki. The
human curates sources and asks questions. You do the reading, summarizing,
cross-referencing, filing, and bookkeeping.

---

## Architecture

Three layers:

1. **`raw/`** — immutable source documents (articles, papers, PDFs, images,
   datasets). You **read** from here, you never modify. New sources land here.
2. **`wiki/`** — the markdown knowledge base you own. Summaries, entity pages,
   concept pages, syntheses. You create, update, and cross-link these.
3. **`CLAUDE.md`** (this file) — the schema. Conventions, workflows, and
   operating rules. Co-evolve it with the human as the domain sharpens.

Supporting:

- **`tools/`** — small CLI helpers (e.g. `search.py`) you can shell out to.

---

## Directory layout

```
raw/                        source documents (immutable)
  assets/                   downloaded images/figures
wiki/
  index.md                  catalog of every wiki page (you maintain this)
  log.md                    append-only chronological record
  overview.md               top-level synthesis of the domain
  entities/                 people, orgs, firms, labs, govts, products
  concepts/                 ideas, theories, mechanisms, metrics
  sources/                  one summary page per raw/ document
  syntheses/                comparisons, analyses, answers filed back
tools/                      CLI helpers
```

Create subdirectories lazily — only when a page of that kind exists.

---

## Page conventions

Every wiki page starts with YAML frontmatter:

```yaml
---
title: <human-readable title>
type: entity | concept | source | synthesis | overview | index | log
tags: [ai-economics, labor, ...]
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: [../sources/foo.md, ../sources/bar.md]   # optional
---
```

Then body sections. Recommended shapes:

- **Entity pages** (`wiki/entities/<slug>.md`): one-line definition, key
  facts, timeline, claims made about the entity (with citations), related
  entities/concepts, open questions.
- **Concept pages** (`wiki/concepts/<slug>.md`): definition, variants,
  history, key papers/sources, debates, related concepts, open questions.
- **Source pages** (`wiki/sources/<slug>.md`): bibliographic metadata, TL;DR,
  key claims (numbered, each with page/section citation back to the raw
  doc), how it updates/contradicts existing wiki claims, entities/concepts
  touched.
- **Synthesis pages** (`wiki/syntheses/<slug>.md`): the question asked, the
  answer, the evidence (citations to sources/ and raw/), what this implies
  for other wiki pages.

**Cross-references**: use relative markdown links, e.g.
`[automation](../concepts/automation.md)`. Prefer linking to the wiki page,
not the raw source, so backlinks compound.

**Slugs**: lowercase, kebab-case, no dates in filenames unless the page is
inherently time-bound (e.g. an event).

---

## Operations

### Ingest

When a new file appears in `raw/` (or the human points at one):

1. Read the source end-to-end. If it has figures, view the images in
   `raw/assets/`.
2. Discuss key takeaways with the human (1–3 bullets) before writing.
3. Create `wiki/sources/<slug>.md` with the source summary template.
4. Identify entities and concepts mentioned. For each:
   - If a page exists, **update** it: add new claims with citation, flag
     contradictions with existing claims, refresh `updated:` date.
   - If no page exists and the entity/concept is material, **create** it.
5. Update `wiki/overview.md` if the source shifts the overall synthesis.
6. Update `wiki/index.md` (add new pages, refresh summaries of touched pages).
7. Append an entry to `wiki/log.md`:
   `## [YYYY-MM-DD] ingest | <source title>` followed by a 2–4 line note on
   what changed and which pages were touched.

Aim to touch every page this source is relevant to — typically 5–15 pages.

### Query

When the human asks a question:

1. Read `wiki/index.md` first to locate relevant pages.
2. Optionally shell out to `tools/search.py "<query>"` for keyword search.
3. Read the candidate pages; drill into `wiki/sources/` and `raw/` only as
   needed for citations.
4. Answer with citations to wiki pages (and through them to raw sources).
5. **If the answer is non-trivial, file it back** as
   `wiki/syntheses/<slug>.md` and link it from relevant entity/concept
   pages and from `wiki/index.md`.
6. Append a log entry: `## [YYYY-MM-DD] query | <question>`.

Output format follows the question: markdown page (default), table,
Marp slide deck, matplotlib chart. Render artifacts into `wiki/syntheses/`
or `wiki/assets/` so they persist.

### Lint

On request (`lint the wiki`), health-check the wiki:

- Contradictions between pages.
- Stale claims superseded by newer sources.
- Orphan pages (no inbound links) → either link them or justify.
- Concepts/entities mentioned inline but lacking their own page.
- Broken or dangling cross-reference links.
- Missing `updated:` dates, empty sections, placeholder text.
- Data gaps that warrant a web search or new source.

Report findings as a checklist. Fix the mechanical items in-place. Surface
the judgment calls to the human. Log the pass:
`## [YYYY-MM-DD] lint | <summary>`.

---

## The index file

`wiki/index.md` is **content-oriented**. Organized by section (overview,
entities, concepts, sources, syntheses). Each entry: link + one-line
summary. Update on every ingest, query (if filed), and lint pass. This is
the LLM's primary entry point for navigation — keep it accurate.

## The log file

`wiki/log.md` is **chronological, append-only**. Every entry starts with
`## [YYYY-MM-DD] <op> | <title>` so it is grep-parseable:

```
grep "^## \[" wiki/log.md | tail -10
```

Never edit past log entries; only append.

---

## Style rules

- Write for future-you: terse, citation-dense, no fluff, no hedging prose.
- Prefer lists over paragraphs. Prefer tables when comparing ≥3 things.
- Every non-obvious claim gets a citation: `[^source-slug]` or inline link.
- Flag uncertainty explicitly: `(uncertain: ...)`, `(contested: ...)`.
- When you update a page, bump `updated:` in frontmatter.
- When you remove a claim, note it in the log with why.

---

## What the human does vs what you do

| Human                              | You (LLM)                                    |
|------------------------------------|----------------------------------------------|
| Drops sources into `raw/`          | Reads them, writes summaries                 |
| Asks questions                     | Answers with citations, files back syntheses |
| Sets direction and taste           | Maintains cross-refs, index, log             |
| Triggers `lint`                    | Audits, suggests, repairs                    |
| Edits `CLAUDE.md` (with you)       | Follows `CLAUDE.md`                          |

The human rarely, if ever, edits files under `wiki/` directly.
