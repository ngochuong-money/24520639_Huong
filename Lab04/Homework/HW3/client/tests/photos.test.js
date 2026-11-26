import { photos, findPhoto } from '../src/data/photos.js';

const REQUIRED = ['id', 'title', 'alt', 'src', 'width', 'height', 'credit'];

test('has 6–9 photos', () => {
  expect(photos.length).toBeGreaterThanOrEqual(6);
  expect(photos.length).toBeLessThanOrEqual(9);
});

test('every photo has all required fields', () => {
  photos.forEach((p) => {
    REQUIRED.forEach((key) => expect(p[key], `${p.id}.${key}`).toBeTruthy());
  });
});

test('ids are unique and URL-safe', () => {
  const ids = photos.map((p) => p.id);
  expect(new Set(ids).size).toBe(ids.length);
  ids.forEach((id) => expect(id).toMatch(/^[a-z0-9-]+$/));
});

test('dimensions are positive integers', () => {
  photos.forEach((p) => {
    expect(Number.isInteger(p.width) && p.width > 0).toBe(true);
    expect(Number.isInteger(p.height) && p.height > 0).toBe(true);
  });
});

test('alt text is descriptive (not just the title, not "image of")', () => {
  photos.forEach((p) => {
    expect(p.alt).not.toBe(p.title);
    expect(p.alt).not.toMatch(/^(image|photo|picture) of/i);
    expect(p.alt.length).toBeGreaterThan(20);
  });
});

test('findPhoto returns undefined for an unknown id', () => {
  expect(findPhoto('nope')).toBeUndefined();
  expect(findPhoto('arena-stage')?.title).toBe('Arena Stage');
});

test('seed is immutable', () => {
  expect(Object.isFrozen(photos)).toBe(true);
  expect(Object.isFrozen(photos[0])).toBe(true);
});
