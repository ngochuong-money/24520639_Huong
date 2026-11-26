/**
 * Shared appeal validation — used by the client (render pass) and the server (POST /api/appeals).
 * Pure function: no side effects, no DOM, no fetch. Messages are part of the API contract.
 */
export const APPEAL_REASONS = Object.freeze([
  Object.freeze({ value: 'false-positive', label: 'Anti-cheat false positive' }),
  Object.freeze({ value: 'misidentified', label: 'Wrong player identified' }),
  Object.freeze({ value: 'disproportionate', label: 'Sanction is disproportionate' }),
  Object.freeze({ value: 'new-evidence', label: 'New evidence available' }),
]);

export const STATEMENT_MIN = 30;
export const STATEMENT_MAX = 1000;

const MATCH_ID_PATTERN = /^VCS-\d{4}-W\d{2}-M\d{2}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (value) => (typeof value === 'string' ? value.trim() : '');

const isHttpsUrl = (value) => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * @param {Record<string, string>} values
 * @param {{ playerIds?: string[] }} [options]
 * @returns {Record<string, string>} field → message; {} = valid
 */
export function validateAppeal(values = {}, { playerIds } = {}) {
  const playerId = clean(values.playerId);
  const matchId = clean(values.matchId);
  const email = clean(values.email);
  const confirmEmail = clean(values.confirmEmail);
  const reason = clean(values.reason);
  const statement = clean(values.statement);
  const evidenceUrl = clean(values.evidenceUrl);

  const errors = {};

  if (!playerId || (playerIds && !playerIds.includes(playerId))) {
    errors.playerId = 'Unknown player.';
  }

  if (!matchId) errors.matchId = 'Match ID is required.';
  else if (!MATCH_ID_PATTERN.test(matchId)) errors.matchId = 'Use the format VCS-YYYY-Www-Mnn.';

  if (!email) errors.email = 'Email is required.';
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.';

  if (!confirmEmail) errors.confirmEmail = 'Please confirm your email.';
  else if (confirmEmail.toLowerCase() !== email.toLowerCase()) errors.confirmEmail = 'Emails do not match.';

  if (!APPEAL_REASONS.some((r) => r.value === reason)) errors.reason = 'Select a reason.';

  if (!statement) errors.statement = 'Statement is required.';
  else if (statement.length < STATEMENT_MIN) errors.statement = `Statement must be at least ${STATEMENT_MIN} characters.`;
  else if (statement.length > STATEMENT_MAX) errors.statement = `Statement must be at most ${STATEMENT_MAX} characters.`;

  if (evidenceUrl && !isHttpsUrl(evidenceUrl)) errors.evidenceUrl = 'Evidence must be an https:// URL.';

  return errors;
}
