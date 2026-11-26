import { describe, expect, it } from 'vitest'
import {
  BODY_ERROR,
  CATEGORY_MESSAGE,
  DIRECTION_ERROR,
  ID_ERROR,
  invalidCategories,
  invalidDirections,
  invalidIds,
  swipeInputCases,
  validCategories,
  validIds,
} from './validation.cases.js'
import {
  DIRECTIONS,
  VALIDATION_MESSAGES,
  isValidCategory,
  isValidDirection,
  isValidId,
  validateSwipeInput,
} from './validation.js'

describe('DIRECTIONS', () => {
  it('is a frozen [left, right]', () => {
    expect(DIRECTIONS).toEqual(['left', 'right'])
    expect(Object.isFrozen(DIRECTIONS)).toBe(true)
  })
})

describe('isValidId', () => {
  it.each(validIds)('accepts %s', (id) => {
    expect(isValidId(id)).toBe(true)
  })

  it.each(invalidIds)('rejects %s', (label, value) => {
    expect(isValidId(value)).toBe(false)
  })
})

describe('isValidDirection', () => {
  it.each(['left', 'right'])('accepts %s', (direction) => {
    expect(isValidDirection(direction)).toBe(true)
  })

  it.each(invalidDirections)('rejects %s', (label, value) => {
    expect(isValidDirection(value)).toBe(false)
  })
})

describe('isValidCategory', () => {
  it.each(validCategories)('accepts %s', (category) => {
    expect(isValidCategory(category)).toBe(true)
  })

  it.each(invalidCategories)('rejects %s', (label, value) => {
    expect(isValidCategory(value)).toBe(false)
  })
})

describe('validateSwipeInput', () => {
  it.each(swipeInputCases)('$name', ({ input, errors }) => {
    expect(validateSwipeInput(input)).toEqual(errors)
  })

  it.each([undefined, null, 'text', 5, true])('reports a body error for the non-object input %s', (input) => {
    expect(validateSwipeInput(input)).toEqual([BODY_ERROR])
  })
})

describe('VALIDATION_MESSAGES', () => {
  it('matches the texts promised in the API contract', () => {
    expect(VALIDATION_MESSAGES).toEqual({
      body: BODY_ERROR.message,
      cardId: ID_ERROR.message,
      direction: DIRECTION_ERROR.message,
      category: CATEGORY_MESSAGE,
    })
  })
})
