import express from 'express';
import cors from 'cors';
import messagesRouter from './routes/messages.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }));
  app.use(express.json());
  app.use('/api/channels', messagesRouter);

  return app;
}
