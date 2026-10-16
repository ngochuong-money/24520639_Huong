
### 1. AI Prompt Rules

- **Rule:** Never prompt AI with >1 sub-task simultaneously.
- Divide requirements into small, separate tasks.
- Define TypeScript interfaces and data structures before writing code.
- Ask AI to write only one function or module at a time.

### 2. Code Validation

- Check the code using DevTools profiler, tests, and `git diff`.

# Work Breakdown Structure (WBS)

**Exercise 1: Building Mini-React VNode & Mounting Engine**

- [x] Task 1.1: Implement createTextElement
- [x] Task 1.2: Implement createElement
- [x] Task 1.3: Atomic Git Commit: "feat(core): implement createElement factory"
- [x] Task 1.4: Implement renderToDOM
- [x] Task 1.5: Test and fix error
- [x] Task 1.6: Atomic Git Commit: "feat(core): implement renderToDOM"

engine'

### Constraints

**Semantic Constraint:**
Output must produce semantic tags (`<main>`, `<section>`, `<button>`) — div-soup banned.

**Security Checkpoint:**
Verify XSS resistance when passing
`'<script>alert(1)</script>'` string as child.

**DevTools Audit:**
Inspect Elements panel to ensure DOM nodes match VNode tree without orphan nodes.

**Exercise 2: Reactive State Machine & Delegation Hub**

- [x] Task 2.1: Implement stateStore and resetCursor engine and then atomic Git Commit
- [x] Task 2.2: Implement reactive useState dispatcher' and then atomic Git Commit
- [x] Task 2.3: Attach root event delegation listener and then atomic Git Commit
- [x] Task 2.4: Assemble reactive todo application' and then atomic Git Commit

**Exercise 3: Resilient State Machine & Skeleton Loader**

- [x] Task 3.1: Finite State Machine: Component state strictly restricted to: 'IDLE' |
'LOADING' | 'SUCCESS' | 'ERROR'.
- [x] Task 3.2: Skeleton Screen: Render animated pulsing CSS placeholder skeleton
during 'LOADING' state
- [x] Task 3.3: Error Boundary & Retry: Render human-readable error with 'Retry
Connection' button.
- [x] Task 3.4: Git Milestone Commit: 'feat(ui): implement multi-state data component
with skeleton feedback'.
