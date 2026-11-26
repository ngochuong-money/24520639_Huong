# AI_FAILURE_AUDIT.md

# Homework 1: Production Enterprise Data-Grid

## Failure 1: Optional Callback Handling

**1. Original Prompt**
- Task 2.1: Implement accessible DataGrid table component.

**2. AI-Generated Code**

```typescript
onRowSelect(selectedItem);
```

**3. Technical Error**
- The code assumes `onRowSelect` always exists, causing a potential runtime error when the callback is optional.

**4. Error Detection Method**
- Manual code review and TypeScript contract inspection.

**5. Manual Fix**

```typescript
onRowSelect?.(selectedItem);
```

- Update `DataGridProps<T>` to declare `onRowSelect` as optional.

---

## Failure 2: Redundant ARIA Attributes

**1. Original Prompt**
- Task 2.1: Implement accessible DataGrid table component.

**2. AI-Generated Code**

```typescript
tr.setAttribute('role', 'row');

td.setAttribute(
  'aria-labelledby',
  `${gridId}-header-${columnIndex} ${td.id}`
);
```

**3. Technical Error**
- Unnecessary ARIA attributes duplicate native HTML semantics and may cause redundant screen-reader announcements.

**4. Error Detection Method**
- Manual code review and accessibility inspection.

**5. Manual Fix**
- Remove redundant ARIA attributes.
- Preserve native `<tr>`, `<th scope="col">`, and appropriate grid semantics.

---

## Failure 3: Invalid ARIA Grid Structure

**1. Original Prompt**
- Task 5.3: Audit and fix WCAG 2.2 AA issues.

**2. AI-Generated Code**

```typescript
caption.append(filterLabel, filterInput, statusMessage);
table.appendChild(caption);

footerCell.appendChild(pagination);
tfoot.appendChild(footerRow);
```

**3. Technical Error**
- Interactive Search and Pagination controls were placed inside the ARIA grid structure.
- Lighthouse reported an ARIA required-children violation.
- Accessibility score: 94/100.

**4. Error Detection Method**
- Chrome DevTools → Lighthouse → Accessibility.
- Failing elements: `table#data-grid-1` and `input#data-grid-1-filter`.

**5. Manual Fix**
- Move Search and Pagination outside the table.
- Keep `<table role="grid">` for data rows and columns.
- Update related event listeners and CSS selectors.

---

## Failure 4: Undefined Variable After DOM Refactoring

**1. Original Prompt**
- Task 5.3: Fix ARIA grid structure while preserving existing functionality.

**2. AI-Generated Code**

```typescript
footerCell.colSpan = Math.max(
  1,
  columns.length + (onRowSelect ? 1 : 0)
);
```

**3. Technical Error**
- The `footerCell` declaration was removed during refactoring, but its references remained.
- This caused a runtime `ReferenceError`.

**4. Error Detection Method**
- Chrome DevTools → Console.

```text
Uncaught ReferenceError: footerCell is not defined
at createDataGrid (DataGrid.ts:108:5)
```

**5. Manual Fix**
- Remove remaining `footerCell`, `footerRow`, and `tfoot` references.
- Append Pagination directly to the component container.

```typescript
container.append(
  toolbar,
  table,
  pagination,
  statusMessage
);
```

---

# Homework 2: Concurrent FIFO Audio Visualizer Queue Engine

## Failure 1: TypeScript Parameter Property Error (TS1294)

**1. Original Prompt**
- Implement AudioTaskQueue with FIFO enqueue and sequential audio processing.

**2. AI-Generated Code**

```typescript
constructor(private readonly audioEngine: AudioEngine) {}
```

**3. Technical Error**
- TypeScript error `TS1294`: Parameter properties are not allowed when `erasableSyntaxOnly` is enabled.

**4. Error Detection Method**
- Detected using `npx.cmd tsc --noEmit` in VS Code Terminal.

**5. Manual Fix**
- Declared the property separately and initialized it inside the constructor.

```typescript
private readonly audioEngine: AudioEngine;

constructor(audioEngine: AudioEngine) {
  this.audioEngine = audioEngine;
}
```

---

## Failure 2: Unused Private Property (TS6133)

**1. Original Prompt**
- Implement FIFO queue processing while maintaining an `activeController` for cancellation.

**2. AI-Generated Code**

```typescript
private activeController: AbortController | null = null;
```

- The AI assigned values to `activeController` but did not read the property.

**3. Technical Error**
- TypeScript error `TS6133`: `activeController` is declared but its value is never read.

**4. Error Detection Method**
- Detected using `npx.cmd tsc --noEmit`.

**5. Manual Fix**
- Updated the processing guard to read `activeController`.

```typescript
if (this.isProcessing || this.activeController !== null) {
  return;
}
```

---

## Failure 3: Incorrect FPS Throttling

**1. Original Prompt**
- Optimize Canvas rendering to target 60 FPS without unnecessary state updates.

**2. AI-Generated Code**

```typescript
if (
  this.lastFrameTime === 0 ||
  timestamp - this.lastFrameTime >=
    this.targetFrameInterval - 0.5
) {
  this.draw();
  this.lastFrameTime = timestamp;
}
```

**3. Technical Error**
- The manual FPS threshold could skip rendering frames when `requestAnimationFrame()` timestamps were slightly below the threshold.

**4. Error Detection Method**
- Measured FPS using `performance.now()` and counted actual `draw()` calls.
- The visualizer initially rendered at approximately 30 FPS.

**5. Manual Fix**
- Removed manual FPS throttling and used the browser's native `requestAnimationFrame()` scheduling.

```typescript
const animate = () => {
  if (!this.isRunning) return;

  this.draw();

  if (this.isRunning) {
    this.animationId = requestAnimationFrame(animate);
  }
};
```

- A later test recorded approximately 60.22 FPS after power conditions improved. Therefore, the earlier 30 FPS result was not conclusively caused by throttling alone.

---

## Failure 4: Undefined FPS Variables (TS2339)

**1. Original Prompt**
- Fix the low FPS issue by removing manual frame throttling.

**2. AI-Generated Code**
- The AI instructed removing `lastFrameTime` and `targetFrameInterval`, but references to these properties remained in `start()` and `stop()`.

**3. Technical Error**
- Six TypeScript `TS2339` errors occurred because the removed properties were still referenced.

**4. Error Detection Method**
- Detected using `npx.cmd tsc --noEmit`.

**5. Manual Fix**
- Removed all remaining references.
- Updated `start()` and `stop()` to use `isRunning` and `animationId`.

---

## Failure 5: Incorrect Main Application Integration

**1. Original Prompt**
- Add individual audio playback controls and display the currently playing track.

**2. AI-Generated Code**

```typescript
if (selectedBuffer !== null) {
  await engine.playBuffer(selectedBuffer);
}
```

- The AI-generated update replaced `selectedBuffer` with `decodedTracks` but left obsolete code in the application.

**3. Technical Error**
- The integration contained obsolete variable references, duplicated `Promise.allSettled()` logic, and repeated `catch`/`finally` blocks.

**4. Error Detection Method**
- Detected by reviewing `src/main.ts` after combining the AI-generated code changes.

**5. Manual Fix**
- Removed duplicated processing blocks.
- Replaced `selectedBuffer` with `decodedTracks`.
- Reorganized playback into a reusable `playTrack(index)` function.

# Homework 3 — AI Failure Audit

**Project:** High-Concurrency Flash-Sale E-Commerce Engine

**Purpose:** Document genuine AI-generated code defects, how they were detected, and the manual corrections required.

---

## Failure 1: Nullable Reservation Copy (TS18047)

### 1. Original Prompt

Task 3.3: Test and fix inventory reservation rules and invalid transitions.

### 2. AI-Generated Code

File: `src/inventory/InventoryManager.test.ts`

```typescript
const reservationCopy = inventory.getReservation(second.id);

assert(reservationCopy !== null, 'Reservation missing');

reservationCopy.status = 'cancelled';
```

### 3. Technical Error

TypeScript reported:

```text
error TS18047: 'reservationCopy' is possibly 'null'.
```

The `getReservation()` method returns `InventoryReservation | null`.

Although the code checked for `null` using a custom `assert()` function, that function was not declared with a TypeScript assertion signature. Consequently, TypeScript could not narrow the variable's type.

### 4. Error Detection Method

- Executed `npx.cmd tsc --noEmit`.
- Observed compiler error TS18047 in `InventoryManager.test.ts`, line 252.
- Reviewed the return type of `getReservation()` and the custom assertion function.

### 5. Manual Fix

```typescript
const reservationCopy = inventory.getReservation(second.id);

if (reservationCopy === null) {
  throw new Error('Reservation missing');
}

reservationCopy.status = 'cancelled';
```

The explicit null check allows TypeScript to narrow `reservationCopy` to `InventoryReservation`.

**Verification:** The subsequent browser test output showed all 14 Inventory tests passing. Compiler success after this individual fix was not separately documented.

---

## Failure 2: Nullable Snapshot in Flash-Sale UI (TS18047)

### 1. Original Prompt

Task 5.1: Implement responsive flash-sale product and countdown interface.

### 2. AI-Generated Code

File: `src/ui/FlashSaleUI.ts`

```typescript
const snapshot = flow.getSnapshot();

case 'reserved':
  reservationStatus.textContent = 'Đang giữ hàng';
  lockClock.textContent = formatTime(
    snapshot.remainingMs
  );
  break;
```

The code excerpt shows the relevant declaration and switch branch.

### 3. Technical Error

TypeScript reported:

```text
error TS18047: 'snapshot' is possibly 'null'.
```

The `getSnapshot()` method returns `ReservationSnapshot | null`.

The AI-generated code accessed `snapshot.remainingMs` without handling the nullable return type.

### 4. Error Detection Method

- Executed `npx.cmd tsc --noEmit`.
- Observed compiler error TS18047 at `src/ui/FlashSaleUI.ts:289`.
- Reviewed the `getSnapshot()` return type and the `reserved` switch branch.

### 5. Manual Fix

```typescript
case 'reserved':
  reservationStatus.textContent = 'Đang giữ hàng';
  lockClock.textContent = formatTime(
    snapshot?.remainingMs ?? 0
  );
  break;
```

Optional chaining prevents direct access to `null`, while nullish coalescing provides a safe fallback value.

**Verification:** The subsequently supplied `FlashSaleUI.ts` included this correction, and the user provided a screenshot showing the flash-sale interface rendering. A separate compiler-success log was not supplied.

---

## Failure 3: Variable Used Before Declaration

### 1. Original Prompt

Task 5.3: Implement inventory status, sold-out feedback, and accessible UI states.

### 2. AI-Generated Code

File: `src/ui/FlashSaleUI.ts`

The AI instructed adding an accessibility attribute near the declaration of `purchaseState`, before `quantityInput` was initialized.

The resulting code contained:

```typescript
const purchaseState = element('p', 'purchase-state');
purchaseState.id = 'purchase-state';

quantityInput.setAttribute(
  'aria-describedby',
  'purchase-action-hint'
);

// Later in the same function:
const quantityInput = element('input', 'quantity-input');
```

### 3. Technical Error

The code accesses the block-scoped `quantityInput` variable before its declaration and initialization.

This violates JavaScript's temporal dead zone rules for `const`.

If executed in that order, the application would throw a `ReferenceError`. TypeScript can also detect this as a variable-used-before-declaration error.

The mistake originated from the AI's placement instructions, which did not respect the existing initialization order.

### 4. Error Detection Method

- Reviewed the user-provided `FlashSaleUI.ts` source.
- Identified the `quantityInput.setAttribute()` call before the `const quantityInput` declaration.
- Compared the code order with the AI-generated Task 5.3 instructions.

**Detection evidence:** Source-code review. No compiler log for this specific error was provided.

### 5. Manual Fix

Move the accessibility attribute configuration after the input declaration and initialization:

```typescript
const quantityInput = element('input', 'quantity-input');

quantityInput.id = 'flash-quantity';
quantityInput.type = 'number';
quantityInput.min = '1';
quantityInput.max = String(INITIAL_STOCK);
quantityInput.step = '1';
quantityInput.value = '1';
quantityInput.required = true;

quantityInput.setAttribute(
  'aria-describedby',
  'purchase-action-hint'
);
```

This ensures the element exists before its properties are accessed.

**Verification:** The correction was provided during code review. Its final application and compiler result still need to be confirmed against the current project version.

---

## Audit Summary

| Failure | Category | Detection |
|---|---|---|
| 1. Nullable Reservation Copy | TypeScript null safety | Compiler TS18047 |
| 2. Nullable Snapshot | TypeScript null safety | Compiler TS18047 |
| 3. Variable Used Before Declaration | Initialization order | Source-code review |

**Total documented AI-generated failures: 3**

### Lessons Learned

1. Validate nullable return values before accessing object properties.
2. Run TypeScript strict checks on AI-generated code.
3. Review variable declaration and initialization order when integrating code snippets.
4. Verify generated code against existing interfaces and project structure.
5. Do not consider an AI-provided fix verified until its relevant checks have passed.