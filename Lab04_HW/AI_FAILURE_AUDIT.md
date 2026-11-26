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

### Task 4.4: focus test setup and native-dialog lint
- **AI failure:** The supplied photo-switch test initially opened the dialog before focusing an opener, then expected focus to return to that button. The supplied restoration test also left focus on the opener throughout, so deleting `opener.focus()` still passed. The native dialog's mouse/key listeners triggered `jsx-a11y/no-noninteractive-element-interactions`.
- **Detection:** One focus assertion failed with the body focused; lint reported the dialog listener rule. Targeted mutations showed the original tests did not detect removal of focus restoration or the open guard.
- **Fix:** With user approval, started the switching test with `photo=null`, focused the opener and then opened the photo. Both focus tests move focus into the dialog before closing; the switching test does so before changing photos. Added an ESLint override only for Lightbox.jsx, allowing `onClick`/`onKeyDown` on native `dialog` while retaining the rule at `error`. Production component behaviour was kept as supplied.
- **Verification:** All 19 lightbox tests passed; client 190/190, server unit 134/134 and real MongoDB API 93/93 passed; lint and build passed. Removing `opener.focus()` now fails 2 tests; removing `!dialog.open` fails the opener-preservation test. Both mutations were restored before the final green run. Terminal output is recorded in the session; screenshots were not captured.
- **Test limits:** The minimal jsdom stand-in only models open state and a synchronous close event. It does not implement real modal focus management, native Esc handling or full `showModal()` validation; the stronger opener test catches guard removal through focus preservation, not a native dialog exception. Real-browser verification belongs to 4.5.
- **Design decision:** The `[photo]` effect deliberately does not return a cleanup that closes the dialog: such a cleanup could emit a close notification during StrictMode's development effect cycle and remove a valid deep-link parameter upstream. Unmount removes the dialog DOM node. All user close paths use the native close event and the already-idempotent `closePhoto` callback when integrated in 4.5.

### Task 4.5: raw URL validation and integration test selectors
- **AI failure:** The supplied page checked the hook's normalized category, so malformed `?category=BAD` became `all` and lost its warning. One supplied test silently ignored malformed photo IDs despite the contract requiring a status message. Other tests counted category list items as photos or clicked category buttons as if they were thumbnails; the render-time global location probe also violated `react-hooks/globals`.
- **Detection:** After replacing the placeholder page with the supplied implementation, 7 integration tests failed and lint reported the global assignment. Chrome confirmed `?category=BAD` displayed no warning while leaving the URL intact.
- **Fix:** With user approval, read raw params through `useSearchParams` and reused the shared validators to derive format flags without local state/effects or render-time URL writes. Malformed photo IDs now show `Photo not found.` per the user's selected contract behaviour. Scoped photo assertions/actions to the grid, asserted the actual loading Skeleton, and replaced the global probe with DOM output and `useNavigate` test controls.
- **Verification:** All 18 GalleryPage tests passed; client 208/208, server unit 134/134 and MongoDB API 93/93 passed, plus lint/build. The MemoryRouter test now actually navigates back/forward rather than calling unrelated `window.history`; real browser history was checked separately with Chrome CDP. Real Chrome confirmed Back closes and Forward reopens the same photo, native Esc/backdrop close, focus restoration after thumbnail opening, filtered ArrowLeft/ArrowRight, unchanged invalid-param URLs, contract messages, direct deep links under StrictMode, 375px page width without horizontal overflow and no console errors/warnings.
- **Limits and evidence:** Modal background controls are inert to real pointer input; the filter-change-while-open scenario was exercised with a programmatic button click and cleared the photo param correctly. A direct deep link has no thumbnail opener, so its opener may be the document body; this remains accepted behaviour. Chrome command-line screenshots were visually inspected and saved as [Gallery](docs/evidence/4.5-gallery-desktop.png) and [Lightbox](docs/evidence/4.5-lightbox-desktop.png). These images show UI, not DevTools Console or a history recording. No final Lighthouse/CLS or full accessibility audit is claimed.

### Task 4.6: React keyboard normalization and native focus verification
- **AI failure:** The supplied legacy-key test assumed a keydown containing only `keyCode: 39` would not produce `event.key === 'ArrowRight'`. React's installed event implementation normalizes that event, so the test failed despite the application reading only `event.key`.
- **Fix:** With user approval, used an explicit conflicting `key: 'a'` with `keyCode: 39` to verify the handler follows the modern key value. Retained the keypress check; no legacy API was added to production. Adapted page tests to the approved `currentSearch()` probe from 4.5 and added a Back assertion to prove replace semantics rather than merely checking URL values.
- **Implementation and verification:** Added Previous/Next refs and one availability-dependent focus effect. Before implementation, both disabled-button focus tests failed; commenting the two focus calls later made them fail again. Restored the source and passed client 215/215, server unit 134/134, MongoDB API 93/93, lint and build. Chrome verified native Enter from the penultimate photo focuses Previous when Next becomes disabled, and the inverse at the first photo; arrows stay filtered, browser Back returns to the pre-lightbox grid, Forward restores the final photo, Escape restores the thumbnail, and deep links accept keyboard navigation. Close focus is not stolen when neighbour availability changes. No browser console errors/warnings were observed.
- **Browser/test limits:** Chrome CDP checks wait for the DOM disabled state and React effects, not just the earlier URL change. Tab/Shift+Tab can transfer focus to browser chrome (`document.hasFocus() === false`); while the page has focus, the active element remained in the modal and never in background page controls, and re-entry returned to modal controls. This is not claimed as an uninterrupted three-button-only focus cycle. No new screenshots were captured.
- **Design decision:** Keyboard handling stays on the native dialog's `onKeyDown`, with no window listener or keyboard effect. The two effects are limited to photo-driven opening/closing and availability-driven focus; the latter does not install subscriptions requiring cleanup.


### Task 5.1 — Immutable stack and scoring (2026-11-20)

- Contract: docs/INTERFACES.md section 6 and docs/API_CONTRACT.md section 7. The last array element is the LIFO top; empty pop preserves its input reference. Score is derived from SwipeEntry history, never state. +10/-5 remain provisional pending the original assignment.
- Fail Test: added the supplied tests before either module existed; test:client failed with missing-module imports. Implemented spread/slice stack helpers and the reference scorer.
- Real defect in the initial reference scorer: looking up SCORE_BY_DIRECTION[direction] with ?? 0 reads inherited constructor/toString properties. Added the supplied regression test, observed the constructor assertion fail, then used Object.hasOwn. No React or state/effect imports were introduced.
- Mutation checks: replacing slice with stack.pop() made the frozen-input test fail; removing Object.hasOwn made the inherited-property test fail. Both mutations were restored in finally blocks; test:client returned to 255/255 passing.
- One full-client run after the scoring fix failed an existing Gallery deep-link dialog-open assertion. The same working tree passed on retry and subsequent complete runs; no Gallery source/test was changed. The failed log is retained, not represented as a utility regression.
- Verification: npm.cmd test (client, server unit and real MongoDB API suites), lint and build all exited 0. The API suite passed 93/93. The purity scan found no import, useState/useEffect or mutating array methods; manually inspected spread, slice, reduce and empty-stack reference behaviour.
- Evidence: docs/evidence/5.1 contains the command logs and screenshots rendered from those captured outputs; these are explicitly labelled output renders, not screenshots of a native terminal window. No browser UI check is required for these pure modules.
- WBS decision: tests are included in task 5.1's commit; 5.2 is labelled merged into 5.1 without a separate test commit. Section 5 progress is 1 / 9.

### Task 5.3 — Swipe reducer and derived hook (2026-11-20)

- Contract: docs/INTERFACES.md section 6. State holds only cards/history; hydrate replaces them, swipe records the first unswiped card, undo uses the pure stack pop. Exhausted deck, empty undo, unknown action/direction return the same state reference.
- Fail Test: wrote the two supplied test files before swipeReducer.js/useSwipeDeck.js existed. test:client failed on the missing imports; the command log is retained.
- Implement: reducer uses shared isValidDirection and undoStack push/pop. Hook uses useReducer, stable useCallback actions and useMemo for queue/currentCard/remaining/score/canUndo; score imports directly from calculateScore.js. Removed the unnecessary scorer import/export from the supplied reducer, as requested. No useEffect/useState, API calls or DeckPage wiring were added.
- Mutation: temporarily replaced pure push with state.history.push plus the original history reference. Reducer tests failed, including the unchanged-state snapshot assertion. Restored the original source in finally, then all client tests passed again.
- Verification: npm.cmd test passed the client/server-unit/API suites (277/134/93 tests respectively); lint and build exited 0. The requested forbidden-pattern scan was empty and the reducer/hook were manually inspected.
- Evidence: docs/evidence/5.3 contains original output and labelled PNG renders of that output (not native terminal captures). No browser UI verification is claimed because the hook is not connected to DeckPage yet.
- WBS: only task 5.3 C/T/I/R is newly completed; section 5 progress is 3 / 9. Task 5.4 remains separate despite score already being exposed as derived data.

### Task 5.4 — Derived score regression tests (2026-11-20)

- No production implementation was needed: task 5.3 already calculates score from history in useMemo. The new tests therefore passed immediately; no missing-feature red phase is claimed.
- Added the supplied equality and spy tests, with a positive spy-call assertion so a disconnected spy cannot produce a false green. The installed Vitest captured calls through the existing named import; no namespace production rewrite or dependency injection was needed. Equality was also checked after hydrating an exhausted deck and undoing afterward.
- Added a reducer assertion that state does not contain score. Mutation: temporarily imported calculateScore into swipeReducer and added score to the swipe state. This assertion failed, proving the architectural regression is detected even if visible score results could remain correct. Restored the original source in finally and passed the full client suite again.
- Verification: complete npm.cmd test passed client/server-unit/API suites (281/134/93 respectively), lint and build passed. Source scan found no useEffect/useLayoutEffect/useState; score is absent from reducer state and appears once as a derived return property inside hook useMemo. Production files match their original contents.
- Evidence: docs/evidence/5.4 includes command output and labelled PNG renders of the captured logs, not native terminal-window screenshots. No browser UI check was required or performed.
- Commit name is intentionally test: derived score, rather than feat:, because this task adds only tests and documentation. WBS 5.4 C/T/I/R completed; I was already implemented in 5.3; section 5 progress is 4 / 9.

- Retained the first post-restore client failure: the existing Gallery deep-link dialog-open assertion was flaky again. The unchanged working tree passed on retry and in the complete test run; no Gallery code was modified. See 03-restored-green.txt and 03-restored-green-retry.txt.

### Task 5.5 — Pointer swipe card (2026-11-20)

- Fail Test: wrote SwipeCard tests before the component existed; test:client failed on the missing SwipeCard import. Implemented the supplied component/CSS with the requested semantic section instead of div.
- Draft corrections: removed the unused pointer test helper and the weak touch-action OR assertion. Transition is controlled entirely by CSS via data-dragging (rather than the draft's inline transition), with a reduced-motion override. Pointer move uses the active pointer ref instead of render-time isDragging, disabled blocks movement/commit even if enabled state changes mid-gesture, and the image is not natively draggable. Added exact +/-100px, disabled-mid-gesture and dragging-transition tests. Only dragX and isDragging are local state.
- Threshold mutation: replacing the >=100px check with true made the short-drag/no-swipe test fail. The original component was restored in finally, and all client tests passed again.
- Verification: npm.cmd test passed client/server-unit/API suites (297/134/93 respectively), lint and build passed. Forbidden-pattern scan found no keypress/keyCode/alert/defaultProps/didCancel/div/useEffect in SwipeCard.
- Actual Chrome mouse verification on a temporary consumer of the real component: right/left gestures fired the matching callback, a 50px drag returned to translateX(0px) without a swipe, and releasing below/outside the card still fired right while native pointer capture was active. The consumer advanced to its next local card after a successful swipe.
- Chrome mobile emulation with trusted CDP touch events: horizontal swipe fired right and left scrollX/scrollY at zero; vertical swipe scrolled 145px, canceled the card drag, reset its transform and did not swipe. This is emulated touch, not a physical-phone check. Computed touch-action was pan-y, position relative, aspect ratio 3 / 4. Reduced motion computed transition-property none and duration 0s. Final browser Console had no errors/warnings.
- Harness issue: its first browser run had a missing favicon 404 after the gesture checks passed. Added an empty favicon only to the temporary harness; the repeat passed with a clean Console. The temporary HTML/JSX and test Vite process were removed afterward. Production DeckPage and API wiring are unchanged.
- Evidence: docs/evidence/5.5 has real browser screenshots/report and command logs. Unit-test PNGs are labelled renders of captured output, not native terminal-window screenshots. The image alt is intentionally empty because name/bio label the article; review against final 7.1 requirements later. The 100px threshold remains the supplied provisional value.
- WBS 5.5 C/T/I/R completed, progress 5 / 9. Keyboard/controls remain task 5.6 and persistence remains 6.2.

### Task 5.6 — Keyboard swipe and native controls (2026-11-20)

- Fail Test: wrote the supplied keyboard/controls tests before their modules existed; test:client failed on missing imports. The same initial run also hit the previously observed Gallery deep-link dialog-open flaky assertion; its log is retained, and no Gallery source was changed.
- Implement: window keydown mapping uses event.key only; ignores repeat, ctrl/meta/alt, disabled state and editable targets. There are exactly two effects: update handlersRef after commit with [onSwipe,onUndo], and attach/remove the listener with [enabled]. The draft's ref write during render was corrected before use, so no render-side-effect failure is claimed. A global listener is intentional for the deck, unlike the modal-local lightbox handler.
- DeckControls uses native type=button buttons in Left/Right/Undo order, disabled props for swiping/undo and no div. Layout sizing remains in layout.css; only button presentation is in DeckControls.css. Added tests for textarea/select/contentEditable, refreshed callbacks, enabled transitions and button order. The contentEditable unit test explicitly supplies jsdom's missing isContentEditable property; Chrome verified the real property separately.
- Mutation: removing the editable-target early return failed the does-not-steal-keys test and other editable-field cases. Original hook restored in finally; all client tests passed again.
- Complete verification: client/server-unit/MongoDB API suites passed (321/134/93 tests), plus lint/build. Forbidden-pattern scan was empty; exactly two useEffect calls were confirmed.
- Chrome verification on a temporary StrictMode consumer of the actual useSwipeDeck, SwipeCard, DeckControls and useDeckKeyboard: arrows swiped, uppercase Z and Backspace undid; text input, textarea, select and contentEditable retained their keystrokes without changing deck history. Four held ArrowRight keydowns (three repeat=true) created only one swipe. Tab from Swipe right reached Undo and Enter undid. Backspace outside editable content had defaultPrevented=true, preserved the URL and undid an existing entry.
- Unified-action proof: pointer swiped card a right, the button swiped b left, keyboard z undid b; final history contained only a/right and score 10. All three paths received the same swipe/undo callbacks from the hook, not separate implementations. At 375px the document width was 375px and controls height was 44px. Console was clean.
- Harness corrections: the first observer read defaultPrevented too early via a microtask; changed it to a post-listener timer and ensured focus/history preconditions before checking Backspace. The temporary JSON output initially overflowed at 375px; enabled wrapping only on that harness output. Production was unchanged by these fixes. Temporary files and verification Vite process were removed.
- Evidence: docs/evidence/5.6 includes actual browser screenshots/JSON and command logs. Unit-output PNGs are labelled renders of captured logs, not native terminal captures. Production DeckPage is still unchanged; final integration belongs to later tasks. WBS 5.6 C/T/I/R completed, progress 6 / 9.

### Task 5.7 — Undo control and event-driven announcements (2026-11-20)

- Contract updated first: useSwipeDeck accepts optional initial cards/history only on mount, and useDeckActions/DeckStatus define event messages without hydration effects or API calls.
- Test-first: used the actual DeckStatus in the supplied harness, fixed its missing vi import, and added tests using the actual DeckControls plus keyboard hook. The initial run failed on missing modules and unsupported initial state. Added initialization tests before changing the existing hook.
- Implementation: removed the draft's useHydrateOnce/hydrated helper. useDeckActions initializes the reducer directly, stores only the event-message string, sets it in successful swipe/undo handlers and derives No more cards from exhausted nonempty history. Empty undo and invalid/no-card swipes leave the message untouched. It overrides the returned raw swipe with the message-aware wrapper so pointer/buttons/keys can share it. No effect, alert, div or normal role=alert is used by the new action/status modules.
- Regression protection: initial state is synchronous and does not reset on rerender; existing hydrate callers still work. Empty keyboard undo adds no error message; initially empty cards do not announce exhaustion; undo from the finished deck announces the restored final card.
- Mutation: temporarily omitted the undo setMessage call. The undo-announcement tests failed, including restored-card naming after exhaustion. Restored original source in finally; the full client suite passed again.
- Verification: npm.cmd test passed client/server-unit/MongoDB API suites (337/134/93 respectively); lint/build passed. Forbidden-pattern scan was empty and message setters were manually confirmed inside handlers only.
- Actual Chrome temporary integration: Undo disabled initially, enabled after swipe and disabled after final undo. Status was always a polite live region, measured 24px when empty and populated, and observed one DOM text update per successful button/pointer/keyboard action. Empty z/Backspace did not change the prior message; completion said No more cards and undo from completion named Gia Bao. No browser dialogs, alerts, console errors/warnings or 375px horizontal overflow.
- Limits: DOM update counts do not establish spoken output. NVDA/VoiceOver was not exercised and must be checked after final DeckPage integration (5.8). Frame height is not a full-page CLS audit. Production DeckPage remains unchanged; the temporary consumer and Vite process were cleaned up.
- Tooling correction: the first extraction helper assumed the pasted test filename ended immediately with a colon; its title included a parenthetical description, so extraction stopped before creating test files. Corrected the anchor and restored/reapplied only this task's own contract edit; no unrelated content was reset.
- Temporary scripts, npm cache, Playwright and Chrome runtime/profile were placed under D:/CodexTemp per the user's preference. The pasted attachment and installed Chrome executable on C: were read only.
- Evidence: docs/evidence/5.7 includes real browser screenshots/report, original command logs and clearly labelled PNG renders of test output (not native terminal-window screenshots). WBS 5.7 C/T/I/R completed; progress 7 / 9.

### Task 5.8 — Results summary (2026-11-20)

- Contract clarified before component code: stateless ResultsSummary renders named history pairs in order, Unknown card fallback, Right/Left labels and Total score last. The owner decides when the deck is exhausted; permanent DeckPage integration remains a follow-up, not part of this component commit.
- Fail Test: wrote the supplied tests first (removed the unused within import); test:client failed because ResultsSummary.jsx did not exist. Implemented useId, Map name lookup and keyed Fragment pairs with no extra DOM wrappers or state. Defensive unknown direction lookup uses Object.hasOwn to avoid inherited constructor/toString properties, with three regression cases.
- Key mutation limitation: replacing key=entry.cardId with an array index passed all 14 static summary tests. Restored the ID key. This is a surviving mutation, not a claim of test coverage: React does not generally warn merely because a key is an index, even when reordered. The current stateless text-only DOM may still look correct; stable identity is enforced by source review and the explicit contract. Console silence alone does not prove the right key expression.
- Structure mutation: wrapped the final dt/dd in a div; the direct-child/no-div tests failed. Restored the original component in finally and all client tests passed again.
- Complete verification: client/server-unit/MongoDB API suites passed (351/134/93 tests), lint and build passed. Forbidden-pattern scan was empty; inspected entry.cardId keys, direct dt/dd children, final score pair, no state and no visibility condition in the component.
- Real Chrome temporary integration with useDeckActions, SwipeCard, DeckControls and DeckStatus: Right/Left/Right exhausted three cards and displayed names Minh Anh/Gia Bao/Thu Ha plus score 15. Undo hid Results, restored Thu Ha and score 5; swiping Left again displayed Right/Left/Left and score 0. The owner condition, not ResultsSummary, controls visibility.
- Accessibility.getFullAXTree exposed one DescriptionList with four terms and four definitions. The rendered dl had exactly eight direct DT/DD children and no div. At 375px the document width was 375px. Console had no key or other warnings/errors. AX structure is not a screen-reader speech test; NVDA/VoiceOver remains unverified.
- Evidence: docs/evidence/5.8 contains real browser screenshots/report/AX roles and original command logs, plus labelled PNG renders of logs (not native terminal-window screenshots). The temporary HTML/JSX/Vite process were cleaned up; scripts, tool/cache/profile remained on D:/CodexTemp. Production DeckPage was not modified.
- WBS 5.8 C/T/I/R completed, section 5 progress 8 / 9. No changes to 5.9 or persistence tasks.

### Task 5.9 — Integrated deck behavior (2026-11-20)

- Test-only task: used the supplied 12 integration cases and added one real SwipeCard/buttons/keyboard parity case to meet the pointer requirement missing from the sample. No production change. Hooks, reducer, controls and status are real; only unavailable jsdom pointer-capture methods are platform stubs. Every state-changing event uses act; no timers or sleeps.
- Initial run: all 13 tests green against existing implementation; no new integration defect discovered. This is integration verification, not a claim of test-first implementation of existing production code.
- Mutation 1 removed the editable-target guard: typing in a text field test failed (left replaced right). Mutation 2 removed undo setMessage: undo after finishing test failed with stale swipe message. Each production file was restored in finally; all 13 tests green afterward and git diff confirms no production changes.
- Full verification: client 364, server-unit 134, actual MongoDB API 93 tests passed; lint and production build passed. Forbidden timer scan empty. No unrelated Gallery failure occurred in this run.
- Evidence: docs/evidence/5.9 contains original command logs and clearly labelled PNG renders of captured output, not native terminal screenshots. Temporary scripts and browser runtime use D:/CodexTemp.
- WBS 5.9 C/T/I/R completed, progress 9 / 9. Section 5 browser acceptance remains open: permanent DeckPage wiring is a separate follow-up before section 6, including mouse/keyboard/buttons Results parity, repeated Undo, and F5 reset. No browser or screen-reader acceptance claimed for the placeholder production page.

### Task 6.1 — API client (2026-11-20)

- Contract: extend the existing client (one ApiError definition) with getCards/getSwipes/createSwipe/undoLastSwipe and optional getPhotos category. Shared validateSwipeInput guards POST; signals are forwarded. No new dependencies. usePhotos remains compatible and unchanged. INTERFACES clarifies network status 0, generic parse errors, and AbortError identity through fetch and JSON parsing.
- Fail test: supplied 14 tests plus two response-body regressions written before implementation; old client failed 15/16 (missing exports, category and error handling). Original red log retained.
- Supplied-code issue: response.json().catch(() => null) would swallow AbortError during body consumption and silently return null on malformed successful JSON. Replaced with try/catch preserving AbortError and generic INTERNAL_ERROR otherwise. Added targeted regressions.
- Supplied-test issue observed after implementation: category test reused one native Response for two requests, so the second body read failed. Corrected the mock to return a fresh Response each call; preserved the failed run separately. Did not weaken production parsing or assertions.
- Abort mutation: removed fetch AbortError pass-through, identity test failed (wrapped as NETWORK_ERROR), then restored in finally. All 16 client tests passed again. No mutation remains.
- Full verification passed: client 380, server-unit 134, MongoDB API 93; lint/build pass. Forbidden-pattern scan empty; exactly one client ApiError class.
- Real Chrome against seeded API/MongoDB: 12 photos loaded through Vite proxy; no console warnings/errors while healthy. Stopped only the backend launched for this check, reloaded, and observed Could not load photos. Browser recorded the expected HTTP 502 resource error from the proxy, zero page errors and zero unhandled rejections. Temporary backend/frontend were stopped afterward.
- Evidence: docs/evidence/6.1 includes command logs, actual browser screenshots/report and labelled rendered-log PNGs (not terminal screenshots). Tool scripts/runtime remain on D:/CodexTemp; attachments/Chrome executable on C were read only.
- WBS 6.1 C/T/I/R checked, section 6 progress 1 / 4. Persistence hook, rollback and permanent DeckPage wiring remain separate; no claim they are implemented.

### Task 6.2 — Persistence hook (2026-11-20)

- Contract: useSwipePersistence composes the existing real reducer/deck hook. One load effect owns a lifetime AbortController shared by getCards/getSwipes and writes, and cleanup aborts it. The latest deck ref updates in an effect, never during render. Local state is limited to status/error/pendingCount; score/queue/canSwipe/isSyncing remain derived. Contract notes clarified in INTERFACES.
- Fail test: supplied 12 tests plus six focused ordering/cancellation regressions written before the hook. The first run failed resolving the missing hook module; original log retained.
- Supplied implementation gaps corrected: unused useReducer import removed; POST/DELETE now receive signal; no exhaustive-deps suppression; synchronous operationRef blocks two writes in one React batch, rather than waiting for isSyncing rerender. It also retains the exact removed entry/direction for undo rollback. Status prevents writes before loading, invalid directions are ignored before dispatch, and a successful retry clears error. Non-ApiError exceptions are converted to a generic ApiError; AbortError is ignored.
- Real reducer integration with mocked API boundary: optimistic POST and DELETE, both rollback directions, multiple-call lock including undo, saved history hydration, shared signals, write abort on unmount, error identity/clear-on-success and no rejected write Promise. All 18 tests passed. No timer/sleep or mocks of reducer/deck logic were added.
- Mutation: removed the load-effect cleanup abort; both load-unmount and write-unmount tests failed. Hook restored byte-for-byte in finally; all 18 tests green again. No mutation remains.
- Full tests passed: client 398, server-unit 134, MongoDB API 93. Lint/build results retained in evidence. Source scan found no forbidden cancellation flag, lint suppression, derived object state, defaultProps or console calls.
- Evidence: docs/evidence/6.2 contains original command output and labelled rendered-output PNGs (not native terminal screenshots). Temporary scripts/runtime use D:/CodexTemp.
- Scope limit: production DeckPage is still separate. Browser POST 201 / DELETE 200, F5 persistence, Slow 3G lock and server-off error UI were NOT performed for this task and remain explicitly pending. Error UI belongs to 6.3; 6.4 is not marked complete. WBS 6.2 C/T/I/R checked, progress 2 / 4.

### Task 6.3 — Deck presentation and persistence error handling (2026-11-20)

- Contract clarified before component implementation: fixed code-based DeckErrorMessage, permanent DeckPage composition, loading/error/ready/empty/finished views, retry, write-disabled Undo, and no raw server strings. Section 6 now exports retry and lists loadAttempt as request-trigger state.
- Fail test: supplied presentation tests plus targeted empty-deck, inherited-code, real retry callback, controls/keyboard, refetch-loop and DELETE recovery regressions failed before implementation (missing error component, placeholder page, missing retry). The weak sample retry assertion was replaced with an assertion that retry is actually called.
- Implemented fixed error messages with Object.hasOwn to prevent constructor/toString/prototype lookup; no alerts for ordinary actions. DeckPage renders a null-safe empty state, keys SwipeCard by card ID, disables Undo during writes and only renders Results for exhausted nonempty history. Score and status lines use existing layout classes. No full-page CLS=0 claim is made without a separate measured audit.
- Retry sets loading and clears error in the event callback, then increments loadAttempt; the effect performs requests and cleanup with complete dependencies. This avoids the sample's synchronous state setters inside the effect and requires no lint suppression. A test confirms history changes do not refetch. Existing POST/DELETE catch and rollback remain unchanged; successful writes clear errors.
- Mutation: removed role=alert; the announcement/mapping tests failed. Restored the original component in finally; all 44 related tests passed. Complete suites: client 424, server-unit 134, actual MongoDB API 93; lint/build passed. Forbidden source scans were empty.
- Real Chrome with actual production DeckPage/API and a uniquely named isolated seeded MongoDB: starting backend and clicking Try again recovered without navigation; a separately created duplicate swipe produced real POST 409, fixed friendly text and local rollback; a successful retry cleared alert. POST 201 / DELETE 200 persisted across F5. An 800ms throttled write blocked all controls and rapid mixed inputs emitted one POST. Backend-off save restored the optimistic card.
- Proxy distinction: stopping backend behind Vite yields HTTP 502, mapped by the established client contract to INTERNAL_ERROR, so UI correctly shows Something went wrong. Please try again. rather than the guide's Connection lost assumption. NETWORK_ERROR mapping is covered by component tests; no HTTP body or raw error string is exposed. Expected 409/502 resource errors are in the captured Console; zero page errors or unhandled rejections across navigation/reloads.
- Full-deck browser parity: buttons, keyboard and mouse each completed 10 cards, score 25, Results and finished status; repeated Undo restored LIFO card order and hid Results. At 375px no horizontal overflow. Screen-reader speech and comprehensive Lighthouse/CLS are not claimed.
- Tooling issue: initial browser helper waited for a second exit event on an already signalled Node child during cleanup. Stopped only helper-owned processes and removed the validated isolated test database; corrected signalCode handling and reran browser verification with rejection capture across every reload. Final run exited and dropped its isolated database successfully. No dev database was seeded, deleted or altered. Scripts/runtime remained on D:/CodexTemp.
- Evidence: docs/evidence/6.3 retains original command logs, actual browser PNGs/HTTP/Console report, and labelled renders of command logs (not native terminal screenshots). WBS 6.3 checked, section 6 progress 3 / 4; previous DeckPage browser prerequisites recorded as completed here. 6.4 remains unchecked.

### Task 6.4 — Fetch-boundary persistence verification (2026-11-20)

- Test-only: added useSwipePersistence.fetch.test.jsx using the real client, shared validation, hook and reducer; only global fetch is mocked. No module mock of client.js and no production change. Initial 11 tests were green, as expected for verification of existing implementation.
- Sample test improvements: POST/DELETE deferred Promises are explicitly rejected with AbortError and action Promises awaited after unmount; the sample left them unresolved and only checked signal state. GET abort also drains completion. Node process/setImmediate are explicitly imported for the jsdom lint environment; unhandledRejection listener is removed in finally. Removed the extraneous _id fixture field to match the response contract. No timeout/sleep or cancellation flag in the test file.
- Mutation 1 coverage limit: removing client AbortError pass-through does NOT make the unmount POST test fail, because the hook independently ignores failures when signal.aborted. Added an active-signal fetch AbortError case to isolate client mapping: this case failed with NETWORK_ERROR under the mutation, then passed after restoration. This is not a claim that the unmount test distinguishes the two client implementations.
- Mutation 2: removed cleanup controller.abort(); GET, POST and DELETE unmount signal tests failed. Both production files were restored byte-for-byte in finally, with empty git diff confirmed. All 11 tests green afterward.
- Error integration includes HTTP 409 ApiError/local rollback, fetch rejection NETWORK_ERROR, non-JSON 502 generic INTERNAL_ERROR without raw body leakage, and failed DELETE restoring the original direction. Successful load/write logs nothing.
- Complete verification: client 435, server-unit 134, actual MongoDB API 93 tests passed; lint/build passed. The requested forbidden-pattern scan returned no matches. The process unhandledRejection observer is supplemental and weak in isolation; action completion plus Vitest error detection and Chrome evidence provide additional checks. Console silence alone is not proof of no internal state-setter invocation after unmount (React may not warn); signal checks, completed action Promises, unchanged error snapshot and source abort guards establish the tested behavior.
- Actual Chrome production-page verification: throttled API requests at 2000ms latency and 50000 bytes/s each way (explicit custom settings, not a claim about the named Slow 3G preset). Navigating Deck to Gallery while loading generated actual Network.loadingFailed canceled=true / net::ERR_ABORTED for cards/swipes; repeating during a pending POST generated canceled=true for POST /api/swipes. Extra initial cancellations from StrictMode were retained and labelled by phase. Console warnings/errors, page errors and unhandled rejections were all zero.
- Browser evidence: actual page screenshots plus CDP event JSON and a clearly labelled event-log render, not a fabricated DevTools Network-panel screenshot. A canceled POST does not establish that a server-side write did not commit; refresh/server history remains authoritative. Used only a unique isolated seeded test database, validated name before dropping it, and stopped helper-owned API/Vite/Chrome processes. Dev data was untouched. Temporary scripts/runtime on D:/CodexTemp.
- WBS 6.4 C/T/I/R marked test-only; section 6 progress 4 / 4. No new ticks in section 8; this evidence is available for its later audit.

### Screenshot review — production announcement gap (2026-11-20)

- Read-only check of running dev data: GET /api/swipes returned 8 entries, derived score -25, page displayed Score: -25 and Undo enabled correctly. No dev swipes were created or deleted.
- Measured document scrollWidth/clientWidth at 375, 480, 640, 768, 1440 and 1900px for Gallery All/Documents/Evidence and Deck (24 combinations). No document overflow found. Header clipping in the supplied images cannot establish an app layout defect. This does not cover every viewport, lightbox or keyboard-focus state, so task 7.4 remains unchecked.
- Actual production-page behavior against a separate seeded API/database: after POST 201 status was empty; after DELETE 200 status was also empty; empty history correctly disabled Undo. Completing the deck rendered Results and No more cards. The page passes only finished ? No more cards : empty to DeckStatus, whereas earlier useDeckActions generated per-action announcements but is not composed with persistence. Prior tests and screenshot assumptions missed this page-level regression.
- Reopened 5.7 implementation/refactor acceptance; section 5 progress corrected to 8 / 9. Section 6 remains 4 / 4. Production code was not changed during this requested verification.
- Card-name duplication confirmed in scripts/generate-placeholder-images.js: generated SVG contains card.name, and SwipeCard overlays the heading. This is placeholder content, left unchanged; no visual redesign was requested.
- Helper failure: initial broad **/api/** forwarding rule accidentally matched the Vite module /src/api/client.js and returned a test-server 404, causing a harness-only render failure. Narrowed forwarding to pathname starting /api/ and reran successfully. A continuation helper also briefly failed because its skipped measurement phase omitted the live Undo snapshot; restored that read before rerun. No production fix was needed for either helper issue. Temporary API/database cleaned after each attempt, helper on D:/CodexTemp; user dev servers remained running.

### Tasks 7.2–7.6 — production accessibility, images, responsive, Lighthouse and HTML (2026-11-21)

- Defined the section 7 verification contract before code changes. Existing focus/contrast and responsive CSS passed without unnecessary modifications. Verified real Tab/Enter/Escape, skip link, Deck controls, native modal background inertness and opener restoration. All measured active targets >=24x24 CSS px (primary controls 44px); calculated contrast 12.80:1–16.00:1; axe A/AA found no violations in Gallery, Deck and Lightbox. These are scoped checks, not blanket certification.
- 7.3 regression tests red first, then green: first Gallery and active Deck images eager/high priority, other grid images lazy; alt/intrinsic dimensions preserved. Decorative Deck alt stays empty because the adjacent heading names the card. Tiny scalable SVG asset sizes recorded.
- Responsive: 47 combinations passed across 375–1440 CSS px, including filters, active Deck, Lightbox and Results. No document horizontal overflow or hiding workaround.
- Lighthouse: baseline Gallery 100/100/100, Deck 99/100/100; after image policy, final production default-mobile runs both 100/100/100. HTML/JSON, intermediate data and native report screenshots retained. Scores were not edited and no throttling/thresholds relaxed.
- Nu checker found a real invalid footer/figure nesting in the AI-generated Lightbox and warned about article heading scope. Wrote a failing regression, moved footer outside figure and replaced the nested card-text section with header. Six rendered states now have zero errors/warnings. Kept baseline diagnostics and final DOM snapshots. Client 437/server-unit 134/MongoDB API 93 tests, lint/build passed after fixes.
- Helper corrections: axe requires an explicit browser context; fixed newPage setup. Native Tab can focus browser chrome with document.hasFocus false; changed the check to reject background page controls rather than browser UI. An audit ran during a build replacing dist and was rerun sequentially after build completion. Lighthouse report template contains hidden gauges; screenshot selector corrected to visible native gauges. No production code was changed for these helper issues.
- Evidence in docs/evidence/section7. User Word report preserves seven original captioned images and adds 15 English-captioned captures/summaries plus methods/results; generated summaries are labelled, not passed off as DevTools screenshots. Only dedicated test data was used, with all tools/cache/runtime on D:/CodexTemp. Existing uncommitted 7.1/5.7 review changes were preserved separately. No work on 5.7 message integration is claimed.

- Final helper cleanup: Vite SPA fallback intercepted the appended stop middleware, so its 200 response was not accepted as proof of cleanup. Stopped only the matching verification Node parent/child, validated the isolated database name and dropped it explicitly; dev services/data were untouched.

## Homework 2

> Only real AI-caused failures encountered during development and verification are logged here.
> No failures are staged or fabricated.

### Failure Log

<!-- Template per real failure: Date / WBS task · AI prompt · Symptom · Root cause · Fix · Evidence -->

#### F-01 — jest-dom setup fails with "Invalid Chai property"

- **Date / WBS task:** 2026-11-24 · 0.1
- **AI prompt:**
  > 0.1 `client/`: scaffold React 19 + Vite (`createRoot`, `<StrictMode>`); install `react-router`, Vitest, Testing Library
- **Symptom:** The smoke test using `toBeInTheDocument()` failed with `Error: Invalid Chai property: toBeInTheDocument`, although the setup file was confirmed to load.
- **Root cause:** AI suggested `import '@testing-library/jest-dom/vitest'`; with jest-dom 8 + Vitest 5 and `globals: true`, this entry did not register the matchers on the `expect` used by the tests.
- **Fix:** `tests/setup.js` now uses `import * as matchers from '@testing-library/jest-dom/matchers'; expect.extend(matchers);`. (Switching `defineConfig` to `'vitest/config'` was tried first and did not fix the error; it was kept only for correct typing of the `test` block.)
- **Evidence:** `npm.cmd run test:run` — smoke test failed before the change and passed after it.

#### F-02 — JSX inside a `.js` context file

- **Date / WBS task:** 2026-11-24 · 2.1
- **AI prompt:**
  > 2.1 [Contract] Fields: … rules live in `shared/validateAppeal.js`
- **Symptom:** The contract specified `FormContext.js`, but the file renders `<FormContext.Provider>`; Vite does not parse JSX in `.js` files, so the build would fail.
- **Root cause:** AI copied the filename from the slide (`FormContext.js`) without checking it against the file's content and the Vite toolchain.
- **Fix:** Renamed to `FormContext.jsx` in the contract and WBS before any implementation.
- **Evidence:** Caught during contract review, before code was written; no runtime failure occurred. `npm.cmd run build` passed with `FormContext.jsx` in WBS 2.3 (commit `80671f5`).

#### F-03 — Commit split lost the full route file

- **Date / WBS task:** 2026-11-24 · 1.6
- **AI prompt:**
  > 1.6 [Refactor] … tests green → commits `feat(hw2): router layout`, `feat(hw2): detail route handling`
- **Symptom:** After splitting the work into two commits, `feat(hw2): detail route handling` contained the layout-only `AppRoutes.jsx`; 4 routing tests failed (`4 failed | 12 passed`).
- **Root cause:** The AI agent backed up the full `AppRoutes.jsx` into a scratch directory that did not exist; `cp` failed, the script did not stop, and the "restore" step silently had nothing to restore.
- **Fix:** Rewrote the full `AppRoutes.jsx` (lazy `PersonDetail`/`AppealPage`, nested `:playerID/appeal`) and amended the unpushed commit. Lesson: verify the backup exists before overwriting, and run the tests before each commit of a split.
- **Evidence:** Test run after the amend: `16 passed (16)`; build emitted separate `PersonDetail` and `AppealPage` chunks. Terminal output only, no screenshot.

#### F-04 — `readFileSync(new URL(…, import.meta.url))` fails in jsdom

- **Date / WBS task:** 2026-11-24 · 2.2 (repeated in 3.2 and 4.4)
- **AI prompt:**
  > 2.2 [Fail Test] … form component tests (… `useEffect` guard …)
- **Symptom:** Test 10b (source must not contain `useEffect`) failed with `TypeError: The URL must be of scheme file` instead of reaching its assertion.
- **Root cause:** AI assumed `import.meta.url` is a `file://` URL. Under Vitest's jsdom environment it is not, so `node:fs` rejects it. The same pattern was suggested again for the SLA hook test (3.2) and the forum hook test (4.4).
- **Fix:** Read the source through Vite instead: `import source from '../src/context/FormContext.jsx?raw'`. Applied pre-emptively in 3.2 and 4.4.
- **Evidence:** Test 10b passed for the right reason (stub had no `useEffect`) after the change; `useAppealSlaTimer` test 11 and `useForumMessages` test 9 used `?raw` from the start. Terminal output only.

#### F-05 — Source-scanning test tripped by a code comment

- **Date / WBS task:** 2026-11-25 · 2.3
- **AI prompt:**
  > 2.3 [Implement] `context/FormContext.jsx`: `createContext(null)` + `FormProvider` … + `useFormContext()`
- **Symptom:** With the AI-supplied `FormContext.jsx`, test 10b failed: the file contained no `useEffect` call, only the comment `// Derived during render — never stored, never synced with useEffect`.
- **Root cause:** The AI-generated test checks the raw source with a regex, and the AI-generated implementation mentioned the forbidden word in a comment. The two outputs were never checked against each other.
- **Fix:** Reworded the comment to `never stored in state, never synced by an effect`; no logic changed.
- **Evidence:** `appealForm` went from `8 failed | 1 passed` to the expected `7 failed | 2 passed` (10b and 16). Terminal output only.

#### F-06 — `curl.exe` command loses JSON quotes in Windows PowerShell

- **Date / WBS task:** 2026-11-26 · 4.3
- **AI prompt:**
  > Manual check for S4a: `curl.exe -i -X POST http://localhost:3001/api/appeals -H "Content-Type: application/json" -d $ok`
- **Symptom:** A valid appeal payload returned `HTTP/1.1 400 Bad Request` with `{"error":"Malformed JSON body."}`.
- **Root cause:** Windows PowerShell 5.1 strips embedded double quotes when passing a string argument to a native executable, so the server received invalid JSON. The AI wrote a command that only works in bash or PowerShell 7.
- **Fix:** Pipe the body through stdin: `$ok | curl.exe … --data-binary "@-"`.
- **Evidence:** Same payload then returned `201 Created`; the 400 and 409 cases behaved as specified. Screenshot of the malformed-JSON response kept as a side effect proving the error handler returns JSON without a stack trace.

#### F-07 — Synchronous query on a lazy-loaded route

- **Date / WBS task:** 2026-11-26 · 4.5
- **AI prompt:**
  > 4.5 [Integrate] … appeal history from `GET /api/appeals/:playerId`, refreshed after submit
- **Symptom:** Integration test d failed after the feature was implemented: `Unable to find a label with the text of: Email`; the DOM showed the dossier but not yet the appeal form.
- **Root cause:** `AppealPage` is loaded with `React.lazy`. The AI-written test waited for the appeal history, then used synchronous `getByLabelText`, which ran before the lazy chunk resolved — a rule the project had already fixed in Sprint 1 (use `findBy*` for lazy content).
- **Fix:** `await screen.findByLabelText('Email')` in the test; production code unchanged (commit `495adb0`).
- **Evidence:** Full client suite `78 passed (78)` on three consecutive runs.

> Not logged (not AI-caused): npm resolving `react-router` to v8 (pinned to v7), the `d:` vs `D:` drive-letter casing that loaded two Vitest instances in the agent's shell, and an install interrupted by the user.

---

### Architecture Analysis

#### 1. Routing tree (React Router v7, declarative)

```text
<BrowserRouter>
└── App (header <h1>)
    └── AppRoutes
        ├── /                      → <Navigate to="/dossier" replace />
        ├── /dossier               → PeopleLayout (<nav> NavLink sidebar + <main><Suspense><Outlet/>)
        │   ├── index              → SelectCase
        │   └── :playerID          → PersonDetail (lazy)  — useParams() → players.find()
        │       └── appeal         → AppealPage (lazy)    — useOutletContext()
        └── *                      → NotFoundState (full page, no sidebar)
```

- Unknown `:playerID` renders `NotFoundState` **inside** the layout, so navigation never disappears.
- `NavLink` provides `aria-current="page"`; styling uses the `className` function, not `activeClassName`.
- Two `Suspense` boundaries: one for the dossier, one inside `PersonDetail` for the appeal chunk, so opening the form never blanks the case file. Skeletons reuse the real classes (CLS ≈ 0).

#### 2. Form data flow (Context, derived errors)

```text
SimpleForm ──validate=validateAppeal──▶ FormProvider
                                         state:   values, touched, submitAttempted, status, serverMessage, serverErrors
                                         derived: errors = validate(values)   ← every render, no useEffect
                                                  isValid, visibleErrors (touched || submitAttempted, + serverErrors)
             InputField × 7 ◀── useFormContext() ── value / onChange / onBlur / aria-invalid / aria-describedby
             ShowData       ◀── { ...values, isValid, status, isExpired }
```

- Errors are never stored, so they cannot drift from `values`; one keystroke = one render.
- Invalid submit: no request, all errors shown, focus moved to the first invalid control (inside the event handler).
- `MessageForm` reuses the same provider with `validateMessage` — one form engine for both forms.

#### 3. Clock-delta timer (`useAppealSlaTimer`)

```text
offset      = serverNow − (t0 + t1) / 2          GET /api/time, midpoint cancels latency
remainingMs = max(0, deadline − (tickNow + offset))   recomputed in render, never decremented
tick        = setTimeout to the next whole second; stops at 0; re-sync on visibilitychange
```

- State holds only `tickNow`, `offset`, `isSynced`, `syncKey`; `remainingMs`, `isExpired`, `parts` are derived.
- A throttled or sleeping tab cannot accumulate error: the zero-drift test jumps the clock 30 s without ticks and expects the next tick to show the full 31 s.
- The hook runs once in `PersonDetail`; `isExpired` flows to the form through Outlet context, and the server enforces the same deadline (`409`).

#### 4. Request cancellation

- `useAbortableGet(url, { reloadKey })`: one `AbortController` per request, `return () => controller.abort()` on URL change, refetch or unmount.
- After each `await`, `if (signal.aborted) return`; `AbortError` is ignored — no `didCancel` flags.
- The last settled result is tagged with `{ url, reloadKey }`; `loading`, `data` and `error` are derived from that tag, so a late response from an old channel can never overwrite the current one.
- `useForumMessages` and `AppealHistory` both build on this hook; posting bumps `reloadKey` for a fresh, abortable GET.

#### 5. Validation parity (client ↔ server)

```text
shared/validateAppeal.js  ─┬─▶ client: FormProvider (render pass)
shared/validateMessage.js ─┘
                            └─▶ server: POST handlers → 400 { error, fields }
```

- Both sides import the same pure functions, so messages are identical by construction.
- Server tests assert `res.body.fields` **equals** `validateAppeal(payload)` / `validateMessage(payload)`.
- The server additionally enforces what the client cannot be trusted with: player existence (`404`), the deadline on the server clock (`409`), a field whitelist (no `...req.body`), a 10 kb body limit (`413`), and a central error handler that never leaks stack traces (`500`).


## Homework 3

> Only real AI-caused failures encountered during development and verification are logged here.
> No failures are staged or fabricated.

### Failure Log

<!-- Template per real failure: Date / WBS task · AI prompt · Symptom · Root cause · Fix · Evidence -->

#### H3-F01 — Test helper `<output>` collides with `role="status"`

- **Date / WBS task:** 2026-11-26 · 2.1 (surfaced in 3.3)
- **AI prompt:**
  > 2.1 [Fail Test] `tests/gallery.test.jsx` (MemoryRouter + `LocationProbe` with test-only Back/Forward buttons): 11 cases …
- **Symptom:** After `PhotoGalleryLayout` was implemented, test 7 (unknown `photoId`) still failed with `TestingLibraryElementError: Found multiple elements with the role "status"`, although the app rendered exactly one status notice.
- **Root cause:** The AI-written test helper `LocationProbe` displayed the current URL in an `<output>` element. `<output>` has the implicit ARIA role `status`, so `getByRole('status')` matched both the helper and the real "Photo not found." notice.
- **Fix:** The helper now uses `<span data-testid="location">`; production code unchanged.
- **Evidence:** Gallery tests 1–9 pass after the change (two consecutive runs); tests 10–11 remain red until WBS 3.4 as planned. Terminal output only.

> Not logged (not failures): the guide predicted "5 failed" for the red `PhotoGrid` run, but the empty-list case legitimately passed against the `null` stub (4 failed | 1 passed); the guide also referred to an `eslint.config.js`, while the Vite template uses oxlint. Neither produced faulty code.

---

### Architecture Analysis

#### 1. The URL is the single source of truth

```text
/gallery?album=x&photoId=arena-stage
          │
useSearchParams() ─▶ photoId = searchParams.get('photoId')
                     selectedPhoto = findPhoto(photoId)        ← derived, no useState
                     isUnknown     = photoId !== null && !selectedPhoto
          │
          ├─▶ PhotoGrid    <Link to={{ search: searchFor(id) }}>   (push: Back closes)
          └─▶ PhotoDialog  photo={selectedPhoto} onClose={handleClose}
```

- There is **no `useState`** anywhere in the app (`git grep useState` is empty). Open/closed is a pure function of the URL, so a shared link, a reload (F5) and Back/Forward all produce the correct view without extra code.
- `searchFor()` / `withoutPhoto()` (`utils/photoSearch.js`) always copy the current params into a **new** `URLSearchParams`, so other params such as `album` survive and the router's object is never mutated.
- Closing uses `{ replace: true }`, so closing does not add a history entry; the `has('photoId')` guard prevents a second navigation when the close was *caused* by Back (test 8 checks that Forward still reopens the photo).
- An unknown `photoId` never opens an empty dialog: a `role="status"` notice offers "Show all photos".

#### 2. Why this one `useEffect` is legitimate

| Effect kind | Example | Verdict |
|---|---|---|
| Sync React → **external imperative API** | `dialog.showModal()` / `dialog.close()` when `photo` changes | ✅ Allowed — the DOM `<dialog>` has no declarative "open" prop that gives modal behaviour |
| Sync **derived state** | `useEffect(() => setIsOpen(!!photoId), [photoId])` | ❌ Forbidden — an extra render and a second source of truth; compute it during render instead |

- The effect only calls DOM methods, never `setState`, and depends on `[photo]` (a frozen seed object, so it re-runs only when the photo really changes).
- `open` guards in both directions make it **StrictMode-safe**: `showModal()` throws `InvalidStateError` on an already-open dialog, and `close()` on a closed dialog would emit a spurious `close` event. The test polyfill reproduces both rules, so a missing guard fails a test.
- The `<dialog>` is always rendered (stable ref); only its children depend on `photo`.

#### 3. Native focus management vs. a custom trap

- `showModal()` makes the rest of the page **inert**, moves focus to the first focusable element (the "Close photo" button) and maps **Esc** to the native `cancel` → `close`. No `keydown` listeners and no hand-written focus trap are needed, so there is less code to get wrong and it matches platform behaviour (including WCAG 2.1.2: the user can still reach the browser UI).
- One close path: the button calls the native `close()`, Esc triggers it natively and Back removes `photoId`, which makes the effect call `close()`. All three end in the `close` event → `handleClose`, the only place that updates the URL and restores focus.
- Focus is returned explicitly to `#thumb-<id>` inside the event handler. The browser already restores focus when the dialog was opened from a thumbnail, but after a **deep link or reload** nothing was focused before opening, so the explicit call keeps focus from falling back to the top of the page.

#### 4. Loading and layout stability

- `PhotoGalleryLayout` is `React.lazy`; `<Suspense fallback={<GallerySkeleton />}>` shows a skeleton that reuses `.page`, `.photo-grid`, `.photo-card`, `.photo-thumb`, so the real grid replaces it without moving (CLS ≈ 0). The skeleton exposes `aria-busy="true"` + `aria-live="polite"` and hides its fake content with `aria-hidden`.
- Every `<img>` carries intrinsic `width`/`height`; thumbnails use `aspect-ratio: 3 / 2` + `object-fit: cover`, the dialog uses `object-fit: contain` + `max-height: 70vh` so portrait photos fit a 375 px screen.

## Homework 4

> Only real AI-caused failures encountered during development and verification are logged here.
> No failures are staged or fabricated.
> Slide 31–33 code was treated as reference only; deliberate deviations are explained in the Architecture Analysis.

### Failure Log

<!-- Template per real failure: Date / WBS task · AI prompt · Symptom · Root cause · Fix · Evidence -->

#### H4-F01 — Visually-hidden button suffix lost its space ("Passon Ana")

- **Date / WBS task:** 2026-11-26 · 4.2
- **AI prompt:**
  > 4.2 [Implement] … `SwipeControls`: visible text `Pass` / `Super like` / `Like` / `Undo` + visually hidden ` on {name}` / ` last swipe` (WCAG 2.5.3 Label in Name)
- **Symptom:** `swipeDeck` tests D4 and D6 failed: `Unable to find an accessible element with the role "button" and name "Pass on Ana"`. The role dump showed the computed name `Passon Ana` (likewise `Super likeAna`, `Undolast swipe`).
- **Root cause:** The AI put the separating space *inside* the visually-hidden `<span>` (`Pass<span> on Ana</span>`). Accessible-name computation trims leading whitespace of each child element's text, so the visible and hidden parts were glued together. The intended WCAG 2.5.3 fix would have produced wrong names for screen-reader and voice-control users.
- **Fix:** The space is now a separate text node before the hidden span (`Pass{' '}<span className="visually-hidden">on Ana</span>`), via a small `suffix()` helper in `SwipeControls.jsx`.
- **Evidence:** D4 and D6 pass; client suite `34 passed (34)` on two consecutive runs. Terminal output only.

#### H4-F02 — Disabled controls dropped keyboard focus to `<body>`

- **Date / WBS task:** 2026-11-26 · 4.2 (found and fixed in 4.3)
- **AI prompt:**
  > 4.2 [Implement] … always-visible buttons … Disabled when there is no current profile / `!canUndo`
- **Symptom:** With the 4.2 code, new tests failed against the existing UI. D10 (Start over) reported `Expected element with focus: <section aria-labelledby=…>` but `Received element with focus: <body>`. D9 showed the Undo button switched to the native `disabled` state, which removes it from the focus order the moment the last undo is used.
- **Root cause:** The AI used the native `disabled` attribute for controls that become unavailable *as a result of being pressed* (last Undo, last Like) and removed the "Start over" button after it was pressed, without moving focus. Browsers then drop focus to `<body>`, so keyboard and screen-reader users lose their place (WCAG 2.4.3 Focus Order).
- **Fix:** Controls use `aria-disabled="true"` with a no-op click instead of `disabled`, and `SwipeDeck` moves focus to the deck `<section>` after `reset()` resolves. The H4-F01 spacing fix was kept (the 4.3 guide's `SwipeControls` snippet had reintroduced the space inside the hidden span).
- **Evidence:** D9 and D10 failed before the change and pass after it; client suite `37 passed (37)` on two consecutive runs. Terminal output only.

---

### Architecture Analysis
_Written in WBS 7.2 after implementation._
