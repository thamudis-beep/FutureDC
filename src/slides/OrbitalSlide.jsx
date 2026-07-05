import React from "react";
import { T, solid, tint, Reveal } from "./primitives";

// ─────────────────────────────────────────────────────────────
// ORBITAL DATA CENTERS — cinematic scene + economic knockout.
// Left: a glowing constellation over Earth vs a lone campus.
// Right: cost breakdown + a cost-per-GW crossover chart.
// step 0: Earth · 1: Orbit lights up + orbit cost line · 2: payoff
// ─────────────────────────────────────────────────────────────

const TERR = T.e1;
const ORB = T.e3;

// stable starfield (generated once at import)
const STARS = Array.from({ length: 90 }, (_, i) => ({
  x: Math.random() * 900,
  y: Math.random() * 620,
  r: Math.random() * 1.3 + 0.3,
  o: Math.random() * 0.5 + 0.15,
  d: (i % 12) * 0.25,
}));

// dense micro-swarm implying the real count (a few thousand sats)
const MICRO = Array.from({ length: 230 }, (_, i) => ({
  x: Math.random() * 880,
  y: 30 + Math.random() * 500,
  r: Math.random() * 0.9 + 0.35,
  o: Math.random() * 0.4 + 0.12,
  d: (i % 16) * 0.18,
}));

// constellation nodes + laser mesh (scene coords)
const CN = [
  [210, 330], [285, 258], [360, 330], [285, 402], [285, 330],
  [440, 280], [515, 340], [440, 400], [530, 235], [615, 295],
  [690, 350], [605, 410], [755, 305], [700, 460], [560, 458],
  [400, 214], [495, 172], [650, 212], [775, 408], [415, 476],
];
const CL = [
  [0, 4], [1, 4], [2, 4], [3, 4], [0, 3], [1, 2], [0, 1], [2, 3],
  [4, 5], [5, 6], [6, 7], [5, 8], [8, 9], [9, 10], [10, 11], [6, 11],
  [9, 12], [12, 18], [10, 13], [13, 18], [11, 14], [7, 14], [14, 19],
  [1, 15], [15, 16], [16, 8], [8, 17], [17, 12], [3, 19],
];

function Scene({ live }) {
  return (
    <svg viewBox="0 0 900 900" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      {/* stars */}
      {STARS.map((s, i) => (
        <circle key={i} className="pulse" cx={s.x} cy={s.y} r={s.r} fill="#cfe9f2" opacity={s.o} style={{ animationDelay: `${s.d}s`, animationDuration: "3.2s" }} />
      ))}

      {/* micro-swarm — implying the real count of sats */}
      <g style={{ opacity: live ? 1 : 0, transition: "opacity 1.3s ease .3s" }}>
        {MICRO.map((m, i) => (
          <circle key={i} className="pulse" cx={m.x} cy={m.y} r={m.r} fill={solid(ORB)} opacity={m.o} style={{ animationDelay: `${m.d}s`, animationDuration: "3.6s" }} />
        ))}
      </g>

      {/* Earth horizon */}
      <circle cx="450" cy="1520" r="960" fill="rgb(var(--bg-surface))" />
      <circle cx="450" cy="1520" r="960" fill="none" stroke={solid(ORB)} strokeWidth="2.5" opacity="0.45" />
      <circle cx="450" cy="1520" r="972" fill="none" stroke={solid(ORB)} strokeWidth="16" opacity="0.06" />
      {/* city glow on the horizon */}
      {[210, 250, 300, 340, 360, 400].map((x, i) => (
        <circle key={i} cx={x} cy={565 + Math.sin(x) * 3} r="1.5" fill={solid(T.e2)} opacity="0.6" />
      ))}

      {/* lone terrestrial campus on the surface */}
      <g stroke={solid(TERR)} strokeWidth="2" fill="none" opacity="0.9">
        <rect x="250" y="540" width="70" height="30" rx="2" />
        <path d="M262 548h46M262 556h46M262 564h46" strokeWidth="1" opacity="0.7" />
        <path d="M330 555C333 545 333 545 337 536L349 536C353 545 353 545 356 555" />
        <ellipse cx="343" cy="536" rx="6" ry="1.6" />
        <path className="pulse" d="M340 534c-2-3 2-5 0-8" strokeWidth="1.2" />
        <rect x="228" y="552" width="18" height="18" />
      </g>

      {/* hero constellation */}
      <g className="flow" stroke={solid(ORB)} strokeWidth="1" strokeDasharray="4 5" fill="none" style={{ opacity: live ? 0.5 : 0, transition: "opacity 1s ease 0.5s" }}>
        {CL.map(([a, b], i) => (
          <line key={i} x1={CN[a][0]} y1={CN[a][1]} x2={CN[b][0]} y2={CN[b][1]} />
        ))}
      </g>
      {CN.map(([x, y], i) => (
        <g key={i} style={{ opacity: live ? 1 : 0, transition: `opacity .45s ease ${i * 45}ms` }}>
          <circle cx={x} cy={y} r="10" fill={solid(ORB)} opacity="0.12" />
          <rect x={x - 4.5} y={y - 3.5} width="9" height="7" rx="1" fill="rgb(var(--bg))" stroke={solid(ORB)} strokeWidth="1.3" />
          <line x1={x - 10} y1={y} x2={x - 4.5} y2={y} stroke={solid(ORB)} strokeWidth="1" />
          <line x1={x + 4.5} y1={y} x2={x + 10} y2={y} stroke={solid(ORB)} strokeWidth="1" />
        </g>
      ))}

      {/* launch tracks feeding orbit */}
      <g className="flow" stroke={solid(ORB)} strokeWidth="1.3" strokeDasharray="2 9" fill="none" style={{ opacity: live ? 0.55 : 0, transition: "opacity .8s ease .6s" }}>
        <path d="M330 556 Q420 430 440 280" />
        <path d="M300 560 Q330 400 285 258" />
        <path d="M360 552 Q520 420 615 295" />
      </g>
    </svg>
  );
}

// cost-per-GW over scale/time — the crossover
function CostChart({ live }) {
  const earth = "M40,236 C170,224 290,182 452,74";
  const orbit = "M40,104 C180,140 320,178 452,196";
  return (
    <svg viewBox="0 0 480 300" width="100%" style={{ display: "block" }}>
      {/* axes */}
      <line x1="40" y1="20" x2="40" y2="266" stroke={tint(T.line, 0.8)} strokeWidth="1" />
      <line x1="40" y1="266" x2="464" y2="266" stroke={tint(T.line, 0.8)} strokeWidth="1" />
      <text x="40" y="286" fontFamily="var(--font-mono)" fontSize="11" fill={solid(T.muted)}>capacity deployed · time →</text>
      <text x="30" y="24" textAnchor="end" fontFamily="var(--font-mono)" fontSize="11" fill={solid(T.muted)} transform="rotate(-90 30 24)">$ / GW →</text>

      {/* crossover region (orbit wins) */}
      {live && (
        <g>
          <line x1="250" y1="20" x2="250" y2="266" stroke={solid(ORB)} strokeDasharray="3 4" strokeWidth="1" opacity="0.5" />
          <rect x="250" y="20" width="214" height="246" fill={solid(ORB)} opacity="0.05" />
          <text x="258" y="36" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="0.06em" fill={solid(ORB)}>orbit wins →</text>
        </g>
      )}

      {/* earth line — pay forever, rising */}
      <path d={earth} fill="none" stroke={solid(TERR)} strokeWidth="2.5" pathLength="1" strokeDasharray="1" strokeDashoffset="0" />
      <text x="456" y="66" textAnchor="end" fontFamily="var(--font-display)" fontWeight="700" fontSize="15" fill={solid(T.dead)}>EARTH ↑</text>
      <text x="456" y="82" textAnchor="end" fontFamily="var(--font-mono)" fontSize="10.5" fill={solid(T.muted)}>harder every GW · pay forever</text>

      {/* orbit line — pay once, falling */}
      <path d={orbit} fill="none" stroke={solid(ORB)} strokeWidth="2.5" pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: live ? 0 : 1, transition: "stroke-dashoffset 1.2s ease 0.3s" }} />
      <text x="456" y="214" textAnchor="end" fontFamily="var(--font-display)" fontWeight="700" fontSize="15" fill={solid(ORB)} style={{ opacity: live ? 1 : 0, transition: "opacity .5s ease 1.1s" }}>ORBIT ↓</text>
      <text x="456" y="230" textAnchor="end" fontFamily="var(--font-mono)" fontSize="10.5" fill={solid(T.muted)} style={{ opacity: live ? 1 : 0, transition: "opacity .5s ease 1.1s" }}>$/kg falls · pay once</text>
    </svg>
  );
}

function BreakdownRow({ label, terr, orbit, live }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "92px 1fr 1fr", alignItems: "center", padding: "7px 0", borderTop: `1px solid ${tint(T.line, 0.5)}` }}>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, letterSpacing: "0.05em", textTransform: "uppercase", color: solid(T.text) }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: solid(TERR) }}>{terr}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: solid(ORB), opacity: live ? 1 : 0.25, transition: "opacity .5s ease" }}>{orbit}</span>
    </div>
  );
}

export default function OrbitalSlide({ step = 0 }) {
  const live = step >= 1;
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: `radial-gradient(1000px 700px at 30% 20%, ${tint(ORB, 0.05)}, transparent 70%)` }}>
      <Scene live={live} />

      {/* title */}
      <div style={{ position: "absolute", top: 30, left: 44, zIndex: 2 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 44, lineHeight: 1, letterSpacing: "0.02em", textTransform: "uppercase" }}>
          Orbital Data Centers
        </div>
      </div>

      {/* small campus label */}
      <div style={{ position: "absolute", left: 250, top: 500, zIndex: 2, fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.06em", color: solid(T.muted) }}>
        one GW campus ↓
      </div>

      {/* hero stat — scale */}
      <div style={{ position: "absolute", left: 44, top: 612, zIndex: 2, maxWidth: 720 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.2em", color: solid(T.muted) }}>THE SCALE</div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 36, lineHeight: 1.04, letterSpacing: "0.01em", textTransform: "uppercase" }}>
          1 GW = <span style={{ color: solid(ORB) }}>200 launches</span>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: solid(T.muted), marginTop: 3 }}>5 MW each → a few thousand sats, meshed by lasers</div>
      </div>

      {/* hero stat — speed */}
      <div style={{ position: "absolute", left: 44, top: 726, zIndex: 2, maxWidth: 720 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.2em", color: solid(T.muted) }}>THE SPEED</div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 36, lineHeight: 1.04, letterSpacing: "0.01em", textTransform: "uppercase" }}>
          <span style={{ color: solid(ORB) }}>live in hours</span> — not 3 years
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: solid(T.muted), marginTop: 3 }}>Earth: permits · power · construction ≈ 3 years</div>
      </div>

      {/* economics card */}
      <div
        style={{
          position: "absolute",
          top: 132,
          right: 40,
          width: 512,
          zIndex: 2,
          background: "rgb(var(--bg) / 0.72)",
          border: `1px solid ${tint(T.line, 0.8)}`,
          borderRadius: 12,
          padding: "18px 22px 20px",
          backdropFilter: "blur(4px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.18em", color: solid(T.muted) }}>THE ECONOMICS · PER GW</span>
          <span style={{ display: "flex", gap: 18, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em" }}>
            <span style={{ color: solid(TERR) }}>TERRESTRIAL</span>
            <span style={{ color: solid(ORB) }}>ORBITAL</span>
          </span>
        </div>
        <BreakdownRow label="Compute" terr="$30B" orbit="$30B" live={live} />
        <BreakdownRow label="Structure" terr="$10–15B" orbit="≈ $11B" live={live} />
        <BreakdownRow label="Power" terr="$/yr" orbit="$0" live={live} />
        <BreakdownRow label="Cooling" terr="$/yr" orbit="$0" live={live} />

        <div style={{ marginTop: 12, marginBottom: 2, fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.14em", color: solid(T.muted) }}>
          COST PER GW, OVER TIME
        </div>
        <CostChart live={live} />
      </div>

      {/* footnote */}
      <div style={{ position: "absolute", bottom: 14, left: 44, right: 44, zIndex: 2, fontFamily: "var(--font-mono)", fontSize: 9.5, lineHeight: 1.5, color: solid(T.muted), opacity: 0.65 }}>
        CapEx ≈ equal (~$41B/GW). Orbit structure: Starship 100 t &amp; 5 MW/launch at $200/kg = $4B/GW launch + ~13,000 buses (1.5 t, ~75 kW) @ $500K = $6.7B/GW. Illustrative.
      </div>
    </div>
  );
}

OrbitalSlide.steps = 1;
OrbitalSlide.title = "Orbital — scene (option A)";
