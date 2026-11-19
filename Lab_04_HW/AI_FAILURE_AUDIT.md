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

