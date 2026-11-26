export const DIRECTIONS = Object.freeze(['left', 'right', 'up']);
export const SCORE_WEIGHTS = Object.freeze({ left: -5, right: 10, up: 15 });

const clean = (value) => (typeof value === 'string' ? value.trim() : '');

/** @returns {Record<string, string>} field → message; {} = valid */
export function validateSwipe(values = {}, { profileIds } = {}) {
  const profileId = clean(values.profileId);
  const direction = clean(values.direction);
  const errors = {};

  if (!profileId) errors.profileId = 'Profile is required.';
  else if (profileIds && !profileIds.includes(profileId)) errors.profileId = 'Unknown profile.';

  if (!DIRECTIONS.includes(direction)) errors.direction = 'Direction must be left, right or up.';

  return errors;
}
