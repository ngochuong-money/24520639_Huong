# Task 6.3 evidence

01: presentation/retry red before implementation. 02: 44 related tests green. 03: alert-role mutation red. 04: restored green. 05/06/07: client 424, server 134, API 93 tests, lint/build passed. 08: actual Chrome production-page verification with real API and an isolated seeded MongoDB; database cleanup confirmed.

Browser PNGs are actual screenshots. Command PNGs are labelled renders of recorded output, not native terminal screenshots. The source scans were empty. No raw server messages are shown.

Browser checks include retry, genuine 409 rollback, error clearing, POST/DELETE and F5 persistence, one write during 800ms throttling, offline rollback, full deck via three input modes, repeated Undo and 375px overflow. Expected Console resource errors 409/502 are retained; no page errors or unhandled rejections across all reloads. A Vite proxy outage maps to 502/INTERNAL_ERROR and the generic friendly message, rather than NETWORK_ERROR.

Temporary scripts/runtime and Chrome profile use D:/CodexTemp. Both helper processes and its isolated test database were cleaned up. No dev data was modified. Browser checks do not establish NVDA/VoiceOver speech, Lighthouse scores, or full-page CLS.
