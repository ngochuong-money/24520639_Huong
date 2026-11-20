import { useCallback, useMemo, useReducer } from 'react'
import { calculateScore } from './calculateScore.js'
import { initialDeckState, swipeReducer } from './swipeReducer.js'

export function useSwipeDeck() {
  const [state, dispatch] = useReducer(swipeReducer, initialDeckState)

  // Stable action creators: they only dispatch, so identity never changes.
  const hydrate = useCallback((cards, history) => dispatch({ type: 'hydrate', cards, history }), [])
  const swipe = useCallback((direction) => dispatch({ type: 'swipe', direction }), [])
  const undo = useCallback(() => dispatch({ type: 'undo' }), [])

  // Derived during render, never stored. Recomputed only when the state changes.
  return useMemo(() => {
    const swiped = new Set(state.history.map((entry) => entry.cardId))
    const queue = state.cards.filter((card) => !swiped.has(card.id))
    return {
      cards: state.cards,
      history: state.history,
      queue,
      currentCard: queue[0] ?? null,
      remaining: queue.length,
      score: calculateScore(state.history),
      canUndo: state.history.length > 0,
      hydrate,
      swipe,
      undo,
    }
  }, [state, hydrate, swipe, undo])
}
