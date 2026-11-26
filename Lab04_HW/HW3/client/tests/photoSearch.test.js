import { withPhoto, withoutPhoto, toSearch } from '../src/utils/photoSearch.js';

test('withPhoto sets photoId and keeps other params', () => {
  const params = new URLSearchParams('album=x');
  expect(toSearch(withPhoto(params, 'arena-stage'))).toBe('?album=x&photoId=arena-stage');
});

test('withPhoto replaces an existing photoId', () => {
  expect(toSearch(withPhoto(new URLSearchParams('photoId=a'), 'b'))).toBe('?photoId=b');
});

test('withoutPhoto removes only photoId', () => {
  expect(toSearch(withoutPhoto(new URLSearchParams('album=x&photoId=a')))).toBe('?album=x');
  expect(toSearch(withoutPhoto(new URLSearchParams('photoId=a')))).toBe('');
});

test('helpers never mutate the input', () => {
  const params = new URLSearchParams('album=x&photoId=a');
  withPhoto(params, 'b');
  withoutPhoto(params);
  expect(params.toString()).toBe('album=x&photoId=a');
});
