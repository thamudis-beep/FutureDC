import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";

// Fixed design canvas — slides are authored at this size and scaled to fit
// the available area, so pixel-precise layouts stay intact on every screen.
const DESIGN = { w: 1440, h: 900 };

const stepsOf = (Slide) => Slide.steps ?? 0;

// Fit the design canvas inside a measured element (not the whole window),
// so a reserved chrome bar never overlaps slide content.
function useFitScale(ref) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const compute = () => {
      const { clientWidth: w, clientHeight: h } = el;
      if (w && h) setScale(Math.min(w / DESIGN.w, h / DESIGN.h));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return scale;
}

function useDarkMode() {
  const [dark, setDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);
  return [dark, setDark];
}

// hash <-> position. Format: #<slide(1-based)> or #<slide>.<step>
function parseHash(slides) {
  const m = /^#(\d+)(?:\.(\d+))?$/.exec(window.location.hash || "");
  if (!m) return null;
  const i = Math.min(Math.max(+m[1] - 1, 0), slides.length - 1);
  const step = Math.min(Math.max(+(m[2] || 0), 0), stepsOf(slides[i]));
  return { i, step };
}

export default function Deck({ slides }) {
  const stageRef = useRef(null);
  const scale = useFitScale(stageRef);
  const [dark, setDark] = useDarkMode();
  const [pos, setPos] = useState(() => (typeof window !== "undefined" && parseHash(slides)) || { i: 0, step: 0 });
  const [overview, setOverview] = useState(false);
  const started = useRef(false);

  const Slide = slides[pos.i];
  const total = slides.length;
  const last = total - 1;

  const next = useCallback(() => {
    setPos(({ i, step }) => {
      started.current = true;
      if (step < stepsOf(slides[i])) return { i, step: step + 1 };
      if (i < slides.length - 1) return { i: i + 1, step: 0 };
      return { i, step };
    });
  }, [slides]);

  const prev = useCallback(() => {
    setPos(({ i, step }) => {
      if (step > 0) return { i, step: step - 1 };
      if (i > 0) return { i: i - 1, step: stepsOf(slides[i - 1]) };
      return { i, step };
    });
  }, [slides]);

  const goTo = useCallback(
    (i, step = 0) => {
      started.current = true;
      setPos({ i: Math.min(Math.max(i, 0), slides.length - 1), step });
    },
    [slides]
  );

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key) {
        case "ArrowRight":
        case " ":
        case "Enter":
        case "PageDown":
          e.preventDefault();
          overview ? setOverview(false) : next();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          prev();
          break;
        case "Home":
          e.preventDefault();
          goTo(0, 0);
          break;
        case "End":
          e.preventDefault();
          goTo(last, stepsOf(slides[last]));
          break;
        case "o":
        case "O":
          setOverview((v) => !v);
          break;
        case "Escape":
          setOverview(false);
          break;
        case "d":
        case "D":
          setDark((v) => !v);
          break;
        case "f":
        case "F":
          if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
          else document.exitFullscreen?.();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, goTo, setDark, overview, last, slides]);

  // hash sync (write)
  useEffect(() => {
    const hash = `#${pos.i + 1}${pos.step ? "." + pos.step : ""}`;
    if (window.location.hash !== hash) window.history.replaceState(null, "", hash);
  }, [pos]);

  // hash sync (read — back/forward, manual edits)
  useEffect(() => {
    const onHash = () => {
      const p = parseHash(slides);
      if (p) setPos(p);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [slides]);

  const progress = useMemo(() => {
    const frag = stepsOf(Slide) ? pos.step / stepsOf(Slide) : 1;
    return total <= 1 ? frag : (pos.i + frag) / total;
  }, [pos, Slide, total]);

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-bg text-text">
      {/* stage — click anywhere to advance */}
      <div ref={stageRef} className="relative flex-1 flex items-center justify-center overflow-hidden" style={{ cursor: "pointer" }} onClick={() => next()}>
        <div style={{ width: DESIGN.w, height: DESIGN.h, transform: `scale(${scale})`, transformOrigin: "center center", flex: "none" }}>
          <Slide step={pos.step} />
        </div>

        {/* top-right controls */}
        <div className="absolute top-5 right-6 flex items-center gap-2 z-30" onClick={(e) => e.stopPropagation()}>
          <IconButton title="Overview (O)" onClick={() => setOverview((v) => !v)}>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </IconButton>
          <IconButton title={dark ? "Light mode (D)" : "Dark mode (D)"} onClick={() => setDark((v) => !v)}>
            {dark ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            )}
          </IconButton>
        </div>

        {!started.current && (
          <div className="absolute bottom-3 left-0 right-0 text-center font-mono text-2xs text-text-ghost pointer-events-none">
            click / → to advance · O for overview
          </div>
        )}
      </div>

      {/* reserved bottom bar — never overlaps slide content */}
      <div className="relative h-14 flex items-center justify-center gap-3 border-t border-bg-border/40">
        <IconButton title="Previous (←)" onClick={prev}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </IconButton>
        <div className="font-mono text-2xs text-text-muted tabular-nums text-center min-w-[220px]">
          <span className="text-text">{String(pos.i + 1).padStart(2, "0")}</span>
          <span className="text-text-ghost"> / {String(total).padStart(2, "0")}</span>
          {Slide.title && <span className="text-text-ghost"> · {Slide.title}</span>}
        </div>
        <IconButton title="Next (→)" onClick={next}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </IconButton>

        {/* progress bar pinned to the very bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-bg-border/40">
          <div className="h-full bg-era-3 transition-[width] duration-300 ease-out" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      </div>

      {overview && (
        <Overview
          slides={slides}
          current={pos.i}
          onPick={(i) => { goTo(i, 0); setOverview(false); }}
          onClose={() => setOverview(false)}
        />
      )}
    </div>
  );
}

// ── small helpers ────────────────────────────────────────────
function IconButton({ title, onClick, children }) {
  return (
    <button
      title={title}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="flex items-center justify-center w-8 h-8 rounded-md text-text-muted hover:text-text border border-bg-border hover:border-bg-border-light transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        {children}
      </svg>
    </button>
  );
}

function Overview({ slides, current, onPick, onClose }) {
  const cols = slides.length <= 4 ? slides.length : 4;
  return (
    <div className="absolute inset-0 z-40 bg-bg/95 backdrop-blur-sm p-10 overflow-auto" onClick={onClose}>
      <div className="flex items-center justify-between mb-6">
        <div className="font-mono text-xs text-text-muted tracking-[0.15em]">OVERVIEW · {slides.length} SLIDES</div>
        <IconButton title="Close (Esc)" onClick={onClose}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </IconButton>
      </div>
      <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {slides.map((S, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); onPick(i); }}
            className={`group text-left rounded-lg overflow-hidden border transition-colors ${
              i === current ? "border-era-3" : "border-bg-border hover:border-bg-border-light"
            }`}
          >
            <div className="relative w-full bg-bg-surface" style={{ aspectRatio: `${DESIGN.w} / ${DESIGN.h}` }}>
              <Thumb S={S} />
            </div>
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="font-mono text-2xs text-text-ghost">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-2xs text-text-secondary truncate">{S.title || "Untitled"}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Live-rendered thumbnail: the real slide, scaled down, non-interactive.
function Thumb({ S }) {
  const ref = useRef(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const compute = () => setScale(el.clientWidth / DESIGN.w);
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none">
      <div style={{ width: DESIGN.w, height: DESIGN.h, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <S step={S.steps ?? 0} />
      </div>
    </div>
  );
}
