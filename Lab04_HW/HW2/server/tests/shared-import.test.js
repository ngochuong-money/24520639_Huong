import { test, expect } from 'vitest';
import { validateAppeal } from '../../shared/validateAppeal.js';

test('server imports shared validator', () => {
  expect(typeof validateAppeal).toBe('function');
});
