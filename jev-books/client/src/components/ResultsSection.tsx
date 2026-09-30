import type { ReactNode } from 'react';
import type { ComparisonReport } from '@shared/types';
import type { Metrics } from '../lib/metrics';
import { Button, Notice, Section } from './ui';
import { formatCount, formatDuration, formatPercent, formatThroughput } from '../lib/format';

interface ColumnSummary {
  metrics: Metrics;
  hasRun: boolean;
  subtitle: string;
}

interface ResultsSectionProps {
  jev: ColumnSummary;
  llm: ColumnSummary;
  comparison: ComparisonReport | null;
  onDownload: () => void;
  canDownload: boolean;
}

function Value({ children }: { children: ReactNode }) {
  return <span className="tabular-nums text-slate-900 dark:text-slate-100">{children}</span>;
}

function Cell({ column, render }: { column: ColumnSummary; render: (metrics: Metrics) => ReactNode }) {
  if (!column.hasRun) return <span className="text-slate-400 dark:text-slate-600">—</span>;
  return <>{render(column.metrics)}</>;
}

export function ResultsSection({ jev, llm, comparison, onDownload, canDownload }: ResultsSectionProps) {
  const hasAnyRun = jev.hasRun || llm.hasRun;

  const rows: Array<{ label: string; render: (metrics: Metrics) => ReactNode }> = [
    { label: 'Total time', render: (m) => <Value>{formatDuration(m.totalTimeMs)}</Value> },
    { label: 'Avg batch', render: (m) => <Value>{formatDuration(m.averageBatchTimeMs)}</Value> },
    { label: 'Throughput', render: (m) => <Value>{formatThroughput(m.booksPerSecond)}</Value> },
    {
      label: 'Batches',
      render: (m) => (
        <Value>
          {formatCount(m.successfulBatches)} ok
          {m.failedBatches > 0 ? (
            <span className="text-red-700 dark:text-red-400">
              {' '}
              · {formatCount(m.failedBatches)} failed
            </span>
          ) : null}
        </Value>
      ),
    },
    {
      label: 'Books',
      render: (m) => (
        <Value>
          {formatCount(m.successfulBooks)}
          {m.failedBooks > 0 ? (
            <span className="text-red-700 dark:text-red-400">
              {' '}
              · {formatCount(m.failedBooks)} failed
            </span>
          ) : null}
        </Value>
      ),
    },
  ];

  return (
    <Section
      title="Results"
      description="Agreement is the share of books both systems classified the same way. It is not accuracy: the dataset has no ground-truth categories."
      actions={
        <Button variant="secondary" onClick={onDownload} disabled={!canDownload}>
          Download JSON
        </Button>
      }
    >
      {!hasAnyRun ? (
        <Notice tone="info">Run JEV or the LLM to see results here.</Notice>
      ) : (
        <div className="space-y-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                  <th className="py-2 pr-4 font-medium text-slate-500 dark:text-slate-400">Metric</th>
                  <th className="py-2 pr-4 font-medium text-slate-900 dark:text-slate-100">
                    JEV
                    <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">
                      {jev.subtitle}
                    </span>
                  </th>
                  <th className="py-2 font-medium text-slate-900 dark:text-slate-100">
                    LLM
                    <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">
                      {llm.subtitle}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-slate-100 dark:border-slate-800/60">
                    <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-400">{row.label}</td>
                    <td className="py-2.5 pr-4">
                      <Cell column={jev} render={row.render} />
                    </td>
                    <td className="py-2.5">
                      <Cell column={llm} render={row.render} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                JEV / LLM Agreement
              </span>
              <span className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                {comparison ? formatPercent(comparison.agreementRate) : '—'}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {comparison
                ? `${formatCount(comparison.comparedBooks)} books classified by both systems.`
                : 'Run both systems on the same books to compare them.'}
            </p>
          </div>
        </div>
      )}
    </Section>
  );
}
