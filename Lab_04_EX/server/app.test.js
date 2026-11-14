import { once } from 'node:events';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from './app.js';
import { Message } from './models/Message.js';
import { validateMessage } from './validation.js';
import { messageValidationCases } from '../shared/messageValidationCases.js';
import { validateMessage as validateClientMessage } from '../src/validation';

let server;
let baseUrl;

beforeAll(async () => {
  vi.stubEnv('CLIENT_ORIGIN', 'http://localhost:5173');
  const app = createApp();
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}/api/channels`;
});

beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}));
afterEach(() => vi.restoreAllMocks());
afterAll(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  vi.unstubAllEnvs();
});

function post(channel, body) {
  return fetch(`${baseUrl}/${channel}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('CORS middleware', () => {
  it('allows the configured frontend origin, including on error responses', async () => {
    const response = await fetch(`${baseUrl}/foo/messages`, {
      headers: { Origin: 'http://localhost:5173' },
    });
    expect(response.status).toBe(400);
    expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:5173');
  });

  it('does not grant access to a different origin', async () => {
    const origin = 'http://localhost:9999';
    const response = await fetch(`${baseUrl}/foo/messages`, { headers: { Origin: origin } });
    // CORS is enforced by the browser: the allowed header must not match this origin.
    expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:5173');
    expect(response.headers.get('access-control-allow-origin')).not.toBe(origin);
  });

  it('handles JSON POST preflight before reaching the routes', async () => {
    const response = await fetch(`${baseUrl}/nasa/messages`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      },
    });
    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:5173');
    expect(response.headers.get('access-control-allow-methods')).toContain('POST');
    expect(response.headers.get('access-control-allow-headers')).toContain('content-type');
  });
});

describe('message validation', () => {
  it.each(messageValidationCases)('matches the client exactly: $name', ({ body, details }) => {
    const serverResult = validateMessage(body);
    expect(serverResult.details).toEqual(details);
    expect(serverResult).toEqual(validateClientMessage(body));
  });
  it('reports both required fields', () => {
    expect(validateMessage({}).details).toEqual({ author: 'Required', text: 'Required' });
  });

  it.each([
    { author: 'A', text: 'Hello' },
    { author: 'A'.repeat(51), text: 'Hello' },
    { author: 'Ada', text: 'x'.repeat(501) },
    { author: '  ', text: '  ' },
    { author: 123, text: false },
  ])('rejects invalid fields: %j', (body) => {
    expect(Object.keys(validateMessage(body).details).length).toBeGreaterThan(0);
  });

  it.each([2, 50])('accepts author length %i and trims values', (length) => {
    expect(validateMessage({ author: ` ${'A'.repeat(length)} `, text: ' Hello ' }))
      .toEqual({ details: {}, value: { author: 'A'.repeat(length), text: 'Hello' } });
  });

  it('accepts text at the maximum length', () => {
    expect(validateMessage({ author: 'Ada', text: 'x'.repeat(500) }).details).toEqual({});
  });
});

describe('message router', () => {
  it('returns JSON for malformed JSON without reaching the database', async () => {
    const create = vi.spyOn(Message, 'create');
    const response = await fetch(`${baseUrl}/nasa/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
      body: '{abc',
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid JSON' });
    expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:5173');
    expect(create).not.toHaveBeenCalled();
  });

  it('returns a generic JSON response for unexpected middleware errors', async () => {
    const response = await post('nasa', { author: 'Huong', text: 'x'.repeat(110000) });
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Internal server error' });
    expect(console.error).toHaveBeenCalledWith('Unhandled error:', expect.any(String));
  });
  it.each(messageValidationCases.filter(({ details }) => Object.keys(details).length > 0))(
    'returns all field errors without writing to the database: $name',
    async ({ body, details }) => {
      const create = vi.spyOn(Message, 'create');
      const response = await post('nasa', body);
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: 'Validation failed', details });
      expect(create).not.toHaveBeenCalled();
    },
  );
  it('rejects an unknown GET channel before querying the database', async () => {
    const find = vi.spyOn(Message, 'find');
    const response = await fetch(`${baseUrl}/foo/messages`);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Unknown channel' });
    expect(find).not.toHaveBeenCalled();
  });

  it('rejects an unknown POST channel', async () => {
    const response = await post('foo', {});
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Unknown channel' });
  });

  it.each(['nasa', 'esports-tribunal', 'notNasa'])('returns an empty array for empty channel %s', async (channel) => {
    const exec = vi.fn().mockResolvedValue([]);
    const sort = vi.fn().mockReturnValue({ exec });
    const find = vi.spyOn(Message, 'find').mockReturnValue({ sort });
    const response = await fetch(`${baseUrl}/${channel}/messages`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
    expect(find).toHaveBeenCalledWith({ channelId: channel });
    expect(sort).toHaveBeenCalledWith({ createdAt: 1 });
    expect(exec).toHaveBeenCalledOnce();
  });

  it('returns a generic error when reading messages fails', async () => {
    const find = vi.spyOn(Message, 'find').mockReturnValue({ sort: () => ({ exec: () => Promise.reject(new Error('private database error')) }) });
    const response = await fetch(`${baseUrl}/nasa/messages`);
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Internal server error' });
    expect(console.error).toHaveBeenCalledWith('GET messages failed:', 'private database error');
    // The same HTTP server must keep serving requests after a rejected query.
    find.mockReturnValue({ sort: () => ({ exec: () => Promise.resolve([]) }) });
    const recovered = await fetch(`${baseUrl}/nasa/messages`);
    expect(recovered.status).toBe(200);
    expect(await recovered.json()).toEqual([]);
  });

  it('rejects a non-JSON Content-Type', async () => {
    const response = await fetch(`${baseUrl}/nasa/messages`, { method: 'POST', body: 'Hello' });
    expect(response.status).toBe(415);
    expect(await response.json()).toEqual({ error: 'Content-Type must be application/json' });
  });

  it('rejects missing text before creating a document', async () => {
    const create = vi.spyOn(Message, 'create');
    const response = await post('nasa', { author: 'Huong' });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Validation failed', details: { text: 'Required' } });
    expect(create).not.toHaveBeenCalled();
  });

  it('creates trimmed values, ignores extra fields, and serializes id', async () => {
    const document = new Message({ channelId: 'nasa', author: 'Huong', text: 'Hello', createdAt: new Date(), __v: 0 });
    const create = vi.spyOn(Message, 'create').mockResolvedValue(document);
    const response = await post('nasa', { author: ' Huong ', text: ' Hello ', channelId: 'notNasa', extra: 'ignored' });
    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledWith({ channelId: 'nasa', author: 'Huong', text: 'Hello' });
    const body = await response.json();
    expect(body).toMatchObject({ id: document._id.toString(), channelId: 'nasa', author: 'Huong', text: 'Hello' });
    expect(body).not.toHaveProperty('_id');
    expect(body).not.toHaveProperty('__v');
    expect(body.createdAt).toBe(document.createdAt.toISOString());
  });

  it('returns a generic error when creating a message fails', async () => {
    vi.spyOn(Message, 'create').mockRejectedValue(new Error('private database error'));
    const response = await post('nasa', { author: 'Huong', text: 'Hello' });
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Internal server error' });
    expect(console.error).toHaveBeenCalledWith('POST messages failed:', 'private database error');
  });
});
