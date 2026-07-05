import React from "react";
import { T, solid, tint, Reveal, IconSvg, P } from "./primitives";

// ─────────────────────────────────────────────────────────────
// ORBITAL DATA CENTERS — 3 cost buckets per GW, CapEx vs Operations.
// step 0: Earth · 1: Orbit revealed · 2: the cost inversion
// ─────────────────────────────────────────────────────────────

const TERR = T.e1; // steel — Earth
const ORB = T.e3; // cyan — Orbit

// big icon(s) + big cost figure
function Side({ icons, tone, value, unit, big }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <div style={{ display: "flex", gap: 12, flex: "none" }}>
        {icons.map((d, i) => (
          <IconSvg key={i} d={d} tone={tone} size={46} />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: big ? 60 : 44, lineHeight: 1, color: solid(tone) }}>{value}</span>
        {unit && <span style={{ fontFamily: "var(--font-mono)", fontSize: 15, color: solid(T.muted) }}>{unit}</span>}
      </div>
    </div>
  );
}

function BigRow({ label, earth, orbit, step, minH = 172 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "196px 1fr 1fr", borderTop: `1px solid ${tint(T.line, 0.7)}`, minHeight: minH, alignItems: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 19, letterSpacing: "0.06em", color: solid(T.text), textTransform: "uppercase", paddingRight: 12 }}>
        {label}
      </div>
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

function SectionTag({ children }) {
  return (
    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.18em", color: solid(T.muted), whiteSpace: "nowrap", marginTop: 14, marginBottom: 2 }}>
      {children}
    </div>
  );
}

export default function OrbitalSlide({ step = 0 }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "30px 44px 20px", boxSizing: "border-box", background: `radial-gradient(1100px 560px at 80% -10%, ${tint(ORB, 0.06)}, transparent)` }}>
      {/* title */}
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 46, lineHeight: 1.02, letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 18 }}>
        Orbital Data Centers
      </div>

      {/* column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "196px 1fr 1fr" }}>
        <div />
        <ColHeader icon={P.building} label="TERRESTRIAL" tone={TERR} />
        <ColHeader icon={P.rocket} label="ORBITAL" tone={ORB} border />
      </div>

      <div style={{ flex: 1 }}>
        <SectionTag>CAPEX · PER GW</SectionTag>
        <BigRow
          step={step}
          label="Structure"
          earth={{ icons: [P.building], value: "$10–15B", unit: "/ GW" }}
          orbit={{ icons: [P.rocket, P.sat], value: "launch + bus" }}
        />
        <BigRow
          step={step}
          label="Compute"
          earth={{ icons: [P.cpu], value: "$30B", unit: "/ GW" }}
          orbit={{ icons: [P.cpu, P.shield], value: "$30B", unit: "/ GW" }}
        />

        <SectionTag>OPERATIONS · PER GW · YR</SectionTag>
        <BigRow
          step={step}
          minH={190}
          label="Operations"
          earth={{ icons: [P.factory, P.person], value: "$0.5–1B", unit: "/ yr" }}
          orbit={{ icons: [P.sun, P.radiator], value: "≈ $0", big: true }}
        />
      </div>

      {/* takeaway */}
      <div style={{ marginTop: 8, borderTop: `1px solid ${tint(T.line, 0.7)}`, paddingTop: 12, display: "flex", justifyContent: "center", minHeight: 38 }}>
        <Reveal on={step >= 2}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 24, letterSpacing: "0.04em", textTransform: "uppercase", textAlign: "center" }}>
            Earth pays forever.{" "}
            <span style={{ color: solid(ORB) }}>Orbit pays once, then the sun is free.</span>
          </div>
        </Reveal>
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

OrbitalSlide.steps = 2;
OrbitalSlide.title = "Orbital Data Centers";
