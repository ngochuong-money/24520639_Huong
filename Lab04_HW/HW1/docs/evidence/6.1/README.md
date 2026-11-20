# Task 6.1 evidence

01: tests red before implementation (15 failed, 1 passed). 02-sample-response-reuse-red: native Response reused by sample mock. 02-client-green: fresh response mock, 16 passed. 03: AbortError mutation red. 04: restored green. 05/06/07: full tests, lint, build passed. 08: actual Chrome verification with seeded API/MongoDB, server-off error UI and no unhandled rejection.

Browser PNGs are actual screenshots. Command PNGs are labelled renders of captured output, not terminal-window screenshots. Healthy Console has no warnings/errors; server-off Console contains the expected HTTP 502 resource error. Full original logs are retained.

No usePhotos change required: existing signal and AbortError catch remain compatible. Source scan for forbidden patterns returned no matches; only one client ApiError definition. All temporary tools/runtime use D:/CodexTemp.
