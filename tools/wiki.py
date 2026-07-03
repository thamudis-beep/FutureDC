#!/usr/bin/env python3
"""
Wiki utility CLI. Helpers the LLM can shell out to during ingest, query,
and lint workflows.

Commands:
    python tools/wiki.py stats              page and link counts
    python tools/wiki.py orphans            pages with no inbound links
    python tools/wiki.py broken             dangling relative links
    python tools/wiki.py backlinks <path>   pages linking to <path>
    python tools/wiki.py recent [N]         last N log entries (default 10)

Zero dependencies.
"""
from __future__ import annotations

import argparse
import re
import sys
from collections import defaultdict
from pathlib import Path

WIKI = Path("wiki")
LINK_RE = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
SKIP_DIRS = {"assets"}
SKIP_FILES = {"index.md", "log.md"}


def md_files(root: Path) -> list[Path]:
    out = []
    for p in sorted(root.rglob("*.md")):
        if any(part in SKIP_DIRS for part in p.parts):
            continue
        out.append(p)
    return out


def extract_links(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8", errors="replace")
    links = []
    for m in LINK_RE.finditer(text):
        target = m.group(1).split("#", 1)[0].split(" ", 1)[0].strip()
        if not target:
            continue
        if target.startswith(("http://", "https://", "mailto:")):
            continue
        links.append(target)
    return links


def resolve(src: Path, target: str) -> Path:
    return (src.parent / target).resolve()


def build_graph(root: Path) -> tuple[dict[Path, list[Path]], dict[Path, list[Path]], list[tuple[Path, str]]]:
    files = md_files(root)
    fileset = {f.resolve() for f in files}
    out: dict[Path, list[Path]] = defaultdict(list)
    inn: dict[Path, list[Path]] = defaultdict(list)
    broken: list[tuple[Path, str]] = []
    for f in files:
        for link in extract_links(f):
            resolved = resolve(f, link)
            if resolved.suffix == ".md":
                if resolved in fileset:
                    out[f.resolve()].append(resolved)
                    inn[resolved].append(f.resolve())
                elif not resolved.exists():
                    broken.append((f, link))
                # else: valid .md link outside wiki/ (e.g. raw/) — ok
            else:
                # non-md relative link (image, etc.) — check existence
                if not resolved.exists():
                    broken.append((f, link))
    return out, inn, broken


def cmd_stats(args) -> int:
    files = md_files(WIKI)
    out, inn, broken = build_graph(WIKI)
    n_links = sum(len(v) for v in out.values())
    print(f"pages      : {len(files)}")
    print(f"links      : {n_links}")
    print(f"broken     : {len(broken)}")
    print(f"orphans    : {sum(1 for f in files if f.name not in SKIP_FILES and not inn.get(f.resolve()))}")
    by_type: dict[str, int] = defaultdict(int)
    for f in files:
        rel = f.relative_to(WIKI)
        kind = rel.parts[0] if len(rel.parts) > 1 else "root"
        by_type[kind] += 1
    print("by section :")
    for k in sorted(by_type):
        print(f"  {k:12s} {by_type[k]}")
    return 0


def cmd_orphans(args) -> int:
    files = md_files(WIKI)
    _, inn, _ = build_graph(WIKI)
    any_orphan = False
    for f in files:
        if f.name in SKIP_FILES:
            continue
        if not inn.get(f.resolve()):
            print(f.relative_to(Path.cwd()) if f.is_absolute() else f)
            any_orphan = True
    if not any_orphan:
        print("(no orphans)")
    return 0


def cmd_broken(args) -> int:
    _, _, broken = build_graph(WIKI)
    if not broken:
        print("(no broken links)")
        return 0
    for src, link in broken:
        print(f"{src}: {link}")
    return 0


def cmd_backlinks(args) -> int:
    target = Path(args.path).resolve()
    _, inn, _ = build_graph(WIKI)
    linkers = inn.get(target, [])
    if not linkers:
        print("(no backlinks)")
        return 0
    for src in linkers:
        try:
            print(src.relative_to(Path.cwd()))
        except ValueError:
            print(src)
    return 0


def cmd_recent(args) -> int:
    log = WIKI / "log.md"
    if not log.exists():
        print("(no log.md)", file=sys.stderr)
        return 1
    n = args.n
    entries = [ln for ln in log.read_text(encoding="utf-8").splitlines() if ln.startswith("## [")]
    for ln in entries[-n:]:
        print(ln)
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Wiki utility CLI.")
    sub = ap.add_subparsers(dest="cmd", required=True)

    sub.add_parser("stats", help="page and link counts").set_defaults(fn=cmd_stats)
    sub.add_parser("orphans", help="pages with no inbound links").set_defaults(fn=cmd_orphans)
    sub.add_parser("broken", help="dangling relative links").set_defaults(fn=cmd_broken)

    p_bl = sub.add_parser("backlinks", help="pages linking to <path>")
    p_bl.add_argument("path")
    p_bl.set_defaults(fn=cmd_backlinks)

    p_re = sub.add_parser("recent", help="last N log entries")
    p_re.add_argument("n", type=int, nargs="?", default=10)
    p_re.set_defaults(fn=cmd_recent)

    args = ap.parse_args()
    return args.fn(args)


if __name__ == "__main__":
    raise SystemExit(main())
