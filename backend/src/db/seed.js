const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

const FIRST = ['Amara', 'Ben', 'Chen', 'Dilan', 'Elena', 'Farah', 'George', 'Hiro', 'Isla', 'Jamal', 'Kavya', 'Liam', 'Maya', 'Noah', 'Olivia', 'Priya', 'Quinn', 'Ravi', 'Sara', 'Tomás'];
const LAST = ['Perera', 'Smith', 'Wang', 'Silva', 'Garcia', 'Khan', 'Brown', 'Tanaka', 'Fernando', 'Okafor', 'Nair', 'Murphy', 'Cohen', 'Jensen', 'Rossi'];
const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'Support', 'Finance', 'Operations'];
const ROLES = ['admin', 'editor', 'user', 'user', 'user', 'editor'];

/** Demo accounts, documented on the login screen and in the README. */
const ACCOUNTS = [
  { id: 'adm_1', name: 'Alex Admin', email: 'admin@adminflow.io', role: 'admin', password: 'Admin@123' },
  { id: 'edt_1', name: 'Erin Editor', email: 'editor@adminflow.io', role: 'editor', password: 'Editor@123' },
];

const ACTIVITY = [
  { actor: 'Alex Admin', action: 'invited', target: 'Priya Nair', minutesAgo: 4 },
  { actor: 'Erin Editor', action: 'updated role for', target: 'Ben Smith', minutesAgo: 27 },
  { actor: 'System', action: 'processed refund for', target: 'order #48213', minutesAgo: 65 },
  { actor: 'Alex Admin', action: 'deactivated', target: 'Quinn Murphy', minutesAgo: 180 },
  { actor: 'Erin Editor', action: 'published', target: 'October pricing page', minutesAgo: 420 },
];

/** Deterministic PRNG so the seeded dataset is identical on every machine (same as the Month 4 mock). */
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedUsers(count = 137) {
  const rand = mulberry32(42);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const now = Date.UTC(2026, 9, 1);
  return Array.from({ length: count }, (_, i) => {
    const first = pick(FIRST);
    const last = pick(LAST);
    return {
      id: `usr_${(i + 1).toString().padStart(4, '0')}`,
      name: `${first} ${last}`,
      email: `${first}.${last}${i}@example.com`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''),
      role: pick(ROLES),
      isActive: rand() > 0.18,
      department: pick(DEPARTMENTS),
      createdAt: new Date(now - Math.floor(rand() * 400) * 86_400_000).toISOString(),
    };
  });
}

/** Seeds demo data into an empty database. Safe to call on every start. */
async function seed(pool) {
  const { rows } = await pool.query('SELECT count(*)::int AS n FROM accounts');
  if (rows[0].n > 0) return false;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const a of ACCOUNTS) {
      const hash = await bcrypt.hash(a.password, 10);
      await client.query('INSERT INTO accounts (id, name, email, role, password_hash) VALUES ($1, $2, $3, $4, $5)', [a.id, a.name, a.email, a.role, hash]);
    }
    const users = seedUsers();
    // One multi-row insert per table keeps seeding fast on remote databases.
    const values = [];
    const placeholders = users.map((u, i) => {
      values.push(u.id, u.name, u.email, u.role, u.isActive, u.department, u.createdAt);
      const b = i * 7;
      return `($${b + 1}, $${b + 2}, $${b + 3}, $${b + 4}, $${b + 5}, $${b + 6}, $${b + 7})`;
    });
    await client.query(`INSERT INTO users (id, name, email, role, is_active, department, created_at) VALUES ${placeholders.join(', ')}`, values);
    for (const a of ACTIVITY) {
      await client.query(`INSERT INTO activity (actor, action, target, at) VALUES ($1, $2, $3, now() - make_interval(mins => $4))`, [a.actor, a.action, a.target, a.minutesAgo]);
    }
    await client.query('COMMIT');
    logger.info('Seeded demo data', { accounts: ACCOUNTS.length, users: users.length });
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Wipes all data and reseeds. Used by the test suite. */
async function reset(pool) {
  await pool.query('TRUNCATE accounts, users, activity RESTART IDENTITY');
  await seed(pool);
}

module.exports = { seed, reset, seedUsers, DEPARTMENTS };
