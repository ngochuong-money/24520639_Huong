import { SCORE_WEIGHTS } from './swipeRules.js';

/** Asymmetric score derived from the swipe history. Pure; [] → 0; may be negative. */
export function computeScore(history = []) {
  return history.reduce((sum, swipe) => sum + (SCORE_WEIGHTS[swipe.direction] ?? 0), 0);
}
