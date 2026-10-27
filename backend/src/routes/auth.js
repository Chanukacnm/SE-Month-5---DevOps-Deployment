const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const config = require('../config');
const { requireAuth } = require('../middleware/auth');
const { ApiError } = require('../utils/errors');

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

// Hash compared against when the email is unknown, so response time does not reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('timing-equaliser', 10);

function authRouter(pool) {
  const router = Router();

  const loginLimiter = rateLimit({
    windowMs: 60_000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: () => config.env === 'test',
    message: { error: { message: 'Too many sign-in attempts. Wait a minute and try again.' } },
  });

  router.post('/login', loginLimiter, async (req, res) => {
    const { email, password } = credentialsSchema.parse(req.body);
    const { rows } = await pool.query('SELECT id, name, email, role, password_hash FROM accounts WHERE email = $1', [email]);
    const account = rows[0];
    const ok = await bcrypt.compare(password, account?.password_hash ?? DUMMY_HASH);
    if (!account || !ok) throw new ApiError(401, 'Invalid email or password');

    const user = { id: account.id, name: account.name, email: account.email, role: account.role };
    const token = jwt.sign({ name: user.name, email: user.email, role: user.role }, config.jwtSecret, {
      subject: user.id,
      expiresIn: config.jwtExpiresIn,
      algorithm: 'HS256',
    });
    res.json({ user, token });
  });

  router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

  return router;
}

module.exports = { authRouter };
