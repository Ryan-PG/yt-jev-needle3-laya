import { performance } from 'node:perf_hooks';
import { config } from '../config';
import type { Book, Classification } from '../../../shared/types';

/**
 * JEV client — TypeSafe "System One" decision model, Choice primitive.
 *
 * Endpoint, auth, request and response shapes follow the official reference at
 * https://docs.typesafe.ai/api:
 *
 *   POST {base}/systemone
 *   Authorization: Bearer <API_KEY>
 *
 *   {
 *     "model": "jev-latest",
 *     "state": <text | structured data>,
 *     "questions": {
 *       "<key>": { "type": "choice", "instructions": <string|object>, "criteria": { "<option>": <rubric|null> } }
 *     }
 *   }
 *
 *   {
 *     "model": "jev-1.13.0",
 *     "answers": { "<key>": { "type": "choice", "choice": "<option>", "probabilities": {...}, "confidence": 0.81 } },
 *     "usage": { "input_tokens": 318, "output_tokens": 34 }
 *   }
 *
 * One batch of books becomes one request with one Choice question per book, so a
 * request never carries more than the batch size and never fewer than two books.
 * Option count per question equals the configured category count, which the API
 * caps at 255 (enforced in `shared/constants.ts`).
 */

/** A failure that should be shown to the user as a failed batch. */
export class JevError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'JevError';
  }
}

interface JevChoiceQuestion {
  type: 'choice';
  instructions: { task: string; book: { id: string; title: string; description: string } };
  criteria: Record<string, null>;
}

interface JevRequestBody {
  model: string;
  state: string;
  questions: Record<string, JevChoiceQuestion>;
}

interface JevChoiceAnswer {
  type?: string;
  choice?: unknown;
  probabilities?: unknown;
  confidence?: unknown;
}

interface JevResponseBody {
  model?: unknown;
  answers?: unknown;
}

/** Question key for a book. Keys must be unique within a request. */
function questionKey(bookId: string): string {
  return `book_${bookId}`;
}

/**
 * Build the System One request for one batch of books.
 *
 * Each book gets its own Choice question whose `instructions` object carries the
 * question plus the referenced book (addressed as `book` in backticks, per the
 * documented instructions-object form), and whose `criteria` keys are exactly the
 * configured categories.
 */
export function buildJevRequestBody(
  books: readonly Book[],
  categories: readonly string[],
  batchNumber: number,
  totalBatches: number,
): JevRequestBody {
  const criteria: Record<string, null> = {};
  for (const category of categories) {
    criteria[category] = null;
  }

  const questions: Record<string, JevChoiceQuestion> = {};
  for (const book of books) {
    questions[questionKey(book.id)] = {
      type: 'choice',
      instructions: {
        task:
          'Classify the book in `book` into exactly one of the categories offered as options. ' +
          'Use the title and the description together and choose the single best fitting category.',
        book: { id: book.id, title: book.title, description: book.description },
      },
      criteria,
    };
  }

  return {
    model: config.jev.model,
    state:
      `Benchmark batch ${batchNumber} of ${totalBatches}: ${books.length} books to classify. ` +
      'Every question asks for the category of exactly one book, referenced as `book` in its instructions. ' +
      'Answer every question.',
    questions,
  };
}

function describeHttpFailure(status: number, body: string): string {
  const detail = body.trim().slice(0, 400);
  if (status === 401 || status === 403) {
    return `JEV rejected the API token (HTTP ${status}). Check the token and try again.`;
  }
  if (status === 422) {
    return `JEV rejected the request as invalid (HTTP 422). ${detail}`;
  }
  if (status === 429) {
    return 'JEV rate-limited the request (HTTP 429). Wait a moment before rerunning this batch.';
  }
  if (status === 529) {
    return 'JEV is overloaded (HTTP 529). Wait a moment before rerunning this batch.';
  }
  return `JEV request failed (HTTP ${status}). ${detail}`;
}

/**
 * Classify one batch of books with JEV.
 *
 * Returns raw classifications; validation against the batch is the caller's job
 * so that JEV and the LLM are held to identical rules.
 */
export async function classifyBatchWithJev(
  token: string,
  books: readonly Book[],
  categories: readonly string[],
  batchNumber: number,
  totalBatches: number,
): Promise<{ classifications: Classification[]; serverDurationMs: number }> {
  const url = `${config.jev.baseUrl.replace(/\/+$/, '')}/systemone`;
  const startedAt = performance.now();

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildJevRequestBody(books, categories, batchNumber, totalBatches)),
      signal: AbortSignal.timeout(config.jev.timeoutMs),
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'unknown error';
    throw new JevError(`Could not reach the JEV API at ${url}: ${reason}`);
  }

  const serverDurationMs = performance.now() - startedAt;

  if (!response.ok) {
    // Read the body for diagnostics but never echo request headers or the token.
    const body = await response.text().catch(() => '');
    throw new JevError(describeHttpFailure(response.status, body), response.status);
  }

  let payload: JevResponseBody;
  try {
    payload = (await response.json()) as JevResponseBody;
  } catch {
    throw new JevError('JEV returned a response that was not valid JSON.');
  }

  if (!payload.answers || typeof payload.answers !== 'object') {
    throw new JevError('JEV response did not contain an "answers" object.');
  }
  const answers = payload.answers as Record<string, JevChoiceAnswer>;

  // A book with no usable answer is simply left out here. `validateClassifications`
  // then reports it as "not classified", so a partial response fails the batch
  // through exactly the same rules as the LLM rather than being papered over.
  const classifications: Classification[] = [];
  for (const book of books) {
    const answer = answers[questionKey(book.id)];
    if (!answer) continue;
    if (typeof answer.choice !== 'string' || answer.choice.trim() === '') continue;
    classifications.push({ bookId: book.id, category: answer.choice });
  }

  return { classifications, serverDurationMs };
}
