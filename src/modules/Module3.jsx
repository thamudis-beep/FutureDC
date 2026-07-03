import React, { useState, useMemo, useEffect, useRef } from 'react';
import SliderInput from '../components/SliderInput';
import MetricCard from '../components/MetricCard';
import { formatCurrency, formatPercent } from '../utils/calculations';

// ── Single value-chain row ────────────────────────────────────────────────────
function VCRow({ level = 0, label, color, typeBadge, capex, revenue, gp, note, gpuLifeYears }) {
  const gpMargin = (revenue > 0 && gp != null) ? (gp / revenue) * 100 : null;
  const indent = level * 20;
  const isHardware = typeBadge && typeBadge.startsWith('÷');

  return (
    <tr className="border-b border-bg-border/40 hover:bg-bg-surface/40 transition-colors">
      {/* Layer name */}
      <td className="py-2.5 pr-3" style={{ paddingLeft: `${12 + indent}px` }}>
        <div className="flex items-start gap-1.5">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: color }} />
              <span className={`font-medium leading-tight ${level === 0 ? 'text-text text-sm' : level === 1 ? 'text-text-secondary text-xs' : 'text-text-muted text-2xs'}`}>
                {label}
              </span>
              {typeBadge && (
                <span className="text-2xs font-mono px-1 py-0.5 rounded shrink-0"
                      style={{ backgroundColor: color + '20', color }}>
                  {typeBadge}
                </span>
              )}
            </div>
            {note && <p className="text-2xs text-text-ghost leading-snug pl-3">{note}</p>}
          </div>
        </div>
      </td>

      {/* Capex / GW */}
      <td className="py-2.5 px-3 text-right font-mono align-top pt-3">
        {capex != null
          ? <span className={`${level === 0 ? 'text-sm text-text-secondary' : 'text-xs text-text-muted'}`}>
              {formatCurrency(capex)}
            </span>
          : <span className="text-text-ghost opacity-20 text-xs">—</span>
        }
      </td>

      {/* Revenue / yr */}
      <td className="py-2.5 px-3 text-right font-mono align-top pt-3">
        <span className={`${level === 0 ? 'text-sm text-text' : 'text-xs text-text-secondary'}`}>
          {formatCurrency(revenue)}
        </span>
        {isHardware && capex && (
          <span className="block text-2xs text-text-ghost opacity-50 leading-tight">
            {formatCurrency(capex)} ÷ {gpuLifeYears}yr
          </span>
        )}
      </td>

      {/* GP / yr */}
      <td className="py-2.5 px-3 text-right font-mono align-top pt-3">
        {gp != null
          ? <span className={`${level === 0 ? 'text-sm text-text' : 'text-xs text-text-secondary'}`}>{formatCurrency(gp)}</span>
          : <span className="text-text-ghost opacity-20 text-xs">—</span>}
      </td>

      {/* GM% */}
      <td className="py-2.5 px-3 text-right font-mono align-top pt-3">
        {gpMargin != null
          ? <span className={`${level === 0 ? 'text-sm' : 'text-xs'} text-text-muted`}>{formatPercent(gpMargin)}</span>
          : <span className="text-text-ghost opacity-20 text-xs">—</span>}
      </td>
    </tr>
  );
}

// ── Sub-section label ─────────────────────────────────────────────────────────
function SubLabel({ label }) {
  return (
    <tr>
      <td colSpan={5} className="pt-3 pb-0.5 px-3 pl-8">
        <p className="text-2xs uppercase tracking-[0.15em] text-text-ghost font-medium opacity-60">{label}</p>
      </td>
    </tr>
  );
}

export default function Module3({ onUpdate, module1Data, module2Data, modulesLinked }) {
  const [labGrossMargin, setLabGrossMargin]   = useState(58); // Jensen GTC 2026: ~$30B yield / GW at ~58% GM
  const [trainingSharePct, setTrainingSharePct] = useState(50); // % of 1 GW cluster used for training
  const [cloudGrossMargin, setCloudGrossMargin] = useState(35); // GPU cloud gross margin ~30-40% (Oracle guidance, SemiAnalysis)
  const [gpuLifeYears, setGpuLifeYears]       = useState(6);
  const [nvidiaGrossMargin, setNvidiaGrossMargin] = useState(72);
  const [hbmGrossMargin, setHbmGrossMargin]   = useState(52);
  const [tsmcGrossMargin, setTsmcGrossMargin] = useState(62);
  const [asmlGrossMargin, setAsmlGrossMargin] = useState(52);
  const [asmlToolLife, setAsmlToolLife]       = useState(15);
  const [showAdvanced, setShowAdvanced]       = useState(false);
  const [track1Open, setTrack1Open]           = useState(true);
  const [track2Open, setTrack2Open]           = useState(true);

  const calculations = useMemo(() => {
    // ── 1 GW cluster: split between inference and training ────────────────────
    const trainingShare  = trainingSharePct / 100;
    const inferenceShare = 1 - trainingShare;

    // Cloud revenue = what the cloud charges for 1 GW (anchor from M1 or default)
    const cloudRevenue = (modulesLinked && module1Data?.annualRevenue)
      ? module1Data.annualRevenue
      : 11e9;  // default $11B/yr (ties M01 at $30B capex, 4yr contract)
    const cloudCOGS = cloudRevenue * (1 - cloudGrossMargin / 100);
    const cloudGP   = cloudRevenue - cloudCOGS;

    // AI Lab: inference yield is IMPLIED by cloud cost + lab gross margin
    // inference rev = cloud cost / (1 - lab GM%) — better labs extract more from same compute
    const labInferenceRevenue = cloudRevenue * inferenceShare / (1 - labGrossMargin / 100);
    const labInferenceCOGS    = cloudRevenue * inferenceShare; // what the lab pays the cloud
    const labInferenceGP      = labInferenceRevenue - labInferenceCOGS;
    const labTrainingSpend    = cloudRevenue * trainingShare; // training portion of cloud bill (no revenue)
    const grossInferenceYield = cloudRevenue / (1 - labGrossMargin / 100); // full GW if 100% inference

    // ── Capex split ───────────────────────────────────────────────────────────
    const computeCapex = (modulesLinked && module1Data?.capexPerGW) ? module1Data.capexPerGW : 30e9;
    const infraCapex   = (modulesLinked && module2Data?.totalCapexPerGW) ? module2Data.totalCapexPerGW : 10e9;
    const totalCapex   = computeCapex + infraCapex;
    const capexSource  = modulesLinked ? 'linked' : 'default';

    // ── COMPUTE TRACK ─────────────────────────────────────────────────────────
    const NVIDIA_OF_COMPUTE = 0.80;
    const gpuCapexTotal     = computeCapex * NVIDIA_OF_COMPUTE;
    const otherComputeCapex = computeCapex * (1 - NVIDIA_OF_COMPUTE);
    const nvidiaRevenue     = gpuCapexTotal / gpuLifeYears;
    const otherComputeRev   = otherComputeCapex / gpuLifeYears;

    const nvidiaCOGS     = nvidiaRevenue * (1 - nvidiaGrossMargin / 100);
    const nvidiaGP       = nvidiaRevenue - nvidiaCOGS;
    const tsmcFromNvidia = nvidiaCOGS * 0.35;
    const hbmFromNvidia  = nvidiaCOGS * 0.40;

    const totalTsmcRevenue = tsmcFromNvidia;
    const tsmcGP           = totalTsmcRevenue * (tsmcGrossMargin / 100);
    // One-time capex: total wafer spend for this cluster's GPUs (annualized × life)
    const tsmcCapexForCluster = tsmcFromNvidia * gpuLifeYears;

    const totalMemoryRevenue = hbmFromNvidia;
    const memoryGP           = totalMemoryRevenue * (hbmGrossMargin / 100);
    // One-time capex: total HBM3e embedded in this cluster's GPUs (annualized × life)
    const hbmCapexForCluster = hbmFromNvidia * gpuLifeYears;

    const asmlCapexTotal = 1.2e9;                        // ~3.5 EUV tools × $350M (one-time TSMC purchase)
    const asmlRevenue    = asmlCapexTotal / asmlToolLife; // annualized over tool useful life
    const asmlGP         = asmlRevenue * (asmlGrossMargin / 100);

    // ── INFRA TRACK ───────────────────────────────────────────────────────────
    // DC Shell: lease revenue and NOI from M2 when linked, else sensible defaults
    const dcShellCapex    = infraCapex;                    // $10B/GW default or linked
    const dcShellCost     = modulesLinked && module2Data   // annual lease revenue
      ? module2Data.leaseRevenuePerGW : 1.5e9;            // $1.5B/yr default (ties M02)
    const dcShellGPMargin = modulesLinked && module2Data
      ? (module2Data.noiPerGW / module2Data.leaseRevenuePerGW) : 0.85;
    const dcShellGP       = dcShellCost * dcShellGPMargin;

    // Power: 1 GW × PUE × $/kWh × 8,760 hrs — real unit economics
    const pue             = 1.2;
    const powerCostKwh    = 0.05;                          // $/kWh grid cost
    const electricityCost = 1e6 * pue * powerCostKwh * 8760; // ~$526M/yr for 1 GW
    const powerInfraCost  = 0.5e9;                         // transformers, switchgear, UPS (~$0.5B/yr amortized)
    const powerInfraGP    = powerInfraCost * 0.30;

    // ── Summary ───────────────────────────────────────────────────────────────
    const layerData = [
      { layer: 'AI Lab (inference)',   revenue: labInferenceRevenue, gp: labInferenceGP,      capex: null },
      { layer: 'AI Lab (training)',    revenue: labTrainingSpend,    gp: 0,                   capex: null },
      { layer: 'Cloud / Hyperscaler', revenue: cloudRevenue,        gp: cloudGP,             capex: totalCapex },
      { layer: 'NVIDIA / GPU vendor', revenue: nvidiaRevenue,       gp: nvidiaGP,            capex: gpuCapexTotal },
      { layer: 'Other compute',        revenue: otherComputeRev,    gp: null,                capex: otherComputeCapex },
      { layer: 'HBM / Memory',         revenue: totalMemoryRevenue, gp: memoryGP,            capex: null },
      { layer: 'TSMC / Foundry',       revenue: totalTsmcRevenue,   gp: tsmcGP,              capex: null },
      { layer: 'ASML / Litho tools',   revenue: asmlRevenue,        gp: asmlGP,              capex: asmlCapexTotal },
      { layer: 'DC Shell + Cooling',   revenue: dcShellCost,        gp: dcShellGP,           capex: dcShellCapex },
      { layer: 'Power Infra',          revenue: powerInfraCost,     gp: powerInfraGP,        capex: null },
      { layer: 'Electricity',          revenue: electricityCost,    gp: 0,                   capex: null },
    ];

    const labGPLayers    = [labInferenceGP, cloudGP, nvidiaGP, memoryGP, tsmcGP, asmlGP, dcShellGP, powerInfraGP];
    const totalStackedGP = labGPLayers.reduce((s, v) => s + (v || 0), 0);
    const asmlLeverage   = labInferenceRevenue / asmlRevenue;
    const nvidiaGPShare  = totalStackedGP > 0 ? (nvidiaGP / totalStackedGP) * 100 : 0;
    const allGP = layerData.filter(l => l.gp > 0);
    const bottleneck = allGP.reduce((max, l) => l.gp > max.gp ? l : max, allGP[0] || layerData[0]);

    return {
      layerData, totalStackedGP, asmlLeverage, nvidiaGPShare,
      bottleneck: bottleneck.layer,
      labInferenceRevenue, labInferenceCOGS, labInferenceGP, labTrainingSpend, grossInferenceYield,
      cloudRevenue, cloudGP,
      computeCapex, infraCapex, totalCapex, capexSource,
      gpuCapexTotal, otherComputeCapex, otherComputeRev,
      nvidiaRevenue, nvidiaGP,
      totalMemoryRevenue, memoryGP, hbmCapexForCluster,
      totalTsmcRevenue, tsmcGP, tsmcCapexForCluster,
      asmlRevenue, asmlGP, asmlCapexTotal,
      dcShellCapex, dcShellCost, dcShellGP, dcShellGPMargin,
      powerInfraCost, electricityCost, powerInfraGP,
      trainingSharePct, inferenceShare,
    };
  }, [labGrossMargin, trainingSharePct, cloudGrossMargin,
      gpuLifeYears, nvidiaGrossMargin, hbmGrossMargin, tsmcGrossMargin, asmlGrossMargin, asmlToolLife,
      module1Data, module2Data, modulesLinked]);

  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  useEffect(() => { onUpdateRef.current?.(calculations); }, [calculations]);

  const c = calculations;

  return (
    <div className="px-8 py-10">
      <div className="mb-10">
        <p className="text-2xs uppercase tracking-[0.3em] text-text-ghost mb-2 font-mono">Module 03</p>
        <h2 className="text-2xl font-serif text-text tracking-tight">Margin Stacking Framework</h2>
        <p className="text-sm text-text-muted mt-1.5 max-w-xl">
          Full AI infrastructure value chain · two tracks: compute silicon and physical infrastructure
        </p>
        <p className="text-2xs text-text-ghost mt-1 font-mono">
          1 GW cluster · {c.trainingSharePct}% training / {Math.round(c.inferenceShare * 100)}% inference · implied yield {formatCurrency(c.grossInferenceYield)}/GW at {labGrossMargin}% lab GM
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* ── Sliders ── */}
        <div className="lg:col-span-3">
          <div className="sticky top-16 space-y-5 max-h-[calc(100vh-100px)] overflow-y-auto pr-2">
            <div>
              <p className="text-2xs uppercase tracking-[0.15em] text-text-ghost font-medium mb-3">AI Lab Economics</p>
              <SliderInput label="Lab gross margin" value={labGrossMargin} min={30} max={70} step={1} onChange={setLabGrossMargin} formatValue={(v) => `${v}%`} />
              <SliderInput label="Training share of cluster" value={trainingSharePct} min={0} max={80} step={5} onChange={setTrainingSharePct} formatValue={(v) => `${v}%`} />
              <div className="mt-2 space-y-0.5 text-2xs font-mono text-text-ghost">
                <p className={modulesLinked && module1Data ? 'text-emerald-500/70' : ''}>
                  Cloud cost = {formatCurrency(c.cloudRevenue)}/yr{modulesLinked && module1Data ? ' ← M01' : ''}
                </p>
                <p className="text-text-secondary">Implied yield = {formatCurrency(c.grossInferenceYield)}/GW</p>
                <p>Inference rev ({Math.round(c.inferenceShare*100)}%): {formatCurrency(c.labInferenceRevenue)}</p>
                <p>Training cost ({c.trainingSharePct}%): {formatCurrency(c.labTrainingSpend)}</p>
              </div>
            </div>

            <div className="h-px bg-bg-border" />

            <div>
              <p className="text-2xs uppercase tracking-[0.15em] text-text-ghost font-medium mb-1">Cloud / Hyperscaler</p>
              <SliderInput label="Cloud gross margin" value={cloudGrossMargin} min={25} max={45} step={1} onChange={setCloudGrossMargin} formatValue={(v) => `${v}%`} />
            </div>

            <div className="h-px bg-bg-border" />

            <div>
              <p className="text-2xs uppercase tracking-[0.15em] text-text-ghost font-medium mb-1">Hardware Life</p>
              <p className="text-2xs text-text-ghost mb-3 leading-relaxed">
                Hardware sold once. Revenue/yr = capex ÷ useful life.
              </p>
              <SliderInput label="GPU useful life" value={gpuLifeYears} min={4} max={8} step={1} onChange={setGpuLifeYears} formatValue={(v) => `${v}yr`} />
              <div className="mt-2 space-y-0.5">
                <p className="text-2xs font-mono text-text-ghost">Compute capex: {formatCurrency(c.computeCapex)}/GW</p>
                <p className="text-2xs font-mono text-text-ghost">Infra capex: {formatCurrency(c.infraCapex)}/GW</p>
                <p className="text-2xs font-mono text-text-ghost">NVIDIA: {formatCurrency(c.gpuCapexTotal)} ÷ {gpuLifeYears}yr</p>
                <p className="text-2xs font-mono text-text-ghost opacity-60">· {c.capexSource}</p>
              </div>
            </div>

            <div className="h-px bg-bg-border" />

            <button onClick={() => setShowAdvanced(v => !v)} className="flex items-center justify-between w-full group">
              <span className="text-2xs uppercase tracking-[0.15em] text-text-ghost font-medium group-hover:text-text-muted transition-colors">Vendor Margins</span>
              <span className="text-text-ghost text-xs transition-transform duration-200"
                    style={{ display: 'inline-block', transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
            </button>
            {showAdvanced && (
              <div className="space-y-0">
                <SliderInput label="NVIDIA gross margin" value={nvidiaGrossMargin} min={65} max={80} step={0.5} onChange={setNvidiaGrossMargin} formatValue={(v) => `${v}%`} />
                <SliderInput label="HBM/Memory gross margin" value={hbmGrossMargin} min={45} max={65} step={1} onChange={setHbmGrossMargin} formatValue={(v) => `${v}%`} />
                <SliderInput label="TSMC gross margin" value={tsmcGrossMargin} min={55} max={68} step={0.5} onChange={setTsmcGrossMargin} formatValue={(v) => `${v}%`} />
                <SliderInput label="ASML gross margin" value={asmlGrossMargin} min={45} max={58} step={1} onChange={setAsmlGrossMargin} formatValue={(v) => `${v}%`} />
                <SliderInput label="EUV tool useful life" value={asmlToolLife} min={10} max={25} step={1} onChange={setAsmlToolLife} formatValue={(v) => `${v}yr`} />
              </div>
            )}
          </div>
        </div>

        {/* ── Value chain ── */}
        <div className="lg:col-span-9 space-y-6">

          {/* Value chain table */}
          <div className="border border-bg-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-bg-border bg-bg-surface flex items-center justify-between">
              <div>
                <p className="text-2xs uppercase tracking-[0.15em] text-text-muted font-medium">Value Chain · per GW of compute</p>
                <p className="text-2xs text-text-ghost mt-0.5">
                  Two capex tracks: <span style={{ color: '#d97706' }}>Compute {formatCurrency(c.computeCapex)}</span> (Module 01) ·
                  <span className="ml-1" style={{ color: '#059669' }}>Infra {formatCurrency(c.infraCapex)}</span> (Module 02) ·
                  <span className="ml-1">Sub-rows flow through parent COGS, not additional Cloud spend</span>
                </p>
              </div>
              <button
                onClick={() => {
                  const header = 'Layer\tCapex/GW\tRevenue/yr\tGP/yr\tGM%\n';
                  const rows = c.layerData.map(l => {
                    const gm = l.revenue > 0 && l.gp != null ? (l.gp / l.revenue * 100).toFixed(1) + '%' : '—';
                    return `${l.layer}\t${l.capex != null ? formatCurrency(l.capex) : '—'}\t${formatCurrency(l.revenue)}\t${l.gp != null ? formatCurrency(l.gp) : '—'}\t${gm}`;
                  }).join('\n');
                  navigator.clipboard.writeText(header + rows);
                }}
                className="text-2xs text-text-ghost hover:text-text-secondary font-mono transition-colors shrink-0 ml-4"
              >Copy ↗</button>
            </div>

            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-bg-border">
                  <th className="text-left py-2 px-3 text-text-ghost font-medium">Layer</th>
                  <th className="text-right py-2 px-3 text-text-ghost font-medium font-mono whitespace-nowrap">Capex / GW</th>
                  <th className="text-right py-2 px-3 text-text-ghost font-medium font-mono whitespace-nowrap">Revenue / yr</th>
                  <th className="text-right py-2 px-3 text-text-ghost font-medium font-mono whitespace-nowrap">GP / yr</th>
                  <th className="text-right py-2 px-3 text-text-ghost font-medium font-mono">GM%</th>
                </tr>
              </thead>
              <tbody>

                {/* ── AI Lab ── */}
                <tr><td colSpan={5} className="pt-4 pb-1 px-3">
                  <p className="text-2xs uppercase tracking-[0.2em] text-text-ghost font-medium">
                    AI Lab · {Math.round(c.inferenceShare * 100)}% inference / {c.trainingSharePct}% training
                  </p>
                </td></tr>
                <VCRow level={0} label="Inference revenue" color="#6366f1"
                  capex={null} revenue={c.labInferenceRevenue} gp={c.labInferenceGP}
                  note={`Token sales · ${Math.round(c.inferenceShare * 100)}% of 1 GW cluster`} gpuLifeYears={gpuLifeYears} />
                <VCRow level={0} label="Training compute cost" color="#818cf8"
                  capex={null} revenue={c.labTrainingSpend} gp={null}
                  note={`R&D compute · ${c.trainingSharePct}% of cluster · included in cloud's ${formatCurrency(c.cloudRevenue)} bill`}
                  gpuLifeYears={gpuLifeYears} />

                {/* ── Cloud ── */}
                <tr><td colSpan={5} className="pt-4 pb-1 px-3">
                  <p className="text-2xs uppercase tracking-[0.2em] text-text-ghost font-medium">Cloud / Hyperscaler · full 1 GW cluster bill = {formatCurrency(c.cloudRevenue)}</p>
                </td></tr>
                <VCRow level={0} label="Cloud / Hyperscaler" color="#0ea5e9"
                  capex={c.totalCapex} revenue={c.cloudRevenue} gp={c.cloudGP}
                  note={`Full cluster compute bill · ${formatCurrency(c.computeCapex)} compute + ${formatCurrency(c.infraCapex)} infra capex`}
                  gpuLifeYears={gpuLifeYears} />

                {/* ── Track 1: Compute ── */}
                <tr><td colSpan={5} className="pt-5 pb-1 px-3">
                  <button onClick={() => setTrack1Open(!track1Open)} className="flex items-center gap-3 w-full text-left group">
                    <div className="flex items-center gap-1.5">
                      <svg className={`w-3 h-3 text-text-ghost transition-transform ${track1Open ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#d97706' }} />
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide group-hover:text-text transition-colors">Track 1 — Compute Silicon</span>
                    </div>
                    <span className="text-2xs font-mono text-text-ghost">{formatCurrency(c.computeCapex)} capex ({Math.round(c.computeCapex / c.totalCapex * 100)}% of total) · Module 01</span>
                  </button>
                </td></tr>

                {track1Open && (<>
                <VCRow level={1} label="NVIDIA GPU systems" color="#d97706"
                  typeBadge={`÷${gpuLifeYears}yr`}
                  capex={c.gpuCapexTotal} revenue={c.nvidiaRevenue} gp={c.nvidiaGP}
                  note="80% of compute capex · B200 NVL72 ~$4M/rack · HBM3e inside chip"
                  gpuLifeYears={gpuLifeYears} />

                <SubLabel label="NVIDIA supply chain (flows through NVIDIA COGS)" />
                <VCRow level={2} label="HBM3e / Memory vendors" color="#db2777"
                  typeBadge={`÷${gpuLifeYears}yr`}
                  capex={c.hbmCapexForCluster} revenue={c.totalMemoryRevenue} gp={c.memoryGP}
                  note="40% of NVIDIA COGS · SK Hynix, Micron, Samsung — embedded in B200"
                  gpuLifeYears={gpuLifeYears} />
                <VCRow level={2} label="TSMC / Foundry" color="#2563eb"
                  typeBadge={`÷${gpuLifeYears}yr`}
                  capex={c.tsmcCapexForCluster} revenue={c.totalTsmcRevenue} gp={c.tsmcGP}
                  note="35% of NVIDIA COGS → 3nm/5nm wafer fabrication"
                  gpuLifeYears={gpuLifeYears} />
                <VCRow level={2} label="ASML EUV tools" color="#7c3aed"
                  typeBadge={`÷${asmlToolLife}yr`}
                  capex={c.asmlCapexTotal} revenue={c.asmlRevenue} gp={c.asmlGP}
                  note={`~3.5 EUV tools × $350M = $1.2B capex ÷ ${asmlToolLife}yr life · ${c.asmlLeverage.toFixed(0)}× vs inference rev`}
                  gpuLifeYears={gpuLifeYears} />

                <VCRow level={1} label="Other compute" color="#64748b"
                  typeBadge={`÷${gpuLifeYears}yr`}
                  capex={c.otherComputeCapex} revenue={c.otherComputeRev} gp={null}
                  note="20% of compute capex · networking fabric, NVMe storage, CPU servers"
                  gpuLifeYears={gpuLifeYears} />
                </>)}

                {/* ── Track 2: Infra ── */}
                <tr><td colSpan={5} className="pt-5 pb-1 px-3">
                  <button onClick={() => setTrack2Open(!track2Open)} className="flex items-center gap-3 w-full text-left group">
                    <div className="flex items-center gap-1.5">
                      <svg className={`w-3 h-3 text-text-ghost transition-transform ${track2Open ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#059669' }} />
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide group-hover:text-text transition-colors">Track 2 — Physical Infrastructure</span>
                    </div>
                    <span className="text-2xs font-mono text-text-ghost">{formatCurrency(c.infraCapex)} capex ({Math.round(c.infraCapex / c.totalCapex * 100)}% of total) · Module 02</span>
                  </button>
                </td></tr>

                {track2Open && (<>
                <VCRow level={1} label="DC Shell + Cooling" color="#0891b2"
                  capex={c.dcShellCapex} revenue={c.dcShellCost}
                  gp={c.dcShellGP}
                  note={`${formatCurrency(c.infraCapex)} build cost · ${formatCurrency(c.dcShellCost)}/yr lease · ${Math.round(c.dcShellGPMargin * 100)}% NOI margin${modulesLinked && module2Data ? ' · M02' : ''}`}
                  gpuLifeYears={gpuLifeYears} />
                <VCRow level={1} label="Power infrastructure" color="#ea580c"
                  capex={null} revenue={c.powerInfraCost} gp={c.powerInfraGP}
                  note="Transformers, switchgear, UPS, generators (~$0.5B/yr amortized)"
                  gpuLifeYears={gpuLifeYears} />
                <VCRow level={1} label="Electricity (opex)" color="#78716c"
                  capex={null} revenue={c.electricityCost} gp={null}
                  note="1 GW × 1.2 PUE × $0.05/kWh × 8,760 hrs — pure opex"
                  gpuLifeYears={gpuLifeYears} />
                </>)}

                {/* ── Total ── */}
                <tr className="border-t-2 border-bg-border bg-bg-surface/50">
                  <td className="py-3 px-3 text-text text-sm font-semibold">Total stacked GP</td>
                  <td className="py-3 px-3 text-right font-mono text-text-ghost">—</td>
                  <td className="py-3 px-3 text-right font-mono text-text-ghost">—</td>
                  <td className="py-3 px-3 text-right font-mono text-text text-sm font-semibold">{formatCurrency(c.totalStackedGP)}</td>
                  <td className="py-3 px-3 text-right font-mono text-text-muted text-sm font-semibold">
                    {formatPercent((c.totalStackedGP / c.labInferenceRevenue) * 100)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* ── Supply Chain Flow ─────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-8 mt-8">
        <div className="border border-bg-border rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-bg-border bg-bg-surface/50">
            <p className="text-xs uppercase tracking-[0.15em] text-text-muted font-medium">Supply Chain Flow · per GW</p>
          </div>
          <div className="px-5 py-6">
            <svg viewBox="0 0 900 380" className="w-full" style={{ maxHeight: 380 }}>
              <defs>
                <marker id="arr" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-auto">
                  <path d="M 0 0 L 10 3.5 L 0 7 z" fill="rgba(255,255,255,0.3)" />
                </marker>
              </defs>

              {/* ── Track labels ── */}
              <text x="12" y="18" fontSize="9" fill="rgba(255,255,255,0.3)" fontWeight="600" letterSpacing="0.1em">TRACK 1 — COMPUTE</text>
              <text x="12" y="238" fontSize="9" fill="rgba(255,255,255,0.3)" fontWeight="600" letterSpacing="0.1em">TRACK 2 — INFRA</text>

              {/* ═══════ TRACK 1 ═══════ */}
              {/* ASML */}
              <rect x="20" y="34" width="130" height="58" rx="5" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <text x="85" y="54" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.7)" fontWeight="600">ASML</text>
              <text x="85" y="68" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)">EUV tools</text>
              <text x="85" y="82" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="monospace">{formatCurrency(c.asmlRevenue)}/yr</text>

              <line x1="150" y1="63" x2="178" y2="63" stroke="rgba(255,255,255,0.15)" strokeWidth="1" markerEnd="url(#arr)" />

              {/* TSMC */}
              <rect x="186" y="34" width="130" height="58" rx="5" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <text x="251" y="54" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.7)" fontWeight="600">TSMC</text>
              <text x="251" y="68" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)">foundry</text>
              <text x="251" y="82" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="monospace">{formatCurrency(c.totalTsmcRevenue)}/yr</text>

              <line x1="316" y1="63" x2="344" y2="63" stroke="rgba(255,255,255,0.15)" strokeWidth="1" markerEnd="url(#arr)" />

              {/* NVIDIA (with HBM inside) */}
              <rect x="352" y="28" width="140" height="76" rx="5" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
              <text x="422" y="48" textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.8)" fontWeight="700">NVIDIA</text>
              <text x="422" y="63" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)">GPU + HBM3e ({formatCurrency(c.totalMemoryRevenue)})</text>
              <text x="422" y="78" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="monospace">{formatCurrency(c.nvidiaRevenue)}/yr</text>
              <text x="422" y="93" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.25)">GP {formatCurrency(c.nvidiaGP)}</text>

              {/* Arrow NVIDIA → Cloud */}
              <line x1="492" y1="66" x2="538" y2="160" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" markerEnd="url(#arr)" />
              <text x="528" y="110" fontSize="8" fill="rgba(255,255,255,0.2)" transform="rotate(30, 528, 110)">compute capex</text>

              {/* ═══════ TRACK 2 ═══════ */}
              {/* Power Infra → feeds into DC Shell */}
              <rect x="20" y="254" width="130" height="58" rx="5" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <text x="85" y="274" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.7)" fontWeight="600">Power Infra</text>
              <text x="85" y="288" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)">switchgear, UPS</text>
              <text x="85" y="302" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="monospace">{formatCurrency(c.powerInfraCost)}/yr</text>

              <line x1="150" y1="283" x2="178" y2="283" stroke="rgba(255,255,255,0.15)" strokeWidth="1" markerEnd="url(#arr)" />

              {/* DC Shell */}
              <rect x="186" y="254" width="140" height="58" rx="5" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <text x="256" y="274" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.7)" fontWeight="600">DC Shell + Cooling</text>
              <text x="256" y="288" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)">{formatCurrency(c.infraCapex)} build</text>
              <text x="256" y="302" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="monospace">{formatCurrency(c.dcShellCost)}/yr lease</text>

              {/* Arrow DC Shell → Cloud (lease) */}
              <line x1="326" y1="270" x2="545" y2="195" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" markerEnd="url(#arr)" />
              <text x="420" y="225" fontSize="8" fill="rgba(255,255,255,0.2)" transform="rotate(-14, 420, 225)">lease</text>

              {/* Electricity → Cloud (opex, cloud pays utility) */}
              <rect x="370" y="330" width="140" height="44" rx="5" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 2" />
              <text x="440" y="350" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.5)" fontWeight="500">Electricity</text>
              <text x="440" y="364" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.35)" fontFamily="monospace">{formatCurrency(c.electricityCost)}/yr opex</text>

              <path d="M 510 352 Q 560 352 570 210" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 3" markerEnd="url(#arr)" />
              <text x="560" y="280" fontSize="8" fill="rgba(255,255,255,0.18)" transform="rotate(-80, 560, 280)">cloud pays</text>

              {/* ═══════ CLOUD (convergence) ═══════ */}
              <rect x="548" y="150" width="150" height="65" rx="6" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
              <text x="623" y="172" textAnchor="middle" fontSize="13" fill="rgba(255,255,255,0.85)" fontWeight="700">Cloud / Hyper</text>
              <text x="623" y="188" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)">GPU-as-a-Service</text>
              <text x="623" y="204" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.5)" fontFamily="monospace">{formatCurrency(c.cloudRevenue)}/yr · GP {formatCurrency(c.cloudGP)}</text>

              {/* Arrow Cloud → AI Lab */}
              <line x1="698" y1="182" x2="730" y2="182" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" markerEnd="url(#arr)" />

              {/* ═══════ AI LAB ═══════ */}
              <rect x="738" y="145" width="148" height="38" rx="5" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
              <text x="812" y="163" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.75)" fontWeight="600">Inference</text>
              <text x="812" y="176" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="monospace">{formatCurrency(c.labInferenceRevenue)}/yr</text>

              <rect x="738" y="190" width="148" height="38" rx="5" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <text x="812" y="208" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.55)" fontWeight="500">Training</text>
              <text x="812" y="221" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="monospace">{formatCurrency(c.labTrainingSpend)}/yr</text>

              {/* ── Summary ── */}
              <text x="888" y="18" textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.2)" fontFamily="monospace">
                {formatCurrency(c.totalCapex)} capex/GW · {formatCurrency(c.totalStackedGP)} stacked GP/yr
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
