"""Headcount and AI-mention extraction from annual-report text.

For every filing in data/interim/filings.csv:
  1. strip the HTML to text;
  2. locate the "Human Capital" / "Employees" section (falls back to the whole document);
  3. find every sentence that mentions employment and contains a number, score the
     candidates, keep the best;
  4. record the exact sentence, the archive URL, the score and every flag
     (part-time included, contractors mentioned, date mismatch, ambiguous);
  5. count AI-related terms in the whole document, normalised per 10,000 words.

Ambiguous filings (two candidates with different values and near-equal scores, or no
candidate at all) go to data/interim/headcount_review.csv. With HEADCOUNT_LLM=1 those
cases are also sent to the LLM fallback (src/llm_fallback.py), which sees only the
candidate sentences and must return one of the candidate numbers or "none".

Outputs: data/interim/headcount.csv, headcount_review.csv, ai_mentions.csv
"""
from __future__ import annotations

import html
import os
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

import pandas as pd

from config import INTERIM_DIR

MONTHS = "January|February|March|April|May|June|July|August|September|October|November|December"
NUM = r"(?P<num>\d{1,3}(?:,\d{3})+|\d{3,7}|\d+(?:\.\d+)?\s*(?:thousand|million))"
QUAL = r"(?:approximately|about|roughly|over|more than|nearly|around|in excess of|a total of|a workforce of)?\s*"
QUALIFIER = r"(?:(?:full[- ]time|part[- ]time|regular|permanent)(?:\s*(?:,|and|or)\s*(?:full[- ]time|part[- ]time|regular|permanent))*\s+)?"
NOUN = QUALIFIER + r"(?:employees|people|persons|team members|associates|staff|individuals|workers|professionals|colleagues|teammates|partners \(employees\)|crew members)"
PATTERNS = [
    # "we had approximately 182,502 employees" / "employed 36,000 full-time employees"
    re.compile(r"(?:had|has|have|employed|employs|employ|of|were|was|totaled|totaling|totalled|with)\s+" + QUAL + NUM + r"\s+" + NOUN, re.I),
    # "our headcount was 12,345" / "number of employees ... was 12,345"
    re.compile(r"(?:headcount|(?:number of |total )?(?:full[- ]time )?employees|employee (?:count|base|population)|workforce).{0,40}?(?:was|were|of|totaled|totaling|totalled|at|reached|stood at|:)\s+" + QUAL + NUM, re.I),
    # bare "approximately 340,000 employees" anywhere in an employment sentence
    re.compile(QUAL + NUM + r"\s+" + NOUN, re.I),
]
EMPLOY_KW = re.compile(r"\b(employ\w*|headcount|workforce|team members|associates|personnel|people|staff|full[- ]time|part[- ]time)\b", re.I)
BAD_AFTER = re.compile(r"^\W{0,3}(square|sq\.|customers|shareholders|stockholders|holders of record|countries|patents|stores|restaurants|locations|offices|percent|%|shares|options|units|vehicles|drivers|merchants|members|subscribers|users|hosts|guests|partners\b(?! \(employees\))|contractors|contingent|temporary|interns|vendors|suppliers|per\b)", re.I)
CONTRACTOR_KW = re.compile(r"\b(contractors?|contingent workers?|temporary (?:workers|employees|staff)|outsourced|staffing agencies|independent contractors)\b", re.I)
PART_TIME_KW = re.compile(r"part[- ]time", re.I)
DELTA_KW = re.compile(r"\b(increase|decrease|increased|decreased|reduction|reduced|added|hired|grew by|net addition|down from|up from|compared to)\b", re.I)
DATE_RE = re.compile(r"(?:%s)\s+\d{1,2},?\s+(\d{4})" % MONTHS)
SECTION_RE = re.compile(r"(human capital(?: resources| management)?|our (?:employees|people|team|workforce)|employees(?: and human capital)?)\s*[\.\-–—:]?\s*\n", re.I)

AI_TERMS = {
    "artificial_intelligence": re.compile(r"\bartificial intelligence\b", re.I),
    "generative_ai": re.compile(r"\bgenerative (?:ai|artificial intelligence)\b|\bgen ?ai\b", re.I),
    "large_language_model": re.compile(r"(?i:\blarge language models?\b)|\bLLMs?\b"),
    "machine_learning": re.compile(r"\bmachine learning\b", re.I),
    "ai_token": re.compile(r"\bAI\b"),
}


class _Text(HTMLParser):
    BLOCK = {"p", "div", "br", "tr", "li", "h1", "h2", "h3", "h4", "h5", "h6", "table", "td", "th", "section", "font"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self._skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "head"):
            self._skip += 1
        elif tag in self.BLOCK:
            self.parts.append("\n" if tag in ("p", "div", "br", "tr", "li", "table", "section") or tag.startswith("h") else " ")

    def handle_endtag(self, tag):
        if tag in ("script", "style", "head"):
            self._skip = max(0, self._skip - 1)
        elif tag in self.BLOCK:
            self.parts.append("\n" if tag in ("p", "div", "tr", "li", "table", "section") or tag.startswith("h") else " ")

    def handle_data(self, data):
        if not self._skip:
            self.parts.append(data)


def html_to_text(raw: str) -> str:
    # inline XBRL wraps the whole document; ix:hidden blocks hold machine-only facts
    raw = re.sub(r"<ix:header>.*?</ix:header>", " ", raw, flags=re.S | re.I)
    p = _Text()
    p.feed(raw)
    t = html.unescape("".join(p.parts))
    t = t.replace("\xa0", " ")
    t = re.sub(r"[ \t\r\f\v]+", " ", t)
    t = re.sub(r"\n\s*\n+", "\n", t)
    return t


def sentences(text: str) -> list[str]:
    text = re.sub(r"\s*\n\s*", " ", text)
    return [s.strip() for s in re.split(r"(?<=[.;])\s+(?=[A-Z(“\"])", text) if s.strip()]


def to_number(s: str) -> float:
    s = s.lower().replace(",", "").strip()
    m = re.match(r"([\d.]+)\s*(thousand|million)?", s)
    v = float(m.group(1))
    return v * {"thousand": 1e3, "million": 1e6, None: 1}[m.group(2)]


def section_text(text: str) -> tuple[str, bool]:
    """Text of the employees / human-capital section if a heading is found, else the whole document."""
    starts = [m.start() for m in SECTION_RE.finditer(text)]
    if not starts:
        return text, False
    # the Table of Contents also matches; take the LAST heading that is followed by a real paragraph
    for s in reversed(starts):
        chunk = text[s:s + 20000]
        if EMPLOY_KW.search(chunk[:3000]) and re.search(r"\d{2,}", chunk[:3000]):
            return chunk, True
    return text, False


def candidates(text: str, fy_end: str, in_section: bool) -> list[dict]:
    fy_year = int(fy_end[:4])
    out = []
    for sent in sentences(text):
        if not EMPLOY_KW.search(sent) or not re.search(r"\d", sent):
            continue
        if len(sent) > 700:
            continue
        seen = set()
        for pat in PATTERNS:
            for m in pat.finditer(sent):
                try:
                    val = to_number(m.group("num"))
                except (AttributeError, ValueError):
                    continue
                if val < 50 or val > 5_000_000 or (m.group("num"), val) in seen:
                    continue
                seen.add((m.group("num"), val))
                after = sent[m.end("num"):m.end("num") + 40]
                score = 0.0
                if re.match(r"\s*(?:full[- ]time\s+)?(?:employees|people|team members|associates|persons)", after, re.I):
                    score += 3
                if re.search(r"full[- ]time", sent[max(0, m.start("num") - 30):m.end("num") + 40], re.I):
                    score += 2
                if re.search(r"\bapproximately\b|\babout\b", sent[max(0, m.start("num") - 20):m.start("num")], re.I):
                    score += 1
                if re.search(r"\bas of\b|\bat (?:the )?(?:end|close) of\b|\bat (?:%s)\b" % MONTHS, sent, re.I):
                    score += 1
                years = [int(y) for y in DATE_RE.findall(sent)]
                if years:
                    score += 2 if fy_year in years else -3
                if BAD_AFTER.match(after):
                    score -= 6
                if DELTA_KW.search(sent[max(0, m.start("num") - 60):m.start("num")]):
                    score -= 2
                if PART_TIME_KW.search(after) and not re.search(r"full[- ]time", after, re.I):
                    score -= 2
                if in_section:
                    score += 1
                if re.search(r"\b(?:we|the company|[A-Z][a-z]+)\s+(?:had|employed|employs)\b", sent):
                    score += 1
                out.append({"value": val, "raw": m.group("num"), "score": score, "sentence": sent,
                            "includes_part_time": bool(re.search(r"full[- ]time and part[- ]time|part[- ]time", sent, re.I)),
                            "mentions_contractors": bool(CONTRACTOR_KW.search(sent)),
                            "date_years": ",".join(map(str, sorted(set(years))))})
    out.sort(key=lambda c: -c["score"])
    return out


def ai_mentions(text: str) -> dict:
    words = max(1, len(re.findall(r"\b\w+\b", text)))
    d = {"words": words}
    for k, rx in AI_TERMS.items():
        d[k] = len(rx.findall(text))
    d["ai_terms_total"] = d["artificial_intelligence"] + d["generative_ai"] + d["large_language_model"] + d["ai_token"]
    d["ai_per_10k_words"] = 1e4 * d["ai_terms_total"] / words
    d["ml_per_10k_words"] = 1e4 * d["machine_learning"] / words
    return d


def parse_filing(path: Path, fy_end: str) -> tuple[dict, list[dict], dict]:
    raw = path.read_text(errors="replace")
    text = html_to_text(raw) if "<" in raw[:2000] else raw
    sec, in_section = section_text(text)
    cands = candidates(sec, fy_end, in_section)
    if not cands and in_section:                      # section found but nothing parsable: widen
        cands = candidates(text, fy_end, False)
    best = cands[0] if cands else None
    ambiguous = False
    if best and len(cands) > 1:
        rival = next((c for c in cands[1:] if abs(c["value"] - best["value"]) / best["value"] > 0.02), None)
        if rival and best["score"] - rival["score"] < 1.5:
            ambiguous = True
    result = {"headcount": best["value"] if best else None,
              "headcount_sentence": best["sentence"] if best else "",
              "headcount_score": best["score"] if best else None,
              "headcount_method": "regex" if best else "none",
              "section_found": in_section,
              "includes_part_time": best["includes_part_time"] if best else None,
              "mentions_contractors": bool(CONTRACTOR_KW.search(sec)),
              "date_years_in_sentence": best["date_years"] if best else "",
              "ambiguous": ambiguous, "n_candidates": len(cands)}
    return result, cands[:6], ai_mentions(text)


def main(argv=None) -> int:
    filings = pd.read_csv(INTERIM_DIR / "filings.csv")
    if argv:
        filings = filings[filings.ticker.isin([t.upper() for t in argv if not t.startswith("-")])]
    use_llm = os.environ.get("HEADCOUNT_LLM", "0") == "1"
    if use_llm:
        from llm_fallback import choose_headcount
    rows, review, ai_rows = [], [], []
    for _, f in filings.iterrows():
        p = Path(f.local_path)
        base = {"ticker": f.ticker, "fiscal_year": int(f.fiscal_year), "cal_year": int(f.cal_year),
                "fy_end": f.fy_end, "form": f.form, "accn": f.accn, "source_url": f.source_url}
        if f.status != "ok" or not p.exists():
            rows.append({**base, "headcount": None, "headcount_method": "no_document", "ambiguous": False})
            review.append({**base, "reason": "document not fetched", "candidates": ""})
            continue
        res, cands, ai = parse_filing(p, str(f.fy_end))
        if (res["headcount"] is None or res["ambiguous"]):
            reason = "no candidate sentence" if res["headcount"] is None else "competing candidates"
            if use_llm and cands:
                pick = choose_headcount(f.ticker, str(f.fy_end), cands)
                if pick is not None:
                    c = next(c for c in cands if c["value"] == pick["value"])
                    res.update(headcount=c["value"], headcount_sentence=c["sentence"],
                               headcount_method="llm_fallback", ambiguous=False,
                               includes_part_time=c["includes_part_time"])
                    reason += f" -> resolved by LLM: {pick.get('reason', '')}"
            review.append({**base, "reason": reason,
                           "candidates": " || ".join(f"{c['value']:.0f} [{c['score']:+.0f}] {c['sentence'][:200]}" for c in cands)})
        rows.append({**base, **res})
        ai_rows.append({**base, **ai})
        hc_str = "" if res["headcount"] is None else f"{res['headcount']:>10,.0f}"
        flags = ("AMBIGUOUS " if res["ambiguous"] else "") + ("" if res["section_found"] else "(no section heading) ")
        print(f"{f.ticker:6s} FY{int(f.fiscal_year)} {res['headcount_method']:12s} {hc_str} {flags}")
    pd.DataFrame(rows).to_csv(INTERIM_DIR / "headcount.csv", index=False)
    pd.DataFrame(review).to_csv(INTERIM_DIR / "headcount_review.csv", index=False)
    pd.DataFrame(ai_rows).to_csv(INTERIM_DIR / "ai_mentions.csv", index=False)
    n_ok = sum(1 for r in rows if r.get("headcount") is not None and not r.get("ambiguous"))
    print(f"\n{n_ok}/{len(rows)} filings resolved; {len(review)} in headcount_review.csv")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
