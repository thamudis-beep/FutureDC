// Financial calculation utilities

export function calculateIRR(cashFlows, initialInvestment) {
  // IRR via bisection method — more robust than Newton-Raphson for edge cases
  if (!cashFlows.length || initialInvestment <= 0) return 0;
  
  let lo = -0.5;
  let hi = 5.0; // 500% upper bound
  const maxIterations = 200;
  const tolerance = 1e-7;

  // Check if IRR is even possible (sum of CFs > investment)
  const totalCF = cashFlows.reduce((s, c) => s + c, 0);
  if (totalCF <= 0) return -100;

  for (let i = 0; i < maxIterations; i++) {
    const mid = (lo + hi) / 2;
    let npv = -initialInvestment;

    for (let y = 0; y < cashFlows.length; y++) {
      npv += cashFlows[y] / Math.pow(1 + mid, y + 1);
    }

    if (Math.abs(npv) < tolerance * initialInvestment) {
      return mid * 100;
    }

    if (npv > 0) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return ((lo + hi) / 2) * 100;
}

export function calculateNPV(cashFlows, initialInvestment, wacc) {
  if (!cashFlows.length || isNaN(wacc)) return 0;
  let npv = -initialInvestment;
  for (let y = 0; y < cashFlows.length; y++) {
    npv += cashFlows[y] / Math.pow(1 + wacc, y + 1);
  }
  return npv;
}

export function calculatePayback(cashFlows, initialInvestment) {
  if (!cashFlows.length || initialInvestment <= 0) return Infinity;
  let cumulative = 0;
  for (let i = 0; i < cashFlows.length; i++) {
    const prev = cumulative;
    cumulative += cashFlows[i];
    if (cumulative >= initialInvestment) {
      // Linear interpolation within the year
      const remaining = initialInvestment - prev;
      const fraction = remaining / cashFlows[i];
      return i + fraction;
    }
  }
  return cashFlows.length; // Never pays back within the period
}

export function formatCurrency(value, decimals = 1) {
  if (value == null || isNaN(value)) return '$—';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1e9) {
    return `${sign}$${(abs / 1e9).toFixed(decimals)}B`;
  } else if (abs >= 1e6) {
    return `${sign}$${(abs / 1e6).toFixed(decimals)}M`;
  } else if (abs >= 1e3) {
    return `${sign}$${(abs / 1e3).toFixed(decimals)}K`;
  }
  return `${sign}$${abs.toFixed(decimals)}`;
}

export function formatPercent(value, decimals = 1) {
  if (value == null || isNaN(value) || !isFinite(value)) return '—%';
  return `${value.toFixed(decimals)}%`;
}

export function formatYears(value, decimals = 1) {
  if (value == null || isNaN(value) || !isFinite(value)) return '—';
  return `${value.toFixed(decimals)}yr`;
}
