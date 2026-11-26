import { describe, test, expect } from 'vitest';
import { loadConfig } from '../config.js';

describe('loadConfig', () => {
  test('throws a clear error when MONGODB_URI is missing or blank', () => {
    expect(() => loadConfig({})).toThrow(/MONGODB_URI missing/);
    expect(() => loadConfig({ MONGODB_URI: '   ' })).toThrow(/MONGODB_URI missing/);
  });

  test('returns trimmed values with sensible defaults', () => {
    expect(loadConfig({ MONGODB_URI: ' mongodb://x/db ' })).toEqual({
      mongoUri: 'mongodb://x/db',
      port: 3001,
      clientOrigin: 'http://localhost:5173',
    });
  });

  test('rejects an invalid PORT', () => {
    expect(() => loadConfig({ MONGODB_URI: 'mongodb://x/db', PORT: 'abc' })).toThrow(/PORT/);
  });
});
