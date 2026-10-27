const { randomUUID } = require('node:crypto');
const logger = require('../utils/logger');

const QUIET_PATHS = new Set(['/health', '/health/live', '/metrics']);

/**
 * Times every request, records Prometheus metrics, and writes one structured
 * access-log line. The route label uses the matched pattern (`/api/users/:id`),
 * never the raw URL, to keep metric cardinality bounded.
 */
function observability(metrics) {
  return (req, res, next) => {
    const start = process.hrtime.bigint();
    req.id = req.get('x-request-id') || randomUUID();
    res.set('x-request-id', req.id);

    res.on('finish', () => {
      const seconds = Number(process.hrtime.bigint() - start) / 1e9;
      const base = res.locals.routeBase ?? '';
      // Requests rejected by router-level middleware (e.g. 401) never match a route.
      const route = req.route ? `${base}${req.route.path}`.replace(/\/$/, '') || '/' : base ? `${base}/*` : 'unmatched';
      const labels = { method: req.method, route, status_code: String(res.statusCode) };
      metrics.httpRequests.inc(labels);
      metrics.httpDuration.observe(labels, seconds);

      const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : QUIET_PATHS.has(req.path) ? 'debug' : 'info';
      logger.log(level, 'request', {
        requestId: req.id,
        method: req.method,
        path: req.originalUrl,
        route,
        status: res.statusCode,
        durationMs: Math.round(seconds * 1000 * 10) / 10,
        userId: req.user?.id,
      });
    });
    next();
  };
}

module.exports = { observability };
