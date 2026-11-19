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
| Props | `{ variant = 'gallery' }`, `variant`: `'gallery' \| 'deck'` |
| State | none |
| Renders | `<section aria-busy="true" aria-live="polite" aria-label="Loading">` with fixed dimensions equal to the final content for that variant |

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
| Effects | One `useEffect` with deps `[photo]`: open → `dialog.showModal()` if not open; null → `dialog.close()` if open. No cleanup side effects beyond that. |
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

### ResultsSummary

| | |
|---|---|
| Props | `{ history, cards, score }`: `history: SwipeEntry[]`, `cards: Card[]`, `score: number` |
| State | none |
| Renders | `<section aria-labelledby>` with `<dl>` of `<Fragment key={entry.cardId}><dt>{card name}</dt><dd>{direction}</dd></Fragment>` and the total score |

## 6. Hooks and utilities

| Name | Signature | Returns | Notes |
|---|---|---|---|
| `usePhotos` | `()` | `{ photos, status, error }`, `status`: `'loading' \| 'ready' \| 'error'` | One `GET /api/photos`; `AbortController` in the effect, `return () => controller.abort()`, ignore `AbortError`. Filtering and categories are derived on the client; `?category=` on the API stays available but the client does not use it. |
| `useGalleryParams` | `()` | `{ category, photoId, setCategory, openPhoto, closePhoto, replacePhoto }` | Wraps `useSearchParams()`. Parses by format only (invalid format → `'all'` / `null`); existence is checked in `GalleryPage`. Follows the history policy in section 2. |
| `swipeReducer` | `(state, action)` | new state | Pure. State `{ cards: Card[], history: SwipeEntry[] }`, where `SwipeEntry = { cardId, direction }`. Actions: `{ type: 'hydrate', cards, history }`, `{ type: 'swipe', direction }` (no-op if no card is left), `{ type: 'undo' }` (no-op if history is empty). Never mutates. |
| `useSwipeDeck` | `()` | `{ cards, history, currentCard, remaining, score, canUndo, swipe, undo, hydrate }` | `useReducer(swipeReducer)`. Derived, not stored: `queue` = cards without a history entry, `currentCard` = `queue[0] ?? null`, `remaining` = `queue.length`, `score` = `calculateScore(history)`, `canUndo` = `history.length > 0`. |
| `useSwipePersistence` | `()` | `useSwipeDeck` result + `{ status, error, isSyncing, canSwipe }` | On mount loads cards and swipes with one `AbortController` and calls `hydrate`. `swipe` applies optimistically, then `POST /api/swipes`; on failure dispatches `undo` (rollback) and sets `error`. `undo` dispatches `undo`, then `DELETE /api/swipes/last`; on failure re-applies the entry with `swipe` and sets `error`. Input is ignored while `isSyncing` (provisional, keeps requests ordered). |
| `useDeckKeyboard` | `({ onSwipe, onUndo, enabled = true })` | nothing | `window` `keydown` listener with cleanup and complete deps. `event.key`: `ArrowLeft` → `onSwipe('left')`, `ArrowRight` → `onSwipe('right')`, `z`/`Z`/`Backspace` → `onUndo()` (`preventDefault` on Backspace). Ignores `event.repeat` and events with ctrl/meta/alt. |
| `calculateScore` | `(history)` | `number` | Pure. Rules are defined in task 1.3; if scoring needs card data, the signature changes here first. |
| `undoStack` | `push(stack, item)`, `pop(stack)`, `peek(stack)` | new stack / `{ stack, item }` / item | Pure and immutable; plain array, last element is the top (same order as `GET /api/swipes`). `pop` on empty returns `{ stack, item: null }`. |
| `api/client.js` | `getPhotos`, `getCards`, `getSwipes`, `createSwipe`, `undoLastSwipe`, each taking `{ signal }` | parsed JSON | Throws `ApiError { status, code, message, details }` parsed from the contract's error shape. Uses a relative `/api` base (Vite dev proxy to the Express port). |
| `lib/validation.js` | `isValidId`, `isValidDirection`, `isValidCategory`, `DIRECTIONS` | boolean / array | Shared rules from the contract's parity table. |

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
  lib/validation.js
```