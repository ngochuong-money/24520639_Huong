# API Contract — Lab 4 Homework 1

Status: v1 (contract-first: change this document BEFORE changing handlers or client code).

## 1. Conventions

- Base path: `/api`. All requests and responses are JSON (`Content-Type: application/json`).
- CORS enabled with `cors()`.
- Config comes from `process.env` (`PORT`, `MONGODB_URI`); nothing is hardcoded.
- IDs are exposed as `id` (string, 24 hex characters, from the Mongo `_id`). `_id` and `__v` are never returned.
- Timestamps are ISO 8601 UTC strings, e.g. `2026-11-19T08:30:00.000Z`.
- Success responses return the resource (object or array) directly, with no envelope.
- The score is NOT stored or served by the API. The client derives it from the swipe history (see section 7).

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
- 200: `Card[]` sorted by id ascending (deck order = seed order; may be empty).
- Errors: 500.

### GET /api/photos

- Query: `category` (optional), slug matching `^[a-z0-9-]{1,32}$`.
- 200: `Photo[]` sorted by id ascending; without `category` returns all photos; a valid slug with no matches returns `[]`.
- Current categories (from seed): evidence, scenes, documents.
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

## 5. Validation rules (client and server must match)

Single source of truth: `shared/validation.js`, a plain ES module with no dependencies, imported by both the client (Vite) and the Express server. Neither side re-implements these rules.

### Shared rules

| Field | Rule | Applies to |
|---|---|---|
| `id` / `cardId` / `photo` param | string, exactly `^[0-9a-f]{24}$` (lowercase hex; no trimming) | POST body, `?photo=` |
| `direction` | string, exactly `"left"` or `"right"` (case-sensitive, no trimming, no normalization) | POST body |
| `category` | string, `^[a-z0-9-]{1,32}$` (empty string is invalid) | `?category=` on both client and server |
| request body | must be a JSON object (not an array, `null`, string or number) | POST body |

Exports of `shared/validation.js`:

| Export | Signature | Behaviour |
|---|---|---|
| `DIRECTIONS` | `readonly ['left', 'right']` | Allowed swipe directions |
| `isValidId` | `(value) => boolean` | `typeof value === 'string'` and matches the id regex |
| `isValidDirection` | `(value) => boolean` | Strict membership in `DIRECTIONS` |
| `isValidCategory` | `(value) => boolean` | `typeof value === 'string'` and matches the slug regex |
| `validateSwipeInput` | `(input) => { field, message }[]` | `[]` means valid. Collects ALL errors, never throws. A non-object input returns one error with `field: "body"`. |

Fixed messages (identical on both sides):

| Field | Message |
|---|---|
| `body` | `Body must be a JSON object.` |
| `cardId` | `Must be a 24-character lowercase hex string.` |
| `direction` | `Must be "left" or "right".` |
| `category` | `Must be 1-32 characters: lowercase letters, digits or hyphens.` |

### Server-only checks (cannot be shared)

Run in this order for `POST /api/swipes`: JSON parse (`INVALID_JSON`) → `validateSwipeInput` (`VALIDATION_ERROR`) → card exists (`CARD_NOT_FOUND`) → card not already in history (`ALREADY_SWIPED`). The server never trusts the client's pre-check.

For `GET /api/photos`, a repeated query key (`?category=a&category=b`) arrives as an array and is invalid (`VALIDATION_ERROR`).

### Client-only behaviour

- Before `POST`, the client calls `validateSwipeInput` (a guard against programming errors; ids come from loaded cards).
- URL params are parsed with the same validators. An invalid `category` or `photo` is ignored and a `role="status"` message is shown (see `docs/INTERFACES.md`). `searchParams.get()` returns the first value for a repeated key.
- Existence checks (category exists among loaded photos, photo exists in the filtered list) are client-only.

### Parity test

One table-driven test file with shared cases (valid and invalid values for each field, including wrong types, uppercase hex, 23/25-char ids, padded strings, `""`, `null`, arrays). The same cases run against `shared/validation.js` (task 5.2/4.7) and against `POST /api/swipes` and `GET /api/photos` (task 2.7).

Shared cases live in `shared/validation.cases.js`. `shared/validation.test.js` runs them against the validation functions in the client test environment; `server/src/routes/createSwipe.test.js` runs the swipe input cases against `POST /api/swipes`. Category endpoint parity cases are added in task 2.7.

## 6. Client behaviour tied to the contract

- Every request is made with an `AbortController` signal; aborted requests are ignored (`AbortError`), not shown as errors.
- Every `fetch` has `.catch` / `try/catch`; error responses are parsed into the `error` shape above.
- If `POST /api/swipes` fails, the optimistic UI update is rolled back.

## 7. Scoring (client-side, derived state)

The score is a pure function of the swipe history. It is never stored on the server, never kept in `useState`, and never synchronised with `useEffect`; it is computed during render (or with `useMemo`). Because it depends only on `history`, undo and a page reload both restore the correct score automatically.

### Constants (provisional: confirm against the original assignment)

| Direction | Points | Meaning |
|---|---|---|
| `right` | +10 | Reward |
| `left` | -5 | Penalty (smaller than the reward, hence asymmetric) |

```js
export const SCORE_BY_DIRECTION = Object.freeze({ right: 10, left: -5 })
```

Location: `src/features/deck/calculateScore.js`.

### Rules

- `calculateScore(history)` = sum of `SCORE_BY_DIRECTION[entry.direction]` over every `entry` in `history`.
- Integers only. No clamping: the score may be negative.
- Order of entries does not affect the result.
- An entry with an unknown direction contributes 0 (defensive; unreachable because the API validates directions).
- The function never mutates `history`.
- Undo removes the last history entry, so the score is `calculateScore(history.slice(0, -1))`.

### Reference cases (used by the tests in task 5.2)

| History (oldest to newest) | Score |
|---|---|
| `[]` | 0 |
| `[right]` | 10 |
| `[left]` | -5 |
| `[right, right]` | 20 |
| `[left, left, left]` | -15 |
| `[right, left, right]` | 15 |
| `[right, left, right]` after one undo | 5 |
| `[right, ???]` where `???` has direction `"up"` | 10 |
