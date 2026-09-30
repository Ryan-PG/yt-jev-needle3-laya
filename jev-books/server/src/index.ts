import { buildApp } from './app';
import { config } from './config';
import { startSessionSweeper } from './services/session';

const app = buildApp();
const stopSweeper = startSessionSweeper();

const server = app.listen(config.port, () => {
  console.log(`[server] Book Classification Benchmark API listening on http://localhost:${config.port}`);
  console.log(`[server] JEV endpoint: ${config.jev.baseUrl}/systemone (model ${config.jev.model})`);
});

function shutdown(signal: string): void {
  console.log(`[server] ${signal} received, shutting down.`);
  stopSweeper();
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
