const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');

const MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

// Revenue and orders have no source table yet, so the trend stays synthetic (same series as Month 4).
const TREND = MONTHS.map((label, i) => ({
  label,
  revenue: Math.round(42_000 + i * 3_100 + Math.sin(i * 1.3) * 5_500),
  orders: Math.round(610 + i * 38 + Math.cos(i * 1.1) * 70),
}));

const pct = (a, b) => Number((((a - b) / b) * 100).toFixed(1));

function dashboardRouter(pool) {
  const router = Router();
  router.use(requireAuth);

  router.get('/', async (_req, res) => {
    const [counts, activity] = await Promise.all([
      pool.query('SELECT count(*)::int AS total, count(*) FILTER (WHERE is_active)::int AS active FROM users WHERE deleted_at IS NULL'),
      pool.query('SELECT id, actor, action, target, at FROM activity ORDER BY at DESC LIMIT 5'),
    ]);
    const { total, active } = counts.rows[0];
    const last = TREND[TREND.length - 1];
    const prev = TREND[TREND.length - 2];

    res.json({
      metrics: [
        { id: 'users', label: 'Total users', value: total, format: 'number', change: 4.2 },
        { id: 'revenue', label: 'Revenue (Oct)', value: last.revenue, format: 'currency', change: pct(last.revenue, prev.revenue) },
        { id: 'orders', label: 'Orders (Oct)', value: last.orders, format: 'number', change: pct(last.orders, prev.orders) },
        { id: 'conversion', label: 'Active rate', value: (active / Math.max(total, 1)) * 100, format: 'percent', change: -0.8 },
      ],
      trend: TREND,
      activity: activity.rows.map((a) => ({ id: String(a.id), actor: a.actor, action: a.action, target: a.target, at: a.at.toISOString() })),
    });
  });

  return router;
}

module.exports = { dashboardRouter };
