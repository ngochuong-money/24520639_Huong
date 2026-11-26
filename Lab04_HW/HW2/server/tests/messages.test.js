import { describe, test, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { validateMessage } from '../../shared/validateMessage.js';
import { useTestDb } from './helpers/db.js';

useTestDb();

describe('/api/messages/:forum', () => {
  test('8. unknown channel → 404', async () => {
    const res = await request(app).get('/api/messages/NASA');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Unknown channel.' });
  });

  test('9. POST valid → 201, then GET includes it', async () => {
    const post = await request(app)
      .post('/api/messages/esports-tribunal')
      .send({ author: '  Himass ', text: ' Requesting a replay review. ' });
    expect(post.status).toBe(201);
    expect(post.body).toMatchObject({ forum: 'esports-tribunal', author: 'Himass', text: 'Requesting a replay review.' });
    expect(post.body).not.toHaveProperty('_id');

    const get = await request(app).get('/api/messages/esports-tribunal');
    expect(get.status).toBe(200);
    expect(get.body.map((m) => m.id)).toContain(post.body.id);
  });

  test('10. POST invalid → 400 with fields identical to shared validator (parity)', async () => {
    const payload = { author: '', text: 'x'.repeat(501) };
    const res = await request(app).post('/api/messages/nasa').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed.');
    expect(res.body.fields).toEqual(validateMessage(payload));
    expect(res.body.fields).toEqual({
      author: 'Author is required.',
      text: 'Message must be at most 500 characters.',
    });
  });

  test('11. channels are isolated', async () => {
    await request(app).post('/api/messages/nasa').send({ author: 'TanVuu', text: 'Only in nasa' });
    const res = await request(app).get('/api/messages/notNasa');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
