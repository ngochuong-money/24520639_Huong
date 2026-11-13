# TASK_DECOMPOSITION.md — Lab 4: Multi-Route SPA & Express Backend

Workflow per task: [1] Contract → [2] Fail Test → [3] Implement → [4] Refactor
Commits: atomic, conventional (feat / fix / test / docs / init), one scope per commit.

---

## Block 1 — Setup & WBS (0–40m)
- [ ] 1.0.1 Scaffold React app + `server/` Express folder → `init: scaffold lab 4 multi-route SPA`
- [ ] 1.0.2 Write `project-rules.md` (4-stage loop, commit rules, banned patterns) → `docs: define contract spec in project-rules.md`
- [ ] 1.0.3 Write this file (`TASK_DECOMPOSITION.md`)
- [ ] 1.0.4 `.env` with `MONGODB_URI`, add to `.gitignore`
- [ ] 1.0.5 Create `AI_FAILURE_AUDIT.md` and log AI failures from now on

---

## Sprint 1 — Router Migration, Master-Detail (40–75m)
Deliverables: `PeopleLayout.jsx`, `PersonDetail.jsx`
Commits (required, 2): `feat: router layout`, `feat: detail route handling`

### Ex 1.1 — Lazy loading & resiliency
- [ ] Contract: `PersonDetail` is a default export, loaded per route
- [ ] `const PersonDetail = React.lazy(() => import('./PersonDetail'))`
- [ ] Wrap route in `<Suspense fallback={<Skeleton aria-busy="true" aria-live="polite" />}>`
- [ ] Skeleton dimensions match real content (CLS = 0)

### Ex 1.2 / 1.2.1 — React Router v7 syntax & layout
- [ ] Replace `<Switch>` with `<Routes>` (no `<Redirect>`, no `exact`)
- [ ] Use `element={<Layout />}` prop syntax
- [ ] Nested routes: parent layout renders children via `<Outlet />`
- [ ] Index route (`<Route index element={<Home />} />`)
- [ ] `NavLink` with `className={({ isActive }) => ...}`
- [ ] **Commit 1:** `feat: router layout`

### Ex 1.2.2 — Master-detail with CSS Grid
- [ ] `PeopleLayout`: grid `grid-template-columns: minmax(280px, 1fr) 2fr`, list on the left, `<Outlet />` on the right
- [ ] `PersonDetail`: `const { id } = useParams()`
- [ ] Find entity with `people.find(p => p.id === id)`
- [ ] If not found, render `<NotFoundState />` (404)
- [ ] Render fields with semantic `<dl>`, `<dt>`, `<dd>`
- [ ] **Commit 2:** `feat: detail route handling`

### Checkpoint
- [ ] DevTools: no console warnings
- [ ] URL param parsing is clean (valid id, invalid id, missing id)

---

## Sprint 2 — Context Form Engine (75–120m)
Deliverables: `SimpleForm.jsx`, `InputField.jsx`, `FormContext.tsx`, `<ShowData />`
Commits (required, 3): `feat: form context`, `feat: input field validation`, `feat: inspector output`

- [ ] Contract: define `FormState`, `rules` shape, `errors` shape
- [ ] Fail test: `evaluateErrors(values, rules)` and `isValid`
- [ ] `FormContext` + `FormProvider`: `errors` and `isValid` computed synchronously during render (**no `useEffect`**) → **Commit 1:** `feat: form context`
- [ ] `InputField`: `useId()` for stable binding, `aria-invalid`, `aria-describedby` → error message → **Commit 2:** `feat: input field validation`
- [ ] `SimpleForm`: compose fields, submit only when `isValid`
- [ ] `<ShowData />`: live JSON inspector after valid submit → **Commit 3:** `feat: inspector output`
- [ ] Refactor with tests green; confirm no effect loops

---

## Sprint 3 — Full-Stack Custom Hook & Express API (120–155m)
Related: Ex 1.7.1 (Data Fetching & Express Hygiene)
Commits: not fixed by the slides, split atomically

### Backend
- [ ] Contract: `GET /api/channels/:channelId/messages`, `POST` payload schema, error codes
- [ ] Mongoose 8 connection via `process.env.MONGODB_URI` (no hardcoded string)
- [ ] `Message` model + async/await handlers (`.exec()`), no callbacks
- [ ] `cors()` middleware
- [ ] Strict POST payload validation (must match client rules)
- [ ] try/catch on all handlers, no unhandled rejections

### Frontend
- [ ] `useForumMessages(channelId)` in `useForumMessages.js`
- [ ] `AbortController` in `useEffect`, pass `signal` to `fetch`, `return () => controller.abort()`
- [ ] Ignore `AbortError` in `.catch`, log other errors
- [ ] Dependency array `[channelId]`
- [ ] UI: channel switcher (`nasa`, `esports-tribunal`, `notNasa`)
- [ ] Render with `<React.Fragment key={msg.id}>` inside `<dl>`

### Verification
- [ ] Chrome DevTools → Slow 3G → switch channels rapidly
- [ ] Confirm in-flight requests are cancelled (screenshot Network tab)
- [ ] Save full-stack error log

---

## Block 5 — Defense & AI Audit (155–180m) — 15% of lab grade

### Live defense (3 min)
- [ ] Explain architecture and module relationships (router → context → hook → API → DB)
- [ ] Defend state choices: local vs global (Context) vs persistent (MongoDB)
- [ ] Practice fixing injected bugs: missing deps, missing key, missing abort/cleanup, wrong param

### `AI_FAILURE_AUDIT.md`
- [ ] AI code failures: log every non-functional AI output
- [ ] Hallucinated APIs & loops: phantom methods, broken effect loops
- [ ] Engineering verification: manual analysis and exact steps taken to fix

### Final checks
- [ ] `git log --graph --oneline --decorate` shows clean atomic history
- [ ] Verification contract: contract-first API, client/server validation parity, zero unhandled rejections, deterministic single-pass state updates