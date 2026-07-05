import React from "react";
import { T, solid, tint, Reveal, IconSvg, P } from "./primitives";

// ─────────────────────────────────────────────────────────────
// ORBITAL DATA CENTERS — paired schematics, terrestrial vs orbital.
// Each GW on Earth gets harder; each GW in orbit gets easier & cheaper.
// step 0: Earth · 1: Orbit revealed
// ─────────────────────────────────────────────────────────────

const TERR = T.e1; // steel — Earth
const ORB = T.e3; // cyan — Orbit
const GUTTER = 52;
const LABEL = 172;
const SW = 240, SH = 108;

// ── schematics (bold line diagrams) ──────────────────────────
const svgProps = (c) => ({ width: SW, height: SH, viewBox: `0 0 ${SW} ${SH}`, fill: "none", stroke: c, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" });

// COMPUTE — racks linked by fiber
function TerrCompute({ c }) {
  const rack = (x) => (
    <g key={x}>
      <rect x={x} y="26" width="46" height="60" rx="3" />
      <path d={`M${x + 8} 38h30M${x + 8} 48h30M${x + 8} 58h30M${x + 8} 68h30`} strokeWidth="1.3" />
    </g>
  );
  return (
    <svg {...svgProps(c)}>
      {[22, 172].map(rack)}
      <path d="M68 56h104" />
      <circle cx="120" cy="56" r="3.2" fill={c} stroke="none" />
    </svg>
  );
}
// COMPUTE — sats linked by laser, downlink to a dish
function OrbCompute({ c }) {
  const sat = (x) => (
    <g key={x}>
      <rect x={x} y="30" width="28" height="22" rx="2" />
      <rect x={x - 20} y="33" width="16" height="16" />
      <rect x={x + 28} y="33" width="16" height="16" />
    </g>
  );
  return (
    <svg {...svgProps(c)}>
      {[40, 160].map(sat)}
      <path d="M84 41h80" strokeDasharray="5 5" />
      <path d="M120 52v30" strokeDasharray="3 5" strokeWidth="1.4" />
      <path d="M106 90a14 10 0 0 1 28 0z" />
    </svg>
  );
}

// STRUCTURE — a building vs a launch to a bus
function TerrStructure({ c }) {
  return (
    <svg {...svgProps(c)}>
      <rect x="66" y="24" width="96" height="62" rx="2" />
      <path d="M82 38h22M124 38h22M82 52h22M124 52h22M82 66h22M124 66h22" strokeWidth="1.3" />
      <path d="M18 86h204" strokeWidth="1.4" />
    </svg>
  );
}
function OrbStructure({ c }) {
  return (
    <svg {...svgProps(c)}>
      {/* trajectory */}
      <path d="M40 90 Q120 6 190 34" strokeDasharray="4 7" strokeWidth="1.5" />
      {/* rocket */}
      <g transform="translate(40 84)">
        <path d="M0 0c5-7 5-15 0-22c-5 7-5 15 0 22z" />
        <path d="M-4 -3l-6 7M4 -3l6 7" />
      </g>
      {/* bus */}
      <g transform="translate(184 34)">
        <rect x="-14" y="-11" width="28" height="22" rx="2" />
        <rect x="-34" y="-8" width="16" height="16" />
        <rect x="18" y="-8" width="16" height="16" />
      </g>
    </svg>
  );
}

// OPERATIONS — power plant + cooling towers vs sun + solar + radiator
function TerrOps({ c }) {
  return (
    <svg {...svgProps(c)}>
      {/* plant */}
      <rect x="14" y="48" width="42" height="38" />
      <rect x="24" y="32" width="9" height="16" />
      <path d="M28 30c-4-4 4-8 0-13" strokeWidth="1.3" opacity="0.7" />
      {/* arrow */}
      <path d="M62 66h26" />
      <path d="M88 66l-9-4.5v9z" fill={c} stroke="none" />
      {/* cooling towers */}
      <path d="M104 86C108 64 108 64 114 46L134 46C140 64 140 64 144 86" />
      <ellipse cx="124" cy="46" rx="10" ry="3" />
      <path d="M158 86C162 66 162 66 167 50L183 50C188 66 188 66 192 86" />
      <ellipse cx="175" cy="50" rx="8" ry="2.6" />
      <path d="M120 44c-4-5 4-9 0-15M172 48c-4-5 4-9 0-14" strokeWidth="1.3" opacity="0.7" />
      <path d="M8 86h218" strokeWidth="1.3" />
    </svg>
  );
}
function OrbOps({ c }) {
  const arw = (x) => (
    <g key={x}>
      <path d={`M${x} 42h16`} />
      <path d={`M${x + 16} 42l-7-4v8z`} fill={c} stroke="none" />
    </g>
  );
  return (
    <svg {...svgProps(c)}>
      {/* sun */}
      <circle cx="24" cy="42" r="9" />
      <path d="M24 28v-6M24 56v6M10 42H4M38 42h6M14 32l-4-4M34 52l4 4M34 32l4-4M14 52l-4 4" strokeWidth="1.3" />
      {arw(40)}
      {/* solar */}
      <rect x="66" y="30" width="32" height="24" rx="2" />
      <path d="M77 30v24M87 30v24M66 42h32" strokeWidth="1.2" />
      {arw(102)}
      {/* chip */}
      <rect x="128" y="30" width="24" height="24" rx="2" />
      <rect x="135" y="37" width="10" height="10" />
      {arw(156)}
      {/* radiator */}
      <rect x="182" y="28" width="28" height="28" rx="2" />
      <path d="M191 28v28M200 28v28" strokeWidth="1.2" />
      <path d="M216 34c5 3 5 6 0 9M216 46c5 3 5 6 0 9" strokeWidth="1.3" opacity="0.75" />
    </svg>
  );
}

// ── row / cell ───────────────────────────────────────────────
function Cell({ schem: Schem, c, value, unit, big, border, reveal, step }) {
  const content = (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <Schem c={c} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: big ? 52 : 38, lineHeight: 1, color: c }}>{value}</span>
        {unit && <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: solid(T.muted) }}>{unit}</span>}
      </div>
    </div>
  );
  return (
    <div style={{ padding: "0 22px", height: "100%", display: "flex", alignItems: "center", borderLeft: border ? `1px solid ${tint(T.line, 0.5)}` : "none" }}>
      {reveal ? <Reveal on={step >= 1} delay={140}>{content}</Reveal> : content}
    </div>
  );
}

function Row({ label, terr, orbit, step, first }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `${LABEL}px 1fr 1fr`, borderTop: first ? "none" : `1px solid ${tint(T.line, 0.6)}`, minHeight: 176, alignItems: "center" }}>
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
    <div style={{ padding: "9px 22px 4px", borderLeft: border ? `1px solid ${tint(T.line, 0.5)}` : "none", display: "flex", alignItems: "baseline", gap: 10 }}>
      <span style={{ fontSize: 20, fontWeight: 800, color: solid(tone), lineHeight: 1 }}>{arrow}</span>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, letterSpacing: "0.04em", textTransform: "uppercase", color: solid(tone) }}>{word}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: solid(T.muted) }}>{reasons}</span>
    </div>
  );
}

export default function OrbitalSlide({ step = 0 }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "28px 44px 18px", boxSizing: "border-box", background: `radial-gradient(1100px 560px at 80% -10%, ${tint(ORB, 0.06)}, transparent)` }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 44, lineHeight: 1.02, letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 16 }}>
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
        <Group label="CAPEX · /GW" tone={T.text}>
          <Row
            first
            step={step}
            label="Compute"
            terr={{ schem: TerrCompute, value: "$30B", unit: "/ GW" }}
            orbit={{ schem: OrbCompute, value: "$30B", unit: "/ GW" }}
          />
          <Row
            step={step}
            label="Structure"
            terr={{ schem: TerrStructure, value: "$10–15B", unit: "/ GW" }}
            orbit={{ schem: OrbStructure, value: "≈ $11B", unit: "/ GW" }}
          />
        </Group>

        <Group label="OPERATIONS · /GW·YR" tone={ORB}>
          <Row
            first
            step={step}
            label="Operations"
            terr={{ schem: TerrOps, value: "$0.5–1B", unit: "/ yr" }}
            orbit={{ schem: OrbOps, value: "≈ $0", big: true }}
          />
        </Group>
      </div>

      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, lineHeight: 1.5, color: solid(T.muted), opacity: 0.7, marginTop: 4, maxWidth: 1200 }}>
        Structure ≈ $11B/GW — Starship: 100 t &amp; 5 MW per launch at $200/kg = $20M → $4B/GW launch; buses 1.5 t @ $500K → $6.7B/GW. Compute held equal to terrestrial.
      </div>
    </div>
  );
}

function ColHeader({ icon, label, tone, border }) {
  return (
    <div style={{ padding: "0 22px", borderLeft: border ? `1px solid ${tint(T.line, 0.5)}` : "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, borderBottom: `2px solid ${solid(tone)}`, paddingBottom: 7 }}>
        <IconSvg d={icon} tone={tone} size={22} />
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, letterSpacing: "0.09em", color: solid(tone) }}>{label}</span>
      </div>
    </div>
  );
}

OrbitalSlide.steps = 1;
OrbitalSlide.title = "Orbital Data Centers";
