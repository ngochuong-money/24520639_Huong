import { describe, expect, it } from 'vitest'
import { SCORE_BY_DIRECTION, calculateScore } from './calculateScore.js'

const entry = (direction, cardId = 'c') => ({ cardId, direction })

describe('SCORE_BY_DIRECTION', () => {
  it('matches the constants in docs/API_CONTRACT.md section 7', () => {
    expect(SCORE_BY_DIRECTION).toEqual({ right: 10, left: -5 })
  })

  it('is frozen', () => {
    expect(Object.isFrozen(SCORE_BY_DIRECTION)).toBe(true)
  })
})

describe('calculateScore reference cases (contract section 7)', () => {
  it.each([
    [[], 0],
    [[entry('right')], 10],
    [[entry('left')], -5],
    [[entry('right'), entry('right')], 20],
    [[entry('left'), entry('left'), entry('left')], -15],
    [[entry('right'), entry('left'), entry('right')], 15],
    [[entry('right'), entry('left')], 5],
    [[entry('right'), entry('up')], 10],
  ])('history %j scores %i', (history, expected) => {
    expect(calculateScore(history)).toBe(expected)
  })
})

describe('calculateScore rules', () => {
  it('does not depend on order', () => {
    const a = [entry('right'), entry('left'), entry('right')]
    const b = [entry('left'), entry('right'), entry('right')]
    expect(calculateScore(a)).toBe(calculateScore(b))
  })

  it('never mutates the history', () => {
    const history = Object.freeze([Object.freeze(entry('right'))])
    expect(() => calculateScore(history)).not.toThrow()
    expect(history).toHaveLength(1)
  })

  it('may be negative and is not clamped', () => {
    expect(calculateScore([entry('left'), entry('left')])).toBe(-10)
  })

  it('returns an integer', () => {
    expect(Number.isInteger(calculateScore([entry('right'), entry('left')]))).toBe(true)
  })

  it('ignores unknown directions (contributes 0)', () => {
    expect(calculateScore([entry('sideways'), entry('up')])).toBe(0)
  })

  it('is a pure function: same input, same output', () => {
    const history = [entry('right'), entry('left')]
    expect(calculateScore(history)).toBe(calculateScore(history))
  })
  it('does not read inherited properties such as "constructor"', () => {
    expect(calculateScore([entry('constructor')])).toBe(0)
    expect(calculateScore([entry('toString')])).toBe(0)
  })

})
