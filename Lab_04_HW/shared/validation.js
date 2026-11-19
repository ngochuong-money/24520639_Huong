export const DIRECTIONS = Object.freeze(['left', 'right'])

const ID_PATTERN = /^[0-9a-f]{24}$/
const CATEGORY_PATTERN = /^[a-z0-9-]{1,32}$/

export const VALIDATION_MESSAGES = Object.freeze({
  body: 'Body must be a JSON object.',
  cardId: 'Must be a 24-character lowercase hex string.',
  direction: 'Must be "left" or "right".',
  category: 'Must be 1-32 characters: lowercase letters, digits or hyphens.',
})

export function isValidId(value) {
  return typeof value === 'string' && ID_PATTERN.test(value)
}

export function isValidDirection(value) {
  return DIRECTIONS.includes(value)
}

export function isValidCategory(value) {
  return typeof value === 'string' && CATEGORY_PATTERN.test(value)
}

// Returns every problem found ([] means valid). Never throws.
export function validateSwipeInput(input) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return [{ field: 'body', message: VALIDATION_MESSAGES.body }]
  }

  const errors = []
  if (!isValidId(input.cardId)) {
    errors.push({ field: 'cardId', message: VALIDATION_MESSAGES.cardId })
  }
  if (!isValidDirection(input.direction)) {
    errors.push({ field: 'direction', message: VALIDATION_MESSAGES.direction })
  }
  return errors
}
