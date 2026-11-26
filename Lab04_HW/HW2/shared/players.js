/**
 * Seed case files — single source of truth for client and server.
 * appealDeadline: ISO 8601 with offset (Asia/Saigon, UTC+07:00).
 */
export const players = Object.freeze([
  Object.freeze({
    id: 'himass',
    name: 'Himass',
    team: 'Saigon Phantoms',
    role: 'Jungler',
    violation: 'Suspected third-party input macro during ranked qualifier',
    matchId: 'VCS-2026-W47-M03',
    sanction: '14-day competitive suspension',
    appealDeadline: '2026-12-15T17:00:00+07:00',
  }),
  Object.freeze({
    id: 'tanvuu',
    name: 'TanVuu',
    team: 'Hanoi Thunder',
    role: 'Support',
    violation: 'Unsportsmanlike conduct in post-match lobby chat',
    matchId: 'VCS-2026-W46-M07',
    sanction: 'Formal warning + 500 USD fine',
    appealDeadline: '2026-11-20T17:00:00+07:00',
  }),
]);

export const findPlayer = (id) => players.find((p) => p.id === id);
