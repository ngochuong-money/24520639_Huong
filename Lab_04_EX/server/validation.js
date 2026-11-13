export function validateMessage(body) {
  const details = {};
  const author = typeof body?.author === 'string' ? body.author.trim() : '';
  const text = typeof body?.text === 'string' ? body.text.trim() : '';

  if (!author) details.author = 'Required';
  else if (author.length < 2 || author.length > 50)
    details.author = 'Must be 2-50 characters';

  if (!text) details.text = 'Required';
  else if (text.length > 500) details.text = 'Must be at most 500 characters';

  return { details, value: { author, text } };
}
