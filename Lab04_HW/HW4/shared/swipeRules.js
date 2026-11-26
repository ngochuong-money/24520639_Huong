export const DIRECTIONS = Object.freeze(['left', 'right', 'up']);
export const SCORE_WEIGHTS = Object.freeze({ left: -5, right: 10, up: 15 });

/**
 * @returns {Record<string, string>} field → message; {} = valid
 * profileId: required → 'Profile is required.'; not in profileIds (when given) → 'Unknown profile.'
 * direction: not in DIRECTIONS → 'Direction must be left, right or up.'
 */
// Stub — implemented in WBS 2.2
export function validateSwipe(values = {}, { profileIds } = {}) {
  return {};
}
