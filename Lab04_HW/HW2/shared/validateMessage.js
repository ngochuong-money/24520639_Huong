export const AUTHOR_MAX = 40;
export const TEXT_MAX = 500;

const clean = (value) => (typeof value === 'string' ? value.trim() : '');

/** @returns {Record<string, string>} field → message; {} = valid */
export function validateMessage(values = {}) {
  const author = clean(values.author);
  const text = clean(values.text);
  const errors = {};

  if (!author) errors.author = 'Author is required.';
  else if (author.length > AUTHOR_MAX) errors.author = `Author must be at most ${AUTHOR_MAX} characters.`;

  if (!text) errors.text = 'Message is required.';
  else if (text.length > TEXT_MAX) errors.text = `Message must be at most ${TEXT_MAX} characters.`;

  return errors;
}
