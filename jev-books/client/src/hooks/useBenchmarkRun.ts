import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BATCH_SIZE } from '@shared/constants';
import { createBatches } from '@shared/batching';
import type { Book, ClassifiedBook, CreateSessionRequest } from '@shared/types';
import { ApiRequestError, api } from '../lib/api';
import {
  type BatchAttempt,
  type Metrics,
  computeMetrics,
  EMPTY_METRICS,
} from '../lib/metrics';

export type RunStatus = 'idle' | 'running' | 'finished';

export interface RunInput {
  /** The exact books to classify, in dataset order. */
  books: readonly Book[];
  categories: readonly string[];
  /** Credentials, sent once to register the server-side session. */
  credentials: CreateSessionRequest;
}

export interface BenchmarkRun {
  status: RunStatus;
  attempts: BatchAttempt[];
  results: ClassifiedBook[];
  metrics: Metrics;
  totalBatches: number;
  /** Batch currently in flight, 0 when nothing is running. */
  currentBatch: number;
  /** A run-level failure (for example the credentials were rejected). */
  error: string | null;
  /** Model the server reported for this run, when it has answered at least once. */
  model: string | null;
  failedBatches: BatchAttempt[];
  run: (input: RunInput) => void;
  rerunFailed: () => void;
  reset: () => void;
}

function describeError(error: unknown): string {
  if (error instanceof ApiRequestError) {
    return error.details.length > 0 ? `${error.message} ${error.details.join(' ')}` : error.message;
  }
  return error instanceof Error ? error.message : 'Unexpected error.';
}

function replaceAttempt(
  attempts: readonly BatchAttempt[],
  index: number,
  patch: Partial<BatchAttempt>,
): BatchAttempt[] {
  return attempts.map((attempt, position) => (position === index ? { ...attempt, ...patch } : attempt));
}

/**
 * Drives one classifier through a benchmark run.
 *
 * Books are sent in batches of exactly `BATCH_SIZE`, strictly sequentially and in
 * dataset order, so both classifiers see the same batches in the same order. A
 * failed batch is recorded as failed and the run continues; nothing is fabricated
 * to fill the gap.
 *
 * Credentials live in a ref for the duration of the run only — they are never
 * written to local storage and never rendered back to the user.
 */
export function useBenchmarkRun(): BenchmarkRun {
  const [attempts, setAttempts] = useState<BatchAttempt[]>([]);
  const [results, setResults] = useState<ClassifiedBook[]>([]);
  const [status, setStatus] = useState<RunStatus>('idle');
  const [currentBatch, setCurrentBatch] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);

  const attemptsRef = useRef<BatchAttempt[]>([]);
  const sessionRef = useRef<string | null>(null);
  const inputRef = useRef<RunInput | null>(null);
  const booksByIdRef = useRef<Map<string, Book>>(new Map());
  /** Origin for per-batch offsets: the start of the very first request. */
  const runStartRef = useRef<number | null>(null);
  /** Bumped on reset so an in-flight loop stops writing state. */
  const generationRef = useRef(0);
  const busyRef = useRef(false);

  useEffect(() => {
    attemptsRef.current = attempts;
  }, [attempts]);

  const execute = useCallback(
    async (
      sessionId: string,
      batches: readonly Book[][],
      indexes: readonly number[],
      generation: number,
    ): Promise<void> => {
      const input = inputRef.current;
      if (!input) return;

      if (runStartRef.current === null) {
        runStartRef.current = performance.now();
      }
      const origin = runStartRef.current;
      const totalBatches = batches.length;

      for (const index of indexes) {
        if (generation !== generationRef.current) return;
        const batch = batches[index];
        if (!batch) continue;
        const batchNumber = index + 1;

        setCurrentBatch(batchNumber);
        const startedAt = performance.now() - origin;

        try {
          const response = await api.classifyBatch(sessionId, {
            books: [...batch],
            categories: [...input.categories],
            batchNumber,
            totalBatches,
          });
          if (generation !== generationRef.current) return;

          if (response.model) setModel(response.model);

          const finishedAt = performance.now() - origin;
          setAttempts((previous) =>
            replaceAttempt(previous, index, {
              timing: {
                batchNumber,
                startedAt: round(startedAt),
                finishedAt: round(finishedAt),
                durationMs: round(finishedAt - startedAt),
              },
              error: null,
            }),
          );

          const classified: ClassifiedBook[] = response.results.map((result) => {
            const book = booksByIdRef.current.get(result.bookId);
            return {
              bookId: result.bookId,
              category: result.category,
              title: book?.title ?? '',
              description: book?.description ?? '',
            };
          });
          setResults((previous) => [...previous, ...classified]);
        } catch (caught) {
          if (generation !== generationRef.current) return;

          const finishedAt = performance.now() - origin;
          const message = describeError(caught);
          setAttempts((previous) =>
            replaceAttempt(previous, index, {
              timing: {
                batchNumber,
                startedAt: round(startedAt),
                finishedAt: round(finishedAt),
                durationMs: round(finishedAt - startedAt),
              },
              error: { batchNumber, message },
            }),
          );
        }
      }

      if (generation === generationRef.current) {
        setStatus('finished');
        setCurrentBatch(0);
      }
    },
    [],
  );

  const run = useCallback(
    (input: RunInput) => {
      if (busyRef.current) return;
      busyRef.current = true;
      const generation = generationRef.current + 1;
      generationRef.current = generation;

      void (async () => {
        // Starting over invalidates the previous session and its credentials.
        const previousSession = sessionRef.current;
        sessionRef.current = null;
        if (previousSession) {
          await api.deleteSession(previousSession).catch(() => undefined);
        }
        if (generation !== generationRef.current) return;

        inputRef.current = input;
        booksByIdRef.current = new Map(input.books.map((book) => [book.id, book]));
        runStartRef.current = null;

        const batches = createBatches(input.books, BATCH_SIZE);
        setAttempts(
          batches.map((batch, index) => ({
            batchNumber: index + 1,
            size: batch.length,
            timing: null,
            error: null,
          })),
        );
        setResults([]);
        setError(null);
        setModel(null);
        setCurrentBatch(0);
        setStatus('running');

        let sessionId: string;
        try {
          sessionId = await api.createSession(input.credentials);
        } catch (caught) {
          if (generation === generationRef.current) {
            setStatus('idle');
            setError(describeError(caught));
          }
          busyRef.current = false;
          return;
        }

        if (generation !== generationRef.current) {
          void api.deleteSession(sessionId).catch(() => undefined);
          return;
        }
        sessionRef.current = sessionId;

        try {
          await execute(sessionId, batches, batches.map((_, index) => index), generation);
        } finally {
          busyRef.current = false;
        }
      })();
    },
    [execute],
  );

  const rerunFailed = useCallback(() => {
    const sessionId = sessionRef.current;
    const input = inputRef.current;
    if (!sessionId || !input || busyRef.current) return;

    const failedIndexes = attemptsRef.current
      .filter((attempt) => attempt.error !== null)
      .map((attempt) => attempt.batchNumber - 1);
    if (failedIndexes.length === 0) return;

    busyRef.current = true;
    // Same generation: successful batches from the original run are kept.
    const generation = generationRef.current;

    // Clear the failed batches so progress reflects the retry.
    setAttempts((previous) =>
      previous.map((attempt, index) =>
        failedIndexes.includes(index) ? { ...attempt, timing: null, error: null } : attempt,
      ),
    );
    setStatus('running');

    const batches = createBatches(input.books, BATCH_SIZE);
    void execute(sessionId, batches, failedIndexes, generation).finally(() => {
      busyRef.current = false;
    });
  }, [execute]);

  const reset = useCallback(() => {
    generationRef.current += 1;
    busyRef.current = false;

    const sessionId = sessionRef.current;
    sessionRef.current = null;
    inputRef.current = null;
    runStartRef.current = null;
    if (sessionId) {
      void api.deleteSession(sessionId).catch(() => undefined);
    }

    setAttempts([]);
    setResults([]);
    setStatus('idle');
    setCurrentBatch(0);
    setError(null);
    setModel(null);
  }, []);

  // Drop the session (and the credentials held with it) when the page goes away.
  useEffect(() => {
    return () => {
      const sessionId = sessionRef.current;
      sessionRef.current = null;
      if (sessionId) {
        void api.deleteSession(sessionId).catch(() => undefined);
      }
    };
  }, []);

  const metrics = useMemo(
    () => (attempts.length === 0 ? EMPTY_METRICS : computeMetrics(attempts, results.length)),
    [attempts, results.length],
  );

  const failedBatches = useMemo(
    () => attempts.filter((attempt) => attempt.error !== null),
    [attempts],
  );

  return {
    status,
    attempts,
    results,
    metrics,
    totalBatches: attempts.length,
    currentBatch,
    error,
    model,
    failedBatches,
    run,
    rerunFailed,
    reset,
  };
}

function round(value: number): number {
  return Math.round(value);
}
