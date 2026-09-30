import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';

import { config } from './config';
import { MAX_CATEGORIES, MIN_CATEGORIES } from '../../shared/constants';
import { isValidBatchSize } from '../../shared/batching';
import type {
  ApiErrorBody,
  BatchRequest,
  BatchResponse,
  Book,
  CreateSessionRequest,
  CreateSessionResponse,
  SystemId,
} from '../../shared/types';

import { JevError, classifyBatchWithJev } from './services/jev';
import { LlmError, classifyBatchWithLlm, findProvider, listProviders } from './services/llm';
import { createSession, deleteSession, getSession } from './services/session';
import { validateClassifications } from './services/validation';

/** A request-body problem, reported to the client as HTTP 400. */
class BadRequestError extends Error {
  constructor(message: string, readonly details?: string[]) {
    super(message);
    this.name = 'BadRequestError';
  }
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

/** Session id from the route, as a definite string. */
function sessionIdFrom(req: Request): string {
  return req.params.id ?? '';
}

function requireString(source: Record<string, unknown> | undefined, field: string, label: string): string {
  const value = source?.[field];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new BadRequestError(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

function parseBooks(value: unknown): Book[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new BadRequestError('"books" must be a non-empty array.');
  }
  return value.map((item, index) => {
    const record = asRecord(item);
    if (!record) throw new BadRequestError(`books[${index}] must be an object.`);
    const id = record.id;
    if (typeof id !== 'string' && typeof id !== 'number') {
      throw new BadRequestError(`books[${index}].id must be a string or number.`);
    }
    return {
      id: String(id),
      title: typeof record.title === 'string' ? record.title : '',
      description: typeof record.description === 'string' ? record.description : '',
    };
  });
}

function parseCategories(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new BadRequestError('"categories" must be an array.');
  }
  const categories = value.map((item) => {
    if (typeof item !== 'string' || item.trim() === '') {
      throw new BadRequestError('Every category must be a non-empty string.');
    }
    return item.trim();
  });

  if (categories.length < MIN_CATEGORIES) {
    throw new BadRequestError(`At least ${MIN_CATEGORIES} categories are required.`);
  }
  if (categories.length > MAX_CATEGORIES) {
    throw new BadRequestError(
      `JEV Choice supports at most ${MAX_CATEGORIES} options per question, so at most ${MAX_CATEGORIES} categories are allowed.`,
    );
  }

  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const category of categories) {
    const key = category.toLowerCase();
    if (seen.has(key)) duplicates.add(category);
    seen.add(key);
  }
  if (duplicates.size > 0) {
    throw new BadRequestError(`Duplicate categories are not allowed: ${[...duplicates].join(', ')}.`);
  }

  return categories;
}

function parseBatchRequest(body: unknown): BatchRequest {
  const record = asRecord(body);
  if (!record) throw new BadRequestError('Request body must be a JSON object.');

  const books = parseBooks(record.books);
  const categories = parseCategories(record.categories);

  const batchNumber = Number(record.batchNumber);
  const totalBatches = Number(record.totalBatches);
  if (!Number.isInteger(batchNumber) || batchNumber < 1) {
    throw new BadRequestError('"batchNumber" must be a positive integer.');
  }
  if (!Number.isInteger(totalBatches) || totalBatches < 1) {
    throw new BadRequestError('"totalBatches" must be a positive integer.');
  }
  if (batchNumber > totalBatches) {
    throw new BadRequestError('"batchNumber" cannot be greater than "totalBatches".');
  }
  if (!isValidBatchSize(books.length, totalBatches, batchNumber)) {
    throw new BadRequestError(
      'Every batch must contain exactly the batch size of books; only the final batch may be shorter.',
    );
  }

  return { books, categories, batchNumber, totalBatches };
}

function parseCreateSession(body: unknown): CreateSessionRequest {
  const record = asRecord(body);
  if (!record) throw new BadRequestError('Request body must be a JSON object.');

  const system = record.system;
  if (system !== 'jev' && system !== 'llm') {
    throw new BadRequestError('"system" must be either "jev" or "llm".');
  }

  if (system === 'jev') {
    const jev = asRecord(record.jev);
    return { system, jev: { token: requireString(jev, 'token', 'JEV API token') } };
  }

  const llm = asRecord(record.llm);
  const providerId = requireString(llm, 'providerId', 'Provider');
  const provider = findProvider(providerId);
  if (!provider) {
    throw new BadRequestError(`Unknown provider "${providerId}".`);
  }

  const baseUrl = typeof llm?.baseUrl === 'string' ? llm.baseUrl.trim() : '';
  if (provider.requiresBaseUrl && !baseUrl) {
    throw new BadRequestError(`Provider "${provider.label}" requires a base URL.`);
  }

  return {
    system,
    llm: {
      providerId,
      model: requireString(llm, 'model', 'Model'),
      apiKey: requireString(llm, 'apiKey', 'API key'),
      ...(baseUrl ? { baseUrl } : {}),
    },
  };
}

/** Map an upstream failure onto a client-visible status without leaking secrets. */
function upstreamStatus(error: unknown): { status: number; body: ApiErrorBody } {
  if (error instanceof JevError || error instanceof LlmError) {
    const name = error instanceof JevError ? 'JEV' : 'LLM';
    if (error.status === 401 || error.status === 403) {
      return { status: 401, body: { error: error.message } };
    }
    if (error.status === 429) {
      return { status: 429, body: { error: error.message } };
    }
    return { status: 502, body: { error: error.message } };
  }

  if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
    return { status: 504, body: { error: 'The upstream request timed out.' } };
  }

  const message = error instanceof Error ? error.message : 'Unexpected upstream failure.';
  return { status: 502, body: { error: message } };
}

export function buildApp(): express.Express {
  const app = express();

  app.use(cors({ origin: config.clientOrigin }));
  app.use(express.json({ limit: '16mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.get('/api/providers', (_req: Request, res: Response) => {
    res.json(listProviders());
  });

  /**
   * Register a benchmark session. Credentials are held in memory only and are
   * never returned by any endpoint.
   */
  app.post('/api/sessions', (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = parseCreateSession(req.body);
      const session = createSession(input);
      const response: CreateSessionResponse = { sessionId: session.id };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  });

  app.delete('/api/sessions/:id', (req: Request, res: Response) => {
    deleteSession(sessionIdFrom(req));
    res.status(204).end();
  });

  /** Classify exactly one batch with the session's classifier. */
  app.post('/api/sessions/:id/batch', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = getSession(sessionIdFrom(req));
      if (!session) {
        res.status(404).json({ error: 'Benchmark session not found or expired.' } satisfies ApiErrorBody);
        return;
      }

      const batch = parseBatchRequest(req.body);

      const { classifications, serverDurationMs } =
        session.system === 'jev'
          ? await classifyBatchWithJev(
              session.jev?.token ?? '',
              batch.books,
              batch.categories,
              batch.batchNumber,
              batch.totalBatches,
            )
          : await classifyBatchWithLlm(
              {
                providerId: session.llm?.providerId ?? '',
                model: session.llm?.model ?? '',
                apiKey: session.llm?.apiKey ?? '',
                ...(session.llm?.baseUrl ? { baseUrl: session.llm.baseUrl } : {}),
              },
              batch.books,
              batch.categories,
              batch.batchNumber,
              batch.totalBatches,
            );

      // Identical validation rules for both classifiers. A batch that does not
      // satisfy them is failed rather than turned into partly-wrong data.
      const validation = validateClassifications(batch.books, batch.categories, classifications);
      if (!validation.ok) {
        res.status(422).json({
          error: `Batch ${batch.batchNumber} failed validation and was discarded.`,
          details: validation.errors,
        } satisfies ApiErrorBody);
        return;
      }

      const response: BatchResponse = {
        batchNumber: batch.batchNumber,
        results: validation.value,
        serverDurationMs: Math.round(serverDurationMs),
        model: session.system === 'jev' ? config.jev.model : (session.llm?.model ?? ''),
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found.' } satisfies ApiErrorBody);
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof BadRequestError) {
      const body: ApiErrorBody = { error: error.message };
      if (error.details) body.details = error.details;
      res.status(400).json(body);
      return;
    }

    if (error instanceof SyntaxError) {
      res.status(400).json({ error: 'Request body was not valid JSON.' } satisfies ApiErrorBody);
      return;
    }

    // Never log request headers or bodies: they can carry credentials.
    console.error('[api] request failed:', error instanceof Error ? `${error.name}: ${error.message}` : 'unknown error');
    const { status, body } = upstreamStatus(error);
    res.status(status).json(body);
  });

  return app;
}

export type { SystemId };
