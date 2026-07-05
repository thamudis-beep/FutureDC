import React from "react";
import { T, solid, tint, Reveal, IconSvg, P } from "./primitives";

// ─────────────────────────────────────────────────────────────
// ORBITAL DATA CENTERS — 3 cost buckets per GW, bracketed CapEx vs Operations.
// The orbital column shows its real hardware: bus, optical, solar, radiator.
// step 0: Earth · 1: Orbit revealed
// ─────────────────────────────────────────────────────────────

const TERR = T.e1; // steel — Earth
const ORB = T.e3; // cyan — Orbit

const GUTTER = 52;
const LABEL = 184;

function Side({ icons, tone, value, unit, big }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      <div style={{ display: "flex", gap: 12, flex: "none" }}>
        {icons.map((d, i) => (
          <IconSvg key={i} d={d} tone={tone} size={50} />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: big ? 64 : 48, lineHeight: 1, color: solid(tone) }}>{value}</span>
        {unit && <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: solid(T.muted) }}>{unit}</span>}
      </div>
    </div>
  );
}

function BigRow({ label, earth, orbit, step, minH = 210, first }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `${LABEL}px 1fr 1fr`, borderTop: first ? "none" : `1px solid ${tint(T.line, 0.6)}`, minHeight: minH, alignItems: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, letterSpacing: "0.06em", color: solid(T.text), textTransform: "uppercase", paddingRight: 12 }}>
        {label}
      </div>
      <div style={{ padding: "0 26px" }}>
        <Side {...earth} tone={TERR} />
      </div>
      <div style={{ padding: "0 26px", height: "100%", display: "flex", alignItems: "center", borderLeft: `1px solid ${tint(T.line, 0.5)}` }}>
        <Reveal on={step >= 1} delay={140}>
          <Side {...orbit} tone={ORB} />
        </Reveal>
      </div>
    </div>
  );
}

// vertical bracket + rotated label grouping a set of rows
function Group({ label, tone, children }) {
  return (
    <div style={{ display: "flex", alignItems: "stretch" }}>
      <div style={{ width: GUTTER, flex: "none", position: "relative" }}>
        <div style={{ position: "absolute", left: 14, top: 10, bottom: 10, width: 4, borderRadius: 2, background: solid(tone) }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: 14 }}>
          <span style={{ transform: "rotate(-90deg)", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, letterSpacing: "0.24em", color: solid(tone), whiteSpace: "nowrap" }}>{label}</span>
        </div>
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

export default function OrbitalSlide({ step = 0 }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "32px 44px 24px", boxSizing: "border-box", background: `radial-gradient(1100px 560px at 80% -10%, ${tint(ORB, 0.06)}, transparent)` }}>
      {/* title */}
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 48, lineHeight: 1.02, letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 22 }}>
        Orbital Data Centers
      </div>

      {/* column headers */}
      <div style={{ display: "grid", gridTemplateColumns: `${GUTTER + LABEL}px 1fr 1fr` }}>
        <div />
        <ColHeader icon={P.building} label="TERRESTRIAL" tone={TERR} />
        <ColHeader icon={P.rocket} label="ORBITAL" tone={ORB} border />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 26 }}>
        <Group label="CAPEX · /GW" tone={T.text}>
          <BigRow
            first
            step={step}
            label="Structure"
            earth={{ icons: [P.building], value: "$10–15B", unit: "/ GW" }}
            orbit={{ icons: [P.rocket, P.sat], value: "launch + bus" }}
          />
          <BigRow
            step={step}
            label="Compute"
            earth={{ icons: [P.cpu, P.link], value: "$30B", unit: "/ GW" }}
            orbit={{ icons: [P.cpu, P.laser], value: "$30B", unit: "/ GW" }}
          />
        </Group>

        <Group label="OPERATIONS · /GW·YR" tone={ORB}>
          <BigRow
            first
            step={step}
            minH={210}
            label="Operations"
            earth={{ icons: [P.factory, P.person], value: "$0.5–1B", unit: "/ yr" }}
            orbit={{ icons: [P.solar, P.radiator], value: "≈ $0", big: true }}
          />
        </Group>
      </div>
    </div>
  );
}

function ColHeader({ icon, label, tone, border }) {
  return (
    <div style={{ padding: "0 26px", borderLeft: border ? `1px solid ${tint(T.line, 0.5)}` : "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, borderBottom: `2px solid ${solid(tone)}`, paddingBottom: 7 }}>
        <IconSvg d={icon} tone={tone} size={22} />
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, letterSpacing: "0.09em", color: solid(tone) }}>{label}</span>
      </div>
    </div>
  );
}

OrbitalSlide.steps = 1;
OrbitalSlide.title = "Orbital Data Centers";
