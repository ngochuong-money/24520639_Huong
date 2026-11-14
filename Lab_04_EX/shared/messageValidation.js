import messageRules from './messageRules.json' with { type: 'json' };

export { messageRules };

export function validateMessage(body) {
  const details = {};
  const payload = body !== null && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const author = typeof payload.author === 'string' ? payload.author.trim() : '';
  const text = typeof payload.text === 'string' ? payload.text.trim() : '';

  if (!author) details.author = 'Required';
  else if (author.length < messageRules.author.minLength || author.length > messageRules.author.maxLength)
    details.author = 'Must be 2-50 characters';

  if (!text) details.text = 'Required';
  else if (text.length < messageRules.text.minLength || text.length > messageRules.text.maxLength)
    details.text = 'Must be at most 500 characters';

  return { details, value: { author, text } };
}
