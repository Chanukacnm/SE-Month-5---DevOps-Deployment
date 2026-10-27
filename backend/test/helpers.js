// Must run before anything loads src/config.js.
process.env.NODE_ENV = 'test';

const request = require('supertest');
const { createPool } = require('../src/db/pool');
const { migrate } = require('../src/db/migrate');
const { reset } = require('../src/db/seed');
const { createApp } = require('../src/app');

/**
 * Integration tests run against a real Postgres (a service container in CI,
 * `docker compose up db` locally). The database is wiped and reseeded per file.
 */
async function setup() {
  const pool = createPool(process.env.TEST_DATABASE_URL || process.env.DATABASE_URL);
  await migrate(pool);
  await reset(pool);
  const app = createApp({ pool });
  return { pool, app, api: () => request(app) };
}

async function tokenFor(app, email, password) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token;
}

const ADMIN = ['admin@adminflow.io', 'Admin@123'];
const EDITOR = ['editor@adminflow.io', 'Editor@123'];

module.exports = { setup, tokenFor, ADMIN, EDITOR };
