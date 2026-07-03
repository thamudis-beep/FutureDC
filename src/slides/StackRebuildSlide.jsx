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
          <Cap tone={T.e1}>web · batch jobs</Cap>
        </div>,
        <div>
          <IconRow>
            {[0, 1, 2].map((i) => (
              <IconSvg key={i} d={P.brain} tone={T.e2} size={16} />
            ))}
            {[0, 1, 2].map((i) => (
              <IconSvg key={i} d={P.bot} tone={T.e2} size={14} />
            ))}
          </IconRow>
          <Cap tone={T.e2}>training + search, chat, basic agents</Cap>
        </div>,
        <div>
          <IconRow>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <IconSvg key={i} d={P.bot} tone={T.e3} size={15} />
            ))}
            {[0, 1].map((i) => (
              <IconSvg key={i} d={P.arm} tone={T.e3} size={17} />
            ))}
          </IconRow>
          <Cap tone={T.e3}>swarms of agents 24/7 + physical AI</Cap>
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
        <CycleBar w={170} tone={T.e1} label="3–5 yr cycles · manual" />,
        <CycleBar w={95} tone={T.e2} label="1–3 yr · modern EDA tools" />,
        <CycleBar w={34} tone={T.e3} label="< 1 yr · AI-assisted EDA" spin />,
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

// 3 ▸ RACK DENSITY + FOOTPRINT
// A rack whose fill shows kW/rack, next to a footprint that grows from a
// single in-city site → one large campus → many linked campuses + space + edge.
function RackDensity({ kw, tone, level }) {
  const units = 6;
  const litFrom = units - level * 2; // level 1→2 lit, 2→4, 3→6 (from bottom)
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg width="24" height="42" viewBox="0 0 24 42">
        <rect x="2" y="1" width="20" height="40" rx="2" fill="none" stroke={solid(tone)} strokeWidth="1.3" />
        {Array.from({ length: units }).map((_, i) => {
          const lit = i >= litFrom;
          return (
            <rect key={i} x="5" y={3.5 + i * 6.1} width="14" height="4.4" rx="1" fill={lit ? tint(tone, 0.55) : "none"} stroke={solid(tone)} strokeWidth="0.8" opacity={lit ? 1 : 0.35} />
          );
        })}
      </svg>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, color: solid(tone), lineHeight: 1 }}>{kw}</div>
        <Cap tone={tone}>per rack</Cap>
      </div>
    </div>
  );
}

// server-row block used for a data-center building
const DCBlock = ({ x, y, w, h, tone, rows = 4 }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx="1.5" fill={tint(tone, 0.12)} stroke={solid(tone)} strokeWidth="1.2" />
    {Array.from({ length: rows }).map((_, i) => (
      <line key={i} x1={x + 3} y1={y + 4 + i * ((h - 6) / (rows - 1 || 1))} x2={x + w - 3} y2={y + 4 + i * ((h - 6) / (rows - 1 || 1))} stroke={solid(tone)} strokeWidth="0.7" opacity="0.8" />
    ))}
  </g>
);

function Footprint({ variant, tone, cap }) {
  return (
    <div>
      {variant === "city" && (
        <svg width="128" height="46" viewBox="0 0 128 46">
          <g stroke={solid(T.muted)} strokeWidth="1" fill="none" opacity="0.3">
            <rect x="6" y="24" width="12" height="17" />
            <rect x="98" y="16" width="12" height="25" />
            <rect x="114" y="27" width="9" height="14" />
          </g>
          <DCBlock x={48} y={20} w={26} h={21} tone={tone} rows={3} />
          <line x1="0" y1="41.5" x2="128" y2="41.5" stroke={tint(T.line, 0.7)} strokeWidth="1" />
        </svg>
      )}
      {variant === "campus" && (
        <svg width="128" height="46" viewBox="0 0 128 46">
          <DCBlock x={34} y={9} w={60} h={32} tone={tone} rows={5} />
          <rect x={40} y={4} width="8" height="6" fill="none" stroke={solid(tone)} strokeWidth="0.9" opacity="0.7" />
          <rect x={54} y={4} width="8" height="6" fill="none" stroke={solid(tone)} strokeWidth="0.9" opacity="0.7" />
          <line x1="0" y1="41.5" x2="128" y2="41.5" stroke={tint(T.line, 0.7)} strokeWidth="1" />
        </svg>
      )}
      {variant === "cluster" && (
        <svg width="168" height="52" viewBox="0 0 168 52">
          {/* orbital / inference in space */}
          <g transform="translate(20 9)" opacity="0.85">
            <rect x="-4" y="-3" width="8" height="6" rx="1" fill={tint(tone, 0.12)} stroke={solid(tone)} strokeWidth="1" />
            <rect x="-13" y="-3" width="7" height="6" fill="none" stroke={solid(tone)} strokeWidth="0.8" />
            <rect x="6" y="-3" width="7" height="6" fill="none" stroke={solid(tone)} strokeWidth="0.8" />
          </g>
          {/* links between campuses + down from space */}
          <g stroke={solid(tone)} strokeWidth="1" strokeDasharray="3 4" fill="none" opacity="0.55" className="flow">
            <line x1="20" y1="15" x2="58" y2="30" />
            <line x1="58" y1="34" x2="104" y2="34" />
            <line x1="104" y1="34" x2="140" y2="30" />
            <line x1="140" y1="34" x2="156" y2="42" />
          </g>
          {/* several large campuses */}
          <DCBlock x={44} y={26} w={28} h={18} tone={tone} rows={3} />
          <DCBlock x={90} y={22} w={30} h={22} tone={tone} rows={4} />
          <DCBlock x={128} y={28} w={24} h={16} tone={tone} rows={3} />
          {/* edge node */}
          <g transform="translate(156 40)">
            <rect x="-4" y="-4" width="8" height="8" rx="1.5" fill="none" stroke={solid(tone)} strokeWidth="1" />
          </g>
          <text x="150" y="52" fontFamily="var(--font-mono)" fontSize="6.5" fill={solid(T.muted)}>edge</text>
          <line x1="0" y1="47" x2="168" y2="47" stroke={tint(T.line, 0.7)} strokeWidth="1" />
        </svg>
      )}
      <Cap tone={tone}>{cap}</Cap>
    </div>
  );
}

function DensityRow({ era }) {
  return (
    <RowShell
      era={era}
      label="Rack & Footprint"
      sub="kW / rack · where it lives"
      cells={[
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <RackDensity kw="3 kW" tone={T.e1} level={1} />
          <Footprint variant="city" tone={T.e1} cap="one small site, in the city" />
        </div>,
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <RackDensity kw="150 kW" tone={T.e2} level={2} />
          <Footprint variant="campus" tone={T.e2} cap="one large campus" />
        </div>,
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <RackDensity kw="1 MW" tone={T.e3} level={3} />
          <Footprint variant="cluster" tone={T.e3} cap="many campuses linked · + space & edge" />
        </div>,
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

// 1 ▸ POWER — stacked-area story: where the growth comes from.
// grid grows then stalls · behind-the-meter adds then stalls ·
// nuclear + orbital drive the continued climb.
function PowerRow({ era }) {
  // reveal the chart left-to-right, one era third at a time
  const revealW = era >= 3 ? 1000 : era >= 2 ? 666 : era >= 1 ? 333 : 0;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "190px 1fr", borderTop: `1px solid ${tint(T.line, 0.7)}`, minHeight: 156 }}>
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
      <div style={{ position: "relative", padding: "8px 16px 4px" }}>
        <svg width="100%" height="104" viewBox="0 0 1000 120" preserveAspectRatio="none" style={{ display: "block" }}>
          <defs>
            <clipPath id="pwrReveal">
              <rect x="0" y="0" height="120" width={revealW} style={{ transition: "width 1s ease" }} />
            </clipPath>
          </defs>
          {/* era divider guides */}
          <line x1="333" y1="6" x2="333" y2="112" stroke={tint(T.line, 0.6)} strokeWidth="1" strokeDasharray="3 5" />
          <line x1="666" y1="6" x2="666" y2="112" stroke={tint(T.line, 0.6)} strokeWidth="1" strokeDasharray="3 5" />

          <g clipPath="url(#pwrReveal)">
            {/* grid band — slow, then flat (stalls) in the future */}
            <path
              d="M0,112 L0,102 C160,94 210,90 333,86 C470,80 560,74 666,68 C800,66 900,66 1000,66 L1000,112 Z"
              fill={tint(T.e1, 0.18)}
            />
            {/* behind-the-meter band — adds from Today, then flat (stalls) */}
            <path
              d="M333,86 C470,72 560,60 666,48 C800,46 900,45 1000,44 L1000,66 C900,66 800,66 666,68 C560,74 470,80 333,86 Z"
              fill={tint(T.e2, 0.22)}
            />
            {/* nuclear + orbital band — appears in the Future, drives the climb */}
            <path d="M666,48 C800,32 900,18 1000,7 L1000,44 C900,45 800,46 666,48 Z" fill={tint(T.e3, 0.26)} />

            {/* top edges */}
            <path
              d="M0,102 C160,94 210,90 333,86 C470,80 560,74 666,68 C800,66 900,66 1000,66"
              fill="none"
              stroke={solid(T.e1)}
              strokeWidth="1.5"
              opacity="0.75"
            />
            <path d="M333,86 C470,72 560,60 666,48 C800,46 900,45 1000,44" fill="none" stroke={solid(T.e2)} strokeWidth="1.5" opacity="0.85" />
            <path d="M666,48 C800,32 900,18 1000,7" fill="none" stroke={solid(T.e3)} strokeWidth="2.75" />
          </g>
        </svg>

        {/* source icons + narrative per era */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", marginTop: 4 }}>
          <Reveal on={era >= 1} delay={200}>
            <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
              <IconSvg d={P.tower} tone={T.e1} size={16} />
              <Cap tone={T.e1}>grid · slow growth</Cap>
            </div>
          </Reveal>
          <Reveal on={era >= 2} delay={280}>
            <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
              <IconSvg d={P.tower} tone={T.e1} size={15} />
              <IconSvg d={P.factory} tone={T.e2} size={15} />
              <Cap tone={T.e2}>faster grid + behind-the-meter</Cap>
            </div>
          </Reveal>
          <Reveal on={era >= 3} delay={360}>
            <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
              {/* prior sources stall — dimmed */}
              <span style={{ display: "flex", gap: 4, opacity: 0.35 }}>
                <IconSvg d={P.tower} tone={T.e1} size={14} />
                <IconSvg d={P.factory} tone={T.e2} size={14} />
              </span>
              <span style={{ color: solid(T.muted), fontFamily: "var(--font-mono)", fontSize: 12 }}>→</span>
              <IconSvg d={P.atom} tone={T.e3} size={16} />
              <IconSvg d={P.sat} tone={T.e3} size={16} />
              <Cap tone={T.e3}>grid & BTM stall — nuclear + orbital drive growth</Cap>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 46,
            lineHeight: 1.02,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}
        >
          Future of the Data Center
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
    </div>
  );
}

// Number of intra-slide advances (fragments) the deck should step through.
StackRebuildSlide.steps = 3;
StackRebuildSlide.title = "Future of the Data Center";
