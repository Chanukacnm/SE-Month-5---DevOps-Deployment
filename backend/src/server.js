const config = require('./config');
const logger = require('./utils/logger');
const { createPool } = require('./db/pool');
const { migrate } = require('./db/migrate');
const { seed } = require('./db/seed');
const { createApp } = require('./app');

async function waitForDatabase(pool, attempts = 15) {
  for (let i = 1; i <= attempts; i += 1) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (err) {
      logger.warn('Database not ready, retrying', { attempt: i, error: err.message });
      await new Promise((r) => setTimeout(r, Math.min(1000 * i, 5000)));
    }
  }
  throw new Error('Database unreachable');
}

async function main() {
  const pool = createPool();
  await waitForDatabase(pool);
  await migrate(pool);
  if (config.seedOnStart) await seed(pool);

  const server = createApp({ pool }).listen(config.port, () => {
    logger.info('API listening', { port: config.port });
  });

  // Graceful shutdown: stop accepting connections, finish in-flight requests,
  // then close the pool. Orchestrators send SIGTERM before replacing a container.
  const shutdown = (signal) => {
    logger.info('Shutting down', { signal });
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

process.on('unhandledRejection', (reason) => logger.error('Unhandled rejection', { error: String(reason) }));

main().catch((err) => {
  logger.error('Failed to start', { error: err.message, stack: err.stack });
  process.exit(1);
});
