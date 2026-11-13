# API Contract: Forum Messages

Base URL: `http://localhost:3000` (default; configurable via `PORT`).

Allowed `channelId` values (case-sensitive): `nasa`, `esports-tribunal`, `notNasa`.

This document defines the API before handler implementation.

## Message response shape

Every message contains:

| Field | Type | Meaning |
|---|---|---|
| `id` | string | Database-generated message identifier |
| `channelId` | string | One of the allowed channel IDs |
| `author` | string | Trimmed author name |
| `text` | string | Trimmed message text |
| `createdAt` | string | Server-generated timestamp in UTC ISO 8601 format |

Map MongoDB `_id` to `id` in the Mongoose `toJSON` transform. Do not expose `_id` or `__v` in API responses.

## GET /api/channels/:channelId/messages

Returns all messages in the channel, oldest first (`createdAt` ascending, then `_id` ascending to break ties).

### Success: 200 OK

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

An empty channel returns `[]`, not 404.

### Errors

| Status | When | Body |
|---|---|---|
| 400 | `channelId` is not allowed | `{ "error": "Unknown channel" }` |
| 500 | Database/server failure | `{ "error": "Internal server error" }` |

## POST /api/channels/:channelId/messages

Creates a message in the channel.

### Request body (JSON)

Content-Type: `application/json` (an optional charset parameter is accepted).

The body must be a JSON object.

| Field | Type | Rules |
|---|---|---|
| `author` | string | Required, trimmed, 2–50 characters |
| `text` | string | Required, trimmed, 1–500 characters |

`channelId` comes from the URL, never from the body. Extra fields are ignored, including client-supplied `id`, `channelId`, and `createdAt`.

Missing, null, empty, and whitespace-only required values are invalid. Non-string values are rejected without coercion. Trim strings before checking lengths and storing them.

Validation reports all invalid fields in `details`. Each field receives one message, in this order of precedence:

| Condition | Message |
|---|---|
| Missing, null, or empty after trimming | `Required` |
| Non-string value | `Must be a string` |
| Shorter than minimum | `At least N characters` |
| Longer than maximum | `At most N characters` |

`N` is the applicable limit for that field.

### Success: 201 Created

Returns the created message with the same shape as a GET item. The server generates `id` and `createdAt`.

### Errors

| Status | When | Body |
|---|---|---|
| 400 | `channelId` is not allowed | `{ "error": "Unknown channel" }` |
| 400 | Malformed JSON or body is not an object | `{ "error": "Invalid JSON body" }` |
| 400 | Field validation fails | `{ "error": "Validation failed", "details": { "author": "Required" } }` |
| 415 | Content-Type is not JSON | `{ "error": "Content-Type must be application/json" }` |
| 500 | Database/server failure | `{ "error": "Internal server error" }` |

For requests with multiple problems, check the channel first, then Content-Type, JSON body, and field validation.

## Implementation rules

- Validation rules and messages for the forum's `author` and `text` inputs must match between client and server, including trimming and length limits (validation parity).
- The existing Sprint 2 Name/Email form is separate from the forum form. Add tests before extending shared validation with `maxLength` or changing trimming behavior.
- Responses use JSON and never leak stack traces, database errors, or connection strings.
- Every handler uses async/await with try/catch; Mongoose queries use `.exec()`.
- Configuration comes from `process.env`: `MONGODB_URI` is required; `PORT` defaults to `3000`.
- Secrets stay in the ignored `server/.env`; only placeholder configuration belongs in `server/.env.example`.
- Enable CORS with `cors()`.
- This contract does not implement handlers or change existing dependencies.
