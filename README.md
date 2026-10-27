# AdminFlow: Production Deployment (Month 5, DevOps)

This month takes the AdminFlow admin dashboard from Month 4 to production. Month 4 ran on an in-browser mock. Now the dashboard is a three-tier app: a React SPA served by nginx, an Express API, and PostgreSQL. All three run in containers, CI/CD tests, builds and ships them, and the stack is monitored.

```
                ┌──────────────── docker compose / Render ─────────────────┐
 Browser ─HTTPS─▶ frontend (nginx :8080)                                   │
                │   /           → React SPA (static, cached assets)        │
                │   /api/*      → proxy ─────▶ backend (Express :3000) ────┼─▶ PostgreSQL 17
                │                               /health  /metrics          │   (internal network)
                └──────────────────────────────────┬───────────────────────┘
                     stdout JSON logs ──▶ Alloy ──▶ Loki ─┐
                     /metrics ──────────▶ Prometheus ─────┼─▶ Grafana dashboard
                                          └─▶ Alertmanager┘
```

| | |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, served by `nginx-unprivileged` (non-root) |
| **Backend** | Node 24, Express 5, `pg`, JWT auth, Zod validation, Winston JSON logs, `prom-client` |
| **Database** | PostgreSQL 17, SQL migrations (run on start, advisory-locked), seeded demo data |
| **CI/CD** | GitHub Actions → GHCR → Render deploy hooks |
| **Monitoring** | Prometheus, Grafana, Loki + Grafana Alloy, Alertmanager, postgres-exporter |

## Quick start (local, Docker)

Requires Docker Desktop.

```bash
cp .env.example .env          # set POSTGRES_PASSWORD and JWT_SECRET
docker compose up -d --build  # http://localhost:8080
```

Sign in with `admin@adminflow.io` / `Admin@123` (admin) or `editor@adminflow.io` / `Editor@123` (editor).

Add the monitoring stack:

```bash
docker compose --profile monitoring up -d
node scripts/loadtest.mjs http://localhost:8080 300 4   # optional: generate traffic
```

| URL | What |
|---|---|
| http://localhost:8080 | App (nginx → SPA + `/api`) |
| http://localhost:3000/health | API readiness (database check, memory, pool) |
| http://localhost:3000/metrics | Prometheus metrics |
| http://localhost:3001 | Grafana → **AdminFlow - Service Overview** (anonymous view; admin / admin to edit) |
| http://localhost:9090/alerts | Prometheus alert rules |
| http://localhost:9093 | Alertmanager |

If port 8080 is taken, set `HTTP_PORT` in `.env`.

## Local development (without containers for app code)

```bash
docker compose up -d db backend      # Postgres + API on :3000
cd frontend && npm ci && npm run dev # Vite on :5173, proxies /api to :3000
```

Backend tests need a Postgres:

```bash
docker run -d --name af-testdb -p 55432:5432 -e POSTGRES_USER=adminflow -e POSTGRES_PASSWORD=adminflow -e POSTGRES_DB=adminflow_test postgres:17-alpine
cd backend && npm ci
TEST_DATABASE_URL=postgres://adminflow:adminflow@localhost:55432/adminflow_test npm run test:coverage
```

## Project layout

```
backend/                 Express API
  src/app.js             app factory (middleware, routes)
  src/server.js          start-up: wait for DB, migrate, seed, listen, graceful shutdown
  src/db/                pool, migration runner, SQL migrations, seed data
  src/routes/            health, auth, users, dashboard
  src/middleware/        auth (JWT + roles), observability (metrics + access log), errors
  src/metrics.js         Prometheus registry: HTTP RED metrics, DB pool gauges, process metrics
  test/                  integration tests (node:test + supertest, real Postgres)
  Dockerfile             2-stage: prod-only node_modules → slim non-root runtime
frontend/                React SPA (Month 4 app, mock API replaced with a fetch client)
  Dockerfile             2-stage: Vite build → nginx-unprivileged
  nginx.conf.template    SPA routing, asset caching, security headers, /api reverse proxy
docker-compose.yml       app (frontend, backend, db) + `monitoring` profile
monitoring/              Prometheus, alert rules, Alertmanager, Alloy, Grafana provisioning + dashboard
.github/workflows/       CI/CD pipeline
render.yaml              Render Blueprint (production infrastructure as code)
scripts/                 load generator, submission packager
docs/                    deployment, CI/CD, monitoring guides
```

## Documentation

- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md): cloud setup on Render (HTTPS, database, secrets, custom domain), blue-green deploys and rollback, Azure alternative
- [docs/CI-CD.md](docs/CI-CD.md): pipeline stages, triggers, image tagging, required secrets
- [docs/MONITORING.md](docs/MONITORING.md): metrics, dashboard panels, alert rules, log queries, production monitoring

## Design decisions

| Decision | Why |
|---|---|
| nginx proxies `/api` to the API | The browser stays same-origin, so there is no CORS. One frontend image works in every environment because `API_UPSTREAM` is set at runtime. |
| Logs go to stdout as JSON (no log files by default) | 12-factor XI. Docker, Render and Alloy collect stdout. Files in a container are lost on restart. Set `LOG_DIR` to also write files. |
| `/health` (readiness, checks DB) vs `/health/live` (liveness) | The Docker `HEALTHCHECK` uses liveness, so a database blip does not restart healthy API containers. Load balancers and deploy gates use readiness. |
| Migrations run on start under a Postgres advisory lock | With two versions running during a blue-green switch, only one applies migrations. |
| Images tagged `sha-<commit>` | Production runs an exact, tested build, and rollback means redeploying an older tag. |
| Non-root containers, `internal` DB network, `/metrics` token in prod | Smaller attack surface. Postgres has no route to the outside. |
| Metric `route` label uses the pattern (`/api/users/:id`) | Keeps Prometheus cardinality bounded. Raw IDs never become labels. |
