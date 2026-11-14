# API Contract: Forum Messages

Base URL: `http://localhost:3000`
Channels (allowed `channelId`): `nasa`, `esports-tribunal`, `notNasa`

## GET /api/channels/:channelId/messages

Returns all messages in a channel, oldest first.

**Success: 200 OK**
```json
[
  {
    "id": "665f1c2e9b1e8a0012a4c111",
    "channelId": "nasa",
    "author": "Huong",
    "text": "Hello channel",
    "createdAt": "2026-11-13T14:00:00.000Z"
  }
]
```
Empty channel returns `[]` (not 404).

**Errors**
| Status | When | Body |
|---|---|---|
| 400 | `channelId` not in the allowed list | `{ "error": "Unknown channel" }` |
| 500 | Database/server failure | `{ "error": "Internal server error" }` |

## POST /api/channels/:channelId/messages

Creates a message in a channel.

**Request body (JSON)**
| Field | Type | Rules |
|---|---|---|
| `author` | string | required, trimmed, 2-50 chars |
| `text` | string | required, trimmed, 1-500 chars |

`channelId` comes from the URL, never from the body. Extra fields are ignored.

**Validation parity**
Client and server use `shared/messageRules.json` and the same `validateMessage` function in `shared/messageValidation.js`. Both sides trim strings before checking length and return the same field messages:

| Field | Rule | Message |
|---|---|---|
| `author` | required, trim, 2-50 | `Required` / `Must be 2-50 characters` |
| `text` | required, trim, 1-500 | `Required` / `Must be at most 500 characters` |

Non-string fields are rejected with `Required`. Missing or non-object bodies (including `null` and arrays) return 400 `Validation failed` with both fields marked `Required`. All field errors are reported together in `details`. The returned value contains only trimmed `author` and `text`.

**Success: 201 Created**: returns the created message (same shape as GET item).

**Errors**
| Status | When | Body |
|---|---|---|
| 400 | `channelId` not allowed | `{ "error": "Unknown channel" }` |
| 400 | Validation fails | `{ "error": "Validation failed", "details": { "author": "Required" } }` |
| 415 | Content-Type is not JSON | `{ "error": "Content-Type must be application/json" }` |
| 500 | Database/server failure | `{ "error": "Internal server error" }` |

## Rules
- Validation rules for `author`/`text` must match the client form rules (validation parity).
- Responses never leak stack traces.
- Every handler uses async/await with try/catch.
- Config via `process.env` (`MONGODB_URI`, `PORT`), CORS enabled with `cors()`.
## Error precedence
For requests with multiple problems, check in this order:
1. `channelId` not allowed → 400 `Unknown channel`
2. Content-Type is not JSON → 415
3. Body is not valid JSON → 400
4. Field validation fails → 400 `Validation failed`

## Notes
- `id` in responses maps from Mongoose `_id` (use a `toJSON` transform).
- `MONGODB_URI` is required; `PORT` defaults to `3000`.
- Mongoose queries use `.exec()`.
