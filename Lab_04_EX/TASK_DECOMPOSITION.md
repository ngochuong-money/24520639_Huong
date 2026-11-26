# TASK_DECOMPOSITION.md — Lab 4: Multi-Route SPA & Express Backend

Workflow per task: [1] Contract → [2] Fail Test → [3] Implement → [4] Refactor
Commits: atomic, conventional (feat / fix / test / docs / init), one scope per commit.

---

## Block 1 — Setup & WBS (0–40m)
- [x] 1.0.1 Scaffold React app + `server/` Express folder → `init: scaffold lab 4 multi-route SPA`
- [x] 1.0.2 Write `project-rules.md` (4-stage loop, commit rules, banned patterns) → `docs: define contract spec in project-rules.md`
- [x] 1.0.3 Write this file (`TASK_DECOMPOSITION.md`)
- [x] 1.0.4 `.env` with `MONGODB_URI`, add to `.gitignore`
- [x] 1.0.5 Create `AI_FAILURE_AUDIT.md` and log AI failures from now on

---

## Sprint 1 — Router Migration, Master-Detail (40–75m)
Deliverables: `PeopleLayout.jsx`, `PersonDetail.jsx`
Commits (required, 2): `feat: router layout`, `feat: detail route handling`

### Ex 1.1 — Lazy loading & resiliency
- [x] Contract: `PersonDetail` is a default export, loaded per route
- [x] `const PersonDetail = React.lazy(() => import('./PersonDetail'))`
- [x] Wrap route in `<Suspense fallback={<Skeleton aria-busy="true" aria-live="polite" />}>`
- [x] Skeleton dimensions match real content (CLS = 0)
### Ex 1.1 — Lazy loading & resiliency
- [x] Contract:
  - Data: `src/data/people.js` exports `people` (array of `{ id: string, name: string, role: string }`)
  - `src/PersonDetail.jsx` has `export default function PersonDetail()` (no props)
  - Reads `id` via `useParams()`, finds the person in `people`
  - Valid id → renders `<dl className="person-details">` with name and role
  - Invalid id → renders `<NotFoundState />`
  - Loaded per route via `lazy(() => import('./PersonDetail'))` at module level
  - Rendered inside `<Suspense fallback={<Skeleton aria-busy="true" aria-live="polite" />}>` in the child route of `PeopleLayout`
  - `<Skeleton />` shares the `.detail-pane` frame with the real content, so dimensions match (CLS = 0)

### Ex 1.2 / 1.2.1 — React Router v7 syntax & layout
- [x] Replace `<Switch>` with `<Routes>` (no `<Redirect>`, no `exact`)
- [x] Use `element={<Layout />}` prop syntax
- [x] Nested routes: parent layout renders children via `<Outlet />`
- [x] Index route (`<Route index element={<Home />} />`)
- [x] `NavLink` with `className={({ isActive }) => ...}`
- [x] **Commit 1:** `feat: router layout`

### Ex 1.2.2 — Master-detail with CSS Grid
- [x] `PeopleLayout`: grid `grid-template-columns: minmax(280px, 1fr) 2fr`, list on the left, `<Outlet />` on the right
- [x] `PersonDetail`: `const { id } = useParams()`
- [x] Find entity with `people.find(p => p.id === id)`
- [x] If not found, render `<NotFoundState />` (404)
- [x] Render fields with semantic `<dl>`, `<dt>`, `<dd>`
- [x] **Commit 2:** `feat: detail route handling`

### Checkpoint
- [x] DevTools: no console warnings
- [x] URL param parsing is clean (valid id, invalid id, missing id)

---

## Sprint 2 — Context Form Engine (75–120m)
Deliverables: `SimpleForm.jsx`, `InputField.jsx`, `FormContext.tsx`, `<ShowData />`
Commits (required, 3): `feat: form context`, `feat: input field validation`, `feat: inspector output`

- [x] Contract: define `FormState`, `rules` shape, `errors` shape
- [x] Fail test: `evaluateErrors(values, rules)` and `isValid`
- [x] `FormContext` + `FormProvider`: `errors` and `isValid` computed synchronously during render (**no `useEffect`**) → **Commit 1:** `feat: form context`
- [x] `InputField`: `useId()` for stable binding, `aria-invalid`, `aria-describedby` → error message → **Commit 2:** `feat: input field validation`
- [x] `SimpleForm`: compose fields, submit only when `isValid`
- [x] `<ShowData />`: live JSON inspector after valid submit → **Commit 3:** `feat: inspector output`
- [x] Refactor with tests green; confirm no effect loops

---

## Sprint 3 — Full-Stack Custom Hook & Express API (120–155m)
Related: Ex 1.7.1 (Data Fetching & Express Hygiene)
Commits: not fixed by the slides, split atomically

### Backend
- [x] Contract: `GET /api/channels/:channelId/messages`, `POST` payload schema, error codes
- [x] Mongoose 8 connection via `process.env.MONGODB_URI` (no hardcoded string)
- [x] `Message` model + async/await handlers (`.exec()`), no callbacks
- [x] `cors()` middleware
- [x] Strict POST payload validation (must match client rules)
- [x] try/catch on all handlers, no unhandled rejections

### Frontend
- [x] `useForumMessages(channelId)` in `useForumMessages.js`
- [x] `AbortController` in `useEffect`, pass `signal` to `fetch`, `return () => controller.abort()`
- [x] Ignore `AbortError` in `.catch`, log other errors
- [x] Dependency array `[channelId]`
- [x] UI: channel switcher (`nasa`, `esports-tribunal`, `notNasa`)
- [x] Render with `<React.Fragment key={msg.id}>` inside `<dl>`

### Verification
- [x] Chrome DevTools → Slow 3G → switch channels rapidly
- [x] Confirm in-flight requests are cancelled (screenshot Network tab)
- [x] Save full-stack error log

---

## Block 5 — Defense & AI Audit (155–180m) — 15% of lab grade

### `AI_FAILURE_AUDIT.md`
- [x] AI code failures: log every non-functional AI output
- [x] Hallucinated APIs & loops: phantom methods, broken effect loops
- [x] Engineering verification: manual analysis and exact steps taken to fix

### Final checks
- [x] `git log --graph --oneline --decorate` shows clean atomic history
- [x] Verification contract: contract-first API, client/server validation parity, zero unhandled rejections, deterministic single-pass state updates
