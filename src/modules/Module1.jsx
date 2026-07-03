import React, { useState, useMemo, useEffect, useRef } from 'react';

import SliderInput from '../components/SliderInput';
import MetricCard from '../components/MetricCard';
import { calculateIRR, calculateNPV, calculatePayback, formatCurrency, formatPercent, formatYears } from '../utils/calculations';

// ── Reference revenue for operating leverage ─────────────────────────────────
// The EBITDA margin slider sets margin at this reference revenue.
// At different revenue levels, actual margin adjusts due to fixed vs variable costs.
const REF_REVENUE = 11; // $11B — default revenue anchor
const FIXED_COST_SHARE = 0.6; // 60% of opex is fixed (DC lease, staff, overhead)

// ── Formatting ──────────────────────────────────────────────────────────────
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

// ── Cost model: fixed + variable ─────────────────────────────────────────────
function getCosts(revenue, ebitdaM) {
  // Reference costs at $11B revenue with the given margin
  const refTotalCosts = REF_REVENUE * (1 - ebitdaM / 100);
  const fixedCosts = refTotalCosts * FIXED_COST_SHARE;
  const variableRate = refTotalCosts * (1 - FIXED_COST_SHARE) / REF_REVENUE;
  return fixedCosts + revenue * variableRate;
}

// ── IRR helper for sensitivity tables ───────────────────────────────────────
function sensIRR(capex, rev, ebitdaM, prepayPct, debtMix, debtCost, taxRate, contractYrs, gpuLife, gpuDecay) {
  if (capex <= 0) return null;
  const totalContract = rev * contractYrs;
  const pp = totalContract * prepayPct / 100;
  const equity = capex * (1 - debtMix / 100);
  if (equity < 0.01) return null;
  const depr = capex / gpuLife;
  const totalYears = Math.max(contractYrs, gpuLife);
  let debt = capex * debtMix / 100;
  const cfs = [];

  for (let y = 1; y <= totalYears; y++) {
    const yRev = y <= contractYrs
      ? rev
      : rev * Math.pow(1 - gpuDecay / 100, y - contractYrs);
    const costs = getCosts(yRev, ebitdaM);
    const ebitda = Math.max(0, yRev - costs);
    const op = ebitda - depr;
    const interest = debt * debtCost / 100;
    const tax = Math.max(0, (op - interest) * taxRate / 100);

    let ppAdj = 0;
    if (y === 1) ppAdj = pp;
    else if (y >= 2 && y <= contractYrs + 1 && contractYrs > 0) ppAdj = -(pp / contractYrs);

    const available = ebitda + ppAdj - interest - tax;
    const paydown = Math.min(debt, Math.max(0, available));
    debt -= paydown;
    cfs.push(available - paydown);
  }
  return calculateIRR(cfs, equity);
}

// ═══════════════════════════════════════════════════════════════════════════
export default function Module1({ onUpdate, modulesLinked, module2Data }) {
  const [capex, setCapex] = useState(30);
  const [maxRevPerGW, setMaxRevPerGW] = useState(13); // contract rate at 100% contracted
  const [utilization, setUtilization] = useState(85); // % of cluster under contract
  const [contractYrs, setContractYrs] = useState(4);
  const [prepayPct, setPrepayPct] = useState(20);
  const [ebitdaM, setEbitdaM] = useState(75);
  const [gpuLife, setGpuLife] = useState(6);
  const [gpuDecay, setGpuDecay] = useState(5);
  const [debtMix, setDebtMix] = useState(80);
  const [debtCost, setDebtCost] = useState(10);
  const [taxRate, setTaxRate] = useState(21);

  // Effective revenue — available in both useMemo and JSX
  const revPerGW = maxRevPerGW * utilization / 100;

  const calc = useMemo(() => {
    const decayFloor = revPerGW * 0.25; // secondary market floor ~25% of contract rate

    const totalContract = revPerGW * contractYrs;
    const ppAmount = totalContract * prepayPct / 100;
    const ppAmort = contractYrs > 0 ? ppAmount / contractYrs : 0;
    const equity = capex * (1 - debtMix / 100);
    const depr = capex / gpuLife;
    const totalYears = Math.max(contractYrs, gpuLife);

    // Contract-period EBITDA (at the slider-set revenue)
    const contractCosts = getCosts(revPerGW, ebitdaM);
    const contractEBITDA = revPerGW - contractCosts;
    const actualMarginAtRev = revPerGW > 0 ? contractEBITDA / revPerGW : 0;

    const years = [];
    let debt = capex * debtMix / 100;
    let cumRev = 0, cumEbitda = 0, cumOP = 0;
    let cumInterest = 0, cumTax = 0, cumPaydown = 0, cumPP = 0;
    let cumLevFCF = -equity;
    let cumUnlevFCF = -capex;
    const levCFs = [], unlevCFs = [];

    // Year 0
    years.push({
      year: 0, revenue: 0, opCosts: 0, ebitda: 0, ebitdaRate: 0,
      depreciation: 0, op: 0, opm: 0,
      interest: 0, tax: 0, paydown: 0, ppAdj: 0,
      equityFunding: -equity,
      levFCF: -equity, cumLevFCF: -equity,
      unlevFCF: -capex, cumUnlevFCF: -capex,
      irrPA: null,
    });

    for (let y = 1; y <= totalYears; y++) {
      const yRev = y <= contractYrs
        ? revPerGW
        : Math.max(decayFloor, revPerGW * Math.pow(1 - gpuDecay / 100, y - contractYrs));

      const costs = getCosts(yRev, ebitdaM);
      const ebitda = Math.max(0, yRev - costs);
      const ebitdaRate = yRev > 0 ? ebitda / yRev : 0;
      const op = ebitda - depr;
      const opm = yRev > 0 ? op / yRev : 0;

      const interest = debt * debtCost / 100;
      const taxable = op - interest;
      const tax = Math.max(0, taxable * taxRate / 100);

      let ppAdj = 0;
      if (y === 1) ppAdj = ppAmount;
      else if (y >= 2 && y <= contractYrs + 1 && contractYrs > 0) ppAdj = -ppAmort;

      const available = ebitda + ppAdj - interest - tax;
      const paydown = Math.min(debt, Math.max(0, available));
      debt -= paydown;
      const levFCF = available - paydown;
      const unlevTax = Math.max(0, op * taxRate / 100);
      const unlevFCF = ebitda - unlevTax; // after-tax unlevered CF (NOPAT + depr)

      cumRev += yRev;
      cumEbitda += ebitda;
      cumOP += op;
      cumInterest += interest;
      cumTax += tax;
      cumPaydown += paydown;
      cumPP += ppAdj;
      cumLevFCF += levFCF;
      cumUnlevFCF += unlevFCF;

      levCFs.push(levFCF);
      unlevCFs.push(unlevFCF);

      years.push({
        year: y, revenue: yRev, opCosts: -(yRev - ebitda),
        ebitda, ebitdaRate, depreciation: -depr, op, opm,
        interest: -interest, tax: -tax, paydown: -paydown, ppAdj,
        equityFunding: 0,
        levFCF, cumLevFCF, unlevFCF, cumUnlevFCF,
        irrPA: levCFs.length >= 1 && equity > 0.01 ? calculateIRR([...levCFs], equity) : null,
      });
    }

    const cumCol = {
      year: 'C', revenue: cumRev, opCosts: -(cumRev - cumEbitda),
      ebitda: cumEbitda, ebitdaRate: cumRev > 0 ? cumEbitda / cumRev : 0,
      depreciation: -(depr * totalYears), op: cumOP,
      opm: cumRev > 0 ? cumOP / cumRev : 0,
      interest: -cumInterest, tax: -cumTax, paydown: -cumPaydown,
      ppAdj: cumPP, equityFunding: -equity,
      levFCF: cumLevFCF, cumLevFCF,
      unlevFCF: cumUnlevFCF, cumUnlevFCF,
      irrPA: equity > 0.01 ? calculateIRR(levCFs, equity) : null,
    };

    const pctCapex = {
      revenue: `${(cumRev / capex * 100).toFixed(0)}%`,
      ebitda: `${(cumEbitda / capex * 100).toFixed(0)}%`,
      op: `${(cumOP / capex * 100).toFixed(0)}%`,
      levFCF: equity > 0 ? `${(cumLevFCF / equity * 100).toFixed(0)}%` : '—',
    };

    const leveredIRR = equity > 0.01 ? calculateIRR(levCFs, equity) : null;
    const unleveredIRR = calculateIRR(unlevCFs, capex);
    const npv = calculateNPV(unlevCFs.map(f => f * 1e9), capex * 1e9, 0.10);
    const payback = calculatePayback(levCFs, equity);
    const cashOnCash = equity > 0.01 && levCFs.length > 0 ? (levCFs[0] / equity) * 100 : 0;

    // DSCR: Year-1 EBITDA ÷ (interest + debt paydown)
    const yr1 = years.length > 1 ? years[1] : null;
    const dscr = yr1
      ? yr1.ebitda / (Math.abs(yr1.interest) + Math.abs(yr1.paydown) || 1)
      : null;

    // Sensitivity 1: Levered IRR · Rev/GW × Debt Mix
    const revRange  = [9, 10, 11, 12, 13];
    const debtRange = [0, 60, 70, 80, 90];
    const sens1 = revRange.map(r => {
      const row = { label: `$${r}B` };
      debtRange.forEach(d => {
        row[`d${d}`] = sensIRR(capex, r, ebitdaM, prepayPct, d, debtCost, taxRate, contractYrs, Math.max(contractYrs, gpuLife), gpuDecay);
      });
      return row;
    });

    // Sensitivity 2: Levered IRR · Rev/GW × Capex/GW
    const capexRange = [25, 30, 35, 40, 45];
    const sens2 = revRange.map(r => {
      const row = { label: `$${r}B` };
      capexRange.forEach(c => {
        row[`c${c}`] = sensIRR(c, r, ebitdaM, prepayPct, debtMix, debtCost, taxRate, contractYrs, Math.max(contractYrs, gpuLife), gpuDecay);
      });
      return row;
    });

    return {
      years, cumCol, pctCapex,
      leveredIRR, unleveredIRR, npv, payback, cashOnCash, dscr,
      actualMarginAtRev,
      sens1, sens2,
      capexPerGW: capex * 1e9,
      annualRevenue: revPerGW * 1e9,
      annualEBITDA: contractEBITDA * 1e9,
      irr: unleveredIRR,
      levCFs,           // year-by-year levered FCFs ($B) — for integrated IRR
      equityInvested: equity, // equity outlay ($B) — for integrated IRR
    };
  }, [capex, maxRevPerGW, utilization, contractYrs, prepayPct, ebitdaM, gpuLife, gpuDecay, debtMix, debtCost, taxRate]);

  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  useEffect(() => { onUpdateRef.current?.({ ...calc, payback: calc.payback }); }, [calc]);

  // DC Lease split — ties to Module 2 when linked, otherwise default $1.5B/yr
  const dcLeaseB = (modulesLinked && module2Data)
    ? module2Data.leaseRevenuePerGW / 1e9
    : 1.5;
  const totalModelYrs = Math.max(contractYrs, gpuLife);
  const allCols = [...calc.years, calc.cumCol].map(col => {
    const isCumul = col.year === 'C';
    const dcL = isCumul ? -(dcLeaseB * totalModelYrs) : col.year > 0 ? -dcLeaseB : 0;
    return { ...col, dcLease: dcL, otherCosts: col.opCosts !== undefined ? col.opCosts - dcL : 0 };
  });

  // ── P&L Row Config ────────────────────────────────────────────────────
  const plRows = [
    { id: 'rev', label: 'Revenue/GW', key: 'revenue', bold: true },
    { id: 's1', spacer: true },
    { id: 'dcl', label: 'DC Shell Lease', key: 'dcLease', indent: true },
    { id: 'otc', label: 'Power & Overhead', key: 'otherCosts', indent: true },
    { id: 'ebitda', label: 'EBITDA', key: 'ebitda', bold: true },
    { id: 'ebitdaR', label: 'EBITDAM%', key: 'ebitdaRate', pct: true },
    { id: 's2', spacer: true },
    { id: 'depr', label: 'Depreciation', key: 'depreciation', indent: true },
    { id: 'op', label: 'Operating Profit', key: 'op', bold: true },
    { id: 'opmR', label: 'OPM%', key: 'opm', pct: true },
    { id: 's3', spacer: true },
    { id: 'int', label: `Interest (${debtCost}%)`, key: 'interest', indent: true },
    { id: 'tax', label: 'Taxes', key: 'tax', indent: true },
    { id: 'debt', label: 'Debt Paydown', key: 'paydown', indent: true },
    { id: 'pp', label: `Prepayment (${prepayPct}%)`, key: 'ppAdj' },
    { id: 'eq', label: 'Equity Funding', key: 'equityFunding' },
    { id: 's4', spacer: true },
    { id: 'lev', label: 'Levered FCF', key: 'levFCF', bold: true, accent: true },
    { id: 'clev', label: 'Cumulative FCF', key: 'cumLevFCF', dim: true },
    { id: 's5', spacer: true },
    { id: 'irr', label: 'IRR Per Annum', key: 'irrPA', irr: true, bold: true },
  ];

  // Show actual margin hint when it differs from slider
  const marginDiff = Math.abs(calc.actualMarginAtRev * 100 - ebitdaM);
  const marginNote = marginDiff > 0.5 ? ` → actual ${(calc.actualMarginAtRev * 100).toFixed(0)}%` : '';

  return (
    <div className="px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="text-2xs uppercase tracking-[0.3em] text-text-ghost mb-2 font-mono">Module 01</p>
        <h2 className="text-2xl font-serif text-text tracking-tight">GPU Cloud Unit Economics</h2>
        <p className="text-sm text-text-muted mt-1.5">
          {contractYrs}yr contract · ${capex}B capex/GW · {debtMix}% debt · {prepayPct}% prepayment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ── Sliders ──────────────────────────────────────────────── */}
        <div className="lg:col-span-3">
          <div className="sticky top-16 space-y-5 max-h-[calc(100vh-100px)] overflow-y-auto pr-2">
            <div>
              <p className="text-2xs uppercase tracking-[0.15em] text-text-ghost font-medium mb-3">Deal Structure</p>
              <SliderInput label="Capex/GW" value={capex} min={25} max={50} step={1} onChange={setCapex} formatValue={v => `$${v}B`} />
              <SliderInput label="Peak rate/GW (100% contracted)" value={maxRevPerGW} min={9} max={16} step={0.5} onChange={setMaxRevPerGW} formatValue={v => `$${v.toFixed(1)}B`} />
              <SliderInput label="Contracted capacity" value={utilization} min={0} max={100} step={5} onChange={setUtilization} formatValue={v => `${v}%`} />
              <div className="text-2xs font-mono text-text-ghost -mt-2 mb-2">
                Effective revenue: ${(maxRevPerGW * utilization / 100).toFixed(1)}B/GW/yr
              </div>
              <SliderInput label="Contract" value={contractYrs} min={0} max={6} step={1} onChange={setContractYrs} formatValue={v => `${v}yr`} />
              <SliderInput label="Prepayment" value={prepayPct} min={0} max={30} step={5} onChange={setPrepayPct} formatValue={v => `${v}%`} />
            </div>
            <div className="h-px bg-bg-border" />
            <div>
              <p className="text-2xs uppercase tracking-[0.15em] text-text-ghost font-medium mb-3">Operating</p>
              <SliderInput
                label={`EBITDA Margin (@ $${REF_REVENUE}B)`}
                value={ebitdaM}
                min={65}
                max={85}
                step={1}
                onChange={setEbitdaM}
                formatValue={v => `${v}%`}
              />
              {marginNote && (
                <p className="text-2xs text-text-muted -mt-2 mb-3 font-mono">
                  At ${revPerGW.toFixed(1)}B{marginNote}
                </p>
              )}
              <SliderInput label="GPU Useful Life" value={gpuLife} min={4} max={7} step={1} onChange={setGpuLife} formatValue={v => `${v}yr`} />
              <SliderInput label="GPU Price Decay" value={gpuDecay} min={0} max={30} step={1} onChange={setGpuDecay} formatValue={v => `${v}%/yr`} />
            </div>
            <div className="h-px bg-bg-border" />
            <div>
              <p className="text-2xs uppercase tracking-[0.15em] text-text-ghost font-medium mb-3">Financing</p>
              <SliderInput label="Debt Mix" value={debtMix} min={0} max={90} step={5} onChange={setDebtMix} formatValue={v => `${v}%`} />
              <SliderInput label="Cost of Debt" value={debtCost} min={4} max={12} step={0.5} onChange={setDebtCost} formatValue={v => `${v}%`} />
              <SliderInput label="Tax Rate" value={taxRate} min={15} max={30} step={1} onChange={setTaxRate} formatValue={v => `${v}%`} />
            </div>
          </div>
        </div>

        {/* ── Output ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-9 space-y-8">
          {/* Metrics */}
          <div className="grid grid-cols-5 gap-4">
            <MetricCard label="Payback" value={formatYears(calc.payback)} subtitle="levered" />
            <MetricCard label="Levered IRR" value={calc.leveredIRR !== null ? formatPercent(calc.leveredIRR) : '—'} />
            <MetricCard label="Unlevered IRR" value={calc.unleveredIRR !== null ? formatPercent(calc.unleveredIRR) : '—'} />
            <MetricCard label="Equity NPV" value={formatCurrency(calc.npv)} subtitle="@ 10% WACC" />
            <MetricCard label="DSCR" value={calc.dscr != null ? `${calc.dscr.toFixed(1)}×` : '—'} subtitle="Yr 1 · ≥1.2× req." />
          </div>

          {/* ── P&L Table ─────────────────────────────────────────────── */}
          <div className="border border-bg-border rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-bg-border flex items-center justify-between bg-bg-surface">
              <p className="text-2xs uppercase tracking-[0.15em] text-text-muted font-medium">
                P&L · Per GW ($B)
              </p>
              <div className="flex items-center gap-4">
                <span className="text-2xs text-text-ghost font-mono">
                  Rev {calc.pctCapex.revenue} of capex
                </span>
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
                  {/* Contract indicator */}
                  <tr className="border-b border-bg-border/50">
                    <td className="py-0.5 px-4 sticky left-0 bg-bg z-10" />
                    {allCols.map((col, i) => {
                      const isContract = col.year >= 1 && col.year <= contractYrs;
                      const isPost = col.year > contractYrs && col.year !== 'C';
                      return (
                        <td key={i} className={`text-right py-0.5 px-3 text-2xs font-mono ${
                          col.year === 'C' ? 'border-l border-bg-border bg-bg-surface' : ''
                        }`}>
                          <span className={isContract ? 'text-text-ghost' : isPost ? 'text-text-ghost/50' : ''}>
                            {isContract ? 'contract' : isPost ? 'spot' : ''}
                          </span>
                        </td>
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
                            cls += (v === null || v === undefined || isNaN(v) || v < -50)
                              ? 'text-text-ghost text-2xs '
                              : 'text-text font-medium ';
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

          {/* ── Sensitivity Tables ────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sens 1: Levered IRR · Rev/GW × Debt Mix */}
            <div className="border border-bg-border rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-bg-border bg-bg-surface">
                <p className="text-2xs uppercase tracking-[0.15em] text-text-muted font-medium">
                  Levered IRR · Rev/GW × Debt Mix
                </p>
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
                        const isActive = parseFloat(row.label.replace('$','').replace('B','')) === Math.round(revPerGW) && d === debtMix;
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

            {/* Sens 2: Levered IRR · Rev/GW × Capex/GW */}
            <div className="border border-bg-border rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-bg-border bg-bg-surface">
                <p className="text-2xs uppercase tracking-[0.15em] text-text-muted font-medium">
                  Levered IRR · Rev/GW × Capex/GW
                </p>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-bg-border">
                    <th className="text-left py-2 px-4 text-text-ghost font-medium font-mono">Rev/GW</th>
                    {[25, 30, 35, 40, 45].map(c => (
                      <th key={c} className="text-right py-2 px-4 text-text-ghost font-medium font-mono">${c}B</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calc.sens2.map((row, idx) => (
                    <tr key={idx} className="border-b border-bg-border/50 hover:bg-bg-surface/60 transition-colors">
                      <td className="py-2 px-4 text-text-muted font-mono">{row.label}</td>
                      {[25, 30, 35, 40, 45].map(c => {
                        const val = row[`c${c}`];
                        const isActive = parseFloat(row.label.replace('$','').replace('B','')) === Math.round(revPerGW) && c === capex;
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
        </div>
      </div>

      {/* ── Cash Flow Visual ──────────────────────────────────────────────────── */}
      {(() => {
        const showYrs = Math.min(gpuLife + 2, 9);
        const vizData = [];
        for (let y = 1; y <= showYrs; y++) {
          const yr = calc.years.find(r => r.year === y);
          const val = yr ? yr.ebitda : Math.max(0, revPerGW * Math.pow(1 - gpuDecay / 100, y - contractYrs) * ebitdaM / 100);
          vizData.push({ year: y, value: val });
        }
        const maxV = Math.max(...vizData.map(d => d.value), 0.1);
        const W = 680, H = 260, BASE = 176, MAX_H = 118, CAP_H = 66, STEP = W / (vizData.length + 2);
        const paybackYr = calc.payback;
        const paybackX = paybackYr != null && isFinite(paybackYr) && paybackYr <= showYrs ? STEP * (paybackYr + 1) : null;
        return (
          <div className="mt-6 border border-bg-border rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-bg-border bg-bg-surface/50 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.15em] text-text-muted font-medium">Cash Flow Profile · GPU Compute</p>
              <p className="text-xs text-text-ghost font-mono">${capex}B capex · {contractYrs}yr contract · {gpuLife}yr GPU life · IRR {calc.leveredIRR != null ? `+${calc.leveredIRR.toFixed(0)}%` : '—'} levered / {calc.unleveredIRR != null ? `+${calc.unleveredIRR.toFixed(0)}%` : '—'} unlevered</p>
            </div>
            <div className="px-5 py-5">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
                <line x1={STEP * 0.5} y1={BASE} x2={W - 10} y2={BASE} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                <path d={`M ${W - 18} ${BASE - 4} L ${W - 8} ${BASE} L ${W - 18} ${BASE + 4}`} stroke="rgba(255,255,255,0.12)" fill="none" strokeWidth="1" />
                <text x={W - 5} y={BASE + 4} fontSize="9" fill="rgba(255,255,255,0.2)">yr</text>
                <text x={STEP * 0.55} y={BASE - MAX_H - 4} fontSize="9" fill="rgba(255,255,255,0.18)">EBITDA $B</text>
                <line x1={STEP} y1={BASE} x2={STEP} y2={BASE + CAP_H} stroke="#ef4444" strokeWidth="2" />
                <path d={`M ${STEP - 5} ${BASE + CAP_H - 8} L ${STEP} ${BASE + CAP_H} L ${STEP + 5} ${BASE + CAP_H - 8}`} stroke="#ef4444" fill="none" strokeWidth="2" />
                <text x={STEP} y={BASE + CAP_H + 14} textAnchor="middle" fontSize="11" fill="rgba(239,68,68,0.8)">({capex})</text>
                <text x={STEP} y={BASE + 13} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.25)">0</text>
                {vizData.map((d, i) => {
                  const x = STEP * (i + 2);
                  const h = Math.max(6, (d.value / maxV) * MAX_H);
                  const isC = d.year <= contractYrs;
                  const isEnd = d.year === gpuLife;
                  const col = isC ? '#3b82f6' : '#94a3b8';
                  const op = isC ? 1 : 0.6;
                  return (
                    <g key={d.year}>
                      {isEnd && <rect x={x - 10} y={BASE - h} width={20} height={h} fill="#f59e0b" fillOpacity="0.18" rx="2" />}
                      <line x1={x} y1={BASE} x2={x} y2={BASE - h} stroke={col} strokeWidth={isC ? 2 : 1.5} strokeOpacity={op} />
                      <path d={`M ${x - 4.5} ${BASE - h + 8} L ${x} ${BASE - h} L ${x + 4.5} ${BASE - h + 8}`} stroke={col} fill="none" strokeWidth={isC ? 2 : 1.5} strokeOpacity={op} />
                      <text x={x} y={BASE - h - 5} textAnchor="middle" fontSize="10" fill={`rgba(148,163,184,${isC ? 0.9 : 0.55})`}>{d.value.toFixed(1)}</text>
                      <text x={x} y={BASE + 13} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.28)">{d.year}</text>
                      {isEnd && <text x={x} y={BASE + 24} textAnchor="middle" fontSize="8" fill="rgba(245,158,11,0.65)">end</text>}
                      {d.year === gpuLife + 1 && <text x={x} y={BASE - h * 0.5 - 5} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.25)">Beyond</text>}
                    </g>
                  );
                })}
                {paybackX && (
                  <g>
                    <line x1={paybackX} y1={30} x2={paybackX} y2={BASE} stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 3" strokeOpacity="0.7" />
                    <text x={paybackX} y={26} textAnchor="middle" fontSize="9" fontWeight="600" fill="rgba(34,197,94,0.85)">Breakeven ~{paybackYr.toFixed(1)}yr</text>
                  </g>
                )}
                {contractYrs >= 1 && (() => {
                  const x1 = STEP * 1.5, x2 = STEP * (contractYrs + 1.5), y = 14;
                  return (
                    <g>
                      <line x1={x1} y1={y} x2={x2} y2={y} stroke="rgba(59,130,246,0.4)" strokeWidth="1" />
                      <line x1={x1} y1={y - 5} x2={x1} y2={y + 5} stroke="rgba(59,130,246,0.4)" strokeWidth="1" />
                      <line x1={x2} y1={y - 5} x2={x2} y2={y + 5} stroke="rgba(59,130,246,0.4)" strokeWidth="1" />
                      <text x={(x1 + x2) / 2} y={y - 6} textAnchor="middle" fontSize="9" fill="rgba(59,130,246,0.65)">Contract {contractYrs}yr</text>
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
