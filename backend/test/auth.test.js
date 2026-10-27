const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { setup, ADMIN } = require('./helpers');

let ctx;
before(async () => {
  ctx = await setup();
});
after(() => ctx.pool.end());

test('login with valid credentials returns the user and a JWT', async () => {
  const res = await ctx.api().post('/api/auth/login').send({ email: ADMIN[0], password: ADMIN[1] }).expect(200);
  assert.deepEqual(res.body.user, { id: 'adm_1', name: 'Alex Admin', email: 'admin@adminflow.io', role: 'admin' });
  assert.equal(res.body.token.split('.').length, 3);
});

test('login is case-insensitive on email', async () => {
  await ctx.api().post('/api/auth/login').send({ email: '  Admin@AdminFlow.io ', password: ADMIN[1] }).expect(200);
});

test('login with a wrong password is rejected', async () => {
  const res = await ctx.api().post('/api/auth/login').send({ email: ADMIN[0], password: 'nope' }).expect(401);
  assert.equal(res.body.error.message, 'Invalid email or password');
});

test('login with an unknown email gives the same error', async () => {
  const res = await ctx.api().post('/api/auth/login').send({ email: 'ghost@adminflow.io', password: 'x' }).expect(401);
  assert.equal(res.body.error.message, 'Invalid email or password');
});

test('login validates the body', async () => {
  await ctx.api().post('/api/auth/login').send({ email: 'not-an-email' }).expect(400);
});

test('/me returns the signed-in user and rejects bad tokens', async () => {
  const login = await ctx.api().post('/api/auth/login').send({ email: ADMIN[0], password: ADMIN[1] });
  const me = await ctx.api().get('/api/auth/me').set('authorization', `Bearer ${login.body.token}`).expect(200);
  assert.equal(me.body.user.role, 'admin');
  await ctx.api().get('/api/auth/me').set('authorization', 'Bearer forged.token.value').expect(401);
  await ctx.api().get('/api/auth/me').expect(401);
});
