const express = require('express');
const helmet = require('helmet');
const config = require('./config');
const { createMetrics } = require('./metrics');
const { observability } = require('./middleware/observability');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { ApiError } = require('./utils/errors');
const { healthRouter } = require('./routes/health');
const { authRouter } = require('./routes/auth');
const { usersRouter } = require('./routes/users');
const { dashboardRouter } = require('./routes/dashboard');

function createApp({ pool }) {
  const app = express();
  const metrics = createMetrics(pool);

  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use(helmet());
  app.use(observability(metrics));
  app.use(express.json({ limit: '100kb' }));

  if (config.corsOrigins.length) {
    app.use((req, res, next) => {
      const origin = req.get('origin');
      if (origin && config.corsOrigins.includes(origin)) {
        res.set({
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
          Vary: 'Origin',
        });
      }
      if (req.method === 'OPTIONS') return res.sendStatus(204);
      next();
    });
  }

  app.use(healthRouter(pool));

  app.get('/metrics', async (req, res) => {
    if (config.metricsToken && req.get('authorization') !== `Bearer ${config.metricsToken}`) {
      throw new ApiError(401, 'Metrics token required');
    }
    res.set('Content-Type', metrics.register.contentType);
    res.send(await metrics.register.metrics());
  });

  // Express resets req.baseUrl once a router finishes, so remember the mount
  // path for the metrics route label.
  const mount = (path, router) =>
    app.use(
      path,
      (req, res, next) => {
        res.locals.routeBase = req.baseUrl;
        next();
      },
      router,
    );
  mount('/api/auth', authRouter(pool));
  mount('/api/users', usersRouter(pool));
  mount('/api/dashboard', dashboardRouter(pool));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
