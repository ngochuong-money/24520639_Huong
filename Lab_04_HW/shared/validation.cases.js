// Shared by shared/validation.test.js (client run) and the server route tests.
// Expected messages are literal on purpose: they pin the text promised in docs/API_CONTRACT.md.
export const VALID_ID = '64f1a2b3c4d5e6f7a8b9c0d1'

export const ID_ERROR = { field: 'cardId', message: 'Must be a 24-character lowercase hex string.' }
export const DIRECTION_ERROR = { field: 'direction', message: 'Must be "left" or "right".' }
export const BODY_ERROR = { field: 'body', message: 'Body must be a JSON object.' }
export const CATEGORY_MESSAGE = 'Must be 1-32 characters: lowercase letters, digits or hyphens.'

export const validIds = [VALID_ID, '000000000000000000000000', 'ffffffffffffffffffffffff']
export const invalidIds = [
  ['23 characters', VALID_ID.slice(0, 23)],
  ['25 characters', `${VALID_ID}0`],
  ['uppercase hex', VALID_ID.toUpperCase()],
  ['non-hex letters', 'g'.repeat(24)],
  ['padded with spaces', ` ${VALID_ID} `],
  ['trailing newline', `${VALID_ID}\n`],
  ['empty string', ''],
  ['null', null],
  ['number', 123],
  ['boolean', true],
  ['array', [VALID_ID]],
  ['object', { id: VALID_ID }],
]

export const invalidDirections = [
  ['uppercase', 'RIGHT'],
  ['capitalised', 'Left'],
  ['leading space', ' left'],
  ['trailing newline', 'right\n'],
  ['empty string', ''],
  ['unknown word', 'up'],
  ['null', null],
  ['number', 1],
  ['boolean', false],
  ['array', ['left']],
]

export const validCategories = ['evidence', 'scenes', 'a', 'a-b', '0-9', 'x'.repeat(32)]
export const invalidCategories = [
  ['empty string', ''],
  ['uppercase', 'UPPER'],
  ['space', 'Bad Slug'],
  ['underscore', 'a_b'],
  ['accent', 'café'],
  ['33 characters', 'x'.repeat(33)],
  ['trailing newline', 'evidence\n'],
  ['null', null],
  ['number', 5],
  ['array', ['evidence']],
]

// Only inputs that can travel as a JSON object or array (the server's body parser rejects other JSON).
export const swipeInputCases = [
  { name: 'valid right swipe', input: { cardId: VALID_ID, direction: 'right' }, errors: [] },
  { name: 'valid left swipe', input: { cardId: VALID_ID, direction: 'left' }, errors: [] },
  { name: 'extra fields are ignored', input: { cardId: VALID_ID, direction: 'left', extra: 1 }, errors: [] },
  { name: 'missing cardId', input: { direction: 'left' }, errors: [ID_ERROR] },
  { name: 'missing direction', input: { cardId: VALID_ID }, errors: [DIRECTION_ERROR] },
  { name: 'empty object', input: {}, errors: [ID_ERROR, DIRECTION_ERROR] },
  { name: 'both fields invalid', input: { cardId: 'abc', direction: 'up' }, errors: [ID_ERROR, DIRECTION_ERROR] },
  ...invalidIds.map(([label, value]) => ({
    name: `cardId: ${label}`,
    input: { cardId: value, direction: 'left' },
    errors: [ID_ERROR],
  })),
  ...invalidDirections.map(([label, value]) => ({
    name: `direction: ${label}`,
    input: { cardId: VALID_ID, direction: value },
    errors: [DIRECTION_ERROR],
  })),
  { name: 'empty array body', input: [], errors: [BODY_ERROR] },
  { name: 'array body with a swipe inside', input: [{ cardId: VALID_ID, direction: 'left' }], errors: [BODY_ERROR] },
]
