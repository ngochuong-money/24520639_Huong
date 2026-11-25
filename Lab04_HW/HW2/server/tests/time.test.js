import { test, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

test('GET /api/time returns current epoch ms and is not cacheable', async () => {
  const before = Date.now();
  const res = await request(app).get('/api/time');
  const after = Date.now();

  expect(res.status).toBe(200);
  expect(res.headers['cache-control']).toBe('no-store');
  expect(res.body.now).toBeGreaterThanOrEqual(before);
  expect(res.body.now).toBeLessThanOrEqual(after);
});
