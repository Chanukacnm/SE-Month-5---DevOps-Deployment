#!/usr/bin/env node
/**
 * Generates realistic traffic against a running AdminFlow stack so the
 * monitoring dashboard has something to show. No dependencies (Node 18+).
 *
 *   node scripts/loadtest.mjs [baseUrl] [seconds] [concurrency]
 *   node scripts/loadtest.mjs http://localhost:8080 300 4
 *
 * Mix: list/filter/sort users, dashboard, user detail, create + edit users,
 * plus a small share of expected client errors (404, 400, 401) so the 4xx
 * panels are not empty. Avoid pointing it at production for long.
 */
const BASE = (process.argv[2] || 'http://localhost:8080').replace(/\/$/, '');
const SECONDS = Number(process.argv[3] || 120);
const CONCURRENCY = Number(process.argv[4] || 4);

const stats = { total: 0, byStatus: {} };

async function call(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  }).catch(() => ({ status: 0, json: async () => null }));
  stats.total += 1;
  stats.byStatus[res.status] = (stats.byStatus[res.status] || 0) + 1;
  return { status: res.status, data: await res.json().catch(() => null) };
}

async function login(email, password) {
  const { status, data } = await call('/auth/login', { method: 'POST', body: { email, password } });
  if (status !== 200) throw new Error(`Login failed for ${email}: HTTP ${status}`);
  return data.token;
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SEARCHES = ['', '', '', 'priya', 'smith', 'engineering', 'sales', 'tan'];

async function worker(id, admin, editor, until) {
  const created = [];
  while (Date.now() < until) {
    const roll = Math.random();
    if (roll < 0.35) {
      await call(`/users?page=${1 + Math.floor(Math.random() * 6)}&pageSize=10&search=${pick(SEARCHES)}&role=${pick(['all', 'all', 'admin', 'editor', 'user'])}&status=${pick(['all', 'active', 'inactive'])}&sortBy=${pick(['name', 'email', 'createdAt'])}&sortDir=${pick(['asc', 'desc'])}`, { token: admin });
    } else if (roll < 0.55) {
      await call('/dashboard', { token: pick([admin, editor]) });
    } else if (roll < 0.7) {
      await call(`/users/usr_${String(1 + Math.floor(Math.random() * 137)).padStart(4, '0')}`, { token: admin });
    } else if (roll < 0.78) {
      const { data } = await call('/users', {
        method: 'POST',
        token: editor,
        body: { name: `Load Test ${id}-${created.length}`, email: `load.${id}.${Date.now()}@example.com`, role: 'user', department: 'Support', isActive: true },
      });
      if (data?.id) created.push(data.id);
    } else if (roll < 0.85 && created.length) {
      await call(`/users/${pick(created)}`, { method: 'PATCH', token: editor, body: { isActive: Math.random() > 0.5 } });
    } else if (roll < 0.9) {
      await call('/users/stats', { token: admin });
    } else if (roll < 0.95) {
      await call('/users/usr_does_not_exist', { token: admin }); // 404
    } else if (roll < 0.98) {
      await call('/users', { method: 'POST', token: editor, body: { name: 'x', email: 'bad' } }); // 400
    } else {
      await call('/users'); // 401, no token
    }
    await sleep(50 + Math.random() * 250);
  }
  // Clean up: soft-delete what this worker created.
  for (const userId of created) await call(`/users/${userId}`, { method: 'DELETE', token: admin });
}

const admin = await login('admin@adminflow.io', 'Admin@123');
const editor = await login('editor@adminflow.io', 'Editor@123');
const until = Date.now() + SECONDS * 1000;
console.log(`Load test: ${BASE} for ${SECONDS}s with ${CONCURRENCY} workers`);
const progress = setInterval(() => console.log(`  ${stats.total} requests`, stats.byStatus), 15_000);
await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i, admin, editor, until)));
clearInterval(progress);
console.log(`Done: ${stats.total} requests`, stats.byStatus);
