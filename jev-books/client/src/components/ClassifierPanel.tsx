import type { ReactNode } from 'react';
import type { BenchmarkRun } from '../hooks/useBenchmarkRun';
import { Button, Notice, Section } from './ui';
import { formatCount, formatDuration } from '../lib/format';

interface ClassifierPanelProps {
  title: string;
  description: string;
  /** Credential fields for this classifier. */
  children: ReactNode;
  runLabel: string;
  onRun: () => void;
  canRun: boolean;
  /** Why the run button is disabled, shown as a hint. */
  blockedReason: string | null;
  runState: BenchmarkRun;
}

function ProgressBar({ value }: { value: number }) {
  const percent = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-slate-900 transition-[width] duration-300 ease-out dark:bg-slate-100"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export function ClassifierPanel({
  title,
  description,
  children,
  runLabel,
  onRun,
  canRun,
  blockedReason,
  runState,
}: ClassifierPanelProps) {
  const { status, attempts, metrics, totalBatches, currentBatch, error, failedBatches } = runState;

  const settled = attempts.filter((attempt) => attempt.timing !== null).length;
  const running = status === 'running';
  const finished = status === 'finished';

  const headlineBatch = running ? currentBatch : finished ? totalBatches : 0;
  const showProgress = totalBatches > 0 && status !== 'idle';

  return (
    <Section
      title={title}
      description={description}
      actions={
        <div className="flex items-center gap-2">
          {failedBatches.length > 0 && !running ? (
            <Button variant="secondary" onClick={runState.rerunFailed} disabled={!canRun}>
              Rerun failed ({failedBatches.length})
            </Button>
          ) : null}
          {status !== 'idle' ? (
            <Button variant="ghost" onClick={runState.reset} disabled={running}>
              Clear
            </Button>
          ) : null}
          <Button onClick={onRun} disabled={!canRun || running}>
            {running ? 'Running…' : runLabel}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {children}

        {blockedReason ? <Notice tone="info">{blockedReason}</Notice> : null}
        {error ? <Notice tone="error">{error}</Notice> : null}

        {showProgress ? (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium text-slate-900 dark:text-slate-100">
                Batch {headlineBatch} / {totalBatches}
              </span>
              <span className="tabular-nums text-slate-500 dark:text-slate-400">
                {Math.round((settled / totalBatches) * 100)}%
              </span>
            </div>
            <ProgressBar value={settled / totalBatches} />

            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
              <span>
                Time:{' '}
                <span className="tabular-nums text-slate-900 dark:text-slate-100">
                  {formatDuration(metrics.totalTimeMs)}
                </span>
              </span>
              <span>
                Books:{' '}
                <span className="tabular-nums text-slate-900 dark:text-slate-100">
                  {formatCount(metrics.successfulBooks)}
                </span>
                {metrics.failedBooks > 0 ? (
                  <span className="text-red-700 dark:text-red-400">
                    {' '}
                    · {formatCount(metrics.failedBooks)} failed
                  </span>
                ) : null}
              </span>
              {metrics.failedBatches > 0 ? (
                <span className="text-red-700 dark:text-red-400">
                  {formatCount(metrics.failedBatches)} failed batch
                  {metrics.failedBatches === 1 ? '' : 'es'}
                </span>
              ) : null}
            </div>

            {failedBatches.length > 0 ? (
              <ul className="space-y-1.5">
                {failedBatches.map((attempt) => (
                  <li
                    key={attempt.batchNumber}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
                  >
                    <span className="font-medium">Batch {attempt.batchNumber} failed.</span>{' '}
                    {attempt.error?.message}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </Section>
  );
}
