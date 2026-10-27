# AdminFlow: Accessibility Audit (WCAG 2.1 AA)

**Scope:** every route (`/login`, `/`, `/users`, `/users/onboard`, `/notifications`, 404) plus interactive states (modals, dialogs, popovers, mobile drawer, form errors, wizard steps), in light and dark themes, at desktop (1280 px) and mobile (390 px) widths.
**Build tested:** production build (`npm run build && npm run preview`).
**Date:** 2026-10-27

## 1. Summary

| Check | Tool | Result |
|---|---|---|
| Automated WCAG 2.0/2.1 A+AA rules + best practices | axe-core 4.10 | **0 violations** across 26 page and state combinations |
| Lighthouse accessibility category | Lighthouse 12.2 | **100** on all 5 routes (mobile and desktop) |
| Component-level a11y | Storybook a11y addon + axe | **0 violations** across 46 stories |
| Scripted keyboard and focus checks | Puppeteer (real Chrome) | **22 / 22 pass** |
| Colour contrast (manual calculation) | WCAG relative-luminance formula | All text ≥ 4.5:1; UI boundaries ≥ 3:1 (after fix A-3) |
| Screen reader output | Chrome computed accessibility tree (what screen readers consume), see §5 | Names, roles, states and live regions verified; manual NVDA pass pending |

**Conclusion:** based on the automated, scripted and manual-contrast results above, the application meets WCAG 2.1 Level AA for the tested scope. Five issues were found and fixed during the audit (§6). A manual screen-reader pass (§5b) is still to be ticked off. Known limitations are listed in §7.

## 2. Automated results (axe-core)

States tested in **both light and dark** theme (13 × 2 = 26):

| State | Violations |
|---|---|
| `/login` | 0 |
| `/login` with validation errors shown | 0 |
| `/` Dashboard | 0 |
| `/users` | 0 |
| `/users/onboard` | 0 |
| `/notifications` | 0 |
| 404 page | 0 |
| Users → Create modal with validation errors | 0 |
| Users → Delete confirmation (alertdialog) | 0 |
| Header notification popover open | 0 |
| Mobile (390 px) dashboard | 0 |
| Mobile navigation drawer open | 0 |
| Wizard step 2 with errors | 0 |

The raw output is in `reports/axe.json`.

## 3. Keyboard and focus management (scripted, real browser)

| # | Check | WCAG | Result |
|---|---|---|---|
| 1 | Protected route redirects to `/login` when signed out | — | ✅ |
| 2 | First Tab stop is **"Skip to main content"** | 2.4.1 | ✅ |
| 3 | Failed login shows a `role="alert"` message | 4.1.3 | ✅ |
| 4 | Failed login returns focus to the password field | 3.3.1 | ✅ |
| 5 | Keyboard-only login works and returns to the originally requested page | 2.1.1 | ✅ |
| 6 | Dashboard renders all metric cards | — | ✅ |
| 7 | Route change moves focus to the page `<h1>` | 2.4.3 | ✅ |
| 8 | Route change updates `document.title` (`Users · AdminFlow`) | 2.4.2 | ✅ |
| 9 | Debounced search writes the final query to the URL | — | ✅ |
| 10 | Search filters table rows | — | ✅ |
| 11 | Sortable column exposes `aria-sort="ascending"` after activation | 1.3.1 / 4.1.2 | ✅ |
| 12 | Opening a modal moves focus inside the dialog | 2.4.3 | ✅ |
| 13 | Tab is trapped inside the modal (15 presses) | 2.4.3 | ✅ |
| 14 | Background (`#root`) is `inert` while the modal is open | 1.3.1 | ✅ |
| 15 | Escape closes the modal and **returns focus to the trigger** | 2.1.2 / 2.4.3 | ✅ (after fix A-1) |
| 16 | Edit is visible before the server responds (optimistic) | — | ✅ |
| 17 | Delete dialog puts initial focus on **Cancel** | 3.3.4 | ✅ |
| 18 | Delete confirmation uses `role="alertdialog"` | 4.1.2 | ✅ |
| 19 | Tabs: ArrowRight moves to and selects the next tab | 2.1.1 | ✅ |
| 20 | Wizard moves focus to the step heading on Continue | 2.4.3 | ✅ |
| 21 | Wizard blocks the Access step on the cross-field rule, with the error at the field | 3.3.1 | ✅ |
| 22 | Wizard submit creates the user and navigates | — | ✅ |

### Keyboard map

| Area | Keys |
|---|---|
| Everywhere | Tab / Shift+Tab; visible 2 px focus outline on every interactive element |
| Skip link | First Tab on every page → jumps to `<main>` |
| Modal / dialog | Focus trapped; Esc closes; focus returns to the trigger |
| Mobile drawer | Focus trapped; Esc closes; closes on navigation |
| Notification popover | Esc closes and returns focus to the bell; outside click closes |
| Tabs | ← / → move, Home / End jump (roving tabindex; panel is focusable) |
| Table | Sort buttons in headers; the scroll container is focusable for horizontal scrolling |
| Theme switch | Radio group; arrow keys change theme |

## 4. Colour contrast verification

Ratios computed with the WCAG 2.1 relative-luminance formula. Text needs ≥ 4.5:1 (1.4.3). UI component boundaries and graphics need ≥ 3:1 (1.4.11).

| Pair | Ratio | Requirement | Pass |
|---|---|---|---|
| Body text slate-900 on slate-50 | 17.06:1 | 4.5 | ✅ |
| Secondary text slate-600 on white | 7.58:1 | 4.5 | ✅ |
| Secondary text (dark) slate-400 on slate-900 | 6.96:1 | 4.5 | ✅ |
| Primary button: white on brand-700 | 7.90:1 | 4.5 | ✅ |
| Primary button (dark): slate-950 on brand-500 | 4.52:1 | 4.5 | ✅ |
| Danger button: white on red-700 | 6.47:1 | 4.5 | ✅ |
| Error text red-700 on white | 6.47:1 | 4.5 | ✅ |
| Error text (dark) red-400 on slate-900 | 6.45:1 | 4.5 | ✅ |
| Links brand-700 on white / brand-300 on slate-900 | 7.90:1 / 8.96:1 | 4.5 | ✅ |
| Sidebar text slate-200 on slate-900 | 14.48:1 | 4.5 | ✅ |
| Active nav item: white on brand-800 | 9.93:1 | 4.5 | ✅ |
| Success text emerald-700 on white | 5.48:1 | 4.5 | ✅ |
| Warning badge amber-900 on amber-50 | 8.75:1 | 4.5 | ✅ |
| Placeholder slate-500 on white | 4.76:1 | 4.5 | ✅ |
| **Input border** slate-500 on white (was slate-400, 2.56:1) | 4.76:1 | 3.0 | ✅ (fix A-3) |
| Input border (dark) slate-500 on slate-900 | 3.75:1 | 3.0 | ✅ |
| Focus outline brand-600 on white | 6.29:1 | 3.0 | ✅ |
| Chart lines brand-600 on white / brand-400 on slate-900 | 6.29:1 / 5.98:1 | 3.0 | ✅ |
| Orders chart line emerald-600 on white | 3.77:1 | 3.0 | ✅ |

**Colour is never the only signal.** Alerts and toasts have an icon plus a visually hidden label ("Error:", "Success:"). Metric deltas have an arrow icon and "Up"/"Down" text for screen readers. Invalid fields have a ⚠ icon, an error message and `aria-invalid`. Status badges carry text ("Active", "Inactive", "Deleted").

## 5. Screen reader verification

### 5a. Verified: Chrome accessibility tree (automated)

These values were read from Chrome's computed accessibility tree via the DevTools protocol. That tree is the exact data NVDA, JAWS and VoiceOver consume on Chrome.

| Flow | Computed name / role / state | Result |
|---|---|---|
| Login, submit empty form | `textbox "Email"`, description "Email is required", `invalid=true`, `required`; focus moved to the email field | ✅ |
| Login, wrong password | `role=alert` text: "Error: Sign in failed. Invalid email or password. Check your details and try again." | ✅ |
| Dashboard chart | `image "Monthly revenue from Nov to Oct, rising from $42K to $81.5K."`, plus a visually hidden data table with the same caption | ✅ (after fix A-5) |
| Metric card delta | Text "Up 4.2% vs last month" (arrow icon hidden) | ✅ |
| Notification bell | `button "Notifications, 1 unread"`, `aria-expanded` toggles | ✅ |
| Icon-only row action | `button "Delete Priya Perera"` | ✅ |
| Delete confirmation | `alertdialog "Delete user?"`, description "Priya Perera (…) will lose access immediately. The account is soft-deleted and can be restored…"; focus on "Cancel" | ✅ |
| After delete | Polite live region text: "Warning: User deleted. Priya Perera was moved to Deleted. You can restore them." | ✅ |
| Wizard progress | List item text "Profile — step 1 of 3, current" (`aria-current="step"`) | ✅ |

### 5b. Manual screen reader pass (to complete before submission)

Run with **NVDA + Chrome** (Windows) and tick each row:

- [ ] Login: empty submit announces "Email, edit, required, invalid entry, Email is required"
- [ ] Wrong password: the alert is read automatically
- [ ] Sidebar → Users: "Users · AdminFlow" announced, reading starts at the "Users" heading
- [ ] Search "priya": after a pause, "Showing 1–3 of 3 users" is announced
- [ ] Sort by Name: "sorted ascending" announced
- [ ] Delete flow: the alert dialog text is read; after confirming, the toast is read
- [ ] Dashboard: the chart summary is read, and the table is reachable in browse mode (T key)
- [ ] Wizard: "Step 2 of 3: Access, heading level 2" announced on Continue

## 6. Issues found and fixed during the audit

| ID | Issue | WCAG | Fix |
|---|---|---|---|
| A-1 | After closing a modal with Esc, focus was lost (went to `<body>`). Focus restore ran while `#root` was still `inert`, so `focus()` was ignored. | 2.4.3 | `useFocusTrap` restores focus on the next tick, after `inert` is removed. Verified by check #15. |
| A-2 | The Table loading state dimmed rows to 60 % opacity, which failed text contrast (axe `color-contrast`, ×20 nodes in Storybook). | 1.4.3 | Replaced the opacity with an animated progress bar. Text stays at full contrast. |
| A-3 | Input, select and textarea borders (slate-400 on white) were 2.56:1. axe doesn't check non-text contrast, so manual calculation caught it. | 1.4.11 | Borders changed to slate-500 (4.76:1 light / 3.75:1 dark). |
| A-5 | The chart summary was exposed as both its accessible name and its description (SVG `<title>` + `aria-labelledby`), so it would be read twice. | 1.1.1 (verbosity) | Uses `aria-label` only. Verified in the accessibility tree. |
| A-4 | The disabled "Back" button on wizard step 1 looked identical to an enabled button. | Usability (WCAG doesn't require contrast for disabled controls) | Disabled buttons now render at 60 % opacity with `cursor: not-allowed`. |

## 7. Implementation checklist (where each criterion is met)

| WCAG SC | How |
|---|---|
| 1.1.1 Non-text content | All icons `aria-hidden` and `focusable="false"`. Icon-only buttons have `aria-label` ("Delete Priya Perera", "Close dialog"). The chart has `<title>` + a data table. |
| 1.3.1 Info and relationships | Labels via `<label for>`; errors and hints via `aria-describedby`; `<fieldset>/<legend>` for checkbox groups; tables with `<caption>`, `scope="col"` and row headers; landmarks (`header`, `nav`, `main`, `role="search"`). |
| 1.3.5 Identify input purpose | `autocomplete="email"`, `current-password`, `name`. |
| 1.4.3 / 1.4.11 Contrast | See §4. |
| 1.4.4 / 1.4.10 Resize and reflow | Mobile-first Tailwind layout; no horizontal page scroll at 320 px (wide tables scroll inside a focusable region). |
| 1.4.13 Content on hover | The chart tooltip duplicates information in the hidden table and does not block content. |
| 2.1.1 Keyboard | All functionality is operable by keyboard (§3). Native elements wherever possible. |
| 2.1.2 No keyboard trap | Traps only inside modal dialogs, always escapable with Esc or the Close button. |
| 2.3.3 / reduced motion | `prefers-reduced-motion` disables animations globally; spinners and skeletons use `motion-reduce:`. |
| 2.4.1 Bypass blocks | Skip link on every page. |
| 2.4.2 Page titled | `useDocumentTitle` on each page ("Users · AdminFlow"). |
| 2.4.3 Focus order | Route change → `<h1>`; modal open → first field or Cancel; close → trigger; wizard step → heading. |
| 2.4.6 Headings and labels | One `<h1>` per page; cards use `<h2>`/`<h3>` in order. |
| 2.4.7 Focus visible | Global `:focus-visible` 2 px outline (6.29:1) plus per-component styles. |
| 2.5.3 Label in name | Visible labels match accessible names; hidden text only *extends* them ("Restore Priya Perera"). |
| 3.2.2 On input | Filters update results without moving focus or changing context. |
| 3.3.1 / 3.3.3 Error identification and suggestion | Specific messages ("Enter a valid email address, like name@company.com"); an error summary when several fields fail; server errors mapped to fields. |
| 3.3.2 Labels or instructions | Required fields marked with * (`aria-required`); hints for email, notes count, multi-select usage. |
| 3.3.4 Error prevention | Delete requires confirmation and is a **soft delete** (restorable); the wizard has a review step with a confirmation checkbox. |
| 4.1.2 Name, role, value | `aria-expanded`/`aria-controls` (menu, bell), `aria-selected` (tabs), `aria-current` (nav, page, step), `aria-sort`, `aria-pressed` (show password), `aria-busy` (loading). |
| 4.1.3 Status messages | Toasts in always-mounted `role="status"` (polite) and `role="alert"` (errors) regions, portalled outside the inert root; pagination summary is `aria-live="polite"`; route announcer. |

## 8. Known limitations and follow-ups

1. **Native `<select multiple>`** is accessible, but mouse users need Ctrl/Cmd to pick several options (a hint is shown). A listbox/combobox component would be friendlier.
2. **Chart tooltip** is mouse-only. Keyboard and screen-reader users get the same data from the hidden table. Making data points focusable would be a nice-to-have.
3. **Toast auto-dismiss** (5 s, 10 s for errors). Notifications marked `persist` remain in the inbox, so nothing is lost (2.2.1). A setting to disable auto-dismiss is a follow-up.
4. **Screen reader testing**: the accessibility tree is verified automatically (§5a). The manual NVDA pass (§5b) is still to do, and VoiceOver and TalkBack should follow.
5. **Automated tests** cover the states above. They run as Puppeteer scripts in `scripts/audit/`.
