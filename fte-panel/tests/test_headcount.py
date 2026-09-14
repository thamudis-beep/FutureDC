"""Unit tests for the headcount sentence scorer on the phrasing patterns 10-Ks use.

The numbers are invented; only the sentence shapes matter.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))
from parse_headcount import ai_mentions, candidates, html_to_text, sentences, to_number  # noqa: E402

CASES = [
    ("As of December 31, 2023, we had 182,502 employees.", "2023-12-31", 182502),
    ("As of January 28, 2024, we had 29,600 employees in 36 countries.", "2024-01-28", 29600),
    ("As of December 31, 2023, we employed approximately 1,525,000 full-time and part-time employees.", "2023-12-31", 1525000),
    ("On June 30, 2024, we had approximately 108,000 employees.", "2024-06-30", 108000),
    ("As of August 31, 2024, we had approximately 774,000 employees, compared to approximately 733,000 as of August 31, 2023.", "2024-08-31", 774000),
    ("As of January 31, 2024, we employed approximately 72,682 people worldwide.", "2024-01-31", 72682),
    ("Our headcount was 12,345 at year end. We also work with approximately 4,000 contractors.", "2023-12-31", 12345),
    ("As of December 31, 2023, we had approximately 15,000 stockholders of record and 3,200 employees.", "2023-12-31", 3200),
    ("As of December 31, 2022, we had 86,482 employees. As of December 31, 2023, we had 67,317 employees.", "2023-12-31", 67317),
    ("Total employees as of the end of fiscal 2024 were approximately 26 thousand.", "2024-06-30", 26000),
    ("We have approximately 2.1 million associates worldwide as of January 31, 2024.", "2024-01-31", 2100000),
    ("Employee headcount increased by 1,200 during the year; as of December 31, 2023 we had 9,800 employees.", "2023-12-31", 9800),
]


def test_sentences():
    failures = []
    for text, fy_end, want in CASES:
        c = candidates(text, fy_end, in_section=True)
        got = c[0]["value"] if c else None
        if got != want:
            failures.append((text, want, got, [(x["value"], x["score"]) for x in c[:3]]))
    for f in failures:
        print("FAIL", f)
    assert not failures, f"{len(failures)} headcount cases failed"


def test_html_and_ai():
    html = "<html><body><div>Item 1.</div><p>We use <b>artificial intelligence</b> and generative AI. Large language models (LLMs) matter. AI is everywhere.</p><script>x=1</script></body></html>"
    t = html_to_text(html)
    assert "x=1" not in t and "artificial intelligence" in t
    m = ai_mentions(t)
    assert m["artificial_intelligence"] == 1 and m["generative_ai"] == 1 and m["large_language_model"] == 2 and m["ai_token"] >= 2
    assert to_number("1,234") == 1234 and to_number("2.1 million") == 2.1e6 and to_number("26 thousand") == 26000
    assert len(sentences("First sentence. Second one; Third (bracket) here.")) == 3


if __name__ == "__main__":
    test_sentences()
    test_html_and_ai()
    print(f"headcount parser: {len(CASES)} sentence cases + html/ai checks OK")
