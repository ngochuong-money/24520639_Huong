import { test, expect } from 'vitest';
import { profiles } from '../seed/profiles.data.js';

const REQUIRED = ['id', 'name', 'age', 'city', 'bio', 'interests', 'avatar', 'avatarAlt'];

test('has 8–10 profiles with all required fields', () => {
  expect(profiles.length).toBeGreaterThanOrEqual(8);
  expect(profiles.length).toBeLessThanOrEqual(10);
  profiles.forEach((p) => REQUIRED.forEach((key) => expect(p[key], `${p.id}.${key}`).toBeTruthy()));
});

test('ids are unique and URL-safe', () => {
  const ids = profiles.map((p) => p.id);
  expect(new Set(ids).size).toBe(ids.length);
  ids.forEach((id) => expect(id).toMatch(/^[a-z0-9-]+$/));
});

test('ages are adults', () => {
  profiles.forEach((p) => expect(p.age).toBeGreaterThanOrEqual(18));
});

test('seed is immutable', () => {
  expect(Object.isFrozen(profiles)).toBe(true);
  expect(Object.isFrozen(profiles[0])).toBe(true);
});
