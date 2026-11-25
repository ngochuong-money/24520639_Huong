import express from 'express';
import cors from 'cors';

export const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/time', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ now: Date.now() });
});
