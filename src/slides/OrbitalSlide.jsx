import React from "react";
import { T, solid, tint, Reveal, IconSvg, P } from "./primitives";

// ─────────────────────────────────────────────────────────────
// ORBITAL DATA CENTERS — terrestrial vs orbital, 3 cost buckets per GW.
// Each GW on Earth gets harder; each GW in orbit gets easier & cheaper.
// step 0: Earth · 1: Orbit revealed
// ─────────────────────────────────────────────────────────────

const TERR = T.e1; // steel — Earth
const ORB = T.e3; // cyan — Orbit
const GUTTER = 52;
const LABEL = 176;

// a labeled schematic part: icon + caption
function Part({ d, label, tone, size = 38 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: "none" }}>
      <IconSvg d={d} tone={tone} size={size} />
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.03em", color: solid(T.muted), whiteSpace: "nowrap" }}>{label}</span>
    </div>
  );
}

function Side({ parts, tone, value, unit, big }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      <div style={{ display: "flex", gap: 18 }}>
        {parts.map((p, i) => (
          <Part key={i} {...p} tone={tone} />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: big ? 58 : 44, lineHeight: 1, color: solid(tone) }}>{value}</span>
        {unit && <span style={{ fontFamily: "var(--font-mono)", fontSize: 15, color: solid(T.muted) }}>{unit}</span>}
      </div>
    </div>
  );
}

function BigRow({ label, earth, orbit, step, minH = 150, first }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `${LABEL}px 1fr 1fr`, borderTop: first ? "none" : `1px solid ${tint(T.line, 0.6)}`, minHeight: minH, alignItems: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 19, letterSpacing: "0.06em", color: solid(T.text), textTransform: "uppercase", paddingRight: 10 }}>{label}</div>
      <div style={{ padding: "0 24px" }}>
        <Side {...earth} tone={TERR} />
      </div>
      <div style={{ padding: "0 24px", height: "100%", display: "flex", alignItems: "center", borderLeft: `1px solid ${tint(T.line, 0.5)}` }}>
        <Reveal on={step >= 1} delay={140}>
          <Side {...orbit} tone={ORB} />
        </Reveal>
      </div>
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
    <div style={{ padding: "9px 24px 4px", borderLeft: border ? `1px solid ${tint(T.line, 0.5)}` : "none", display: "flex", alignItems: "baseline", gap: 10 }}>
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

      {/* column headers */}
      <div style={{ display: "grid", gridTemplateColumns: `${GUTTER + LABEL}px 1fr 1fr` }}>
        <div />
        <ColHeader icon={P.building} label="TERRESTRIAL" tone={TERR} />
        <ColHeader icon={P.rocket} label="ORBITAL" tone={ORB} border />
      </div>

      {/* the divergence */}
      <div style={{ display: "grid", gridTemplateColumns: `${GUTTER + LABEL}px 1fr 1fr` }}>
        <div />
        <Trend arrow="↑" word="every GW harder" reasons="permits · NIMBY · find the power" tone={T.dead} />
        <Trend arrow="↓" word="every GW easier" reasons="scale · $/kg keeps falling" tone={ORB} border />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
        <Group label="CAPEX · /GW" tone={T.text}>
          <BigRow
            first
            step={step}
            label="Compute"
            earth={{ parts: [{ d: P.cpu, label: "GPUs" }, { d: P.link, label: "fiber" }], value: "$30B", unit: "/ GW" }}
            orbit={{ parts: [{ d: P.cpu, label: "hardened" }, { d: P.laser, label: "optical" }], value: "$30B", unit: "/ GW" }}
          />
          <BigRow
            step={step}
            label="Structure"
            earth={{ parts: [{ d: P.building, label: "shell" }], value: "$10–15B", unit: "/ GW" }}
            orbit={{ parts: [{ d: P.rocket, label: "launch" }, { d: P.sat, label: "bus" }], value: "≈ $11B", unit: "/ GW" }}
          />
        </Group>

        <Group label="OPERATIONS · /GW·YR" tone={ORB}>
          <BigRow
            first
            step={step}
            label="Operations"
            earth={{ parts: [{ d: P.tower, label: "grid" }, { d: P.person, label: "staff" }, { d: P.fan, label: "cooling" }], value: "$0.5–1B", unit: "/ yr" }}
            orbit={{ parts: [{ d: P.solar, label: "solar" }, { d: P.radiator, label: "radiator" }], value: "≈ $0", big: true }}
          />
          {/* explain how orbit runs at ~$0 */}
          <div style={{ display: "grid", gridTemplateColumns: `${LABEL}px 1fr` }}>
            <div />
            <Reveal on={step >= 1} delay={260}>
              <OrbitOpsFlow />
            </Reveal>
          </div>
        </Group>
      </div>

      {/* methodology */}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, lineHeight: 1.5, color: solid(T.muted), opacity: 0.75, marginTop: 4, maxWidth: 1200 }}>
        Structure ≈ $11B/GW — Starship: 100 t &amp; 5 MW per launch at $200/kg = $20M → $4B/GW launch; buses 1.5 t @ $500K → $6.7B/GW. Compute held equal to terrestrial.
      </div>
    </div>
  );
}

function ColHeader({ icon, label, tone, border }) {
  return (
    <div style={{ padding: "0 24px", borderLeft: border ? `1px solid ${tint(T.line, 0.5)}` : "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, borderBottom: `2px solid ${solid(tone)}`, paddingBottom: 7 }}>
        <IconSvg d={icon} tone={tone} size={22} />
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, letterSpacing: "0.09em", color: solid(tone) }}>{label}</span>
      </div>
    </div>
  );
}

// horizontal schematic: sunlight → solar → compute → heat → radiator → space
function OrbitOpsFlow() {
  const c = solid(ORB);
  const mut = solid(T.muted);
  const y = 40;
  const arrow = (x1, x2) => (
    <g stroke={c} strokeWidth="1.6" opacity="0.75">
      <line x1={x1} y1={y} x2={x2 - 8} y2={y} />
      <path d={`M${x2} ${y} l-8 -4.5 v9 z`} fill={c} stroke="none" />
    </g>
  );
  const lab = (x, t, tone = mut) => (
    <text x={x} y="80" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" letterSpacing="0.04em" fill={tone}>{t}</text>
  );
  return (
    <div style={{ paddingLeft: 24, paddingTop: 8 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.14em", color: mut, marginBottom: 2 }}>HOW ORBIT RUNS AT ≈ $0</div>
      <svg width="100%" height="92" viewBox="0 0 1060 92" preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
        {/* sun */}
        <g stroke={c} strokeWidth="1.7" fill="none">
          <circle cx="46" cy={y} r="12" />
          <path d="M46 20v-7M46 60v7M20 40h-7M72 40h7M28 22l-5-5M64 58l5 5M64 22l5-5M28 58l-5 5" />
        </g>
        {lab(46, "sunlight", c)}
        {arrow(78, 168)}

        {/* solar panel */}
        <g stroke={c} strokeWidth="1.6" fill="none">
          <rect x="176" y="26" width="60" height="28" rx="2" />
          <path d="M196 26v28M216 26v28M176 35h60M176 45h60" />
        </g>
        {lab(206, "solar cells", c)}
        {arrow(246, 348)}

        {/* compute */}
        <g stroke={c} strokeWidth="1.6" fill="none">
          <rect x="356" y="24" width="34" height="32" rx="2" />
          <rect x="366" y="34" width="14" height="12" rx="1" />
          <path d="M362 24v-5M384 24v-5M362 56v5M384 56v5M356 32h-5M356 48h-5M390 32h5M390 48h5" />
        </g>
        {lab(373, "compute", c)}
        {/* waste-heat wiggles rising off compute */}
        <g stroke={c} strokeWidth="1.4" fill="none" opacity="0.7">
          <path d="M400 30c4-4 4-8 0-12M410 34c4-4 4-8 0-12" />
        </g>
        {arrow(400, 512)}
        <text x="456" y="20" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill={mut}>waste heat</text>

        {/* radiator */}
        <g stroke={c} strokeWidth="1.6" fill="none">
          <rect x="520" y="24" width="46" height="32" rx="2" />
          <path d="M532 24v32M544 24v32M556 24v32" />
        </g>
        {lab(543, "thin-metal radiator", c)}
        {/* heat radiating right */}
        <g stroke={c} strokeWidth="1.5" fill="none" opacity="0.75">
          <path d="M574 32c6 3 6 6 0 9M586 28c9 5 9 10 0 15M598 33c5 2 5 5 0 7" />
        </g>
        {arrow(610, 720)}

        {/* deep space */}
        <g stroke={c} fill={c}>
          <path d="M756 30l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" opacity="0.9" strokeWidth="0" />
          <circle cx="736" cy="48" r="1.6" />
          <circle cx="778" cy="44" r="1.4" />
          <circle cx="762" cy="56" r="1.3" />
        </g>
        {lab(757, "→ deep space", mut)}

        {/* payoff */}
        <text x="900" y="36" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="700" fontSize="17" letterSpacing="0.03em" fill={c} style={{ textTransform: "uppercase" }}>no fuel</text>
        <text x="900" y="56" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="700" fontSize="17" letterSpacing="0.03em" fill={c} style={{ textTransform: "uppercase" }}>no water · no chillers</text>
      </svg>
    </div>
  );
}

OrbitalSlide.steps = 1;
OrbitalSlide.title = "Orbital Data Centers";
