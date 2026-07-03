#!/usr/bin/env python3
"""
Naive keyword search over the wiki.

Usage:
    python tools/search.py "<query>"
    python tools/search.py "<query>" --root wiki --limit 20 --context 2

Scores each markdown file by term-frequency of the query tokens (case-
insensitive), with a bonus for matches in the title/frontmatter and
headings. Prints the top hits with short context snippets. Designed for
LLM agents to shell out to, so output is compact and parseable.

Zero dependencies. Meant for ~hundreds to low-thousands of files. If the
wiki grows past that, swap in a real tool (e.g. qmd).
"""
from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

TOKEN_RE = re.compile(r"[A-Za-z0-9_]+")
HEADING_RE = re.compile(r"^#{1,6}\s+(.*)$")


def tokenize(text: str) -> list[str]:
    return [t.lower() for t in TOKEN_RE.findall(text)]


@dataclass
class Hit:
    path: Path
    score: float
    title: str
    snippets: list[str] = field(default_factory=list)


def score_file(path: Path, query_tokens: set[str], context: int) -> Hit | None:
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None

    lines = text.splitlines()
    score = 0.0
    title = path.stem
    snippets: list[str] = []

    in_frontmatter = False
    fm_end = 0
    if lines and lines[0].strip() == "---":
        in_frontmatter = True
        for i, ln in enumerate(lines[1:], start=1):
            if ln.strip() == "---":
                fm_end = i
                break
        # extract title from frontmatter
        for ln in lines[1:fm_end]:
            m = re.match(r"\s*title\s*:\s*(.+)$", ln)
            if m:
                title = m.group(1).strip().strip('"').strip("'")
                break

    for i, line in enumerate(lines):
        line_tokens = set(tokenize(line))
        matches = line_tokens & query_tokens
        if not matches:
            continue

        weight = 1.0
        if in_frontmatter and i <= fm_end:
            weight = 3.0
        elif HEADING_RE.match(line):
            weight = 2.0

        score += weight * len(matches)

        if len(snippets) < 3 and not (in_frontmatter and i <= fm_end):
            lo = max(0, i - context)
            hi = min(len(lines), i + context + 1)
            snippet = "\n".join(lines[lo:hi]).strip()
            if snippet:
                snippets.append(f"L{i + 1}: {snippet}")

    if score == 0:
        return None
    return Hit(path=path, score=score, title=title, snippets=snippets)


def search(root: Path, query: str, limit: int, context: int) -> list[Hit]:
    query_tokens = set(tokenize(query))
    if not query_tokens:
        return []

    hits: list[Hit] = []
    for path in sorted(root.rglob("*.md")):
        hit = score_file(path, query_tokens, context)
        if hit:
            hits.append(hit)

    hits.sort(key=lambda h: h.score, reverse=True)
    return hits[:limit]


def main() -> int:
    ap = argparse.ArgumentParser(description="Naive keyword search over the wiki.")
    ap.add_argument("query", help="search query")
    ap.add_argument("--root", default="wiki", help="directory to search (default: wiki)")
    ap.add_argument("--limit", type=int, default=10, help="max hits (default: 10)")
    ap.add_argument("--context", type=int, default=1, help="snippet context lines (default: 1)")
    ap.add_argument("--paths-only", action="store_true", help="print matching paths only")
    args = ap.parse_args()

    root = Path(args.root)
    if not root.is_dir():
        print(f"error: root not found: {root}", file=sys.stderr)
        return 2

    hits = search(root, args.query, args.limit, args.context)
    if not hits:
        print("(no matches)")
        return 0

    if args.paths_only:
        for h in hits:
            print(h.path)
        return 0

    for h in hits:
        print(f"{h.score:>6.1f}  {h.path}  — {h.title}")
        for s in h.snippets:
            indented = "\n".join("        " + ln for ln in s.splitlines())
            print(indented)
        print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
