import { validateAppeal } from '@shared/validateAppeal.js';

test('client resolves @shared alias', () => {
  expect(typeof validateAppeal).toBe('function');
});
