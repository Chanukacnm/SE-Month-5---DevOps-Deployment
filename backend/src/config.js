/**
 * All configuration comes from the environment (12-factor, factor III).
 * Production refuses to start with missing or default secrets.
 */
const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

const DEV_JWT_SECRET = 'dev-only-insecure-secret-change-me';

const config = {
  env,
  isProduction,
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL || 'postgres://adminflow:adminflow@localhost:5432/adminflow',
  // Managed Postgres (Render, Azure, RDS) requires TLS; local Docker Postgres does not.
  databaseSsl: process.env.DATABASE_SSL === 'true',
  dbPoolMax: Number(process.env.DB_POOL_MAX) || 10,
  jwtSecret: process.env.JWT_SECRET || DEV_JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  logLevel: process.env.LOG_LEVEL || (env === 'test' ? 'error' : 'info'),
  // Optional: write log files as well as stdout (stdout is what aggregators collect).
  logDir: process.env.LOG_DIR || '',
  // When set, /metrics requires `Authorization: Bearer <token>` (needed when the API is public).
  metricsToken: process.env.METRICS_TOKEN || '',
  // Comma-separated origins allowed by CORS. Empty = same-origin only (the nginx proxy setup).
  corsOrigins: (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean),
  // Number of reverse proxies in front of the API, so req.ip is the real client IP.
  trustProxy: Number(process.env.TRUST_PROXY ?? 1),
  seedOnStart: process.env.SEED_ON_START !== 'false',
  version: process.env.APP_VERSION || 'dev',
};

if (isProduction && config.jwtSecret === DEV_JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production');
}

module.exports = config;
