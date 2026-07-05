import React from "react";
import { T, solid, tint, Reveal, IconSvg, P } from "./primitives";

// ─────────────────────────────────────────────────────────────
// ORBITAL DATA CENTERS — paired schematics, terrestrial vs orbital.
// The orbital architecture is nothing like a GW campus: it's thousands of
// small-MW satellites meshed by optical lasers. Animated on reveal.
// step 0: Earth · 1: Orbit revealed
// ─────────────────────────────────────────────────────────────

const TERR = T.e1; // steel — Earth
const ORB = T.e3; // cyan — Orbit
const GUTTER = 52;
const LABEL = 172;
const SW = 250, SH = 110;

const svgProps = (c) => ({ width: SW, height: SH, viewBox: `0 0 ${SW} ${SH}`, fill: "none", stroke: c, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" });

// COMPUTE — a dense rack hall vs a laser-meshed constellation
function TerrCompute({ c }) {
  const rack = (x, y) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="30" height="30" rx="2" />
      <path d={`M${x + 6} ${y + 7}h18M${x + 6} ${y + 14}h18M${x + 6} ${y + 21}h18`} strokeWidth="1.1" />
    </g>
  );
  return (
    <svg {...svgProps(c)}>
      {[24, 66, 108, 150, 192].map((x) => [22, 60].map((y) => rack(x, y)))}
      <path d="M14 96h222" strokeWidth="1.3" />
    </svg>
  );
}
const CONSTELLATION = {
  nodes: [[28, 26], [70, 18], [112, 28], [154, 20], [196, 30], [46, 54], [92, 60], [134, 54], [178, 60], [216, 52], [30, 86], [74, 92], [118, 84], [162, 92], [204, 84]],
  links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 9], [0, 5], [1, 6], [2, 6], [3, 7], [4, 8], [5, 6], [6, 7], [7, 8], [8, 9], [5, 10], [6, 11], [7, 12], [8, 13], [9, 14], [10, 11], [11, 12], [12, 13], [13, 14], [6, 12], [8, 12]],
};
function OrbCompute({ c }) {
  const { nodes, links } = CONSTELLATION;
  return (
    <svg {...svgProps(c)}>
      <g className="flow" stroke={c} strokeWidth="1" strokeDasharray="4 5" opacity="0.55" fill="none">
        {links.map(([a, b], i) => (
          <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} />
        ))}
      </g>
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 4} y={y - 3} width="8" height="6" rx="1" fill={c} fillOpacity="0.15" stroke={c} strokeWidth="1.2" />
          <line x1={x - 9} y1={y} x2={x - 4} y2={y} strokeWidth="0.9" />
          <line x1={x + 4} y1={y} x2={x + 9} y2={y} strokeWidth="0.9" />
        </g>
      ))}
    </svg>
  );
}

// STRUCTURE — a building vs a launch deploying a constellation
function TerrStructure({ c }) {
  return (
    <svg {...svgProps(c)}>
      <rect x="72" y="26" width="100" height="64" rx="2" />
      <path d="M88 40h24M132 40h24M88 54h24M132 54h24M88 68h24M132 68h24" strokeWidth="1.2" />
      <path d="M18 90h214" strokeWidth="1.4" />
    </svg>
  );
}
function OrbStructure({ c }) {
  const sat = (x, y) => (
    <g key={`${x}-${y}`}>
      <rect x={x - 4} y={y - 3} width="8" height="6" rx="1" fill={c} fillOpacity="0.15" />
      <line x1={x - 8} y1={y} x2={x - 4} y2={y} strokeWidth="0.9" />
      <line x1={x + 4} y1={y} x2={x + 8} y2={y} strokeWidth="0.9" />
    </g>
  );
  return (
    <svg {...svgProps(c)}>
      {/* trajectory */}
      <path className="flow" d="M44 92 Q118 8 196 30" strokeDasharray="5 7" strokeWidth="1.5" />
      {/* rocket + flame */}
      <g transform="translate(44 86)">
        <path d="M0 0c5-7 5-16 0-24c-5 8-5 17 0 24z" />
        <path d="M-4 -3l-6 8M4 -3l6 8" />
        <path className="pulse" d="M-3 1q3 8 3 0M3 1q-3 8-3 0" strokeWidth="1.6" />
      </g>
      {/* deployed constellation */}
      {[[176, 24], [206, 34], [188, 50], [216, 58]].map(([x, y]) => sat(x, y))}
      <g stroke={c} strokeWidth="0.9" strokeDasharray="3 4" opacity="0.5" className="flow">
        <path d="M176 24L206 34M206 34L188 50M188 50L216 58" />
      </g>
    </svg>
  );
}

// OPERATIONS — the three recurring cost drivers: power · cooling+water · people
function Driver({ d, label, c, dim }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: "none", opacity: dim ? 0.5 : 1 }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.02em", color: solid(T.muted), whiteSpace: "nowrap" }}>{label}</span>
    </div>
  );
}
function TerrOps({ c }) {
  return (
    <div style={{ display: "flex", gap: 24 }}>
      <Driver c={c} d={P.meter} label="grid power" />
      <Driver c={c} d={P.drop} label="water + chillers" />
      <Driver c={c} d={P.person} label="staff" />
    </div>
  );
}
function OrbOps({ c }) {
  return (
    <div style={{ display: "flex", gap: 24 }}>
      <Driver c={c} d={P.sun} label="free sun" />
      <Driver c={c} d={P.radiator} label="passive radiator" />
      <Driver c={c} d={P.personoff} label="unmanned" />
    </div>
  );
}

// ── row / cell ───────────────────────────────────────────────
function Cell({ schem: Schem, c, value, unit, big, note, border, reveal, step }) {
  const content = (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <Schem c={c} />
        {note && <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.04em", color: solid(T.muted), whiteSpace: "nowrap" }}>{note}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: big ? 52 : 38, lineHeight: 1, color: c }}>{value}</span>
        {unit && <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: solid(T.muted) }}>{unit}</span>}
      </div>
    </div>
  );
  return (
    <div style={{ padding: "0 20px", height: "100%", display: "flex", alignItems: "center", borderLeft: border ? `1px solid ${tint(T.line, 0.5)}` : "none" }}>
      {reveal ? <Reveal on={step >= 1} delay={140}>{content}</Reveal> : content}
    </div>
  );
}

function Row({ label, terr, orbit, step, first }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `${LABEL}px 1fr 1fr`, borderTop: first ? "none" : `1px solid ${tint(T.line, 0.6)}`, minHeight: 178, alignItems: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 19, letterSpacing: "0.06em", color: solid(T.text), textTransform: "uppercase", paddingRight: 10 }}>{label}</div>
      <Cell {...terr} c={solid(TERR)} />
      <Cell {...orbit} c={solid(ORB)} border reveal step={step} />
    </div>
  );
}

function Group({ label, tone, children }) {
  return (
    <div style={{ display: "flex", alignItems: "stretch" }}>
      <div style={{ width: GUTTER, flex: "none", position: "relative" }}>
        <div style={{ position: "absolute", left: 14, top: 8, bottom: 8, width: 4, borderRadius: 2, background: solid(tone) }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: 14 }}>
          <span style={{ transform: "rotate(-90deg)", fontFamily: "var(--font-mono)", fontSize: 12.5, fontWeight: 600, letterSpacing: "0.22em", color: solid(tone), whiteSpace: "nowrap" }}>{label}</span>
        </div>
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function Trend({ arrow, word, reasons, tone, border }) {
  return (
    <div style={{ padding: "9px 20px 4px", borderLeft: border ? `1px solid ${tint(T.line, 0.5)}` : "none", display: "flex", alignItems: "baseline", gap: 10 }}>
      <span style={{ fontSize: 20, fontWeight: 800, color: solid(tone), lineHeight: 1 }}>{arrow}</span>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, letterSpacing: "0.04em", textTransform: "uppercase", color: solid(tone) }}>{word}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: solid(T.muted) }}>{reasons}</span>
    </div>
  );
}

export default function OrbitalSlide({ step = 0 }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "28px 44px 16px", boxSizing: "border-box", background: `radial-gradient(1100px 560px at 80% -10%, ${tint(ORB, 0.06)}, transparent)` }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 44, lineHeight: 1.02, letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 14 }}>
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

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Group label="OPERATIONS · /GW·YR" tone={ORB}>
          <Row
            first
            step={step}
            label="Operations"
            terr={{ schem: TerrOps, value: "$0.5–1B", unit: "/ yr" }}
            orbit={{ schem: OrbOps, value: "≈ $0", big: true }}
          />
        </Group>

        <Group label="CAPEX · /GW" tone={T.text}>
          <Row
            first
            step={step}
            label="Compute"
            terr={{ schem: TerrCompute, value: "$30B", unit: "/ GW", note: "one GW campus" }}
            orbit={{ schem: OrbCompute, value: "$30B", unit: "/ GW", note: "1000s of small-MW sats · optical mesh" }}
          />
          <Row
            step={step}
            label="Structure"
            terr={{ schem: TerrStructure, value: "$10–15B", unit: "/ GW" }}
            orbit={{ schem: OrbStructure, value: "≈ $11B", unit: "/ GW" }}
          />
        </Group>
      </div>

      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, lineHeight: 1.5, color: solid(T.muted), opacity: 0.7, marginTop: 2, maxWidth: 1220 }}>
        Structure ≈ $11B/GW — Starship: 100 t &amp; 5 MW per launch at $200/kg = $20M → $4B/GW launch; ~13,000 buses/GW (1.5 t, ~75 kW ea) @ $500K → $6.7B/GW. Compute held equal to terrestrial.
      </div>
    </div>
  );
}

function ColHeader({ icon, label, tone, border }) {
  return (
    <div style={{ padding: "0 20px", borderLeft: border ? `1px solid ${tint(T.line, 0.5)}` : "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, borderBottom: `2px solid ${solid(tone)}`, paddingBottom: 7 }}>
        <IconSvg d={icon} tone={tone} size={22} />
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, letterSpacing: "0.09em", color: solid(tone) }}>{label}</span>
      </div>
    </div>
  );
}

OrbitalSlide.steps = 1;
OrbitalSlide.title = "Orbital Data Centers";
