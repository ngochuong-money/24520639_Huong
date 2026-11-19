# TASK_DECOMPOSITION.md — Lab 4: Multi-Route SPA & Express Backend

Workflow per task: [1] Contract → [2] Fail Test → [3] Implement → [4] Refactor
Commits: atomic, conventional (feat / fix / test / docs / init), one scope per commit.

---

# TASK_DECOMPOSITION: Homework 1 — Multi-Route SPA (Photo & Evidence Gallery + Swipe Deck)

## Progress Overview

Update this table whenever a section is finished (count checked tasks / total).

| Section | Done / Total |
|---|---|
| 0. Setup & Baseline | 4 / 4 |
| 1. Contract | 3 / 3 |
| 2. Backend | 5 / 7 |
| 3. Routing & Layout | 0 / 4 |
| 4. Gallery | 0 / 7 |
| 5. Swipe Deck | 0 / 9 |
| 6. Persistence Integration | 0 / 4 |
| 7. Accessibility & Performance | 0 / 6 |
| 8. Verification | 0 / 6 |
| 9. Documentation & Git | 0 / 3 |

**How to tick:** a task is `[x]` only when its commit is made AND verification evidence exists (test output, DevTools screenshot, Lighthouse report). For code tasks, tick the 4 sub-boxes in order: `C` Contract, `T` Fail Test, `I` Implement, `R` Refactor.

## Scope & Assumptions

- Homework 1 combines two specifications in one multi-route React Router v7 SPA:
  - **Gallery:** deep linking with `useSearchParams()` for category filters and modal photo views, a native `<dialog>` lightbox, and full WCAG 2.2 AA with Lighthouse 100/100.
  - **Swipe Deck:** dual keyboard/pointer event listener, LIFO undo stack, asymmetric score calculation via purely derived state, and a full-stack persistence layer (Express + Mongoose 8, async/await).
- Out of scope: Sprint 2 Form/Context work (`FormContext`, `SimpleForm`, `InputField`, `<ShowData />`).
- Open items to confirm against the original assignment:
  - [ ] Exact asymmetric scoring formula
  - [ ] Whether deck cards are the same data as gallery photos or a separate dataset

## Global Rules (apply to EVERY task)

- Follow the **Strict 4-Stage Contract-First Loop**: Contract → Fail Test → Implement → Refactor.
- One atomic commit per task, Conventional Commits (`init`, `docs`, `feat`, `test`, `fix`).
- Never mark a task done without verification evidence.
- Do not give AI a whole sprint as a one-shot prompt; work task by task.
- Prohibited: `<Switch>`, `<Redirect>`, `exact`, `activeClassName`, `ReactDOM.render()`, class components, `defaultProps`, `var`, `keypress`, `keyCode`, `window.alert()`, `dangerouslySetInnerHTML`, `react-media`, `typeface-roboto`, `@material-ui/core`, state mutation, `didCancel` flags, index keys for dynamic lists.

---

## 0. Setup & Baseline

- [x] **0.1** Init Vite + React 19, `createRoot()`, `<StrictMode>`, Automatic JSX Runtime; run the app and check the Console — commit `init: vite react19 setup`
- [x] **0.2** Install `react-router` v7 — commit `init: add react-router`
- [x] **0.3** Create `TASK_DECOMPOSITION.md`, `AI_FAILURE_AUDIT.md`, `server/.env.example`, `.gitignore` (includes `server/.env`) — commit `docs: add task decomposition and audit log`
- [x] **0.4** Configure Vitest + Testing Library and ESLint; `npm test` and `npm run lint` work — commit `test: setup vitest`

## 1. Contract (before any handler code)

- [x] **1.1** API contract: routes, payload schemas, status codes, error format → `docs/API_CONTRACT.md` — commit `docs: api contract`
- [x] **1.2** Interface spec: props, state, route table, query params for every component → `docs/INTERFACES.md` — commit `docs: component interface spec`
- [x] **1.3** Asymmetric scoring rules (point constants per swipe type) and validation rules shared by client and server — commit `docs: scoring and validation rules`

**Proposed API:**

- `GET /api/cards` → 200 `[{ id, ... }]`
- `GET /api/photos?category=` → 200
- `GET /api/swipes` → 200
- `POST /api/swipes` `{ cardId, direction }` → 201; 400 invalid payload; 404 unknown card
- `DELETE /api/swipes/last` (undo) → 200; 404 if stack is empty
- Error shape: `{ "error": { "code", "message" } }`, never leak stack traces

## 2. Backend (Express + Mongoose 8)

- [x] **2.1** Server skeleton, `cors()`, read `process.env.MONGODB_URI`, unified error middleware (no hardcoded connection strings) — commit `feat: express server skeleton`
  - [x] C  [x] T  [x] I  [x] R
- [x] **2.2** Models `Card`, `Photo`, `Swipe` (Mongoose 8, async/await, `.exec()`) — commit `feat: mongoose models`
  - [x] C  [x] T  [x] I  [x] R
- [x] **2.3** Seed script (photos, categories, cards) — commit `feat: seed data`
  - [x] C  [x] T  [x] I  [x] R
- [x] **2.4** GET endpoints for cards, photos, swipes — commit `feat: read endpoints`
  - [x] C  [x] T  [x] I  [x] R
- [x] **2.5** `POST /api/swipes` with server-side validation (parity with client) — commit `feat: swipe create endpoint`
  - [x] C  [x] T  [x] I  [x] R
- [ ] **2.6** `DELETE /api/swipes/last` (LIFO at persistence layer) — commit `feat: undo endpoint`
  - [ ] C  [ ] T  [ ] I  [ ] R
- [ ] **2.7** API tests: status codes, bad payloads, empty stack — commit `test: api endpoints`

## 3. Routing & Layout (Sprint 1)

- [ ] **3.1** `AppLayout` with `<Outlet />`, `<nav>` using `NavLink className={({ isActive }) => ...}`, `<main>` — commit `feat: router layout`
  - [ ] C  [ ] T  [ ] I  [ ] R
- [ ] **3.2** `<Routes>` / `<Route element={...}>`: index route, `/gallery`, `/deck`, `*` — commit `feat: route table`
  - [ ] C  [ ] T  [ ] I  [ ] R
- [ ] **3.3** `React.lazy` + `<Suspense fallback={<Skeleton />}>`; Skeleton has `aria-busy="true"`, `aria-live="polite"`, matches final dimensions (CLS = 0) — commit `feat: lazy routes with skeleton`
  - [ ] C  [ ] T  [ ] I  [ ] R
- [ ] **3.4** Invalid route/ID → `<NotFoundState />` (via `useParams()` where dynamic routes exist) — commit `feat: detail route handling`
  - [ ] C  [ ] T  [ ] I  [ ] R

## 4. Gallery: Deep Linking + Lightbox

- [ ] **4.1** Hook `useGalleryParams`: read/write `?category=` and `?photo=` via `useSearchParams()`; params are untrusted, validate them; derive state from URL (no copy into `useState`) — commit `feat: gallery search params hook`
  - [ ] C  [ ] T  [ ] I  [ ] R
- [ ] **4.2** Category filter (`<nav>` / `<ul>`, `type="button"`, `aria-pressed` or `aria-current`); changing category updates URL — commit `feat: category filter`
  - [ ] C  [ ] T  [ ] I  [ ] R
- [ ] **4.3** Photo grid with `<ul>` / `<li>` / `<figure>` / `<figcaption>`, CSS Grid + `@media` (375–1440px), key = `photo.id` — commit `feat: photo grid`
  - [ ] C  [ ] T  [ ] I  [ ] R
- [ ] **4.4** `Lightbox` with native `<dialog>`: `showModal()` / `close()` synced with `?photo=`; close via Esc, button, backdrop; return focus to thumbnail; complete `useEffect` deps and cleanup — commit `feat: dialog lightbox`
  - [ ] C  [ ] T  [ ] I  [ ] R
- [ ] **4.5** Invalid `?photo=` / `?category=` handling; browser Back/Forward opens/closes modal correctly — commit `feat: invalid param handling`
  - [ ] C  [ ] T  [ ] I  [ ] R
- [ ] **4.6** Previous/next photo in lightbox via `keydown` + `event.key` — commit `feat: lightbox keyboard nav`
  - [ ] C  [ ] T  [ ] I  [ ] R
- [ ] **4.7** Tests: direct link `?category=x&photo=y`, closing modal, invalid params — commit `test: gallery deep linking`

## 5. Swipe Deck

- [ ] **5.1** Pure utils: `undoStack` (push/pop/peek, LIFO) and `calculateScore(swipes)` — commit `feat: undo stack and score utils`
  - [ ] C  [ ] T  [ ] I  [ ] R
- [ ] **5.2** Tests for 5.1 (written first): LIFO order, undo on empty, asymmetric scoring cases — commit `test: stack and score`
- [ ] **5.3** Hook `useSwipeDeck` with `useReducer`: queue + history stack, immutable updates — commit `feat: swipe deck reducer`
  - [ ] C  [ ] T  [ ] I  [ ] R
- [ ] **5.4** Score computed during render (or `useMemo`) from history; never sync derived state with `useEffect` — commit `feat: derived score`
  - [ ] C  [ ] T  [ ] I  [ ] R
- [ ] **5.5** `SwipeCard` with Pointer Events (`onPointerDown/Move/Up/Cancel`, `setPointerCapture`, drag threshold, `touch-action`) — commit `feat: pointer swipe`
  - [ ] C  [ ] T  [ ] I  [ ] R
- [ ] **5.6** Keyboard: `keydown` + `event.key` (ArrowLeft / ArrowRight swipe, `Z` / Backspace undo); equivalent `type="button"` controls; pointer and keyboard dispatch the same reducer action — commit `feat: keyboard swipe`
  - [ ] C  [ ] T  [ ] I  [ ] R
- [ ] **5.7** Undo button disabled when stack is empty; results announced via `aria-live="polite"` (no `alert()`) — commit `feat: undo control`
  - [ ] C  [ ] T  [ ] I  [ ] R
- [ ] **5.8** End-of-deck results summary using `<dl>` with keyed `<Fragment>` groups — commit `feat: results summary`
  - [ ] C  [ ] T  [ ] I  [ ] R
- [ ] **5.9** Tests for reducer and interactions: swipe, multiple undos, keyboard — commit `test: swipe deck behavior`

## 6. Persistence Integration (separate commits for API / hook / tests)

- [ ] **6.1** `api/client.js`: fetch helpers accepting `signal`, `try/catch`, unified error handling; every fetch has `.catch`, ignore `AbortError` — commit `feat: api client`
  - [ ] C  [ ] T  [ ] I  [ ] R
- [ ] **6.2** Hook `useSwipePersistence`: load history, save swipe, undo via API; `AbortController` + `return () => controller.abort()`, no `didCancel` — commit `feat: persistence hook`
  - [ ] C  [ ] T  [ ] I  [ ] R
- [ ] **6.3** Loading/error states; roll back when POST fails; no unhandled rejections — commit `feat: persistence error handling`
  - [ ] C  [ ] T  [ ] I  [ ] R
- [ ] **6.4** Hook tests: mock fetch, verify abort on unmount — commit `test: persistence hook`

## 7. Accessibility, Performance & Responsive

- [ ] **7.1** Semantic HTML audit: landmarks, logical headings, zero div-soup, Fragments instead of extra wrappers — commit `fix: semantic html audit`
- [ ] **7.2** Visible focus, tab order, WCAG 2.2 AA contrast, minimum target size — commit `fix: focus and contrast`
- [ ] **7.3** Images: meaningful `alt`, `width`/`height`, `loading="lazy"` (except LCP image), right-sized assets — commit `perf: image optimization`
- [ ] **7.4** Responsive 375–1440px, no unintended horizontal scroll — commit `fix: responsive layout`
- [ ] **7.5** Lighthouse Accessibility, Best Practices, Performance all 100/100 on production build — commit `perf: lighthouse fixes`
- [ ] **7.6** Validate rendered HTML with W3C Nu HTML Checker — commit `fix: html validation`

## 8. Verification Checklist (collect evidence for each)

- [ ] **8.1** Routing: valid ID, invalid ID, nested layout, deep link opened directly from URL
- [ ] **8.2** DevTools: no Console warnings, clean URL param parsing
- [ ] **8.3** Slow 3G: switch category/route rapidly; in-flight requests show `cancelled` in Network tab
- [ ] **8.4** Accessibility Tree and full keyboard walkthrough (filter, lightbox, swipe, undo)
- [ ] **8.5** `npm run lint`, `npm test`, `npm run build` all pass
- [ ] **8.6** No React key warnings in the Console

## 9. Documentation & Git

- [ ] **9.1** Update `AI_FAILURE_AUDIT.md`: each AI failure (hallucinated APIs, faulty loops, dialog/pointer bugs) with manual verification, fix, and DevTools/test evidence
- [ ] **9.2** Verify history with `git log --graph --oneline --decorate`: atomic commits, correct Conventional Commits
- [ ] **9.3** Prepare the 3-minute live defense: explain reducer, undo stack, dialog↔URL sync, `AbortController`; fix an injected bug without AI

---

## Dependency Order

`0 → 1 → 2` (can run in parallel with `3`) `→ 4` and `5` (parallel, both need 3) `→ 6` (needs 2 + 5) `→ 7 → 8 → 9`

## Definition of Done

- [ ] All 3 Gallery requirements have matching tests or verification evidence
- [ ] All 4 Swipe Deck requirements have matching tests or verification evidence
- [ ] No prohibited APIs or practices in the codebase
- [ ] Lighthouse 100/100; tests, lint and build are green
- [ ] Git history is clean and `AI_FAILURE_AUDIT.md` is complete
