const { Router } = require('express');
const config = require('../config');

async function checkDatabase(pool) {
  const start = Date.now();
  try {
    await pool.query('SELECT 1');
    return { status: 'up', latencyMs: Date.now() - start };
  } catch (err) {
    return { status: 'down', error: err.message };
  }
}

function healthRouter(pool) {
  const router = Router();

  // Liveness: the process is up. Never touches dependencies, so a database
  // outage does not make the orchestrator restart healthy API containers.
  router.get('/health/live', (_req, res) => res.json({ status: 'alive' }));

  // Readiness: the API can serve traffic. Used by load balancers and deploy gates.
  router.get('/health', async (_req, res) => {
    const database = await checkDatabase(pool);
    const memory = process.memoryUsage();
    const healthy = database.status === 'up';
    res.status(healthy ? 200 : 503).json({
      status: healthy ? 'healthy' : 'unhealthy',
      version: config.version,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database,
        memory: { rssMb: Math.round(memory.rss / 1048576), heapUsedMb: Math.round(memory.heapUsed / 1048576) },
        dbPool: { total: pool.totalCount, idle: pool.idleCount, waiting: pool.waitingCount },
      },
    });
  });

  return router;
}

module.exports = { healthRouter };
