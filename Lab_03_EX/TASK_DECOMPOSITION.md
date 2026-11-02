# TASK_DECOMPOSITION.md Rules — React 19 / Lab 3

## 1. AI Prompt Rules

- Focus on one complete, testable task at a time.
- Divide requirements into cohesive functional tasks, not individual coding steps.
- Group related logic, state, UI, interactions, and modules when needed to deliver a complete feature.
- Define Props, State, data structures, and TypeScript interfaces (if applicable) before implementing dependent functionality.
- Avoid incomplete implementations, unnecessary rewriting, and one-shot generation of entire Exercises or Homeworks.

## 2. Code Validation

- Validate completed functional units using appropriate tests, DevTools, and `git diff`.
- Test related functionality together to verify integration.
- Fix identified issues before marking tasks as completed.
- Avoid redundant testing, but never skip required acceptance criteria or Lab checkpoints.
- Use React DevTools Profiler when performance verification is relevant.

## 3. WBS Structure

- Organize tasks by Exercise or major feature.
- Use numbered, single-line Markdown checklist items (`- [ ] Task 1.1: ...`).
- Keep task names short, clear, and action-oriented.
- Divide work into complete, reasonably sized functional units; combine related implementation steps without grouping unrelated features.
- Include testing/fixing tasks at meaningful milestones and atomic Git commit tasks after completed units, using Conventional Commit messages.
- Keep shared technical constraints and acceptance criteria in a dedicated **Constraints** section instead of repeating them across tasks.
- Cover all assignment requirements without excessive subtasks, duplicate criteria, or unnecessary decomposition.
- Follow the provided WBS example's structure without repeating Project Rules or these rules.

## 4. Task Execution Rules

- Execute only the task explicitly requested by the user, following WBS order and dependencies.
- Complete the current task's required logic, UI, interactions, integration, and acceptance criteria.
- Fix directly related issues necessary for the current task without implementing future tasks or unrelated features.
- Reuse existing correct implementations; avoid unnecessary rewriting or simulated functionality.
- Validate and fix the current task before marking it `[x]`; never mark unverified work as complete.
- Perform Git commits only when the corresponding commit task is explicitly requested and its prerequisites are verified.
- Do not automatically proceed to the next task; stop and wait for instructions.
- For each verified AI-generated failure, document the original prompt, faulty code, root cause, DevTools or test evidence, engineering fix, and post-fix verification in `AI_FAILURE_AUDIT.md`.
- Record only genuine AI-generated failures; do not fabricate bugs or evidence to meet the minimum requirement.
# WBS
# Exercise 1: Semantic Engineer & Pro-Gamer Profile Card

- [x] Task 1.1: Define component contracts and implement semantic DeveloperCard, reusable SkillBadge, and avatar fallback initials [Required]
- [x] Task 1.2: Verify component rendering, semantic HTML, accessibility, avatar fallback, and stable keys; fix issues [Required]
- [x] Task 1.3: Atomic Git Commit: `feat(ex1): implement semantic DeveloperCard and SkillBadge`
- [x] Task 1.4: Implement scoped CSS Modules, custom properties, and responsive layout [Required]
- [x] Task 1.5: Verify CSS isolation, responsive layouts (375px–1440px), avatar layout stability, and final checkpoint; fix issues [Required]
- [x] Task 1.6: Atomic Git Commit: `style(ex1): add responsive 375px CSS module`

### Constraints

**Component & Semantic Requirements**
- Use React 19 functional components with props destructuring and ES6 default parameters.
- Combine the Elon Musk Card (Ex 4.4) and User Profile (Ex 4.5), preserving applicable legacy functionality.
- Implement reusable `SkillBadge` with stable `key={s.id}`.
- Enforce zero `<div>` tags inside `DeveloperCard.jsx`.
- Use `<article>`, `<header>`, `<hgroup>`, `<dl>`, `<dt>`, `<dd>`, `<ul>`, `<li>`, and keyed `<Fragment>` appropriately.
- Use `useId()` to associate `<article aria-labelledby>` with its heading.
- Render profile metrics using `Object.entries()` and skills in an accessible list.

**Styling & Media**
- Use `DeveloperCard.module.css` and CSS custom properties instead of legacy inline styles.
- Ensure responsive layouts from 375px to 1440px without unintended horizontal scrolling.
- Use HTTPS avatar resources, explicit image dimensions, and fallback initials.
- Prevent avatar-related Cumulative Layout Shift (CLS).

**Verification & Git**
- Verify Accessibility Tree: `article → header + dl + list`.
- Verify zero `<div>` and insecure HTTP matches in `DeveloperCard.jsx`.
- Test responsive layouts across 375px–1440px, avatar fallback, and layout stability.
- Run applicable build/lint checks and inspect `git diff` before committing.
- Create exactly 2 Exercise 1 atomic commits with the specified messages:
  - `feat(ex1): implement semantic DeveloperCard and SkillBadge`
  - `style(ex1): add responsive 375px CSS module`

**Final Acceptance Criteria**
- Semantic DeveloperCard and reusable SkillBadge render correctly.
- Zero `<div>` elements inside `DeveloperCard.jsx`.
- Accessible profile metadata and skills with stable keys and `useId()`-linked heading.
- Scoped CSS Modules, working avatar fallback, and stable image layout.
- No unintended horizontal scrolling from 375px to 1440px.
- Both required atomic commits are verified.
- No unresolved critical errors or relevant accessibility issues.


# Exercise 2: Interactive Scientist & Pioneer Directory

- [x] Task 2.1: Inspect and normalize SMART_PEOPLE data; define contracts and implement basic semantic ScientistDirectory with stable keys [Required]
- [x] Task 2.2: Verify data schema, stable IDs, semantic rendering, and React DevTools element selection; record inspection video and fix issues [Required]
- [x] Task 2.3: Atomic Git Commit: `feat(ex2): normalize smartPeople schema with stable IDs`

- [x] Task 2.4: Add controlled name search, Min-IQ filtering, and IQ/Age sorting to ScientistDirectory [Required]
- [x] Task 2.5: Verify search, Min-IQ filtering, sorting, and derived state; record personal-name search demo using React DevTools and fix issues [Required]
- [x] Task 2.6: Atomic Git Commit: `feat(ex2): add search, IQ filter & toSorted`

- [x] Task 2.7: Implement immutable delete/reset, live result status, and accessible directory interactions [Required]
- [x] Task 2.8: Verify delete/reset, focus behavior, accessibility, responsive layout, and React Profiler; fix issues and complete final checkpoint [Required]
- [x] Task 2.9: Atomic Git Commit: `feat(ex2): add delete/reset & live status`

### Constraints

**Data & Component Requirements**
- Inspect and reuse existing `smartPeople` data; maintain one canonical `SMART_PEOPLE` dataset.
- Keep exactly six scientist records with valid `{ id, name, age, iq }` fields and stable unique IDs:
  - Marie Curie
  - Alan Turing
  - Ada Lovelace
  - Nikola Tesla
  - Katherine Johnson
  - Srinivasa Ramanujan
- Treat IQ values as demo-only data, not verified historical facts.
- Implement `ScientistDirectory` in Task 2.1 using React 19 functional components, semantic `<section>`, `<ul>`, `<li>`, and stable `key={person.id}`.
- Render all six scientist names and their data without interactive controls in Task 2.1.
- Preserve applicable legacy functionality without rebuilding unrelated exercises.

**Search, Filter & Sort**
- In Task 2.4, implement controlled case-insensitive substring name search.
- Implement Min-IQ filtering using `valueAsNumber`, normalizing empty or `NaN` input to `0`.
- Support IQ-descending and Age-ascending sorting using ES2023 `toSorted()`.
- Keep only independent values (`people`, `query`, `minIq`, `sortBy`) in state when required.
- Compute `visiblePeople` during render without redundant state or filtering/sorting `useEffect()`.
- Preserve immutable data and stable list identity.
- If needed, use a separate temporary demo record for personal-name search verification without modifying or duplicating the six canonical scientist records.

**Delete, Reset & Accessibility**
- In Task 2.7, implement immutable deletion using `setPeople(prev => prev.filter(...))`.
- Reset restores the original scientist dataset, including deleted records, while retaining active search/filter/sort controls.
- Use semantic `<section>`, `<form role="search">`, `<label>`, `<input>`, `<output>`, and `<ul>/<li>` where appropriate.
- Associate form controls with accessible labels using `htmlFor`, `id`, and `useId()`.
- Use accessible Delete and Reset buttons with `type="button"`.
- Display the filtered result count using `<output role="status" aria-live="polite">`.
- Maintain keyboard accessibility and visible focus indicators.
- After deletion, ensure keyboard focus remains on a valid, predictable element rather than the removed item.

**React DevTools & Video Evidence**
- Task 2.2: Use React DevTools' element-selection tool to click scientist names directly on the rendered page, inspect the owning `ScientistDirectory` component and available Props/Hooks, and verify the rendered data against `SMART_PEOPLE`.
- Task 2.5: Record a video searching the user's name through the application's Search feature, verify filtered results, and inspect search state and rendering behavior using React DevTools.
- Task 2.8: Inspect unnecessary render cascades using React DevTools Profiler, accounting for development StrictMode behavior.
- Do not add artificial state or unnecessary components solely for video demonstrations.

**Verification & Git**
- Verify data integrity, stable keys, semantic HTML, and rendered scientist names before Commit 1.
- Test case-insensitive search, Min-IQ boundaries, empty/invalid numeric inputs, sorting, and derived state before Commit 2.
- Test delete/reset, reconciliation, keyboard focus, live announcements, accessibility, and responsive layouts from 375px–1440px before Commit 3.
- Run applicable linting, production build, Lighthouse Accessibility/Best Practices, and HTML validation checks.
- Inspect `git diff` and resolve relevant issues before committing.
- Create exactly 3 mandatory Exercise 2 atomic commits:
  - `feat(ex2): normalize smartPeople schema with stable IDs`
  - `feat(ex2): add search, IQ filter & toSorted`
  - `feat(ex2): add delete/reset & live status`

**Final Acceptance Criteria**
- One canonical dataset contains exactly six valid scientists with stable unique IDs and demo-only IQ values.
- `ScientistDirectory` renders all six names and corresponding data using semantic HTML and stable keys.
- React DevTools inspection video demonstrates selecting scientist names directly on the page, identifying the owning React component, and verifying rendered data.
- Search, Min-IQ filtering, and IQ/Age sorting work correctly without redundant derived state or effects.
- Personal-name search video demonstrates filtered results, relevant state changes, and React DevTools rendering inspection without altering the canonical dataset.
- Delete is immutable; Reset restores the original scientist dataset without unintentionally changing active filters or sorting.
- Stable keys preserve list identity, and keyboard focus remains usable after deletion.
- Accessible labels, controls, and live result announcements function correctly.
- React Profiler shows no unnecessary derived-state render cascade, accounting for StrictMode.
- Responsive layout works from 375px–1440px without unintended horizontal scrolling.
- All required verification checks pass before their corresponding commits.
- All 3 mandatory atomic commits are verified.
- No unresolved critical runtime, build, or relevant accessibility errors remain.

# Exercise 3: KRAFTON PUBG Vietnam Series (PVS) Live Telemetry

- [x] Task 3.1: Define PUBG VN squad telemetry data and component contracts [Required]
- [x] Task 3.2: Implement the canonical PUBG VN squad dataset and initial integration [Required]
- [x] Task 3.3: Verify squad records, unique IDs, data schema, and integration; fix issues [Required]
- [x] Task 3.4: Atomic Git Commit: `feat(ex3): add PUBG VN squad telemetry dataset`

- [x] Task 3.5: Implement PubgMatchTelemetry with the four-state machine, asynchronous telemetry requests, 35% packet loss, and AbortController cleanup [Required]
- [x] Task 3.6: Verify state transitions, squad switching, stale-request cancellation, AbortError handling, and retryTick trigger logic; fix issues [Required]
- [x] Task 3.7: Atomic Git Commit: `feat(ex3): implement PUBG VN 4-state telemetry & AbortController`

- [x] Task 3.8: Implement the 220px Blue-Zone skeleton, accessible telemetry radar, error alert, retry button, and responsive styling [Required]
- [x] Task 3.9: Verify loading, success, error, Retry button interaction and recovery, keyboard interactions, and responsive UI; fix issues [Required]
- [x] Task 3.10: Atomic Git Commit: `feat(ex3): add skeleton UI & retry alert`

- [x] Task 3.11: Run final Slow 3G, rapid-switching, accessibility, performance, and production validation; fix remaining issues [Required]
- [x] Task 3.12: Record actual Exercise 3 test evidence, verification results, and genuine AI failures in appropriate project documentation [Required]
- [x] Task 3.13: Atomic Git Commit: `test(ex3): verify telemetry recovery and accessibility`

- [x] Task 3.14: Verify and finalize Exercise 3 WBS, actual project-rule changes, documentation completeness, and preceding commit history [Required]
- [x] Task 3.15: Atomic Git Commit: `docs(ex3): add telemetry WBS and project rules`

## Constraints

**Scope & Integration**
- Work only within Exercise 3 and its directly related documentation.
- Preserve all completed Exercise 1 and Exercise 2 tasks, code, and commit history.
- Reuse the existing React 19 + Vite project setup and established conventions.
- Do not implement unrelated features or create unnecessary abstractions.
- Keep the existing `project-rules.md` unchanged unless a genuinely missing Exercise 3-specific requirement must be added.

**Data Contract**
- Use one canonical `PUBG_VN_SQUADS` dataset with exactly three squads:
  - `ces`: Cerberus Esports — Erangel, Phase 6, 4 alive, 14 kills, 68% WWCD probability, In Safe Zone.
  - `te`: The Expendables — Miramar, Phase 7, 4 alive, 18 kills, 82% WWCD probability, Holding High Ground.
  - `ge`: Genius Esports — Taego, Phase 5, 3 alive, 9 kills, 41% WWCD probability, Rotating Blue Zone.
- Preserve the fields `id`, `name`, `map`, `phase`, `alive`, `kills`, `wwcdProb`, and `status`.
- Use stable unique squad IDs. Keep the demo telemetry values consistent with the provided specification.

**Component & State Contract**
- Implement `PubgMatchTelemetry` with a `squadId` prop and default value `'te'`.
- Use the four explicit states: `IDLE`, `LOADING`, `SUCCESS`, and `ERROR`.
- Maintain telemetry state with `{ status, data, error }` and a separate `retryTick` trigger.
- Implement asynchronous telemetry fetching with a simulated 35% packet-loss rate.
- Use `AbortController` to cancel obsolete requests when `squadId` changes, Retry is triggered, or the effect is cleaned up.
- Ignore `AbortError` without displaying a false error alert.
- Prevent stale responses from overwriting telemetry for the currently selected squad.
- Use `useEffect` only for asynchronous synchronization and cleanup; do not store redundant derived state.
- Task 3.6 verifies that changing `retryTick` correctly triggers the request lifecycle; UI button interaction and end-to-end retry recovery are verified in Task 3.9.

**UI & Accessibility**
- Provide an accessible squad selector for CES, TE, and GE.
- Display a 220px pulsing Blue-Zone skeleton during `LOADING`.
- Display selected squad telemetry during `SUCCESS`.
- Display packet timeout errors in a semantic `<section role="alert">` during `ERROR`.
- Provide a functional `Reconnect Satellite (Retry)` button that triggers a fresh request.
- Do not use `window.alert()` for telemetry errors.
- Use semantic HTML, accessible names, keyboard-operable controls, and visible focus indicators.
- Support viewport widths from 375px to 1440px without unintended horizontal scrolling.
- Avoid unnecessary animation and respect reduced-motion preferences.

**Git & Verification**
- Create at least five meaningful atomic Conventional Commits for Exercise 3.
- Preserve the two exact assignment-required commit messages:
  - `feat(ex3): implement PUBG VN 4-state telemetry & AbortController`
  - `feat(ex3): add skeleton UI & retry alert`
- Commit dataset, telemetry logic, UI, and final verification evidence before the documentation commit.
- Task 3.12 must save actual testing evidence and results in an appropriate tracked file, such as `EX3_VERIFICATION.md`. Include test scenarios, observed results, relevant DevTools evidence references, and remaining issues.
- Update `AI_FAILURE_AUDIT.md` only for genuine, verified AI-generated failures, with supporting evidence and fixes. Do not invent failures to satisfy the minimum requirement.
- Task 3.13 requires real, verified, non-empty staged changes relevant to Exercise 3 testing. Do not create an empty commit or fabricate results.
- The documentation commit `docs(ex3): add telemetry WBS and project rules` must be the final Exercise 3 commit, executed only after all functional implementation, testing, and preceding commits are complete.
- Task 3.14 must inspect the actual contents and Git diff of `TASK_DECOMPOSITION.md` and `project-rules.md` before Task 3.15.
- Include `project-rules.md` in the final commit only if it contains necessary, verified changes; do not modify it solely to match the commit message.
- Task 3.15 must contain genuine documentation changes, including the finalized Exercise 3 WBS. Do not create an empty commit.
- Do not commit unrelated files or alter completed Exercise 1–2 content.
- Commit only when the corresponding task is explicitly requested and its prerequisites have been verified.

## Final Acceptance Criteria

**Functional Behavior**
- The application loads the three specified PUBG VN squads with correct telemetry data.
- Selecting CES, TE, or GE triggers the appropriate telemetry request.
- The component correctly manages `IDLE`, `LOADING`, `SUCCESS`, and `ERROR`.
- The 35% packet-loss simulation can produce a recoverable timeout error.
- `Reconnect Satellite (Retry)` initiates a new request without requiring a page reload.
- Successful responses display the correct squad name and telemetry information.
- The 220px Blue-Zone skeleton appears during loading.

**Fault Tolerance**
- Rapid squad switching cancels obsolete requests.
- Aborted requests do not display false error alerts.
- Stale responses never overwrite the currently selected squad.
- Effect cleanup prevents obsolete asynchronous updates.
- The `retryTick` trigger correctly re-runs the telemetry request lifecycle.
- The Retry button works after a timeout and does not require changing squads.

**DevTools Checkpoint**
- Enable Network Slow 3G and verify the loading skeleton.
- Rapidly switch CES → TE → GE.
- Verify canceled requests and the final selected squad's correct telemetry.
- Inspect React DevTools state transitions and Profiler results.
- Capture evidence of packet-loss error handling and successful retry recovery.

**Accessibility & Quality**
- Validate semantic HTML and Accessibility Tree.
- Confirm keyboard access, visible focus, and screen-reader-compatible status/error messages.
- Verify responsive layouts at 375px, 768px, 1024px, and 1440px.
- Confirm no unintended horizontal overflow at 375px.
- Run Lighthouse Accessibility and Best Practices audits, targeting 100/100.
- Run applicable lint, tests, and production build successfully.
- Resolve critical runtime errors and relevant warnings.

**Documentation & Git**
- Preserve all existing Exercise 1 and Exercise 2 WBS content and completed-task statuses.
- Complete the Exercise 3 WBS without marking tasks done prematurely.
- Record actual Exercise 3 verification results and evidence in an appropriate tracked file before Task 3.13.
- Ensure the `test(ex3)` commit contains meaningful, non-empty testing-related changes supported by real verification.
- Maintain `AI_FAILURE_AUDIT.md` with genuine, evidenced failures only.
- Verify at least five focused Exercise 3 commits, including both mandatory slide commits.
- Verify all functional implementation, testing, and preceding code/test commits before Task 3.14.
- Inspect the actual contents of `TASK_DECOMPOSITION.md` and `project-rules.md` during Task 3.14.
- Confirm the Exercise 3 WBS is complete, correctly numbered, and consistent with the implemented functionality and verified results.
- Modify `project-rules.md` only when a necessary requirement is missing; otherwise preserve its existing contents.
- Review the final documentation Git diff to ensure no unrelated changes or modifications to Exercise 1–2.
- Confirm Task 3.15 creates a meaningful documentation commit with the exact message `docs(ex3): add telemetry WBS and project rules`.
- Confirm the documentation commit is the last Exercise 3 commit, after all code and testing commits.
- Verify the final commit history and working-tree status before closing Exercise 3.