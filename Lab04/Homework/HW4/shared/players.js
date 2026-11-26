/**
 * Fair-play case files — shared by client and server.
 * violationSeverity / sanctionSeverity: 1 (minor) … 5 (severe) — used by computeMatrix().
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
    violationSeverity: 3,
    sanctionSeverity: 4,
    precedents: Object.freeze([
      Object.freeze({ id: 'p-macro-2025a', label: 'Macro use, 2025 Spring', violationSeverity: 3, sanctionSeverity: 3 }),
      Object.freeze({ id: 'p-macro-2025b', label: 'Macro use, 2025 Summer', violationSeverity: 3, sanctionSeverity: 4 }),
      Object.freeze({ id: 'p-script-2024', label: 'Aim script, 2024 Finals', violationSeverity: 5, sanctionSeverity: 5 }),
    ]),
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
    violationSeverity: 1,
    sanctionSeverity: 3,
    precedents: Object.freeze([
      Object.freeze({ id: 'p-chat-2025a', label: 'Lobby chat, 2025 Spring', violationSeverity: 1, sanctionSeverity: 1 }),
      Object.freeze({ id: 'p-chat-2025b', label: 'All-chat taunt, 2025 Summer', violationSeverity: 2, sanctionSeverity: 1 }),
      Object.freeze({ id: 'p-chat-2024', label: 'Repeated abuse, 2024 Winter', violationSeverity: 3, sanctionSeverity: 3 }),
    ]),
  }),
]);

export const findPlayer = (id) => players.find((p) => p.id === id);
