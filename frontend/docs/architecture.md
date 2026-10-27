# AdminFlow: Architecture Decisions

**Project:** AdminFlow Dashboard (Month 4, Frontend Architecture)
**Stack:** React 18 · TypeScript (strict) · Vite 5 · Zustand 5 · TanStack Query 5 · React Router 6.28 · React Hook Form 7 + Zod 3 · Tailwind CSS 3 · Storybook 8

---

## 1. Overview

```
                    ┌───────────────────────────────────────────────┐
  URL (?q=&page=)──►│  Pages (containers)                           │
                    │  DashboardPage · UsersPage · OnboardPage …    │
                    └───────┬──────────────────┬────────────────────┘
                            │ props            │ hooks
              ┌─────────────▼─────┐    ┌───────▼────────────────────────┐
              │ features/*        │    │ hooks/useUsers, useDashboard   │──► React Query cache
              │ (domain UI)       │    │ (server state)                 │        │
              └─────────┬─────────┘    └────────────────────────────────┘        ▼
              ┌─────────▼─────────┐    ┌────────────────────────────────┐   api/* (mock backend)
              │ common/*          │    │ stores/* (Zustand)             │
              │ (design system)   │    │ auth · notifications · theme · ui
              └───────────────────┘    └────────────────────────────────┘
```

Dependencies only point **downwards**. `common/` components know nothing about the domain, stores or the API. That's what lets them live in Storybook on their own.

### Folder structure

```
src/
├── api/                 # Mock backend: client (latency, cloning), db (seeded + persisted), users, auth, dashboard
├── components/
│   ├── common/          # Design system: Button, Input, Select, Checkbox, Modal, Card, Table, Pagination, Alert, Tabs, Badge… (+ *.stories.tsx)
│   ├── layout/          # AppLayout, Sidebar, Header, ThemeToggle, PageHeader, RouteAnnouncer, SkipLink
│   └── features/        # auth/, dashboard/, users/, notifications/, wizard/
├── hooks/               # useDebounce, useUsers (queries + mutations), useDashboard, useFocusTrap, useDocumentTitle…
├── pages/               # Route components, lazy-loaded (default exports)
├── schemas/             # Zod schemas: user, login, onboarding wizard
├── stores/              # Zustand: authStore, notificationStore, themeStore, uiStore
├── types/               # Shared domain types
├── utils/               # cn, format (Intl), id
└── App.tsx              # QueryClient, router, route guards, toast portal
```

---

## 2. State management

The most important decision in the project was to **classify each piece of state by who owns it**, and pick the tool to match.

| Kind of state | Example | Tool | Why |
|---|---|---|---|
| **Server state** | users list, dashboard metrics | **React Query** | Caching, dedupe, background refetch, `keepPreviousData` for pagination, and optimistic updates with rollback. Copying server data into Zustand would make us maintain a second cache by hand. |
| **Global client state** | session, notifications, theme, mobile drawer | **Zustand** | A few small slices read by distant components (header, sidebar, guards). No provider, selector-based subscriptions, and `persist` middleware for free. |
| **URL state** | search, filters, sort, page, `?new=1` | **`useSearchParams`** | It survives refresh, back/forward works, links can be shared, and it isn't duplicated in a store. |
| **Form state** | create/edit user, wizard | **React Hook Form** | Uncontrolled inputs, so typing doesn't re-render the whole form. Zod resolver for validation. |
| **Local UI state** | which user is being edited, active tab | `useState` | Nothing else needs it. |

### Why Zustand over Redux Toolkit

- The global client state here is small: 4 independent slices with no cross-slice reducers. Redux's action/reducer ceremony and provider add little value at this size.
- Zustand selectors (`useAuthStore((s) => s.user)`) re-render a component only when its slice changes. That's the same benefit as `useSelector`, at roughly 1 kB.
- Stores can also be used **outside React**: `notify()` is called from React Query `onSuccess`/`onError` callbacks via `useNotificationStore.getState()`.
- If the app grew to need time-travel debugging, normalised entities or complex cross-slice logic, RTK + RTK Query would be the next step.

### Store design notes

- **`authStore`**: `user`, `token`, `isLoading`, `error`, `login()`, `logout()`. `persist` uses `partialize` so only `user` and `token` are saved, never transient flags like `isLoading`. Selector hooks (`useCurrentUser`, `useIsAuthenticated`) keep subscriptions narrow.
- **`notificationStore`**: two collections with different lifetimes. `toasts` are ephemeral and auto-dismiss (errors stay twice as long). `notifications` is the inbox: persisted and capped at 50. `notify({ persist: true })` writes to both.
- **`themeStore`**: `light | dark | system`. An inline script in `index.html` applies the class **before first paint**, so there is no flash. `watchSystemTheme()` follows OS changes while the app is set to "system".
- **`uiStore`**: the mobile drawer's open state, shared between the header button and the sidebar.

### Server state details (`hooks/useUsers.ts`)

- **Query key factory** (`userKeys.list(params)`, `userKeys.detail(id)`) keeps cache keys consistent, so we can invalidate everything with `userKeys.all`.
- **Optimistic update (edit)**: `onMutate` cancels in-flight list queries, snapshots every cached list page, patches the row in place, and returns the snapshot. `onError` restores it. `onSettled` refetches. The edit modal closes immediately, and the table already shows the change.
- **Optimistic delete**: the row is removed at once and the total decremented, with the same rollback path.
- **Soft delete**: the API sets `deletedAt` instead of removing the record. Deleted users appear under the *Deleted* status filter and can be restored (admins only).

---

## 3. Component architecture

| Pattern | Where | Notes |
|---|---|---|
| **Atomic design** | `common/` holds atoms (Button, Input, Badge) and molecules (Field, Pagination, Alert); `features/` holds organisms (UserFilters, NotificationBell); `pages/` are templates and pages | Atoms are styled once and reused everywhere |
| **Container / presentational** | `DashboardPage` fetches → `MetricCard`, `ActivityList`, `LineChart` only render props (and are `memo`ised) | Presentational components are trivially story-able and testable |
| **Compound components** | `<Card><Card.Header/><Card.Body/><Card.Footer/></Card>` | Consumers compose slots; the Card owns spacing and borders |
| **Custom hooks (replacing render props)** | `useFocusTrap`, `useDebounce`, `useClickOutside`, `useUserList` | Behaviour is reused without wrapper components |
| **Generic components** | `Table<T>` with typed `Column<T>[]` | The same table works for any row type and keeps type safety in `cell` renderers |
| **forwardRef everywhere a form control is** | `Input`, `Select`, `Checkbox`, `Button` | Required for RHF's `register()` and for focus management (`initialFocusRef`) |

### Forms

- **One schema per form**, in `schemas/`. Types are inferred with `z.infer`, so the schema is the single source of truth for both validation and TS types.
- `UserForm` is shared between create and edit. The submit button sits in the modal footer and targets the form via the `form="user-form"` attribute, so the form isn't coupled to the modal.
- **Server errors** such as a duplicate email are mapped back onto the field with `setError('email', …)`.
- **Wizard** (`OnboardingWizard`): one `useForm` for all steps, with `shouldUnregister: false` so values survive unmounting. "Continue" calls `trigger(stepFields)` to validate only the current step. A **cross-field rule** (billing permission requires the admin role) is a Zod `.refine` with `path: ['permissions']`. If a full-schema error appears on submit, `onInvalid` jumps back to the step that owns the field.

---

## 4. Routing and auth

- `createBrowserRouter` with a public `/login` and a protected layout route. `ProtectedRoute` wraps `AppLayout`, so every child route is guarded in one place.
- Unauthenticated users go to `/login` with `state.from`; after sign-in they return to the page they asked for.
- **Role-based access**: `<ProtectedRoute roles={['admin','editor']}>` guards `/users/onboard`. Inside pages, actions are hidden by role (only admins see delete and restore).
- The token is an opaque mock value. With a real backend, the API client would attach it as `Authorization: Bearer …`, and a 401 handler would call `logout()`.

---

## 5. Performance (Lighthouse 100 on every route, mobile and desktop)

| Technique | Effect |
|---|---|
| **Route-level code splitting** (`React.lazy` + `Suspense`) | Each page is its own chunk (1–16 kB). |
| **Vendor `manualChunks`** (react / data / forms) | Libraries cache independently of app code. **Forms (RHF + Zod, 22 kB gz) are not on the initial request**: only `index`, `react` and `data` are preloaded. |
| **Dependency-free SVG chart** | A charting library such as Recharts would add about 100 kB gz. The custom chart is about 3 kB. |
| **System font stack + inline SVG icons** | No font or icon requests, and no FOIT/CLS from fonts. |
| **Skeletons with fixed dimensions** | CLS ≤ 0.005. |
| **`keepPreviousData`** on paginated queries | The old page stays visible while the next loads, with no empty-table flash. |
| **`memo`** on `MetricCard` and `ActivityList` | Prevents re-renders when unrelated dashboard state such as the chart tab changes. Applied only to pure presentational leaves; "memoize wisely". |
| **Debounced search** (300 ms) | Typing "priya" makes one request, not five. |

**Initial JS (gzip):** index 12.5 kB + react 65.5 kB + data 14 kB, plus CSS 6.6 kB.

**Virtualisation:** not needed. The list is server-paginated at 10 rows. If a page ever had to render thousands of rows, `@tanstack/react-virtual` would slot into `Table`'s `tbody`.

---

## 6. Error and loading strategy

- **Two error boundaries**: an app-level one in `App.tsx`, and a route-level one in `AppLayout` keyed on `pathname`. A crashing page leaves the navigation usable, and navigating away resets the boundary.
- **Query errors** render an inline `Alert` with a **Retry** button (`refetch`).
- **Mutation errors** produce an error toast (assertive live region) and roll back optimistic changes.
- **Loading**: skeletons on first load, a progress bar on the table during refetch, an inline spinner in the search box, and `aria-busy` on busy regions. Buttons show a spinner and `aria-busy` while submitting.

---

## 7. Trade-offs and next steps

| Decision | Trade-off |
|---|---|
| Mock API in the browser | It makes the project self-contained, but errors are deterministic only for "duplicate email" and "invalid login". Swapping `api/client.ts` for `fetch` is the only change needed for a real backend. |
| Native `<select>` (including `multiple`) | You get keyboard, screen-reader and mobile support for free, but limited styling. A combobox (Headless UI / Radix) would be the upgrade path. |
| Token in `localStorage` | Simple for a demo. For production, prefer an httpOnly cookie session to reduce XSS exposure. |
| `robots.txt` allows crawling | Only `/login` is reachable without auth. For production, add `X-Robots-Tag: noindex` on the server. |
