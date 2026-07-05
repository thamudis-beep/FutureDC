import React from "react";
import { T, solid, tint } from "./primitives";

// ─────────────────────────────────────────────────────────────
// ORBITAL DATA CENTERS (option A) — a scene contrasting a heavy
// terrestrial GW campus with the orbital constellation, + the
// cost-per-GW crossover curve. step 0: Earth · 1: Orbit + curve
// ─────────────────────────────────────────────────────────────

const TERR = T.e1;
const ORB = T.e3;

const STARS = Array.from({ length: 90 }, (_, i) => ({ x: Math.random() * 1440, y: Math.random() * 520, r: Math.random() * 1.2 + 0.3, o: Math.random() * 0.5 + 0.15, d: (i % 11) * 0.28 }));
const MICRO = Array.from({ length: 150 }, (_, i) => ({ x: 500 + Math.random() * 520, y: 110 + Math.random() * 210, r: Math.random() * 0.8 + 0.3, o: Math.random() * 0.35 + 0.1, d: (i % 13) * 0.2 }));
const CN = [[540, 205], [615, 140], [702, 208], [632, 268], [636, 205], [782, 168], [862, 220], [792, 274], [892, 150], [972, 202], [944, 268], [716, 296], [846, 292], [1000, 250]];
const CL = [[0, 4], [1, 4], [2, 4], [3, 4], [4, 5], [5, 6], [6, 7], [5, 8], [8, 9], [9, 10], [6, 10], [3, 11], [7, 12], [10, 13], [6, 12], [9, 13]];

function Scene({ live }) {
  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      {STARS.map((s, i) => (
        <circle key={i} className="pulse" cx={s.x} cy={s.y} r={s.r} fill="#cfe9f2" opacity={s.o} style={{ animationDelay: `${s.d}s`, animationDuration: "3.4s" }} />
      ))}
      <g style={{ opacity: live ? 1 : 0, transition: "opacity 1.2s ease .3s" }}>
        {MICRO.map((m, i) => (
          <circle key={i} className="pulse" cx={m.x} cy={m.y} r={m.r} fill={solid(ORB)} opacity={m.o} style={{ animationDelay: `${m.d}s`, animationDuration: "3.6s" }} />
        ))}
      </g>

      {/* constellation */}
      <g stroke={solid(ORB)} strokeWidth="1" strokeDasharray="4 5" fill="none" style={{ opacity: live ? 0.5 : 0, transition: "opacity 1s ease .5s" }}>
        {CL.map(([a, b], i) => <line key={i} x1={CN[a][0]} y1={CN[a][1]} x2={CN[b][0]} y2={CN[b][1]} />)}
      </g>
      {CN.map(([x, y], i) => (
        <g key={i} style={{ opacity: live ? 1 : 0, transition: `opacity .4s ease ${i * 40}ms` }}>
          <circle cx={x} cy={y} r="9" fill={solid(ORB)} opacity="0.12" />
          <rect x={x - 4} y={y - 3} width="8" height="6" rx="1" fill="rgb(var(--bg))" stroke={solid(ORB)} strokeWidth="1.3" />
          <line x1={x - 9} y1={y} x2={x - 4} y2={y} stroke={solid(ORB)} strokeWidth="1" />
          <line x1={x + 4} y1={y} x2={x + 9} y2={y} stroke={solid(ORB)} strokeWidth="1" />
        </g>
      ))}

      {/* rocket bridging earth -> orbit — subtle looping launch */}
      <g style={{ opacity: live ? 1 : 0, transition: "opacity .8s ease .7s" }}>
        <path d="M430 612 Q520 470 610 300" stroke={solid(ORB)} strokeWidth="1.2" strokeDasharray="2 9" fill="none" opacity="0.45" />
        <g fill="none" stroke={solid(ORB)} strokeWidth="1.6">
          <animateMotion dur="4.8s" repeatCount="indefinite" path="M430 612 Q520 470 610 300" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.82;1" dur="4.8s" repeatCount="indefinite" />
          <path d="M0 0c4-6 4-14 0-21c-4 7-4 15 0 21z" />
          <path d="M-3 -2l-5 6M3 -2l5 6" />
          <path className="pulse" d="M-2 1q2 6 2 0M2 1q-2 6-2 0" strokeWidth="1.3" />
        </g>
      </g>

      {/* Earth surface */}
      <rect x="0" y="622" width="1440" height="278" fill="rgb(var(--bg-surface))" />
      <line x1="0" y1="622" x2="1440" y2="622" stroke={solid(ORB)} strokeWidth="1.5" opacity="0.3" />

      {/* heavy terrestrial GW campus (dense) */}
      <g stroke={solid(TERR)} strokeWidth="2" fill="none">
        {/* power plant + smokestacks */}
        <rect x="56" y="568" width="62" height="54" />
        <rect x="70" y="544" width="11" height="24" /><rect x="92" y="544" width="11" height="24" />
        <g className="pulse" opacity="0.7"><path d="M75 542c-5-6 5-10 0-17M97 542c-5-6 5-10 0-17" strokeWidth="1.3" /></g>
        {/* cooling towers x3 */}
        <path d="M130 622C136 598 136 598 143 578L167 578C174 598 174 598 180 622" /><ellipse cx="155" cy="578" rx="12" ry="3" />
        <path d="M188 622C194 600 194 600 200 582L222 582C229 600 229 600 234 622" /><ellipse cx="211" cy="582" rx="11" ry="2.8" />
        <path d="M242 622C248 602 248 602 254 586L274 586C281 602 281 602 286 622" /><ellipse cx="264" cy="586" rx="10" ry="2.6" />
        <g className="pulse" opacity="0.7"><path d="M149 576c-6-7 6-12 0-20M205 580c-6-7 6-11 0-18M258 584c-5-6 5-10 0-16" strokeWidth="1.3" /></g>
        {/* substation / transformer yard */}
        <rect x="306" y="596" width="18" height="26" /><rect x="328" y="596" width="18" height="26" />
        <path d="M315 596v-9M337 596v-9M308 587h44" strokeWidth="1.1" opacity="0.8" />
        {/* data-center halls x4 */}
        <rect x="370" y="580" width="118" height="42" rx="2" /><path d="M382 594h94M382 608h94" strokeWidth="1" opacity="0.5" />
        <rect x="498" y="584" width="110" height="38" rx="2" /><path d="M510 598h86M510 610h86" strokeWidth="1" opacity="0.5" />
        <rect x="618" y="580" width="118" height="42" rx="2" /><path d="M630 594h94M630 608h94" strokeWidth="1" opacity="0.5" />
        <rect x="746" y="586" width="104" height="36" rx="2" /><path d="M758 600h80" strokeWidth="1" opacity="0.5" />
        {/* transmission pylons + wires */}
        <path d="M900 622L892 574M900 622L908 574M894 590h12M895 604h10M892 574h16" strokeWidth="1.5" />
        <path d="M1004 622L996 568M1004 622L1012 568M998 584h12M999 600h10M996 568h16" strokeWidth="1.5" />
        <g strokeWidth="1" opacity="0.6"><path d="M850 598c24 -6 32 -18 42 -20M908 576c34 0 62 -4 88 -6M850 608c24 0 32 -4 42 -6M908 590c34 2 62 6 88 8" /></g>
      </g>
    </svg>
  );
}

function AttrBlock({ title, tone, items, dim }) {
  return (
    <div style={{ opacity: dim ? 0.25 : 1, transition: "opacity .5s ease" }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 23, letterSpacing: "0.09em", color: solid(tone), marginBottom: 9 }}>{title}</div>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
          <span style={{ color: solid(tone), fontSize: 12, lineHeight: 1 }}>▸</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13.5, color: solid(T.text) }}>{it}</span>
        </div>
      ))}
    </div>
  );
}

function CurveCard({ live }) {
  const earth = "M50,152 C210,142 350,106 500,32";
  const orbit = "M50,44 C220,80 380,120 500,134";
  return (
    <div style={{ position: "absolute", right: 44, top: 322, width: 520, zIndex: 2, background: "rgb(var(--bg) / 0.72)", border: `1px solid ${tint(T.line, 0.9)}`, borderRadius: 12, padding: "16px 20px 14px", backdropFilter: "blur(4px)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.18em", color: solid(T.muted), marginBottom: 8 }}>COST PER GW · OVER TIME</div>
      <svg viewBox="0 0 520 178" width="100%" style={{ display: "block" }}>
        <line x1="46" y1="10" x2="46" y2="150" stroke={tint(T.line, 0.8)} strokeWidth="1" />
        <line x1="46" y1="150" x2="508" y2="150" stroke={tint(T.line, 0.8)} strokeWidth="1" />
        <text x="506" y="168" textAnchor="end" fontFamily="var(--font-mono)" fontSize="10.5" fill={solid(T.muted)}>capacity · time →</text>
        {live && (
          <g>
            <rect x="286" y="10" width="222" height="140" fill={solid(ORB)} opacity="0.05" />
            <line x1="286" y1="10" x2="286" y2="150" stroke={solid(ORB)} strokeDasharray="3 4" strokeWidth="1" opacity="0.5" />
            <circle cx="286" cy="100" r="3.5" fill={solid(ORB)} />
            <text x="292" y="146" fontFamily="var(--font-mono)" fontSize="10.5" fill={solid(ORB)}>orbit cheaper →</text>
          </g>
        )}
        <path d={earth} fill="none" stroke={solid(TERR)} strokeWidth="2.5" />
        <text x="504" y="26" textAnchor="end" fontFamily="var(--font-mono)" fontSize="12" fill={solid(T.muted)}>terrestrial</text>
        <path d={orbit} fill="none" stroke={solid(ORB)} strokeWidth="2.5" pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: live ? 0 : 1, transition: "stroke-dashoffset 1.1s ease .3s" }} />
        <text x="504" y="118" textAnchor="end" fontFamily="var(--font-display)" fontWeight="700" fontSize="14" fill={solid(ORB)} style={{ opacity: live ? 1 : 0, transition: "opacity .5s ease 1s" }}>ORBIT — PAY ONCE ↓</text>
      </svg>
    </div>
  );
}

export default function OrbitalSlide({ step = 0 }) {
  const live = step >= 1;
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: `radial-gradient(1000px 680px at 34% 20%, ${tint(ORB, 0.05)}, transparent 70%)` }}>
      <Scene live={live} />

      <div style={{ position: "absolute", top: 30, left: 44, zIndex: 2, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 42, lineHeight: 1, letterSpacing: "0.02em", textTransform: "uppercase" }}>
        Orbital Data Centers
      </div>

      {/* orbital attributes (upper-left, beside the constellation) */}
      <div style={{ position: "absolute", left: 44, top: 150, zIndex: 2 }}>
        <AttrBlock title="ORBITAL · 1 GW" tone={ORB} dim={!live} items={["few thousand sats · ≈ $11B launch + bus", "solar cells → $0 power", "thin radiator → $0 cooling", "live in hours"]} />
      </div>

      {/* terrestrial attributes (lower-left, over the surface) */}
      <div style={{ position: "absolute", left: 44, top: 672, zIndex: 2 }}>
        <AttrBlock title="TERRESTRIAL · 1 GW" tone={TERR} items={["sprawling campus · $10–15B shell", "grid + fuel · $/yr forever", "chillers + towers + water · $/yr", "≈ 3 years to permit, power & build"]} />
      </div>

      <CurveCard live={live} />

      <div style={{ position: "absolute", bottom: 14, left: 44, right: 44, zIndex: 2, fontFamily: "var(--font-mono)", fontSize: 9.5, lineHeight: 1.5, color: solid(T.muted), opacity: 0.6 }}>
        CapEx ≈ equal (~$41B/GW): compute $30B + structure. Orbit structure: 200 Starship launches (100 t, 5 MW ea) at $200/kg = $4B/GW + ~13,000 buses @ $500K = $6.7B/GW. Illustrative.
      </div>
    </div>
  );
}

OrbitalSlide.steps = 1;
OrbitalSlide.title = "Orbital — scene + curve (option A)";
