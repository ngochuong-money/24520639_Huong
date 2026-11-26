export function notFound(req, res) {
  res.status(404).json({ error: 'Not found.' });
}

// Express recognises error handlers by their 4 parameters
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON body.' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Payload too large.' });

  if (process.env.NODE_ENV !== 'test') console.error(err); // details stay in server logs
  return res.status(500).json({ error: 'Internal server error.' });
}
