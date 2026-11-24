import { players, findPlayer } from '../src/data/players.js';

const REQUIRED = ['id', 'name', 'team', 'role', 'violation', 'matchId', 'sanction', 'appealDeadline'];

test('seed contains himass and tanvuu', () => {
  expect(players.map((p) => p.id)).toEqual(['himass', 'tanvuu']);
});

test('every player has all required fields', () => {
  players.forEach((p) => {
    REQUIRED.forEach((key) => expect(p[key], `${p.id}.${key}`).toBeTruthy());
  });
});

test('ids are unique', () => {
  const ids = players.map((p) => p.id);
  expect(new Set(ids).size).toBe(ids.length);
});

test('appealDeadline is a valid ISO date', () => {
  players.forEach((p) => {
    expect(Number.isNaN(Date.parse(p.appealDeadline))).toBe(false);
  });
});

test('findPlayer returns undefined for unknown id', () => {
  expect(findPlayer('unknown')).toBeUndefined();
});

test('seed is immutable', () => {
  expect(Object.isFrozen(players)).toBe(true);
  expect(Object.isFrozen(players[0])).toBe(true);
});
