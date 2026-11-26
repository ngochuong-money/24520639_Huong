import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { validateAppeal } from '../../shared/validateAppeal.js';
import { useTestDb } from './helpers/db.js';

useTestDb();

const NOW = new Date('2026-11-25T12:00:00+07:00'); // himass open, tanvuu expired

const validAppeal = (patch = {}) => ({
  playerId: 'himass',
  matchId: 'VCS-2026-W47-M03',
  email: 'player@team.gg',
  confirmEmail: 'player@team.gg',
  reason: 'false-positive',
  statement: 'The flagged input came from a certified tournament mouse.',
  evidenceUrl: '',
  ...patch,
});

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('POST /api/appeals', () => {
  test('1. valid → 201 with id/createdAt, without _id/__v/confirmEmail', async () => {
    const res = await request(app).post('/api/appeals').send(validAppeal());
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ playerId: 'himass', matchId: 'VCS-2026-W47-M03', email: 'player@team.gg' });
    expect(res.body.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(res.body.createdAt).toBe(NOW.toISOString());
    expect(res.body).not.toHaveProperty('_id');
    expect(res.body).not.toHaveProperty('__v');
    expect(res.body).not.toHaveProperty('confirmEmail');
  });

  test('2. unknown player → 404', async () => {
    const res = await request(app).post('/api/appeals').send(validAppeal({ playerId: 'ghost' }));
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Player not found.' });
  });

  test('3. invalid payload → 400 with fields identical to shared validator (parity)', async () => {
    const payload = validAppeal({ email: 'bad@', confirmEmail: 'other@team.gg', statement: 'too short' });
    const res = await request(app).post('/api/appeals').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed.');
    expect(res.body.fields).toEqual(validateAppeal(payload));
    expect(res.body.fields.email).toBe('Enter a valid email address.');
  });

  test('4. expired window (tanvuu) → 409', async () => {
    const res = await request(app)
      .post('/api/appeals')
      .send(validAppeal({ playerId: 'tanvuu', matchId: 'VCS-2026-W46-M07' }));
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'The appeal window has closed.' });
  });

  test('5. extra fields are ignored (no mass assignment)', async () => {
    const res = await request(app)
      .post('/api/appeals')
      .send(validAppeal({ id: 'hacked', createdAt: '1999-01-01T00:00:00.000Z', isAdmin: true }));
    expect(res.status).toBe(201);
    expect(res.body.id).not.toBe('hacked');
    expect(res.body.createdAt).toBe(NOW.toISOString());
    expect(res.body).not.toHaveProperty('isAdmin');
  });
});

describe('GET /api/appeals/:playerId', () => {
  test('6. newest first, public fields only (no email)', async () => {
    await request(app).post('/api/appeals').send(validAppeal({ statement: 'First appeal statement, long enough to pass.' }));
    vi.setSystemTime(new Date(NOW.getTime() + 60_000));
    await request(app).post('/api/appeals').send(validAppeal({ statement: 'Second appeal statement, long enough to pass.' }));

    const res = await request(app).get('/api/appeals/himass');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].statement).toMatch(/^Second/);
    res.body.forEach((appeal) => {
      expect(appeal).not.toHaveProperty('email');
      expect(appeal).not.toHaveProperty('_id');
    });
  });

  test('7. unknown player → 404', async () => {
    const res = await request(app).get('/api/appeals/ghost');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Player not found.' });
  });
});
