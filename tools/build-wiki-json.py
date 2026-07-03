#!/usr/bin/env python3
"""
Reads all wiki/*.md files and outputs src/wiki-data.json for the frontend.

Run before `npm run build`:
    python tools/build-wiki-json.py

Output shape:
[
  {
    "slug": "concepts/gpu-rental-market",
    "path": "wiki/concepts/gpu-rental-market.md",
    "title": "GPU Rental Market",
    "type": "concept",
    "tags": ["compute", "gpu", ...],
    "content": "full markdown body (frontmatter stripped)"
  },
  ...
]
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

WIKI = Path("wiki")
OUT = Path("src/wiki-data.json")
FM_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)
LINK_RE = re.compile(r"\[[^\]]*\]\(([^)]+)\)")


def parse_frontmatter(text: str) -> tuple[dict, str]:
    """Extract YAML frontmatter (simple key: value) and return (meta, body)."""
    m = FM_RE.match(text)
    if not m:
        return {}, text
    raw_fm = m.group(1)
    body = text[m.end():]
    meta: dict = {}
    for line in raw_fm.splitlines():
        if ":" not in line:
            continue
        key, val = line.split(":", 1)
        key = key.strip()
        val = val.strip()
        # Simple list parsing for tags, sources
        if val.startswith("[") and val.endswith("]"):
            items = [v.strip().strip("'\"") for v in val[1:-1].split(",") if v.strip()]
            meta[key] = items
        else:
            meta[key] = val.strip("'\"")
    return meta, body


def extract_wiki_links(src_path: Path, body: str) -> list[str]:
    """Return list of target slugs for relative .md links within wiki/."""
    slugs = []
    for m in LINK_RE.finditer(body):
        target = m.group(1).split("#", 1)[0].split(" ", 1)[0].strip()
        if not target or target.startswith(("http://", "https://", "mailto:")):
            continue
        if not target.endswith(".md"):
            continue
        resolved = (src_path.parent / target).resolve()
        try:
            rel = resolved.relative_to(WIKI.resolve())
            slugs.append(str(rel.with_suffix("")))
        except ValueError:
            pass  # link outside wiki/ (e.g. raw/) — skip
    return slugs


def main() -> int:
    pages = []
    slug_set = set()
    for path in sorted(WIKI.rglob("*.md")):
        if path.name == ".gitkeep":
            continue
        rel = path.relative_to(WIKI)
        slug = str(rel.with_suffix(""))
        slug_set.add(slug)
        text = path.read_text(encoding="utf-8", errors="replace")
        meta, body = parse_frontmatter(text)
        links = extract_wiki_links(path, body)
        pages.append({
            "slug": slug,
            "path": str(Path("wiki") / rel),
            "title": meta.get("title", slug),
            "type": meta.get("type", "unknown"),
            "tags": meta.get("tags", []),
            "links": links,
            "content": body.strip(),
        })

    # Build edges (only where both source and target exist in wiki)
    edges = []
    for page in pages:
        for target_slug in page["links"]:
            if target_slug in slug_set:
                edges.append({"source": page["slug"], "target": target_slug})

    output = {"pages": pages, "edges": edges}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(output, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"wrote {len(pages)} pages, {len(edges)} edges to {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
