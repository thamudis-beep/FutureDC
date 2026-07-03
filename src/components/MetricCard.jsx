import React from 'react';

export default function MetricCard({ label, value, subtitle = '' }) {
  return (
    <div className="border border-bg-border rounded-lg px-4 py-3.5">
      <div className="text-xs uppercase tracking-[0.08em] text-text-ghost mb-1.5 truncate">{label}</div>
      <div className="text-xl font-semibold font-mono text-text tabular-nums leading-tight truncate">
        {value}
      </div>
      {subtitle && (
        <div className="text-xs text-text-ghost mt-1">{subtitle}</div>
      )}
    </div>
  );
}
