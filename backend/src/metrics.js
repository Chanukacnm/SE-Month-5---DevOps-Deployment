const client = require('prom-client');

/**
 * Prometheus metrics. One registry per app instance so tests can build
 * several apps without "metric already registered" errors.
 */
function createMetrics(pool) {
  const register = new client.Registry();
  register.setDefaultLabels({ service: 'adminflow-api' });
  // CPU, resident memory, heap, event-loop lag, GC, open handles.
  client.collectDefaultMetrics({ register });

  const httpRequests = new client.Counter({
    name: 'http_requests_total',
    help: 'HTTP requests handled',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
  });

  const httpDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request latency',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [register],
  });

  // Pool gauges are read on every scrape, so they are never stale.
  new client.Gauge({
    name: 'db_pool_connections',
    help: 'Postgres pool connections by state',
    labelNames: ['state'],
    registers: [register],
    collect() {
      this.set({ state: 'total' }, pool.totalCount);
      this.set({ state: 'idle' }, pool.idleCount);
      this.set({ state: 'active' }, pool.totalCount - pool.idleCount);
      this.set({ state: 'waiting' }, pool.waitingCount);
    },
  });

  new client.Gauge({
    name: 'db_pool_max_connections',
    help: 'Configured Postgres pool size',
    registers: [register],
    collect() {
      this.set(pool.options.max);
    },
  });

  return { register, httpRequests, httpDuration };
}

module.exports = { createMetrics };
