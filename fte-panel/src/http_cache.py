"""Rate-limited, cached HTTP for SEC EDGAR and FRED.

Every fetched file is stored verbatim under data/raw/ next to a `.meta.json` sidecar
holding the URL, fetch time, status and SHA-256, so every number in the panel can be
traced to a stored source. A cached file is never re-fetched unless --refresh is used.
"""
from __future__ import annotations

import hashlib
import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

from config import sec_user_agent

_MIN_INTERVAL = 1.0 / float(os.environ.get("SEC_RPS", "8"))   # SEC allows 10 req/s
_last_call = 0.0
REFRESH = os.environ.get("FTE_REFRESH", "0") == "1"


class FetchError(RuntimeError):
    pass


def _throttle() -> None:
    global _last_call
    wait = _MIN_INTERVAL - (time.monotonic() - _last_call)
    if wait > 0:
        time.sleep(wait)
    _last_call = time.monotonic()


def fetch(url: str, dest: Path, *, sec: bool = True, retries: int = 4, timeout: int = 60) -> Path:
    """Download `url` to `dest` (creating parents) unless a cached copy exists. Returns dest."""
    dest = Path(dest)
    meta = dest.with_suffix(dest.suffix + ".meta.json")
    if dest.exists() and meta.exists() and not REFRESH:
        return dest
    dest.parent.mkdir(parents=True, exist_ok=True)
    headers = {"Accept-Encoding": "gzip, deflate"}
    if sec:
        headers["User-Agent"] = sec_user_agent()
        headers["Host"] = requests.utils.urlparse(url).netloc
    err: Exception | None = None
    for attempt in range(retries):
        try:
            _throttle()
            r = requests.get(url, headers=headers, timeout=timeout)
            if r.status_code == 200:
                dest.write_bytes(r.content)
                meta.write_text(json.dumps({
                    "url": url,
                    "fetched_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                    "status": r.status_code,
                    "bytes": len(r.content),
                    "sha256": hashlib.sha256(r.content).hexdigest(),
                    "content_type": r.headers.get("Content-Type", ""),
                }, indent=1))
                return dest
            if r.status_code in (403, 429, 500, 502, 503, 504):
                err = FetchError(f"HTTP {r.status_code} for {url}")
                time.sleep(2 ** attempt)
                continue
            raise FetchError(f"HTTP {r.status_code} for {url}")
        except requests.RequestException as e:      # network / proxy / TLS
            err = e
            time.sleep(2 ** attempt)
    raise FetchError(f"giving up on {url}: {err}")


def source_url(dest: Path) -> str:
    """URL recorded for a cached file, or '' if it was placed by hand / fixture."""
    meta = Path(dest).with_suffix(Path(dest).suffix + ".meta.json")
    if meta.exists():
        return json.loads(meta.read_text()).get("url", "")
    return ""
