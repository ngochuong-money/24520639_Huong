import express from 'express';
import cors from 'cors';
import { appealsRouter } from './routes/appeals.js';
import { messagesRouter } from './routes/messages.js';
import { notFound, errorHandler } from './middleware/errors.js';

export const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/time', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ now: Date.now() });
});

app.use('/api/appeals', appealsRouter);
app.use('/api/messages', messagesRouter);

app.use(notFound);
app.use(errorHandler);
