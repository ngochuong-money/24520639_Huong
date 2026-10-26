### TASK_DECOMPOSITION.md
### 1. AI Prompt Rules

- **Rule:** Focus on one complete, testable task at a time.
- Divide requirements into cohesive functional tasks rather than individual coding steps.
- Group closely related functions, modules, and UI interactions within the same task when necessary.
- Define TypeScript interfaces and data structures before implementing dependent functionality.
- Allow AI to implement multiple related functions or modules within one task to deliver a complete feature.
- Avoid partial implementations that require unnecessary rewriting in later tasks.

### 2. Code Validation

- Validate each completed functional unit using appropriate tests, DevTools, and `git diff`.
- Test related functionality together to ensure correct integration.
- Fix identified issues before marking a task as completed.
- Avoid redundant testing and unnecessary code changes when existing functionality already works correctly.
- Use DevTools Profiler when performance analysis is relevant.

### 3. WBS Structure

- Organize tasks by exercise or major feature.
- Use numbered tasks (e.g., Task 1.1, Task 1.2, Task 1.3).
- Format every task as a single-line Markdown checklist item (`- [ ]`).
- Keep task names short, clear, and action-oriented.
- Divide tasks by complete, testable functional units rather than individual implementation steps.
- Combine closely related implementation steps, including state, logic, UI, and interactions, into one task when appropriate.
- Keep tasks reasonably sized without combining unrelated features.
- Include testing and fixing tasks only at meaningful milestones.
- Include atomic Git commit tasks after meaningful, completed units of work, using descriptive Conventional Commit messages.
- Avoid unnecessary subtasks, excessive task decomposition, and duplicate acceptance criteria.
- Keep detailed technical constraints and validation requirements in a shared "Constraints" section instead of repeating them under individual tasks.
- Ensure all assignment requirements are covered without unnecessary repetition.
- Keep the WBS concise and similar in structure to the provided example.
- Do not include or repeat Project Rules or TASK_DECOMPOSITION.md Rules in the WBS.

### 4. Task Execution Rules

- Execute only the task explicitly requested by the user.
- Follow the task order and dependencies defined in the WBS.
- Do not implement future tasks or unrelated features.
- Complete all requirements and constraints associated with the current task.
- Implement each feature as a complete, functional unit, including necessary logic, UI, user interactions, and integration.
- Reuse existing correct implementations instead of unnecessarily rewriting them.
- Avoid temporary or simulated functionality when real functionality is required.
- Test and fix the completed task before marking it as finished.
- Mark a task as completed (`[x]`) only after its acceptance criteria are satisfied.
- Do not mark unimplemented or unverified tasks as completed.
- Perform Git commits only when the corresponding commit task is explicitly requested.
- Do not automatically proceed to the next task. Stop and wait for further instructions.
# Work Breakdown Structure (WBS)
# Homework 1
## Exercise 1: Project Setup & TypeScript Contracts

- [x] Task 1.1: Initialize Vite and TypeScript project
- [x] Task 1.2: Define ColumnDef<T> and DataGridProps<T> interfaces
- [x] Task 1.3: Atomic Git Commit: "feat(core): initialize project and data-grid contracts"

### Constraints

**TypeScript Contract:**
- `ColumnDef<T>` must include `header: string`, `accessorKey: keyof T`, and `sortable?: boolean`.
- `DataGridProps<T>` must include `data: T[]`, `columns: ColumnDef<T>[]`, `onRowSelect?: (item: T) => void`, and `ariaLabel: string`.
- Use type-safe generics without unnecessary `any` types.
- Define contracts before implementing Data-Grid functionality.

**Project Setup:**
- Use Vite with TypeScript and modern build tooling.
- Follow the defined Project Rules throughout development.

## Exercise 2: Semantic Data-Grid Structure

- [x] Task 2.1: Implement accessible DataGrid table component
- [x] Task 2.2: Implement dynamic rows and columns rendering
- [x] Task 2.3: Test and fix semantic structure
- [x] Task 2.4: Atomic Git Commit: "feat(grid): implement semantic data-grid structure"

### Constraints

**Semantic HTML:**
- Use native `<table>`, `<thead>`, `<tbody>`, `<th scope="col">`, and `<button>` elements.
- Implement full ARIA grid semantics using `role="grid"`, `role="row"`, and `role="gridcell"` where appropriate.
- Preserve correct native table accessibility semantics.
- Provide an accessible grid name using `ariaLabel`.
- Render rows and columns dynamically from component props.
- Use stable row and cell identifiers.
- Avoid unnecessary wrapper elements and ARIA attributes.

**Validation:**
- Verify DOM structure and accessibility tree using DevTools.
- Ensure assistive technologies can identify headers, rows, and cells.

## Exercise 3: Sorting, Filtering & Pagination

- [x] Task 3.1: Implement column sorting
- [x] Task 3.2: Implement data filtering
- [x] Task 3.3: Implement pagination controls
- [x] Task 3.4: Test and fix data operations
- [x] Task 3.5: Atomic Git Commit: "feat(grid): implement sorting filtering and pagination"

### Constraints

**Functional Requirements:**
- Sorting must support ascending and descending order on sortable columns.
- Non-sortable columns must not trigger sorting.
- Filtering must update displayed data based on user input.
- Pagination must provide functional navigation between pages.
- Apply operations consistently: filtering, sorting, then pagination.
- Reset or adjust the current page when filtered results change.
- Handle empty datasets, no matching results, and incomplete final pages.
- Preserve the original input data without mutation.

**Accessibility:**
- Use `aria-sort` on the actively sorted column header.
- Provide accessible labels for filtering and pagination controls.
- Keep all interactive controls keyboard-operable.
- Provide meaningful disabled states for unavailable pagination actions.

## Exercise 4: Keyboard Navigation & Row Selection

- [x] Task 4.1: Implement arrow-key grid navigation
- [x] Task 4.2: Implement Enter selection and Space toggle
- [x] Task 4.3: Implement focus management and selection feedback
- [x] Task 4.4: Test and fix keyboard interactions
- [x] Task 4.5: Atomic Git Commit: "feat(a11y): implement keyboard navigation and selection"

### Constraints

**Keyboard Contract:**
- ArrowUp: Move focus to the previous row.
- ArrowDown: Move focus to the next row.
- ArrowLeft: Move focus to the previous cell.
- ArrowRight: Move focus to the next cell.
- Enter: Select the focused row and invoke `onRowSelect`.
- Space: Toggle the selection state of the focused row.
- Prevent unintended page scrolling during handled grid navigation.
- Keep focus within valid grid boundaries.
- Maintain predictable focus after sorting, filtering, and pagination.

**Focus Management:**
- Use a consistent roving `tabIndex` strategy.
- Ensure only one grid navigation target is in the sequential Tab order at a time.
- Provide clearly visible keyboard focus indicators.
- Do not interfere with native keyboard interactions inside input fields or buttons.
- Expose selection states using appropriate ARIA attributes.
- Keep visual selection and accessibility states synchronized.

**Validation:**
- Test keyboard-only navigation without a mouse.
- Verify focus order, selection behavior, and accessible state announcements.

## Exercise 5: Responsive UI & WCAG 2.2 AA

- [x] Task 5.1: Implement responsive Data-Grid layout
- [x] Task 5.2: Implement accessible visual states and controls
- [x] Task 5.3: Audit and fix WCAG 2.2 AA issues
- [x] Task 5.4: Atomic Git Commit: "style(a11y): implement responsive accessible grid interface"

### Constraints

**Visual & Responsive Requirements:**
- Create a polished, modern, and professional enterprise-style interface.
- Support desktop, tablet, and mobile screen sizes.
- Preserve table readability and functionality on narrow screens.
- Support browser zoom and text resizing without loss of essential functionality.
- Provide clear hover, focus, active, selected, and disabled states.

**WCAG 2.2 AA:**
- Meet WCAG 2.2 Level AA applicable success criteria.
- Maintain a minimum 4.5:1 contrast ratio for normal text.
- Maintain at least 3:1 contrast for applicable non-text UI indicators.
- Ensure visible focus indicators and accessible keyboard interactions.
- Avoid keyboard traps.
- Provide meaningful labels, roles, and states for assistive technologies.
- Support screen-reader navigation and announcements.
- Use native semantic HTML before adding ARIA.

**Validation:**
- Inspect color contrast, focus visibility, responsive behavior, and accessibility tree.
- Test at different viewport sizes and zoom levels.

## Exercise 6: Integration, Testing & Lighthouse Audit

- [x] Task 6.1: Integrate DataGrid into an interactive application
- [x] Task 6.2: Test and fix sorting, filtering, pagination, and selection
- [x] Task 6.3: Test and fix keyboard and screen-reader accessibility
- [x] Task 6.4: Run Lighthouse and resolve audit failures
- [x] Task 6.5: Verify final build and Git changes
- [x] Task 6.6: Atomic Git Commit: "test(grid): validate data-grid functionality and accessibility"

### Constraints

**Integration Requirements:**
- Provide interactive data and controls for testing all required features.
- Ensure users can operate sorting, filtering, pagination, and row selection themselves.
- Verify that all features work correctly together, not only independently.
- Do not use hardcoded behavior to simulate functionality.

**Functional Testing:**
- Test normal data, empty data, and filtered results with zero matches.
- Test sorting changes, page boundaries, and selection synchronization.
- Test callbacks and state updates.
- Verify that user interactions do not cause unexpected errors.

**Accessibility Testing:**
- Test keyboard-only operation with Tab, Shift+Tab, arrow keys, Enter, and Space.
- Test screen-reader navigation using NVDA or an equivalent tool.
- Inspect ARIA roles, names, states, and accessible focus order.
- Check applicable WCAG 2.2 AA requirements.
- Fix identified accessibility violations.

**Lighthouse Audit:**
- Target a verified Lighthouse score of 100/100 for Accessibility.
- Target a verified Lighthouse score of 100/100 for Best Practices.
- Run audits against the completed application.
- Record final scores and address reported failures.
- Note that automated Lighthouse scores do not independently prove full WCAG 2.2 AA compliance.

**Final Verification:**
- Run TypeScript checks and production build.
- Inspect browser DevTools for runtime errors.
- Use DevTools Profiler where applicable.
- Review `git diff` before the final commit.
- Ensure all implemented features satisfy their acceptance criteria.

---

## Clarifications Required

The following details are not explicitly defined in the provided assignment image:

1. **Technology Stack:** The image defines TypeScript interfaces but does not specify React or another framework. This WBS assumes Vite + TypeScript without requiring a specific UI framework.

2. **Filtering Behavior:** The image requires filtering but does not specify global search, per-column filtering, or both. The WBS assumes basic text filtering across displayed columns.

3. **Pagination Behavior:** The image requires pagination but does not specify page size or navigation design. The WBS assumes client-side pagination with Previous/Next controls.

4. **Row Selection:** The image specifies Enter selection, Space toggling, and an `onRowSelect` callback but does not define single-selection versus multi-selection. The WBS assumes single-row selection with the ability to toggle the current selection.

5. **Grid Navigation Boundaries:** The image specifies arrow-key navigation but does not define whether focus should wrap between rows or columns. The WBS assumes navigation stops at grid boundaries.

6. **Lighthouse Scope:** The image requires verified 100/100 scores for Accessibility and Best Practices, but does not explicitly require 100/100 in Performance or SEO.

# Homework 2
## Exercise 1: Web Audio Engine & Frequency Analysis

- [x] Task 1.1: Initialize Vite and TypeScript project
- [x] Task 1.2: Define AudioTask and audio engine TypeScript contracts
- [x] Task 1.3: Implement Web Audio API initialization, track downloading, and AudioBuffer decoding
- [x] Task 1.4: Implement AnalyserNode with 256/512 FFT configuration and frequency data extraction
- [x] Task 1.5: Test and fix audio initialization, decoding, and frequency analysis
- [x] Task 1.6: Atomic Git Commit: "feat(audio): implement Web Audio engine and frequency analysis"

### Constraints

**Web Audio API:**
- Use browser-native AudioContext, AudioBuffer, and AnalyserNode.
- Support `AnalyserNode.fftSize` values of 256 and 512.
- Use `frequencyBinCount` to determine the frequency data array size.
- Read actual frequency data from AnalyserNode.
- Handle audio download and decoding failures.

## Exercise 2: Concurrent FIFO Queue Controller

- [x] Task 2.1: Implement AudioTaskQueue FIFO enqueue and processing
- [x] Task 2.2: Integrate concurrent track requests with sequential downloading and decoding
- [x] Task 2.3: Test and fix FIFO order, concurrent requests, and error handling
- [x] Task 2.4: Atomic Git Commit: "feat(queue): implement concurrent FIFO audio task processing"

### Constraints

**Queue Contract:**
- Export `AudioTaskQueue` from `audio-queue-controller.ts`.
- Maintain `private queue: AudioTask[] = []`.
- Maintain `private isProcessing = false`.
- Maintain `private activeController: AbortController | null = null`.
- Implement `enqueue(trackUrl: string): Promise<AudioBuffer>`.
- Each enqueued task must contain `trackUrl`, `controller`, `resolve`, and `reject`.

**FIFO Processing:**
- Accept multiple enqueue requests without losing tasks.
- Preserve FIFO processing order.
- Process only one queued task at a time.
- Resolve or reject each task's Promise correctly.
- Continue processing remaining tasks after success or failure.

## Exercise 3: Memory Safety & Cancellation

- [x] Task 3.1: Implement AbortController cancellation for active and queued audio tasks
- [x] Task 3.2: Implement AudioBufferSourceNode lifecycle management and cleanup
- [x] Task 3.3: Test and fix cancellation, resource cleanup, and memory leaks
- [x] Task 3.4: Atomic Git Commit: "feat(audio): implement cancellation and audio resource cleanup"

### Constraints

**Cancellation:**
- Use AbortController and AbortSignal for cancellable operations.
- Track the active controller using `activeController`.
- Handle cancellation without blocking subsequent FIFO tasks.
- Ensure cancelled tasks do not remain unresolved.

**Memory Safety:**
- Explicitly stop and disconnect AudioBufferSourceNodes when appropriate.
- Release obsolete references and resources.
- Prevent accumulation of unused audio nodes.
- Avoid retaining cancelled audio tasks unnecessarily.

**Web Audio Limitation:**
- AbortSignal can cancel fetch requests.
- `decodeAudioData()` does not directly support AbortSignal.
- Handle cancellation during decoding without using cancelled results.

## Exercise 4: 60fps Audio Visualizer

- [x] Task 4.1: Implement Canvas or SVG frequency visualizer using AnalyserNode data
- [x] Task 4.2: Implement requestAnimationFrame rendering and animation lifecycle
- [x] Task 4.3: Optimize rendering to target 60fps without state thrashing
- [x] Task 4.4: Test and fix visualization, frame performance, and animation cleanup
- [x] Task 4.5: Atomic Git Commit: "feat(visualizer): implement 60fps audio frequency visualization"

### Constraints

**Visualization:**
- Use Canvas or SVG for frequency visualization.
- Render actual frequency data from AnalyserNode.
- Use requestAnimationFrame for animation updates.
- Support the configured FFT sizes.

**Performance:**
- Target 60fps rendering.
- Avoid unnecessary state updates during animation.
- Avoid repeated resource allocation inside animation frames.
- Prevent duplicate animation loops.
- Cancel requestAnimationFrame when animation stops.

## Exercise 5: Final Integration & Requirement Verification

- [x] Task 5.1: Integrate audio engine, FIFO queue, cancellation, and visualizer
- [x] Task 5.2: Verify all four assignment requirements through end-to-end testing
- [x] Task 5.3: Fix integration issues and validate performance and memory safety
- [x] Task 5.4: Run TypeScript checks, production build, and final code review
- [x] Task 5.5: Atomic Git Commit: "test(audio): verify concurrency visualization and memory safety"

### Constraints

**Final Verification:**
- Verify successful audio downloading and decoding.
- Verify FIFO order when multiple tracks are enqueued simultaneously.
- Verify successful and failed Promise handling.
- Verify AbortController cancellation.
- Verify AudioBufferSourceNode cleanup.
- Verify AnalyserNode frequency data and FFT configuration.
- Verify requestAnimationFrame rendering performance.
- Check for persistent resource leaks using browser DevTools.
- Confirm all four project specifications are implemented and functional.


