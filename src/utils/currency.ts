export function formatPEN(amount: number, options?: { compact?: boolean }): string {
  if (options?.compact && amount >= 1000) {
    return `S/ ${(amount / 1000).toFixed(1)}K`;
  }
  return `S/ ${amount.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatUSDC(amount: number, decimals = 2): string {
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} USDC`;
}

export function formatUSD(amount: number): string {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function penToUsdc(pen: number, rate: number): number {
  if (!rate || rate <= 0) return 0;
  return pen / rate;
}

export function usdcToPen(usdc: number, rate: number): number {
  return usdc * rate;
}
