import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';

// ── Player database ───────────────────────────────────────────────────────────
// Sources: public filings, press releases, Bloomberg.
// Market data as of March 2026.
const PLAYERS = [
  // ── Hyperscalers ──────────────────────────────────────────────
  {
    id: 'google', name: 'Google', ticker: 'GOOGL', type: 'Hyperscaler',
    color: '#4285f4', clusterTier: 'Silver',
    mktCapB: 4073, cashB: 128.3, debtB: 62.9, evB: 4007.6,
    activeMW: { 2026: 11756, 2027: 18397, 2028: 24893, 2029: 30824, 2030: 35221 },
    contractedMW: null,
    customers: ['Internal (GCP, DeepMind)'],
    contracts: [],
    notes: 'GCP + DeepMind · TPU v5/v6 custom silicon · largest AI research org',

  },
  {
    id: 'meta', name: 'Meta', ticker: 'META', type: 'Hyperscaler',
    color: '#0668E1', clusterTier: 'Not Rated',
    mktCapB: 1914, cashB: 81.6, debtB: 85.1, evB: 1917.5,
    activeMW: { 2026: 9091, 2027: 13342, 2028: 17171, 2029: 21239, 2030: 22647 },
    contractedMW: null,
    customers: ['Internal (FAIR, Instagram)'],
    contracts: [],
    notes: 'Open-source Llama · MTIA custom chips · $60B+ 2026 capex',

  },
  {
    id: 'microsoft', name: 'Microsoft', ticker: 'MSFT', type: 'Hyperscaler',
    color: '#00a4ef', clusterTier: 'Gold',
    mktCapB: 2777, cashB: 94.6, debtB: 112.2, evB: 2794.6,
    activeMW: { 2026: 17902, 2027: 25739, 2028: 31685, 2029: 35646, 2030: 38942 },
    contractedMW: null,
    customers: ['Internal (Azure, OpenAI)'],
    contracts: [],
    notes: 'Azure AI · OpenAI exclusive cloud · Maia 100 custom chip · $80B FY2025 capex',

  },
  {
    id: 'amazon', name: 'Amazon', ticker: 'AMZN', type: 'Hyperscaler',
    color: '#ff9900', clusterTier: 'Silver',
    mktCapB: 2703, cashB: 123.0, debtB: 169.9, evB: 2749.9,
    activeMW: { 2026: 22306, 2027: 31050, 2028: 39073, 2029: 45267, 2030: 49052 },
    contractedMW: null,
    customers: ['Internal (AWS, Anthropic)'],
    contracts: [],
    notes: 'AWS largest cloud · Trainium2 · Anthropic $8B investment',

  },

  // ── Neoclouds ─────────────────────────────────────────────────
  {
    id: 'oracle', name: 'Oracle', ticker: 'ORCL', type: 'GPU Cloud',
    color: '#dc2626', clusterTier: 'Gold',
    mktCapB: 426, cashB: 38.5, debtB: 134.6, evB: 522.1,
    activeMW: { 2026: 3189, 2027: 6931, 2028: 11157, 2029: 12146, 2030: 12374 },
    contractedMW: null,
    customers: ['OpenAI', 'xAI', 'Cohere', 'Meta'],
    contracts: ['OpenAI Stargate $300B+ JV (w/ SoftBank)', 'xAI $10B+ Colossus II', '$553B RPO (record)'],
    notes: 'Stargate JV anchor · OCI fastest-growing cloud · $50B FY2026 capex',

  },
  {
    id: 'coreweave', name: 'CoreWeave', ticker: 'CRWV', type: 'GPU Cloud',
    color: '#6366f1', clusterTier: 'Platinum',
    mktCapB: 44, cashB: 11.6, debtB: 27.3, evB: 58.7,
    activeMW: { 2026: 1727, 2027: 2855, 2028: 4355, 2029: 6105, 2030: 8105 },
    contractedMW: 3100,
    customers: ['Microsoft', 'OpenAI', 'Meta', 'IBM', 'NVIDIA'],
    contracts: ['$8B+ Microsoft (multi-yr)', '$66.8B total backlog', '~$12B OpenAI 5yr'],
    notes: 'IPO Mar 2025 · pure-play GPU cloud · 8 GW target by 2030',

  },
  {
    id: 'nebius', name: 'Nebius', ticker: 'NBIS', type: 'GPU Cloud',
    color: '#0ea5e9', clusterTier: 'Gold',
    mktCapB: 31, cashB: 16.5, debtB: 0, evB: 14.2,
    activeMW: { 2026: 828, 2027: 1828, 2028: 2953, 2029: 4203, 2030: 5453 },
    contractedMW: 2000,
    customers: ['Microsoft', 'Meta'],
    contracts: ['Microsoft $19B 5yr AI infra', 'Meta $3B', 'NVIDIA $2B strategic investment'],
    notes: 'NVIDIA $2B investment Mar 2026 · 5 GW target by 2030',

  },
  {
    id: 'stargate', name: 'Stargate (SB)', ticker: null, type: 'GPU Cloud',
    color: '#a855f7', clusterTier: 'Not Rated',
    mktCapB: 15, cashB: null, debtB: null, evB: 15.0,
    activeMW: { 2026: 0, 2027: 760, 2028: 1774, 2029: 2534, 2030: 3294 },
    contractedMW: null,
    customers: ['OpenAI'],
    contracts: ['$300B+ Stargate JV (SoftBank/Oracle/OpenAI)'],
    notes: 'SoftBank-led JV · Oracle infrastructure · OpenAI anchor tenant',

  },
  {
    id: 'iren', name: 'IREN', ticker: 'IREN', type: 'GPU Cloud',
    color: '#ec4899', clusterTier: 'Underperform',
    mktCapB: 14, cashB: 0.6, debtB: 0.0, evB: 13.4,
    activeMW: { 2026: 302, 2027: 958, 2028: 1628, 2029: 1868, 2030: 2108 },
    contractedMW: 4500,
    customers: ['Microsoft'],
    contracts: ['Microsoft 200MW Childress TX 5yr $9.7B', '$1.94B ARR target'],
    notes: 'Formerly Iris Energy · 4.5 GW portfolio · $3.4B ARR target 2026',

  },
  {
    id: 'crusoe', name: 'Crusoe Energy', ticker: null, type: 'GPU Cloud',
    color: '#10b981', clusterTier: 'Gold',
    mktCapB: 13, cashB: null, debtB: null, evB: 13.1,
    activeMW: { 2026: 824, 2027: 1634, 2028: 2474, 2029: 3314, 2030: 4154 },
    contractedMW: 5000,
    customers: ['Oracle (Stargate)', 'Meta'],
    contracts: ['1.2 GW Abilene TX — Oracle/OpenAI 15yr lease', '$11.6B project financing'],
    notes: 'Energy-first · BTM gas turbines · 2.7 GW Cheyenne WY',

  },
  {
    id: 'lambda', name: 'Lambda Labs', ticker: null, type: 'GPU Cloud',
    color: '#f59e0b', clusterTier: 'Silver',
    mktCapB: 13, cashB: 0.7, debtB: 0.0, evB: 12.3,
    activeMW: { 2026: 253, 2027: 503, 2028: 803, 2029: 1153, 2030: 1503 },
    contractedMW: 382,
    customers: ['Microsoft', 'Amazon', 'US Gov'],
    contracts: ['Multi-billion Microsoft AI infra', '24 MW Kansas City AI Factory'],
    notes: '150K+ cloud users · Series E $1.5B (Nov 2025) · IPO target H2 2026',

  },
  {
    id: 'nscale', name: 'NScale', ticker: null, type: 'GPU Cloud',
    color: '#8b5cf6', clusterTier: 'Not Rated',
    mktCapB: 11, cashB: null, debtB: null, evB: 11.0,
    activeMW: { 2026: 330, 2027: 897, 2028: 1123, 2029: 1349, 2030: 1574 },
    contractedMW: 750,
    customers: ['ByteDance', 'AMD', 'Microsoft'],
    contracts: ['$14B+ Microsoft · ~200K NVIDIA GB300 GPUs'],
    notes: 'Founded 2024 · NVIDIA-backed · Series C $2B (Mar 2026)',

  },
  {
    id: 'fluidstack', name: 'FluidStack', ticker: null, type: 'GPU Cloud',
    color: '#06b6d4', clusterTier: 'Gold',
    mktCapB: 15, cashB: 3.1, debtB: 8.4, evB: 20.3,
    activeMW: { 2026: 204, 2027: 973, 2028: 1154, 2029: 1335, 2030: 1515 },
    contractedMW: 1206,
    customers: ['Anthropic', 'Meta AI Research'],
    contracts: ['Anthropic $50B multi-yr AI infra', '~1.2 GW Google TPU racks'],
    notes: 'GPU/TPU aggregator · Anthropic anchor · Google equity + backstop',

  },

  // ── Colocation ────────────────────────────────────────────────
  {
    id: 'galaxy', name: 'Galaxy Digital', ticker: 'GLXY', type: 'Colocation',
    color: '#64748b', clusterTier: 'Colo Only',
    mktCapB: 8, cashB: 2.0, debtB: 2.9, evB: 8.9,
    activeMW: { 2026: 133, 2027: 393, 2028: 693, 2029: 1093, 2030: 1593 },
    contractedMW: 1076,
    customers: ['CoreWeave'],
    contracts: ['CoreWeave Helios Phase I 133MW 15yr $4.5B', 'Phase II 260MW + Phase III 133MW'],
    notes: 'Helios campus West TX · 3.5 GW at full buildout · ~90% EBITDA margins',

  },
  {
    id: 'apld', name: 'Applied Digital', ticker: 'APLD', type: 'Colocation',
    color: '#3b82f6', clusterTier: 'Colo Only',
    mktCapB: 8, cashB: 0.0, debtB: 0.7, evB: 8.7,
    activeMW: { 2026: 359, 2027: 709, 2028: 1059, 2029: 1509, 2030: 2059 },
    contractedMW: 700,
    customers: ['CoreWeave', 'Hyperscaler (inv. grade)'],
    contracts: ['CoreWeave 400MW Ellendale 15yr $11B', 'Hyperscaler 200MW 15yr $5B'],
    notes: 'HPC data center developer · Ellendale ND · 4 GW pipeline',

  },
  {
    id: 'cifr', name: 'Cipher Mining', ticker: 'CIFR', type: 'Colocation',
    color: '#f97316', clusterTier: 'Colo Only',
    mktCapB: 6, cashB: 0.6, debtB: 2.8, evB: 8.2,
    activeMW: { 2026: 402, 2027: 680, 2028: 1030, 2029: 1480, 2030: 2030 },
    contractedMW: 2500,
    customers: ['FluidStack / Anthropic', 'AWS'],
    contracts: ['FluidStack 300MW 10yr ~$3B', 'AWS 300MW 15yr $5.5B'],
    notes: 'Colorado City TX · AWS + Google backing',

  },
  {
    id: 'riot', name: 'Riot Platforms', ticker: 'RIOT', type: 'Colocation',
    color: '#84cc16', clusterTier: 'Colo Only',
    mktCapB: 5, cashB: 0.2, debtB: 0.9, evB: 5.7,
    activeMW: { 2026: 0, 2027: 196, 2028: 446, 2029: 746, 2030: 1096 },
    contractedMW: 1862,
    customers: ['AMD'],
    contracts: ['AMD 25MW \u2192 200MW 10yr $311M\u2013$1B', '1.7 GW secured TX power'],
    notes: '1.7 GW Texas capacity · 18,005 BTC treasury',

  },
  {
    id: 'hut', name: 'Hut 8', ticker: 'HUT', type: 'Colocation',
    color: '#a78bfa', clusterTier: 'Colo Only',
    mktCapB: 6, cashB: 0.0, debtB: 0.4, evB: 6.4,
    activeMW: { 2026: 0, 2027: 181, 2028: 381, 2029: 681, 2030: 1081 },
    contractedMW: 1700,
    customers: ['FluidStack / Anthropic'],
    contracts: ['River Bend LA 245MW 15yr $7.0B NNN', 'Google $3.2B backstop'],
    notes: '1,020 MW platform · 8.5 GW total pipeline · Google backstop',

  },
  {
    id: 'terawulf', name: 'TeraWulf', ticker: 'WULF', type: 'Colocation',
    color: '#14b8a6', clusterTier: 'Colo Only',
    mktCapB: 7, cashB: 3.3, debtB: 4.7, evB: 8.4,
    activeMW: { 2026: 212, 2027: 745, 2028: 1095, 2029: 1545, 2030: 2095 },
    contractedMW: 2272,
    customers: ['FluidStack'],
    contracts: ['FluidStack 360MW Lake Mariner 10yr $3.7B', '168MW Abernathy TX JV $9.5B 25yr', 'Google $3.2B backstop'],
    notes: 'Lake Mariner NY (hydro) · 95% zero-carbon',

  },
  {
    id: 'corz', name: 'Core Scientific', ticker: 'CORZ', type: 'Colocation',
    color: '#ef4444', clusterTier: 'Colo Only',
    mktCapB: 5, cashB: 0.3, debtB: 1.2, evB: 5.9,
    activeMW: { 2026: 659, 2027: 1076, 2028: 1426, 2029: 1876, 2030: 2426 },
    contractedMW: 1395,
    customers: ['CoreWeave'],
    contracts: ['CoreWeave 590MW 12yr $10.2B', 'Denton TX 260MW+ expansion'],
    notes: '1.2 GW contracted · 1.5 GW dev pipeline',

  },
];

const YEARS = [2026, 2027, 2028, 2029, 2030];
const TYPE_ORDER = ['Hyperscaler', 'GPU Cloud', 'Colocation'];
const TYPE_ACCENT = { 'Hyperscaler': '#3b82f6', 'GPU Cloud': '#a855f7', 'Colocation': '#10b981' };

// ── Helpers ───────────────────────────────────────────────────────────────────

// All power in GW (stored as MW internally)
function fmtGW(mw) {
  if (mw == null || mw === 0) return '\u2014';
  return (mw / 1000).toFixed(1);
}

function fmtGWLabel(mw) {
  if (mw == null || mw === 0) return '\u2014';
  return `${(mw / 1000).toFixed(1)} GW`;
}

function fmtB(v) {
  if (v == null) return '\u2014';
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}T`;
  if (v >= 100) return `$${v.toFixed(0)}B`;
  if (v >= 1) return `$${v.toFixed(1)}B`;
  return `$${(v * 1000).toFixed(0)}M`;
}

function fmtX(v) {
  if (v == null || !isFinite(v)) return '\u2014';
  return `${v.toFixed(1)}x`;
}


// Inline bar for GW cells in the table
function MiniBar({ value, max, color }) {
  if (!value || !max) return <span className="text-text-muted font-mono tabular-nums">{'\u2014'}</span>;
  const pct = Math.max((value / max) * 100, 2);
  return (
    <div className="flex items-center gap-1">
      <div className="flex-1 h-2.5 rounded-sm overflow-hidden" style={{ backgroundColor: `${color}15` }}>
        <div className="h-full rounded-sm" style={{ width: `${pct}%`, backgroundColor: `${color}70` }} />
      </div>
      <span className="text-text-secondary font-mono tabular-nums text-right" style={{ minWidth: '28px' }}>
        {fmtGW(value)}
      </span>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-bg-border rounded-lg p-3 text-xs font-mono shadow-lg bg-bg-surface">
      <p className="text-text-muted mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
          <span className="text-text-ghost">{p.name}:</span>
          <span className="text-text font-semibold">{fmtGWLabel(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Module5() {
  const [visibleTypes, setVisibleTypes] = useState(() => new Set(TYPE_ORDER));
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [selectedIds, setSelectedIds] = useState(() => new Set(PLAYERS.map(p => p.id)));

  const toggleType = (type) => setVisibleTypes(prev => {
    const next = new Set(prev);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    return next;
  });
  const toggleExpand = (id) => setExpandedIds(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const togglePlayer = (id) => setSelectedIds(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const selectAll  = () => setSelectedIds(new Set(PLAYERS.map(p => p.id)));
  const selectNone = () => setSelectedIds(new Set());

  const filtered = useMemo(() => PLAYERS
    .filter(p => {
      if (!selectedIds.has(p.id)) return false;
      if (!visibleTypes.has(p.type)) return false;
      return true;
    }),
  [visibleTypes, selectedIds]);

  const grouped = useMemo(() => {
    const g = {};
    TYPE_ORDER.forEach(t => { g[t] = []; });
    filtered.forEach(p => { if (g[p.type]) g[p.type].push(p); });
    // Sort within each group by 2030 MW descending
    TYPE_ORDER.forEach(t => { g[t].sort((a, b) => (b.activeMW[2030] || 0) - (a.activeMW[2030] || 0)); });
    return g;
  }, [filtered]);

  // KPIs
  const totalActive2026 = filtered.reduce((s, p) => s + (p.activeMW[2026] || 0), 0);
  const totalActive2030 = filtered.reduce((s, p) => s + (p.activeMW[2030] || 0), 0);
  const totalContracted = filtered.reduce((s, p) => s + (p.contractedMW || 0), 0);
  const totalEV         = filtered.reduce((s, p) => s + (p.evB || 0), 0);

  // Chart data
  const chartData = YEARS.map(yr => {
    const obj = { year: String(yr) };
    filtered.forEach(p => { obj[p.name] = p.activeMW[yr] || 0; });
    return obj;
  });

  const sortedForChips = useMemo(() => [...PLAYERS].sort((a, b) => (b.evB || 0) - (a.evB || 0)), []);

  // Global max for bar scaling across all years
  const globalMaxMW = useMemo(() => {
    let mx = 0;
    filtered.forEach(p => { YEARS.forEach(yr => { mx = Math.max(mx, p.activeMW[yr] || 0); }); });
    return mx;
  }, [filtered]);

  const COL_COUNT = 13;

  return (
    <div className="px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="text-2xs uppercase tracking-[0.3em] text-text-ghost mb-2 font-mono">Module 05</p>
        <h2 className="text-2xl font-serif text-text tracking-tight">Player Tracker</h2>
        <p className="text-sm text-text-muted mt-1.5 max-w-xl">
          AI infrastructure operator landscape — power trajectory, financials, contracts
        </p>
        <p className="text-2xs text-text-ghost mt-1 font-mono">
          Mar 2026 · Bloomberg · ClusterMax 2.0
        </p>
      </div>

      {/* KPI bar */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Active Power 2026',
            value: fmtGWLabel(totalActive2026),
            sub: `${filtered.length} of ${PLAYERS.length} operators`,
          },
          {
            label: 'Active Power 2030',
            value: fmtGWLabel(totalActive2030),
            sub: totalActive2026 > 0 ? `${((totalActive2030 / totalActive2026 - 1) * 100).toFixed(0)}% growth` : '\u2014',
          },
          {
            label: 'Contracted Power',
            value: fmtGWLabel(totalContracted),
            sub: totalActive2026 > 0 ? `${(totalContracted / totalActive2026).toFixed(1)}\u00d7 active \'26` : '\u2014',
          },
          {
            label: 'Combined EV',
            value: fmtB(totalEV),
            sub: `${filtered.length} operators selected`,
          },
        ].map((c, i) => (
          <div key={i} className="border border-bg-border rounded-lg p-4 bg-bg-surface/30">
            <p className="text-2xs uppercase tracking-[0.1em] text-text-ghost mb-1">{c.label}</p>
            <p className="text-xl font-semibold font-mono text-text tabular-nums">{c.value}</p>
            <p className="text-2xs text-text-ghost mt-0.5 font-mono">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Category toggles */}
      <div className="flex items-center gap-2 mb-6">
        {TYPE_ORDER.map(t => {
          const active = visibleTypes.has(t);
          return (
            <button key={t} onClick={() => toggleType(t)}
              className={`text-2xs px-2.5 py-1 rounded font-medium transition-colors border ${
                active
                  ? 'text-text bg-bg-surface border-bg-border-light'
                  : 'text-text-ghost border-bg-border/50 hover:text-text-muted'
              }`}>
              {t}
            </button>
          );
        })}
      </div>

      {/* Player selector */}
      <div className="flex items-center gap-1.5 mb-6 flex-wrap">
        <span className="text-2xs text-text-ghost mr-1">Operators:</span>
        <button onClick={selectAll}
          className={`text-2xs px-2 py-1 rounded font-medium transition-colors ${
            selectedIds.size === PLAYERS.length
              ? 'text-text bg-bg-surface border border-bg-border-light'
              : 'text-text-ghost hover:text-text-muted'
          }`}>
          All
        </button>
        <button onClick={selectNone}
          className={`text-2xs px-2 py-1 rounded font-medium transition-colors ${
            selectedIds.size === 0
              ? 'text-text bg-bg-surface border border-bg-border-light'
              : 'text-text-ghost hover:text-text-muted'
          }`}>
          None
        </button>
        <div className="w-px h-4 bg-bg-border mx-1" />
        {sortedForChips.map(p => (
          <button key={p.id} onClick={() => togglePlayer(p.id)}
            className={`text-2xs px-2 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
              selectedIds.has(p.id)
                ? 'text-text-secondary bg-bg-surface border border-bg-border'
                : 'text-text-ghost/30 line-through'
            }`}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{
                backgroundColor: selectedIds.has(p.id) ? p.color : 'transparent',
                border: selectedIds.has(p.id) ? 'none' : '1px solid rgba(255,255,255,0.15)',
              }} />
            {p.name}
          </button>
        ))}
      </div>

      {/* Comparison table */}
      <div className="border border-bg-border rounded-lg overflow-hidden mb-8">
        <div>
          <table className="w-full text-xs border-collapse" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '14%' }} />{/* Operator */}
              <col style={{ width: '5%' }} />{/* CM */}
              <col style={{ width: '6%' }} />{/* MktCap */}
              <col style={{ width: '5%' }} />{/* Cash */}
              <col style={{ width: '5%' }} />{/* Debt */}
              <col style={{ width: '6%' }} />{/* EV */}
              <col style={{ width: '7%' }} />{/* '26 */}
              <col style={{ width: '7%' }} />{/* '27 */}
              <col style={{ width: '7%' }} />{/* '28 */}
              <col style={{ width: '7%' }} />{/* '29 */}
              <col style={{ width: '7%' }} />{/* '30 */}
              <col style={{ width: '6%' }} />{/* Contracted */}
              <col style={{ width: '8%' }} />{/* EV/'30GW */}
            </colgroup>
            <thead>
              <tr className="border-b border-bg-border bg-bg-surface">
                <th className="text-left py-2 px-2 text-text-ghost font-medium">Operator</th>
                <th className="text-center py-2 px-1 text-text-ghost font-medium whitespace-nowrap">CM</th>
                <th className="text-right py-2 px-1 text-text-ghost font-medium font-mono whitespace-nowrap">MktCap</th>
                <th className="text-right py-2 px-1 text-text-ghost font-medium font-mono">Cash</th>
                <th className="text-right py-2 px-1 text-text-ghost font-medium font-mono">Debt</th>
                <th className="text-right py-2 px-1 text-text-ghost font-medium font-mono">EV</th>
                {YEARS.map(y => (
                  <th key={y} className="text-center py-2 px-1 text-text-ghost font-medium font-mono whitespace-nowrap">
                    '{String(y).slice(2)} GW
                  </th>
                ))}
                <th className="text-right py-2 px-1 text-text-ghost font-medium font-mono whitespace-nowrap">Cntrd</th>
                <th className="text-right py-2 px-1 text-text-ghost font-medium font-mono whitespace-nowrap">EV/'30GW</th>
              </tr>
            </thead>
            <tbody>
              {TYPE_ORDER.map(type => {
                const players = grouped[type];
                if (!players.length) return null;
                const groupActive2030 = players.reduce((s, p) => s + (p.activeMW[2030] || 0), 0);
                const groupContracted = players.reduce((s, p) => s + (p.contractedMW || 0), 0);
                const groupEV         = players.reduce((s, p) => s + (p.evB || 0), 0);
                const groupMktCap     = players.reduce((s, p) => s + (p.mktCapB || 0), 0);

                return (
                  <React.Fragment key={type}>
                    {/* Section header */}
                    <tr className="border-b border-bg-border/60 bg-bg-hover/40">
                      <td colSpan={COL_COUNT} className="py-2 px-3">
                        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{type}</span>
                        <span className="text-2xs text-text-ghost ml-2 font-mono">{players.length} operators</span>
                      </td>
                    </tr>

                    {/* Player rows */}
                    {players.map(player => {
                      const expanded = expandedIds.has(player.id);
                      const evPer30 = player.evB && player.activeMW[2030]
                        ? (player.evB * 1000) / player.activeMW[2030]
                        : null;
                      return (
                        <React.Fragment key={player.id}>
                          <tr
                            onClick={() => toggleExpand(player.id)}
                            className="border-b border-bg-border/30 hover:bg-bg-surface/20 transition-colors cursor-pointer"
                          >
                            {/* Name */}
                            <td className="py-2.5 px-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-2xs text-text-ghost w-3 shrink-0 select-none">{expanded ? '\u25be' : '\u25b8'}</span>
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: player.color }} />
                                <span className="font-semibold text-text">{player.name}</span>
                                {player.ticker && <span className="text-2xs font-mono text-text-ghost">{player.ticker}</span>}
                              </div>
                            </td>

                            {/* ClusterMax */}
                            <td className="py-2.5 px-1 text-center">
                              <span className="text-2xs font-mono text-text-muted whitespace-nowrap">
                                {player.clusterTier}
                              </span>
                            </td>

                            {/* Financials */}
                            <td className="py-2.5 px-1 text-right font-mono text-text-secondary">{fmtB(player.mktCapB)}</td>
                            <td className="py-2.5 px-1 text-right font-mono text-text-muted">{fmtB(player.cashB)}</td>
                            <td className="py-2.5 px-1 text-right font-mono text-text-muted">{fmtB(player.debtB)}</td>
                            <td className="py-2.5 px-1 text-right font-mono text-text-secondary font-semibold">{fmtB(player.evB)}</td>

                            {/* Active GW — mini bars */}
                            {YEARS.map(yr => (
                              <td key={yr} className="py-1.5 px-1">
                                <MiniBar value={player.activeMW[yr]} max={globalMaxMW} color={TYPE_ACCENT[player.type]} />
                              </td>
                            ))}

                            {/* Contracted */}
                            <td className="py-2.5 px-1 text-right font-mono text-text-muted tabular-nums">
                              {fmtGW(player.contractedMW)}
                            </td>

                            {/* EV/2030 */}
                            <td className="py-2.5 px-1 text-right font-mono text-text-muted">
                              {fmtX(evPer30)}
                            </td>
                          </tr>

                          {/* Expanded detail */}
                          {expanded && (
                            <tr className="border-b border-bg-border/30 bg-bg-surface/10">
                              <td colSpan={COL_COUNT} className="py-3 px-3">
                                <div className="pl-7 space-y-1.5">
                                  <p className="text-2xs text-text-muted">{player.notes}</p>
                                  {player.contracts.length > 0 && (
                                    <div className="space-y-0.5">
                                      {player.contracts.map((c, i) => (
                                        <p key={i} className="text-2xs font-mono text-text-ghost">&middot; {c}</p>
                                      ))}
                                    </div>
                                  )}
                                  {player.customers.length > 0 && (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-2xs text-text-ghost">Customers:</span>
                                      {player.customers.map(c => (
                                        <span key={c} className="text-2xs px-1.5 py-0.5 rounded bg-bg-surface border border-bg-border text-text-secondary">
                                          {c}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {/* Subtotal row */}
                    <tr className="border-b-2 border-bg-border bg-bg-surface/40">
                      <td className="py-2 px-2">
                        <span className="text-xs font-semibold text-text pl-5">{type}</span>
                      </td>
                      <td />
                      <td className="py-2 px-1 text-right font-mono text-text font-semibold">
                        {groupMktCap > 0 ? fmtB(groupMktCap) : '\u2014'}
                      </td>
                      <td />
                      <td />
                      <td className="py-2 px-1 text-right font-mono text-text font-semibold">{fmtB(groupEV)}</td>
                      {YEARS.map(yr => (
                        <td key={yr} className="py-2 px-1 text-right font-mono text-text font-semibold tabular-nums">
                          {fmtGW(players.reduce((s, p) => s + (p.activeMW[yr] || 0), 0))}
                        </td>
                      ))}
                      <td className="py-2 px-1 text-right font-mono text-text-muted font-semibold tabular-nums">
                        {groupContracted > 0 ? fmtGW(groupContracted) : '\u2014'}
                      </td>
                      <td className="py-2 px-1 text-right font-mono text-text-muted font-semibold">
                        {groupEV > 0 && groupActive2030 > 0 ? fmtX((groupEV * 1000) / groupActive2030) : '\u2014'}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}

              {/* Grand total */}
              {filtered.length > 1 && (
                <tr className="bg-bg-surface/60">
                  <td className="py-3 px-2">
                    <span className="text-sm font-semibold text-text pl-5">Total</span>
                    <span className="text-2xs text-text-ghost ml-2 font-mono">{filtered.length} operators</span>
                  </td>
                  <td />
                  <td className="py-3 px-1 text-right font-mono text-text font-bold">
                    {fmtB(filtered.reduce((s, p) => s + (p.mktCapB || 0), 0)) }
                  </td>
                  <td />
                  <td />
                  <td className="py-3 px-1 text-right font-mono text-text font-bold">{fmtB(totalEV)}</td>
                  {YEARS.map(yr => (
                    <td key={yr} className="py-3 px-1 text-right font-mono text-text font-bold tabular-nums">
                      {fmtGW(filtered.reduce((s, p) => s + (p.activeMW[yr] || 0), 0))}
                    </td>
                  ))}
                  <td className="py-3 px-1 text-right font-mono text-text-muted font-bold tabular-nums">
                    {fmtGW(totalContracted)}
                  </td>
                  <td className="py-3 px-1 text-right font-mono text-text-muted font-bold">
                    {totalEV > 0 && totalActive2030 > 0 ? fmtX((totalEV * 1000) / totalActive2030) : '\u2014'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Power trajectory chart */}
      <div className="border border-bg-border rounded-lg p-6">
        <div className="mb-5">
          <p className="text-2xs uppercase tracking-[0.15em] text-text-muted font-medium">Active Power Trajectory</p>
          <p className="text-2xs text-text-ghost mt-0.5">Deployed power (GW) · 2026\u20132030</p>
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={v => `${(v / 1000).toFixed(0)} GW`}
              tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
            {filtered.map(p => (
              <Bar key={p.id} dataKey={p.name} stackId="a" fill={p.color} fillOpacity={0.85} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6 flex-wrap text-2xs text-text-ghost">
        <span>Types:</span>
        {TYPE_ORDER.map(t => <span key={t}>{t}</span>)}
        <span className="ml-4 font-mono">EV/'30GW = Enterprise Value / 2030 Active GW ($B/GW)</span>
      </div>
    </div>
  );
}
