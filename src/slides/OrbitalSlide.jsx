import React from "react";
import { T, solid, tint, Reveal, Cap, IconSvg, P } from "./primitives";

// ─────────────────────────────────────────────────────────────
// ORBITAL DATA CENTERS — terrestrial vs orbital, layer by layer.
// step 0: Earth column · 1: Orbit column revealed · 2: the cost inversion
// ─────────────────────────────────────────────────────────────

const TERR = T.e1; // steel — Earth
const ORB = T.e3; // cyan — Orbit

// one side of a comparison row: icons + label + cost note
function Side({ icons, tone, label, cost }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flex: "none" }}>
        {icons.map((d, i) => (
          <IconSvg key={i} d={d} tone={tone} size={22} />
        ))}
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, letterSpacing: "0.02em", color: solid(T.text) }}>{label}</div>
        {cost && <Cap tone={tone}>{cost}</Cap>}
      </div>
    </div>
  );
}

function CmpRow({ label, terr, orbit, step, punch }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "168px 1fr 1fr",
        borderTop: `1px solid ${tint(T.line, 0.7)}`,
        minHeight: 88,
        background: punch && step >= 1 ? `linear-gradient(90deg, transparent 40%, ${tint(ORB, 0.05)})` : "transparent",
        transition: "background .6s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", padding: "10px 14px 10px 0" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, letterSpacing: "0.06em", color: solid(T.text), textTransform: "uppercase" }}>
          {label}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", padding: "10px 20px 10px 4px" }}>
        <Side {...terr} tone={TERR} />
      </div>
      <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderLeft: `1px solid ${tint(T.line, 0.5)}` }}>
        <Reveal on={step >= 1} delay={120}>
          <Side {...orbit} tone={ORB} />
        </Reveal>
      </div>
    </div>
  );
}

export default function OrbitalSlide({ step = 0 }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "26px 40px 18px", boxSizing: "border-box", background: `radial-gradient(1100px 560px at 78% -10%, ${tint(ORB, 0.06)}, transparent)` }}>
      {/* header */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: solid(T.muted), letterSpacing: "0.2em" }}>THE SAME STACK — LAUNCHED</div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 46, lineHeight: 1.02, letterSpacing: "0.02em", textTransform: "uppercase" }}>
          Orbital Data Centers
        </div>
      </div>

      {/* column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "168px 1fr 1fr", marginBottom: 2 }}>
        <div />
        <ColHeader icon={P.building} label="TERRESTRIAL" tone={TERR} />
        <ColHeader icon={P.rocket} label="ORBITAL" tone={ORB} border />
      </div>

      {/* comparison */}
      <div style={{ flex: 1 }}>
        <CmpRow
          step={step}
          label="Structure"
          terr={{ icons: [P.building], label: "data-center shell", cost: "$10–15 B / GW" }}
          orbit={{ icons: [P.sat], label: "satellite bus", cost: "folded into the launch" }}
        />
        <CmpRow
          step={step}
          label="Siting"
          terr={{ icons: [P.doc], label: "land + permitting", cost: "years · grid queue · NIMBY" }}
          orbit={{ icons: [P.rocket], label: "launch", cost: "$ / kg to orbit — and falling" }}
        />
        <CmpRow
          step={step}
          label="Power"
          terr={{ icons: [P.factory, P.tower, P.atom], label: "gas · grid · nuclear", cost: "fuel + $/kWh, forever" }}
          orbit={{ icons: [P.sun], label: "the sun", cost: "free · ~24/7 in the right orbit" }}
        />
        <CmpRow
          step={step}
          label="Cooling"
          terr={{ icons: [P.drop, P.fan], label: "liquid + chillers", cost: "water + power to reject heat" }}
          orbit={{ icons: [P.radiator], label: "thin-metal radiators", cost: "passive — radiate to space" }}
        />
        <CmpRow
          step={step}
          label="Networking"
          terr={{ icons: [P.link], label: "fiber + DCI", cost: "trenching + right-of-way" }}
          orbit={{ icons: [P.laser, P.dish], label: "laser links + ground stations", cost: "optical mesh, no dig" }}
        />
        <CmpRow
          step={step}
          label="Compute"
          terr={{ icons: [P.cpu], label: "GPUs", cost: "the same silicon" }}
          orbit={{ icons: [P.cpu, P.shield], label: "space-hardened compute", cost: "≈ equal cost" }}
        />
        <CmpRow
          step={step}
          punch
          label="Opex / kW"
          terr={{ icons: [P.person, P.dollar], label: "people · power bills · maintenance", cost: "the bill that never stops" }}
          orbit={{ icons: [P.sun, P.radiator], label: "amortized solar + radiator", cost: "≈ $0 / kW" }}
        />
      </div>

      {/* takeaway */}
      <div style={{ marginTop: 10, borderTop: `1px solid ${tint(T.line, 0.7)}`, paddingTop: 12, display: "flex", justifyContent: "center", minHeight: 40 }}>
        <Reveal on={step >= 2}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, letterSpacing: "0.04em", textTransform: "uppercase", textAlign: "center" }}>
            Earth pays forever — power, people, cooling.{" "}
            <span style={{ color: solid(ORB) }}>Orbit pays once to launch, then the sun is free.</span>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function ColHeader({ icon, label, tone, border }) {
  return (
    <div style={{ padding: "0 16px", borderLeft: border ? `1px solid ${tint(T.line, 0.5)}` : "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, borderBottom: `2px solid ${solid(tone)}`, paddingBottom: 6 }}>
        <IconSvg d={icon} tone={tone} size={19} />
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, letterSpacing: "0.09em", color: solid(tone) }}>{label}</span>
      </div>
    </div>
  );
}

OrbitalSlide.steps = 2;
OrbitalSlide.title = "Orbital Data Centers";
