import React from "react";
import { ERAS, T, solid, tint, Reveal, Cap, Chip, EqBox, IconSvg, P } from "./primitives";

// ─────────────────────────────────────────────────────────────
// THE FULL-STACK REBUILD — animated framing slide.
// Driven by `step` from the deck (0..4):
//   0 frame · 1 Before AI · 2 AI Buildout · 3 AI-Native · 4 takeaway
// `era` = highest era revealed (1..3).
// ─────────────────────────────────────────────────────────────

// ── rows ─────────────────────────────────────────────────────

// each row renders three era cells; `era` = highest era revealed (0 none, 1..3)
function RowShell({ label, sub, cells, era }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "190px 1fr 1fr 1fr",
        borderTop: `1px solid ${tint(T.line, 0.7)}`,
        minHeight: 86,
      }}
    >
      <div style={{ padding: "12px 14px 10px 0", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 17,
            letterSpacing: "0.06em",
            color: solid(T.text),
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
        {sub && <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, color: solid(T.muted), marginTop: 3 }}>{sub}</div>}
      </div>
      {cells.map((cell, i) => (
        <div key={i} style={{ padding: "12px 16px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Reveal on={era >= i + 1} delay={120 + i * 40}>
            {cell}
          </Reveal>
        </div>
      ))}
    </div>
  );
}

const IconRow = ({ children }) => (
  <div style={{ display: "flex", gap: 5, alignItems: "flex-end", flexWrap: "wrap", maxWidth: 250 }}>{children}</div>
);

// 7 ▸ WORKLOADS
function WorkloadsRow({ era }) {
  return (
    <RowShell
      era={era}
      label="Workloads"
      sub="the demand driver"
      cells={[
        <div>
          <IconRow>
            {[0, 1, 2].map((i) => (
              <IconSvg key={i} d={P.globe} tone={T.e1} />
            ))}
          </IconRow>
          <Cap tone={T.e1}>web · batch · enterprise</Cap>
        </div>,
        <div>
          <IconRow>
            {[0, 1, 2].map((i) => (
              <IconSvg key={i} d={P.globe} tone={T.e1} size={12} />
            ))}
            {[0, 1, 2, 3, 4].map((i) => (
              <IconSvg key={i} d={P.brain} tone={T.e2} size={17} />
            ))}
          </IconRow>
          <Cap tone={T.e2}>training-dominated</Cap>
        </div>,
        <div>
          <IconRow>
            {[0, 1].map((i) => (
              <IconSvg key={i} d={P.brain} tone={T.e2} size={13} />
            ))}
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <IconSvg key={i} d={P.bot} tone={T.e3} size={16} />
            ))}
          </IconRow>
          <Cap tone={T.e3}>inference & agents dominate</Cap>
        </div>,
      ]}
    />
  );
}

// 6 ▸ DESIGN LOOP — shrinking cycle bar
function CycleBar({ w, tone, label, spin }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: w, height: 8, borderRadius: 4, background: tint(tone, 0.19), border: `1px solid ${solid(tone)}`, transition: "width .8s ease" }} />
        {spin && (
          <div className="spin" style={{ display: "flex" }}>
            <IconSvg d={P.loop} tone={tone} size={16} />
          </div>
        )}
      </div>
      <Cap tone={tone}>{label}</Cap>
    </div>
  );
}

function DesignRow({ era }) {
  return (
    <RowShell
      era={era}
      label="Design Loop"
      sub="EDA · chip cycles"
      cells={[
        <CycleBar w={170} tone={T.e1} label="manual · 2–3 yr cycle" />,
        <CycleBar w={90} tone={T.e2} label="AI-assisted EDA" />,
        <CycleBar w={34} tone={T.e3} label="models design models" spin />,
      ]}
    />
  );
}

// 5 ▸ NETWORKING
function NetCell({ stage }) {
  // 1: two racks, copper. 2: four racks, optical. 3: mesh of sites.
  if (stage === 1)
    return (
      <div>
        <svg width="200" height="34" viewBox="0 0 200 34">
          <rect x="8" y="7" width="16" height="20" rx="2" stroke={solid(T.e1)} fill="none" strokeWidth="1.5" />
          <rect x="176" y="7" width="16" height="20" rx="2" stroke={solid(T.e1)} fill="none" strokeWidth="1.5" />
          <line x1="24" y1="17" x2="176" y2="17" stroke={solid(T.e1)} strokeWidth="2" />
        </svg>
        <Cap tone={T.e1}>copper · top-of-rack</Cap>
      </div>
    );
  if (stage === 2)
    return (
      <div>
        <svg width="210" height="34" viewBox="0 0 210 34">
          {[8, 60, 112, 164].map((x, i) => (
            <rect key={i} x={x} y="7" width="14" height="20" rx="2" stroke={i === 0 ? solid(T.e1) : solid(T.e2)} fill="none" strokeWidth="1.5" />
          ))}
          <line className="flow" x1="22" y1="17" x2="164" y2="17" stroke={solid(T.e2)} strokeWidth="2" strokeDasharray="6 5" />
        </svg>
        <Cap tone={T.e2}>optical DCI · NVLink in-rack</Cap>
      </div>
    );
  return (
    <div>
      <svg width="200" height="40" viewBox="0 0 200 40">
        {[
          [30, 20],
          [100, 8],
          [170, 20],
          [100, 32],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="5.5" stroke={solid(T.e3)} fill={tint(T.e3, 0.13)} strokeWidth="1.5" />
        ))}
        <g className="flow" stroke={solid(T.e3)} strokeWidth="1.4" strokeDasharray="5 4">
          <line x1="30" y1="20" x2="100" y2="8" />
          <line x1="100" y1="8" x2="170" y2="20" />
          <line x1="170" y1="20" x2="100" y2="32" />
          <line x1="100" y1="32" x2="30" y2="20" />
          <line x1="30" y1="20" x2="170" y2="20" />
        </g>
      </svg>
      <Cap tone={T.e3}>co-packaged optics · multi-site fabric</Cap>
    </div>
  );
}

function NetworkingRow({ era }) {
  return (
    <RowShell
      era={era}
      label="Networking"
      sub="moving the data"
      cells={[<NetCell stage={1} />, <NetCell stage={2} />, <NetCell stage={3} />]}
    />
  );
}

// 4 ▸ SILICON — accumulating chips
function SiliconRow({ era }) {
  const cpus = (n, tone, dim) => Array.from({ length: n }, (_, i) => <Chip key={"c" + i} letter="C" tone={tone} dim={dim} />);
  const gpus = (n, tone) => Array.from({ length: n }, (_, i) => <Chip key={"g" + i} letter="G" tone={tone} />);
  const mems = (n, tone) => Array.from({ length: n }, (_, i) => <Chip key={"m" + i} letter="M" tone={tone} />);
  return (
    <RowShell
      era={era}
      label="Silicon"
      sub="compute · memory wall"
      cells={[
        <div>
          <IconRow>{cpus(4, T.e1)}</IconRow>
          <Cap tone={T.e1}>CPU scale-out</Cap>
        </div>,
        <div>
          <IconRow>
            {cpus(2, T.e1, true)}
            {gpus(8, T.e2)}
            {mems(4, T.e2)}
          </IconRow>
          <Cap tone={T.e2}>GPU-centric · HBM bottleneck</Cap>
        </div>,
        <div>
          <IconRow>
            {gpus(4, T.e2)}
            {mems(9, T.e3)}
            {cpus(5, T.e3)}
          </IconRow>
          <Cap tone={T.e3}>memory-tiered fleets · ratios per workload</Cap>
        </div>,
      ]}
    />
  );
}

// 3 ▸ RACK DENSITY — bar chart, sqrt-ish scale
function DensityBar({ h, tone, val, cap }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
      <div style={{ width: 26, height: 48, display: "flex", alignItems: "flex-end" }}>
        <div
          style={{
            width: "100%",
            height: h,
            background: `linear-gradient(180deg, ${solid(tone)}, ${tint(tone, 0.33)})`,
            borderRadius: "3px 3px 0 0",
            transition: "height .8s ease",
          }}
        />
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, color: solid(tone) }}>{val}</div>
        <Cap tone={tone}>{cap}</Cap>
      </div>
    </div>
  );
}

function DensityRow({ era }) {
  return (
    <RowShell
      era={era}
      label="Rack & Footprint"
      sub="kW per rack · where"
      cells={[
        <DensityBar h={4} tone={T.e1} val="3 kW" cap="metro colo" />,
        <DensityBar h={19} tone={T.e2} val="150 kW" cap="West Texas gigacampus" />,
        <DensityBar h={48} tone={T.e3} val="1 MW" cap="GW campus + edge sites" />,
      ]}
    />
  );
}

// 2 ▸ COOLING & POWER EQUIPMENT — chain, then replacement
function CoolingRow({ era }) {
  const dead = era >= 3;
  return (
    <RowShell
      era={era}
      label="Cooling & Power Eqpt"
      sub="thermal · distribution"
      cells={[
        <div>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <EqBox label="XFMR" tone={T.e1} />
            <EqBox label="UPS" tone={T.e1} />
            <EqBox label="PDU" tone={T.e1} />
            <IconSvg d={P.fan} tone={T.e1} size={17} />
          </div>
          <Cap tone={T.e1}>air-cooled · 415 V AC chain</Cap>
        </div>,
        <div>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <EqBox label="XFMR" tone={T.e1} />
            <EqBox label="UPS" tone={T.e1} />
            <EqBox label="PDU" tone={T.e1} />
            <IconSvg d={P.drop} tone={T.e2} size={16} />
            <IconSvg d={P.drop} tone={T.e2} size={16} />
          </div>
          <Cap tone={T.e2}>+ direct-to-chip liquid</Cap>
        </div>,
        <div>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <EqBox label="XFMR" tone={T.e1} dead={dead} />
            <EqBox label="UPS" tone={T.e1} dead={dead} />
            <EqBox label="PDU" tone={T.e1} dead={dead} />
            <span style={{ color: solid(T.e3), fontFamily: "var(--font-mono)", fontSize: 12 }}>→</span>
            <EqBox label="SST · 800 V DC" tone={T.e3} wide />
          </div>
          <Cap tone={T.e3}>solid-state transformer replaces the chain</Cap>
        </div>,
      ]}
    />
  );
}

// 1 ▸ POWER — full-width growing line chart (signature element)
function PowerRow({ era }) {
  const seg = (n) => ({
    strokeDasharray: 1,
    strokeDashoffset: era >= n ? 0 : 1,
    transition: `stroke-dashoffset 1.1s ease ${n === 1 ? 0.15 : 0.25}s`,
  });
  return (
    <div style={{ display: "grid", gridTemplateColumns: "190px 1fr", borderTop: `1px solid ${tint(T.line, 0.7)}`, minHeight: 118 }}>
      <div style={{ padding: "14px 14px 10px 0", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 17,
            letterSpacing: "0.06em",
            color: solid(T.text),
            textTransform: "uppercase",
          }}
        >
          Power
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, color: solid(T.muted), marginTop: 3 }}>the binding constraint</div>
      </div>
      <div style={{ position: "relative", padding: "8px 16px 6px" }}>
        <svg width="100%" height="78" viewBox="0 0 1000 78" preserveAspectRatio="none" style={{ display: "block" }}>
          <path d="M 8 68 L 330 60" pathLength="1" stroke={solid(T.e1)} strokeWidth="2.5" fill="none" style={seg(1)} />
          <path d="M 330 60 C 430 56, 540 44, 662 28" pathLength="1" stroke={solid(T.e2)} strokeWidth="2.5" fill="none" style={seg(2)} />
          <path d="M 662 28 C 760 14, 860 8, 992 4" pathLength="1" stroke={solid(T.e3)} strokeWidth="2.5" fill="none" style={seg(3)} />
        </svg>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", marginTop: 2 }}>
          <Reveal on={era >= 1} delay={200}>
            <Cap tone={T.e1}>grid · slow interconnect</Cap>
          </Reveal>
          <Reveal on={era >= 2} delay={300}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <IconSvg d={P.factory} tone={T.e2} size={15} />
              <IconSvg d={P.sun} tone={T.e2} size={15} />
              <Cap tone={T.e2}>grid + behind-the-meter</Cap>
            </div>
          </Reveal>
          <Reveal on={era >= 3} delay={400}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <IconSvg d={P.atom} tone={T.e3} size={15} />
              <IconSvg d={P.sat} tone={T.e3} size={15} />
              <Cap tone={T.e3}>dedicated nuclear · orbital</Cap>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

// ── slide ────────────────────────────────────────────────────

export default function StackRebuildSlide({ step = 0 }) {
  const era = Math.min(step, 3);
  const done = step >= StackRebuildSlide.steps;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `radial-gradient(1200px 600px at 70% -10%, ${tint(T.e3, 0.05)}, transparent)`,
        color: solid(T.text),
        display: "flex",
        flexDirection: "column",
        padding: "26px 40px 18px",
        boxSizing: "border-box",
      }}
    >
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: solid(T.muted), letterSpacing: "0.18em" }}>
            THE FUTURE OF DATA CENTERS
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 40,
              lineHeight: 1.05,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
            }}
          >
            Seven layers, rebuilt three times
          </div>
        </div>
      </div>

      {/* era column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "190px 1fr 1fr 1fr", marginBottom: 2 }}>
        <div />
        {ERAS.map((e, i) => (
          <div key={i} style={{ padding: "0 16px" }}>
            <Reveal on={era >= i + 1}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, borderBottom: `2px solid ${solid(e.tone)}`, paddingBottom: 5 }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, letterSpacing: "0.09em", color: solid(e.tone) }}>
                  {e.name}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, color: solid(T.muted) }}>{e.years}</span>
              </div>
            </Reveal>
          </div>
        ))}
      </div>

      {/* stack */}
      <div style={{ flex: 1, position: "relative" }}>
        {/* faint column tints behind rows */}
        <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "190px 1fr 1fr 1fr", pointerEvents: "none" }}>
          <div />
          {ERAS.map((e, i) => (
            <div
              key={i}
              style={{
                borderLeft: `1px solid ${tint(T.line, 0.7)}`,
                background: era >= i + 1 ? `linear-gradient(180deg, ${tint(e.tone, 0.03)}, transparent)` : "transparent",
                transition: "background .8s ease",
              }}
            />
          ))}
        </div>

        <WorkloadsRow era={era} />
        <DesignRow era={era} />
        <NetworkingRow era={era} />
        <SiliconRow era={era} />
        <DensityRow era={era} />
        <CoolingRow era={era} />
        <PowerRow era={era} />
      </div>

      {/* takeaway */}
      <div style={{ marginTop: 12, borderTop: `1px solid ${tint(T.line, 0.7)}`, paddingTop: 12, display: "flex", justifyContent: "center", minHeight: 44 }}>
        <Reveal on={done}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 34, height: 2, background: solid(T.e3) }} />
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 23, letterSpacing: "0.05em", textTransform: "uppercase", textAlign: "center" }}>
              Every layer is being redesigned at once —{" "}
              <span style={{ color: solid(T.e3) }}>the data center becomes the computer</span>
            </div>
            <div style={{ width: 34, height: 2, background: solid(T.e3) }} />
          </div>
        </Reveal>
      </div>
    </div>
  );
}

// Number of intra-slide advances (fragments) the deck should step through.
StackRebuildSlide.steps = 4;
StackRebuildSlide.title = "Seven layers, rebuilt three times";
