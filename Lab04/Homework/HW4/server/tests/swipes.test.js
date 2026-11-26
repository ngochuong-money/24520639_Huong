import { describe, test, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { validateSwipe } from '../../shared/swipeRules.js';
import { useTestDb } from './helpers/db.js';
import { seedProfiles } from './helpers/seed.js';

useTestDb();

let seeded;
beforeEach(async () => {
  seeded = await seedProfiles();
});

const post = (body) => request(app).post('/api/swipes').send(body);

describe('GET /api/profiles', () => {
  test('1. sorted by order, public fields only (no _id/__v)', async () => {
    const res = await request(app).get('/api/profiles');
    expect(res.status).toBe(200);
    expect(res.body.map((p) => p.id)).toEqual(seeded.map((p) => p.id));
    res.body.forEach((p) => {
      expect(p).not.toHaveProperty('_id');
      expect(p).not.toHaveProperty('__v');
      expect(p).toHaveProperty('avatarAlt');
    });
  });
});

describe('POST /api/swipes', () => {
  test('3. valid → 201 with UUID id and createdAt', async () => {
    const res = await post({ profileId: 'linh-nguyen', direction: 'right' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ profileId: 'linh-nguyen', direction: 'right' });
    expect(res.body.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(Number.isNaN(Date.parse(res.body.createdAt))).toBe(false);
    expect(res.body).not.toHaveProperty('_id');
    expect(res.body).not.toHaveProperty('__v');
  });

  test('4. invalid → 400 with fields identical to validateSwipe (parity)', async () => {
    const body = { profileId: '', direction: 'down' };
    const res = await post(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed.');
    expect(res.body.fields).toEqual(validateSwipe(body));
    expect(res.body.fields).toEqual({
      profileId: 'Profile is required.',
      direction: 'Direction must be left, right or up.',
    });
  });

  test('5. unknown profile → 404', async () => {
    const res = await post({ profileId: 'ghost', direction: 'left' });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Profile not found.' });
  });

  test('6. same profile twice → 409', async () => {
    await post({ profileId: 'minh-tran', direction: 'left' });
    const res = await post({ profileId: 'minh-tran', direction: 'up' });
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'Profile already swiped.' });
  });

  test('7. extra fields are ignored (no mass assignment)', async () => {
    const res = await post({
      profileId: 'thao-le', direction: 'up', id: 'hacked', createdAt: '1999-01-01T00:00:00.000Z', score: 9999,
    });
    expect(res.status).toBe(201);
    expect(res.body.id).not.toBe('hacked');
    expect(res.body.createdAt).not.toBe('1999-01-01T00:00:00.000Z');
    expect(res.body).not.toHaveProperty('score');
  });
});

describe('GET /api/swipes', () => {
  test('2. oldest first, no _id/__v', async () => {
    await post({ profileId: 'linh-nguyen', direction: 'right' });
    await post({ profileId: 'minh-tran', direction: 'left' });

    const res = await request(app).get('/api/swipes');
    expect(res.status).toBe(200);
    expect(res.body.map((s) => s.profileId)).toEqual(['linh-nguyen', 'minh-tran']);
    res.body.forEach((s) => {
      expect(s).not.toHaveProperty('_id');
      expect(s).not.toHaveProperty('__v');
    });
  });
});

describe('DELETE /api/swipes', () => {
  test('8. DELETE /:id → 204, profile can be swiped again; unknown id → 404', async () => {
    const created = await post({ profileId: 'khoa-pham', direction: 'right' });

    const del = await request(app).delete(`/api/swipes/${created.body.id}`);
    expect(del.status).toBe(204);
    expect(del.body).toEqual({});

    const again = await post({ profileId: 'khoa-pham', direction: 'left' });
    expect(again.status).toBe(201);

    const missing = await request(app).delete('/api/swipes/does-not-exist');
    expect(missing.status).toBe(404);
    expect(missing.body).toEqual({ error: 'Swipe not found.' });
  });

  test('9. DELETE all → 204 and the list is empty', async () => {
    await post({ profileId: 'an-vo', direction: 'right' });
    await post({ profileId: 'bao-dang', direction: 'up' });

    const res = await request(app).delete('/api/swipes');
    expect(res.status).toBe(204);

    const list = await request(app).get('/api/swipes');
    expect(list.body).toEqual([]);
  });
});
