/**
 * Shared appeal validation — used by client (render pass) and server (POST /api/appeals).
 * Pure function: no side effects, no DOM, no fetch.
 *
 * @param {Object} values
 * @param {string} values.playerId      required, read-only (from URL)
 * @param {string} values.matchId       required, pattern TBD in 2.1
 * @param {string} values.email         required, valid email
 * @param {string} values.confirmEmail  must equal email
 * @param {string} values.reason        required, one of APPEAL_REASONS
 * @param {string} values.statement     required, 30–1000 chars
 * @param {string} [values.evidenceUrl] optional, https URL
 * @returns {Record<string, string>}    field → error message; empty object = valid
 */
export const APPEAL_REASONS = [];

export function validateAppeal(values = {}) {
  return {};
}
