# Exercise 1 — Project Rules

## 1. Engineering Standards

- Follow the **Generate & Verify** principle: AI-generated code must be independently tested and verified before acceptance.
- Use **Contract-First Development**: define the expected inputs, outputs, and invariants before implementation.
- Apply **Atomic Task Decomposition**: implement and verify one isolated task at a time.
- Do not generate the entire Mini-React engine in a single prompt.
- Use modern JavaScript with ES Modules (`import` / `export`).

## 2. Coding Standards

- Use `const` by default and `let` when reassignment is required.
- Do not use `var` or implicit global variables.
- Use `addEventListener()` instead of inline event handlers.
- Use `keydown` and `event.key` instead of deprecated `keypress` and `keyCode`.
- Keep functions small, readable, and focused on a single responsibility.
- Do not mutate received props or existing VNodes.
- Use meaningful function and variable names.

## 3. Semantic HTML Requirements

- Use semantic HTML elements such as `<main>`, `<header>`, `<section>`, and `<button>`.
- Do not use unnecessary `<div>` wrappers (**Zero Div-Soup**).
- The generated DOM structure must match the VNode hierarchy.
- Do not create orphan DOM nodes.
- Use native `<button>` elements for clickable buttons.

## 4. VNode Contract

Every VNode must follow this structure:

```js
{
  type: string,
  props: {
    children: []
  }
}
```

### createTextElement()

- Accept string or number values.
- Convert the value into a string using `String()`.
- Return a VNode with `type: "TEXT_ELEMENT"`.
- Store the text in `props.nodeValue`.
- Set `props.children` to an empty array.

### createElement()

- Accept `type`, `props`, and `...children`.
- Use an empty object when `props` is `null` or `undefined`.
- Flatten nested children arrays using `.flat(Infinity)`.
- Remove `null`, `undefined`, and boolean children.
- Convert string and number children into `TEXT_ELEMENT` VNodes.
- Preserve existing valid VNode objects.
- Return a newly constructed VNode without mutating the input.

### renderToDOM()

- Validate the VNode structure and type before rendering.
- Use `document.createTextNode()` for `TEXT_ELEMENT`.
- Use `document.createElement()` for supported HTML tags.
- Assign DOM properties and attributes safely.
- Attach event handlers using `addEventListener()`.
- Recursively render child VNodes.
- Return the resulting real DOM node.
- Mount the result using `replaceChildren()`.

## 5. Security Requirements

- Never insert untrusted strings using raw `innerHTML`.
- Use `document.createTextNode()` or `textContent` for text content.
- Do not evaluate strings as JavaScript.
- Reject unsupported event-handler values.
- Treat user-provided attributes and URLs as untrusted input requiring appropriate validation.

### Mandatory XSS Test

Input:

```js
"<script>alert(1)</script>"
```

Expected result:

- The string is displayed as text.
- No JavaScript is executed.
- No executable `<script>` element is created.

Also test:

```js
"<img onerror=alert(1)> Safe Text"
```

The payload must remain text and must not execute.

## 6. Component and State Rules

For later Mini-React extensions:

- Functional components must receive props without mutating them.
- Data flows from parent components to children.
- Hooks must be called at the top level.
- Do not call hooks inside conditions, loops, or nested functions.
- Preserve hook call order across renders.
- State updates must use the previous state when a functional updater is provided.
- Use `Object.is()` to determine whether a state value has changed.

## 7. Event Delegation Rules

For the event delegation extension:

- Use a centralized root event delegation hub.
- Support `click`, `input`, and `keydown` events.
- Use event bubbling to locate appropriate handlers.
- Avoid duplicate root listeners.
- Do not rely on inline event-handler attributes.

## 8. Testing and Verification

Each implementation task must be verified before proceeding.

Required checks:

- VNode structure matches the contract.
- Nested children are correctly flattened.
- Text nodes are correctly normalized.
- Nullish and boolean children are handled.
- DOM nodes match the VNode hierarchy.
- Event listeners work correctly.
- XSS payloads are rendered safely.
- Semantic HTML requirements are satisfied.
- No orphan nodes remain after mounting.
- Browser DevTools shows no unexpected errors.

Use `console.assert()`, browser DevTools, and isolated test cases.

## 9. Git Commit Rules

- Use atomic commits.
- Each commit must represent one completed implementation task.
- Do not combine unrelated changes.
- Review `git diff` before committing.
- Verify the implementation before committing.

Required commits:

**Commit 1**

```bash
git commit -m "feat(core): implement createElement factory"
```

**Commit 2**

```bash
git commit -m "feat(core): implement renderToDOM"
```

Additional features must use separate commits.

## 10. Definition of Done

Exercise 1 checkpoint is complete when:

- [ ] `createTextElement()` works correctly.
- [ ] `createElement()` works correctly.
- [ ] `renderToDOM()` works recursively.
- [ ] Semantic HTML elements are rendered.
- [ ] XSS test cases pass.
- [ ] Event handlers work.
- [ ] `replaceChildren()` mounts the DOM successfully.
- [ ] DevTools inspection confirms the expected DOM hierarchy.
- [ ] The required atomic Git commits are present.

**Final Rule:** Never accept AI-generated code without independent verification.