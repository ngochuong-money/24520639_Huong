import { isValidDirection } from '../../../shared/validation.js'
import { pop, push } from './undoStack.js'

export const initialDeckState = Object.freeze({ cards: Object.freeze([]), history: Object.freeze([]) })

// Pure: never mutates. Returns the same reference when nothing changes.
export function swipeReducer(state, action) {
  switch (action.type) {
    case 'hydrate':
      return { cards: action.cards, history: action.history }

    case 'swipe': {
      if (!isValidDirection(action.direction)) {
        return state
      }
      const swiped = new Set(state.history.map((entry) => entry.cardId))
      const next = state.cards.find((card) => !swiped.has(card.id))
      if (!next) {
        return state
      }
      return { ...state, history: push(state.history, { cardId: next.id, direction: action.direction }) }
    }

    case 'undo': {
      const { stack, item } = pop(state.history)
      if (item === null) {
        return state
      }
      return { ...state, history: stack }
    }

    default:
      return state
  }
}

