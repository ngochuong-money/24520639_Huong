import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as scoreModule from './calculateScore.js'
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


describe('derived score (5.4)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('equals calculateScore(history) after every kind of change', () => {
    const { result } = setup()
    const check = () => expect(result.current.score).toBe(scoreModule.calculateScore(result.current.history))

    check()
    act(() => result.current.swipe('right'))
    check()
    act(() => result.current.swipe('left'))
    check()
    act(() => result.current.undo())
    check()
    act(() => result.current.undo())
    check()
    act(() => result.current.hydrate(cards, [{ cardId: 'b', direction: 'right' }]))
    check()
    act(() => result.current.hydrate(cards, cards.map((card) => ({ cardId: card.id, direction: 'left' }))))
    check()
    expect(result.current.remaining).toBe(0)
    act(() => result.current.undo())
    check()
  })

  it('does not recompute the score when only an unrelated value changes', () => {
    const spy = vi.spyOn(scoreModule, 'calculateScore')
    const { result } = setup([{ cardId: 'a', direction: 'right' }])
    expect(spy).toHaveBeenCalled()
    const callsAfterSetup = spy.mock.calls.length

    // hydrate with the same history reference keeps state.history identical
    // only if the reducer returns the same state; re-dispatching an invalid
    // direction is a no-op that must not trigger a recalculation.
    act(() => result.current.swipe('sideways'))

    expect(spy.mock.calls.length).toBe(callsAfterSetup)
  })

  it('recomputes exactly when history changes', () => {
    const spy = vi.spyOn(scoreModule, 'calculateScore')
    const { result } = setup()
    const before = spy.mock.calls.length

    act(() => result.current.swipe('right'))

    expect(spy.mock.calls.length).toBeGreaterThan(before)
  })
})

describe('optional initial deck state (5.7)', () => {
  it('reads supplied cards and history synchronously on the first render', () => {
    const history = [{ cardId: 'a', direction: 'right' }]
    const { result } = renderHook(() => useSwipeDeck({ cards, history }))
    expect(result.current.cards).toBe(cards)
    expect(result.current.history).toBe(history)
    expect(result.current.currentCard).toEqual(cards[1])
    expect(result.current.score).toBe(10)
  })

  it('does not reinitialize the reducer when the initial argument changes', () => {
    const { result, rerender } = renderHook(({ initial }) => useSwipeDeck(initial), { initialProps: { initial: { cards, history: [] } } })
    act(() => result.current.swipe('right'))
    rerender({ initial: { cards: [], history: [] } })
    expect(result.current.cards).toBe(cards)
    expect(result.current.history).toEqual([{ cardId: 'a', direction: 'right' }])
  })

  it('keeps null as the empty default', () => {
    const { result } = renderHook(() => useSwipeDeck(null))
    expect(result.current.cards).toEqual([])
    expect(result.current.history).toEqual([])
    expect(result.current.currentCard).toBeNull()
  })
})
