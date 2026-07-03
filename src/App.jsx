import React, { useState, useCallback, useEffect } from 'react';
import Module1 from './modules/Module1';
import Module2 from './modules/Module2';
import Module3 from './modules/Module3';
import Module4 from './modules/Module4';
import Module5 from './modules/Module5';
import Module6 from './modules/Module6';
const TABS = [
  { id: 0, label: 'GPU Cloud', num: '01' },
  { id: 1, label: 'DC Shell + Power', num: '02' },
  { id: 2, label: 'Margin Stack', num: '03' },
  { id: 3, label: 'Market Map', num: '04' },
  { id: 4, label: 'Players', num: '05' },
  { id: 5, label: 'Wiki', num: '06' },
];

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [modulesLinked, setModulesLinked] = useState(false);
  const [module1Data, setModule1Data] = useState(null);
  const [module2Data, setModule2Data] = useState(null);
  const [module3Data, setModule3Data] = useState(null);

  // Dark mode — defaults to dark unless user has explicitly chosen light
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') !== 'light';
    }
    return true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const handleModule1Update = useCallback((data) => setModule1Data(data), []);
  const handleModule2Update = useCallback((data) => setModule2Data(data), []);
  const handleModule3Update = useCallback((data) => setModule3Data(data), []);

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-bg-border/50">
        <div className="max-w-[1440px] mx-auto px-8 pt-8 pb-5">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-serif text-text tracking-tight">
                AI Infrastructure Unit Economics
              </h1>
              <p className="text-xs text-text-muted mt-1.5">
                GPU cloud · data center · margin stack — per GW basis
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Dark mode toggle */}
              <button
                onClick={() => setDark(!dark)}
                className="w-8 h-8 flex items-center justify-center rounded-md text-text-muted hover:text-text border border-bg-border hover:border-bg-border-light transition-all"
                title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {dark ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              {/* Link modules toggle */}
              <button
                onClick={() => setModulesLinked(!modulesLinked)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  modulesLinked
                    ? 'text-text border border-text/20 bg-bg-surface'
                    : 'text-text-muted border border-bg-border hover:text-text-secondary'
                }`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {modulesLinked ? 'Linked' : 'Link'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="sticky top-0 z-20 bg-bg/90 backdrop-blur-sm border-b border-bg-border/50">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="flex items-center gap-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-3 text-xs font-medium transition-colors ${
                  activeTab === tab.id ? 'text-text' : 'text-text-ghost hover:text-text-muted'
                }`}
              >
                <span className={`mr-1.5 font-mono ${
                  activeTab === tab.id ? 'text-text' : 'text-text-ghost'
                }`}>
                  {tab.num}
                </span>
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-3 right-3 h-px bg-text" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-[1440px] mx-auto" key={activeTab}>
        {activeTab === 0 && <Module1 onUpdate={handleModule1Update} modulesLinked={modulesLinked} module2Data={module2Data} />}
        {activeTab === 1 && <Module2 onUpdate={handleModule2Update} modulesLinked={modulesLinked} />}
        {activeTab === 2 && <Module3 onUpdate={handleModule3Update} module1Data={module1Data} module2Data={module2Data} modulesLinked={modulesLinked} />}
        {activeTab === 3 && <Module4 />}
        {activeTab === 4 && <Module5 />}
        {activeTab === 5 && <Module6 />}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-bg-border/30">
        <div className="max-w-[1440px] mx-auto px-8 py-8">
          <div className="flex items-start justify-between mb-6">
            <p className="text-2xs text-text-ghost">Default assumptions calibrated from public filings and industry research</p>
            <p className="text-2xs text-text-ghost">
              SemiAnalysis · Dylan Patel · NVIDIA · TSMC · ASML · SK Hynix
            </p>
          </div>
          <div className="grid grid-cols-4 gap-6">
            <FooterSection title="GPU Cloud" items={['Capex: $30B/GW', 'Revenue: $11B/yr', 'Contract: 4yr', 'Prepayment: 20%', 'EBITDAM: 75%']} />
            <FooterSection title="DC Shell" items={['Capex: $10B/GW', 'Lease: $2.0B/yr', 'Duration: 15yr', 'NOI margin: 85%', 'PUE: 1.2']} />
            <FooterSection title="Margins" items={['NVIDIA: 72%', 'TSMC: 62%', 'ASML: 52%', 'HBM: 52%', 'ASML: $1.2B/GW']} />
            <FooterSection title="Reference" items={['H100 TCO: ~$1.40/hr', 'Spot: $2.00–2.40/hr', 'Memory: ~30% capex', '2026 capex: ~$600B+', 'GPU life: 5-7yr']} />
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterSection({ title, items }) {
  return (
    <div>
      <p className="text-2xs uppercase tracking-[0.1em] text-text-ghost font-medium mb-2">{title}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-2xs text-text-ghost font-mono">{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
