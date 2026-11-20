import { describe, expect, it } from 'vitest'
import { swipeReducer } from './swipeReducer.js'

const cards = [
  { id: 'a', name: 'A' },
  { id: 'b', name: 'B' },
  { id: 'c', name: 'C' },
]
const initial = Object.freeze({ cards: Object.freeze(cards), history: Object.freeze([]) })

const hydrated = (history = []) => swipeReducer(initial, { type: 'hydrate', cards, history })

describe('hydrate', () => {
  it('replaces cards and history', () => {
    const state = swipeReducer(initial, { type: 'hydrate', cards, history: [{ cardId: 'a', direction: 'right' }] })
    expect(state.cards).toEqual(cards)
    expect(state.history).toEqual([{ cardId: 'a', direction: 'right' }])
  })
})

describe('swipe', () => {
  it('appends an entry for the first card still in the queue', () => {
    const state = swipeReducer(hydrated(), { type: 'swipe', direction: 'right' })
    expect(state.history).toEqual([{ cardId: 'a', direction: 'right' }])
  })

  it('moves on to the next card on the next swipe', () => {
    const once = swipeReducer(hydrated(), { type: 'swipe', direction: 'left' })
    const twice = swipeReducer(once, { type: 'swipe', direction: 'right' })
    expect(twice.history).toEqual([
      { cardId: 'a', direction: 'left' },
      { cardId: 'b', direction: 'right' },
    ])
  })

  it('does nothing when the deck is exhausted and returns the same state', () => {
    let state = hydrated()
    for (let i = 0; i < cards.length; i += 1) {
      state = swipeReducer(state, { type: 'swipe', direction: 'right' })
    }
    const after = swipeReducer(state, { type: 'swipe', direction: 'left' })
    expect(after).toBe(state)
  })

  it('ignores an unknown direction and returns the same state', () => {
    const state = hydrated()
    expect(swipeReducer(state, { type: 'swipe', direction: 'up' })).toBe(state)
  })

  it('never mutates the previous state', () => {
    const state = hydrated([{ cardId: 'a', direction: 'left' }])
    const snapshot = JSON.stringify(state)
    swipeReducer(state, { type: 'swipe', direction: 'right' })
    expect(JSON.stringify(state)).toBe(snapshot)
  })
})

describe('undo', () => {
  it('removes the last entry (LIFO)', () => {
    const state = hydrated([
      { cardId: 'a', direction: 'left' },
      { cardId: 'b', direction: 'right' },
    ])
    const after = swipeReducer(state, { type: 'undo' })
    expect(after.history).toEqual([{ cardId: 'a', direction: 'left' }])
  })

  it('returns the same state when history is empty', () => {
    const state = hydrated()
    expect(swipeReducer(state, { type: 'undo' })).toBe(state)
  })

  it('restores the card to the front of the queue after undo', () => {
    let state = hydrated()
    state = swipeReducer(state, { type: 'swipe', direction: 'right' })
    state = swipeReducer(state, { type: 'undo' })
    expect(state.history).toEqual([])
  })
})

describe('unknown action', () => {
  it('returns the same state', () => {
    const state = hydrated()
    expect(swipeReducer(state, { type: 'nope' })).toBe(state)
  })
})
