import React from "react";
import { T, solid, tint, Reveal, IconSvg, P } from "./primitives";

// ─────────────────────────────────────────────────────────────
// ORBITAL DATA CENTERS (option A) — precise layer comparison + the curve.
// Four subsystems, terrestrial vs orbital, then cost-per-GW over time.
// step 0: Earth · 1: Orbit revealed + the crossover
// ─────────────────────────────────────────────────────────────

const TERR = T.e1;
const ORB = T.e3;
const GUTTER = 50;
const LABEL = 168;

// compact schematics (static — no ambient motion)
const sp = (c) => ({ width: 196, height: 86, viewBox: "0 0 250 110", fill: "none", stroke: c, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" });

function TerrPower({ c }) {
  return (
    <svg {...sp(c)}>
      <rect x="24" y="48" width="58" height="42" />
      <rect x="36" y="32" width="10" height="16" /><rect x="60" y="32" width="10" height="16" />
      <path d="M41 30c-4-4 4-8 0-13M65 30c-4-4 4-8 0-13" strokeWidth="1.4" opacity="0.75" />
      <path d="M152 90L145 46M152 90L159 46M147 58h10M148 70h8M145 46h14" strokeWidth="1.6" />
      <g strokeWidth="1.1" opacity="0.8"><path d="M82 60c34 0 40 -8 63 -8M82 72c34 2 40 -4 63 -6M159 52c22 0 36 6 62 6M159 62c22 2 36 8 62 8" /></g>
      <path d="M8 90h228" strokeWidth="1.3" />
    </svg>
  );
}
function OrbPower({ c }) {
  return (
    <svg {...sp(c)}>
      <circle cx="38" cy="30" r="10" />
      <path d="M38 16v-6M22 30h-6M27 19l-4-4M27 41l-4 4M49 19l4-4" strokeWidth="1.3" />
      <g strokeDasharray="3 4" opacity="0.6"><path d="M47 38l42 12M50 32l40 8" strokeWidth="1" /></g>
      <rect x="92" y="40" width="132" height="48" rx="2" />
      <path d="M114 40v48M136 40v48M158 40v48M180 40v48M202 40v48M92 64h132" strokeWidth="1.1" />
    </svg>
  );
}
function TerrCooling({ c }) {
  return (
    <svg {...sp(c)}>
      <rect x="10" y="46" width="30" height="36" rx="2" /><circle cx="25" cy="64" r="7" /><path d="M25 60v8M21 64h8" strokeWidth="1.1" /><path d="M40 64h16" />
      <rect x="56" y="42" width="34" height="42" rx="2" /><path d="M62 52h22M62 60h22M62 68h22M62 76h22" strokeWidth="1.1" /><path d="M90 62h14" />
      <path d="M110 84C115 64 115 64 121 48L143 48C150 64 150 64 155 84" /><ellipse cx="132" cy="48" rx="11" ry="3" /><path d="M127 46c-4-5 4-9 0-15" strokeWidth="1.4" opacity="0.75" /><path d="M155 62h12" />
      <rect x="167" y="48" width="30" height="30" rx="2" /><circle cx="176" cy="63" r="4" /><circle cx="188" cy="63" r="4" />
      <g strokeWidth="1.3" opacity="0.85"><path d="M208 52c3 4 3 7 0 7s-3-3 0-7M220 64c3 4 3 7 0 7s-3-3 0-7" /></g>
      <path d="M6 84h230" strokeWidth="1.3" />
    </svg>
  );
}
function OrbCooling({ c }) {
  return (
    <svg {...sp(c)}>
      <rect x="10" y="46" width="20" height="20" rx="2" /><rect x="15" y="51" width="10" height="10" rx="1" />
      <rect x="30" y="51" width="188" height="10" rx="2" fill={c} fillOpacity="0.12" /><path d="M38 56h172" strokeWidth="0.8" opacity="0.5" />
      <g strokeWidth="1.3" opacity="0.85"><path d="M66 50c1-5 5-6 5-11M104 50c1-5 5-6 5-11M142 50c1-5 5-6 5-11M180 50c1-5 5-6 5-11M66 62c1 5 5 6 5 11M104 62c1 5 5 6 5 11M142 62c1 5 5 6 5 11M180 62c1 5 5 6 5 11" /></g>
      <g fill={c} stroke="none"><circle cx="120" cy="28" r="1.4" /><circle cx="196" cy="86" r="1.3" /><circle cx="150" cy="90" r="1.2" /></g>
    </svg>
  );
}
function TerrCompute({ c }) {
  const rack = (x, y) => (<g key={`${x}-${y}`}><rect x={x} y={y} width="30" height="30" rx="2" /><path d={`M${x + 6} ${y + 7}h18M${x + 6} ${y + 14}h18M${x + 6} ${y + 21}h18`} strokeWidth="1.1" /></g>);
  return (<svg {...sp(c)}>{[24, 66, 108, 150, 192].map((x) => [22, 60].map((y) => rack(x, y)))}<path d="M14 96h222" strokeWidth="1.3" /></svg>);
}
const CN = [[28, 26], [70, 18], [112, 28], [154, 20], [196, 30], [46, 54], [92, 60], [134, 54], [178, 60], [216, 52], [30, 86], [74, 92], [118, 84], [162, 92], [204, 84]];
const CLk = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 9], [0, 5], [1, 6], [2, 6], [3, 7], [4, 8], [5, 6], [6, 7], [7, 8], [8, 9], [5, 10], [6, 11], [7, 12], [8, 13], [9, 14], [10, 11], [11, 12], [12, 13], [13, 14], [6, 12], [8, 12]];
function OrbCompute({ c }) {
  return (
    <svg {...sp(c)}>
      <g stroke={c} strokeWidth="1" strokeDasharray="4 5" opacity="0.55" fill="none">
        {CLk.map(([a, b], i) => <line key={i} x1={CN[a][0]} y1={CN[a][1]} x2={CN[b][0]} y2={CN[b][1]} />)}
      </g>
      {CN.map(([x, y], i) => (
        <g key={i}><rect x={x - 4} y={y - 3} width="8" height="6" rx="1" fill={c} fillOpacity="0.15" stroke={c} strokeWidth="1.2" /><line x1={x - 9} y1={y} x2={x - 4} y2={y} strokeWidth="0.9" /><line x1={x + 4} y1={y} x2={x + 9} y2={y} strokeWidth="0.9" /></g>
      ))}
    </svg>
  );
}
function TerrStructure({ c }) {
  return (<svg {...sp(c)}><rect x="72" y="26" width="100" height="64" rx="2" /><path d="M88 40h24M132 40h24M88 54h24M132 54h24M88 68h24M132 68h24" strokeWidth="1.2" /><path d="M18 90h214" strokeWidth="1.4" /></svg>);
}
function OrbStructure({ c }) {
  const sat = (x, y) => (<g key={`${x}-${y}`}><rect x={x - 4} y={y - 3} width="8" height="6" rx="1" fill={c} fillOpacity="0.15" /><line x1={x - 8} y1={y} x2={x - 4} y2={y} strokeWidth="0.9" /><line x1={x + 4} y1={y} x2={x + 8} y2={y} strokeWidth="0.9" /></g>);
  return (
    <svg {...sp(c)}>
      <path d="M44 92 Q118 8 196 30" strokeDasharray="5 7" strokeWidth="1.5" opacity="0.7" />
      <g transform="translate(44 86)"><path d="M0 0c5-7 5-16 0-24c-5 8-5 17 0 24z" /><path d="M-4 -3l-6 8M4 -3l6 8" /></g>
      {[[176, 24], [206, 34], [188, 50], [216, 58]].map(([x, y]) => sat(x, y))}
      <g stroke={c} strokeWidth="0.9" strokeDasharray="3 4" opacity="0.5"><path d="M176 24L206 34M206 34L188 50M188 50L216 58" /></g>
    </svg>
  );
}

function Cell({ schem: Schem, c, value, unit, big, note, border, reveal, step }) {
  const content = (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <Schem c={c} />
        {note && <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.03em", color: solid(T.muted), whiteSpace: "nowrap" }}>{note}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: big ? 42 : 32, lineHeight: 1, color: c }}>{value}</span>
        {unit && <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: solid(T.muted) }}>{unit}</span>}
      </div>
    </div>
  );
  return (
    <div style={{ padding: "0 18px", height: "100%", display: "flex", alignItems: "center", borderLeft: border ? `1px solid ${tint(T.line, 0.5)}` : "none" }}>
      {reveal ? <Reveal on={step >= 1} delay={120}>{content}</Reveal> : content}
    </div>
  );
}
function Row({ label, terr, orbit, step, first }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `${LABEL}px 1fr 1fr`, borderTop: first ? "none" : `1px solid ${tint(T.line, 0.6)}`, minHeight: 96, alignItems: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, letterSpacing: "0.06em", color: solid(T.text), textTransform: "uppercase" }}>{label}</div>
      <Cell {...terr} c={solid(TERR)} />
      <Cell {...orbit} c={solid(ORB)} border reveal step={step} />
    </div>
  );
}
function Group({ label, tone, children }) {
  return (
    <div style={{ display: "flex", alignItems: "stretch" }}>
      <div style={{ width: GUTTER, flex: "none", position: "relative" }}>
        <div style={{ position: "absolute", left: 12, top: 6, bottom: 6, width: 4, borderRadius: 2, background: solid(tone) }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: 12 }}>
          <span style={{ transform: "rotate(-90deg)", fontFamily: "var(--font-mono)", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.2em", color: solid(tone), whiteSpace: "nowrap" }}>{label}</span>
        </div>
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
function ColHeader({ icon, label, tone, border }) {
  return (
    <div style={{ padding: "0 18px", borderLeft: border ? `1px solid ${tint(T.line, 0.5)}` : "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, borderBottom: `2px solid ${solid(tone)}`, paddingBottom: 6 }}>
        <IconSvg d={icon} tone={tone} size={20} />
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, letterSpacing: "0.09em", color: solid(tone) }}>{label}</span>
      </div>
    </div>
  );
}

// the curve — cumulative cost per GW over time (full-width band)
function CurveBand({ step }) {
  const live = step >= 1;
  const earth = "M70,150 C360,140 620,104 1090,34";
  const orbit = "M70,52 C420,86 760,124 1090,140";
  return (
    <div style={{ display: "grid", gridTemplateColumns: `${GUTTER + LABEL}px 1fr`, marginTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.16em", color: solid(T.muted), transform: "rotate(-90deg)", whiteSpace: "nowrap" }}>COST / GW ↑</span>
      </div>
      <svg viewBox="0 0 1130 180" width="100%" height="196" preserveAspectRatio="none" style={{ display: "block" }}>
        <line x1="60" y1="12" x2="60" y2="160" stroke={tint(T.line, 0.8)} strokeWidth="1" />
        <line x1="60" y1="160" x2="1110" y2="160" stroke={tint(T.line, 0.8)} strokeWidth="1" />
        <text x="1108" y="176" textAnchor="end" fontFamily="var(--font-mono)" fontSize="11" fill={solid(T.muted)}>capacity deployed · time →</text>

        {live && (
          <g>
            <rect x="600" y="12" width="510" height="148" fill={solid(ORB)} opacity="0.05" />
            <line x1="600" y1="12" x2="600" y2="160" stroke={solid(ORB)} strokeDasharray="3 4" strokeWidth="1" opacity="0.55" />
            <circle cx="600" cy="99" r="4" fill={solid(ORB)} />
            <text x="614" y="28" fontFamily="var(--font-mono)" fontSize="11.5" letterSpacing="0.05em" fill={solid(ORB)}>orbit cheaper from here →</text>
          </g>
        )}

        {/* earth — pay forever, rising */}
        <path d={earth} fill="none" stroke={solid(TERR)} strokeWidth="3" vectorEffect="non-scaling-stroke" />
        <text x="1104" y="30" textAnchor="end" fontFamily="var(--font-display)" fontWeight="700" fontSize="16" fill={solid(T.dead)}>EARTH — PAY FOREVER ↑</text>

        {/* orbit — pay once, falling */}
        <path d={orbit} fill="none" stroke={solid(ORB)} strokeWidth="3" vectorEffect="non-scaling-stroke" pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: live ? 0 : 1, transition: "stroke-dashoffset 1.1s ease .2s" }} />
        <text x="1104" y="156" textAnchor="end" fontFamily="var(--font-display)" fontWeight="700" fontSize="16" fill={solid(ORB)} style={{ opacity: live ? 1 : 0, transition: "opacity .5s ease 1s" }}>ORBIT — PAY ONCE ↓</text>
      </svg>
    </div>
  );
}

export default function OrbitalSlide({ step = 0 }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "26px 44px 14px", boxSizing: "border-box", background: `radial-gradient(1100px 560px at 82% -10%, ${tint(ORB, 0.06)}, transparent)` }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 42, lineHeight: 1.02, letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 10 }}>
        Orbital Data Centers
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `${GUTTER + LABEL}px 1fr 1fr` }}>
        <div />
        <ColHeader icon={P.building} label="TERRESTRIAL" tone={TERR} />
        <ColHeader icon={P.rocket} label="ORBITAL" tone={ORB} border />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `${GUTTER + LABEL}px 1fr 1fr` }}>
        <div />
        <Trend arrow="↑" word="every GW harder" reasons="permits · NIMBY · find the power" tone={T.dead} />
        <Trend arrow="↓" word="every GW easier" reasons="scale · $/kg keeps falling" tone={ORB} border />
      </div>

      <Group label="OPERATIONS · /YR" tone={ORB}>
        <Row first step={step} label="Power" terr={{ schem: TerrPower, value: "$/yr", note: "grid · fuel · $/kWh" }} orbit={{ schem: OrbPower, value: "$0", note: "solar cells · free" }} />
        <Row step={step} label="Cooling" terr={{ schem: TerrCooling, value: "$/yr", note: "CDUs · chillers · towers · pumps" }} orbit={{ schem: OrbCooling, value: "$0", note: "one thin aluminum radiator" }} />
      </Group>
      <Group label="CAPEX · /GW" tone={T.text}>
        <Row first step={step} label="Compute" terr={{ schem: TerrCompute, value: "$30B", unit: "/ GW", note: "one GW campus" }} orbit={{ schem: OrbCompute, value: "$30B", unit: "/ GW", note: "1000s of small-MW sats" }} />
        <Row step={step} label="Structure" terr={{ schem: TerrStructure, value: "$10–15B", unit: "/ GW", note: "shell + land + permits" }} orbit={{ schem: OrbStructure, value: "≈ $11B", unit: "/ GW", note: "200 launches → few thousand sats" }} />
      </Group>

      <CurveBand step={step} />

      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, lineHeight: 1.5, color: solid(T.muted), opacity: 0.7, marginTop: 2, maxWidth: 1240 }}>
        CapEx ≈ equal (~$41B/GW). Orbit structure: Starship 100 t &amp; 5 MW/launch at $200/kg = $4B/GW launch + ~13,000 buses (1.5 t, ~75 kW) @ $500K = $6.7B/GW. Live in hours vs ~3 yr to build. Illustrative.
      </div>
    </div>
  );
}

function Trend({ arrow, word, reasons, tone, border }) {
  return (
    <div style={{ padding: "8px 18px 4px", borderLeft: border ? `1px solid ${tint(T.line, 0.5)}` : "none", display: "flex", alignItems: "baseline", gap: 9 }}>
      <span style={{ fontSize: 19, fontWeight: 800, color: solid(tone), lineHeight: 1 }}>{arrow}</span>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, letterSpacing: "0.04em", textTransform: "uppercase", color: solid(tone) }}>{word}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: solid(T.muted) }}>{reasons}</span>
    </div>
  );
}

OrbitalSlide.steps = 1;
OrbitalSlide.title = "Orbital — layers + curve (option A)";
