# SLA Timer Contract — `useAppealSlaTimer()`

> Requirement #3: Zero-Drift SLA Countdown Hook synchronized strictly against system clock delta
> Core rule: remaining time is **recomputed from the clock on every tick, never decremented**

## 1. Why decrementing drifts

| Approach | Behaviour |
|---|---|
| ❌ `setRemaining(r => r - 1000)` every 1000 ms | Browsers throttle timers in background tabs (≥1 s, up to 1 min) and timers fire late under load → each late or skipped tick adds error that is never recovered |
| ✅ `remaining = deadline − (now + offset)` | Each tick reads the real clock → error never accumulates; a late tick just shows the correct value a little later |

## 2. Signature

```js
useAppealSlaTimer(deadlineISO, { timeUrl = '/api/time' } = {})
→ {
  remainingMs,   // number ≥ 0
  isExpired,     // remainingMs === 0
  parts,         // { d, h, m, s } — integers from remainingMs
  isSynced,      // true once the server offset has been applied
}
```

## 3. Clock model

```text
serverNow ≈ clientNow + offset

offset = serverNow − (t0 + t1) / 2      // t0 = before request, t1 = after response (midpoint cancels network latency)
remainingMs = max(0, deadlineMs − (tickNow + offset))
```

- `GET /api/time` → `200 { now: <epoch ms> }`
- `offset` starts at `0` (local clock) and is replaced when the server responds
- If the time request fails: keep `offset = 0`, `isSynced = false`, ignore `AbortError`, never throw
- Invalid `deadlineISO` → `remainingMs = 0`, `isExpired = true`

## 4. State vs derived

| Kind | Name | Notes |
|---|---|---|
| State | `tickNow` | `Date.now()` snapshot taken in the timer callback (never read during render) |
| State | `offset`, `isSynced` | Set once per sync |
| Derived | `remainingMs`, `isExpired`, `parts` | Pure computation in render |

No `remaining` state exists; nothing is ever subtracted from a previous value.

## 5. Effects (each with full deps + cleanup)

| Effect | Deps | Does | Cleanup |
|---|---|---|---|
| Sync | `[timeUrl, syncKey]` | `fetch(timeUrl, { signal })` → set `offset` | `controller.abort()` |
| Tick | `[deadlineMs, offset]` | Recursive `setTimeout` aligned to the next whole second of corrected time → `setTickNow(Date.now())`; **stops scheduling once expired** | `clearTimeout` |
| Visibility | `[]` | On `visibilitychange` → `visible`: `setTickNow(Date.now())` immediately and bump `syncKey` to re-sync | `removeEventListener` |

Tick delay: `1000 − ((Date.now() + offset) % 1000)` (+ a few ms guard) → updates land on second boundaries, with no skipped or doubled seconds.

## 6. UI integration

- Hook is called **once** in `PersonDetail`; Outlet context becomes `{ player, isExpired }`
- `SlaCountdown` (`client/src/components/SlaCountdown.jsx`) props: `{ remainingMs, isExpired, parts, isSynced }`
  - Visible: `<p className="sla">Appeal window closes in <time dateTime="P{d}DT{h}H{m}M{s}S">{d}d {hh}h {mm}m {ss}s</time></p>`
  - Expired: `<p className="sla sla--expired">Appeal window closed</p>`
  - `isSynced === false` → small note `(local clock)`
  - Screen-reader milestones in a separate visually-hidden `<p aria-live="polite">`, derived from `remainingMs`:
    `> 24h` → *(empty)* · `≤ 24h` → "Less than 24 hours left to appeal." · `≤ 1h` → "Less than 1 hour left…" · `≤ 10m` → "Less than 10 minutes left…" · `0` → "The appeal window has closed."
    (text changes only when the bucket changes → announced once per milestone, not every second)
- `SimpleForm` gets `isExpired`: submit button disabled + notice "The appeal window has closed." (server also returns `409`, Sprint 3)

## 7. Test cases (→ WBS 3.2, Vitest fake timers)

**Hook**
1. Initial `remainingMs = deadline − now`
2. After advancing 5 s → exactly 5000 ms less
3. **Zero drift:** jump the system clock +30 s without firing ticks, then one tick → reflects the full 31 s, not 1 s
4. Server offset +60 s → `remainingMs` reduced by 60 000, `isSynced = true`
5. Time fetch rejects → `offset = 0`, `isSynced = false`, no unhandled rejection
6. Reaching the deadline → `remainingMs = 0`, `isExpired = true`, no timers left (`vi.getTimerCount() === 0`)
7. `visibilitychange` → visible: value recomputed immediately and `/api/time` fetched again
8. Unmount → no pending timers, listener removed, sync request aborted
9. `parts` for 1d 2h 3m 4s → `{ d: 1, h: 2, m: 3, s: 4 }`
10. Invalid deadline → expired
11. Hook source contains no decrement pattern (`r - 1000`, `prev -`)

**Components**
12. `SlaCountdown` renders `<time dateTime="P1DT2H3M4S">`
13. Milestone live text changes at the 10-minute boundary
14. `/dossier/tanvuu/appeal` (expired) → submit disabled + closed notice
