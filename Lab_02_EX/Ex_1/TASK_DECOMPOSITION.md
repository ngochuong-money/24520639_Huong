# Exercise 1 — Task Decomposition

## 1. Project Objective

Build a Mini-React Virtual DOM (VNode) and Mounting Engine from scratch using modern JavaScript.

### Required Functions

- `createTextElement()`
- `createElement()`
- `renderToDOM()`

### Expected Deliverables

- Semantic DOM structure without div-soup.
- Safe text rendering against XSS.
- Recursive VNode-to-DOM conversion.
- Successful DevTools verification.
- Two atomic Git commits.

## 2. Development Workflow

Follow the four-stage engineering workflow:

1. **Functional Slicing:** Break the implementation into isolated tasks.
2. **Contract-First Specification:** Define inputs, outputs, and invariants.
3. **Atomic Generation:** Implement only one task at a time.
4. **Independent Verification:** Test each task before proceeding.

**Rule:** Never prompt AI to implement multiple unrelated tasks simultaneously.

## 3. Work Breakdown Structure (WBS)

### Phase 1 — VNode Factory

#### Task 1.1 — Define VNode Contract

- [x] Define the VNode structure.
- [x] Specify `type` and `props`.
- [x] Specify `props.children` as an array.
- [x] Define the `TEXT_ELEMENT` representation.
- [x] Document supported and unsupported input types.

**Acceptance Criteria**

- Every valid VNode follows the defined structure.
- Text VNodes contain `nodeValue` and an empty `children` array.
- The contract is documented before implementation.

#### Task 1.2 — Implement createTextElement()

- [x] Create `createTextElement(text)`.
- [x] Convert text to a string.
- [x] Return a `TEXT_ELEMENT` VNode.
- [x] Avoid mutating external objects.
- [x] Test string and number inputs.

**Acceptance Criteria**

- `createTextElement("Hello")` stores `"Hello"`.
- `createTextElement(123)` stores `"123"`.
- `props.children` is an empty array.

#### Task 1.3 — Implement createElement()

- [x] Accept `type`, `props`, and `...children`.
- [x] Handle nullish props safely.
- [x] Flatten nested children arrays.
- [x] Filter nullish and boolean children.
- [x] Convert primitive text into text VNodes.
- [x] Preserve valid existing VNodes.
- [x] Test nested elements.

**Acceptance Criteria**

- Nested children arrays are flattened.
- String and number children become text VNodes.
- Invalid children are handled according to the contract.
- Input props and children are not mutated.

**Required Git Commit 1**

`feat(core): implement createElement factory`

### Phase 2 — DOM Rendering

#### Task 1.4 — Implement Recursive renderToDOM()

- [x] Validate VNode inputs using type guards.
- [x] Create real text nodes with `document.createTextNode()`.
- [x] Create HTML elements with `document.createElement()`.
- [x] Assign supported DOM attributes.
- [x] Handle `className` and `style`.
- [x] Attach event handlers with `addEventListener()`.
- [x] Recursively render child VNodes.
- [x] Return the constructed DOM node.

**Acceptance Criteria**

- Nested VNodes render into the expected DOM hierarchy.
- Text content is rendered safely.
- Invalid VNodes are rejected.
- Button click handlers work.
- No raw `innerHTML` injection is used.

#### Task 1.5 — Implement Root Mounting

- [x] Create a root container with `id="app"`.
- [x] Construct a semantic VNode tree.
- [x] Convert the VNode tree using `renderToDOM()`.
- [x] Mount the result using `replaceChildren()`.
- [x] Verify the resulting DOM hierarchy.

**Acceptance Criteria**

- The application renders inside `#app`.
- Existing root children are replaced.
- No unexpected orphan nodes remain.
- Semantic tags are preserved.

### Phase 3 — Verification and Security

#### Task 1.6 — Run Checkpoint Tests

- [x] Create or configure `test-runner.js`.
- [x] Import `createElement()` and `renderToDOM()`.
- [x] Test nested VNode rendering.
- [x] Test text normalization.
- [x] Test event handlers.
- [x] Test XSS payloads.
- [x] Test root mounting with `console.assert()`.

**Acceptance Criteria**

- All required checkpoint tests pass.
- XSS payloads are displayed as text.
- No unexpected JavaScript execution occurs.
- No unexpected browser console errors occur.

#### Task 1.7 — DevTools Audit

- [x] Open the browser DevTools.
- [x] Inspect the Elements panel.
- [x] Confirm semantic HTML tags.
- [x] Confirm the expected parent-child hierarchy.
- [x] Confirm no unnecessary div wrappers.
- [x] Check the Console for errors.
- [x] Capture verification screenshots if required.

**Acceptance Criteria**

- Real DOM matches the expected VNode tree.
- No unexpected DOM nodes are present.
- Security and functionality checks pass.

**Required Git Commit 2**

`feat(core): implement renderToDOM`

## 4. Additional Architecture Tasks

The following tasks correspond to the subsequent architecture slides. They are not part of the initial mounting checkpoint unless explicitly required.

### Task 2.1 — Functional Components

- [ ] Support component functions.
- [ ] Pass props without mutation.
- [ ] Support `props.children`.
- [ ] Verify parent-to-child data flow.

### Task 2.2 — State Store and Cursor

- [ ] Create a state store.
- [ ] Track hook positions using a cursor.
- [ ] Reset the cursor before each render.
- [ ] Preserve state between render passes.

### Task 2.3 — Implement useState()

- [ ] Return `[state, setState]`.
- [ ] Preserve state using closures.
- [ ] Support functional state updates.
- [ ] Detect changes using `Object.is()`.
- [ ] Trigger rerender when state changes.

### Task 2.4 — Hook Invariants

- [ ] Maintain consistent hook call order.
- [ ] Avoid hooks inside conditions and loops.
- [ ] Verify state values after rerenders.

### Task 2.5 — Event Delegation

- [ ] Attach delegated listeners to the root.
- [ ] Support `click`, `input`, and `keydown`.
- [ ] Traverse the event target ancestry.
- [ ] Dispatch the appropriate handler.
- [ ] Avoid duplicate event listeners.

## 5. Final Verification Checklist

### Core Functionality

- [ ] VNode factory implemented.
- [ ] Text normalization implemented.
- [ ] Recursive DOM renderer implemented.
- [ ] Root mounting implemented.

### Security and Semantics

- [ ] Semantic HTML verified.
- [ ] XSS prevention verified.
- [ ] Type guards verified.
- [ ] No raw `innerHTML` injection.

### Engineering Discipline

- [ ] Tasks implemented atomically.
- [ ] Tests executed independently.
- [ ] Git diff reviewed.
- [ ] Two required commits completed.

## 6. Definition of Done

Exercise 1 mounting checkpoint is complete when all required functions work correctly, the test suite passes, the DOM structure is verified through DevTools, and the required Git commit history is present.
