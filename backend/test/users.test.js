const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { setup, tokenFor, ADMIN, EDITOR } = require('./helpers');

let ctx;
let admin;
let editor;
before(async () => {
  ctx = await setup();
  admin = `Bearer ${await tokenFor(ctx.app, ...ADMIN)}`;
  editor = `Bearer ${await tokenFor(ctx.app, ...EDITOR)}`;
});
after(() => ctx.pool.end());

const newUser = (overrides = {}) => ({
  name: 'Test Person',
  email: `test.${Date.now()}.${Math.random().toString(36).slice(2)}@example.com`,
  role: 'user',
  department: 'Engineering',
  isActive: true,
  ...overrides,
});

test('listing users requires authentication', async () => {
  await ctx.api().get('/api/users').expect(401);
});

test('lists the seeded directory with pagination', async () => {
  const res = await ctx.api().get('/api/users?page=2&pageSize=20').set('authorization', admin).expect(200);
  assert.equal(res.body.total, 137);
  assert.equal(res.body.totalPages, 7);
  assert.equal(res.body.page, 2);
  assert.equal(res.body.items.length, 20);
});

test('clamps the page to the last page', async () => {
  const res = await ctx.api().get('/api/users?page=999&pageSize=50').set('authorization', admin).expect(200);
  assert.equal(res.body.page, 3);
});

test('filters by role, status and search, and sorts', async () => {
  const res = await ctx.api().get('/api/users?role=editor&status=active&sortBy=name&sortDir=asc&pageSize=100').set('authorization', admin).expect(200);
  assert.ok(res.body.items.length > 0);
  for (const u of res.body.items) {
    assert.equal(u.role, 'editor');
    assert.equal(u.isActive, true);
  }
  const names = res.body.items.map((u) => u.name);
  assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })));

  const search = await ctx.api().get('/api/users?search=finance').set('authorization', admin).expect(200);
  assert.ok(search.body.items.every((u) => u.department === 'Finance'));
});

test('search treats % and _ literally', async () => {
  const res = await ctx.api().get('/api/users?search=%25').set('authorization', admin).expect(200);
  assert.equal(res.body.total, 0);
});

test('rejects invalid list parameters', async () => {
  await ctx.api().get('/api/users?sortBy=password').set('authorization', admin).expect(400);
});

test('editor can create and update a user', async () => {
  const input = newUser();
  const created = await ctx.api().post('/api/users').set('authorization', editor).send(input).expect(201);
  assert.match(created.body.id, /^usr_/);
  assert.equal(created.body.deletedAt, null);

  const updated = await ctx.api().patch(`/api/users/${created.body.id}`).set('authorization', editor).send({ role: 'editor' }).expect(200);
  assert.equal(updated.body.role, 'editor');
  assert.equal(updated.body.name, input.name);
});

test('create validates input', async () => {
  const res = await ctx.api().post('/api/users').set('authorization', admin).send(newUser({ email: 'bad' })).expect(400);
  assert.match(res.body.error.message, /^email:/);
});

test('duplicate email is a 409', async () => {
  const input = newUser();
  await ctx.api().post('/api/users').set('authorization', admin).send(input).expect(201);
  await ctx.api().post('/api/users').set('authorization', admin).send({ ...input, email: input.email.toUpperCase() }).expect(409);
});

test('editor cannot delete; admin can soft delete and restore', async () => {
  const { body: user } = await ctx.api().post('/api/users').set('authorization', admin).send(newUser());
  await ctx.api().delete(`/api/users/${user.id}`).set('authorization', editor).expect(403);

  const deleted = await ctx.api().delete(`/api/users/${user.id}`).set('authorization', admin).expect(200);
  assert.ok(deleted.body.deletedAt);

  const list = await ctx.api().get(`/api/users?status=deleted&search=${encodeURIComponent(user.email)}`).set('authorization', admin);
  assert.equal(list.body.items[0].id, user.id);

  const restored = await ctx.api().post(`/api/users/${user.id}/restore`).set('authorization', admin).expect(200);
  assert.equal(restored.body.deletedAt, null);
});

test('restoring is blocked when a live user took the email', async () => {
  const input = newUser();
  const { body: original } = await ctx.api().post('/api/users').set('authorization', admin).send(input);
  await ctx.api().delete(`/api/users/${original.id}`).set('authorization', admin).expect(200);
  await ctx.api().post('/api/users').set('authorization', admin).send(input).expect(201);
  await ctx.api().post(`/api/users/${original.id}/restore`).set('authorization', admin).expect(409);
});

test('unknown user ids are 404', async () => {
  await ctx.api().get('/api/users/usr_missing').set('authorization', admin).expect(404);
  await ctx.api().patch('/api/users/usr_missing').set('authorization', admin).send({ name: 'Nobody Here' }).expect(404);
});

test('dashboard reflects live user counts and recent activity', async () => {
  const stats = await ctx.api().get('/api/users/stats').set('authorization', admin).expect(200);
  const res = await ctx.api().get('/api/dashboard').set('authorization', admin).expect(200);
  const users = res.body.metrics.find((m) => m.id === 'users');
  assert.equal(users.value, stats.body.total);
  assert.equal(res.body.trend.length, 12);
  assert.equal(res.body.activity.length, 5);
  // The most recent activity comes from the mutations above.
  assert.equal(res.body.activity[0].actor, 'Alex Admin');
});
