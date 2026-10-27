# CI/CD pipeline

The pipeline lives in [`.github/workflows/ci-cd.yml`](../.github/workflows/ci-cd.yml).

```
 PR → main ─┐
 push develop┼─▶ backend: lint + integration tests (Postgres service) + coverage ─┐
 push main ──┘   frontend: typecheck + unit tests + build ───────────────────────┼─▶ smoke: docker compose up --wait,
                                                                                  │   real requests through nginx
                                                                                  ▼
                                    push only ─▶ images: build & push backend + frontend to GHCR (matrix, layer cache)
                                                                                  ▼
                                    main only ─▶ deploy: Render hook (exact sha image) → wait for /health version → smoke test prod
```

## Jobs

| Job | Runs on | What it proves |
|---|---|---|
| **backend** | every trigger | ESLint passes. 25 integration tests pass against a real PostgreSQL 17 service container (auth, RBAC, CRUD, pagination, soft delete, metrics, health). Coverage goes to an lcov artifact. |
| **frontend** | every trigger | `tsc` strict typecheck, Vitest (API client), production Vite build |
| **smoke** | after both | The **real images** build, the stack becomes healthy (`--wait`), and through nginx the SPA, SPA fallback routing, login, users and dashboard API all work |
| **images** | push to `main` / `develop` | Buildx builds both images with a per-service GitHub Actions layer cache and pushes them to `ghcr.io/<owner>/<repo>/{backend,frontend}` |
| **deploy** | push to `main`, or manual rollback | Triggers Render with the exact `sha-<commit>` image, waits until `/health` reports that version, deploys the frontend, then smoke-tests production |

## Triggers

| Event | Result |
|---|---|
| Pull request to `main` | Tests + smoke only. Nothing is pushed. Superseded runs are cancelled. |
| Push to `develop` | Tests + images tagged `develop` and `sha-<commit>` (staging candidates) |
| Push to `main` | Tests + images tagged `latest` and `sha-<commit>`, then **production deploy** |
| Manual (`workflow_dispatch`) with `rollback_tag` | Skips build. Redeploys an existing image, e.g. `sha-1a2b3c4` |

Deploys never cancel each other mid-flight (`cancel-in-progress` applies to PRs only).

## Image tags

| Tag | Meaning |
|---|---|
| `sha-<7 chars>` | Immutable. This is what gets deployed. |
| `latest` | Last build from `main` |
| `develop` | Last build from `develop` |

The backend image is built with `APP_VERSION=sha-<full sha>`. `/health` and every log line report it, so the deploy job can confirm the new version is live.

## Required configuration

Settings → Environments → **production**:

| Type | Name | Value |
|---|---|---|
| Secret | `RENDER_DEPLOY_HOOK_BACKEND` | Render → adminflow-api → Settings → Deploy Hook |
| Secret | `RENDER_DEPLOY_HOOK_FRONTEND` | Render → adminflow-web → Settings → Deploy Hook |
| Variable | `API_URL` | e.g. `https://adminflow-api.onrender.com` |
| Variable | `PRODUCTION_URL` | e.g. `https://adminflow-web.onrender.com` or your custom domain |

Pushing to GHCR uses the built-in `GITHUB_TOKEN` (`packages: write` on that job only). No registry secret is needed.

Optional: add required reviewers to the `production` environment so a person approves each production deploy.

## Possible improvements

- Run Playwright end-to-end tests against the smoke stack
- Scan images (Trivy or Grype) and upload the SARIF to code scanning
- Add a staging environment deployed from `develop`, and promote the same image to production
- Use Dependabot for npm, Docker base images and GitHub Actions versions (config included in `.github/dependabot.yml`)
