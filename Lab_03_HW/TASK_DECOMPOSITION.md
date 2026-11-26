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
## 5. Final WBS Verification

- Add a final verification task after implementation and before the final commit.
- Validate the rendered HTML using https://validator.w3.org/nu/; do not validate only Vite's source index.html.
- Fix HTML validation errors and review relevant warnings.
- Open browser DevTools Console, reload the app, and exercise the required features. Fix application errors and relevant warnings.
- Capture screenshots of the HTML validation result and the Console showing no application errors after testing.
- Mark this task complete only after verification; report any checks that could not be performed.
# WBS
## Homework 1: Production Studio Drum Kit — `src/homeworks/DrumMachine/`

## Lab 3 Setup (shared)

- [x] Task 0.1: Initialize (or verify) shared Lab 3 React 19 + Vite project — `react`/`react-dom` 19.x, `createRoot()` + `<StrictMode>`, automatic JSX runtime; add `App` shell with `<nav>` hash links and single `<main>` rendering one homework at a time; run `npm ls react react-dom`, `npm run dev`, `npm run build`, `npm run lint`; capture screenshots of versions and the running app with a clean Console.
- [x] Task 0.2: Commit — `chore(setup): initialize React 19 + Vite project for Lab 3` (skip if already initialized and nothing changed).

## Homework 1: Production Studio Drum Kit — `src/homeworks/DrumMachine/`

### Constraints (HW1-specific)

- Pads: 7 keys mapped by physical `e.code`: `KeyW`, `KeyA`, `KeyS`, `KeyD`, `KeyJ`, `KeyK`, `KeyL` (never `e.key` for matching, never `keyCode`).
- Global listeners: `window` `keydown` + `keyup`, attached in one custom hook with cleanup; a `blur` reset clears stuck active pads.
- Anti-repeat: `if (e.repeat) return;` — holding a key triggers exactly one hit.
- Focus isolation: ignore shortcuts when the event target is `INPUT`, `TEXTAREA`, `SELECT`, or `isContentEditable`.
- Audio: Web Audio API synthesized drum voices (no external/HTTP assets); one shared `AudioContext`, created/resumed on first user gesture.
- Pads are native `<button type="button" aria-pressed={isActive}>`; mouse/touch/Enter/Space must also trigger.
- Visual hit log: `<output aria-live="polite">` announces only the latest hit (phrasing content only); history is a separate `<ol>` of the last 8 hits with stable unique ids as keys.
- Decibel meter: native `<meter>` with an accessible name, value derived from the last hit's level, decays visually.
- Must work with Vietnamese IME (UniKey) enabled.

### Contract

- **Data — `drumPads.js`**
  - `DRUM_PADS: Array<{ id: string, code: string, keyLabel: string, name: string, voice: VoiceParams }>`
  - `PAD_MAP: Map<code, pad>` (derived once at module level)
- **Hook — `useDrumKeyboard(padMap, onPress, onRelease, isEnabled = true)`**
  - Behavior: keydown → guard (repeat, form target, unmapped) → `preventDefault()` → `onPress(pad.id)`; keyup → `onRelease(pad.id)`; window `blur` → release all.
  - Returns nothing; removes all listeners on cleanup / when disabled.
- **Utility — `drumSynth.js`**
  - `playVoice(padId): number` — plays the sound, returns hit level (dB, e.g. -30…0).
- **Component — `DrumMachine` (root, renders a `<section>` inside the shell's `<main>`)**
  - State: `activePadIds: string[]`, `hits: Array<{ id, padId, name, keyLabel, level, time }>`, `isKeyboardEnabled: boolean`.
  - Derived: `currentLevel` (from latest hit), `latestHit`, `isActive` per pad.
- **Component — `DrumPad({ pad, isActive, onPress, onRelease })`** → `<button aria-pressed>` showing key + name.
- **Component — `HitLog({ hits, latestHit })`** → `<output aria-live="polite">` with latest-hit text + separate `<ol>` history.
- **Component — `LevelMeter({ level, min, max })`** → labeled `<meter>` + text value.
- **Controls:** keyboard-enabled toggle, clear-log button, and a "session notes" `<input>` to demonstrate focus isolation.

### Acceptance Criteria (HW1-specific)

- [x] AC1: Each of W/A/S/D/J/K/L plays its sound and highlights its pad; works with UniKey Telex/VNI on.
- [x] AC2: Holding a key produces one hit only (log grows by 1).
- [x] AC3: Typing in the notes input plays nothing and logs nothing.
- [x] AC4: `aria-pressed` is `true` while key/pointer is held and `false` after release or window blur.
- [x] AC5: Clicking or Enter/Space on a focused pad triggers the same behavior.
- [x] AC6: Each new hit is announced once, politely (screen reader check); history keeps max 8 entries.
- [x] AC7: Meter reflects hit level and is exposed with a name in the Accessibility Tree.
- [x] AC8: Toggle disables/enables keyboard shortcuts; listeners are removed (verified in DevTools Event Listeners).
- [x] AC9: Zero div-soup, no horizontal scroll at 375px, Lighthouse A11y & Best Practices 100, Nu Checker clean.

### Tasks

- [x] Task 1.1: Scaffold `DrumMachine/` structure, register it in the `App` nav, and define `drumPads.js` data + `PAD_MAP`.
- [x] Task 1.2: Implement `drumSynth.js` Web Audio voices with shared lazy `AudioContext` and level output.
- [x] Task 1.3: Implement `useDrumKeyboard` hook (keydown/keyup/blur, `e.code`, repeat guard, focus isolation, cleanup).
- [x] Task 1.4: Build `DrumPad` and pad grid in `DrumMachine` with active state and pointer/keyboard-button triggering.
- [x] Task 1.5: Test AC1–AC5 (incl. UniKey and DevTools listener check) and fix issues.
- [x] Task 1.6: Commit — `feat(drum-machine): add pad data, synth and keyboard hook with pads`.
- [x] Task 1.7: Build `HitLog` (`<output aria-live>` + `<ol>` history) and `LevelMeter` (`<meter>`) wired to hit state.
- [x] Task 1.8: Add controls (keyboard toggle, clear log, session notes input) and integrate into the page.
- [x] Task 1.9: Commit — `feat(drum-machine): add accessible hit log, level meter and controls`.
- [x] Task 1.10: Style responsive studio layout (375–1440px) with visible focus and active-state contrast.
- [x] Task 1.11: Run a11y/UX audit (AC1–AC9: Accessibility Tree, screen reader, Lighthouse, 375px overflow, Profiler) and fix issues.
- [x] Task 1.12: Final verification — validate rendered HTML (DevTools-copied DOM) at validator.w3.org/nu, check Console after reload + full feature run, fix issues, capture both screenshots, report any skipped checks.
- [x] Task 1.13: Record any verified AI failures found during HW1 in `AI_FAILURE_AUDIT.md`.
- [x] Task 1.14: Commit — `style(drum-machine): responsive layout, a11y audit and final verification fixes`.

# TASK_DECOMPOSITION.md — Homework 2: GrandPiano88

## Constraints
- Directory: `src/homeworks/GrandPiano88/` (flat structure like DrumMachine: `GrandPiano88.jsx`, `GrandPiano88.css`, `PianoKey.jsx`, `pianoKeys.js`, `polyphonicSynth.js`, `usePianoKeyboard.js`, `SequencerControls.jsx`); register in `src/homeworks/registry.js` and reuse `useHashRoute`.
- Keys generated algorithmically for MIDI 21 (A0) to 108 (C8): 52 white + 36 black; no hardcoded key markup.
- Frequency: `f = 440 * 2 ** ((midi - 69) / 12)`.
- Max 8 simultaneous voices; on the 9th note, release the oldest voice via `Map` insertion order (FIFO).
- Release: `exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04)` before `osc.stop()`; no audible clicks.
- Recording stores `{ midi, freqHz, durationMs, deltaMs }` in a FIFO queue; replay at 0.5x / 1.0x / 2.0x.
- Stop Sequence and unmount abort all pending playback via `AbortController` and silence every active oscillator.
- `PianoKey` wrapped in `memo()`; handlers passed to it must be referentially stable (`useCallback`); pressing 1 key re-renders only that key (React DevTools Profiler).
- Keys are `<button type="button">` with `aria-pressed` and an accessible name; they support pointer and keyboard (`keydown`/`keyup`, `event.key`).
- AudioContext is created lazily on first user gesture; the synth is a plain JS module/class, not a React class component.
- Stable keys = `midi`; no index keys.
- Existing DrumMachine (HW1) must keep working after every HW2 change.

## Phase 0: Setup
- [x] Task 0.1: Verify existing Lab 3 setup (React 19, Vite, createRoot, StrictMode), create `GrandPiano88/` with placeholder component, and register its route in `registry.js` without breaking DrumMachine
- [x] Task 0.2: Commit `chore(hw2): register GrandPiano88 homework route`

## Phase 1: Contract & Data
- [x] Task 1.1: Define contracts (PianoKey props, GrandPiano88 state, synth API, recording event shape) in the WBS notes
- [x] Task 1.2: Implement `pianoKeys.js` generating 88 key objects (midi, noteName, isBlack, freqHz) and verify counts 52/36
- [x] Task 1.3: Commit `feat(hw2): generate 88 piano keys algorithmically`

## Phase 2: Polyphonic Audio Engine
- [x] Task 2.1: Implement `polyphonicSynth.js` with lazy AudioContext, `noteOn`/`noteOff`, 8-voice Map, and FIFO voice stealing
- [x] Task 2.2: Add click-free ADSR release and `stopAll()`; test chords of 9+ notes for stealing and no popping
- [x] Task 2.3: Commit `feat(hw2): add 8-voice polyphonic synth with FIFO voice stealing`

## Phase 3: Piano UI & Render Isolation
- [x] Task 3.1: Build memoized `PianoKey` and `GrandPiano88` keyboard layout (semantic markup, responsive 375px–1440px with scrollable keyboard region)
- [x] Task 3.2: Implement `usePianoKeyboard.js` and wire pointer + keyboard note on/off with pressed state and stable callbacks
- [x] Task 3.3: Verify with React DevTools Profiler that pressing 1 key re-renders only that key; fix extra renders
- [x] Task 3.4: Commit `feat(hw2): render memoized 88-key piano with isolated re-renders`

## Phase 4: FIFO Recording & Async Replay
- [ ] Task 4.1: Implement recording in `SequencerControls.jsx` capturing `{ midi, freqHz, durationMs, deltaMs }` into an immutable FIFO queue
- [x] Task 4.2: Commit `feat(hw2): record played notes into FIFO queue`
- [x] Task 4.3: Implement async replay with speed selector (0.5x/1.0x/2.0x) and explicit state machine (idle/recording/playing)
- [x] Task 4.4: Implement Stop Sequence and unmount cleanup via AbortController plus `stopAll()`; test mid-playback stop and unmount
- [x] Task 4.5: Commit `feat(hw2): replay sequence at variable speed with abortable playback`

## Phase 5: Accessibility & Feedback
- [x] Task 5.1: Add accessible status messages (aria-live) for recording/playback state, visible focus styles, and fix Lighthouse/a11y tree issues
- [x] Task 5.2: Commit `fix(hw2): improve piano accessibility and status feedback`

## Phase 6: AI Failure Audit
- [x] Task 6.1: Document verified AI-generated failures found during HW2 in `AI_FAILURE_AUDIT.md`
- [x] Task 6.2: Commit `docs(hw2): record AI failure audit entries`

## Phase 7: Final Verification
- [x] Task 7.1: Validate rendered HTML with W3C Nu Checker, run Lighthouse (A11y + Best Practices), check 375px overflow, lint and build, exercise HW2 and HW1 with Console open, fix issues, and capture screenshots
- [x] Task 7.2: Commit `test(hw2): complete final verification for GrandPiano88`

## Contracts — Homework 2

### 1. Key Data — `pianoKeys.js`
- `midiToFreq(midi: number): number` → `440 * 2 ** ((midi - 69) / 12)`
- `midiToNoteName(midi: number): string` → e.g. `21 → "A0"`, `61 → "C#4"`, `108 → "C8"`
- `isBlackKey(midi: number): boolean` → pitch class in `{1, 3, 6, 8, 10}`
- `PIANO_KEYS: readonly PianoKeyData[]`, generated once at module level for MIDI 21–108
- `PianoKeyData = { midi: number, noteName: string, isBlack: boolean, freqHz: number }`
- Acceptance: length 88, 52 white, 36 black, `PIANO_KEYS[0].noteName === "A0"`, A4 (midi 69) = 440 Hz, C8 ≈ 4186.01 Hz

### 2. Synth API — `polyphonicSynth.js`
- `class PolyphonicSynth` (plain JS, not a component)
- `constructor(maxVoices = 8)`; `ctx = null`; `voices = new Map()` (midi → `{ osc, gain }`, insertion order = FIFO)
- `noteOn(midi, freqHz): void`: creates AudioContext lazily (resume if suspended); ignores a midi already sounding; if `voices.size >= maxVoices`, calls `noteOff(voices.keys().next().value)`; then creates osc + gain, starts, stores
- `noteOff(midi): void`: no-op if absent; ramps gain to 0.0001 over 0.04 s, `osc.stop(ctx.currentTime + 0.04)`, deletes from Map immediately
- `stopAll(): void`: `noteOff` every active voice
- `get activeCount(): number`: current `voices.size`
- Acceptance: holding 9 notes keeps exactly 8 sounding, with the oldest released; no clicks on release; no errors when calling `noteOff` for an unknown midi

### 3. `PianoKey.jsx` Props
- `{ midi, noteName, isBlack, isPressed = false, onNoteOn, onNoteOff }`
- Exported as `memo(PianoKey)`; re-renders only when its own `isPressed` changes
- Renders `<button type="button" aria-pressed={isPressed}>` with visible `noteName` as its accessible name
- Pointer: `onPointerDown` → `onNoteOn(midi)`; `onPointerUp` / `onPointerLeave` / `onPointerCancel` → `onNoteOff(midi)` (only if pressed)
- Keyboard: `onKeyDown` with `event.key` `" "` or `"Enter"` (ignore `event.repeat`, `preventDefault`) → `onNoteOn`; `onKeyUp` → `onNoteOff`
- `key={midi}` when rendered in a list

### 4. `GrandPiano88.jsx` State & Refs
- State:
  - `pressedNotes: Set<number>`: replaced with a new Set on each change (immutable)
  - `seqState: "idle" | "recording" | "playing"`
  - `recording: RecordedNote[]`: FIFO queue (append with spread)
  - `speed: 0.5 | 1 | 2` (default 1)
- Derived (not stored): `isPressed = pressedNotes.has(midi)`, `canPlay = recording.length > 0 && seqState === "idle"`, status message text
- Refs: `synthRef` (PolyphonicSynth instance), `abortRef` (AbortController | null), `noteStartRef` (Map midi → `performance.now()`), `lastNoteOnRef` (timestamp of previous note-on)
- Stable handlers via `useCallback`: `handleNoteOn(midi)`, `handleNoteOff(midi)`; they read `seqState` through a ref to avoid stale closures without breaking memo
- Unmount cleanup: `abortRef.current?.abort()` + `synthRef.current?.stopAll()`

### 5. Recording Event Shape
- `RecordedNote = { id: string, midi: number, freqHz: number, durationMs: number | null, deltaMs: number }`
- Pushed on note-on (queue order = press order, true FIFO); `durationMs` starts as `null` and is set immutably on note-off by `id`
- `deltaMs`: time from the previous note-on to this note-on (0 for the first note)
- Notes still held when recording stops are finalized at stop time
- Only recorded when `seqState === "recording"`

### 6. Replay
- `playSequence(events, { speed, signal, onNoteOn, onNoteOff }): Promise<void>`
- For each event: await `sleep(deltaMs / speed, signal)`, call `onNoteOn`, schedule `onNoteOff` after `durationMs / speed`
- `sleep(ms, signal)` rejects with `AbortError` on abort and clears its timeout
- On abort: all pending timers are cleared, `synth.stopAll()` runs, `pressedNotes` is reset, and `seqState` returns to `"idle"`; `AbortError` is caught silently

### 7. State Transitions
| From | Event | To |
|---|---|---|
| idle | Record | recording (clears previous recording) |
| recording | Stop Recording | idle |
| idle | Play (canPlay) | playing |
| playing | Stop Sequence / finished / unmount | idle |
| playing | Record | ignored (button disabled) |

### 8. `SequencerControls.jsx` Props
- `{ seqState, speed, eventCount, onRecordToggle, onPlay, onStop, onSpeedChange, onClear }`
- Speed via native `<fieldset>` + radio inputs (labelled 0.5x / 1.0x / 2.0x)
- Buttons disabled according to the state transitions above
- Status shown in an `aria-live="polite"` `<output>`
- Play button toggles to "Stop Sequence" while playing (focus stays on the same button); Record, Clear and speed are disabled while playing

### 9. `usePianoKeyboard.js`
- `usePianoKeyboard({ onNoteOn, onNoteOff, enabled })`
- Maps computer keys to one octave (e.g. `a w s e d f t g y h u j k` → C4–C5) using `event.key`
- `window` `keydown` / `keyup` listeners; ignores `event.repeat` and events from form fields
- Listeners removed on cleanup; handlers read through a ref to avoid stale closures
## Homework 3: KraftonPubgVnArena (KRAFTON x PUBG Vietnam Championship & Airdrop Arena)

### Constraints
- Directory: `src/homeworks/KraftonPubgVnArena/` for HW3 components, utils, data and styles; `usePubgAirdropTimer` lives in shared `src/hooks/usePubgAirdropTimer.js`; component name `KraftonPubgVnArena`.
- Do not modify existing files in `src/homeworks/DrumMachine/`, `src/homeworks/GrandPiano88/` or `src/hooks/useHashRoute.js`; only `src/homeworks/registry.js` may be edited to register HW3.
- Scenario: upgrade Lab 2 HW3 `createAntiDriftTimer` and the Slide 22 Virtual Scroller into the "PVS Finals Ticket & G-Coin Contraband Crate Arena".
- Timer: `usePubgAirdropTimer(targetEpochMs)` computes remaining time from a monotonic target epoch (`targetEpochMs - Date.now()`, clamped at 0) on each animation/interval frame and immediately on `visibilitychange` wake; no decrement-based countdown; clean up all timers and listeners.
- Claimable items: PVS Grand Finals VIP Tickets (price formatted in VND via `Intl.NumberFormat('vi-VN')`) and G-Coin Crates.
- Claim: idempotent in-flight `claimId` lock blocks duplicate clicks; optimistic stock deduction; automatic rollback on 409 Conflict ("Looted Out"); accessible live-region feedback (no `window.alert()`).
- Leaderboard: Vietnamese squads The Expendables, Cerberus Esports, Roy Esports, AGG; filter and sort by WWCD, Placement Points and Kill Points; filtered/sorted results are derived, not stored in state.
- Data shapes are defined by our own contract (JSDoc); the slide's TS contract is reference only.
- Semantic HTML (zero div-soup), labelled controls, visible focus, responsive 375px–1440px without horizontal scroll.
- ESLint 9 flat config + `eslint-plugin-jsx-a11y` must report zero errors.

### Task 3.1: Contract & Mock Data
- [x] Task 3.1.1: Define JSDoc contract for drops (VIP Ticket / G-Coin Crate), drop phases, squad standings and kill-feed entries.
- [x] Task 3.1.2: Create mock drops, 4 VN squads, kill-feed entries and a mock claim API (latency, 409 when out of stock, AbortSignal).
- [x] Task 3.1.3: Commit `feat(hw3): add PUBG VN arena contract and mock data`.

### Task 3.2: Zero-Drift Airdrop & Ticket Countdown Hook
- [x] Task 3.2.1: Port Lab 2 `createAntiDriftTimer` into `src/hooks/usePubgAirdropTimer.js` with frame/interval sync, visibilitychange resync and cleanup.
- [x] Task 3.2.2: Build countdown UI per drop with explicit phase transitions (e.g. warmup → live → looted out/expired).
- [x] Task 3.2.3: Test background-tab drift (hide tab ≥1 min then return), StrictMode cleanup and zero clamp.
- [x] Task 3.2.4: Commit `feat(hw3): add zero-drift usePubgAirdropTimer hook`.

### Task 3.3: Optimistic Crate/Ticket Claim & 409 Rollback
- [x] Task 3.3.1: Build drop list cards showing title, VND price, remaining stock and countdown; claim button enabled only when live.
- [x] Task 3.3.2: Implement optimistic claim with in-flight claimId lock, stock deduction, 409 rollback, request cancellation on unmount and live-region status.
- [x] Task 3.3.3: Test rapid duplicate clicks, success, forced 409 rollback and Slow 3G behavior.
- [x] Task 3.3.4: Commit `feat(hw3): add optimistic claim with 409 rollback`.

### Task 3.4: Live PUBG VN Leaderboard & Kill-Feed Filter
- [x] Task 3.4.1: Build leaderboard table with labelled squad filter and sort control (WWCD, Placement Pts, Kill Pts).
- [x] Task 3.4.2: Upgrade Lab 2 Virtual Scroller into a kill-feed list filtered by the selected squad.
- [x] Task 3.4.3: Test filter/sort combinations, empty results, stable keys, keyboard use and virtual rendering in Profiler.
- [x] Task 3.4.4: Commit `feat(hw3): add VN leaderboard and virtualized kill-feed filter`.

### Task 3.5: Integration & Registration
- [x] Task 3.5.1: Compose `KraftonPubgVnArena.jsx` sections and responsive styles; register HW3 in `registry.js`.
- [x] Task 3.5.2: Test routing across HW1/HW2/HW3, 375px–1440px layout, `npm run lint` and `npm run build`.
- [x] Task 3.5.3: Commit `feat(hw3): integrate KRAFTON PUBG VN arena into app registry`.

### Task 3.6: AI Failure Audit
- [x] Task 3.6.1: Document at least 3 verified HW3 AI failures (prompt, faulty code, root cause, evidence, fix, verification) in `AI_FAILURE_AUDIT.md`.
- [x] Task 3.6.2: Commit `docs(hw3): add HW3 AI failures to AI_FAILURE_AUDIT`.

### Task 3.7: Final Verification
- [x] Task 3.7.1: Run Lighthouse Accessibility/Best Practices and manual WCAG 2.2 AA keyboard/Accessibility Tree checks; fix issues.
- [x] Task 3.7.2: Validate rendered HTML at https://validator.w3.org/nu/ and fix errors.
- [x] Task 3.7.3: Reload with DevTools Console open, exercise all features, fix errors/warnings; capture validator and Console screenshots.
- [x] Task 3.7.4: Commit `chore(hw3): complete final verification for KRAFTON PUBG VN arena`.
## Bonus Exercise: SituationshipAnalyzer

### Constraints

- Create all Bonus files inside `src/homeworks/SituationshipAnalyzer/`.
- The only existing file allowed to be modified is `src/homeworks/registry.js`, solely to import and register the Bonus component.
- Do not modify any other existing files, including Homework implementations, shared hooks, App.jsx, main.jsx, index.css, package files, and configuration files.
- Inspect existing setup and routing in read-only mode; reuse the current registry contract `{ id, title, Component }`.
- Scope Bonus CSS under its root class to avoid affecting existing Homework styles.
- Component name: `SituationshipAnalyzer`; reuse the existing `useHashRoute` without modifying it.
- Use a strict FSM with exactly four relationship states: `STRANGERS`, `DATING_NO_LOVE`, `COMMITTED`, `SELF_RESPECT_EXIT`; do not represent relationship phases using independent booleans.
- Model asymmetric effort through immutable action logs and a pure reducer.
- Calculate effort scores and Red-Flag warnings directly from current state; do not store redundant derived state or synchronize calculations with `useEffect`.
- Required effort example: “Em cố trăm lần” = `100 × 0.1 = 10`; “Ai đó một phần” = `1 × 50 = 50`.
- Sending a message starts a 5-second reply timeout managed through `useEffect`; receiving a reply cancels that timeout.
- Timeout without a reply, switching to “Ai Đó”, clicking “Dừng Lại”, or unmounting must cancel pending work through `AbortController` and clear associated timers/listeners.
- Release references to completed/cancelled operations so resources become eligible for garbage collection; do not attempt to force garbage collection.
- Give every signal input an associated label and an ID generated with `useId()`.
- Announce derived Red-Flag feedback through `<output role="status" aria-live="polite">`; do not rely on color alone.
- Use semantic HTML, stable log IDs, native buttons, visible focus, and responsive layouts for 375px–1440px without unintended horizontal scrolling.
- Follow shared Lab 3 verification requirements; record only genuine, verified AI failures.

### Contract

- Files: `SituationshipAnalyzer.jsx`, `SituationshipAnalyzer.css`, and `situationshipReducer.js` inside `src/homeworks/SituationshipAnalyzer/`.
- Root component: `SituationshipAnalyzer()`; no required external props.
- Relationship phase: `"STRANGERS" | "DATING_NO_LOVE" | "COMMITTED" | "SELF_RESPECT_EXIT"`.
- Effort signal: `{ id: string, actor: "EM" | "AI_DO", steps: number, weight: number }`.
- Generate signal IDs in event handlers before dispatching; never generate IDs inside the reducer or during rendering.
- Reducer state: `{ phase, signals }`; initial state is `{ phase: "STRANGERS", signals: [] }`.
- Reducer behavior: validate phase transitions and append signals immutably without timers, requests, ID generation, or other side effects.
- Controlled input state: actor, steps, and weight; validate steps as a non-negative integer and weight as a finite non-negative number before appending.
- Derived values: `emScore` and `rivalScore` sum `steps * weight` for each actor.
- Derived warning: `redFlagWarning` is active when `phase === "DATING_NO_LOVE"` and `emScore < rivalScore`.
- Pending message: at most one active operation, identified by a unique request ID; sending updates pending-message state, and its effect creates an `AbortController` and starts the reply timeout.
- Async resource handles belong in refs/effects; do not put controllers or timer handles into reducer state.
- Messaging uses a local abortable simulation with functional controls to send a message, simulate a reply, switch to “Ai Đó”, and stop.
- Accept a reply only for the current pending request; ignore obsolete completions and handle expected `AbortError` without displaying an application error.
- Effect cleanup aborts its operation and clears its timer/listeners; dependency changes and StrictMode cleanup must not leave duplicate active operations.

### State Transitions

| Current phase | Event | Next phase / behavior |
|---|---|---|
| STRANGERS | Start dating | DATING_NO_LOVE |
| DATING_NO_LOVE | Confirm mutual commitment | COMMITTED; cancel pending message |
| DATING_NO_LOVE | Send message | Remain in phase; start one 5-second reply timeout |
| DATING_NO_LOVE | Receive current reply | Remain in phase; complete request and clear timeout |
| DATING_NO_LOVE | No reply after 5 seconds | SELF_RESPECT_EXIT; cancel pending request |
| DATING_NO_LOVE | Switch to “Ai Đó” | SELF_RESPECT_EXIT; cancel pending request |
| Any active phase | Dừng Lại | SELF_RESPECT_EXIT; cancel pending request |
| Any phase | Unmount | Dispose pending async resources; no further state updates |
| Any phase | Invalid event | Preserve current state |

### Acceptance Criteria

- AC1: Relationship phase always has one valid FSM value; invalid transitions leave state unchanged.
- AC2: Appending an effort signal preserves previous state/log entries and uses a stable unique ID.
- AC3: Required asymmetric inputs produce `emScore = 10`, `rivalScore = 50`, and a Red-Flag warning in `DATING_NO_LOVE`.
- AC4: Scores and warnings update immediately from current state without redundant score/warning state or calculation effects.
- AC5: Sending a message starts one 5-second timeout; a reply before expiry clears it and prevents automatic exit.
- AC6: An unanswered message exits after 5 seconds; switching to “Ai Đó”, stopping, and unmounting cancel all pending work.
- AC7: Repeated sends cannot create overlapping requests; cancelled or obsolete callbacks cannot affect a newer operation.
- AC8: All signal inputs have associated labels; Red-Flag feedback is exposed through the required live output and usable with keyboard/screen reader.
- AC9: StrictMode causes no duplicate active timers/listeners; Console remains free of application errors and relevant warnings.
- AC10: No horizontal overflow at 375px; rendered HTML passes Nu Checker; Lighthouse Accessibility and Best Practices reach 100/100, with manual accessibility checks completed.

### Task 4.1: Contract & Relationship FSM

- [x] Task 4.1.1: Inspect the existing shared setup and routing in read-only mode, confirm the registry contract `{ id, title, Component }`, finalize the component/reducer/message contracts, and define allowed FSM events before implementation. Do not modify the registry in this task; importing and registering Bonus belongs to Task 4.4.1 after the component has been created.
- [x] Task 4.1.2: Implement the pure relationship reducer and semantic `SituationshipAnalyzer` UI with controls for starting dating, confirming mutual commitment, and stopping.
- [x] Task 4.1.3: Verify AC1, valid/invalid transitions, reachable states, and keyboard behavior; fix issues and review `git diff`.
- [x] Task 4.1.4: Commit `feat(fsm): model HenHoKhongYeu state machine`.

### Task 4.2: Asymmetric Effort & Derived Red-Flag Feedback

- [x] Task 4.2.1: Build the controlled signal form with `useId()` labels, validate inputs, append signals immutably through the reducer, and render the effort log with stable IDs.
- [x] Task 4.2.2: Derive both effort scores and Red-Flag feedback during render; add labelled score displays and `<output role="status" aria-live="polite">`.
- [x] Task 4.2.3: Verify AC2–AC4 and applicable AC8 checks using the required 100 × 0.1 versus 1 × 50 example, additional signals, invalid inputs, and phase changes; fix issues.

### Task 4.3: Ghosting Timeout & Abortable Cleanup

- [x] Task 4.3.1: Implement the abortable local message simulation and functional send/reply/switch controls with one pending request and a 5-second timeout managed through `useEffect`.
- [x] Task 4.3.2: Integrate reply completion, timeout exit, switching to “Ai Đó”, stopping, and unmount cleanup; prevent overlapping requests and stale completions.
- [x] Task 4.3.3: Verify AC5–AC7 and AC9 for reply before expiry, ignored message, repeated sends, switch, stop, unmount/remount, and StrictMode; inspect timer/listener cleanup and fix issues.
- [x] Task 4.3.4: Review the integrated effort and messaging behavior with `git diff`, then commit `feat(ui): add derived red-flag meter & ghosting cleanup`.

### Task 4.4: Integration & Responsive Accessibility

- [x] Task 4.4.1: After `SituationshipAnalyzer` has been created, modify `src/homeworks/registry.js` solely to import and register it using `{ id, title, Component }`. Style its form, scores, log, status, and controls inside `src/homeworks/SituationshipAnalyzer/`, with all Bonus CSS scoped under its root class, for 375px–1440px with visible focus and adequate contrast.
- [ ] Task 4.4.2: Verify labelled inputs, Accessibility Tree, live announcements, keyboard-only operation, 375px overflow, and routing across HW1/HW2/HW3/Bonus; fix issues.
- [x] Task 4.4.3: Commit `feat(bonus): integrate responsive SituationshipAnalyzer`.

### Task 4.5: Audit & Final Verification

- [x] Task 4.5.1: Document any verified Bonus AI failures in `AI_FAILURE_AUDIT.md` with prompt, faulty code, root cause, evidence, fix, and post-fix verification; check that Lab 3 contains at least 3 genuine documented failures overall.
- [x] Task 4.5.2: Run applicable lint, tests, production build, Lighthouse Accessibility/Best Practices, and manual WCAG 2.2 AA checks; verify AC1–AC10 and fix issues.
- [x] Task 4.5.3: Validate rendered HTML at https://validator.w3.org/nu/, reload with DevTools Console open and exercise all Bonus features, fix errors/relevant warnings, capture validator and Console screenshots, and report any checks that could not be performed.
- [x] Task 4.5.4: Review `git diff` and commit verified final changes with `chore(bonus): complete SituationshipAnalyzer audit and verification`.
