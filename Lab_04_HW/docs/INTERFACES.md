# Interface Spec — Lab 4 Homework 1

Status: v1. Contract-first: change this document BEFORE changing component code.
Data shapes (`Photo`, `Card`, `Swipe`) are defined in `docs/API_CONTRACT.md`.

Conventions: function components only; destructured props with default parameters (no `defaultProps`); `type="button"` on non-submit buttons; immutable state updates; derived values are computed during render (never synced with `useEffect`); local state stays local.

## 1. Route table

| Path | Element | Loading fallback | Notes |
|---|---|---|---|
| `/` | `<AppLayout />` (layout route) | none | Header `<nav>` + `<main>` rendering `<Outlet />` |
| index | `<Navigate to="/gallery" replace />` | none | Default route |
| `gallery` | `GalleryPage` via `React.lazy` | `<Suspense fallback={<Skeleton variant="gallery" />}>` | |
| `deck` | `DeckPage` via `React.lazy` | `<Suspense fallback={<Skeleton variant="deck" />}>` | |
| `*` | `<NotFoundState />` | none | Unknown URL |

Matching behaviour (pinned by `src/App.notfound.test.jsx`):

- Trailing slashes are ignored (`/gallery/` renders the gallery) and matching is case-insensitive (`/GALLERY`); both are React Router defaults.
- Any other path, including nested paths such as `/gallery/<photo id>`, falls through to `*` and shows `<NotFoundState />` inside the layout. Photo deep links use `?photo=`, never a path segment.
- Homework 1 has no dynamic path segments, so `useParams()` is not used. If a dynamic route is added, an invalid param must render `<NotFoundState />` (project-rules.md, section 3).

- Each lazy route has its own `Suspense` so the skeleton matches that route's final layout (CLS = 0).
- There is no dynamic path param: the photo deep link uses a query param, so `useParams()` is not needed. If a dynamic route is added later, an invalid ID must render `<NotFoundState />`.
- Router placement: `main.jsx` renders `<StrictMode><BrowserRouter><App /></BrowserRouter></StrictMode>`; `App.jsx` holds `<Routes>`. Tests wrap components in `<MemoryRouter>`.

## 2. Query params (Gallery only)

| Param | Format | Default | Valid when | Meaning |
|---|---|---|---|---|
| `category` | slug `^[a-z0-9-]{1,32}$` | absent = all photos | format is valid AND the slug exists among the loaded photos' categories | Active category filter |
| `photo` | 24 hex chars | absent = lightbox closed | format is valid AND the photo exists in the currently filtered list | Photo shown in the lightbox |

Rules:

- Invalid or unknown values are ignored (derived state falls back to the default). The URL is not rewritten during render. A `role="status"` message tells the user ("Unknown category, showing all photos." / "Photo not found.").
- History policy: `setCategory` = push, and it removes `photo`; `openPhoto` = push (Back closes the lightbox); `closePhoto` = replace; `replacePhoto` (prev/next) = replace, so Back does not step through every photo.
- `closePhoto` is idempotent: it does nothing when `photo` is already absent (the dialog's `close` event fires after URL-driven closes too).
- Browser Back/Forward must open and close the lightbox correctly because the open state is derived from the URL.

Example: `/gallery?category=evidence&photo=64f1a2b3c4d5e6f7a8b9c0d1`

## 3. Shared components

### AppLayout

| | |
|---|---|
| Props | none |
| State | none |
| Renders | Skip link (`<a href="#main">`), `<header>` with `<nav aria-label="Main">` containing `NavLink` to `/gallery` and `/deck` (`className={({ isActive }) => ...}`), `<main id="main" tabIndex={-1}>` with `<Outlet />` |

### Skeleton

| | |
|---|---|
| Props | `{ variant = 'gallery' }`, `variant`: `'gallery' \| 'deck'` (any other value renders the gallery variant) |
| State | none |
| Renders | `<section className="page" aria-busy="true" aria-live="polite" aria-label="Loading gallery" or "Loading swipe deck">` with a visually hidden `<p>` (the live-region text) and `aria-hidden` placeholder blocks that use the same layout classes as the real page |

#### Layout parity (CLS = 0)

A skeleton and the page it stands in for must occupy exactly the same space. Both use the shared classes in `src/styles/layout.css`. Every height comes from those classes (fixed line heights, aspect ratios, a fixed control height), never from the content.

| Class | Used by | Fixed size |
|---|---|---|
| `page` | page root | grid, `gap: 1rem` |
| `page-title` | `<h1>` / title block | height 2.5rem |
| `page-line` | score and status paragraphs (always rendered, even when empty) | min-height 1.5rem |
| `filter-row` | category filter | height 44px, never wraps (scrolls inside itself) |
| `photo-grid`, `photo-tile`, `photo-tile-media`, `photo-tile-caption` | PhotoGrid | media aspect ratio 3:2, caption 1.5rem on one line (ellipsis) |
| `deck-card` | SwipeCard | width up to 22rem, aspect ratio 3:4, text overlays the image |
| `deck-controls`, `deck-control` | DeckControls | 3 equal columns, height 44px |

Gallery order: title, filter row, status line, grid (the skeleton shows 12 tiles, the seeded photo count). Deck order: title, score line, card, controls, status line.

### NotFoundState

| | |
|---|---|
| Props | `{ title = 'Page not found', message = 'The page you are looking for does not exist.', linkTo = '/gallery', linkLabel = 'Back to gallery' }` |
| State | none |
| Renders | `<section>` with `<h1>{title}</h1>`, `<p>{message}</p>`, `<Link to={linkTo}>` |

## 4. Gallery

### GalleryPage (default export)

| | |
|---|---|
| Props | none |
| Own state | none (URL is the source of truth) |
| Uses | `usePhotos()`, `useGalleryParams()` |
| Derived during render | `categories` (unique, sorted), `visiblePhotos`, `activePhoto`, `activeIndex`, `hasPrev`, `hasNext`, status message |
| Renders | `<section aria-labelledby>` with `<h1>`, `CategoryFilter`, `<p role="status">`, `PhotoGrid`, `Lightbox`; loading shows nothing extra (Suspense covers the lazy chunk, `status === 'loading'` shows the `gallery` Skeleton), error shows `<p role="alert">` |

### CategoryFilter

| | |
|---|---|
| Props | `{ categories, activeCategory, onSelect }`: `categories: string[]`, `activeCategory: string` (`'all'` when none), `onSelect(category: string)` where `'all'` clears the param |
| State | none |
| Renders | `<nav aria-label="Photo categories"><ul><li><button type="button" aria-pressed>` with an "All" entry first |

### PhotoGrid

| | |
|---|---|
| Props | `{ photos, onOpen }`: `photos: Photo[]`, `onOpen(photoId: string)` |
| State | none |
| Renders | `<ul>` (CSS Grid) of `<li key={photo.id}><figure><button type="button" aria-haspopup="dialog"><img alt width height loading /></button><figcaption>` |

### Lightbox

| | |
|---|---|
| Props | `{ photo = null, hasPrev = false, hasNext = false, onClose, onPrev, onNext }`: `photo: Photo \| null` (null = closed) |
| State | none; a `ref` to the `<dialog>` |
| Effects | Open/close effect with deps `[photo]`: open → `dialog.showModal()` if not open; null → `dialog.close()` if open, without a closing cleanup. A second effect with deps `[hasPrev, hasNext]` moves focus from a newly disabled Previous/Next button to the available neighbour. Neither effect installs a global keyboard listener. |
| Events | `onClose` (native `close` event) → `onClose()`; backdrop click (`event.target === event.currentTarget`) → `onClose()`; `keydown` with `event.key` `ArrowLeft`/`ArrowRight` → `onPrev`/`onNext`; Esc handled natively |
| Renders | Native `<dialog aria-labelledby={titleId}>` (`useId()`), `<figure>` with `<img>` and `<figcaption>`, buttons Close / Previous / Next (`type="button"`, prev/next `disabled` when unavailable). Content only rendered when `photo` is not null. Focus returns to the opener on close. |

## 5. Swipe Deck

### DeckPage (default export)

| | |
|---|---|
| Props | none |
| Own state | none |
| Uses | `useSwipePersistence()`, `useDeckKeyboard()` |
| Renders | `<section aria-labelledby>` with `<h1>`, score `<p>`, `SwipeCard` for `currentCard`, `DeckControls`, `<p role="status">` announcing the last action (no `alert()`), `ResultsSummary` when the deck is empty and `status === 'ready'`; loading shows the `deck` Skeleton, error shows `<p role="alert">` |

### SwipeCard

| | |
|---|---|
| Props | `{ card, onSwipe, disabled = false }`: `card: Card`, `onSwipe(direction: 'left' \| 'right')` |
| State (local) | `dragX: number`, `isDragging: boolean` |
| Events | `onPointerDown` (`setPointerCapture`), `onPointerMove`, `onPointerUp`, `onPointerCancel`. On release, if `Math.abs(dragX) >= SWIPE_THRESHOLD_PX` call `onSwipe(dragX > 0 ? 'right' : 'left')`; otherwise reset `dragX` to 0. Cancel always resets. |
| Renders | `<article aria-labelledby>` with `<img>`, `<h2>`, `<p>`; inline `transform` from `dragX`; CSS `touch-action: pan-y`; respects `prefers-reduced-motion` |

### DeckControls

| | |
|---|---|
| Props | `{ canSwipe, canUndo, onSwipe, onUndo }` |
| State | none |
| Renders | `<section aria-label="Deck controls">` with three `type="button"` buttons: Swipe left, Swipe right, Undo (disabled when not allowed). They dispatch the same actions as the keyboard and pointer. |

### DeckStatus

| | |
|---|---|
| Props | `{ message = '' }` |
| State | none |
| Renders | Always-mounted `<p role="status" aria-live="polite" className="page-line">`, including when empty. Normal actions do not use alerts. |

Messages: `Swiped left: <name>.`, `Swiped right: <name>.`, `Undid swipe on <name>.`; exhausted deck uses `No more cards.`. The event-message string is updated in handlers, not effects; score and queue remain derived from history.

### ResultsSummary

| | |
|---|---|
| Props | `{ history, cards, score }`: `history: SwipeEntry[]`, `cards: Card[]`, `score: number` |
| State | none |
| Renders | `<section aria-labelledby>` headed by `<h2>Results</h2>`, then `<dl>` with history-ordered `<Fragment key={entry.cardId}>` pairs: card name / Right or Left. The final pair is Total score / score. Missing card names render Unknown card; the component has no visibility condition or state. |

The owning page renders the summary only when `currentCard === null` and history is nonempty (and persistence is ready once integrated). Defaults are empty history/cards and score 0. Unknown directions defensively render Unknown; label lookup does not read inherited properties. DeckPage integration is implemented in task 6.3.

## 6. Hooks and utilities

| Name | Signature | Returns | Notes |
|---|---|---|---|
| `usePhotos` | `()` | `{ photos, status, error }`, `status`: `'loading' \| 'ready' \| 'error'` | One `GET /api/photos`; `AbortController` in the effect, `return () => controller.abort()`, ignore `AbortError`. Filtering and categories are derived on the client; `?category=` on the API stays available but the client does not use it. |
| `useGalleryParams` | `()` | `{ category, photoId, setCategory, openPhoto, closePhoto, replacePhoto }` | Wraps `useSearchParams()`. Parses by format only (invalid format → `'all'` / `null`); existence is checked in `GalleryPage`. Follows the history policy in section 2. |
| `swipeReducer` | `(state, action)` | new state | Pure. State `{ cards: Card[], history: SwipeEntry[] }`, where `SwipeEntry = { cardId, direction }`. Actions: `{ type: 'hydrate', cards, history }`, `{ type: 'swipe', direction }` (no-op if no card is left), `{ type: 'undo' }` (no-op if history is empty). Never mutates. |
| `useSwipeDeck` | `(initial = null)` | `{ cards, history, queue, currentCard, remaining, score, canUndo, swipe, undo, hydrate }` | `useReducer(swipeReducer, initial ?? initialDeckState)`. Optional initial `{ cards, history }` is read only on mount; rerender does not reset the deck. Derived, not stored: `queue` = cards without a history entry, `currentCard` = `queue[0] ?? null`, `remaining` = `queue.length`, `score` = `calculateScore(history)`, `canUndo` = `history.length > 0`. |
| `useDeckActions` | `(cards)` | `useSwipeDeck` result with event-aware `swipe`, `swipeLeft`, `swipeRight`, `undo`, `message` | Starts with `{ cards, history: [] }` without hydration effects. Successful swipe/undo handlers set the last message; invalid/no-card swipe and empty undo do not replace it. All input consumers use these same wrappers. Finished nonempty history derives `No more cards.`; an initially empty deck stays silent. No API calls or automatic keyboard subscription. |
| `useSwipePersistence` | `()` | `useSwipeDeck` result + `{ status, error, isSyncing, canSwipe, retry }` | On mount loads cards and swipes with one `AbortController` and calls `hydrate`. `swipe` applies optimistically, then `POST /api/swipes`; on failure dispatches `undo` (rollback) and sets `error`. `undo` dispatches `undo`, then `DELETE /api/swipes/last`; on failure re-applies the entry with `swipe` and sets `error`. Input is ignored while `isSyncing`; a synchronous operation ref locks same-render calls and retains the rollback entry. One load effect owns the shared lifetime AbortController for loads and writes; cleanup aborts it. A separate effect updates the latest deck ref, never during render. Only status/error/pendingCount/loadAttempt use local state; retry sets loading and clears error in its event handler, then increments loadAttempt to restart the load effect; isSyncing/canSwipe are derived. Unexpected non-ApiError failures are mapped to a generic ApiError. |
| `useDeckKeyboard` | `({ onSwipe, onUndo, enabled = true })` | nothing | `window` `keydown` listener with cleanup and complete deps. `event.key`: `ArrowLeft` → `onSwipe('left')`, `ArrowRight` → `onSwipe('right')`, `z`/`Z`/`Backspace` → `onUndo()` (`preventDefault` on Backspace). Ignores `event.repeat` and events with ctrl/meta/alt. |
| `calculateScore` | `(history)` | `number` | Rules in API_CONTRACT section 7; constants in SCORE_BY_DIRECTION. |
| `undoStack` | `push(stack, item)`, `pop(stack)`, `peek(stack)` | new stack / `{ stack, item }` / item | Pure and immutable; plain array, last element is the top (same order as `GET /api/swipes`). `pop` on empty returns `{ stack, item: null }`. |
| `api/client.js` | `getPhotos`, `getCards`, `getSwipes`, `createSwipe`, `undoLastSwipe`, each taking `{ signal }` | parsed JSON | Throws `ApiError { status, code, message, details }` parsed from the contract's error shape. Network failures use status 0 / NETWORK_ERROR; malformed JSON uses INTERNAL_ERROR with the HTTP status and a generic message. AbortError is rethrown unchanged during both fetch and response-body parsing. getPhotos optionally accepts category; createSwipe(input, { signal }) validates shared rules before sending. Uses a relative `/api` base (Vite dev proxy to the Express port). |
| `shared/validation.js` | `isValidId`, `isValidDirection`, `isValidCategory`, `DIRECTIONS`, `validateSwipeInput` | see API_CONTRACT section 5 | see API_CONTRACT section 5 |

Constants: `SWIPE_THRESHOLD_PX = 100`.

## 7. State ownership

| State | Owner | Kind |
|---|---|---|
| `category`, `photo` | URL via `useSearchParams()` | Source of truth |
| `photos`, `status`, `error` | `usePhotos` | Local state |
| Deck `{ cards, history }` | `useSwipeDeck` reducer | Local state |
| `status`, `error`, `isSyncing` | `useSwipePersistence` | Local state |
| `dragX`, `isDragging` | `SwipeCard` | Local state |
| `categories`, `visiblePhotos`, `activePhoto`, `hasPrev`, `hasNext`, invalid-param flags, `queue`, `currentCard`, `remaining`, `score`, `canUndo` | computed during render | Derived, never stored |

No Context is needed in Homework 1 (`FormContext` belongs to Sprint 2).

## 8. File layout

```
src/
  main.jsx
  App.jsx
  components/   AppLayout.jsx, Skeleton.jsx, NotFoundState.jsx
  features/gallery/  GalleryPage.jsx, CategoryFilter.jsx, PhotoGrid.jsx, Lightbox.jsx, useGalleryParams.js, usePhotos.js
  features/deck/     DeckPage.jsx, SwipeCard.jsx, DeckControls.jsx, ResultsSummary.jsx,
                     swipeReducer.js, useSwipeDeck.js, useSwipePersistence.js, useDeckKeyboard.js,
                     undoStack.js, calculateScore.js
  api/client.js
shared/
  validation.js
  validation.cases.js
  validation.test.js
server/
```

### Task 6.3 presentation contract

DeckPage is wired to useSwipePersistence in this task. Loading renders the deck Skeleton; failed loads show DeckErrorMessage and a native Try again button calling retry. Ready renders score, current SwipeCard (keyed by card id), controls and status; an empty deck shows No cards available, while exhausted nonempty history shows ResultsSummary. Undo and swipe are disabled during writes. Only finished status says No more cards; normal actions do not use alerts.

DeckErrorMessage({ error = null }) renders nothing without error; otherwise a paragraph with role=alert and a fixed code-based message: NETWORK_ERROR → Connection lost. Your last action was not saved.; ALREADY_SWIPED → That card was already swiped.; CARD_NOT_FOUND → That card no longer exists.; all other codes → Something went wrong. Please try again. No raw server messages or inherited property lookup.

## Section 7 verification contract (2026-11-21)

7.2: verify visible keyboard focus, logical native tab order including skip link/dialog restoration, computed text contrast and pointer target sizes on the production build. Use WCAG 2.2 AA 24px minimum; controls aim for 44px. 7.3: first Gallery image and the active Deck image load eagerly with high priority; other grid images remain lazy, all retain alt and intrinsic dimensions. Decorative Deck SVGs have empty alt because adjacent headings identify the card. Scalable sub-kilobyte SVG assets do not require raster srcset. 7.4: measure document width and inspect Gallery/filter/lightbox/Deck/results at 375–1440px, including keyboard focus and zoom. 7.5: record unmodified Lighthouse mobile default production results for both routes, preserve baseline and reruns, require three 100 scores to mark complete. 7.6: validate post-render DOM snapshots, not only index.html, using the W3C Nu checker; preserve diagnostics and distinguish warnings from errors.
