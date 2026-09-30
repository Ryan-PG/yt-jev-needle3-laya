import { performance } from 'node:perf_hooks';
import { config } from '../config';
import type { Book, Classification, LlmProviderInfo } from '../../../shared/types';

/**
 * LLM competition client.
 *
 * Every provider here speaks the OpenAI-compatible Chat Completions API, so a new
 * provider is a new entry in `LLM_PROVIDERS` — no other code changes. The batch
 * prompt and the response parsing are provider-independent.
 *
 * The LLM receives exactly the same batches as JEV: same books, same ids, same
 * titles, same descriptions, same categories, same order.
 */

export interface LlmProviderDefinition extends LlmProviderInfo {
  /** OpenAI-compatible base URL, without a trailing slash. */
  baseUrl: string;
  /**
   * Whether the provider accepts `response_format: { type: "json_object" }`.
   * Turn this off for providers that reject unknown parameters.
   */
  supportsJsonMode: boolean;
}

export const LLM_PROVIDERS: readonly LlmProviderDefinition[] = [
  {
    id: 'openai',
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-5-mini',
    models: ['gpt-5-mini', 'gpt-5', 'gpt-4.1-mini', 'gpt-4o-mini'],
    supportsJsonMode: true,
    requiresBaseUrl: false,
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-4o-mini',
    models: ['openai/gpt-4o-mini', 'openai/gpt-4.1-mini', 'anthropic/claude-sonnet-4.5', 'google/gemini-2.5-flash'],
    supportsJsonMode: true,
    requiresBaseUrl: false,
  },
  {
    id: 'groq',
    label: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
    supportsJsonMode: true,
    requiresBaseUrl: false,
  },
  {
    id: 'together',
    label: 'Together AI',
    baseUrl: 'https://api.together.xyz/v1',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    models: ['meta-llama/Llama-3.3-70B-Instruct-Turbo', 'Qwen/Qwen2.5-72B-Instruct-Turbo'],
    supportsJsonMode: true,
    requiresBaseUrl: false,
  },
  {
    id: 'custom',
    label: 'Custom (OpenAI-compatible)',
    baseUrl: '',
    defaultModel: '',
    models: [],
    supportsJsonMode: false,
    requiresBaseUrl: true,
  },
];

/** A failure that should be shown to the user as a failed batch. */
export class LlmError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'LlmError';
  }
}

export function findProvider(providerId: string): LlmProviderDefinition | undefined {
  return LLM_PROVIDERS.find((provider) => provider.id === providerId);
}

export function listProviders(): LlmProviderInfo[] {
  return LLM_PROVIDERS.map((provider) => ({
    id: provider.id,
    label: provider.label,
    defaultModel: provider.defaultModel,
    models: provider.models,
    requiresBaseUrl: provider.requiresBaseUrl,
  }));
}

const SYSTEM_PROMPT =
  'You classify books into a fixed set of categories. ' +
  'Reply with JSON only: no prose, no markdown, no code fences.';

/**
 * Build the user message for one batch. The payload is explicit about the ids so
 * the response can be matched back to books without relying on ordering or titles.
 */
export function buildLlmPrompt(
  books: readonly Book[],
  categories: readonly string[],
  batchNumber: number,
  totalBatches: number,
): string {
  const payload = {
    task: 'Assign exactly one category to every book.',
    batchNumber,
    totalBatches,
    categories,
    rules: [
      'Return exactly one category for every book id listed below.',
      'Each category must be copied exactly from the categories list.',
      'Classify every book, including books whose description is short or unclear.',
      'Do not add books that are not listed. Do not skip books.',
    ],
    responseFormat: {
      classifications: [{ bookId: 'string, copied from the book', category: 'string, from categories' }],
    },
    books: books.map((book) => ({
      bookId: book.id,
      title: book.title,
      description: book.description,
    })),
  };

  return JSON.stringify(payload, null, 2);
}

/** Pull a JSON object out of model output that may be fenced or prefixed. */
function extractJson(content: string): unknown {
  const trimmed = content.trim();
  const withoutFences = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  const candidates = [withoutFences];
  const firstBrace = withoutFences.indexOf('{');
  const lastBrace = withoutFences.lastIndexOf('}');
  if (firstBrace > 0 && lastBrace > firstBrace) {
    candidates.push(withoutFences.slice(firstBrace, lastBrace + 1));
  }

  let lastError: unknown;
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as unknown;
    } catch (error) {
      lastError = error;
    }
  }
  throw new LlmError(
    `Could not parse the model response as JSON: ${lastError instanceof Error ? lastError.message : 'unknown error'}`,
  );
}

/** Accept `{ classifications: [...] }`, `{ results: [...] }`, or a bare array. */
function readClassifications(parsed: unknown): Classification[] {
  const rawList = Array.isArray(parsed)
    ? parsed
    : typeof parsed === 'object' && parsed !== null
      ? ((parsed as Record<string, unknown>).classifications ?? (parsed as Record<string, unknown>).results)
      : undefined;

  if (!Array.isArray(rawList)) {
    throw new LlmError('Model response did not contain a "classifications" array.');
  }

  const classifications: Classification[] = [];
  for (const item of rawList) {
    if (typeof item !== 'object' || item === null) continue;
    const record = item as Record<string, unknown>;
    const bookId = record.bookId ?? record.book_id ?? record.id;
    const category = record.category ?? record.label;
    if (typeof bookId !== 'string' && typeof bookId !== 'number') continue;
    if (typeof category !== 'string') continue;
    classifications.push({ bookId: String(bookId), category });
  }
  return classifications;
}

function describeHttpFailure(status: number, body: string): string {
  const detail = body.trim().slice(0, 400);
  if (status === 401 || status === 403) {
    return `The LLM provider rejected the API key (HTTP ${status}). Check the key and try again.`;
  }
  if (status === 404) {
    return `The LLM provider returned 404 — check the base URL and model name. ${detail}`;
  }
  if (status === 429) {
    return 'The LLM provider rate-limited the request (HTTP 429). Wait a moment before rerunning this batch.';
  }
  return `LLM request failed (HTTP ${status}). ${detail}`;
}

export interface LlmCallOptions {
  providerId: string;
  model: string;
  apiKey: string;
  baseUrl?: string;
}

/**
 * Classify one batch of books with an OpenAI-compatible chat model.
 *
 * Returns raw classifications; validation against the batch is the caller's job
 * so that JEV and the LLM are held to identical rules.
 */
export async function classifyBatchWithLlm(
  options: LlmCallOptions,
  books: readonly Book[],
  categories: readonly string[],
  batchNumber: number,
  totalBatches: number,
): Promise<{ classifications: Classification[]; serverDurationMs: number }> {
  const provider = findProvider(options.providerId);
  const baseUrl = (options.baseUrl?.trim() || provider?.baseUrl || '').replace(/\/+$/, '');
  if (!baseUrl) {
    throw new LlmError(`No base URL configured for provider "${options.providerId}".`);
  }

  const url = `${baseUrl}/chat/completions`;
  const useJsonMode = provider?.supportsJsonMode ?? false;

  const body: Record<string, unknown> = {
    model: options.model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildLlmPrompt(books, categories, batchNumber, totalBatches) },
    ],
  };
  if (useJsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const startedAt = performance.now();

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(config.llm.timeoutMs),
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'unknown error';
    throw new LlmError(`Could not reach the LLM provider at ${url}: ${reason}`);
  }

  const serverDurationMs = performance.now() - startedAt;

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new LlmError(describeHttpFailure(response.status, errorBody), response.status);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new LlmError('The LLM provider returned a response that was not valid JSON.');
  }

  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) {
    throw new LlmError('The LLM provider returned no choices.');
  }

  const message = (choices[0] as { message?: { content?: unknown } }).message;
  const content = message?.content;
  if (typeof content !== 'string' || content.trim() === '') {
    throw new LlmError('The LLM provider returned an empty message.');
  }

  return { classifications: readClassifications(extractJson(content)), serverDurationMs };
}
