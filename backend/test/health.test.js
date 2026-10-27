const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { setup } = require('./helpers');

let ctx;
before(async () => {
  ctx = await setup();
});
after(() => ctx.pool.end());

test('GET /health reports healthy with a database check', async () => {
  const res = await ctx.api().get('/health').expect(200);
  assert.equal(res.body.status, 'healthy');
  assert.equal(res.body.checks.database.status, 'up');
  assert.ok(res.body.uptime > 0);
});

test('GET /health/live does not depend on the database', async () => {
  await ctx.api().get('/health/live').expect(200, { status: 'alive' });
});

test('GET /metrics exposes request, latency, pool and process metrics', async () => {
  await ctx.api().get('/health');
  await ctx.api().post('/api/auth/login').send({ email: 'admin@adminflow.io', password: 'Admin@123' });
  await ctx.api().get('/api/users/usr_0001');
  const res = await ctx.api().get('/metrics').expect(200);
  assert.match(res.text, /http_requests_total\{.*route="\/health".*\}/);
  // Labels use the route pattern, including the mount path, never the raw URL.
  assert.match(res.text, /route="\/api\/auth\/login",status_code="200"/);
  assert.match(res.text, /route="\/api\/users\/\*",status_code="401"/);
  assert.doesNotMatch(res.text, /usr_0001/);
  assert.match(res.text, /http_request_duration_seconds_bucket/);
  assert.match(res.text, /db_pool_connections\{.*state="idle".*\}/);
  assert.match(res.text, /process_cpu_seconds_total/);
});

test('every response carries a request id', async () => {
  const res = await ctx.api().get('/health/live').set('x-request-id', 'abc-123');
  assert.equal(res.headers['x-request-id'], 'abc-123');
});

test('unknown routes return a JSON 404', async () => {
  const res = await ctx.api().get('/api/nope').expect(404);
  assert.match(res.body.error.message, /No route/);
});
