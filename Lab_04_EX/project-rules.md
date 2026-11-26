# Project Rules — Lab 4

## 1. Assignment Compliance & Code Quality

- Follow assignment specifications and acceptance criteria; assignment-specific requirements take precedence over general rules.
- Implement required functionality before optional enhancements. Preserve existing working features.
- Write simple, readable, reusable, and maintainable code using modern React 19 and JavaScript practices.
- Avoid over-engineering, duplicated logic, unnecessary abstractions, and unrelated features.
- Do not mark tasks complete without verification.

## 2. React 19 & Component Architecture

- Use React 19 + Vite, `createRoot()`, `<StrictMode>`, and the Automatic JSX Runtime.
- Verify the existing setup before feature work: run the app and check the Console.
- Use pure functional components and React Hooks; no class components.
- Use props destructuring, ES6 default parameters, and `children` composition when appropriate.
- Keep rendering declarative and free of side effects; avoid direct DOM manipulation.
- Use `type="button"` for non-submit buttons.
- Separate components, hooks, and utilities when it improves clarity or reusability.

## 3. Routing (React Router v7)

- Import from `react-router`; use `<Routes>` and `<Route element={<Component />}>`.
- Use nested routes with shared layouts rendered via `<Outlet />`; use `index` routes for defaults.
- Use `NavLink` with `className={({ isActive }) => ...}` for active styling.
- Extract dynamic params with `useParams()` and handle invalid IDs with a 404 state (`<NotFoundState />`).
- Lazy-load route-level components with `React.lazy()` wrapped in `<Suspense fallback={<Skeleton />}>`.
- Skeleton fallbacks must match final content dimensions (CLS = 0) and include `aria-busy="true"` and `aria-live="polite"`.
- **Prohibited:** `<Switch>`, `<Redirect>`, `exact`, `activeClassName`.

## 4. Semantic HTML, Accessibility & UI/UX

- Target WCAG 2.2 Level AA compliance and Lighthouse Accessibility 100/100.
- Enforce **Zero Div-Soup** using appropriate semantic HTML.
- Use landmarks (`main`, `section`, `article`, `nav`), logical headings, description lists (`dl`, `dt`, `dd`), and native list elements correctly.
- Use React Fragments instead of unnecessary wrappers.
- Every form control must have an accessible name (`<label htmlFor>` + `id`); use `useId()` for stable bindings.
- Bind validation feedback with `aria-invalid` and `aria-describedby`.
- Prefer native HTML semantics, keyboard accessibility, and visible focus indicators.
- Avoid `dangerouslySetInnerHTML`; rely on JSX escaping.
- Use native CSS Grid and `@media` for responsive layouts (375px–1440px) with no unintended horizontal scrolling.
- Validate rendered HTML with the W3C Nu HTML Checker when applicable.

## 5. State, Hooks & Forms

- Treat state as immutable; use spread, `map()`, `filter()`, or other non-mutating operations.
- Compute derived values (errors, `isValid`) synchronously during render; use `useMemo` when needed. Never sync derived state with `useEffect`.
- **No `useEffect` form-validation waterfalls.** Form validation runs in a single render pass.
- Share form state through Context (`createContext` / `useContext` with a `FormProvider`); keep local state local.
- Follow the Rules of Hooks; every `useEffect` must have a complete dependency array and cleanup when needed.
- Cancel obsolete requests with `AbortController` (`signal` + `return () => controller.abort()`); ignore `AbortError`.
- Use stable, unique sibling keys; never index keys for dynamic lists; use keyed `<Fragment>` inside `<dl>` groups.
- State updates must be deterministic within a single render pass.

## 6. JavaScript & Prohibited Practices

- Use `const`/`let`, never `var`.
- Use React event handlers; `keydown` + `event.key` for custom keyboard interactions.
- **Prohibited:** `ReactDOM.render()`, class components, `Component.defaultProps` (use default parameters), direct state mutation, `keypress`, `keyCode`, inline HTML event attributes, side effects during rendering, `didCancel` boolean flags, `react-media`, `typeface-roboto`, Material-UI v4 (`@material-ui/core`).
- Avoid `window.alert()`; use accessible, non-blocking messages.
- Treat external/user data as untrusted; never inject unsanitized HTML.
- Zero unhandled promise rejections: every `fetch` has `.catch`, every async handler has `try/catch`.

## 7. Backend (Express + MongoDB)

- Design the API contract first (routes, payload schema, status codes) and commit it before handler code.
- Use Mongoose 8 with async/await and `.exec()`; no callback style.
- Read config from `process.env` (e.g. `MONGODB_URI`); never hardcode connection strings.
- Secrets live in `server/.env` (git-ignored); commit only `server/.env.example`.
- Enable CORS with `cors()`.
- Validate every POST payload on the server; rules must match the client (validation parity).
- Return consistent error responses; never leak stack traces.

## 8. AI Workflow, WBS & Git

- Follow the **Strict 4-Stage Contract-First Loop** for every task:
  1. **[Contract]** Define the API and interface spec (Props, State, routes, request/response, errors) before code.
  2. **[Fail Test]** Write a failing automated test.
  3. **[Implement]** Write minimal code to satisfy the test.
  4. **[Refactor]** Clean code while keeping tests green.
- Decompose work in `TASK_DECOMPOSITION.md`; do not give AI entire sprints as one-shot prompts.
- Atomic commits: one focused, verified scope per commit, Conventional Commits (`init`, `docs`, `feat`, `test`, `fix`).
- Required commits:
  - Sprint 1: `feat: router layout`, `feat: detail route handling`
  - Sprint 2: `feat: form context`, `feat: input field validation`, `feat: inspector output`
  - Sprint 3: split by scope (API, hook, tests)
- Verify history with `git log --graph --oneline --decorate` before submitting.
- Maintain `AI_FAILURE_AUDIT.md`: AI code failures, hallucinated APIs/loops, and the manual engineering verification used to fix each (with DevTools/test evidence).
- Understand and be able to explain or modify all generated code without AI (3-minute live defense, injected bug fix).

## 9. Testing & Acceptance

- Verify routing (valid ID, invalid ID, nested layout), form validation, state transitions, keys, and keyboard interaction.
- Chrome DevTools checkpoints: no console warnings, clean URL param parsing.
- Test under Slow 3G: rapidly switch channels and confirm in-flight requests are cancelled via `AbortController`.
- Audit semantic HTML and Accessibility Tree; run Lighthouse Accessibility/Best Practices (target 100/100) plus manual WCAG 2.2 AA checks.
- Run applicable lint, tests, and production build; resolve critical errors and relevant warnings.
- Report completed tasks, verification results, and remaining issues accurately.

## 10. Assignment Scope

- Scope: Exercises 1.1, 1.2, 1.2.1, 1.2.2, 1.7.1, and Sprints 1–3.
- Components: `PeopleLayout.jsx`, `PersonDetail.jsx`, `FormContext`, `SimpleForm.jsx`, `InputField.jsx`, `<ShowData />`, `useForumMessages.js`.
- Channels: `nasa`, `esports-tribunal`, `notNasa`.
- Implement only the task explicitly requested; follow assignment-specific paths and filenames when provided.

---

## Core Principle

Build a complete, accessible, efficient, and maintainable full-stack React 19 application.

Prioritize assignment compliance, functional correctness, contract-first design, validation parity, semantic HTML, WCAG 2.2 AA accessibility, security, and verified behavior.

Use AI through small, controlled tasks, never one-shot generation.