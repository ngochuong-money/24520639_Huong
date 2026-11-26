# HW4 — API Contract

> Status: **FINAL** — committed before any Sprint A handler (Contract-First).
> Server: Express + Mongoose 8 · Single demo user (no authentication in scope)

## 1. Conventions

| Item | Rule |
|---|---|
| Base URL | `http://localhost:3001/api` (client calls relative `/api/...` through the Vite proxy) |
| Format | JSON; `express.json({ limit: '10kb' })` |
| CORS | `cors({ origin: process.env.CLIENT_ORIGIN })` |
| Config | `MONGODB_URI` required (server exits with code 1 if missing); `PORT`, `CLIENT_ORIGIN` optional |
| Mongoose | v8, `async/await` + `.exec()`, no callbacks, no `useNewUrlParser`/`useUnifiedTopology` |
| IDs | Swipes: `crypto.randomUUID()` as `id`; Profiles: slug `id` from the seed. Mongo `_id`/`__v` never exposed |
| `.lean()` reads | Must `.select('-_id -__v')`, because `.lean()` bypasses `toJSON` transforms |
| Input | Strings trimmed; **only whitelisted fields persisted** (no `...req.body`) |
| Validation | `shared/swipeRules.js → validateSwipe()`, the same file the client uses (parity) |

## 2. Error Shape

```json
{ "error": "Human-readable message.", "fields": { "field": "Field message." } }
```
`fields` only on validation errors. Stack traces and raw `err.message` are never returned (logged server-side only).

| Status | When | `error` |
|---|---|---|
| 400 | `validateSwipe` fails | `Validation failed.` + `fields` |
| 400 | Malformed JSON | `Malformed JSON body.` |
| 404 | Unknown profile | `Profile not found.` |
| 404 | Unknown swipe id | `Swipe not found.` |
| 404 | Unknown route | `Not found.` |
| 409 | Profile already swiped (pre-check **or** duplicate-key `E11000`) | `Profile already swiped.` |
| 413 | Body > 10 kb | `Payload too large.` |
| 500 | Anything else | `Internal server error.` |

## 3. Endpoints

### `GET /api/health`
`200 { "status": "ok" }`

### `GET /api/time`
`200 { "now": <epoch ms> }` · `Cache-Control: no-store` (used by `useAppealSlaTimer`)

### `GET /api/profiles`
`200` → array sorted by `order` ascending — `Profile.find().sort({ order: 1 }).select('-_id -__v').lean().exec()`
```json
[{ "id": "linh-nguyen", "order": 0, "name": "Linh", "age": 24, "city": "Ho Chi Minh City",
   "bio": "…", "interests": ["MOBA"], "avatar": "/avatars/linh-nguyen.svg", "avatarAlt": "…" }]
```

### `GET /api/swipes`
`200` → array sorted by `createdAt` ascending (oldest first, so the client can rebuild the LIFO stack)
```json
[{ "id": "uuid", "profileId": "linh-nguyen", "direction": "right", "createdAt": "2026-11-26T05:00:00.000Z" }]
```

### `POST /api/swipes`
Request: `{ "profileId": "linh-nguyen", "direction": "right" }`

Checks, in order:
1. `validateSwipe(body)` has errors → **400** `Validation failed.` + `fields`
2. Profile does not exist → **404** `Profile not found.`
3. A swipe for this profile exists → **409** `Profile already swiped.` (a duplicate-key error on insert also maps to 409)
4. Persist `{ profileId, direction }` → **201** swipe

### `DELETE /api/swipes/:id`
`204` (empty body) · unknown id → **404** `Swipe not found.`

### `DELETE /api/swipes`
`204` — removes every swipe ("Start over")

## 4. Shared Validation (`shared/swipeRules.js`)

| Field | Rule | Message |
|---|---|---|
| `profileId` | non-empty string | `Profile is required.` |
| `profileId` | in `profileIds` (only when the option is passed) | `Unknown profile.` |
| `direction` | one of `left`, `right`, `up` | `Direction must be left, right or up.` |

The server calls `validateSwipe(body)` **without** `profileIds` (existence is a 404, not a 400).

## 5. Persistence

| Model | Fields | Indexes |
|---|---|---|
| `Profile` | `id` (unique), `order`, `name`, `age`, `city`, `bio`, `interests[]`, `avatar`, `avatarAlt` | `{ order: 1 }` |
| `Swipe` | `id` (unique, UUID), `profileId` (**unique**), `direction` (enum), `createdAt` | `{ createdAt: 1 }` |

- `toJSON` transform removes `_id`/`__v` on documents (create responses)
- Seed: `npm.cmd run seed` → `server/seed/seed.js` upserts `profiles.data.js` by `id` with `order` = array index (idempotent)

## 6. Client Usage

| Client code | Endpoint |
|---|---|
| `useSwipeDeck` load | `GET /api/profiles`, `GET /api/swipes` (AbortController) |
| `swipe()` | `POST /api/swipes` |
| `undo()` | `DELETE /api/swipes/:id` |
| `reset()` | `DELETE /api/swipes` |
| `useAppealSlaTimer` | `GET /api/time` |

## 7. Test Cases (→ WBS 2.1, supertest + in-memory Mongo)

1. `GET /api/profiles` → sorted by `order`, no `_id`/`__v`
2. `GET /api/swipes` → oldest first, no `_id`/`__v`
3. `POST` valid → 201 with UUID `id` + `createdAt`
4. `POST` invalid → 400, `fields` equal to `validateSwipe(body)` (parity)
5. `POST` unknown profile → 404
6. `POST` same profile twice → 409
7. `POST` extra fields (`id`, `createdAt`, `score`) → ignored
8. `DELETE /api/swipes/:id` → 204, then the profile can be swiped again; unknown id → 404
9. `DELETE /api/swipes` → 204, list empty
10. `GET /api/time` → current ms, `no-store`
11. Malformed JSON → 400; body > 10 kb → 413; unknown route → 404 JSON
12. DB failure → 500 `Internal server error.` without leaking the error text
