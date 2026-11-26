import { players, findPlayer } from '@shared/players.js';

test('@shared alias resolves and seeds Himass + TanVuu', () => {
  expect(players.map((p) => p.id)).toEqual(['himass', 'tanvuu']);
});

test('severities are integers in 1–5, precedents included', () => {
  players.forEach((p) => {
    [p.violationSeverity, p.sanctionSeverity].forEach((v) => {
      expect(Number.isInteger(v) && v >= 1 && v <= 5).toBe(true);
    });
    expect(p.precedents.length).toBeGreaterThan(0);
    p.precedents.forEach((c) => {
      expect(Number.isInteger(c.violationSeverity) && c.violationSeverity >= 1 && c.violationSeverity <= 5).toBe(true);
      expect(Number.isInteger(c.sanctionSeverity) && c.sanctionSeverity >= 1 && c.sanctionSeverity <= 5).toBe(true);
    });
  });
});

test('appeal deadlines are valid ISO dates', () => {
  players.forEach((p) => expect(Number.isNaN(Date.parse(p.appealDeadline))).toBe(false));
});

test('findPlayer + immutability', () => {
  expect(findPlayer('unknown')).toBeUndefined();
  expect(Object.isFrozen(players)).toBe(true);
  expect(Object.isFrozen(players[0].precedents)).toBe(true);
});
