export const AUTHOR_MAX = 40;
export const TEXT_MAX = 500;

/**
 * @returns {Record<string, string>} field → message; {} = valid
 * author: required → 'Author is required.'; ≤ 40 → 'Author must be at most 40 characters.'
 * text:   required → 'Message is required.'; ≤ 500 → 'Message must be at most 500 characters.'
 */
// Stub — implemented in WBS 4.3
export function validateMessage(values = {}) {
  return {};
}
