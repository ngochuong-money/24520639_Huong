# Homework 4 — Contract

> Slides 31–33 are reference only. This contract follows the project rules (semantic HTML, derived state, WCAG 2.2 AA, contract-first).

## 1. Routes

| Path | Element | Notes |
|---|---|---|
| `/` | `<Navigate to="/swipe" replace />` | |
| (layout) | `<AppLayout />` | `<header>` app name + `<nav aria-label="Main">` with `NavLink`s: Swipe · Himass · TanVuu; `<Suspense fallback={<Skeleton variant />}>` around `<Outlet />` |
| `/swipe` | lazy `SwipePage` | `<main>` → `<h1>Discover</h1>` → `SwipeDeck` |
| `/dossier/:playerID` | lazy `DossierView` | `<h1>{player.name}</h1>`; unknown id → `<NotFoundState />` inside the layout |
| `*` | `<NotFoundState />` (static) | |

- One `<h1>` per page; the header app name is a link, not a heading
- `NavLink` active style through `className={({ isActive }) => …}` (sets `aria-current="page"`)
- Prohibited: `<Switch>`, `<Redirect>`, `exact`, `component=`, `activeClassName`

## 2. Swipe Model (`shared/swipeRules.js`)

| Direction | Action | Weight | Announcement |
|---|---|---|---|
| `left` | NOPE | −5 | `Passed on {name}.` |
| `right` | LIKE | +10 | `Liked {name}.` |
| `up` | SUPER | +15 | `Super liked {name}.` |

```js
export const DIRECTIONS = ['left', 'right', 'up'];
export const SCORE_WEIGHTS = { left: -5, right: 10, up: 15 };
export function validateSwipe(values, { profileIds } = {}) → { [field]: message }
  // profileId: required → 'Profile is required.'; unknown (when profileIds given) → 'Unknown profile.'
  // direction: not in DIRECTIONS → 'Direction must be left, right or up.'
```

`shared/computeScore.js`: `computeScore(history) = history.reduce((sum, s) => sum + SCORE_WEIGHTS[s.direction], 0)`. Pure; `[]` → `0`; the score may be negative.

## 3. Deck State (`useSwipeDeck`)

```js
useSwipeDeck() → {
  profiles, loading, error,            // from abortable GET /api/profiles
  history,                             // LIFO stack: { id, profileId, direction, pending }
  currentProfile, score, isFinished, canUndo, remainingCount,   // derived
  announcement,                        // derived from the last action (live region text)
  swipe(direction), undo(), reset(),
}
```

| Kind | Name | Definition |
|---|---|---|
| State | `history` | Array, updated immutably (`[...prev, entry]` / `prev.slice(0, -1)`) |
| State | `lastAction` | `{ type: 'swipe' \| 'undo' \| 'error', profileId, direction? }` (drives the announcement) |
| Derived | `swipedIds` | `new Set(history.map((s) => s.profileId))` |
| Derived | `currentProfile` | `profiles.find((p) => !swipedIds.has(p.id))` |
| Derived | `score` | `computeScore(history)` |
| Derived | `isFinished` | `profiles.length > 0 && !currentProfile` |
| Derived | `canUndo` | `history.length > 0 && !history.at(-1).pending` |

No `currentIndex`, `score` or `isFinished` state exists.

### Server sync
- **Load:** `GET /api/profiles` and `GET /api/swipes` (abortable) → initial `history` restored in `createdAt` order
- **swipe(direction):** push `{ id: 'pending-<uuid>', pending: true }` immediately (optimistic) → `POST /api/swipes` → on `201` replace with the server `id`, `pending: false`; on failure remove that entry and set `lastAction = { type: 'error' }` → "Could not save your swipe. Please try again."
- **undo():** only when `canUndo`; pop immediately → `DELETE /api/swipes/:id` → on failure push it back + error announcement
- **reset():** `DELETE /api/swipes` → `history = []`
- Every async function has `try/catch`; no unhandled rejections

### Announcement (polite live region, visually hidden)
`{action text} Score {score}.` e.g. `Liked Linh. Score 25.` · undo: `Undid swipe on Linh. Score 15.` · finished: append ` No more profiles.`
Failed undo: `Could not undo. Please try again.`
Reset: `Starting over. Score 0.` · failed reset: `Could not start over. Please try again.`

## 4. Input Map

All three input methods call the same `swipe()` / `undo()`.

### Keyboard (on the focused deck `<section tabIndex={0}>`)
| Key (`event.key`) | Action |
|---|---|
| `ArrowLeft` / `ArrowRight` / `ArrowUp` | `swipe('left' / 'right' / 'up')` + `preventDefault()` (no page scroll) |
| `Backspace` | `undo()` + `preventDefault()` |

Ignored when: `event.repeat`, any of `altKey`/`ctrlKey`/`metaKey`, the target is `input`/`textarea`/`select`/`[contenteditable]`, or no current profile. Uses `keydown` + `event.key` only (no `keyCode`/`keypress`).

### Pointer (on the top card)
- `pointerdown` (primary button only) → start point in a **ref** + `setPointerCapture(pointerId)`
- `pointermove` → `dragOffset` state `{ x, y }` (visual only: `transform: translate() rotate()`)
- `pointerup` → `dx > 80` → right · `dx < −80` → left · `dy < −80 && |dy| > |dx|` → up · otherwise snap back
- `pointercancel` / `lostpointercapture` → reset without swiping
- CSS `touch-action: none` on the card

### Buttons (always visible — WCAG 2.2 · 2.5.7 Dragging Movements)
`<button type="button">` with visible text + icon (`aria-hidden`) and `aria-label`: `Pass on {name}`, `Super like {name}`, `Like {name}`, `Undo last swipe`. Disabled when there is no current profile / `!canUndo`.

### `useSwipeGestures({ onSwipe, onUndo, enabled = true, threshold = 80 })`
→ `{ keyHandlers: { onKeyDown }, pointerHandlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onLostPointerCapture }, dragOffset: { x, y }, isDragging }`
- `keyHandlers` go on the deck `<section>`, `pointerHandlers` on the card `<article>`
- `dragOffset` is the only gesture state (visual); the start point lives in a ref
- `enabled = false` (no current profile) → handlers do nothing

### UI names (exact)
- Deck region: `Profile deck` · keyboard hint: `Use ← to pass, → to like, ↑ to super like, Backspace to undo.`
- Card: `<article>` named by `<h2>{name}, {age}</h2>`
- Buttons: visible text `Pass` / `Super like` / `Like` / `Undo` + visually hidden ` on {name}` / ` last swipe` → accessible names `Pass on {name}`, `Super like {name}`, `Like {name}`, `Undo last swipe` (WCAG 2.5.3 Label in Name; no aria-label override)
- `useSwipeGestures` `enabled` = deck loaded without error; `swipe()` itself ignores calls when there is no current profile, so Backspace still undoes on the finished screen
- ScoreBoard `<dl>`: `Score`, `Profiles left`
- Finished: `You have seen everyone.` + button `Start over`
- Load error: `role="alert"` with the hook error text

### Motion
- Drag: `transform: translate() rotate()` follows `dragOffset`; snap-back transition only under `prefers-reduced-motion: no-preference`
- Exit: after a swipe, a decorative ghost of the swiped card (`aria-hidden`, `inert`, `alt=""`) flies out left/right/up; not rendered visibly under `prefers-reduced-motion: reduce`
- `useSwipeDeck` exposes derived `leaving = { key, profile, direction } | null` (last action was a successful/optimistic swipe)

### Focus management
- Control buttons use `aria-disabled="true"` (not `disabled`) so focus is never dropped to `<body>` when an action becomes unavailable; clicks on them are no-ops
- After `Start over`, focus moves to the deck `<section>`
- Visible `:focus-visible` ring on the deck and every button (≥ 3px, contrast ≥ 3:1)

## 5. Components

| Component | Props | Renders |
|---|---|---|
| `SwipeDeck` | — (uses `useSwipeDeck`) | `<section aria-labelledby aria-describedby tabIndex={0} onKeyDown>` → keyboard hint `<p id>` → `ScoreBoard` → `SwipeCard` or finished state → `SwipeControls` → live region |
| `SwipeCard` | `{ profile, onSwipe }` | `<article aria-labelledby>` → `<img alt width=600 height=800>` → `<h2>{name}, {age}</h2>` → `<p>{city}</p>` → `<p>{bio}</p>` → `<ul>` interests |
| `SwipeControls` | `{ profileName, canSwipe, canUndo, onSwipe, onUndo }` | 4 buttons |
| `ScoreBoard` | `{ score, remainingCount }` | `<dl>`: Score · Profiles left |
| Finished state | — | `<p>You have seen everyone.</p>` + `Start over` button (`reset()`) |

## 6. Disproportionality Matrix (`shared/computeMatrix.js`)

```js
computeMatrix({ name, violationSeverity, sanctionSeverity, precedents }) → {
  rows,              // sanction 5 → 1 (top = severe), each: { sanction, cells: [{ violation, sanction, isCase, precedentIds, band }] } for violation 1 → 5
  gap,               // sanctionSeverity − violationSeverity
  precedentMedianGap,// median of (s − v) over precedents (0 when none)
  verdict,           // 'Disproportionate' | 'Proportionate'
  reason,            // human-readable sentence
}
```
- `band`: `'proportionate'` when `|s − v| ≤ 1`, `'harsh'` when `s − v ≥ 2`, `'lenient'` when `s − v ≤ −2`
- `verdict = 'Disproportionate'` when `gap ≥ 2` **or** `gap − precedentMedianGap ≥ 2`
- Severities outside the integers 1–5 → `RangeError`
- Seed check: Himass (3, 4; gaps 0, 1, 0) → **Proportionate**; TanVuu (1, 3) → **Disproportionate**

### `DisproportionalityMatrix` `{ dossier }`
- `const matrix = useMemo(() => computeMatrix(dossier), [dossier]);` (derived in render; no effect)
- `<table>` + `<caption>Disproportionality matrix for {name}</caption>`; `<th scope="col">` violation 1–5; `<th scope="row">` sanction 5–1
- Cell text (not colour only): `Case`, `P×n` (with visually-hidden full precedent labels); band also as a CSS class
- Verdict: `<p><strong>Verdict: {verdict}.</strong> {reason}</p>` + legend `<dl>`

## 7. Dossier View
- `useParams()` → `findPlayer()` → `<article>` case file `<dl>`, `SlaCountdown` (ported `useAppealSlaTimer`: clock-delta, `/api/time` midpoint offset, `visibilitychange` re-sync **with `removeEventListener` cleanup**), `DisproportionalityMatrix`

## 8. Test List

**3.1 — state (client)**
1. `computeScore`: `[]` → 0; mixed history → asymmetric sum; negative allowed
2. `useSwipeDeck` loads profiles + history (abortable); restored history skips swiped profiles
3. `swipe` pushes optimistically, then stores the server id
4. failed POST rolls back + error announcement
5. `undo` pops the **last** entry only (LIFO) and calls `DELETE /api/swipes/:id`; failed DELETE restores it
6. `canUndo` false while the last entry is pending
7. `currentProfile` / `isFinished` / `remainingCount` derived correctly; `reset()` clears
8. Source has no `currentIndex`/`setScore` state

**4.1 — UI (client)**
9. Card is an `<article>` named by its `<h2>`; avatar has `alt`, width, height
10. ArrowRight/ArrowLeft/ArrowUp swipe when the deck is focused; repeated keys and modifier combos are ignored
11. Backspace undoes; Backspace inside an `<input>` does not
12. Buttons have accessible names and are disabled appropriately
13. Drag past the threshold swipes; short drag snaps back; `pointercancel` resets
14. Score + live region update after swipe and undo
15. Finished state shows "Start over", which clears the deck

**5.1 — portal (client)**
16. `computeMatrix`: grid 5×5, case/precedent cells, `gap`, median, both verdict rules, `RangeError`
17. Seed verdicts: Himass Proportionate, TanVuu Disproportionate
18. `/dossier/himass` and `/dossier/tanvuu` render; unknown id → 404 inside the layout; active `NavLink` has `aria-current="page"`
19. Matrix is a `<table>` with `<caption>` and scoped headers; verdict shown as text
20. Timer removes its `visibilitychange` listener on unmount
