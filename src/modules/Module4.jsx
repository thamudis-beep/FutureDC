import React, { useState, useMemo } from 'react';

// ── Data ──────────────────────────────────────────────────────────────────────
const GROUPS = [
  { id: 'Hyperscaler', label: 'Hyperscalers', accent: '#3b82f6' },
  { id: 'GPU Cloud',   label: 'GPU Cloud',    accent: '#a855f7' },
  { id: 'Colocation',  label: 'Colocation',   accent: '#10b981' },
];

const COMPANIES = [
  // Hyperscalers
  { name: 'Google',     ticker: 'GOOGL', group: 'Hyperscaler', mktCapB: 4073, evB: 4007.6, mw26: 11756, mw30: 35221 },
  { name: 'Microsoft',  ticker: 'MSFT',  group: 'Hyperscaler', mktCapB: 2777, evB: 2794.6, mw26: 17902, mw30: 38942 },
  { name: 'Amazon',     ticker: 'AMZN',  group: 'Hyperscaler', mktCapB: 2703, evB: 2749.9, mw26: 22306, mw30: 49052 },
  { name: 'Meta',       ticker: 'META',  group: 'Hyperscaler', mktCapB: 1914, evB: 1917.5, mw26: 9091,  mw30: 22647 },

  // GPU Cloud
  { name: 'Oracle',     ticker: 'ORCL',  group: 'GPU Cloud', mktCapB: 426,  evB: 522.1,  mw26: 3189, mw30: 12374 },
  { name: 'CoreWeave',  ticker: 'CRWV',  group: 'GPU Cloud', mktCapB: 44,   evB: 58.7,   mw26: 1727, mw30: 8105 },
  { name: 'Nebius',     ticker: 'NBIS',  group: 'GPU Cloud', mktCapB: 31,   evB: 14.2,   mw26: 828,  mw30: 5453 },
  { name: 'Crusoe',     ticker: null,    group: 'GPU Cloud', mktCapB: 13,   evB: 13.1,   mw26: 824,  mw30: 4154 },
  { name: 'Stargate',   ticker: null,    group: 'GPU Cloud', mktCapB: 15,   evB: 15.0,   mw26: 0,    mw30: 3294 },
  { name: 'FluidStack', ticker: null,    group: 'GPU Cloud', mktCapB: 15,   evB: 20.3,   mw26: 204,  mw30: 1515 },
  { name: 'IREN',       ticker: 'IREN',  group: 'GPU Cloud', mktCapB: 14,   evB: 13.4,   mw26: 302,  mw30: 2108 },
  { name: 'Lambda',     ticker: null,    group: 'GPU Cloud', mktCapB: 13,   evB: 12.3,   mw26: 253,  mw30: 1503 },
  { name: 'NScale',     ticker: null,    group: 'GPU Cloud', mktCapB: 11,   evB: 11.0,   mw26: 330,  mw30: 1574 },

  // Colocation
  { name: 'Applied Digital', ticker: 'APLD', group: 'Colocation', mktCapB: 8, evB: 8.7,  mw26: 359, mw30: 2059 },
  { name: 'Galaxy Digital',  ticker: 'GLXY', group: 'Colocation', mktCapB: 8, evB: 8.9,  mw26: 133, mw30: 1593 },
  { name: 'TeraWulf',        ticker: 'WULF', group: 'Colocation', mktCapB: 7, evB: 8.4,  mw26: 212, mw30: 2095 },
  { name: 'Cipher Mining',   ticker: 'CIFR', group: 'Colocation', mktCapB: 6, evB: 8.2,  mw26: 402, mw30: 2030 },
  { name: 'Hut 8',           ticker: 'HUT',  group: 'Colocation', mktCapB: 6, evB: 6.4,  mw26: 0,   mw30: 1081 },
  { name: 'Core Scientific', ticker: 'CORZ', group: 'Colocation', mktCapB: 5, evB: 5.9,  mw26: 659, mw30: 2426 },
  { name: 'Riot Platforms',  ticker: 'RIOT', group: 'Colocation', mktCapB: 5, evB: 5.7,  mw26: 0,   mw30: 1096 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtCap(b) {
  if (b == null) return '\u2014';
  if (b >= 1000) return `$${(b / 1000).toFixed(1)}T`;
  return `$${b}B`;
}

// All power in GW — MW values stored internally, divide by 1000
function fmtGW(mw) {
  if (mw == null || mw === 0) return '\u2014';
  return (mw / 1000).toFixed(1);
}

function fmtX(v) {
  if (v == null || !isFinite(v)) return '\u2014';
  return `${v.toFixed(1)}x`;
}

function evPerGW(c) {
  if (!c.evB || !c.mw30) return null;
  return c.evB / (c.mw30 / 1000); // $B per GW
}

function label(c) {
  return c.ticker || c.name;
}

// ── Sort ──────────────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: 'name', label: '',            width: '22%' },
  { key: 'mv',   label: 'Mkt Cap',     width: '16%' },
  { key: 'mw26', label: "'26 GW",      width: '22%' },
  { key: 'mw30', label: "'30 GW",      width: '22%' },
  { key: 'evgw', label: "EV/'30 GW",   width: '18%' },
];

function getSortValue(c, key) {
  switch (key) {
    case 'name': return label(c);
    case 'mv':   return c.mktCapB || 0;
    case 'mw26': return c.mw26 || 0;
    case 'mw30': return c.mw30 || 0;
    case 'evgw': return evPerGW(c) || 0;
    default:     return 0;
  }
}

// ── GroupTable ─────────────────────────────────────────────────────────────────

function GroupTable({ group }) {
  const [sortKey, setSortKey] = useState('mv');
  const [sortAsc, setSortAsc] = useState(false);

  const members = useMemo(() => {
    const list = COMPANIES.filter((c) => c.group === group.id);
    list.sort((a, b) => {
      const va = getSortValue(a, sortKey);
      const vb = getSortValue(b, sortKey);
      if (sortKey === 'name') {
        return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
      }
      return sortAsc ? va - vb : vb - va;
    });
    return list;
  }, [group.id, sortKey, sortAsc]);

  const totalMW26 = members.reduce((s, c) => s + (c.mw26 || 0), 0);
  const totalMW30 = members.reduce((s, c) => s + (c.mw30 || 0), 0);
  const totalEV   = members.reduce((s, c) => s + (c.evB || 0), 0);
  const avgEvGW   = totalMW30 > 0 ? totalEV / (totalMW30 / 1000) : null;
  const maxMW = Math.max(...members.map((c) => Math.max(c.mw26 || 0, c.mw30 || 0)));

  const handleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  return (
    <div className="border border-bg-border rounded-lg overflow-hidden">
      {/* Group header */}
      <div className="px-4 py-3 bg-bg-surface/40 border-b border-bg-border/50">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: group.accent }} />
          <h3 className="text-sm font-semibold text-text">{group.label}</h3>
        </div>
      </div>

      {/* Table */}
      <table className="w-full font-mono" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          {COLUMNS.map((col) => (
            <col key={col.key} style={{ width: col.width }} />
          ))}
        </colgroup>
        <thead>
          <tr className="border-b border-bg-border/50 bg-bg-surface/20">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className="text-xs text-text-ghost font-normal py-2 px-3 cursor-pointer select-none hover:text-text-muted transition-colors text-center"
                onClick={() => handleSort(col.key)}
              >
                {col.label}
                {sortKey === col.key && (
                  <span className="ml-0.5 text-text-muted">{sortAsc ? '\u25b2' : '\u25bc'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map((c, i) => (
            <tr
              key={c.name}
              className={`hover:bg-bg-surface/30 transition-colors ${
                i < members.length - 1 ? 'border-b border-bg-border/20' : ''
              }`}
            >
              <td className="px-3 py-2 text-sm text-text font-medium truncate">
                {label(c)}
              </td>
              <td className="px-3 py-2 text-center text-sm text-text-secondary tabular-nums">
                {fmtCap(c.mktCapB)}
              </td>
              <td className="px-2 py-2">
                <BarCell value={c.mw26} max={maxMW} accent={group.accent} />
              </td>
              <td className="px-2 py-2">
                <BarCell value={c.mw30} max={maxMW} accent={group.accent} />
              </td>
              <td className="px-3 py-2 text-center text-sm text-text-muted tabular-nums">
                {fmtX(evPerGW(c))}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-bg-border/50 bg-bg-surface/20">
            <td className="px-3 py-2 text-sm text-text-muted font-medium">Total</td>
            <td className="px-3 py-2"></td>
            <td className="px-2 py-2">
              <TotalCell value={totalMW26} />
            </td>
            <td className="px-2 py-2">
              <TotalCell value={totalMW30} />
            </td>
            <td className="px-3 py-2 text-center text-sm text-text-muted tabular-nums font-medium">
              {fmtX(avgEvGW)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ── Bar cell ──────────────────────────────────────────────────────────────────

function BarCell({ value, max, accent }) {
  if (!value || !max) {
    return (
      <div className="flex items-center gap-1">
        <div className="flex-1" />
        <span className="text-xs text-text-ghost tabular-nums text-right" style={{ minWidth: '36px' }}>{'\u2014'}</span>
      </div>
    );
  }
  const pct = Math.max((value / max) * 100, 3);
  return (
    <div className="flex items-center gap-1">
      <div className="flex-1 h-3.5 rounded-sm overflow-hidden" style={{ backgroundColor: `${accent}12` }}>
        <div className="h-full rounded-sm" style={{ width: `${pct}%`, backgroundColor: `${accent}80` }} />
      </div>
      <span className="text-xs text-text-muted tabular-nums text-right" style={{ minWidth: '36px' }}>
        {fmtGW(value)}
      </span>
    </div>
  );
}

// Total cell — matches BarCell layout so the number aligns
function TotalCell({ value }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex-1" />
      <span className="text-xs text-text-muted tabular-nums text-right font-medium" style={{ minWidth: '36px' }}>
        {fmtGW(value)}
      </span>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Module4() {
  const [visibleGroups, setVisibleGroups] = useState(() => new Set(GROUPS.map((g) => g.id)));

  const toggleGroup = (id) => {
    setVisibleGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeGroups = GROUPS.filter((g) => visibleGroups.has(g.id));
  const colClass = activeGroups.length === 0 ? 'grid-cols-1'
    : activeGroups.length === 1 ? 'grid-cols-1 max-w-2xl'
    : activeGroups.length === 2 ? 'grid-cols-2'
    : 'grid-cols-3';

  return (
    <div className="px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-2xs uppercase tracking-[0.3em] text-text-ghost mb-2 font-mono">Module 04</p>
        <h2 className="text-2xl font-serif text-text tracking-tight">Market Map</h2>
        <p className="text-sm text-text-muted mt-1.5 max-w-xl">
          AI infrastructure landscape — hyperscalers to colocation
        </p>
      </div>

      {/* Group toggle chips */}
      <div className="flex items-center gap-2 mb-6">
        {GROUPS.map((g) => {
          const active = visibleGroups.has(g.id);
          return (
            <button
              key={g.id}
              onClick={() => toggleGroup(g.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${
                active
                  ? 'text-text border-bg-border-light bg-bg-surface/60'
                  : 'text-text-ghost border-bg-border/50 hover:text-text-muted'
              }`}
            >
              <div
                className="w-2 h-2 rounded-sm"
                style={{ backgroundColor: active ? g.accent : `${g.accent}40` }}
              />
              {g.label}
            </button>
          );
        })}
      </div>

      {/* Map */}
      {activeGroups.length === 0 ? (
        <div className="text-sm text-text-ghost text-center py-16">
          Select a category above
        </div>
      ) : (
        <div
          className={`grid ${colClass} gap-5 items-start`}
          style={{
            backgroundImage: 'radial-gradient(circle, var(--color-bg-border) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          {activeGroups.map((group) => (
            <GroupTable key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
