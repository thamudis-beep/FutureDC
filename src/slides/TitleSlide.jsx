import React from "react";
import { T, solid, tint, P } from "./primitives";

// ── background glyphs ────────────────────────────────────────

// a chip: die + package + pins
const Chip = ({ x, y, s = 1, tone = T.muted, op = 0.22 }) => (
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

// SpaceX-style satellite: body + two solar arrays
const Sat = ({ tone = T.muted, op = 0.55, s = 1 }) => (
  <g opacity={op} transform={`scale(${s})`}>
    <rect x="-5" y="-3.5" width="10" height="7" rx="1" fill={tint(tone, 0.12)} stroke={solid(tone)} strokeWidth="1.1" />
    <line x1="-5" y1="0" x2="-9" y2="0" stroke={solid(tone)} strokeWidth="0.9" />
    <line x1="5" y1="0" x2="9" y2="0" stroke={solid(tone)} strokeWidth="0.9" />
    <rect x="-22" y="-4.5" width="13" height="9" fill="none" stroke={solid(tone)} strokeWidth="0.9" />
    <rect x="9" y="-4.5" width="13" height="9" fill="none" stroke={solid(tone)} strokeWidth="0.9" />
    <line x1="-15.5" y1="-4.5" x2="-15.5" y2="4.5" stroke={solid(tone)} strokeWidth="0.6" />
    <line x1="15.5" y1="-4.5" x2="15.5" y2="4.5" stroke={solid(tone)} strokeWidth="0.6" />
  </g>
);

// an orbit ring carrying one satellite, slowly rotating
const Orbit = ({ cx, cy, r, dur, dir = 1, tone = T.muted, satOp = 0.55, satS = 1 }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill="none" stroke={tint(T.text, 0.07)} strokeWidth="1" />
    <g>
      <animateTransform
        attributeName="transform"
        type="rotate"
        from={`${dir > 0 ? 0 : 360} ${cx} ${cy}`}
        to={`${dir > 0 ? 360 : 0} ${cx} ${cy}`}
        dur={`${dur}s`}
        repeatCount="indefinite"
      />
      <g transform={`translate(${cx} ${cy - r})`}>
        <Sat tone={tone} op={satOp} s={satS} />
      </g>
    </g>
  </g>
);

// self-recursive AI core: nested counter-rotating rings + a loop glyph
const RecursiveCore = ({ cx, cy }) => (
  <g transform={`translate(${cx} ${cy})`}>
    {[46, 32, 20].map((r, i) => (
      <g key={r}>
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`${i % 2 ? 360 : 0} 0 0`}
          to={`${i % 2 ? 0 : 360} 0 0`}
          dur={`${18 + i * 10}s`}
          repeatCount="indefinite"
        />
        <rect x={-r} y={-r} width={r * 2} height={r * 2} rx="3" fill="none" stroke={solid(T.e3)} strokeWidth="1.1" opacity={0.5 - i * 0.08} transform="rotate(45)" />
      </g>
    ))}
    <g stroke={solid(T.e3)} strokeWidth="1.6" fill="none" opacity="0.9">
      <path d="M11 0a11 11 0 1 1-3.3-7.8" />
      <path d="M11 -11 v6 h-6" />
    </g>
    <circle cx="0" cy="0" r="2.2" fill={solid(T.e3)} />
  </g>
);

// small atom (nuclear)
const Atom = ({ x, y, tone = T.e3, op = 0.5 }) => (
  <g transform={`translate(${x} ${y})`} opacity={op} stroke={solid(tone)} strokeWidth="1.1" fill="none">
    <circle cx="0" cy="0" r="2" fill={solid(tone)} stroke="none" />
    <ellipse cx="0" cy="0" rx="20" ry="8" />
    <ellipse cx="0" cy="0" rx="20" ry="8" transform="rotate(60)" />
    <ellipse cx="0" cy="0" rx="20" ry="8" transform="rotate(120)" />
  </g>
);

function CoverBackground() {
  const cx = 1010;
  const cy = 452;
  // chip lattice scattered across the field
  const chips = [
    [240, 150, 0.9], [1300, 210, 0.8], [1360, 560, 1], [1180, 740, 0.9],
    [820, 800, 0.8], [150, 470, 1], [95, 720, 0.8], [430, 250, 0.7],
    [1330, 380, 0.7], [690, 120, 0.8], [560, 690, 0.7], [960, 150, 0.7],
  ];
  // optical links (dashed, animated flow) between a few points and the core
  const links = [
    "M150 470 L400 470 L760 452",
    "M240 150 L560 300 L964 430",
    "M1300 210 L1150 320 L1056 430",
    "M1180 740 L1090 600 L1030 498",
    "M820 800 L900 640 L985 500",
    "M1360 560 L1150 500 L1058 466",
  ];
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    >
      {/* faint network mesh */}
      <g stroke={tint(T.text, 0.05)} strokeWidth="1" fill="none">
        <path d="M150 470 L430 250 L690 120 L960 150 L1300 210" />
        <path d="M95 720 L560 690 L820 800 L1180 740 L1360 560" />
        <path d="M240 150 L150 470 L95 720" />
        <path d="M1300 210 L1330 380 L1360 560" />
      </g>

      {/* optical flows toward the recursive core */}
      <g fill="none" stroke={solid(T.e3)} strokeWidth="1.1" strokeDasharray="4 7" opacity="0.32">
        {links.map((d, i) => (
          <path key={i} className="flow" d={d} />
        ))}
      </g>

      {/* chips */}
      {chips.map(([x, y, s], i) => (
        <Chip key={i} x={x} y={y} s={s} tone={i % 5 === 0 ? T.e3 : T.muted} op={i % 5 === 0 ? 0.38 : 0.2} />
      ))}

      {/* orbital system */}
      <Orbit cx={cx} cy={cy} r={126} dur={34} dir={1} tone={T.e3} satOp={0.9} />
      <Orbit cx={cx} cy={cy} r={212} dur={58} dir={-1} tone={T.muted} satOp={0.6} satS={0.95} />
      <Orbit cx={cx} cy={cy} r={300} dur={82} dir={1} tone={T.muted} satOp={0.5} satS={0.9} />

      {/* self-recursive AI core at the center of the system */}
      <RecursiveCore cx={cx} cy={cy} />

      {/* nuclear */}
      <Atom x={250} y={690} tone={T.e3} op={0.42} />
      <Atom x={1240} y={470} tone={T.muted} op={0.3} />
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
        background: `radial-gradient(1100px 720px at 70% 45%, ${tint(T.e3, 0.06)}, transparent 70%)`,
      }}
    >
      <CoverBackground />

      {/* title */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 104,
            lineHeight: 0.94,
            letterSpacing: "0.005em",
            textTransform: "uppercase",
            margin: 0,
            maxWidth: 900,
          }}
        >
          Future of the<br />
          <span style={{ color: solid(T.e3) }}>Data Center</span>
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 40 }}>
          <div style={{ width: 46, height: 2, background: solid(T.e3) }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: solid(T.muted), letterSpacing: "0.06em" }}>
            scroll or press → to begin
          </span>
        </div>
      </div>
    </div>
  );
}

TitleSlide.steps = 0;
TitleSlide.title = "Future of the Data Center";
