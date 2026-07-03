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

// 4 ▸ SILICON — chips colored by TYPE so C / G / M read at a glance
const CPU = T.e1; // steel
const GPU = T.e2; // amber
const MEM = T.e3; // cyan
const SZ = 19;

function SiliconRow({ era }) {
  const chips = (n, letter, tone, dim) => Array.from({ length: n }, (_, i) => <Chip key={letter + i} letter={letter} tone={tone} dim={dim} size={SZ} />);
  return (
    <RowShell
      era={era}
      label="Silicon"
      cells={[
        <div>
          <IconRow>{chips(4, "C", CPU)}</IconRow>
          <Cap tone={CPU}>CPU-centric</Cap>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            {[["C", "CPU", CPU], ["G", "GPU", GPU], ["M", "memory", MEM]].map(([l, name, tone]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Chip letter={l} tone={tone} size={13} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, color: solid(T.muted) }}>{name}</span>
              </div>
            ))}
          </div>
        </div>,
        <div>
          <IconRow>
            {chips(4, "C", CPU)}
            {chips(8, "G", GPU)}
            {chips(3, "M", MEM)}
          </IconRow>
          <Cap tone={GPU}>GPU-centric · HBM memory wall</Cap>
        </div>,
        <div>
          <IconRow>
            {chips(5, "C", CPU)}
            {chips(8, "G", GPU)}
            {chips(11, "M", MEM)}
          </IconRow>
          <Cap tone={MEM}>memory-defined architectures</Cap>
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
        <svg width="210" height="66" viewBox="0 0 210 66">
          {/* orbital — inference in space */}
          <g transform="translate(150 10)" opacity="0.95">
            <rect x="-5" y="-3.5" width="10" height="7" rx="1" fill={tint(tone, 0.14)} stroke={solid(tone)} strokeWidth="1.1" />
            <rect x="-15" y="-4" width="8" height="8" fill="none" stroke={solid(tone)} strokeWidth="0.9" />
            <rect x="7" y="-4" width="8" height="8" fill="none" stroke={solid(tone)} strokeWidth="0.9" />
          </g>
          <text x="166" y="13" fontFamily="var(--font-mono)" fontSize="7.5" fill={solid(T.muted)}>orbital</text>
          {/* satellite downlink to the network */}
          <line x1="150" y1="15" x2="150" y2="30" stroke={solid(tone)} strokeWidth="1" strokeDasharray="2 3" opacity="0.6" className="flow" />

          {/* fiber backbone linking the campuses */}
          <path d="M32 30 L84 24 L136 30 L172 44" fill="none" stroke={solid(tone)} strokeWidth="1.2" strokeDasharray="4 4" opacity="0.6" className="flow" />

          {/* three large campuses */}
          <DCBlock x={12} y={30} w={40} h={24} tone={tone} rows={5} />
          <DCBlock x={64} y={22} w={44} h={32} tone={tone} rows={6} />
          <DCBlock x={118} y={30} w={38} h={24} tone={tone} rows={5} />

          {/* edge node */}
          <g transform="translate(178 42)">
            <rect x="-6" y="-6" width="12" height="12" rx="1.5" fill={tint(tone, 0.1)} stroke={solid(tone)} strokeWidth="1.1" />
            <line x1="-3" y1="-2" x2="3" y2="-2" stroke={solid(tone)} strokeWidth="0.7" />
            <line x1="-3" y1="2" x2="3" y2="2" stroke={solid(tone)} strokeWidth="0.7" />
          </g>
          <text x="178" y="64" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7.5" fill={solid(T.muted)}>edge</text>

          <line x1="0" y1="56" x2="210" y2="56" stroke={tint(T.line, 0.7)} strokeWidth="1" />
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
          <Footprint variant="city" tone={T.e1} cap="small sites in metro areas" />
        </div>,
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <RackDensity kw="150 kW" tone={T.e2} level={2} />
          <Footprint variant="campus" tone={T.e2} cap="large GW campuses" />
        </div>,
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <RackDensity kw="1 MW" tone={T.e3} level={3} />
          <Footprint variant="cluster" tone={T.e3} cap="multi-GW campuses linked + space + edge" />
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
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <EqBox label="XFMR" tone={T.e1} />
            <EqBox label="SWGR" tone={T.e1} />
            <EqBox label="UPS" tone={T.e1} />
            <EqBox label="PDU" tone={T.e1} />
            <IconSvg d={P.fan} tone={T.e1} size={17} />
          </div>
          <Cap tone={T.e1}>air-cooled · 480 VAC chain · 4 steps</Cap>
        </div>,
        <div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <EqBox label="XFMR" tone={T.e1} />
            <EqBox label="SWGR" tone={T.e1} />
            <EqBox label="UPS" tone={T.e1} />
            <EqBox label="PDU" tone={T.e1} />
            <IconSvg d={P.drop} tone={T.e2} size={16} />
          </div>
          <Cap tone={T.e2}>same chain + direct-to-chip liquid</Cap>
        </div>,
        <div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <EqBox label="XFMR" tone={T.e1} dead={dead} />
            <EqBox label="SWGR" tone={T.e1} dead={dead} />
            <EqBox label="UPS" tone={T.e1} dead={dead} />
            <EqBox label="PDU" tone={T.e1} dead={dead} />
            <span style={{ color: solid(T.e3), fontFamily: "var(--font-mono)", fontSize: 12 }}>→</span>
            <EqBox label="SST · 800 VDC" tone={T.e3} wide />
          </div>
          <Cap tone={T.e3}>one stage · MV→800 VDC · no electrical room</Cap>
        </div>,
      ]}
    />
  );
}

// power caption with a bold GW/yr figure
function PwrCap({ tone, gw, children }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: solid(tone), letterSpacing: "0.01em", lineHeight: 1 }}>{gw}</div>
      <Cap tone={tone}>{children}</Cap>
    </div>
  );
}

// an icon node pinned onto a growth line
function PwrNode({ on, left, top, d, tone, size = 15, dim, delay = 0 }) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        transform: "translate(-50%, -50%)",
        width: size + 11,
        height: size + 11,
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgb(var(--bg))",
        border: `1px solid ${tint(tone, dim ? 0.3 : 0.55)}`,
        opacity: on ? (dim ? 0.4 : 1) : 0,
        transition: `opacity .55s ease ${delay}ms`,
      }}
    >
      <IconSvg d={d} tone={tone} size={size} />
    </div>
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
      </div>
      <div style={{ position: "relative", padding: "8px 16px 4px" }}>
        <div style={{ position: "relative" }}>
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
              {/* grid band — crawls in Pre-AI, accelerates in Today, plateaus in the Future */}
              <path d="M0,112 L0,106 C150,105 240,103 333,100 C450,93 560,80 666,68 C800,66 900,65 1000,64 L1000,112 Z" fill={tint(T.e1, 0.16)} />
              {/* grid + behind-the-meter — adds in Today, then plateaus (this is the ceiling without new sources) */}
              <path d="M333,100 C450,84 560,64 666,52 C800,50 900,49 1000,48 L1000,64 C900,65 800,66 666,68 C560,80 450,93 333,100 Z" fill={tint(T.e2, 0.2)} />
              {/* nuclear + orbital — Future divergence above the plateau; smooth take-off */}
              <path d="M666,52 C720,48 770,40 820,28 C880,18 945,11 1000,8 L1000,48 C900,49 800,50 666,52 Z" fill={tint(T.e3, 0.26)} />

              {/* top edges */}
              <path d="M0,106 C150,105 240,103 333,100 C450,93 560,80 666,68 C800,66 900,65 1000,64" fill="none" stroke={solid(T.e1)} strokeWidth="1.5" opacity="0.7" />
              <path d="M333,100 C450,84 560,64 666,52 C800,50 900,49 1000,48" fill="none" stroke={solid(T.e2)} strokeWidth="1.5" opacity="0.85" />
              <path d="M666,52 C720,48 770,40 820,28 C880,18 945,11 1000,8" fill="none" stroke={solid(T.e3)} strokeWidth="3" />
            </g>
          </svg>

          {/* icon-nodes sitting on the growth lines */}
          <PwrNode on={era >= 1} left="20%" top={88} d={P.tower} tone={T.e1} delay={250} />
          {/* today: grid accelerates + behind-the-meter (generation + storage) */}
          <PwrNode on={era >= 2} left="52%" top={58} d={P.factory} tone={T.e2} delay={220} />
          <PwrNode on={era >= 2} left="63%" top={49} d={P.battery} tone={T.e2} delay={320} />
          {/* future: prior sources plateau (dim) → nuclear + orbital diverge upward */}
          <PwrNode on={era >= 3} left="87%" top={54} d={P.tower} tone={T.e1} dim delay={200} />
          <PwrNode on={era >= 3} left="78%" top={42} d={P.factory} tone={T.e2} dim delay={200} />
          <PwrNode on={era >= 3} left="82%" top={22} d={P.atom} tone={T.e3} delay={350} />
          <PwrNode on={era >= 3} left="93%" top={9} d={P.sat} tone={T.e3} delay={450} />

          {/* step-change callout, pointing at the divergence */}
          {era >= 3 && (
            <div
              style={{
                position: "absolute",
                left: "70%",
                top: 26,
                transform: "translate(-100%, -50%)",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: solid(T.e3),
                whiteSpace: "nowrap",
                opacity: 0.9,
              }}
            >
              step change ↗
            </div>
          )}
        </div>

        {/* one-line narrative per era, quantified in GW/yr added */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", marginTop: 6 }}>
          <Reveal on={era >= 1} delay={200}>
            <PwrCap tone={T.e1} gw="< 5 GW/yr">grid · slow</PwrCap>
          </Reveal>
          <Reveal on={era >= 2} delay={280}>
            <PwrCap tone={T.e2} gw="> 20 GW/yr">grid accelerates + behind-the-meter</PwrCap>
          </Reveal>
          <Reveal on={era >= 3} delay={360}>
            <PwrCap tone={T.e3} gw="> 100 GW/yr">step change — nuclear + orbital</PwrCap>
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
