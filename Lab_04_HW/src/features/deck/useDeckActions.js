import { isValidDirection } from '../../../shared/validation.js'
import { useCallback, useState } from 'react'
import { useSwipeDeck } from './useSwipeDeck.js'

// Connects the deck state to user-facing messages. Messages are event-driven,
// so they are set in the action handlers, never in an effect.
export function useDeckActions(cards) {
  const deck = useSwipeDeck({ cards, history: [] })
  const [message, setMessage] = useState('')


  const swipe = useCallback(
    (direction) => {
      const card = deck.currentCard
      if (!card || !isValidDirection(direction)) {
        return
      }
      deck.swipe(direction)
      setMessage(`Swiped ${direction}: ${card.name}.`)
    },
    [deck],
  )

  const undo = useCallback(() => {
    const last = deck.history[deck.history.length - 1]
    if (!last) {
      return
    }
    const name = deck.cards.find((card) => card.id === last.cardId)?.name ?? 'card'
    deck.undo()
    setMessage(`Undid swipe on ${name}.`)
  }, [deck])

  const finishedMessage = deck.currentCard === null && deck.history.length > 0 ? 'No more cards.' : message

  return {
    ...deck,
    swipe,
    message: finishedMessage,
    swipeLeft: () => swipe('left'),
    swipeRight: () => swipe('right'),
    undo,
  }
}
