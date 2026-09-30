/**
 * Types shared by the browser client and the Express server.
 *
 * This module is type-only on purpose: it is imported with `import type` on both
 * sides, so nothing here exists at runtime and no build step is needed for it.
 */

/** A book as it matters to the benchmark: two source columns plus a stable id. */
export interface Book {
  /** Stable identifier, unique within a benchmark run (1-based position). */
  id: string;
  title: string;
  description: string;
}

/** Which classifier produced a result. */
export type SystemId = 'jev' | 'llm';

/** A single classification returned by a classifier. */
export interface Classification {
  bookId: string;
  category: string;
}

/** A classification joined back to the book it belongs to. */
export interface ClassifiedBook extends Classification {
  title: string;
  description: string;
}

/** Wall-clock timing for one batch, measured with `performance.now()`. */
export interface BatchTiming {
  batchNumber: number;
  /** Milliseconds between run start and the moment the batch request was sent. */
  startedAt: number;
  /** Milliseconds between run start and the moment the batch settled. */
  finishedAt: number;
  durationMs: number;
}

/** A batch that produced no usable result. */
export interface BatchError {
  batchNumber: number;
  message: string;
}

/** Aggregated benchmark result for one classifier. */
export interface SystemResults {
  system: SystemId;
  /** Sum of every batch duration in the run. Equals wall-clock time when there were no reruns. */
  totalTimeMs: number;
  averageBatchTimeMs: number;
  booksPerSecond: number;
  successfulBatches: number;
  failedBatches: number;
  successfulBooks: number;
  failedBooks: number;
  batches: BatchTiming[];
  errors: BatchError[];
  results: ClassifiedBook[];
}

export interface JevReport extends SystemResults {
  system: 'jev';
  model: string;
}

export interface LlmReport extends SystemResults {
  system: 'llm';
  provider: string;
  model: string;
}

/** The comparison between the two systems. Never called "accuracy". */
export interface ComparisonReport {
  /** Books where both systems classified successfully. */
  comparedBooks: number;
  /** matching classifications / comparedBooks. */
  agreementRate: number;
}

/** Shape of the downloadable benchmark JSON. Contains no credentials. */
export interface BenchmarkExport {
  generatedAt: string;
  dataset: {
    name: string;
    totalBooks: number;
    batchSize: number;
  };
  categories: string[];
  jev: JevReport | null;
  llm: LlmReport | null;
  comparison: ComparisonReport | null;
}

/* -------------------------------------------------------------------------- */
/* HTTP contract                                                              */
/* -------------------------------------------------------------------------- */

/** Credentials accepted by `POST /api/sessions`. Held in server memory only. */
export interface JevCredentials {
  token: string;
}

export interface LlmCredentials {
  providerId: string;
  model: string;
  apiKey: string;
  /** Only used by the `custom` provider. */
  baseUrl?: string;
}

export interface CreateSessionRequest {
  system: SystemId;
  jev?: JevCredentials;
  llm?: LlmCredentials;
}

export interface CreateSessionResponse {
  sessionId: string;
}

/** Body of `POST /api/sessions/:id/batch` — exactly one batch of books. */
export interface BatchRequest {
  books: Book[];
  categories: string[];
  batchNumber: number;
  totalBatches: number;
}

/** Body of a successful batch response. */
export interface BatchResponse {
  batchNumber: number;
  results: Classification[];
  /** Time the server spent talking to the upstream API, in milliseconds. */
  serverDurationMs: number;
  /** Model the server actually called, for the export. Never a credential. */
  model: string;
}

/** Error body returned by the API. Never contains credentials. */
export interface ApiErrorBody {
  error: string;
  /** Per-book or per-batch validation problems, when the failure was validation. */
  details?: string[];
}

/** Provider descriptor exposed to the UI by `GET /api/providers`. */
export interface LlmProviderInfo {
  id: string;
  label: string;
  defaultModel: string;
  models: string[];
  /** True when the provider needs a base URL typed in by the user. */
  requiresBaseUrl: boolean;
}
