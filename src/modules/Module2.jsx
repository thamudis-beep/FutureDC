import React, { useState, useMemo, useEffect, useRef } from 'react';
import SliderInput from '../components/SliderInput';
import MetricCard from '../components/MetricCard';
import { calculateIRR, calculateNPV, calculatePayback, formatCurrency, formatPercent, formatYears } from '../utils/calculations';

const fmtB = (v) => {
  if (v === null || v === undefined || isNaN(v)) return '—';
  if (Math.abs(v) < 0.05) return '—';
  if (v < 0) return `(${Math.abs(v).toFixed(1)})`;
  return v.toFixed(1);
};
const fmtPct = (v) => {
  if (!v || isNaN(v)) return '';
  return `${(v * 100).toFixed(0)}%`;
};
const fmtIRR = (v) => {
  if (v === null || v === undefined || isNaN(v) || v < -50) return 'nm';
  return `${v.toFixed(0)}%`;
};

function sensIRR(capex, baseRev, noiM, escalator, debtMix, debtCost, taxRate, duration) {
  if (capex <= 0 || duration <= 0) return null;
  const equity = capex * (1 - debtMix / 100);
  if (equity < 0.01) return null;
  const depr = capex / 25;
  let debt = capex * debtMix / 100;
  const cfs = [];
  for (let y = 1; y <= duration; y++) {
    const rev = baseRev * Math.pow(1 + escalator / 100, y - 1);
    const noi = rev * noiM / 100;
    const op = noi - depr;
    const interest = debt * debtCost / 100;
    const tax = Math.max(0, (op - interest) * taxRate / 100);
    const available = noi - interest - tax;
    const paydown = Math.min(debt, Math.max(0, available));
    debt -= paydown;
    cfs.push(available - paydown);
  }
  return calculateIRR(cfs, equity);
}

export default function Module2({ onUpdate, modulesLinked }) {
  const [shellCapex, setShellCapex] = useState(10);
  const [leaseRev, setLeaseRev] = useState(1.5);
  const [leaseDuration, setLeaseDuration] = useState(15);
  const [rentEsc, setRentEsc] = useState(2.5);
  const [noiMargin, setNoiMargin] = useState(85);
  const [debtMix, setDebtMix] = useState(80);
  const [debtCost, setDebtCost] = useState(6);
  const [taxRate, setTaxRate] = useState(21);
  const [terminalLeaseRev, setTerminalLeaseRev] = useState(1.25);
  const [exitCapRate, setExitCapRate] = useState(7);

  const calc = useMemo(() => {
    const capex = shellCapex;
    const baseRev = leaseRev;
    const depr = capex / 25;
    const equity = capex * (1 - debtMix / 100);
    const showYrs = Math.min(leaseDuration, 8);

    const years = [];
    let debt = capex * debtMix / 100;
    let cumRev = 0, cumNOI = 0, cumOP = 0;
    let cumInterest = 0, cumTax = 0, cumPaydown = 0;
    let cumLevFCF = -equity;
    const levCFs = [], unlevCFs = [];

    years.push({
      year: 0, revenue: 0, opCosts: 0, noi: 0, noiRate: 0,
      depreciation: 0, op: 0, opm: 0,
      interest: 0, tax: 0, paydown: 0,
      equityFunding: -equity,
      levFCF: -equity, cumLevFCF: -equity, irrPA: null,
    });

    for (let y = 1; y <= leaseDuration; y++) {
      const rev = baseRev * Math.pow(1 + rentEsc / 100, y - 1);
      const noi = rev * noiMargin / 100;
      const op = noi - depr;
      const interest = debt * debtCost / 100;
      const tax = Math.max(0, (op - interest) * taxRate / 100);
      const available = noi - interest - tax;
      const paydown = Math.min(debt, Math.max(0, available));
      debt -= paydown;
      const levFCF = available - paydown;

      cumRev += rev;
      cumNOI += noi;
      cumOP += op;
      cumInterest += interest;
      cumTax += tax;
      cumPaydown += paydown;
      cumLevFCF += levFCF;

      levCFs.push(levFCF);
      unlevCFs.push(noi);

      if (y <= showYrs || y === leaseDuration) {
        years.push({
          year: y, revenue: rev, opCosts: -(rev - noi),
          noi, noiRate: noiMargin / 100,
          depreciation: -depr, op, opm: rev > 0 ? op / rev : 0,
          interest: -interest, tax: -tax, paydown: -paydown,
          equityFunding: 0,
          levFCF, cumLevFCF,
          irrPA: equity > 0.01 ? calculateIRR([...levCFs], equity) : null,
        });
      }
    }

    const cumCol = {
      year: 'C', revenue: cumRev, opCosts: -(cumRev - cumNOI),
      noi: cumNOI, noiRate: cumRev > 0 ? cumNOI / cumRev : 0,
      depreciation: -(depr * leaseDuration), op: cumOP,
      opm: cumRev > 0 ? cumOP / cumRev : 0,
      interest: -cumInterest, tax: -cumTax, paydown: -cumPaydown,
      equityFunding: -equity,
      levFCF: cumLevFCF, cumLevFCF,
      irrPA: equity > 0.01 ? calculateIRR(levCFs, equity) : null,
    };

    const stabilizedNOI = baseRev * noiMargin / 100;
    const capRate = (stabilizedNOI / capex) * 100;

    // ── Development economics ──────────────────────────────────────────────────
    // Terminal value uses normalized lease rate (post-premium environment)
    const terminalNOI = terminalLeaseRev * noiMargin / 100;
    const stabilizedValue = terminalNOI / (exitCapRate / 100);   // $B
    const developmentGain = stabilizedValue - capex;               // $B vs build cost
    const yocSpread       = capRate - exitCapRate;                 // pp above market
    // Equity at exit (simplified: no debt paydown assumed — conservative)
    const equityAtExit    = stabilizedValue - (capex * debtMix / 100);
    const equityMultiple  = equity > 0 ? equityAtExit / equity : null;
    const leveredIRR = equity > 0.01 ? calculateIRR(levCFs, equity) : null;
    const unleveredIRR = calculateIRR(unlevCFs, capex);
    const waccBlended = (debtCost * debtMix / 100 + 12 * (100 - debtMix) / 100) / 100;
    const npv = calculateNPV(unlevCFs.map(f => f * 1e9), capex * 1e9, waccBlended);
    const payback = calculatePayback(unlevCFs.map(f => f * 1e9), capex * 1e9);
    const dollarPerMWMonth = (baseRev * 1e9 / 1000) / 12;
    const impliedEvEbitda = exitCapRate > 0 ? 100 / exitCapRate : null; // 1 / cap rate

    // Sensitivity 1: Levered IRR · Lease Rate × Debt Mix
    const leaseRates = [1.5, 1.75, 2.0, 2.25, 2.5];
    const debtRange  = [0, 60, 70, 80, 90];
    const sens1 = leaseRates.map(r => {
      const row = { label: `$${r}B` };
      debtRange.forEach(d => {
        row[`d${d}`] = sensIRR(capex, r, noiMargin, rentEsc, d, debtCost, taxRate, leaseDuration);
      });
      return row;
    });

    // Sensitivity 2: Levered IRR · Lease Rate × Capex/GW
    const capexRange = [8, 9, 10, 12, 14];
    const sens2 = leaseRates.map(r => {
      const row = { label: `$${r}B` };
      capexRange.forEach(c => {
        row[`c${c}`] = sensIRR(c, r, noiMargin, rentEsc, debtMix, debtCost, taxRate, leaseDuration);
      });
      return row;
    });

    return {
      years, cumCol,
      capRate, leveredIRR, unleveredIRR, npv, payback, dollarPerMWMonth,
      stabilizedNOI: stabilizedNOI * 1e9,
      sens1, sens2,
      showEllipsis: leaseDuration > showYrs,
      shellCapexPerGW: capex * 1e9,
      leaseRevenuePerGW: baseRev * 1e9,
      noiPerGW: stabilizedNOI * 1e9,
      // Development economics
      stabilizedValue: stabilizedValue * 1e9,
      developmentGain: developmentGain * 1e9,
      yocSpread,
      equityMultiple,
      exitCapRate,
      // For integrated IRR in summary
      levCFs,
      equityInvested: equity,
      impliedEvEbitda,
    };
  }, [shellCapex, leaseRev, leaseDuration, rentEsc, noiMargin, debtMix, debtCost, taxRate, terminalLeaseRev, exitCapRate]);

  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  useEffect(() => { onUpdateRef.current?.({ ...calc }); }, [calc]);

  const plRows = [
    { id: 'rev', label: 'Lease Revenue', key: 'revenue', bold: true },
    { id: 's1', spacer: true },
    { id: 'opc', label: 'Operating Costs', key: 'opCosts', indent: true },
    { id: 'noi', label: 'NOI', key: 'noi', bold: true },
    { id: 'noiR', label: 'NOI Margin%', key: 'noiRate', pct: true },
    { id: 's2', spacer: true },
    { id: 'depr', label: 'Depreciation', key: 'depreciation', indent: true },
    { id: 'op', label: 'Operating Profit', key: 'op', bold: true },
    { id: 'opmR', label: 'OPM%', key: 'opm', pct: true },
    { id: 's3', spacer: true },
    { id: 'int', label: `Interest (${debtCost}%)`, key: 'interest', indent: true },
    { id: 'tax', label: 'Taxes', key: 'tax', indent: true },
    { id: 'debt', label: 'Debt Paydown', key: 'paydown', indent: true },
    { id: 'eq', label: 'Equity Funding', key: 'equityFunding' },
    { id: 's4', spacer: true },
    { id: 'lev', label: 'Levered FCF', key: 'levFCF', bold: true, accent: true },
    { id: 'clev', label: 'Cumulative FCF', key: 'cumLevFCF', dim: true },
    { id: 's5', spacer: true },
    { id: 'irr', label: 'IRR Per Annum', key: 'irrPA', irr: true, bold: true },
  ];

  const allCols = [...calc.years, calc.cumCol];

  return (
    <div className="px-8 py-10">
      <div className="mb-10">
        <p className="text-2xs uppercase tracking-[0.3em] text-text-ghost mb-2 font-mono">Module 02</p>
        <h2 className="text-2xl font-serif text-text tracking-tight">Data Center Shell + Power</h2>
        <p className="text-sm text-text-muted mt-1.5">
          {leaseDuration}yr lease · ${shellCapex}B capex/GW · {debtMix}% debt · {rentEsc}% escalator
        </p>
        <p className="text-xs text-text-ghost mt-1 font-mono">
          Yield on cost (developer economics) — build cost vs. lease income. Market cap rates for stabilized AI DC: 6–8%.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-3">
          <div className="sticky top-16 space-y-5 max-h-[calc(100vh-100px)] overflow-y-auto pr-2">
            <div>
              <p className="text-2xs uppercase tracking-[0.15em] text-text-ghost font-medium mb-3">Deal Structure</p>
              <SliderInput label="Shell Capex/GW" value={shellCapex} min={8} max={15} step={0.5} onChange={setShellCapex} formatValue={v => `$${v.toFixed(1)}B`} />
              <SliderInput label="Lease Revenue/GW/yr" value={leaseRev} min={1.5} max={2.5} step={0.05} onChange={setLeaseRev} formatValue={v => `$${v.toFixed(2)}B`} />
              <SliderInput label="Lease Duration" value={leaseDuration} min={10} max={20} step={1} onChange={setLeaseDuration} formatValue={v => `${v}yr`} />
              <SliderInput label="Rent Escalator" value={rentEsc} min={1} max={4} step={0.1} onChange={setRentEsc} formatValue={v => `${v.toFixed(1)}%/yr`} />
            </div>
            <div className="h-px bg-bg-border" />
            <div>
              <p className="text-2xs uppercase tracking-[0.15em] text-text-ghost font-medium mb-3">Operating</p>
              <SliderInput label="NOI Margin" value={noiMargin} min={80} max={92} step={1} onChange={setNoiMargin} formatValue={v => `${v}%`} />
            </div>
            <div className="h-px bg-bg-border" />
            <div>
              <p className="text-2xs uppercase tracking-[0.15em] text-text-ghost font-medium mb-3">Financing</p>
              <SliderInput label="Debt Mix" value={debtMix} min={0} max={80} step={5} onChange={setDebtMix} formatValue={v => `${v}%`} />
              <SliderInput label="Cost of Debt" value={debtCost} min={4} max={10} step={0.5} onChange={setDebtCost} formatValue={v => `${v}%`} />
              <SliderInput label="Tax Rate" value={taxRate} min={15} max={30} step={1} onChange={setTaxRate} formatValue={v => `${v}%`} />
            </div>
            <div className="h-px bg-bg-border" />
            <div>
              <p className="text-2xs uppercase tracking-[0.15em] text-text-ghost font-medium mb-1">Exit Valuation</p>
              <p className="text-2xs text-text-ghost mb-3 leading-relaxed">
                Stabilized AI DC cap rates: 6–8%. Spread vs. yield-on-cost is the developer thesis.
              </p>
              <SliderInput label="Terminal Lease Rev" value={terminalLeaseRev} min={0.8} max={2.0} step={0.05} onChange={setTerminalLeaseRev} formatValue={v => `$${v.toFixed(2)}B`} />
              <SliderInput label="Market Cap Rate" value={exitCapRate} min={5} max={10} step={0.5} onChange={setExitCapRate} formatValue={v => `${v.toFixed(1)}%`} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-9 space-y-8">
          <div className="grid grid-cols-5 gap-4">
            <MetricCard label="Payback" value={formatYears(calc.payback)} subtitle="unlevered" />
            <MetricCard label="Levered IRR" value={calc.leveredIRR !== null ? formatPercent(calc.leveredIRR) : '—'} />
            <MetricCard label="Cap Rate" value={formatPercent(calc.capRate)} subtitle="yield on cost" />
            <MetricCard label="EV/EBITDA" value={calc.impliedEvEbitda != null ? `${calc.impliedEvEbitda.toFixed(1)}x` : '—'} subtitle={`at ${calc.exitCapRate}% cap rate`} />
            <MetricCard label="$/MW/Month" value={formatCurrency(calc.dollarPerMWMonth)} />
          </div>

          {/* P&L Table */}
          <div className="border border-bg-border rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-bg-border flex items-center justify-between bg-bg-surface">
              <p className="text-2xs uppercase tracking-[0.15em] text-text-muted font-medium">
                P&L · Per GW ($B){calc.showEllipsis ? ' · first years + final' : ''}
              </p>
              <button
                onClick={() => {
                  const hdr = ['', ...allCols.map(c => c.year === 'C' ? 'Cumul.' : c.year === 0 ? 'Yr 0' : `Yr ${c.year}`)].join('\t');
                  const rows = plRows.filter(r => !r.spacer).map(r => {
                    return [r.label, ...allCols.map(c => {
                      const v = c[r.key];
                      return r.pct ? fmtPct(v) : r.irr ? fmtIRR(v) : fmtB(v);
                    })].join('\t');
                  }).join('\n');
                  navigator.clipboard.writeText(hdr + '\n' + rows);
                }}
                className="text-2xs text-text-ghost hover:text-text-secondary font-mono transition-colors"
              >
                Copy ↗
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-bg-border">
                    <th className="text-left py-2 px-4 text-text-ghost font-medium w-40 sticky left-0 bg-bg z-10">USD $B</th>
                    {allCols.map((col, i) => {
                      const isCumul = col.year === 'C';
                      return (
                        <th key={i} className={`text-right py-2 px-3 font-mono font-medium min-w-[68px] ${
                          isCumul ? 'text-text-secondary border-l border-bg-border bg-bg-surface' : 'text-text-ghost'
                        }`}>
                          {col.year === 0 ? 'Yr 0' : isCumul ? 'Cumul.' : `Yr ${col.year}`}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {plRows.map((row) => {
                    if (row.spacer) {
                      return <tr key={row.id}><td colSpan={allCols.length + 1} className="h-1.5" /></tr>;
                    }
                    return (
                      <tr key={row.id} className="hover:bg-bg-surface/60 transition-colors">
                        <td className={`py-1.5 px-4 sticky left-0 bg-bg z-10 whitespace-nowrap
                          ${row.indent ? 'pl-7' : ''}
                          ${row.bold ? 'font-medium text-text' : 'text-text-muted'}
                          ${row.pct ? 'text-2xs text-text-ghost' : ''}
                          ${row.dim ? 'text-text-ghost' : ''}
                        `}>
                          {row.label}
                        </td>
                        {allCols.map((col, i) => {
                          const v = col[row.key];
                          const isCumul = col.year === 'C';
                          let cls = 'text-right py-1.5 px-3 font-mono tabular-nums ';
                          if (isCumul) cls += 'border-l border-bg-border bg-bg-surface ';
                          if (row.pct) {
                            cls += 'text-2xs text-text-ghost ';
                          } else if (row.irr) {
                            cls += (v === null || v === undefined || isNaN(v) || v < -50) ? 'text-text-ghost text-2xs ' : 'text-text font-medium ';
                          } else if (row.bold && row.accent) {
                            cls += v >= 0 ? 'text-text font-semibold ' : 'text-text-muted font-medium ';
                          } else if (row.bold) {
                            cls += 'text-text-secondary font-medium ';
                          } else if (row.dim) {
                            cls += 'text-text-ghost ';
                          } else {
                            cls += 'text-text-muted ';
                          }
                          return (
                            <td key={i} className={cls}>
                              {row.pct ? fmtPct(v) : row.irr ? fmtIRR(v) : fmtB(v)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sensitivity Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sens 1: Levered IRR · Lease Rate × Debt Mix */}
            <div className="border border-bg-border rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-bg-border bg-bg-surface">
                <p className="text-2xs uppercase tracking-[0.15em] text-text-muted font-medium">Levered IRR · Lease Rate × Debt Mix</p>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-bg-border">
                    <th className="text-left py-2 px-4 text-text-ghost font-medium font-mono">Rev/GW</th>
                    {[0, 60, 70, 80, 90].map(d => (
                      <th key={d} className="text-right py-2 px-4 text-text-ghost font-medium font-mono">{d}%</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calc.sens1.map((row, idx) => (
                    <tr key={idx} className="border-b border-bg-border/50 hover:bg-bg-surface/60 transition-colors">
                      <td className="py-2 px-4 text-text-muted font-mono">{row.label}</td>
                      {[0, 60, 70, 80, 90].map(d => {
                        const val = row[`d${d}`];
                        const isActive = parseFloat(row.label.replace('$','').replace('B','')) === leaseRev && d === debtMix;
                        return (
                          <td key={d} className={`text-right py-2 px-4 font-mono ${
                            isActive ? 'text-text font-semibold bg-bg-hover' : 'text-text-muted'
                          }`}>
                            {val !== null ? fmtIRR(val) : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sens 2: Levered IRR · Lease Rate × Capex/GW */}
            <div className="border border-bg-border rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-bg-border bg-bg-surface">
                <p className="text-2xs uppercase tracking-[0.15em] text-text-muted font-medium">Levered IRR · Lease Rate × Capex/GW</p>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-bg-border">
                    <th className="text-left py-2 px-4 text-text-ghost font-medium font-mono">Rev/GW</th>
                    {[8, 9, 10, 12, 14].map(c => (
                      <th key={c} className="text-right py-2 px-4 text-text-ghost font-medium font-mono">${c}B</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calc.sens2.map((row, idx) => (
                    <tr key={idx} className="border-b border-bg-border/50 hover:bg-bg-surface/60 transition-colors">
                      <td className="py-2 px-4 text-text-muted font-mono">{row.label}</td>
                      {[8, 9, 10, 12, 14].map(c => {
                        const val = row[`c${c}`];
                        const isActive = parseFloat(row.label.replace('$','').replace('B','')) === leaseRev && c === shellCapex;
                        return (
                          <td key={c} className={`text-right py-2 px-4 font-mono ${
                            isActive ? 'text-text font-semibold bg-bg-hover' : 'text-text-muted'
                          }`}>
                            {val !== null ? fmtIRR(val) : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Development Economics ─────────────────────────────────────────── */}
          <div className="border border-bg-border rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-bg-border bg-bg-surface flex items-center justify-between">
              <div>
                <p className="text-2xs uppercase tracking-[0.15em] text-text-muted font-medium">Development Economics · Sale at Stabilization</p>
                <p className="text-2xs text-text-ghost mt-0.5 font-mono">
                  Yield-on-cost {formatPercent(calc.capRate)} · market cap rate {calc.exitCapRate}% · spread +{calc.yocSpread.toFixed(1)}pp
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 p-5">
              <MetricCard
                label="Stabilized Value"
                value={formatCurrency(calc.stabilizedValue)}
                subtitle={`$${terminalLeaseRev.toFixed(2)}B normalized · ${calc.exitCapRate}% cap`}
              />
              <MetricCard
                label="Development Gain"
                value={formatCurrency(calc.developmentGain)}
                subtitle="vs build cost"
              />
              <MetricCard
                label="YoC Spread"
                value={`+${calc.yocSpread.toFixed(1)}pp`}
                subtitle="yield-on-cost vs exit"
              />
              <MetricCard
                label="Equity Multiple"
                value={calc.equityMultiple != null ? `${calc.equityMultiple.toFixed(1)}×` : '—'}
                subtitle="at sale (no paydown adj.)"
              />
            </div>
          </div>

          {/* ── Cash Flow Visual ──────────────────────────────────────────────── */}
          {(() => {
            const showYrs = Math.min(leaseDuration + 1, 9);
            const vizData = [];
            for (let y = 1; y <= showYrs; y++) {
              const yr = calc.years.find(r => r.year === y);
              const noi = yr ? yr.noi : calc.stabilizedNOI / 1e9 * Math.pow(1 + rentEsc / 100, y - 1);
              vizData.push({ year: y, noi, beyond: y > leaseDuration });
            }
            const maxV = Math.max(...vizData.map(d => d.noi), 0.1);
            const equity = shellCapex * (1 - debtMix / 100);
            const W = 680, H = 260, BASE = 176, MAX_H = 118, CAP_H = 66, STEP = W / (vizData.length + 2);
            const pbYears = calc.payback != null && isFinite(calc.payback) && calc.payback > 0 ? calc.payback : null;
            const paybackX = pbYears != null && pbYears <= showYrs ? STEP * (pbYears + 1) : null;
            return (
              <div className="mt-2 border border-bg-border rounded-lg overflow-hidden">
                <div className="px-5 py-3 border-b border-bg-border bg-bg-surface/50 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.15em] text-text-muted font-medium">Cash Flow Profile · DC Shell</p>
                  <p className="text-xs text-text-ghost font-mono">${shellCapex}B capex · {leaseDuration}yr lease · {debtMix}% debt · IRR {calc.leveredIRR != null ? `+${calc.leveredIRR.toFixed(0)}%` : '—'} levered / {calc.unleveredIRR != null ? `+${calc.unleveredIRR.toFixed(0)}%` : '—'} unlevered</p>
                </div>
                <div className="px-5 py-5">
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
                    <line x1={STEP * 0.5} y1={BASE} x2={W - 10} y2={BASE} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                    <path d={`M ${W - 18} ${BASE - 4} L ${W - 8} ${BASE} L ${W - 18} ${BASE + 4}`} stroke="rgba(255,255,255,0.12)" fill="none" strokeWidth="1" />
                    <text x={W - 5} y={BASE + 4} fontSize="9" fill="rgba(255,255,255,0.2)">yr</text>
                    <text x={STEP * 0.55} y={BASE - MAX_H - 4} fontSize="9" fill="rgba(255,255,255,0.18)">NOI $B</text>
                    <line x1={STEP} y1={BASE} x2={STEP} y2={BASE + CAP_H} stroke="#ef4444" strokeWidth="2" />
                    <path d={`M ${STEP - 5} ${BASE + CAP_H - 8} L ${STEP} ${BASE + CAP_H} L ${STEP + 5} ${BASE + CAP_H - 8}`} stroke="#ef4444" fill="none" strokeWidth="2" />
                    <text x={STEP} y={BASE + CAP_H + 14} textAnchor="middle" fontSize="11" fill="rgba(239,68,68,0.8)">({shellCapex})</text>
                    <text x={STEP} y={BASE + 13} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.25)">0</text>
                    {vizData.map((d, i) => {
                      const x = STEP * (i + 2);
                      const h = Math.max(6, (d.noi / maxV) * MAX_H);
                      const col = d.beyond ? '#94a3b8' : '#3b82f6';
                      const op = d.beyond ? 0.45 : 1;
                      const isLast = d.year === leaseDuration;
                      return (
                        <g key={d.year}>
                          {isLast && <rect x={x - 10} y={BASE - h} width={20} height={h} fill="#f59e0b" fillOpacity="0.18" rx="2" />}
                          <line x1={x} y1={BASE} x2={x} y2={BASE - h} stroke={col} strokeWidth={2} strokeOpacity={op} />
                          <path d={`M ${x - 4.5} ${BASE - h + 8} L ${x} ${BASE - h} L ${x + 4.5} ${BASE - h + 8}`} stroke={col} fill="none" strokeWidth={2} strokeOpacity={op} />
                          <text x={x} y={BASE - h - 5} textAnchor="middle" fontSize="10" fill={`rgba(148,163,184,${d.beyond ? 0.4 : 0.9})`}>{d.noi.toFixed(1)}</text>
                          <text x={x} y={BASE + 13} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.28)">{d.year}</text>
                          {d.beyond && <text x={x} y={BASE + 24} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.2)">Beyond</text>}
                        </g>
                      );
                    })}
                    {paybackX && (
                      <g>
                        <line x1={paybackX} y1={30} x2={paybackX} y2={BASE} stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 3" strokeOpacity="0.7" />
                        <text x={paybackX} y={26} textAnchor="middle" fontSize="9" fontWeight="600" fill="rgba(34,197,94,0.85)">Breakeven ~{pbYears.toFixed(1)}yr</text>
                      </g>
                    )}
                    {leaseDuration >= 1 && (() => {
                      const x1 = STEP * 1.5, x2 = STEP * (Math.min(leaseDuration, showYrs - 1) + 1.5), y = 14;
                      return (
                        <g>
                          <line x1={x1} y1={y} x2={x2} y2={y} stroke="rgba(59,130,246,0.4)" strokeWidth="1" />
                          <line x1={x1} y1={y - 5} x2={x1} y2={y + 5} stroke="rgba(59,130,246,0.4)" strokeWidth="1" />
                          <line x1={x2} y1={y - 5} x2={x2} y2={y + 5} stroke="rgba(59,130,246,0.4)" strokeWidth="1" />
                          <text x={(x1 + x2) / 2} y={y - 6} textAnchor="middle" fontSize="9" fill="rgba(59,130,246,0.65)">Lease {leaseDuration}yr</text>
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
