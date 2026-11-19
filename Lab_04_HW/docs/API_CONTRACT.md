# API Contract — Lab 4 Homework 1

Status: v1 (contract-first: change this document BEFORE changing handlers or client code).

## 1. Conventions

- Base path: `/api`. All requests and responses are JSON (`Content-Type: application/json`).
- CORS enabled with `cors()`.
- Config comes from `process.env` (`PORT`, `MONGODB_URI`); nothing is hardcoded.
- IDs are exposed as `id` (string, 24 hex characters, from the Mongo `_id`). `_id` and `__v` are never returned.
- Timestamps are ISO 8601 UTC strings, e.g. `2026-11-19T08:30:00.000Z`.
- Success responses return the resource (object or array) directly, with no envelope.
- The score is NOT stored or served by the API. The client derives it from the swipe history (see task 1.3 for the scoring rules).

## 2. Resource schemas

### Photo (gallery)

| Field | Type | Notes |
|---|---|---|
| `id` | string | 24 hex chars |
| `title` | string | 1–120 chars |
| `alt` | string | 1–250 chars, meaningful text for screen readers |
| `category` | string | slug, `^[a-z0-9-]{1,32}$` |
| `src` | string | relative path or `https://` URL |
| `width` | number | pixels, > 0 |
| `height` | number | pixels, > 0 |

### Card (swipe deck) — provisional

Open item: confirm with the assignment whether cards are the same data as photos. Until confirmed, cards are a separate collection.

| Field | Type | Notes |
|---|---|---|
| `id` | string | 24 hex chars |
| `name` | string | 1–80 chars |
| `bio` | string | 0–280 chars |
| `imageUrl` | string | relative path or `https://` URL |

### Swipe

| Field | Type | Notes |
|---|---|---|
| `id` | string | 24 hex chars |
| `cardId` | string | 24 hex chars, must reference an existing Card |
| `direction` | string | `"left"` or `"right"` |
| `createdAt` | string | ISO 8601 UTC, set by the server |

Ordering rule: the history is a LIFO stack. "Last" means the swipe with the greatest `createdAt`; ties are broken by the greatest `id`.

## 3. Endpoints

### GET /api/cards

- Request: no body, no query.
- 200: `Card[]` in deck order (may be empty).
- Errors: 500.

### GET /api/photos

- Query: `category` (optional), slug matching `^[a-z0-9-]{1,32}$`.
- 200: `Photo[]`; without `category` returns all photos; a valid slug with no matches returns `[]`.
- 400 `VALIDATION_ERROR`: `category` has an invalid format.
- Errors: 500.
- Note: `?photo=` deep links are resolved on the client against this list; there is no `GET /api/photos/:id`.

### GET /api/swipes

- Request: no body, no query.
- 200: `Swipe[]` ordered oldest to newest (the last element is the top of the undo stack); `[]` if empty.
- Errors: 500.

### POST /api/swipes

- Body:

```json
{ "cardId": "64f1a2b3c4d5e6f7a8b9c0d1", "direction": "right" }
```

- 201: the created `Swipe`.

```json
{
  "id": "64f1a2b3c4d5e6f7a8b9c0e2",
  "cardId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "direction": "right",
  "createdAt": "2026-11-19T08:30:00.000Z"
}
```

- 400 `INVALID_JSON`: body is not valid JSON.
- 400 `VALIDATION_ERROR`: `cardId` missing or not 24 hex chars; `direction` missing or not `"left"`/`"right"`. Extra fields are ignored and never persisted.
- 404 `CARD_NOT_FOUND`: `cardId` is valid but no such card exists.
- 409 `ALREADY_SWIPED`: the card is already in the history (it must be undone before it can be swiped again).
- Errors: 500.

### DELETE /api/swipes/last

- Request: no body.
- 200: the removed `Swipe` (the new top of the stack is the previous element of `GET /api/swipes`).
- 404 `HISTORY_EMPTY`: there is no swipe to undo.
- Errors: 500.

## 4. Error format

Every error response uses the same shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": [{ "field": "direction", "message": "Must be \"left\" or \"right\"." }]
  }
}
```

- `code`: stable machine-readable string. `message`: short human-readable text.
- `details`: optional, only for `VALIDATION_ERROR`.
- Never include stack traces, Mongoose internals or file paths. Unexpected errors return `500 INTERNAL_ERROR` with the generic message `"Something went wrong."`.
- Unknown routes return `404 ROUTE_NOT_FOUND`.

### Status code summary

| Status | Codes | Used by |
|---|---|---|
| 200 | — | all GET, DELETE |
| 201 | — | POST /api/swipes |
| 400 | `INVALID_JSON`, `VALIDATION_ERROR` | GET /api/photos, POST /api/swipes |
| 404 | `CARD_NOT_FOUND`, `HISTORY_EMPTY`, `ROUTE_NOT_FOUND` | POST, DELETE, unknown routes |
| 409 | `ALREADY_SWIPED` | POST /api/swipes |
| 500 | `INTERNAL_ERROR` | any |

## 5. Validation parity (client and server must match)

| Field | Rule | Error |
|---|---|---|
| `cardId` | required, string, `^[0-9a-f]{24}$` | `VALIDATION_ERROR` |
| `direction` | required, exactly `"left"` or `"right"` | `VALIDATION_ERROR` |
| `category` (query) | optional, `^[a-z0-9-]{1,32}$` | `VALIDATION_ERROR` |

The client shares these rules through one constants/validators module; the server re-validates every POST and never trusts the client.

## 6. Client behaviour tied to the contract

- Every request is made with an `AbortController` signal; aborted requests are ignored (`AbortError`), not shown as errors.
- Every `fetch` has `.catch` / `try/catch`; error responses are parsed into the `error` shape above.
- If `POST /api/swipes` fails, the optimistic UI update is rolled back.