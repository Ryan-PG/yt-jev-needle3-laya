/** Formatting helpers for the dashboard. */

export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '—';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatThroughput(booksPerSecond: number): string {
  if (!Number.isFinite(booksPerSecond) || booksPerSecond <= 0) return '—';
  return `${booksPerSecond.toFixed(1)}/s`;
}

export function formatPercent(rate: number): string {
  if (!Number.isFinite(rate)) return '—';
  return `${(rate * 100).toFixed(1)}%`;
}

export function formatCount(value: number): string {
  return value.toLocaleString('en-US');
}
