import type { BatchError, BatchTiming } from '@shared/types';

/**
 * One batch's lifecycle. A batch that failed keeps its error and is never
 * fabricated into a result.
 */
export interface BatchAttempt {
  batchNumber: number;
  /** Number of books in this batch. */
  size: number;
  /** Present once the batch has settled; null while it is still running. */
  timing: BatchTiming | null;
  error: BatchError | null;
}

export interface Metrics {
  /** Sum of every settled batch duration. Wall-clock time when nothing was rerun. */
  totalTimeMs: number;
  /** totalTimeMs / successfulBatches, as specified. */
  averageBatchTimeMs: number;
  booksPerSecond: number;
  successfulBatches: number;
  failedBatches: number;
  successfulBooks: number;
  failedBooks: number;
}

export const EMPTY_METRICS: Metrics = {
  totalTimeMs: 0,
  averageBatchTimeMs: 0,
  booksPerSecond: 0,
  successfulBatches: 0,
  failedBatches: 0,
  successfulBooks: 0,
  failedBooks: 0,
};

/**
 * Metrics for one classifier.
 *
 * Failures are counted honestly: a failed batch keeps the wall-clock time it
 * burned and its books stay in `failedBooks`, so they are never reported as
 * successes. The average batch time follows the specified formula
 * `totalTime / numberOfSuccessfulBatches`.
 */
export function computeMetrics(attempts: readonly BatchAttempt[], successfulBooks: number): Metrics {
  let totalTimeMs = 0;
  let successfulBatches = 0;
  let failedBatches = 0;
  let failedBooks = 0;

  for (const attempt of attempts) {
    if (attempt.timing) totalTimeMs += attempt.timing.durationMs;
    if (attempt.error) {
      failedBatches += 1;
      failedBooks += attempt.size;
    } else if (attempt.timing) {
      successfulBatches += 1;
    }
  }

  const averageBatchTimeMs = successfulBatches > 0 ? totalTimeMs / successfulBatches : 0;
  const booksPerSecond = totalTimeMs > 0 ? successfulBooks / (totalTimeMs / 1000) : 0;

  return {
    totalTimeMs,
    averageBatchTimeMs,
    booksPerSecond,
    successfulBatches,
    failedBatches,
    successfulBooks,
    failedBooks,
  };
}

/** Fraction of batches that have settled, for the progress bar. */
export function progress(attempts: readonly BatchAttempt[]): number {
  if (attempts.length === 0) return 0;
  const settled = attempts.filter((attempt) => attempt.timing !== null).length;
  return settled / attempts.length;
}
