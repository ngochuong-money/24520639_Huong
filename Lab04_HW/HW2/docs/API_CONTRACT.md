# HW2 — API Contract

> Status: **FINAL** — committed before any Sprint 3 handler (Contract-First).
> Server: Express + Mongoose 8 · Client: React 19 via `fetch`

## 1. Conventions

| Item | Rule |
|---|---|
| Base URL | `http://localhost:3001/api` (client calls relative `/api/...`; Vite dev proxy forwards to `:3001`) |
| Format | JSON in and out; `Content-Type: application/json` |
| CORS | `cors({ origin: process.env.CLIENT_ORIGIN })` |
| Body limit | `express.json({ limit: '10kb' })` |
| IDs | `crypto.randomUUID()` stored as `id`; Mongo `_id` and `__v` never exposed |
| Time | `createdAt` = server time, ISO 8601 string |
| Input | Strings are trimmed; **only whitelisted fields are persisted** (no `...req.body` spread) |
| Config | `MONGODB_URI`, `PORT`, `CLIENT_ORIGIN` from `process.env`; nothing hard-coded |

## 2. Error Shape

Every non-2xx response:
```json
{ "error": "Human-readable message.", "fields": { "fieldName": "Field message." } }
```
`fields` appears only on validation errors. Stack traces and internal error text are never returned.

| Status | When | `error` |
|---|---|---|
| 400 | Payload fails shared validation | `Validation failed.` (+ `fields`) |
| 400 | Body is not valid JSON | `Malformed JSON body.` |
| 404 | Unknown player | `Player not found.` |
| 404 | Unknown channel | `Unknown channel.` |
| 404 | Unknown route | `Not found.` |
| 409 | Appeal after the deadline (server clock) | `The appeal window has closed.` |
| 413 | Body larger than 10 kb | `Payload too large.` |
| 500 | Unexpected / database error | `Internal server error.` |

## 3. Endpoints

### `GET /api/health`
`200 { "status": "ok" }`

### `GET /api/time`
`200 { "now": 1795500000000 }` · header `Cache-Control: no-store`

### `GET /api/appeals/:playerId`
- `200` → array of **public** appeals, newest first
- `404` → `Player not found.`
```json
[{ "id": "uuid", "playerId": "himass", "matchId": "VCS-2026-W47-M03", "reason": "false-positive", "statement": "…", "evidenceUrl": "", "createdAt": "2026-11-25T06:00:00.000Z" }]
```
`email` is **not** included.

### `POST /api/appeals`
Request:
```json
{ "playerId": "himass", "matchId": "VCS-2026-W47-M03", "email": "a@b.gg", "confirmEmail": "a@b.gg",
  "reason": "false-positive", "statement": "≥ 30 chars …", "evidenceUrl": "" }
```
Checks, in this order:
1. `playerId` not in seed → **404** `Player not found.`
2. `validateAppeal(body)` (shared) has errors → **400** `Validation failed.` + `fields`
3. Server `Date.now()` ≥ player's `appealDeadline` → **409** `The appeal window has closed.`
4. Persist whitelisted fields (`confirmEmail` is not stored) → **201** full appeal (including `email`, echoed back to its submitter)

### `GET /api/messages/:forum`
- `forum` ∈ `nasa`, `esports-tribunal`, `notNasa` (case-sensitive) else **404** `Unknown channel.`
- `200` → array, oldest first, at most 50 (most recent 50)
```json
[{ "id": "uuid", "forum": "esports-tribunal", "author": "Himass", "text": "…", "createdAt": "…" }]
```

### `POST /api/messages/:forum`
Request: `{ "author": "Himass", "text": "Hello tribunal" }`
1. Unknown `forum` → **404** `Unknown channel.`
2. `validateMessage(body)` (shared) has errors → **400** `Validation failed.` + `fields`
3. Persist → **201** message

## 4. Shared Validation

| File | Rules (exact messages) |
|---|---|
| `shared/validateAppeal.js` | As in `SPRINT2_CONTRACT.md` §1 |
| `shared/validateMessage.js` | `author`: required → `Author is required.`; ≤ 40 → `Author must be at most 40 characters.` · `text`: required → `Message is required.`; ≤ 500 → `Message must be at most 500 characters.` |
| `shared/channels.js` | `export const CHANNELS = ['nasa', 'esports-tribunal', 'notNasa']` |

The client and the server import the same files, so the rules and messages are identical (validation parity).

## 5. Persistence (Mongoose 8)

| Model | Fields | Indexes |
|---|---|---|
| `Appeal` | `id` (unique), `playerId`, `matchId`, `email`, `reason`, `statement`, `evidenceUrl`, `createdAt` | `{ playerId: 1, createdAt: -1 }` |
| `Message` | `id` (unique), `forum`, `author`, `text`, `createdAt` | `{ forum: 1, createdAt: -1 }` |

- Queries use `async/await` + `.exec()`; no callbacks
- `toJSON` transform removes `_id` and `__v`
- Public appeal projection excludes `email`

## 6. Client Usage

| Client code | Endpoint |
|---|---|
| `useAppealSlaTimer` | `GET /api/time` |
| `SimpleForm` | `POST /api/appeals` |
| `AppealHistory` | `GET /api/appeals/:playerId` (refetch after a successful submit) |
| `useForumMessages(forum)` | `GET /api/messages/:forum` (AbortController) + `postMessage()` → `POST` then refetch |

## 7. Test Cases (→ WBS 4.2, supertest + in-memory Mongo)

**Appeals**
1. `POST` valid → 201, has `id` + `createdAt`, has no `_id`/`__v`/`confirmEmail`
2. `POST` unknown player → 404 `Player not found.`
3. `POST` invalid → 400 with `fields` equal to `validateAppeal()` output (parity)
4. `POST` for `tanvuu` (expired) → 409
5. `POST` with extra fields (`id`, `createdAt`, `isAdmin`) → they are ignored
6. `GET` → newest first, no `email`
7. `GET` unknown player → 404

**Messages**
8. `GET` unknown channel → 404 `Unknown channel.`
9. `POST` valid → 201; following `GET` includes it
10. `POST` invalid → 400 with `fields` equal to `validateMessage()` output
11. Channels are isolated (a message in `nasa` is not returned for `notNasa`)

**Robustness**
12. Malformed JSON → 400 `Malformed JSON body.`
13. Unknown route → 404 JSON `Not found.`
14. Database failure → 500 `Internal server error.` with no stack trace
