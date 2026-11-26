# Sprint 3 — Network cancellation and full-stack error log

Date: 14/11/2026. All times below use Asia/Saigon (UTC+7).

## Setup

- Backend: `node index.js` in `server/`, port 3000, connected to the existing MongoDB instance.
- Frontend: `npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort`.
- Page: `http://127.0.0.1:5173/forum`. Vite proxies `/api` to `http://localhost:3000`.
- Added/ensured two sample messages per channel: `Hello <channel>` and `Second message <channel>`, author `Huong`. IDs are recorded in [seeded-messages.json](evidence/seeded-messages.json).
- Chrome 157.0.8103.51 was driven with Playwright using the real DevTools frontend. Screenshots are actual browser/DevTools captures.
- `server/index.js` previously connected to MongoDB without calling `listen()`. It now starts `createApp()` after the connection succeeds and handles HTTP startup errors.

## Slow 3G and cancellation

Chrome labels the preset **3G** in this version. The recorded run used 2000 ms latency and 50,000 bytes/s download/upload through Chrome DevTools Protocol. **Keep log** was enabled, and big request rows show channel paths.

After the initial `nasa` messages loaded, clicked every approximately 250 ms:

`esports-tribunal → notNasa → nasa → esports-tribunal → notNasa → nasa`

| Run | Time | Canceled | Completed | Result |
|---|---|---|---|---|
| Original hook | 08:50:50 | 5 | 1 × 200 | Only final `nasa` request completed; UI showed `Hello nasa` |
| Control without cleanup | 08:51:01 | 0 | 6 × 200 | All requests completed, demonstrating the effect of missing abort |

Both runs had no Console errors/warnings, `AbortError`, or unhandled page errors. The control run replaced only the served hook module in an isolated browser context, changing cleanup to a no-op. The source file on disk was never changed; the context was closed afterward. The control did not demonstrate a stale-response overwrite, only missing cancellation.

Evidence:

- [Original hook — Network screenshot](evidence/with-abort-network.png), [request events and Console](evidence/with-abort-requests.json), [HAR](evidence/with-abort.har), [final UI](evidence/with-abort-forum.png).
- [Control — Network screenshot](evidence/without-abort-control-network.png), [request events and Console](evidence/without-abort-control-requests.json), [HAR](evidence/without-abort-control.har), [final UI](evidence/without-abort-control-forum.png).
- HAR files retain only forum API requests; unrelated Vite assets were removed.

## Error cases

| Case | Time | Command/action | Backend terminal | Client Console and UI | Conclusion |
|---|---|---|---|---|---|
| Backend stopped | 08:52:50–08:52:51 | Stop `node index.js`, then click `notNasa` on an already loaded Forum page | Backend stopped; Vite terminal reported proxy `ECONNREFUSED` | Browser resource error 502 plus exactly one hook log `Error: HTTP 502`; UI: `Could not load messages: HTTP 502`; no unhandled promise or AbortError | Error is caught and displayed. With the configured Vite proxy, this is HTTP 502 rather than direct-fetch `Failed to fetch` |
| Unknown channel | 08:48:07 direct / 08:52:38 browser | `GET /api/channels/foo/messages` | No additional backend output | 400 resource error; JSON `{ "error": "Unknown channel" }`; browser fetch handled the response | Correct 400 response |
| Malformed JSON | 08:48:07 direct / 08:52:38 browser | POST `/api/channels/nasa/messages`, Content-Type JSON, body `{abc` | No additional backend output; handled by error middleware | 400 resource error; JSON `{ "error": "Invalid JSON" }`; no unhandled promise | Correct JSON error response |
| Database stopped | 08:50:10–08:50:42 | Start an isolated real MongoDB on 27018 and the same backend on 3001; confirm GET 200, terminate that mongod, then browser-fetch GET | `GET messages failed: connect ECONNREFUSED 127.0.0.1:27018` | Browser reported resource 500; JSON `{ "error": "Internal server error" }`; no stack in response | Subsequent GET to `foo` returned 400 from the same backend; process remained running |
| Missing text | 08:48:07 direct / 08:52:38 browser | POST JSON `{ "author": "Huong" }` to `/api/channels/nasa/messages` | No additional backend output | 400 resource error; JSON `{ "error": "Validation failed", "details": { "text": "Required" } }` | Correct validation response |

The attempt to stop the Windows MongoDB service failed because the current OS account could not control the service. The DB-down test therefore stopped an actual, isolated mongod owned by the verification run. The system service was left running; the isolated backend and MongoDB process were terminated after verification.

Logs and screenshots:

- [Direct API request/response log](evidence/api-error-responses.json).
- [Browser API request/response and Console log](evidence/api-errors-browser.json), [Console screenshot](evidence/api-errors-console.png).
- [Backend stopped — UI](evidence/server-off-forum.png), [Console screenshot](evidence/server-off-console.png), [Console text](evidence/server-off-browser.json), [Vite terminal excerpt](evidence/frontend-proxy.log).
- [DB-down result and client Console](evidence/db-stopped-responses.json), [actual backend terminal output](evidence/db-stopped-server.log).
- [Normal backend startup excerpt](evidence/backend-startup.log).

## Final verification

Backend was restarted on 3000 after the error scenarios. At 08:54:07:

- Each of `nasa`, `esports-tribunal`, and `notNasa` displayed its own `Hello <channel>` message with the matching pressed button.
- Browser Console had no errors/warnings or unhandled page errors: [normal Console screenshot](evidence/normal-console.png), [recorded checks](evidence/final-browser-check.json).
- At 375 × 667, document width was 375 px: no horizontal page scrolling. [Mobile screenshot](evidence/forum-375px.png).
- `git diff -- src/useForumMessages.js` was empty, confirming the original cleanup remains in the source.
- `npm.cmd run lint`, `npm.cmd run typecheck`, and `npm.cmd run test` passed; 99/99 tests passed. [Command output](evidence/final-checks.log).

Verification used the current working tree, including the two additional hook error tests that remain outside this documentation commit. The expected 400/500 resource errors belong only to the deliberately induced error cases, not the normal Console check.
