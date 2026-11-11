
# Project Rules — Lab 3

## 1. Assignment Compliance & Code Quality

- Follow assignment specifications and acceptance criteria; assignment-specific requirements take precedence over general rules.
- Implement required functionality before optional enhancements. Preserve existing working features.
- Write simple, readable, reusable, and maintainable code using modern React 19 and JavaScript practices.
- Avoid over-engineering, duplicated logic, unnecessary abstractions, and unrelated features.
- Do not mark tasks complete without verification.

## 2. React 19 & Component Architecture

- Use React 19 + Vite, `createRoot()`, `<StrictMode>`, and the Automatic JSX Runtime.
- Before feature implementation, initialize the project if absent; otherwise verify the existing setup. Confirm React 19, Vite, createRoot(), StrictMode, and the Automatic JSX Runtime. Run the app, check the Console, and capture screenshots of installed versions and the running app.
- Use pure functional components and React Hooks; no class components.
- Use props destructuring, ES6 default parameters, and `children` composition when appropriate.
- Keep rendering declarative and free of side effects; avoid unnecessary direct DOM manipulation.
- Use `type="button"` for non-submit buttons.
- Separate components, hooks, and utilities when it improves clarity or reusability.

## 3. Semantic HTML, Accessibility & UI/UX

- Target WCAG 2.2 Level AA compliance and Lighthouse Accessibility 100/100.
- Enforce **Zero Div-Soup** using appropriate semantic HTML.
- Use landmarks (`main`, `section`, `article`), logical headings, description lists (`dl`, `dt`, `dd`), and native list elements correctly.
- Use React Fragments instead of unnecessary wrappers; enforce zero `<div>` where explicitly required.
- Ensure every applicable form control has an accessible name; use associated `<label htmlFor>` and `id` for standard form inputs.
- Use `useId()` when appropriate for accessible relationships.
- Prefer native HTML semantics, keyboard accessibility, and visible focus indicators.
- Avoid `dangerouslySetInnerHTML`; rely on JSX escaping for ordinary text.
- Use HTTPS assets, meaningful image alt text, and appropriate image sizing/fallbacks.
- Build responsive layouts for 375px–1440px without unintended horizontal scrolling.
- Verify zero horizontal scrolling at 375px viewport width.
- Validate rendered HTML with the W3C Nu HTML Checker when applicable.
- Make required features visually demonstrable through functional UI controls when meaningful; avoid decorative or unnecessary features.

## 4. State, Hooks & Reconciliation

- Treat state as immutable; use spread, `map()`, `filter()`, or other non-mutating operations.
- Compute derived values from props/state instead of storing redundant state or synchronizing it with `useEffect`.
- Use `useMemo` and `useCallback` only when they provide measurable or meaningful benefits.
- Follow the Rules of Hooks; use `useEffect` for external synchronization and implement cleanup when necessary.
- Clean up timers/listeners and cancel obsolete requests using `AbortController` when appropriate.
- Use explicit state transitions or state machines for workflows requiring controlled states.
- Use stable, unique sibling keys; never use index keys for reorderable or dynamic lists.
- Use `Object.entries()` for key-value rendering and keyed `<Fragment>` for grouped list elements when appropriate.
- Avoid unnecessary re-renders and unstable keys.

## 5. JavaScript & Prohibited Practices

- Use `const`/`let`, never `var`.
- Use React event handlers; use `keydown` and `event.key` for custom keyboard interactions.
- Use `addEventListener()`, event delegation, and DOM APIs only where appropriate outside normal React rendering.
- Validate user input and use controlled forms when appropriate.
- **Prohibited:** `ReactDOM.render()`, new class components, function-component `.defaultProps`, direct state mutation, `keypress`, `keyCode`, inline HTML event attributes, and side effects during rendering.
- Avoid `window.alert()` for routine feedback; use accessible, non-blocking messages.
- Avoid legacy/incompatible library imports and insecure HTTP resources.
- Do not use unnecessary effects, redundant state, or deprecated APIs.
- Prevent XSS by treating external/user-provided data as untrusted; never inject unsanitized HTML into the DOM.

## 6. AI Workflow, WBS & Git

- Follow the **4-stage workflow**:
  1. **Slice:** Decompose requirements into manageable tasks in `TASK_DECOMPOSITION.md`.
  2. **Define Contract:** Specify component Props, State, behavior, and acceptance criteria before implementation.
  3. **Atomic Generation:** Use AI for individual tasks under `project-rules.md`; do not submit entire Exercises/Homeworks as one-shot prompts.
  4. **Verify & Commit:** Test each completed task and create focused Conventional Commits.
- Keep tasks reasonably sized; avoid excessive subtasks and duplicate rules in the WBS.
- Maintain at least **10 meaningful atomic Conventional Commits** across Lab 3.
- Each commit must represent a focused, verified change with a clear commit message.
- Follow assignment-specific commit messages when explicitly required.
- Maintain `AI_FAILURE_AUDIT.md` with at least 3 verified AI-generated failures, DevTools or test evidence, and documented fixes.
- Understand and be able to explain or modify generated code without AI.

## 7. Testing & Acceptance

- Verify functional behavior, state transitions, list keys, forms, and keyboard interactions.
- Audit semantic HTML and Accessibility Tree using browser DevTools.
- Validate rendered HTML using the W3C Nu HTML Checker when applicable.
- Test responsive layouts at 375px–1440px, including horizontal overflow at 375px.
- Run Lighthouse Accessibility and Best Practices audits; target 100/100 for both.
- Perform manual WCAG 2.2 AA checks; automated scores alone do not establish full compliance.
- Use React DevTools Profiler to inspect unnecessary renders when relevant.
- Test asynchronous cleanup, request cancellation, and Slow 3G behavior where applicable.
- Run applicable linting, type checks, tests, and production builds.
- Resolve critical errors and relevant warnings before completion.
- Report completed tasks, verification results, and remaining issues accurately.
- Do not mark a task complete until its acceptance criteria have been verified.

## 8. Assignment Scope & Directory Naming

- Scope includes the 3 Homeworks and the Bonus SituationshipAnalyzer exercise.
- Implement only the task explicitly requested by the user.
- Use these exact case-sensitive Homework directory paths:
  - Homework 1: src/homeworks/DrumMachine/
  - Homework 2: src/homeworks/GrandPiano88/
  - Homework 3: src/homeworks/KraftonPubgVnArena/
- Use SituationshipAnalyzer as the Bonus component name.
- Follow assignment-specific paths and filenames when provided.
- Do not implement the 3 In-Class Exercises unless explicitly requested.
- Follow each assignment's detailed specifications and acceptance criteria.

---

## Core Principle

Build a complete, accessible, efficient, and maintainable React 19 application.

Prioritize assignment compliance, functional correctness, semantic HTML, WCAG 2.2 AA accessibility, code quality, security, and verified behavior.

Use AI through small, controlled tasks—not one-shot generation.

Maintain at least 10 meaningful atomic commits and document at least 3 verified AI failures.
