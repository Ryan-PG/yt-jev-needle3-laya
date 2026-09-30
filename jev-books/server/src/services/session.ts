import { randomUUID } from 'node:crypto';
import { config } from '../config';
import type { JevCredentials, LlmCredentials, SystemId } from '../../../shared/types';

/**
 * In-memory credential store.
 *
 * This is the only place credentials live on the server: a plain Map, for the
 * lifetime of one benchmark session. Nothing is written to disk, nothing is
 * logged, and no endpoint ever reads a credential back out to the browser.
 */

export interface BenchmarkSession {
  id: string;
  system: SystemId;
  jev?: JevCredentials;
  llm?: LlmCredentials;
  createdAt: number;
  lastUsedAt: number;
}

const sessions = new Map<string, BenchmarkSession>();

function isExpired(session: BenchmarkSession, now: number): boolean {
  return now - session.lastUsedAt > config.sessionTtlMs;
}

export function createSession(input: {
  system: SystemId;
  jev?: JevCredentials;
  llm?: LlmCredentials;
}): BenchmarkSession {
  const now = Date.now();
  const session: BenchmarkSession = {
    id: randomUUID(),
    system: input.system,
    createdAt: now,
    lastUsedAt: now,
  };
  if (input.jev) session.jev = input.jev;
  if (input.llm) session.llm = input.llm;

  sessions.set(session.id, session);
  return session;
}

/** Look a session up and refresh its idle timer. */
export function getSession(id: string): BenchmarkSession | undefined {
  const now = Date.now();
  const session = sessions.get(id);
  if (!session) return undefined;
  if (isExpired(session, now)) {
    sessions.delete(id);
    return undefined;
  }
  session.lastUsedAt = now;
  return session;
}

export function deleteSession(id: string): void {
  sessions.delete(id);
}

/** Drop sessions that have been idle for longer than the configured TTL. */
export function sweepExpiredSessions(): number {
  const now = Date.now();
  let removed = 0;
  for (const [id, session] of sessions) {
    if (isExpired(session, now)) {
      sessions.delete(id);
      removed += 1;
    }
  }
  return removed;
}

/** Start the background sweep. Returns a stop function for tests and shutdown. */
export function startSessionSweeper(intervalMs = 60_000): () => void {
  const timer = setInterval(sweepExpiredSessions, intervalMs);
  timer.unref?.();
  return () => clearInterval(timer);
}
