# HW2 — API Contract

> Status: DRAFT — finalized in WBS 4.1 before any handler is written.

## Base URL
`http://localhost:3001/api`

## Error Shape
```json
{ "error": "string", "fields": { "fieldName": "message" } }
```
Stack traces are never returned.

## Endpoints

| Method | Route | Success | Errors |
|---|---|---|---|
| GET | `/health` | 200 `{ status }` | — |
| GET | `/time` | 200 `{ now }` | — |
| GET | `/appeals/:playerId` | 200 `[appeal]` | 404 |
| POST | `/appeals` | 201 `appeal` | 400, 404, 409 |
| GET | `/messages/:forum` | 200 `[message]` | 404 |
| POST | `/messages/:forum` | 201 `message` | 400, 404 |

## Payload Schemas
_TBD in 4.1_
