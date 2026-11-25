import { test, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app.js';
import { useTestDb } from './helpers/db.js';

useTestDb();

afterEach(() => {
  vi.restoreAllMocks();
});

test('12. malformed JSON → 400', async () => {
  const res = await request(app)
    .post('/api/messages/nasa')
    .set('Content-Type', 'application/json')
    .send('{"author": "Himass",');
  expect(res.status).toBe(400);
  expect(res.body).toEqual({ error: 'Malformed JSON body.' });
});

test('12b. body over 10 kb → 413', async () => {
  const res = await request(app)
    .post('/api/messages/nasa')
    .send({ author: 'Himass', text: 'x'.repeat(11 * 1024) });
  expect(res.status).toBe(413);
  expect(res.body).toEqual({ error: 'Payload too large.' });
});

test('13. unknown route → 404 JSON', async () => {
  const res = await request(app).get('/api/nope');
  expect(res.status).toBe(404);
  expect(res.type).toBe('application/json');
  expect(res.body).toEqual({ error: 'Not found.' });
});

test('14. database failure → 500 without leaking internals', async () => {
  vi.spyOn(mongoose.Query.prototype, 'exec').mockRejectedValueOnce(
    new Error('connection refused at secret-host:27017'),
  );
  const res = await request(app).get('/api/messages/nasa');
  expect(res.status).toBe(500);
  expect(res.body).toEqual({ error: 'Internal server error.' });
  expect(JSON.stringify(res.body)).not.toMatch(/secret-host|stack|at /);
});
