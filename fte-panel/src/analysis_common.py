"""Shared loaders and plotting style for the analysis scripts."""
from __future__ import annotations

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from config import COHORTS, COHORT_LABELS, DATA_DIR, FIRST_YEAR

COLORS = {"hyperscaler": "#1f4e79", "internet": "#c0504d", "software": "#4f81bd",
          "semis": "#9bbb59", "itservices": "#8064a2", "nontech": "#7f7f7f"}

plt.rcParams.update({
    "figure.dpi": 130, "savefig.dpi": 160, "font.size": 9, "axes.spines.top": False,
    "axes.spines.right": False, "axes.grid": True, "grid.alpha": 0.25, "legend.frameon": False,
})


def load_panel(usd_only: bool = True, need_headcount: bool = True) -> pd.DataFrame:
    df = pd.read_csv(DATA_DIR / "panel.csv")
    if usd_only:
        df = df[df.usd]
    if need_headcount:
        df = df[df.headcount.notna() & df.headcount.gt(0)]
    df = df[df.cal_year >= FIRST_YEAR]          # Jan-May year-ends push FY2015 into calendar 2014
    return df.copy()


def cohort_iter(df: pd.DataFrame):
    for c in COHORTS:
        g = df[df.cohort == c]
        if len(g):
            yield c, COHORT_LABELS[c], g


def latest_year_row(g: pd.DataFrame, min_year: int = 2024) -> pd.Series | None:
    g = g[g.fiscal_year >= min_year].sort_values("fiscal_year")
    return g.iloc[-1] if len(g) else None


def safe_log(s: pd.Series) -> pd.Series:
    return np.log(s.where(s > 0))


def stamp(fig, text: str):
    fig.text(0.005, 0.005, text, fontsize=6.5, color="#666", ha="left", va="bottom")
