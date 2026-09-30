import type {
  ApiErrorBody,
  BatchRequest,
  BatchResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  LlmProviderInfo,
} from '@shared/types';

/** A failed API call, carrying the server's message and any validation details. */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details: string[] = [],
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiRequestError('Could not reach the benchmark API. Is the server running?', 0);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : undefined;
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    const body = (payload ?? {}) as ApiErrorBody;
    throw new ApiRequestError(
      body.error ?? `Request failed with HTTP ${response.status}.`,
      response.status,
      body.details ?? [],
    );
  }

  return payload as T;
}

export const api = {
  health(): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>('/api/health');
  },

  listProviders(): Promise<LlmProviderInfo[]> {
    return request<LlmProviderInfo[]>('/api/providers');
  },

  /**
   * Register the session's credentials. They are sent to the API once and kept in
   * server memory; the response only contains an id.
   */
  async createSession(payload: CreateSessionRequest): Promise<string> {
    const response = await request<CreateSessionResponse>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.sessionId;
  },

  /** Drop the session and the credentials held with it. */
  async deleteSession(sessionId: string): Promise<void> {
    await request<void>(`/api/sessions/${encodeURIComponent(sessionId)}`, { method: 'DELETE' });
  },

  /** Classify exactly one batch of books. */
  classifyBatch(sessionId: string, payload: BatchRequest): Promise<BatchResponse> {
    return request<BatchResponse>(`/api/sessions/${encodeURIComponent(sessionId)}/batch`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
