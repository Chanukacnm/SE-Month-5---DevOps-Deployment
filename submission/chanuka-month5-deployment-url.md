# AdminFlow: Production Deployment

> **Status: not deployed yet.** Replace every `TODO` below after following [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md).

| | URL |
|---|---|
| **Production app (HTTPS)** | TODO: `https://adminflow-web.onrender.com` |
| API health | TODO: `https://adminflow-api.onrender.com/health` |
| Source repository | https://github.com/Chanukacnm/SE-Month-5---DevOps-Deployment |
| CI/CD runs | https://github.com/Chanukacnm/SE-Month-5---DevOps-Deployment/actions |
| Container images | https://github.com/Chanukacnm?tab=packages |

## Sign in

| Role | Email | Password |
|---|---|---|
| Admin | `admin@adminflow.io` | `Admin@123` |
| Editor | `editor@adminflow.io` | `Editor@123` |

Editors can create and edit users. Only admins can delete and restore them.

## Platform

| Component | Service |
|---|---|
| Frontend (nginx + React SPA) | Render web service, image `ghcr.io/chanukacnm/se-month-5---devops-deployment/frontend:sha-<commit>` |
| Backend (Express API) | Render web service, image `ghcr.io/chanukacnm/se-month-5---devops-deployment/backend:sha-<commit>` |
| Database | Render managed PostgreSQL 17 (private) |
| HTTPS | Render-managed TLS certificate (HTTP → HTTPS redirect) |
| Deploys | GitHub Actions on push to `main` → Render deploy hook, health-gated zero-downtime switch |

## Verify

```bash
curl -s https://adminflow-api.onrender.com/health | jq '.status, .version, .checks.database'
curl -sI https://adminflow-web.onrender.com | grep -i -E '^HTTP|strict-transport|x-frame'
```

Note: free-tier services sleep after 15 minutes idle, so the first request can take about a minute.
