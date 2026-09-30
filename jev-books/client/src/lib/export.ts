import { BATCH_SIZE } from '@shared/constants';
import type {
  BenchmarkExport,
  ClassifiedBook,
  ComparisonReport,
  JevReport,
  LlmReport,
} from '@shared/types';
import type { BatchAttempt, Metrics } from './metrics';

/**
 * JEV / LLM agreement: the share of books classified by both systems with the
 * same category. This is agreement, not accuracy — the dataset has no
 * ground-truth categories.
 */
export function computeComparison(
  jev: readonly ClassifiedBook[] | null,
  llm: readonly ClassifiedBook[] | null,
): ComparisonReport | null {
  if (!jev || !llm || jev.length === 0 || llm.length === 0) return null;

  const llmByBook = new Map(llm.map((entry) => [entry.bookId, entry.category]));
  let comparedBooks = 0;
  let matching = 0;

  for (const entry of jev) {
    const other = llmByBook.get(entry.bookId);
    if (other === undefined) continue;
    comparedBooks += 1;
    if (other === entry.category) matching += 1;
  }

  if (comparedBooks === 0) return null;

  return { comparedBooks, agreementRate: matching / comparedBooks };
}

export interface ReportInput {
  attempts: readonly BatchAttempt[];
  metrics: Metrics;
  results: readonly ClassifiedBook[];
}

function baseReport(input: ReportInput) {
  const { attempts, metrics, results } = input;
  return {
    totalTimeMs: Math.round(metrics.totalTimeMs),
    averageBatchTimeMs: Math.round(metrics.averageBatchTimeMs),
    booksPerSecond: roundTo(metrics.booksPerSecond, 2),
    successfulBatches: metrics.successfulBatches,
    failedBatches: metrics.failedBatches,
    successfulBooks: metrics.successfulBooks,
    failedBooks: metrics.failedBooks,
    batches: attempts
      .filter((attempt) => attempt.timing !== null)
      .map((attempt) => attempt.timing as NonNullable<BatchAttempt['timing']>),
    errors: attempts
      .filter((attempt) => attempt.error !== null)
      .map((attempt) => attempt.error as NonNullable<BatchAttempt['error']>),
    results: [...results],
  };
}

export function buildJevReport(input: ReportInput, model: string): JevReport {
  return { system: 'jev', model, ...baseReport(input) };
}

export function buildLlmReport(
  input: ReportInput,
  provider: string,
  model: string,
): LlmReport {
  return { system: 'llm', provider, model, ...baseReport(input) };
}

export interface ExportInput {
  datasetName: string;
  totalBooks: number;
  categories: readonly string[];
  jev: JevReport | null;
  llm: LlmReport | null;
}

/** Build the downloadable benchmark document. Contains no credentials. */
export function buildExport(input: ExportInput): BenchmarkExport {
  return {
    generatedAt: new Date().toISOString(),
    dataset: {
      name: input.datasetName,
      totalBooks: input.totalBooks,
      batchSize: BATCH_SIZE,
    },
    categories: [...input.categories],
    jev: input.jev,
    llm: input.llm,
    comparison: computeComparison(input.jev?.results ?? null, input.llm?.results ?? null),
  };
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Save a JSON document to the user's machine. */
export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
