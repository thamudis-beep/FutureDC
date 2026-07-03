# AIeconomics

An **LLM Wiki** on the economics of AI — how artificial intelligence
reshapes labor, productivity, markets, capital, policy, and distribution.

Follows the pattern from
[Karpathy's LLM Wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f):
the LLM maintains a persistent, interlinked markdown knowledge base that
compounds with every source ingested and every question asked.

## Layout

```
CLAUDE.md        # schema — conventions and workflows for the LLM
raw/             # source documents (immutable)
wiki/            # LLM-maintained markdown knowledge base
  index.md       # catalog of every page
  log.md         # append-only chronological record
  overview.md    # top-level synthesis
  entities/      # people, orgs, firms, labs, products
  concepts/      # ideas, theories, mechanisms, metrics
  sources/       # one summary per raw/ document
  syntheses/     # comparisons, analyses, answers filed back
tools/           # CLI helpers
  search.py      # keyword search over the wiki
  wiki.py        # stats, orphans, broken links, backlinks, recent log
```

## Usage

1. **Open this repo in your LLM agent** (Claude Code, Codex, etc.). The
   agent will read `CLAUDE.md` and follow its conventions.
2. **Drop a source** into `raw/` — an article, paper, markdown clip, PDF,
   dataset, or image. Use the [Obsidian Web Clipper](https://obsidian.md/clipper)
   browser extension for web articles.
3. **Ask the agent to ingest it.** The agent reads the source, writes a
   summary under `wiki/sources/`, updates relevant entity and concept
   pages, refreshes `wiki/index.md`, and appends to `wiki/log.md`.
4. **Ask questions.** The agent searches the wiki, answers with citations,
   and files non-trivial answers back under `wiki/syntheses/`.
5. **Occasionally ask the agent to `lint` the wiki** — find contradictions,
   orphans, broken links, stale claims, and missing pages.

Browse the wiki in [Obsidian](https://obsidian.md/) (point it at `wiki/`)
to use the graph view, backlinks, and Dataview/Marp plugins.

## Tools

```
python tools/search.py "<query>"            # keyword search
python tools/wiki.py stats                  # page/link counts
python tools/wiki.py orphans                # pages with no inbound links
python tools/wiki.py broken                 # dangling relative links
python tools/wiki.py backlinks wiki/foo.md  # who links here
python tools/wiki.py recent 10              # last N log entries
```

All zero-dependency, stdlib-only Python. The LLM agent shells out to
these during query and lint passes.
