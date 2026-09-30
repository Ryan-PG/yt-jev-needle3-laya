import 'dotenv/config';

function readInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readString(name: string, fallback: string): string {
  const raw = process.env[name];
  return raw && raw.trim().length > 0 ? raw.trim() : fallback;
}

/**
 * Server configuration. Deliberately holds no API keys: JEV tokens and LLM API
 * keys are supplied per benchmark session through the UI and kept in memory only.
 */
export const config = {
  port: readInt('PORT', 8787),
  clientOrigin: readString('CLIENT_ORIGIN', 'http://localhost:5173'),

  jev: {
    /** Documented System One endpoint base, e.g. https://api.typesafe.ai/v1 */
    baseUrl: readString('JEV_BASE_URL', 'https://api.typesafe.ai/v1'),
    model: readString('JEV_MODEL', 'jev-latest'),
    timeoutMs: readInt('JEV_TIMEOUT_MS', 180_000),
  },

  llm: {
    timeoutMs: readInt('LLM_TIMEOUT_MS', 180_000),
  },

  /** How long a session (and the credentials on it) survives without use. */
  sessionTtlMs: readInt('SESSION_TTL_MS', 30 * 60 * 1000),
} as const;
