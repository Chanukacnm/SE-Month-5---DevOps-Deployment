const { Pool } = require('pg');
const config = require('../config');
const logger = require('../utils/logger');

function createPool(connectionString = config.databaseUrl) {
  const pool = new Pool({
    connectionString,
    max: config.dbPoolMax,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined,
  });
  // An idle client losing its connection must not crash the process.
  pool.on('error', (err) => logger.error('Postgres pool error', { error: err.message }));
  return pool;
}

module.exports = { createPool };
