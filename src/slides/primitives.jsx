import React from "react";

// ─────────────────────────────────────────────────────────────
// Shared slide primitives.
//
// Colors are driven by CSS custom properties so every slide is
// light/dark reactive with zero JS. A `tone` is a variable NAME,
// e.g. "--e2". Build concrete colors with solid()/tint().
// ─────────────────────────────────────────────────────────────

export const solid = (tone) => `rgb(var(${tone}))`;
export const tint = (tone, alpha) => `rgb(var(${tone}) / ${alpha})`;

// Neutral tokens, as tones.
export const T = {
  text: "--text",
  muted: "--text-muted",
  line: "--bg-border",
  e1: "--e1",
  e2: "--e2",
  e3: "--e3",
  dead: "--dead",
};

// The three eras — content-level metadata reused across slides.
export const ERAS = [
  { name: "PRE-AI", tone: T.e1 },
  { name: "TODAY", tone: T.e2 },
  { name: "FUTURE", tone: T.e3 },
];

// ── primitives ───────────────────────────────────────────────

export const Reveal = ({ on, delay = 0, children, style }) => (
  <div
    className="rv"
    style={{
      opacity: on ? 1 : 0,
      transform: on ? "translateY(0)" : "translateY(8px)",
      transition: `opacity .55s ease ${delay}ms, transform .55s ease ${delay}ms`,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Cap = ({ tone, children }) => (
  <div
    style={{
      fontFamily: "var(--font-mono)",
      fontSize: 10.5,
      letterSpacing: "0.04em",
      color: solid(tone),
      marginTop: 6,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

// small labeled chip square (C = CPU, G = GPU, M = memory)
export const Chip = ({ letter, tone, dim, size = 16 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: Math.max(3, size * 0.18),
      border: `1px solid ${solid(tone)}`,
      color: solid(tone),
      background: tint(tone, 0.14),
      fontFamily: "var(--font-mono)",
      fontSize: Math.round(size * 0.52),
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: dim ? 0.4 : 1,
      flex: "none",
    }}
  >
    {letter}
  </div>
);

// equipment box for the cooling/power chain
export const EqBox = ({ label, tone, dead, wide }) => (
  <div style={{ position: "relative", display: "inline-flex" }}>
    <div
      style={{
        padding: "4px 7px",
        minWidth: wide ? 86 : 0,
        textAlign: "center",
        borderRadius: 4,
        border: `1px solid ${dead ? tint(T.dead, 0.55) : solid(tone)}`,
        color: dead ? tint(T.text, 0.35) : solid(tone),
        background: dead ? "transparent" : tint(tone, 0.08),
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.03em",
        transition: "all .6s ease",
      }}
    >
      {label}
    </div>
    {dead && (
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <line x1="4" y1="50" x2="96" y2="50" stroke={solid(T.dead)} strokeWidth="6" opacity="0.85" />
      </svg>
    )}
  </div>
);

export const IconSvg = ({ d, tone, size = 15, vb = "0 0 24 24" }) => (
  <svg
    width={size}
    height={size}
    viewBox={vb}
    fill="none"
    stroke={solid(tone)}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {d}
  </svg>
);

// minimal icon paths
export const P = {
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18" />
    </>
  ),
  brain: (
    <>
      <path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 3c0 1.3.8 2.4 2 2.8V15a3 3 0 0 0 3 3h1V4H9z" />
      <path d="M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 3c0 1.3-.8 2.4-2 2.8V15a3 3 0 0 1-3 3h-1V4h1z" />
    </>
  ),
  bot: (
    <>
      <rect x="5" y="8" width="14" height="11" rx="2" />
      <path d="M12 8V4M9 4h6" />
      <circle cx="9.5" cy="13" r="0.8" fill="currentColor" />
      <circle cx="14.5" cy="13" r="0.8" fill="currentColor" />
    </>
  ),
  loop: (
    <>
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 3v5h-5" />
    </>
  ),
  factory: (
    <>
      <path d="M3 21V10l6 4v-4l6 4V7h4v14H3z" />
      <path d="M17 3v4" />
    </>
  ),
  tower: (
    <>
      <path d="M6 21 L12 3 L18 21" />
      <path d="M8.2 15 H15.8 M9.2 11 H14.8 M10.2 7 H13.8" />
      <path d="M4 21 H20" />
    </>
  ),
  bolt: <path d="M13 2 L4 14 h6 l-1 8 l9-12 h-6 z" />,
  arm: (
    <>
      <path d="M5 21 h5" />
      <path d="M7.5 21 v-6" />
      <path d="M7.5 15 l6 -4" />
      <path d="M13.5 11 l4 2.2" />
      <path d="M17.5 13.2 l1.6 -1.1 M17.5 13.2 l1 1.7" />
      <circle cx="7.5" cy="15" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="13.5" cy="11" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
    </>
  ),
  atom: (
    <>
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" />
    </>
  ),
  sat: (
    <>
      <rect x="9" y="9" width="6" height="6" rx="1" transform="rotate(45 12 12)" />
      <path d="M4 4l4 4M16 16l4 4M2 8l4-4M16 8l4-4" />
    </>
  ),
  fan: (
    <>
      <circle cx="12" cy="12" r="1.8" />
      <path d="M12 10c0-3-1-5 -3.5-5S6 8 9 10M14 12c3 0 5-1 5-3.5S15.5 6 14 9M12 14c0 3 1 5 3.5 5s2.5-3-0.5-5M10 12c-3 0-5 1-5 3.5S8.5 18 10 15" />
    </>
  ),
  drop: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  battery: (
    <>
      <rect x="3" y="8" width="16" height="10" rx="1.5" />
      <path d="M21 11v4" />
      <path d="M11 10.5 L8.5 13.5 H11.5 L9 16.5" />
    </>
  ),
};
