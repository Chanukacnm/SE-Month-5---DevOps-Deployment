# AdminFlow Dashboard

Admin dashboard SPA for a SaaS platform — Month 4 (Frontend Architecture) challenge.

**Stack:** React 18 · TypeScript (strict) · Vite 5 · Zustand · TanStack React Query 5 · React Router 6 · React Hook Form + Zod · Tailwind CSS 3 · Storybook 8

## Quick start

```bash
npm install
npm run dev              # http://localhost:5173
```

Demo accounts (shown on the login screen):

| Role   | Email                 | Password     |
|--------|-----------------------|--------------|
| Admin  | `admin@adminflow.io`  | `Admin@123`  |
| Editor | `editor@adminflow.io` | `Editor@123` |

Editors can create and edit users. Only admins can delete and restore them.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) + production build to `dist/` |
| `npm run preview` | Serve `dist/` on http://localhost:4173 (use this for Lighthouse) |
| `npm run storybook` | Component library on http://localhost:6006 |
| `npm run build-storybook` | Static Storybook to `storybook-static/` |

## Features

| # | Feature | Where |
|---|---|---|
| 1 | **Auth**: login and logout, persisted session, protected and role-gated routes, redirect back to the requested page | `stores/authStore.ts`, `components/features/auth/` |
| 2 | **Dashboard**: 4 KPI cards, revenue and orders trend chart (accessible SVG), recent activity, quick actions | `pages/DashboardPage.tsx`, `components/features/dashboard/` |
| 3 | **User CRUD**: server-side pagination, sorting, filters; create with validation; edit with optimistic update; delete with confirmation and **soft delete + restore** | `pages/UsersPage.tsx`, `hooks/useUsers.ts`, `api/users.ts` |
| 4 | **Search**: 300 ms debounced search synced to the URL (`?q=`) | `hooks/useDebounce.ts`, `components/features/users/UserFilters.tsx` |
| 5 | **Notifications**: toasts (live regions) and a persistent inbox with a bell popover, mark read, and simulated server push | `stores/notificationStore.ts`, `components/features/notifications/` |
| + | **Multi-step form wizard** (3 steps, per-step validation, cross-field Zod rule) | `components/features/wizard/` |
| + | **Dark mode** (light / dark / system, no flash on load) | `stores/themeStore.ts`, `index.html` |

Since Month 5 the app talks to the real Express + PostgreSQL API in `../backend` through `src/api/client.ts`. Run `docker compose up -d db backend` from the repo root, then `npm run dev` here (Vite proxies `/api` to port 3000). See the root README.

## Quality results (production build)

- **Lighthouse:** 100 / 100 / 100 / 100 (Performance / Accessibility / Best Practices / SEO) on all 5 routes, both mobile and desktop. See `reports/`.
- **axe-core:** 0 WCAG 2.1 A/AA violations across 26 page and state combinations (light + dark).
- **Storybook:** 11 components and 46 stories, each with interaction tests and the a11y addon.

To reproduce the audits, run `npm run preview`, then `cd scripts/audit && npm install && npm run lighthouse && npm run a11y`. The scripts use the locally installed Chrome; update the path in each script if yours is elsewhere.

## Docs

- [docs/architecture.md](docs/architecture.md): architecture decisions
- [docs/accessibility.md](docs/accessibility.md): WCAG 2.1 AA audit
