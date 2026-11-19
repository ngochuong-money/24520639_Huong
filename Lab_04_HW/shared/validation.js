export const DIRECTIONS = Object.freeze(['left', 'right'])

const CATEGORY_PATTERN = /^[a-z0-9-]{1,32}$/

export function isValidCategory(value) {
  return typeof value === 'string' && CATEGORY_PATTERN.test(value)
}

export const VALIDATION_MESSAGES = Object.freeze({
  category: 'Must be 1-32 characters: lowercase letters, digits or hyphens.',
})
