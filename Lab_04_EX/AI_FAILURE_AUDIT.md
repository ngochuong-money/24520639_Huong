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

### 2026-11-14 — API error handling

- Fail Test: `npm.cmd run test -- server/app.test.js` reported 4 failed and 60 passed. Malformed JSON produced Express HTML; unexpected parser errors did not use the contract response; GET/POST catches did not log their error messages.
- Implement: added a four-argument error middleware after routes, message-only GET/POST error logs, a process-level unhandled-rejection listener, and a MongoDB connection error listener.
- Verification: `npm.cmd run test` passed 94/94 tests. A rejected `Message.find().sort().exec()` returned only `{ "error": "Internal server error" }` with status 500; a subsequent request to the same HTTP server returned 200. Rejected `Message.create()` also returned the generic 500 response.
- Malformed POST body `{abc` returned 400 `{ "error": "Invalid JSON" }`, retained the CORS header, and did not call `Message.create()`.
- `npm.cmd run lint`, `npm.cmd run typecheck`, and `npm.cmd run build` passed. Both message handlers contain `catch` blocks.
- Database failures were mocked; MongoDB was not stopped. No browser Console/DevTools check was performed. `useForumMessages` does not exist yet, so frontend rejection handling remains to be verified when the hook is implemented.

The preceding paragraph describes that earlier checkpoint only. Subsequent verification is recorded below.

### 2026-11-14 — Full-stack and browser verification

- Followed [ERROR_LOG.md](ERROR_LOG.md) and captured actual Chrome DevTools Network screenshots, API-only HAR files, request events, browser Console output and backend terminal logs in evidence/.
- Slow 3G simulation: 2000 ms latency, 50,000 bytes/s each direction. Original hook: 5 canceled requests and only the final nasa request completed with 200. Browser-only control without cleanup: 0 canceled, 6 completed. The source hook on disk was unchanged afterward.
- Backend off through the Vite proxy produced HTTP 502, one hook error log and a visible UI error. This differs from direct-fetch Failed to fetch and is documented rather than hidden.
- Windows denied control of the system MongoDB service. Stopped a real isolated mongod on 27018 instead: backend on 3001 returned a generic 500 without a response stack; a subsequent request to the same backend returned 400, proving the process remained available. Temporary processes were cleaned up; the normal backend was restarted.
- Real requests for an unknown channel, malformed JSON and missing text returned the documented 400 JSON responses.
- After restarting, each of the three channels displayed its own message, normal Console had no errors/warnings, and the 375px viewport had document width 375px.

### 2026-11-14 — Interface changes

- Manually inspected desktop and mobile browser screenshots for People, profile details and Form; tested navigation, valid form submission with JSON output, Forum channel switching and invalid-person state.
- Checked People, person details, Form and Forum at 375px: all document widths were 375px. The empty and loaded profile frames both measured 384px high. This frame measurement alone is not a whole-page CLS audit.
- Browser Console had no errors/warnings. Lint, typecheck and 99/99 tests passed; production build passed after the final CSS color adjustment.
- Outstanding limits: no Lighthouse/W3C audit was performed in this verification. These findings describe the tested working tree, not a claim that every possible failure has been tested.

### 2026-11-14 — Lighthouse contrast correction

- Failure: the redesigned People page scored 95 Accessibility in the user's Lighthouse screenshot. The initial styling had not been checked with an automated contrast audit.
- Diagnosis: axe-core identified insufficient contrast on the heading count and all three avatar initials; the selected person's role text also failed against the selected card background (ratios 2.9–4.41, below the required 4.5).
- Fix: darkened those five text colors in index.css and PeopleLayout.css. Also changed the brand's accessible name to include the visible mobile logo text `h.` after Lighthouse reported label-content-name-mismatch.
- Verification: rebuilt the production app and audited the preview on port 4173. axe-core reported no WCAG A/AA violations on People, person details, Form and Forum. The final mobile Lighthouse run on /people scored 100 Accessibility and 100 Best Practices with no failed audits. Lint and production build passed.
- This updates the earlier Lighthouse limitation for /people only; no W3C audit or full-site Lighthouse audit is claimed.
