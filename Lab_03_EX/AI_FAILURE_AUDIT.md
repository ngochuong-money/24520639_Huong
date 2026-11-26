## AI Failure Mode Audit & Code Integrity

- Maintain `AI_FAILURE_AUDIT.md` as a mandatory Lab 3 deliverable.
- Document at least **3 distinct, verified AI-generated bugs** encountered during development.
- For each bug, record:
  - **AI Prompt:** The original instruction that led to the faulty implementation.
  - **AI-Generated Code:** The relevant incorrect code snippet.
  - **Failure Description:** What went wrong and why it is incorrect.
  - **DevTools Evidence:** Console, Network, React DevTools, or other relevant evidence demonstrating the failure.
  - **Engineering Fix:** The corrected code and a brief explanation.
  - **Verification:** Evidence that the issue is resolved after the fix.
  - **Git Commit:** Reference the relevant fix commit when available.
- Prioritize auditing React 19 and Hooks failure modes:
  - Redundant `useState` and `useEffect` for derived state.
  - Stale closures in event handlers, timers, and effects.
  - Missing `AbortController` or cleanup for asynchronous requests and subscriptions.
  - Timer drift caused by naive `setInterval` countdown implementations.
- Follow React Hooks dependency rules and clean up timers, listeners, and asynchronous operations when applicable.
- Never fabricate AI prompts, bugs, DevTools screenshots, test results, or fixes.
- Do not intentionally introduce bugs into working code solely to satisfy the audit requirement.
- Do not mark an audit entry complete until the failure and its correction have been verified.
- Include `AI_FAILURE_AUDIT.md` in the final submission.

**Acceptance Criteria:**
- `AI_FAILURE_AUDIT.md` contains at least 3 distinct AI-generated bugs.
- Each entry includes the prompt, faulty code, failure explanation, DevTools evidence, engineering fix, and verification result.
- All documented bugs have been corrected.
- No unresolved critical React Hooks, state synchronization, timer, or cleanup issues remain.

# AI Failure Audit — Lab 3

## Exercise 3: PUBG Vietnam Series — Live Telemetry

### Failure 1: React Hooks and ESLint Warnings

**Observed issue:**
- `setRetryTick` was declared but not used.
- `setView()` was called synchronously inside `useEffect`.
- ESLint reported `no-unused-vars` and `react-hooks/set-state-in-effect` warnings.

**Evidence:** ESLint terminal output captured during Task 3.5.

**Root cause:** The initial implementation introduced state management patterns that did not fully satisfy the project's ESLint rules.

**Fix:** Adjusted the effect lifecycle to avoid synchronous state updates and addressed the unused setter warning.

**Verification:** The user reported that the warnings were resolved. The final lint output should be attached or referenced when available.

**AI attribution:** Not independently confirmed.

---

### Failure 2: Node.js ESM Import Resolution

**Observed issue:**
- Running `node src/services/verifyTelemetry.js` produced `ERR_MODULE_NOT_FOUND`.
- Node.js could not resolve the imported `pubgVnSquads` module.

**Evidence:** Terminal error screenshot during Task 3.6.

**Root cause:** The relative import path did not include the `.js` extension required for this Node.js ESM execution.

**Fix:** Corrected the import to reference `../data/pubgVnSquads.js`.

**Verification:**
- `PASS: aborted request rejects with AbortError`
- `PASS: unknown squad is rejected`

**AI attribution:** Not independently confirmed.

---

### Failure 3: Vite Hot Module Reload Failure

**Observed issue:**
- Vite reported HTTP 500 while loading `PubgMatchTelemetry.jsx`.
- The browser console displayed `Failed to reload`, indicating a temporary module compilation or import problem.

**Evidence:** Chrome DevTools Console screenshot during Task 3.9.

**Root cause:** Not conclusively identified from the available console screenshot.

**Fix:** The application was subsequently restored to a working state, but the exact corrective edit has not been verified.

**Verification:** A later Console screenshot showed no errors or warnings, and the telemetry UI rendered successfully.

**AI attribution:** Not independently confirmed.

---

## Audit Summary

| Item | Status |
|---|---|
| Observed implementation issues | 3 |
| Issues independently confirmed as AI-generated | Not yet established |
| Evidence available | ESLint, Node.js terminal, Chrome DevTools |
| Remaining action | Verify AI attribution and attach evidence references |

**Note:** These are documented development issues. They should count toward the assignment's AI failure requirement only after confirming that the relevant faulty implementation originated from AI-generated output.