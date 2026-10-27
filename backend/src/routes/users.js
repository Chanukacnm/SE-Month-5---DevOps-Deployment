const { randomBytes } = require('node:crypto');
const { Router } = require('express');
const { z } = require('zod');
const { requireAuth, requireRole } = require('../middleware/auth');
const { ApiError } = require('../utils/errors');

const ROLE = z.enum(['admin', 'editor', 'user']);

const userInputSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().toLowerCase().email().max(254),
  role: ROLE,
  department: z.string().trim().min(1).max(60),
  isActive: z.boolean(),
});

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().max(100).default(''),
  role: z.union([ROLE, z.literal('all')]).default('all'),
  status: z.enum(['all', 'active', 'inactive', 'deleted']).default('all'),
  sortBy: z.enum(['name', 'email', 'role', 'createdAt']).default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
});

// Whitelisted so user input never reaches the SQL text.
const SORT_COLUMNS = { name: 'name', email: 'email', role: 'role', createdAt: 'created_at' };
const UPDATABLE_COLUMNS = { name: 'name', email: 'email', role: 'role', department: 'department', isActive: 'is_active' };
const USER_COLUMNS = 'id, name, email, role, is_active, department, created_at, deleted_at';

const toUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  isActive: row.is_active,
  department: row.department,
  createdAt: row.created_at.toISOString(),
  deletedAt: row.deleted_at ? row.deleted_at.toISOString() : null,
});

const isUniqueViolation = (err) => err.code === '23505';
const duplicateEmail = () => new ApiError(409, 'A user with this email already exists');

function usersRouter(pool) {
  const router = Router();
  router.use(requireAuth);

  const logActivity = (actor, action, target) =>
    pool.query('INSERT INTO activity (actor, action, target) VALUES ($1, $2, $3)', [actor, action, target]);

  router.get('/', async (req, res) => {
    const p = listSchema.parse(req.query);
    const where = [];
    const values = [];
    const add = (sql, value) => {
      values.push(value);
      where.push(sql.replace('?', `$${values.length}`));
    };

    if (p.status === 'deleted') where.push('deleted_at IS NOT NULL');
    else where.push('deleted_at IS NULL');
    if (p.status === 'active') where.push('is_active');
    if (p.status === 'inactive') where.push('NOT is_active');
    if (p.role !== 'all') add('role = ?', p.role);
    const q = p.search.trim();
    if (q) add(`(name || ' ' || email || ' ' || department) ILIKE ? ESCAPE '\\'`, `%${q.replace(/[\\%_]/g, '\\$&')}%`);

    const whereSql = `WHERE ${where.join(' AND ')}`;
    const { rows: countRows } = await pool.query(`SELECT count(*)::int AS total FROM users ${whereSql}`, values);
    const total = countRows[0].total;
    const totalPages = Math.max(1, Math.ceil(total / p.pageSize));
    const page = Math.min(p.page, totalPages);
    const dir = p.sortDir === 'asc' ? 'ASC' : 'DESC';

    const { rows } = await pool.query(
      `SELECT ${USER_COLUMNS} FROM users ${whereSql}
       ORDER BY ${SORT_COLUMNS[p.sortBy]} ${dir}, id ${dir}
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, p.pageSize, (page - 1) * p.pageSize],
    );
    res.json({ items: rows.map(toUser), total, page, pageSize: p.pageSize, totalPages });
  });

  router.get('/stats', async (_req, res) => {
    const { rows } = await pool.query(
      'SELECT count(*)::int AS total, count(*) FILTER (WHERE is_active)::int AS active FROM users WHERE deleted_at IS NULL',
    );
    res.json(rows[0]);
  });

  router.get('/:id', async (req, res) => {
    const { rows } = await pool.query(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1`, [req.params.id]);
    if (!rows[0]) throw new ApiError(404, 'User not found');
    res.json(toUser(rows[0]));
  });

  router.post('/', requireRole('admin', 'editor'), async (req, res) => {
    const input = userInputSchema.parse(req.body);
    const id = `usr_${randomBytes(6).toString('hex')}`;
    try {
      const { rows } = await pool.query(
        `INSERT INTO users (id, name, email, role, is_active, department) VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${USER_COLUMNS}`,
        [id, input.name, input.email, input.role, input.isActive, input.department],
      );
      await logActivity(req.user.name, 'created', input.name);
      res.status(201).json(toUser(rows[0]));
    } catch (err) {
      if (isUniqueViolation(err)) throw duplicateEmail();
      throw err;
    }
  });

  router.patch('/:id', requireRole('admin', 'editor'), async (req, res) => {
    const input = userInputSchema.partial().parse(req.body);
    const entries = Object.entries(input).filter(([, v]) => v !== undefined);
    if (entries.length === 0) throw new ApiError(400, 'Nothing to update');

    const sets = entries.map(([key], i) => `${UPDATABLE_COLUMNS[key]} = $${i + 2}`);
    try {
      const { rows } = await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = $1 RETURNING ${USER_COLUMNS}`, [
        req.params.id,
        ...entries.map(([, v]) => v),
      ]);
      if (!rows[0]) throw new ApiError(404, 'User not found');
      await logActivity(req.user.name, 'updated', rows[0].name);
      res.json(toUser(rows[0]));
    } catch (err) {
      if (isUniqueViolation(err)) throw duplicateEmail();
      throw err;
    }
  });

  /** Soft delete: the row stays with a timestamp and can be restored. */
  router.delete('/:id', requireRole('admin'), async (req, res) => {
    const { rows } = await pool.query(
      `UPDATE users SET deleted_at = COALESCE(deleted_at, now()) WHERE id = $1 RETURNING ${USER_COLUMNS}`,
      [req.params.id],
    );
    if (!rows[0]) throw new ApiError(404, 'User not found');
    await logActivity(req.user.name, 'deleted', rows[0].name);
    res.json(toUser(rows[0]));
  });

  router.post('/:id/restore', requireRole('admin'), async (req, res) => {
    try {
      const { rows } = await pool.query(`UPDATE users SET deleted_at = NULL WHERE id = $1 RETURNING ${USER_COLUMNS}`, [req.params.id]);
      if (!rows[0]) throw new ApiError(404, 'User not found');
      await logActivity(req.user.name, 'restored', rows[0].name);
      res.json(toUser(rows[0]));
    } catch (err) {
      if (isUniqueViolation(err)) throw duplicateEmail();
      throw err;
    }
  });

  return router;
}

module.exports = { usersRouter };
