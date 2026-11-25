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
| 2. Backend | 7 / 7 |
| 3. Routing & Layout | 4 / 4 |
| 4. Gallery | 8 / 8 |
| 5. Swipe Deck | 8 / 9 |
| 6. Persistence Integration | 4 / 4 |
| 7. Accessibility & Performance | 6 / 6 |
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
- [x] **2.6** `DELETE /api/swipes/last` (LIFO at persistence layer) — commit `feat: undo endpoint`
  - [x] C  [x] T  [x] I  [x] R
- [x] **2.7** API tests: status codes, bad payloads, empty stack — commit `test: api endpoints`
  - Verification: 93 real MongoDB API tests passed on `lab04_hw_test`; client 82/82, server unit 134/134, lint and build passed. Initial red: missing `test:api` script. Deliberate LIFO mutation failed 1 test; category-filter mutation failed 2 tests; both files restored and the full suite passed afterward. Dev database document hashes were unchanged (10 cards, 12 photos, 1 swipe). The test database has a unique `cardId_1` index. Unavailable port 27999 produced the expected connection error after about 3 seconds per file (about 20 seconds for all 5 files). These deliberate mutations are test evidence, not AI implementation failures. Terminal output is recorded in the session; screenshots and a Compass walkthrough were not captured.

## 3. Routing & Layout (Sprint 1)

- [x] **3.1** `AppLayout` with `<Outlet />`, `<nav>` using `NavLink className={({ isActive }) => ...}`, `<main>` — commit `feat: router layout`
  - [x] C  [x] T  [x] I  [x] R
- [x] **3.2** `<Routes>` / `<Route element={...}>`: index route, `/gallery`, `/deck`, `*` — commit `feat: route table`
  - [x] C  [x] T  [x] I  [x] R
- [x] **3.3** `React.lazy` + `<Suspense fallback={<Skeleton />}>`; Skeleton has `aria-busy="true"`, `aria-live="polite"`, matches final dimensions (CLS = 0) — commit `feat: lazy routes with skeleton`
  - [x] C  [x] T  [x] I  [x] R
  - Verification: client 112/112, server unit 134/134 and MongoDB API 93/93 tests passed; lint and build passed. Build emitted separate GalleryPage and DeckPage chunks. Initial red was captured by running the Skeleton test alone (missing Skeleton.jsx); the full pre-implementation client run was interrupted because the async mock gates waited on the old static page imports. Chrome with cache disabled, Slow 3G and paused page-module requests verified both fallbacks at 375px: header/nav remained visible, gallery had 12 tiles, deck had a card and 3 controls, live regions were polite, title height stayed 40px and there was no horizontal overflow or console error/warning. The sampled layout-shift observer recorded no entries with the current title-only pages; this is not a final CLS audit. Repeat layout parity checks with real gallery/deck content and Lighthouse in later tasks. Headless screenshots were blank and are not usable report evidence.
- [x] **3.4** Not-found handling: the catch-all route (built in 3.2) is pinned by edge-case tests; Homework 1 has no dynamic path routes, so `useParams()` is not used — commit `test: not-found route handling`
  - [x] C  [x] T  [x] I (no production change)  [x] R
  - Verification: 13 new edge-case tests passed. Removing the catch-all caused 15 client test failures; case-sensitive gallery matching caused exactly the `/GALLERY` test to fail. Both mutations were restored byte-for-byte. Client 125/125, server unit 134/134, MongoDB API 93/93, lint and build passed. Chrome confirmed `/gallery/64f1a2b3c4d5e6f7a8b9c0d1` renders Page not found inside the layout with one main and one h1, `/GALLERY` renders Gallery and the console has no errors/warnings. Mutation results are deliberate test evidence, not AI implementation failures; screenshots were not captured.

## 4. Gallery: Deep Linking + Lightbox

Implementation order: complete 4.8 (`usePhotos`) before 4.2 so loaded photos are available for the category filter and the existence checks in 4.5. Task 4.1 validates formats only and does not depend on loaded photos.

- [x] **4.1** Hook `useGalleryParams`: read/write `?category=` and `?photo=` via `useSearchParams()`; params are untrusted, validate them; derive state from URL (no copy into `useState`) — commit `feat: gallery search params hook`
  - [x] C  [x] T  [x] I  [x] R
- [x] **4.2** Category filter (`<nav>` / `<ul>`, `type="button"`, `aria-pressed`); parent connects selection to `setCategory` — commit `feat: category filter`
  - [x] C  [x] T  [x] I  [x] R
  - Verification: initial client run failed because CategoryFilter.jsx was missing; all 11 supplied component tests passed after implementation. Forcing `aria-pressed={false}` caused 4 failures; the original file was restored and client 161/161, server unit 134/134, MongoDB API 93/93, lint and build passed. The fixed-height `filter-row` class is reused without duplicating its overflow rule. Component tests dispatch clicks explicitly after key events; real keyboard activation, visual checks and changing the URL through GalleryPage remain integration checks for 4.3/4.5. Terminal results are recorded in the session; screenshots were not captured.
- [x] **4.3** Photo grid with `<ul>` / `<li>` / `<figure>` / `<figcaption>`, shared responsive CSS Grid, key = `photo.id` — commit `feat: photo grid`
  - [x] C  [x] T  [x] I  [x] R
  - Verification: initial client run failed because PhotoGrid.jsx was missing; all 10 supplied grid tests passed after implementation. Client 171/171, server unit 134/134, MongoDB API 93/93, lint and build passed. Source inspection confirmed `photo.id` keys and no prohibited wrappers or HTML injection. Temporarily using index keys still passed the supplied tests without React warnings; the original source was restored, so that mutation is a documented test limitation, not evidence of stable keys. The component is not yet mounted in GalleryPage: browser keyboard, responsive geometry, Accessibility Tree for `figure` with `display: contents`, and skeleton parity/CLS checks remain for integration in 4.5 and the later accessibility/performance audits. No screenshot evidence is claimed.
- [x] **4.4** `Lightbox` with native `<dialog>`: `showModal()` / `close()` driven by the `photo` prop; native close event, button/backdrop close and opener focus restoration; URL integration in 4.5 — commit `feat: dialog lightbox`
  - [x] C  [x] T  [x] I  [x] R
  - Verification: initial red was missing Lightbox.jsx. With the approved focus-test setup and native-dialog ESLint configuration, all 19 lightbox tests passed; client 190/190, server unit 134/134, MongoDB API 93/93, lint and build passed. Removing focus restoration failed 2 tests; removing the open guard failed the opener-preservation test; both files were restored before the final green run. One effect with `[photo]` is used without a closing cleanup by design. The component is not yet connected to GalleryPage: real-browser Esc, modal focus behaviour, backdrop and URL Back/Forward verification remain for 4.5. No screenshot evidence is claimed.
- [x] **4.5** Invalid `?photo=` / `?category=` handling; browser Back/Forward opens/closes modal correctly — commit `feat: invalid param handling`
  - [x] C  [x] T  [x] I  [x] R
  - Verification: integrated usePhotos, useGalleryParams, CategoryFilter, PhotoGrid and Lightbox. Initial test run against the placeholder page failed; with approved test-selector/probe fixes and raw-param validation, all 18 GalleryPage tests passed. Client 208/208, server unit 134/134, MongoDB API 93/93, lint and build passed. Real Chrome under StrictMode verified thumbnail push, Back close/Forward reopen, native Esc/backdrop close, opener focus, filtered arrow navigation, unknown/malformed parameters without URL rewrites, direct deep links and no console errors/warnings. The viewport was checked at 375px without horizontal page overflow. Category changes while modal were invoked programmatically because native modal makes background controls inert to pointer input. Gallery and Lightbox screenshots are in docs/evidence/4.5-gallery-desktop.png and docs/evidence/4.5-lightbox-desktop.png; final CLS/accessibility audits remain later tasks.
- [x] **4.6** Previous/next photo in lightbox via `keydown` + `event.key`; preserve focus when a navigation button becomes disabled — commit `feat: lightbox keyboard nav`
  - [x] C  [x] T  [x] I  [x] R
  - Verification: added 5 Lightbox and 2 GalleryPage tests. Both missing-focus tests were red before implementation; the initial legacy-key test also failed because React normalizes keyCode-only events. With the approved explicit-key test correction, client 215/215, server unit 134/134, MongoDB API 93/93, lint and build passed. Removing the two focus calls made both focus tests fail; the original file was restored. The page test now opens from the grid and asserts Back returns directly to that grid after arrow navigation, proving replace semantics in MemoryRouter. Chrome separately verified native Enter at both list boundaries, focus transfer to the enabled neighbour, filtered arrow navigation, browser Back/Forward, Escape/thumbnail focus, direct deep links and no focus stealing from Close. Tab/Shift+Tab kept focus inside the modal whenever the document had focus; browser-chrome focus transfers were observed separately. Two effects remain, no global keyboard listener and no prohibited keyboard API in production source. No new screenshots were captured.
- [x] **4.7** Tests: direct link `?category=x&photo=y`, closing modal, invalid params — commit `test: gallery deep linking`
  - [x] C  [x] T (existing behaviour, integration verification)  [x] I (no production change)  [x] R
  - Verification: 13 App-level integration tests passed with fresh MemoryRouter trees and mocked photo data. Reused the user's approved 4.5 decisions: DOM location probe, grid-scoped counts and a status message for malformed photo IDs. Client 228/228, server unit 134/134, MongoDB API 93/93, lint and build passed; no fixed sleeps in the new test. MemoryRouter is not BrowserRouter or a page-load proof: separate real Chrome checks verified direct deep links, F5 preserving the open photo, native Escape preserving category, unknown IDs without URL rewrites and a clean console. IDs came from the real API backed by MongoDB, not a Compass walkthrough. Existing 4.5 screenshots remain UI evidence; no new screenshots were captured.
- [x] **4.8** `usePhotos`: load `GET /api/photos`, expose `{ photos, status, error }`, and cancel obsolete requests with `AbortController` — commit `feat: photos hook`
  - Verification: implemented the supplied hook and minimal `getPhotos` client, with `/api` proxied to Express on port 5000. Lint, build and existing client/server/API suites passed. No dedicated hook lifecycle test or connected GalleryPage UI verification was supplied in this task; integration remains to be checked when the gallery is assembled.

## 5. Swipe Deck

- [x] **5.1** Pure utils: `undoStack` (push/pop/peek, LIFO) and `calculateScore(swipes)` — commit `feat: undo stack and score utils`
  - [x] C  [x] T  [x] I  [x] R
- [x] **5.2** Tests for 5.1 (written first): LIFO order, undo on empty, asymmetric scoring cases — merged into commit `feat: undo stack and score utils` (no separate red-test commit)
  - [x] C  [x] T  [x] I  [x] R
- [x] **5.3** Hook `useSwipeDeck` with `useReducer`: queue + history stack, immutable updates — commit `feat: swipe deck reducer`
  - [x] C  [x] T  [x] I  [x] R
- [x] **5.4** Score computed during render (or `useMemo`) from history; never sync derived state with `useEffect` — commit `test: derived score` (no production change; implemented in 5.3)
  - [x] C  [x] T  [x] I (already in 5.3)  [x] R
- [x] **5.5** `SwipeCard` with Pointer Events (`onPointerDown/Move/Up/Cancel`, `setPointerCapture`, drag threshold, `touch-action`) — commit `feat: pointer swipe`
  - [x] C  [x] T  [x] I  [x] R
- [x] **5.6** Keyboard: `keydown` + `event.key` (ArrowLeft / ArrowRight swipe, `Z` / Backspace undo); equivalent `type="button"` controls; pointer and keyboard dispatch the same reducer action — commit `feat: keyboard swipe`
  - [x] C  [x] T  [x] I  [x] R
- [ ] **5.7** Undo button disabled when stack is empty; results announced via `aria-live="polite"` (no `alert()`) — commit `feat: undo control`
  - [x] C  [x] T  [ ] I  [ ] R
  - Reopened by screenshot review (2026-11-20): Undo state is correct, and useDeckActions module tests passed earlier, but the persistence DeckPage has empty status after swipe/undo. Wire per-action announcements before accepting page integration; finished status already works.
- [x] **5.8** End-of-deck results summary using `<dl>` with keyed `<Fragment>` groups — commit `feat: results summary`
  - [x] C  [x] T  [x] I  [x] R
- [x] **5.9** Tests for reducer and interactions: swipe, multiple undos, keyboard — commit `test: swipe deck behavior`
  - [x] C  [x] T  [x] I  [x] R — no production change; integration tests and mutation verification.
  - DeckPage wired in 6.3: real-browser mouse/keyboard/buttons each completed all 10 cards with score 25 and Results; repeated Undo restored LIFO order. F5 now preserves server history under section 6 (the earlier local-only reset requirement is superseded).

## 6. Persistence Integration (separate commits for API / hook / tests)

- [x] **6.1** `api/client.js`: fetch helpers accepting `signal`, `try/catch`, unified error handling; every fetch has `.catch`, ignore `AbortError` — commit `feat: api client`
  - [x] C  [x] T  [x] I  [x] R
- [x] **6.2** Hook `useSwipePersistence`: load history, save swipe, undo via API; `AbortController` + `return () => controller.abort()`, no `didCancel` — commit `feat: persistence hook`
  - [x] C  [x] T  [x] I  [x] R
  - Browser checks completed with DeckPage wiring in 6.3: POST 201 / DELETE 200 persist across refresh, 800ms throttling permits one write, server-off save rolls back without unhandled rejection.
- [x] **6.3** Loading/error states; roll back when POST fails; no unhandled rejections — commit `feat: persistence error handling`
  - [x] C  [x] T  [x] I  [x] R
  - Permanent DeckPage wiring is included in this commit. Vite proxy server-off returns 502/INTERNAL_ERROR (generic fixed alert); NETWORK_ERROR text is covered by component tests.
- [x] **6.4** Hook tests: mock fetch, verify abort on unmount — commit `test: persistence hook`
  - [x] C  [x] T  [x] I  [x] R — test-only; real client/hook with mocked fetch, two mutations restored, Chrome GET/POST cancellation verified.

## 7. Accessibility, Performance & Responsive

- [x] **7.1** Semantic HTML audit: landmarks, logical headings, zero div-soup, Fragments instead of extra wrappers — commit `fix: semantic html audit`
- [x] **7.2** Visible focus, tab order, WCAG 2.2 AA contrast, minimum target size — commit `fix: focus and contrast`
- [x] **7.3** Images: meaningful `alt`, `width`/`height`, `loading="lazy"` (except LCP image), right-sized assets — commit `perf: image optimization`
- [x] **7.4** Responsive 375–1440px, no unintended horizontal scroll — commit `fix: responsive layout`
- [x] **7.5** Lighthouse Accessibility, Best Practices, Performance all 100/100 on production build — commit `perf: lighthouse fixes`
- [x] **7.6** Validate rendered HTML with W3C Nu HTML Checker — commit `fix: html validation`

## 8. Verification Checklist (collect evidence for each)

- [x] **8.1** Routing: valid ID, invalid ID, nested layout, deep link opened directly from URL
- [x] **8.2** DevTools: no Console warnings, clean URL param parsing
- [x] **8.3** Slow 3G: switch category/route rapidly; in-flight requests show `cancelled` in Network tab
- [x] **8.4** Accessibility Tree and full keyboard walkthrough (filter, lightbox, swipe, undo)
- [x] **8.5** `npm run lint`, `npm test`, `npm run build` all pass
- [x] **8.6** No React key warnings in the Console

## 9. Documentation & Git

- [x] **9.1** Update `AI_FAILURE_AUDIT.md`: each AI failure (hallucinated APIs, faulty loops, dialog/pointer bugs) with manual verification, fix, and DevTools/test evidence
- [x] **9.2** Verify history with `git log --graph --oneline --decorate`: atomic commits, correct Conventional Commits
---

## Dependency Order

`0 → 1 → 2` (can run in parallel with `3`) `→ 4` and `5` (parallel, both need 3) `→ 6` (needs 2 + 5) `→ 7 → 8 → 9`

## Definition of Done

- [x] All 3 Gallery requirements have matching tests or verification evidence
- [x] All 4 Swipe Deck requirements have matching tests or verification evidence
- [x] No prohibited APIs or practices in the codebase
- [x] Lighthouse 100/100; tests, lint and build are green
- [x] Git history is clean and `AI_FAILURE_AUDIT.md` is complete

## Homework 2 — Full-Stack Esports Fair-Play Appeal Tribunal

> Case study: Himass & TanVuu · Lab 4 · React 19 + Vite + React Router v7 + Express + MongoDB (Mongoose 8)
> Location: `Lab04_HW/HW2/` — all paths below are relative to `HW2/` unless stated otherwise
> Priority: **P0 = assignment requirements** → **P1 = project rules** → **P2 = acceptance & submission**
> Every task follows: **[Contract] → [Fail Test] → [Implement] → [Refactor]**
> Commit scope: `type(hw2): message`
> 📸 = take a screenshot and paste it directly into the Word report (caption = screenshot ID, e.g. S1a)

**Definition of Done:** A user opens a player dossier at `/dossier/:playerID`, reads the case, files an appeal through a validated context-driven form before the SLA deadline expires, the appeal is persisted via the Express API in MongoDB and appears in the dossier's history, and the tribunal channels load with cancellable requests. Every AI failure is logged in `AI_FAILURE_AUDIT.md`.

### Folder Structure

```text
HW2/
├── client/
│   ├── src/
│   │   ├── components/   # PeopleLayout, PersonDetail, SimpleForm, InputField, ShowData, Skeleton, NotFoundState, SlaCountdown
│   │   ├── context/      # FormContext.jsx
│   │   ├── hooks/        # useAppealSlaTimer.js, useForumMessages.js
│   │   └── data/         # players.js
│   └── tests/
├── server/
│   ├── models/  routes/  tests/
│   ├── .env.example
│   └── server.js
├── shared/
│   ├── channels.js
│   ├── players.js
│   ├── validateAppeal.js
│   └── validateMessage.js
├── docs/
│   ├── API_CONTRACT.md
│   └── SPRINT1_CONTRACT.md
└── README.md
```

---

### 0. Setup (P0)

- [x] **0.1** `client/`: scaffold React 19 + Vite (`createRoot`, `<StrictMode>`); install `react-router`, Vitest, Testing Library
- [x] **0.2** `server/`: Express, `cors`, Mongoose 8, supertest; add `.env.example` (`MONGODB_URI`, `PORT`, `CLIENT_ORIGIN`); git-ignore `server/.env`
- [x] **0.3** Create `shared/validateAppeal.js`, `docs/API_CONTRACT.md`, `README.md` (how to run); add a `## Homework 2` section to the root `AI_FAILURE_AUDIT.md`
- [x] **0.4** Configure the Vite alias `@shared` → `../shared` (+ `server.fs.allow`) so the client can import the shared validator
- [x] **0.5** Seed `shared/players.js` (re-exported by `client/src/data/players.js`): `himass` (active), `tanvuu` (expired) — id, name, team, role, violation, matchId, sanction, `appealDeadline`
- [x] **0.6** Run client + server, confirm a clean Console → commit `init(hw2): project setup`
- [x] 📸 **S0** — App running, Console clean

---

### 1. Sprint 1 — Multi-Route Dossier Navigation `/dossier/:playerID` (P0 · Req #1)

- [x] **1.1 [Contract]** `docs/SPRINT1_CONTRACT.md`: route table, props of `PeopleLayout`/`PersonDetail`/`SelectCase`/`NotFoundState`/`Skeleton`, URL → behaviour table, 6 test cases → commit `docs(hw2): sprint 1 routing contract`
- [x] **1.2 [Fail Test]** A valid ID renders the dossier; an invalid ID renders `<NotFoundState />`; the sidebar persists across nested routes; the active NavLink has `aria-current="page"`
- [x] **1.3 [Implement]** `PeopleLayout.jsx`: `<nav>` + `<ul>` of `NavLink` (`className={({ isActive }) => …}`), `<main>` + `<Outlet />`
- [x] **1.4 [Implement]** `PersonDetail.jsx`: `useParams()` → `players.find()` → `<article>` + `<dl>/<dt>/<dd>` case file; link to the appeal route; nested `<Outlet />`
- [x] **1.5 [Implement]** `React.lazy` route components + `<Suspense fallback={<Skeleton />}>` (same dimensions as the real content, `aria-busy="true"`, `aria-live="polite"`)
- [x] **1.6 [Refactor]** Zero div-soup, Fragments; tests green → commits `feat(hw2): router layout`, `feat(hw2): detail route handling`
- [x] 📸 **S1a** — `/dossier/himass`: active NavLink + `<dl>` case file
- [x] 📸 **S1b** — `/dossier/unknown`: 404 state
- [x] 📸 **S1c** — Skeleton fallback under Slow 3G
- [x] 📸 **S1d** — Sprint 1 tests passing

---

### 2. Sprint 2 — Appeal Form Engine (P0 · Req #2)

- [x] **2.1 [Contract]** `docs/SPRINT2_CONTRACT.md`: field rules + exact error messages, `validateAppeal` signature, `FormContext` value shape, `InputField`/`SimpleForm`/`ShowData` props, submit flow table, 16 test cases → commit `docs(hw2): sprint 2 appeal form contract`
- [x] **2.2 [Fail Test]** `validateAppeal` unit tests (rules, boundaries, cross-field email) + form component tests (real-time errors, `isValid` in ShowData, invalid submit focuses first error, `aria-invalid`/`aria-describedby`, fetch payload, server field errors, context guard) → commit `test(hw2): sprint 2 form tests (red)`
- [x] **2.3 [Implement]** `context/FormContext.jsx`: `createContext(null)` + `FormProvider` (values, touched, `handleChange`, `handleBlur`, `handleSubmit`) + `useFormContext()` → commit `feat(hw2): form context`
- [x] **2.4 [Implement]** `errors`/`isValid` derived synchronously in render via `validateAppeal(values)` (`useMemo` if needed) — **no `useEffect`**
- [x] **2.5 [Implement]** `InputField.jsx` (red → green via `tests/inputField.test.jsx`): `useId()`, `<label htmlFor>`, `aria-invalid`, `aria-describedby` (hint + error), error `<p role="alert">`, input/textarea/select, Fragment wrapper → commit `feat(hw2): input field validation`
- [x] **2.6 [Implement]** `SimpleForm.jsx`: `<form noValidate>` + `<fieldset>`/`<legend>`, `try/catch` submit to `POST /api/appeals`, maps server `fields` errors, accessible status message (no `alert()`)
- [x] **2.7 [Implement]** `ShowData.jsx`: live state inspector, `<dl>` with keyed `<Fragment>` → commit `feat(hw2): inspector output`
- [x] 📸 **S2a** — Real-time error state
- [x] 📸 **S2b** — Valid form + `<ShowData />` inspector
- [x] 📸 **S2c** — DevTools Accessibility Tree: input name, `aria-invalid`, description
- [ ] 📸 **S2d** — Successful submission message (taken after WBS 4.3, once `POST /api/appeals` exists)

---

### 3. Zero-Drift SLA Countdown `useAppealSlaTimer()` (P0 · Req #3)

- [x] **3.1 [Contract]** `docs/SPRINT_SLA_CONTRACT.md`: decrement vs clock-delta rationale, signature `{ remainingMs, isExpired, parts, isSynced }`, midpoint offset from `GET /api/time`, state vs derived table, 3 effects with cleanup, second-aligned ticks, UI + milestone announcements, 14 test cases → commit `docs(hw2): sla timer contract`
- [x] **3.2 [Fail Test]** `tests/useAppealSlaTimer.test.jsx` (11 hook tests incl. zero-drift clock jump, offset, fallback, clamp + no timers left, visibility re-sync, unmount cleanup) + `tests/slaCountdown.test.jsx` (3 UI tests) → commit `test(hw2): sla timer tests (red)`
- [x] **3.3 [Implement]** `hooks/useAppealSlaTimer.js`: state `tickNow`/`offset`/`isSynced`/`syncKey`; `remainingMs` derived in render; 3 effects with full deps + cleanup (sync → `abort()`, second-aligned recursive `setTimeout` → `clearTimeout`, visibility → `removeEventListener`)
- [x] **3.4 [Integrate]** Hook called once in `PersonDetail`; `SlaCountdown` with `<time dateTime>` + milestone `aria-live`; Outlet context `{ player, isExpired }`; `SimpleForm` disables submit when expired; server `409` in Sprint 3
- [x] **3.5 [Refactor]** Tests green → commit `feat(hw2): appeal sla timer`
- [x] 📸 **S3a** — Countdown running on the dossier
- [x] 📸 **S3b** — Zero-drift proof: compared with the OS clock after several minutes in a background tab + fake-timer test output
- [x] 📸 **S3c** — Expired state: submit disabled + server 409

---

### 4. Sprint 3 — Backend API + `useForumMessages` (P1 · rules; completes the full stack)

- [x] **4.1 [Contract]** `docs/API_CONTRACT.md` (FINAL): conventions, error table (400/404/409/413/500), 6 endpoints with payloads and check order, shared `validateMessage` + `channels`, Mongoose models, client usage, 14 test cases → commit `docs(hw2): api contract`
- [x] **4.2 [Fail Test]** `mongodb-memory-server` + supertest: `appeals.test.js` (1–7), `messages.test.js` (8–11), `robustness.test.js` (12, 12b, 13, 14); parity via shared validators; Date-only fake timers → commit `test(hw2): api tests (red)`
- [x] **4.3 [Implement]** `server.js`: `cors({ origin: process.env.CLIENT_ORIGIN })`, `express.json()`, models `Appeal` + `Message`, `async/await` + `.exec()`, `MONGODB_URI` from `process.env`, reuse `shared/validateAppeal.js` (validation parity), central error handler → commit `feat(hw2): api endpoints`
- [x] **4.4 [Implement]** `hooks/useForumMessages.js` (contract → red → green): `AbortController` per GET, `return () => controller.abort()`, ignore `AbortError`, `signal.aborted` guard after each `await`; `loading` derived from the last settled request (no `setLoading` in the effect body); `postMessage()` → refetch → commits `test(hw2): forum hook tests (red)`, `feat(hw2): forum messages hook`
- [x] **4.5 [Integrate]** Channel switcher + message list/post form in the dossier; appeal history from `GET /api/appeals/:playerId`, refreshed after submit → commit `test(hw2): hook tests`
- [x] 📸 **S4a** — Postman/Thunder: 201, 400 (with `fields`), 409
- [x] 📸 **S4b** — Slow 3G Network tab: rapid channel switching → stale requests **(canceled)**
- [x] 📸 **S4c** — MongoDB Compass/Atlas showing saved appeals + messages
- [x] 📸 **S4d** — Appeal history + channel messages in the UI

---

### 5. Post-Mortem `AI_FAILURE_AUDIT.md` (P0 · Req #4)

- [x] **5.1** Log each real AI failure when it occurs: *Prompt → Symptom → Root cause → Fix → Evidence*
- [x] **5.2** Do not fabricate failures; if a Slide 29 category never occurred, leave it out
- [x] **5.3** Write the **Architecture Analysis**: routing tree, form data flow, clock-delta timer design, request cancellation, validation parity → commit `docs(hw2): ai failure audit`
---

### 6. Acceptance & Submission (P2)

- [x] **6.1** End-to-end flow: dossier → appeal → submit → history updates → channel discussion
- [x] **6.2** Responsive at 375 / 768 / 1440 px with no horizontal scroll (CSS Grid + `@media`)
- [ ] **6.3** Lighthouse Accessibility + Best Practices 100/100; W3C Nu Checker clean; keyboard-only navigation with visible focus
- [ ] **6.4** No Console warnings; client: `npm run lint`, `npm run test:run`, `npm run build` pass; server: `npm run lint`, `npm run test:run` pass (plain Node ESM, no build step)
- [ ] **6.5** Prohibited-pattern sweep: `<Switch>`, `<Redirect>`, `exact`, `activeClassName`, `var`, `keyCode`, `keypress`, `defaultProps`, `didCancel`, `window.alert`, index keys, hardcoded URIs
- [ ] **6.6** `git log --graph --oneline --decorate` shows every required commit
- [ ] **6.7** Live-defense prep (Slide 28): `useSearchParams` sync, cross-field validation, exponential-backoff retry respecting `AbortController`, protected route guard
- [ ] 📸 **S6a** — Lighthouse 100/100
- [ ] 📸 **S6b** — 375 px mobile + 1440 px desktop
- [ ] 📸 **S6c** — Terminal: lint, test, build passing
- [ ] 📸 **S6d** — `git log --graph`

---

### Progress

| # | Workstream | Req | Status |
|---|---|---|---|
| 0 | Setup | — | ✅ |
| 1 | Dossier Routing | #1 | ✅ |
| 2 | Appeal Form Engine | #2 | ✅ |
| 3 | SLA Timer | #3 | ✅ |
| 4 | Backend + Hook | Rules | ⬜ |
| 5 | AI Failure Audit | #4 | ⬜ |
| 6 | Acceptance | — | ⬜ |

**Report screenshots:** S0 · S1a–d · S2a–d · S3a–c · S4a–d · S5 · S6a–d (24 total)