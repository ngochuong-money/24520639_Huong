import express from 'express';
import cors from 'cors';
import messagesRouter from './routes/messages.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }));
  // Let field validation reject valid JSON values such as null or arrays.
  app.use(express.json({ strict: false }));
  app.use('/api/channels', messagesRouter);

  return app;
}
