import { computeScore } from '@shared/computeScore.js';
import { SCORE_WEIGHTS } from '@shared/swipeRules.js';

const s = (direction) => ({ id: direction, profileId: direction, direction });

test('empty history scores 0', () => {
  expect(computeScore([])).toBe(0);
});

test('asymmetric weights: like +10, super +15, nope −5', () => {
  expect(SCORE_WEIGHTS).toEqual({ left: -5, right: 10, up: 15 });
  expect(computeScore([s('right'), s('up'), s('left')])).toBe(20);
});

test('score can go negative', () => {
  expect(computeScore([s('left'), s('left')])).toBe(-10);
});

test('does not mutate the history', () => {
  const history = Object.freeze([Object.freeze(s('right'))]);
  expect(() => computeScore(history)).not.toThrow();
});
