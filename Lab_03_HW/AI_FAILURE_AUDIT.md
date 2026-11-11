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

# AI Failure Mode Audit — Lab 3

> Every entry below was produced by the AI assistant during this Lab, reproduced and verified by me.
> No prompts, bugs, screenshots, or results are fabricated. Items still missing evidence are marked ☐.

## Summary

| # | Homework | Bug | Category | Fix commit | Status |
|---|---|---|---|---|---|
| 1 | HW1 DrumMachine | AudioContext started on touch `pointerdown` (not a user-activation event) | Browser API / event lifecycle | `<hash>` fix(drum-machine): defer audio start until user activation | ☐ Verified |
| 2 | HW1 DrumMachine | Focus isolation blocked shortcuts on every `<input>`, including the keyboard switch | Event handling / guard logic | `<hash>` fix(drum-machine): allow shortcuts when focus is on non-text inputs | ☐ Verified |
| 3 | HW1 DrumMachine | Contract placed `<ol>` inside `<output>` (invalid content model) | Semantic HTML / validation | Fixed in WBS before implementation; implemented correctly in `<hash>` feat(drum-machine): add accessible hit log, level meter and controls | ☐ Verified |

---

## Bug 1 — AudioContext created on touch `pointerdown`

### AI Prompt

> Task 1.2: Implement `drumSynth.js` Web Audio voices with shared lazy `AudioContext` and level output. (followed by the HW1 Constraints / Contract)

> Task 1.4: Build `DrumPad` and pad grid in `DrumMachine` with active state and pointer/keyboard-button triggering.

### AI-Generated Code

`drumSynth.js` — context created on the first `playVoice()` call:

```js
function getAudioContext() {
  audioContext ??= new AudioContext();
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

export function playVoice(padId) {
  // ...
  const ctx = getAudioContext();
  // ... build nodes ...
  source.start(startTime);
  // ...
}
```

`DrumPad.jsx` — `playVoice` reached from `pointerdown`:

```jsx
const handlePointerDown = (event) => {
  if (event.button !== 0) return;
  event.currentTarget.setPointerCapture(event.pointerId);
  onPress(pad.id); // → playVoice(pad.id)
};
```

### Failure Description

Chrome only lets an `AudioContext` start after a **user-activation** event. `keydown` and mouse `pointerdown` qualify, but **touch `pointerdown` does not** (touch activation happens on `pointerup` / `click`). When the first interaction on the page was a tap on a pad (mobile device or DevTools device mode after reload), the context was created without activation:

- Console logged two autoplay warnings (context creation, `start()`).
- The first tap was silent on touch devices, and the Console was no longer clean (blocks Task 1.12).

### DevTools Evidence

- Console warning ×2: *"The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page."* at `drumSynth.js:20` and `drumSynth.js:92`.
- Reproduction: DevTools device mode (iPhone SE) → reload at `#drum-machine` → tap a pad.
- Screenshot: `<evidence/bug1-before-console-warnings.png>`

### Engineering Fix

If the page has no user activation yet, do not create the context; remember the voice and play it on the next activating event, then remove the one-time listeners.

```js
const UNLOCK_EVENTS = ['pointerup', 'keydown', 'click'];
let pendingVoice = null;

function hasUserActivation() {
  return audioContext !== null || navigator.userActivation?.hasBeenActive !== false;
}

function unlockOnNextGesture(voice) {
  const isWaiting = pendingVoice !== null;
  pendingVoice = voice;
  if (isWaiting) return;

  const unlock = () => {
    for (const type of UNLOCK_EVENTS) {
      window.removeEventListener(type, unlock, true);
    }
    scheduleVoice(pendingVoice);
    pendingVoice = null;
  };

  for (const type of UNLOCK_EVENTS) {
    window.addEventListener(type, unlock, true);
  }
}

export function playVoice(padId) {
  const voice = VOICE_BY_ID.get(padId);
  if (!voice) throw new Error(`Unknown drum pad id: ${padId}`);

  if (hasUserActivation()) {
    scheduleVoice(voice);
  } else {
    unlockOnNextGesture(voice);
  }
  return gainToDb(voice.gain);
}
```

Low latency on `pointerdown` is kept for every hit after the first; only the very first touch is deferred (~100 ms to `pointerup`). Browsers without `navigator.userActivation` keep the original behaviour.

### Verification

- [x] Device mode → reload at `#drum-machine` → tap a pad: sound plays, **no Console warnings** — `<evidence/bug1-after-console-clean.png>`
- [x] Desktop → reload → press `W`: immediate sound, no warnings.
- [x] One-time listeners removed after unlock:
  ```js
  ['pointerup', 'click'].map((t) => `${t}: ${(getEventListeners(window)[t] ?? []).length}`)
  // ['pointerup: 0', 'click: 0']
  ```
- [x] `npm run lint` and `npm run build` pass.

### Git Commit

`<hash>` — `fix(drum-machine): defer audio start until user activation`

---

## Bug 2 — Focus isolation blocked shortcuts on the keyboard switch

### AI Prompt

> Task 1.3: Implement `useDrumKeyboard` hook (keydown/keyup/blur, `e.code`, repeat guard, focus isolation, cleanup). — "tương tự với quy tắc đã có, làm 1.3"

### AI-Generated Code

`useDrumKeyboard.js`:

```js
const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function isTypingTarget(target) {
  return target instanceof HTMLElement && (TYPING_TAGS.has(target.tagName) || target.isContentEditable);
}
```

### Failure Description

The guard treated **every** `<input>` as a text field. After Task 1.8 added the keyboard-shortcuts switch (`<input type="checkbox" role="switch">`), clicking or tabbing to the switch left focus on an `INPUT`, so `W A S D J K L` stopped playing even though the switch said shortcuts were **on**. The assignment only requires ignoring shortcuts while **typing** inside inputs; a checkbox accepts no text. Users see a control that contradicts the app's behaviour.

### DevTools Evidence

Reproduce on the commit before the fix (old hook + new switch):

```bash
git switch --detach <hash of feat(drum-machine): add accessible hit log, level meter and controls>
npm run dev
# test, then return:
git switch main
```

- [x] Click the "Keyboard shortcuts" switch (stays checked), press `W` → no sound, no new Hit log entry.
- [x] Elements → confirm `document.activeElement` is the checkbox:
  ```js
  document.activeElement.outerHTML
  ```
- Screenshot: `<evidence/bug2-before-switch-focused-no-hit.png>`

### Engineering Fix

Isolate only text-entry controls; non-text input types still allow shortcuts.

```js
const NON_TEXT_INPUT_TYPES = new Set([
  'button', 'checkbox', 'color', 'file', 'image', 'radio', 'range', 'reset', 'submit',
]);

function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLInputElement) return !NON_TEXT_INPUT_TYPES.has(target.type);
  return target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
}
```

### Verification

- [x] Focus the switch, press `W` → Crash plays and appears in Hit log — `<evidence/bug2-after-switch-focused-hit.png>`
- [x] `Space` on the switch toggles it without a drum hit.
- [x] Typing `wasdjkl` and Vietnamese text (UniKey) in "Session notes" still triggers nothing (AC3 still holds).
- [x] `npm run lint` and `npm run build` pass.

### Git Commit

`<hash>` — `fix(drum-machine): allow shortcuts when focus is on non-text inputs`

---

## Bug 3 — `<ol>` placed inside `<output>` in the component contract

> Detected during contract review (WBS stage), before any implementation code was written. Recorded because the defect was AI-generated and would have failed AC9 (Nu HTML Checker) if implemented as specified.

### AI Prompt

> "Dựa vào ảnh đề Homework 1 đính kèm, tạo phần WBS cho Homework 1 trong `TASK_DECOMPOSITION.md` … xác định contract, acceptance criteria riêng của bài."

### AI-Generated Code

From the first WBS contract:

```markdown
- Visual hit log: `<output aria-live="polite">` with bounded history (last 8 hits), stable unique ids as keys.
- **Component — `HitLog({ hits })`** → `<output aria-live="polite">` + `<ol>` of hits.
```

Implied markup:

```html
<output aria-live="polite">
  <ol>
    <li>Kick (A), 0 dB</li>
  </ol>
</output>
```

### Failure Description

`<output>` only permits **phrasing content**; `<ol>` is flow content, so the markup is invalid HTML (AC9). It also makes the live region re-announce the entire history on every hit instead of only the new hit (AC6).

### DevTools Evidence

- [x] Validate the implied markup above at https://validator.w3.org/nu/ (text input, with `<!doctype html><html lang="en"><head><title>t</title></head><body>` … `</body></html>`) → Error: *Element `ol` not allowed as child of element `output` in this context.* — `<evidence/bug3-before-nu-error.png>`

### Engineering Fix

The `<output>` announces only the latest hit (phrasing `<span>`, re-keyed per hit so repeated hits are re-announced); history is a separate `<ol>`.

```jsx
<output aria-live="polite">
  {latestHit ? (
    <span key={latestHit.id}>
      {latestHit.name} ({latestHit.keyLabel}), {latestHit.level} dB
    </span>
  ) : (
    'No hits yet'
  )}
</output>
{hits.length > 0 && (
  <ol>
    {hits.map((hit) => (
      <li key={hit.id}>…</li>
    ))}
  </ol>
)}
```

### Verification

- [x] Rendered DOM (with hits) passes Nu HTML Checker with no errors — `<evidence/task-1.12-nu-checker.png>`
- [x] Screen reader announces each hit once, including repeated hits on the same pad.

### Git Commit

Fixed in `TASK_DECOMPOSITION.md` before implementation; correct markup shipped in `<hash>` — `feat(drum-machine): add accessible hit log, level meter and controls`.

---

## Excluded Issues (not AI-generated)

| Issue | Reason excluded |
|---|---|
| `SyntaxError: … does not provide an export named 'playVoice'` | Manual copy/paste error while applying the Bug 1 fix; AI-provided code was correct. |
| `SyntaxError: … does not provide an export named 'DRUM_PADS'` | `drumSynth.js` content pasted into `drumPads.js` by mistake; restored from the original code. |

## Integrity Statement

- All prompts above are the actual prompts sent to the AI assistant during Lab 3.
- Bugs were not introduced intentionally to satisfy the audit requirement.
- An entry is marked verified only after its ☐ items are checked with real evidence.

## Failure 1: Registry entry used wrong property name (`component` vs `Component`)

- **AI Prompt:** "Task 0.1: Verify existing Lab 3 setup (React 19, Vite, createRoot, StrictMode), create `GrandPiano88/` with placeholder component, and register its route in `registry.js` without breaking DrumMachine"
- **AI-Generated Code:**
  ```js
  { id: 'grand-piano-88', title: 'HW2: Grand Piano 88', component: GrandPiano88 },
  ```
- **Failure Description:** The AI guessed the registry shape without reading the existing `registry.js`. Existing entries use `Component` (capital C), which the app reads to render the route. The HW2 entry used `component`, so `Component` was `undefined` and navigating to `#grand-piano-88` silently fell back to "Select a homework". No Console error was produced, so the bug went unnoticed until Task 3.1 verification.
- **DevTools Evidence:** Console shows `hash: '#grand-piano-88'`, `hasGrandPiano: false`, `heading: 'Select a homework'`, and `TypeError: Cannot read properties of null (reading 'querySelectorAll')` when querying `.piano`. ![before](./screenshots/failure-1-before.png)
- **Engineering Fix:**
  ```js
  { id: 'grand-piano-88', title: 'HW2 · Grand Piano 88', Component: GrandPiano88 },
  ```
  Matched the property name and title format of the existing DrumMachine entry. Lesson: read existing integration code before generating code that plugs into it.
- **Verification:** Console shows `hasGrandPiano: true`, `hasPiano: true`, heading `HW2: 88-Key Polyphonic Piano`; DrumMachine route still works. ![after](./screenshots/failure-1-after.png)
- **Git Commit:** `<hash>` — `fix(hw2): use Component key for GrandPiano88 registry entry`
## Failure 3: AudioContext created before user activation on first mouse press

- **AI Prompt:** "Task 2.1: Implement `polyphonicSynth.js` with lazy AudioContext, `noteOn`/`noteOff`, 8-voice Map, and FIFO voice stealing" (combined with Task 3.1, where `PianoKey` triggers `onNoteOn` on `pointerdown`)
- **AI-Generated Code:**
  ```js
  noteOn(midi, freqHz) {
    const ctx = this.#ensureContext(); // creates AudioContext immediately
  ```
  ```jsx
  onPointerDown={handlePointerDown} // calls onNoteOn(midi)
  ```
- **Failure Description:** Chrome grants mouse user activation on `mousedown`, which fires after `pointerdown`. On the first mouse press of a fresh page, the synth created the AudioContext before activation, so Chrome blocked it ("The AudioContext was not allowed to start"). <Ghi kết quả bạn quan sát: nốt đầu tiên có/không có tiếng.> Keyboard input and clicking Record first did not reproduce it, because `keydown` and `click` grant activation before the handler runs.
- **DevTools Evidence:** Console warnings at `polyphonicSynth.js:18` and `:40` after reloading and clicking a piano key with the mouse. ![before](./screenshots/failure-3-before.png)
- **Engineering Fix:** If no AudioContext exists and `navigator.userActivation.hasBeenActive` is false, the synth stores the note as pending and listens (capture phase, AbortController-managed) for activation events; on activation it creates the context and plays still-held notes. `noteOff` drops pending notes; `stopAll` clears them and removes the listeners.
- **Verification:** After reload, the first mouse click plays immediately with no Console warnings; keyboard, Record/Play and voice stealing unchanged. ![after](./screenshots/failure-3-after.png)
- **Git Commit:** `<hash>` — `fix(hw2): defer AudioContext creation until user activation`

## HW3 Failure: Leaderboard caused horizontal page overflow

- **Reported request:** "bị tràn ngang rồi fix lỗi giúp ik". The original generation prompt for the affected layout is not recorded here.
- **Faulty layout:** `SquadLeaderboard.jsx` rendered `<table className="leaderboard">` directly inside the panel. The CSS used `width: 100%` without a containing horizontal scroll region.
- **Root cause:** The table's intrinsic minimum width (about 369px) exceeded the available content width on a 375px viewport. `width: 100%` alone could not shrink the table below that minimum, so it expanded the document's scrollable width.
- **Evidence before the fix:** The user's Console screenshot showed `document.documentElement.scrollWidth <= document.documentElement.clientWidth` returning `false`. A Chrome check on `#krafton-pubg-vn-arena` at a 375px viewport reproduced `clientWidth: 360` and `scrollWidth: 385` (the vertical scrollbar accounts for the reduced client width).
- **Engineering fix:** In `SquadLeaderboard.jsx`, wrap the table in a labelled `<section className="leaderboard-scroll">` with `tabIndex={0}` so keyboard users can scroll it. In `KraftonPubgVnArena.css`, apply `max-width: 100%`, `overflow-x: auto`, `overscroll-behavior-x: contain`, and a visible focus outline to that region. The table retains its native semantics and all columns remain accessible.
- **Verification (2026-11-12):** Chrome checks at 375, 768, 960 and 1440px confirmed document `scrollWidth === clientWidth` across HW1, HW2 and HW3. At 375px, HW3 changed from `385 > 360` to `360 === 360`. `npm.cmd run lint` and `npm.cmd run build` both passed.
