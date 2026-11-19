# AI_FAILURE_AUDIT.md

## 1. AI Code Failures
Scope: observed failures in this work session. Intentional failing tests are recorded separately as test evidence, not AI implementation failures.

| Request/context | Non-functional output or action | Evidence | Fix and verification |
|---|---|---|---|
| Configure TypeScript linting | Attempted to install typescript-eslint alongside TypeScript 7 without checking its supported range | npm ERESOLVE: typescript-eslint required TypeScript below 6.1 | Installed TypeScript 5.9.3 and typescript-eslint 8.72.2; typecheck and lint passed |
| Install a compatible TypeScript version | Broad version-range install spent excessive time resolving dependencies | Install remained running without progress; it was interrupted | Pinned the two versions; install completed in 8 seconds |
| Form context | Exporting component, validation function and hook from one TSX file violated Fast Refresh lint rules | 2 react-refresh/only-export-components errors at the function exports | Split FormProvider, context/types, hook and validation into separate modules; lint/typecheck passed |
| Verify database startup | An inline Node command lost its string quotes when passed through PowerShell | SyntaxError: Unexpected identifier 'node' | Passed a literal here-string through stdin to node --input-type=module; missing-URI check returned the expected message and exit code 1 |
| Run backend for browser verification | index.js printed Ready on port 3000 after connecting to MongoDB but never opened an HTTP listener | Source inspection showed no listen() call; no API server was listening | Start createApp().listen() after connectDb(); real API and browser requests then succeeded; commit 794c170 |
| Automate DevTools screenshots | Initial inspector frontend URL did not expose the expected Network tab; an empty Network table header was inert | Network tab locator was absent; header click timed out | Used devtools_app.html with panel=network and the Network settings UI; actual screenshots saved in evidence/ |
| Automate screenshot settings | Diagnostic code assumed parentElement was non-null across shadow DOM | TypeError reading textContent | Used optional access and accessible checkbox snapshots; enabled Big request rows and captured channel paths |
| Verify backend-off logging | Test harness classified hook logs only by source location | Assertion expected one hook error but found zero; Vite had attributed console.error to @vite/client | Classified the actual Error: HTTP 502 message instead; observed exactly one application error log |

Additional workflow corrections: the first API contract included unrequested details and was replaced with the supplied template; a grep instruction failed in PowerShell and was replaced with Select-String. These were scope/tooling mistakes, not application runtime failures.

## 2. Hallucinated APIs & Loops
- No phantom library method or broken effect loop was observed in the implemented application during this session; no such incident is invented here.
- Form errors/isValid are computed synchronously during render. FormProvider contains no useEffect that synchronizes derived state.
- useForumMessages uses the actual AbortController API, passes signal to fetch, and returns controller.abort() from cleanup with dependency [channelId]. It does not use a didCancel flag.
- The initial Node startup message was misleading because HTTP listen() was missing; this was a lifecycle omission, not a nonexistent Express API. It is documented in section 1.
- Deliberately red Vitest runs (missing validation module, missing maxLength support, missing hook) belong to the requested Fail Test → Implement workflow.

## 3. Engineering Verification
(Manual analysis and exact steps taken to fix, with DevTools/test evidence)

## Homework 1

### Task 0.2: wrong react-router major version
- **AI failure:** AI suggested `npm install react-router` without a version tag. npm installed v8.5.2, but the assignment requires v7.
- **Detection:** `npm ls react-router` showed 8.5.2; `package.json` showed `^8.5.2`.
- **Fix:** `npm install react-router@7`; re-verified with `npm ls` and `package.json`.
- **Evidence:** screenshots of `npm ls` before and after (`docs/evidence/0.2-*.png`).

### Task 0.4: ESLint peer dependency conflict
- **AI failure:** Added the jsx-a11y preset before confirming compatibility with the project's ESLint major version.
- **Detection:** `npm.cmd install -D eslint-plugin-jsx-a11y` failed with `ERESOLVE`: installed `eslint@10.15.0` is outside `eslint-plugin-jsx-a11y@6.10.2`'s peer range (`^3 || ^4 || ^5 || ^6 || ^7 || ^8 || ^9`).
- **Fix:** With user approval, installed `eslint@9` and `@eslint/js@9` alongside `eslint-plugin-jsx-a11y`. Resolved versions: ESLint and @eslint/js 9.39.5, jsx-a11y 6.10.2. Did not use `--force` or `--legacy-peer-deps`.
- **Verification:** The initial `npm.cmd test` failed with `Missing script: "test"`. After configuration, `npm.cmd test` ran once and exited with 1 test passed in jsdom; `npm.cmd run lint` and `npm.cmd run build` passed. Verified Vitest 5.1.1, jsdom 31.0.1 and React Testing Library 16.3.3 with `npm.cmd ls`. Terminal output was captured in the session; no screenshots were created. Implementation commit: `b29cf57` (`test: setup vitest`).
- **Additional correction:** ESLint 9's core `no-unused-vars` reported JSX imports (`App`, `StrictMode`) as unused. Added the Vite-style `varsIgnorePattern: '^[A-Z_]'` option while retaining the rule as an error, the React Refresh preset and jsx-a11y recommended rules. Inspected imports in the smoke test and setup file; lint passed afterward. Vitest globals remain disabled and DOM cleanup is registered explicitly with `afterEach`.

### Task 3.2: active navigation on unknown child paths
- **AI failure:** The layout's NavLink omitted `end`, so prefix matching kept Gallery active on `/gallery/unknown` and Deck active on `/deck/extra/segments`, even though the catch-all route rendered the not-found state.
- **Detection:** Two catch-all assertions in `src/App.test.jsx` failed because the navigation links still had `aria-current="page"`.
- **Fix:** With user approval, added `end` to the shared NavLink in `AppLayout.jsx`; retained the original tests.
- **Verification:** Client 101/101, server unit 134/134 and real MongoDB API 93/93 tests passed; lint and production build passed. Chrome checks confirmed index redirect with replace and browser Back, navigation, query preservation, not-found recovery, direct `/deck` reload, keyboard skip-link focus, no horizontal overflow at 375px and navigation targets of at least 44px. Production preview loaded `/deck` directly. No application console errors or warnings were observed. Automated screenshot capture timed out, so no screenshot evidence is claimed.

### Task 4.1: closePhoto idempotency and the test location probe
- **AI failure:** The supplied implementation assumed returning the existing params object from the `setSearchParams` updater would skip navigation. React Router still replaced the location and changed its key. The supplied test also invoked a ref callback during render.
- **Detection:** `closePhoto is idempotent when no photo is open` failed (expected key `default`, received a new key). ESLint reported `react-hooks/refs`: `Cannot access refs during render` in `LocationProbe`.
- **Fix:** With user approval, checked `searchParams.has('photo')` before calling `setSearchParams` and included `searchParams` in the callback dependencies. Read `useLocation` in the `renderHook` callback instead of using a render-time ref probe; kept all assertions unchanged.
- **Verification:** Initial red: the hook module was missing. After the fixes, all 25 hook tests passed; total client 150/150, server unit 134/134 and MongoDB API 93/93 passed, as did lint and build. Removing the early guard deliberately made exactly the idempotency test fail; restored the file and reran the full suite successfully. Hook source has no local state/effect hooks or duplicated validation regex. UI verification is deferred until a component uses this hook; terminal results are recorded in the session and no screenshots were captured.

