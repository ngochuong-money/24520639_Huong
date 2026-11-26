# Homework 3 — Gallery Contract

> Slide 30: `PhotoGalleryLayout.jsx` & Native HTML5 `<dialog>` Modal — `useSearchParams` + WCAG 2.2 AA focus management
> Library: `react-router` v7 (declarative: `<BrowserRouter>`, `<Routes>`, `<Route element>`)

## 1. Routes

| Path | Element | Notes |
|---|---|---|
| `/` | `<Navigate to="/gallery" replace />` | |
| `/gallery` | lazy `PhotoGalleryLayout` in `<Suspense fallback={<GallerySkeleton />}>` | Modal state lives in `?photoId=` |
| `*` | `<NotFoundState />` (static import) | Full-page 404 |

Prohibited: `<Switch>`, `<Redirect>`, `exact`, `component=`, `activeClassName`.

## 2. URL State (single source of truth)

| URL | Result |
|---|---|
| `/gallery` | Grid, dialog closed |
| `/gallery?photoId=arena-stage` | Grid + dialog open on Arena Stage (works on first load and after reload) |
| `/gallery?album=x&photoId=arena-stage` | Same; closing keeps `?album=x` |
| `/gallery?photoId=unknown` | Grid, dialog closed, `role="status"` "Photo not found." + link "Show all photos" → `/gallery` |

```js
const [searchParams, setSearchParams] = useSearchParams();
const photoId = searchParams.get('photoId');
const selectedPhoto = photoId ? findPhoto(photoId) : undefined;   // derived — no useState
const isUnknown = photoId !== null && !selectedPhoto;               // derived
```

### Opening
- Each thumbnail is `<Link to={{ search: searchFor(photo.id) }}>` (push → Back closes the modal)
- `searchFor(id)` keeps the other params:
  ```js
  const searchFor = (id) => {
    const next = new URLSearchParams(searchParams);
    next.set('photoId', id);
    return `?${next}`;
  };
  ```

### Closing — `handleClose()` (passed to `<dialog onClose>`)
1. Remember `closingId = photoId`
2. If `searchParams.has('photoId')`: `setSearchParams(prev => { const next = new URLSearchParams(prev); next.delete('photoId'); return next; }, { replace: true })`
   - `replace` → closing does not add a history entry (Back after closing does not reopen)
   - The guard → no redundant navigation when the dialog was closed *because* the URL already lost `photoId` (Back button)
3. Focus the thumbnail of `closingId` (`#thumb-<id>`) → also covers deep-link / reload, where no element was focused before opening

## 3. `<dialog>` Sync Effect (`PhotoDialog`)

This `useEffect` is **legitimate**: it synchronizes React with an external imperative API (the DOM `<dialog>`). It is **not** derived-state syncing (which the project rules forbid).

```js
useEffect(() => {
  const dialog = dialogRef.current;
  if (!dialog) return;
  if (photo && !dialog.open) dialog.showModal();   // guard: showModal() throws if already open
  if (!photo && dialog.open) dialog.close();       // guard: avoid a spurious close event
}, [photo]);
```

- `showModal()` → modal, inert background, focus moves inside, Esc = native `cancel` → `close`
- No custom focus trap and no `keydown` listeners: the native behaviour is used
- The `<dialog>` element is **always rendered** (stable ref); only its content depends on `photo`

## 4. Components

### `PhotoGalleryLayout` (route element, default export, lazy)
- **Renders:** `<main className="page">` → `<h1>Photo Gallery</h1>` → optional not-found status → `<PhotoGrid>` → `<PhotoDialog>`
- Owns `useSearchParams`, `selectedPhoto`, `searchFor`, `handleClose`

### `PhotoGrid`
- **Props:** `{ photos = [], searchFor }`
- **Renders:** `<ul className="photo-grid">` → `<li key={photo.id}>` → `<Link id={`thumb-${photo.id}`} to={{ search: searchFor(photo.id) }} className="photo-card">` → `<img src alt width height loading="lazy" decoding="async">` + `<span className="photo-title">{title}</span>`
- Accessible name of each link = image `alt` + visible title

### `PhotoDialog`
- **Props:** `{ photo, onClose }`
- **Renders:** `<dialog ref aria-labelledby={headingId} onClose={onClose} className="photo-dialog">`
  - when `photo`: `<header>` → `<h2 id={headingId}>{title}</h2>` + `<button type="button" onClick={() => dialogRef.current.close()}>Close photo</button>` → `<figure>` → `<img alt width height>` + `<figcaption>{credit}</figcaption>`
- The close button calls the **native** `close()` → one code path for button, Esc and Back
- The close button is the first focusable element → it receives focus on open

### `GallerySkeleton`
- **Props:** none (renders `photos.length` tiles)
- **Renders:** `<main className="page" aria-busy="true" aria-live="polite">` → visually hidden "Loading gallery…" → `<h1>` placeholder → `<ul className="photo-grid">` with `aria-hidden` tiles sharing `.photo-card` sizing (CLS = 0)

### `NotFoundState`
- **Props:** `{ title = 'Page not found', message = 'The requested page does not exist.' }`
- **Renders:** `<main className="page">` → `<section role="alert">` → `<h1>404 — {title}</h1>` → `<p>` → `<Link to="/gallery">Back to gallery</Link>`

## 5. Accessibility Checklist
- One `<h1>` per page; dialog title is `<h2>`
- Visible `:focus-visible` on links and buttons
- `::backdrop` dims the page; dialog fits 375 px (`width: min(90vw, 60rem)`, image `max-height: 70vh`, `object-fit: contain`)
- Images always have `width`/`height` → no layout shift
- No `dangerouslySetInnerHTML`, no `window.alert`, no index keys

## 6. Test Cases (→ WBS 2.1)

Rendered with `MemoryRouter` + a `LocationProbe` that prints `location.search`.

1. `/` redirects to `/gallery`; one link per photo; every image has its `alt`
2. Clicking a thumbnail → `?photoId=<id>`; dialog `open`; dialog name = photo title
3. Deep link `?photoId=<id>` → dialog open on first render
4. "Close photo" → `photoId` removed, dialog closed, focus on `#thumb-<id>`
5. Native `close` event (Esc path) → `photoId` removed
6. `?album=x&photoId=<id>` → link keeps `album`; closing leaves `?album=x`
7. Unknown `photoId` → dialog closed, "Photo not found." status, "Show all photos" link
8. URL loses `photoId` (Back) → dialog closes without an extra navigation
9. Dialog has `aria-labelledby` → its `<h2>`; close button has `type="button"`
10. Skeleton has `aria-busy="true"` + `aria-live="polite"`
11. Unknown route → 404 page
