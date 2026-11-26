import express from 'express';
import cors from 'cors';
import messagesRouter from './routes/messages.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }));
  // Let field validation reject valid JSON values such as null or arrays.
  app.use(express.json({ strict: false }));
  app.use('/api/channels', messagesRouter);

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
    console.error('Unhandled error:', err?.message ?? String(err));
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
