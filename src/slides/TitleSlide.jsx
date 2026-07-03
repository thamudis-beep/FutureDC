import React from "react";
import { T, solid, tint, P } from "./primitives";

// ── background glyphs ────────────────────────────────────────

const Chip = ({ x, y, s = 1, tone = T.muted, op = 0.16 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <rect x="-8" y="-8" width="16" height="16" rx="2" fill="none" stroke={solid(tone)} strokeWidth="1.1" />
    <rect x="-3.5" y="-3.5" width="7" height="7" rx="1" fill="none" stroke={solid(tone)} strokeWidth="0.9" />
    {[-4, 0, 4].map((o) => (
      <g key={o} stroke={solid(tone)} strokeWidth="0.9">
        <line x1={o} y1="-8" x2={o} y2="-11" />
        <line x1={o} y1="8" x2={o} y2="11" />
        <line x1="-8" y1={o} x2="-11" y2={o} />
        <line x1="8" y1={o} x2="11" y2={o} />
      </g>
    ))}
  </g>
);

const Sat = ({ tone = T.muted, op = 0.55, s = 1 }) => (
  <g opacity={op} transform={`scale(${s})`}>
    <rect x="-5" y="-3.5" width="10" height="7" rx="1" fill={tint(tone, 0.12)} stroke={solid(tone)} strokeWidth="1.1" />
    <rect x="-20" y="-4" width="12" height="8" fill="none" stroke={solid(tone)} strokeWidth="0.9" />
    <rect x="8" y="-4" width="12" height="8" fill="none" stroke={solid(tone)} strokeWidth="0.9" />
  </g>
);

const Orbit = ({ cx, cy, r, dur, dir = 1 }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill="none" stroke={tint(T.text, 0.06)} strokeWidth="1" />
    <g>
      <animateTransform attributeName="transform" type="rotate" from={`${dir > 0 ? 0 : 360} ${cx} ${cy}`} to={`${dir > 0 ? 360 : 0} ${cx} ${cy}`} dur={`${dur}s`} repeatCount="indefinite" />
      <g transform={`translate(${cx} ${cy - r})`}>
        <Sat tone={T.muted} op={0.4} s={0.8} />
      </g>
    </g>
  </g>
);

const RecursiveCore = ({ cx, cy }) => (
  <g transform={`translate(${cx} ${cy})`}>
    {[46, 32, 20].map((r, i) => (
      <g key={r}>
        <animateTransform attributeName="transform" type="rotate" from={`${i % 2 ? 360 : 0} 0 0`} to={`${i % 2 ? 0 : 360} 0 0`} dur={`${18 + i * 10}s`} repeatCount="indefinite" />
        <rect x={-r} y={-r} width={r * 2} height={r * 2} rx="3" fill="none" stroke={solid(T.e3)} strokeWidth="1.1" opacity={0.5 - i * 0.08} transform="rotate(45)" />
      </g>
    ))}
    <g stroke={solid(T.e3)} strokeWidth="1.6" fill="none" opacity="0.95">
      <path d="M11 0a11 11 0 1 1-3.3-7.8" />
      <path d="M11 -11 v6 h-6" />
    </g>
    <circle cx="0" cy="0" r="2.2" fill={solid(T.e3)} />
  </g>
);

// a labeled node: icon in a circle + mono label
const ThemeNode = ({ x, y, d, label, side = "right", tone = T.e3 }) => (
  <g>
    <circle cx={x} cy={y} r="15" fill="rgb(var(--bg))" stroke={tint(tone, 0.55)} strokeWidth="1" />
    <svg x={x - 9} y={y - 9} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={solid(tone)} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
    <text x={side === "right" ? x + 23 : x - 23} y={y + 4} textAnchor={side === "right" ? "start" : "end"} fontFamily="var(--font-mono)" fontSize="12.5" letterSpacing="0.07em" fill={solid(T.muted)}>
      {label}
    </text>
  </g>
);

function CoverBackground() {
  const cx = 1000;
  const cy = 452;
  const nodes = [
    { x: 1000, y: 246, d: P.sat, label: "ORBITAL COMPUTE", side: "right" },
    { x: 1190, y: 342, d: P.mem, label: "MEMORY FABRIC", side: "right" },
    { x: 1216, y: 452, d: P.cpu, label: "CUSTOM SILICON", side: "right" },
    { x: 1190, y: 562, d: P.arm, label: "PHYSICAL AI", side: "right" },
    { x: 1064, y: 648, d: P.bot, label: "AGENT SWARMS", side: "right" },
    { x: 858, y: 648, d: P.atom, label: "NUCLEAR POWER", side: "left" },
  ];
  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      <defs>
        <pattern id="bpGrid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M48 0 H0 V48" fill="none" stroke={tint(T.text, 0.035)} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="1440" height="900" fill="url(#bpGrid)" />

      {/* faint chip lattice */}
      {[[250, 150, 0.85], [1330, 250, 0.8], [1360, 700, 0.9], [300, 770, 0.8]].map(([x, y, s], i) => (
        <Chip key={i} x={x} y={y} s={s} />
      ))}

      {/* orbital scaffold */}
      <Orbit cx={cx} cy={cy} r={132} dur={34} dir={1} />
      <Orbit cx={cx} cy={cy} r={224} dur={58} dir={-1} />
      <Orbit cx={cx} cy={cy} r={314} dur={82} dir={1} />

      {/* self-recursive AI core */}
      <RecursiveCore cx={cx} cy={cy} />
      <text x={cx} y={cy + 74} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12.5" letterSpacing="0.07em" fill={solid(T.e3)} opacity="0.9">
        SELF-IMPROVING AI
      </text>

      {/* themed nodes around the core */}
      {nodes.map((n, i) => (
        <ThemeNode key={i} {...n} />
      ))}
    </svg>
  );
}

// ── cover ────────────────────────────────────────────────────

export default function TitleSlide() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 96px",
        boxSizing: "border-box",
        background: `radial-gradient(1200px 760px at 68% 48%, ${tint(T.e3, 0.06)}, transparent 68%)`,
      }}
    >
      <CoverBackground />

      <div style={{ position: "relative", zIndex: 1 }}>
        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 800,
            fontSize: 92,
            lineHeight: 1.0,
            letterSpacing: "-0.035em",
            margin: 0,
            maxWidth: 720,
          }}
        >
          Future of the<br />
          <span style={{ color: solid(T.e3) }}>Data Center</span>
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 34 }}>
          <div style={{ width: 52, height: 2, background: solid(T.e3) }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: solid(T.muted), letterSpacing: "0.14em" }}>
            THE FULL-STACK REBUILD
          </span>
        </div>
      </div>
    </div>
  );
}

TitleSlide.steps = 0;
TitleSlide.title = "Future of the Data Center";
