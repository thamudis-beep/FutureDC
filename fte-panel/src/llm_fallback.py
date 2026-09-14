"""Optional LLM fallback for headcount sentences that the regex scorer cannot settle.

Enabled with HEADCOUNT_LLM=1. The model only ever sees the candidate sentences already
extracted from the filing and must answer with one of the candidate values (or none);
it cannot introduce a number that is not in the filing text. Every LLM decision is
recorded in headcount_review.csv with its reason, and the resulting row carries
headcount_method = 'llm_fallback'.

Model: claude-opus-5 by default (HEADCOUNT_LLM_MODEL to override). Uses the
Anthropic SDK; needs ANTHROPIC_API_KEY (or an `ant auth login` profile).
"""
from __future__ import annotations

import json
import os
import re

SYSTEM = (
    "You extract the number of employees a public company reports in its annual report. "
    "You are given the fiscal-year end date and a numbered list of candidate sentences, each "
    "with the number the parser found. Choose the candidate that states the company's TOTAL "
    "number of employees (full-time where stated) as of the fiscal-year end. Reject numbers that "
    "are prior-year comparatives, contractors, part-time-only counts, deltas, or non-employee "
    "counts. Answer with JSON only: {\"index\": <int or null>, \"reason\": \"<one sentence>\"}."
)


def choose_headcount(ticker: str, fy_end: str, cands: list[dict]) -> dict | None:
    from anthropic import Anthropic, APIError

    client = Anthropic()
    model = os.environ.get("HEADCOUNT_LLM_MODEL", "claude-opus-5")
    listing = "\n".join(f"{i}. value={c['value']:.0f} :: {c['sentence']}" for i, c in enumerate(cands))
    user = f"Company: {ticker}\nFiscal year end: {fy_end}\nCandidates:\n{listing}"
    kwargs = dict(model=model, max_tokens=1024, system=SYSTEM,
                  messages=[{"role": "user", "content": user}])
    try:
        try:
            resp = client.beta.messages.create(betas=["server-side-fallback-2026-07-01"],
                                               fallbacks="default", **kwargs)
        except (TypeError, APIError):
            resp = client.messages.create(**kwargs)
    except APIError as e:
        print(f"  LLM fallback failed for {ticker} {fy_end}: {e}")
        return None
    if resp.stop_reason == "refusal":
        return None
    text = "".join(b.text for b in resp.content if b.type == "text")
    m = re.search(r"\{.*\}", text, re.S)
    if not m:
        return None
    try:
        ans = json.loads(m.group(0))
    except json.JSONDecodeError:
        return None
    idx = ans.get("index")
    if idx is None or not (0 <= int(idx) < len(cands)):
        return None
    return {"value": cands[int(idx)]["value"], "reason": ans.get("reason", ""), "model": model}
