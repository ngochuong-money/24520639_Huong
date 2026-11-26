import { test, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app.js';
import { useTestDb } from './helpers/db.js';

useTestDb();

afterEach(() => {
  vi.restoreAllMocks();
});

test('10. GET /api/time → current epoch ms, not cacheable', async () => {
  const before = Date.now();
  const res = await request(app).get('/api/time');
  const after = Date.now();
  expect(res.status).toBe(200);
  expect(res.headers['cache-control']).toBe('no-store');
  expect(res.body.now).toBeGreaterThanOrEqual(before);
  expect(res.body.now).toBeLessThanOrEqual(after);
});

test('11a. malformed JSON → 400', async () => {
  const res = await request(app)
    .post('/api/swipes')
    .set('Content-Type', 'application/json')
    .send('{"profileId": "linh-nguyen",');
  expect(res.status).toBe(400);
  expect(res.body).toEqual({ error: 'Malformed JSON body.' });
});

test('11b. body over 10 kb → 413', async () => {
  const res = await request(app)
    .post('/api/swipes')
    .send({ profileId: 'linh-nguyen', direction: 'right', padding: 'x'.repeat(11 * 1024) });
  expect(res.status).toBe(413);
  expect(res.body).toEqual({ error: 'Payload too large.' });
});

test('11c. unknown route → 404 JSON', async () => {
  const res = await request(app).get('/api/nope');
  expect(res.status).toBe(404);
  expect(res.type).toBe('application/json');
  expect(res.body).toEqual({ error: 'Not found.' });
});

test('12. database failure → 500 without leaking internals', async () => {
  vi.spyOn(mongoose.Query.prototype, 'exec').mockRejectedValueOnce(
    new Error('connection refused at secret-host:27017'),
  );
  const res = await request(app).get('/api/profiles');
  expect(res.status).toBe(500);
  expect(res.body).toEqual({ error: 'Internal server error.' });
  expect(JSON.stringify(res.body)).not.toMatch(/secret-host|stack/);
});
