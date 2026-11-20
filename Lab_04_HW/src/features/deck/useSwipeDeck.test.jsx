import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useSwipeDeck } from './useSwipeDeck.js'

const cards = [
  { id: 'a', name: 'A' },
  { id: 'b', name: 'B' },
  { id: 'c', name: 'C' },
]

function setup(history = []) {
  const hook = renderHook(() => useSwipeDeck())
  act(() => hook.result.current.hydrate(cards, history))
  return hook
}

describe('useSwipeDeck derived values', () => {
  it('exposes the first card as currentCard and the rest as the queue', () => {
    const { result } = setup()
    expect(result.current.currentCard).toEqual(cards[0])
    expect(result.current.remaining).toBe(3)
  })

  it('excludes swiped cards from the queue', () => {
    const { result } = setup([{ cardId: 'a', direction: 'right' }])
    expect(result.current.currentCard).toEqual(cards[1])
    expect(result.current.remaining).toBe(2)
  })

  it('currentCard is null and remaining is 0 when the deck is finished', () => {
    const { result } = setup(cards.map((card) => ({ cardId: card.id, direction: 'left' })))
    expect(result.current.currentCard).toBeNull()
    expect(result.current.remaining).toBe(0)
  })

  it('canUndo reflects history length', () => {
    const { result } = setup()
    expect(result.current.canUndo).toBe(false)
    act(() => result.current.swipe('right'))
    expect(result.current.canUndo).toBe(true)
  })

  it('score is derived from history (right +10, left -5)', () => {
    const { result } = setup()
    act(() => result.current.swipe('right'))
    act(() => result.current.swipe('left'))
    expect(result.current.score).toBe(5)
  })

  it('score returns to the previous value after undo', () => {
    const { result } = setup()
    act(() => result.current.swipe('right'))
    act(() => result.current.undo())
    expect(result.current.score).toBe(0)
  })
})

describe('useSwipeDeck actions', () => {
  it('swipe advances the queue and records the card id', () => {
    const { result } = setup()
    act(() => result.current.swipe('left'))
    expect(result.current.history).toEqual([{ cardId: 'a', direction: 'left' }])
    expect(result.current.currentCard).toEqual(cards[1])
  })

  it('undo brings the last card back to the front', () => {
    const { result } = setup()
    act(() => result.current.swipe('right'))
    act(() => result.current.swipe('right'))
    act(() => result.current.undo())
    expect(result.current.currentCard).toEqual(cards[1])
  })

  it('swipe on a finished deck is a no-op', () => {
    const { result } = setup(cards.map((card) => ({ cardId: card.id, direction: 'right' })))
    const before = result.current.history
    act(() => result.current.swipe('left'))
    expect(result.current.history).toBe(before)
  })

  it('undo on an empty history is a no-op', () => {
    const { result } = setup()
    const before = result.current.history
    act(() => result.current.undo())
    expect(result.current.history).toBe(before)
  })

  it('ignores an unknown direction', () => {
    const { result } = setup()
    const before = result.current.history
    act(() => result.current.swipe('sideways'))
    expect(result.current.history).toBe(before)
  })

  it('keeps stable action functions across renders', () => {
    const { result, rerender } = setup()
    const first = result.current.swipe
    rerender()
    expect(result.current.swipe).toBe(first)
  })
})
