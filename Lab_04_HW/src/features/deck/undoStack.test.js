import { describe, expect, it } from 'vitest'
import { peek, pop, push } from './undoStack.js'

describe('push', () => {
  it('returns a new array with the item on top', () => {
    const stack = ['a']
    const next = push(stack, 'b')
    expect(next).toEqual(['a', 'b'])
    expect(next).not.toBe(stack)
  })

  it('never mutates the input', () => {
    const stack = Object.freeze(['a'])
    expect(() => push(stack, 'b')).not.toThrow()
    expect(stack).toEqual(['a'])
  })

  it('pushes onto an empty stack', () => {
    expect(push([], 'x')).toEqual(['x'])
  })
})

describe('pop', () => {
  it('returns the top item and the remaining stack (LIFO)', () => {
    const { stack, item } = pop(['a', 'b', 'c'])
    expect(item).toBe('c')
    expect(stack).toEqual(['a', 'b'])
  })

  it('does not mutate the input', () => {
    const input = Object.freeze(['a', 'b'])
    expect(() => pop(input)).not.toThrow()
    expect(input).toEqual(['a', 'b'])
  })

  it('on an empty stack returns the same stack and a null item', () => {
    const empty = []
    const result = pop(empty)
    expect(result.item).toBeNull()
    expect(result.stack).toBe(empty)
  })

  it('push then pop returns the pushed item (round trip)', () => {
    const { item, stack } = pop(push(['a'], 'b'))
    expect(item).toBe('b')
    expect(stack).toEqual(['a'])
  })

  it('undoing repeatedly drains the stack in reverse order', () => {
    let stack = ['1', '2', '3']
    const order = []
    for (;;) {
      const result = pop(stack)
      if (result.item === null) break
      order.push(result.item)
      stack = result.stack
    }
    expect(order).toEqual(['3', '2', '1'])
    expect(stack).toEqual([])
  })
})

describe('peek', () => {
  it('returns the top item without changing the stack', () => {
    const stack = ['a', 'b']
    expect(peek(stack)).toBe('b')
    expect(stack).toEqual(['a', 'b'])
  })

  it('returns null for an empty stack', () => {
    expect(peek([])).toBeNull()
  })
})
