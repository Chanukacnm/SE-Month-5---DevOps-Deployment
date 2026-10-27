const fs = require('node:fs');
const path = require('node:path');
const logger = require('../utils/logger');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
// Any constant works; it just has to be the same for every instance.
const LOCK_ID = 727_001;

/**
 * Applies pending SQL migrations in filename order, each in its own transaction.
 * An advisory lock makes this safe when several replicas start at once
 * (rolling or blue-green deploys).
 */
async function migrate(pool) {
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [LOCK_ID]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);
    const { rows } = await client.query('SELECT name FROM schema_migrations');
    const applied = new Set(rows.map((r) => r.name));
    const pending = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql') && !applied.has(f))
      .sort();

    for (const file of pending) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        logger.info('Applied migration', { migration: file });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }
    return pending;
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [LOCK_ID]).catch(() => {});
    client.release();
  }
}

module.exports = { migrate };

// `npm run migrate` runs this file directly.
if (require.main === module) {
  const { createPool } = require('./pool');
  const pool = createPool();
  migrate(pool)
    .then((applied) => logger.info('Migrations complete', { applied: applied.length }))
    .catch((err) => {
      logger.error('Migration failed', { error: err.message });
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
