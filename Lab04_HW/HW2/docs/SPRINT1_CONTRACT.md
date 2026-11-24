# Sprint 1 — Routing Contract

> Requirement #1: Multi-Route Dossier Navigation via `/dossier/:playerID`
> Library: `react-router` v7 (declarative mode: `<BrowserRouter>`, `<Routes>`, `<Route element>`)

## 1. Route Table

| Path | Element | Layout | Purpose |
|---|---|---|---|
| `/` | `<Navigate to="/dossier" replace />` | — | Redirect to the case list |
| `/dossier` | `<PeopleLayout />` | root of nested routes | Sidebar + `<Outlet />` |
| `/dossier` *(index)* | `<SelectCase />` | inside `PeopleLayout` | "Select a case" prompt |
| `/dossier/:playerID` | `<PersonDetail />` | inside `PeopleLayout` | Case file + nested `<Outlet />` |
| `/dossier/:playerID/appeal` | `<AppealPage />` | inside `PersonDetail` | Appeal form (Sprint 2) |
| `*` | `<NotFoundState />` | — | Unknown top-level URL |

```jsx
<Routes>
  <Route path="/" element={<Navigate to="/dossier" replace />} />
  <Route path="/dossier" element={<PeopleLayout />}>
    <Route index element={<SelectCase />} />
    <Route path=":playerID" element={<PersonDetail />}>
      <Route path="appeal" element={<AppealPage />} />
    </Route>
  </Route>
  <Route path="*" element={<NotFoundState />} />
</Routes>
```

- The param name is exactly `playerID` (case-sensitive), read with `useParams()`.
- Prohibited: `<Switch>`, `<Redirect>`, `exact`, `component=`, `activeClassName`.

## 2. Component Contracts

### `PeopleLayout`
- **Props:** `{ players = [] }`
- **Renders:** `<nav aria-label="Player dossiers">` → `<ul>` → `<li>` → `NavLink to={`/dossier/${p.id}`}` (key = `p.id`); `<main>` → `<Outlet />`
- **Active state:** `className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}`; NavLink sets `aria-current="page"` automatically

### `SelectCase`
- **Props:** none
- **Renders:** `<section>` with `<h2>Select a case</h2>` and short guidance text

### `PersonDetail`
- **Props:** `{ players = [] }`
- **Logic:** `const { playerID } = useParams();` → `players.find((p) => p.id === playerID)`
- **Found:** `<article aria-labelledby>` → `<h2>{name}</h2>` → `<dl>` (Team, Role, Violation, Match ID, Sanction, Appeal Deadline as `<time dateTime>`) → `<Link to="appeal">File an appeal</Link>` → `<Outlet />`
- **Not found:** returns `<NotFoundState message={`No dossier for "${playerID}"`} />`, and the sidebar stays visible because it is rendered inside the layout

### `NotFoundState`
- **Props:** `{ title = 'Dossier not found', message = 'The requested page does not exist.' }`
- **Renders:** `<section role="alert">` → `<h2>404 — {title}</h2>` → `<p>{message}</p>` → `<Link to="/dossier">Back to case list</Link>`

### `Skeleton`
- **Props:** `{ lines = 6 }`
- **Renders:** `<section aria-busy="true" aria-live="polite">` with a visually hidden "Loading dossier…" label; same dimensions as the `PersonDetail` card (CLS = 0)

### `AppealPage` (Sprint 1 placeholder)
- **Renders:** `<section aria-labelledby>` → `<h3>File an appeal</h3>` → placeholder text (replaced by `SimpleForm` in Sprint 2)

## 3. Lazy Loading
- `PersonDetail`, `AppealPage` → `React.lazy(() => import(...))`
- `NotFoundState` stays static (also imported directly by `PersonDetail`; mixing static + dynamic imports prevents code-splitting)
- `<Suspense fallback={<Skeleton />}>` wraps `<Outlet />` in `PeopleLayout`
- `<Suspense fallback={<Skeleton variant="appeal" />}>` wraps `<Outlet />` in `PersonDetail` so loading the appeal chunk does not blank the dossier

## 4. States & Expected Behaviour

| URL | Expected result |
|---|---|
| `/` | Redirects to `/dossier` (no history entry) |
| `/dossier` | Sidebar + "Select a case" |
| `/dossier/himass` | Sidebar (Himass active) + Himass case file |
| `/dossier/tanvuu` | Sidebar (TanVuu active) + TanVuu case file |
| `/dossier/unknown` | Sidebar + 404 inside `<main>` |
| `/dossier/himass/appeal` | Case file + appeal placeholder below |
| `/random` | Full-page 404 |

## 5. Accessibility
- One `<h1>` (app title in the header); `<h2>` per page section
- Landmarks: `<header>`, `<nav>`, `<main>`
- All links are reachable by keyboard and have a visible `:focus-visible` style

## 6. Test Cases (→ WBS 1.2)
1. `/` redirects to `/dossier` and shows "Select a case"
2. `/dossier/himass` renders the heading "Himass" and the `<dl>` values
3. The active NavLink has `aria-current="page"`; the others do not
4. `/dossier/unknown` renders 404, and the sidebar nav is still present
5. `/dossier/himass/appeal` renders both the case file and the appeal outlet
6. `/random` renders the full-page 404
