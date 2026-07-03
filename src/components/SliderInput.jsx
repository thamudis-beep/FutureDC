import React, { useState, useRef, useEffect } from 'react';

export default function SliderInput({ label, value, min, max, step, onChange, formatValue = null }) {
  const displayValue = formatValue ? formatValue(value) : String(value);
  const pct = ((value - min) / (max - min)) * 100;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  const startEditing = () => {
    setDraft(String(value));
    setEditing(true);
  };

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const parsed = parseFloat(draft);
    if (!isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      const snapped = Math.round(clamped / step) * step;
      const decimals = step < 1 ? String(step).split('.')[1]?.length || 1 : 0;
      onChange(parseFloat(snapped.toFixed(decimals)));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') setEditing(false);
  };

  return (
    <div className="mb-3.5 group">
      <div className="flex justify-between items-baseline mb-1.5">
        <label className="text-xs text-text-muted group-hover:text-text-secondary transition-colors">{label}</label>
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            className="text-xs font-mono font-semibold text-text tabular-nums bg-bg-surface border border-bg-border-light rounded px-1.5 py-0.5 w-20 text-right outline-none focus:border-text-muted"
          />
        ) : (
          <button
            onClick={startEditing}
            className="text-xs font-mono font-semibold text-text tabular-nums hover:bg-bg-surface px-1 py-0.5 rounded cursor-text transition-colors"
            title="Click to type a value"
          >
            {displayValue}
          </button>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider-track w-full rounded-full"
        style={{
          background: `linear-gradient(to right, rgb(var(--slider-fill)) ${pct}%, rgb(var(--slider-track)) ${pct}%)`,
        }}
      />
    </div>
  );
}
