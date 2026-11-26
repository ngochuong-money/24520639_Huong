import { act, render, renderHook, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useDeckActions } from './useDeckActions.js'
import { useDeckKeyboard } from './useDeckKeyboard.js'
import DeckControls from './DeckControls.jsx'
import DeckStatus from './DeckStatus.jsx'
import SwipeCard from './SwipeCard.jsx'

const cards = [
  { id: 'a', name: 'Minh Anh', bio: '', imageUrl: '/a.svg' },
  { id: 'b', name: 'Gia Bao', bio: '', imageUrl: '/b.svg' },
  { id: 'c', name: 'Thu Ha', bio: '', imageUrl: '/c.svg' },
]

// Real hooks composed the way DeckPage will compose them: actions + keyboard on one deck.
function setupDeck() {
  const hook = renderHook(() => {
    const deck = useDeckActions(cards)
    useDeckKeyboard({ onSwipe: (direction) => deck.swipe(direction), onUndo: deck.undo })
    return deck
  })
  return hook
}

const press = (key, init = {}) =>
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }))
  })

afterEach(() => {
  document.body.innerHTML = ''
})

describe('full swipe through the deck (swipe)', () => {
  it('swipes every card once and scores by the contract constants', () => {
    const { result } = setupDeck()

    act(() => result.current.swipeRight()) // +10
    act(() => result.current.swipeLeft()) // -5
    act(() => result.current.swipeRight()) // +10

    expect(result.current.currentCard).toBeNull()
    expect(result.current.remaining).toBe(0)
    expect(result.current.score).toBe(15)
    expect(result.current.history.map((entry) => entry.cardId)).toEqual(['a', 'b', 'c'])
    expect(result.current.message).toBe('No more cards.')
  })

  it('a swipe on a finished deck changes nothing', () => {
    const { result } = setupDeck()
    act(() => {
      result.current.swipeRight()
      result.current.swipeRight()
      result.current.swipeRight()
    })
    const before = result.current.history
    act(() => result.current.swipeLeft())
    expect(result.current.history).toBe(before)
    expect(result.current.score).toBe(30)
  })
})

describe('multiple undos (undo)', () => {
  it('undoes in LIFO order and restores the current card and score each step', () => {
    const { result } = setupDeck()
    act(() => result.current.swipeRight()) // a: +10
    act(() => result.current.swipeLeft()) // b: -5

    act(() => result.current.undo())
    expect(result.current.currentCard.id).toBe('b')
    expect(result.current.score).toBe(10)

    act(() => result.current.undo())
    expect(result.current.currentCard.id).toBe('a')
    expect(result.current.score).toBe(0)
    expect(result.current.canUndo).toBe(false)
  })

  it('undo past the bottom of the stack is a no-op', () => {
    const { result } = setupDeck()
    act(() => result.current.swipeRight())
    act(() => result.current.undo())
    const before = result.current.history
    act(() => result.current.undo())
    act(() => result.current.undo())
    expect(result.current.history).toBe(before)
    expect(result.current.history).toEqual([])
  })

  it('a card can be swiped again with a new direction after its undo', () => {
    const { result } = setupDeck()
    act(() => result.current.swipeLeft())
    act(() => result.current.undo())
    act(() => result.current.swipeRight())
    expect(result.current.history).toEqual([{ cardId: 'a', direction: 'right' }])
    expect(result.current.score).toBe(10)
  })

  it('undo after finishing the deck brings back the last card and clears the finished message', () => {
    const { result } = setupDeck()
    act(() => {
      result.current.swipeRight()
      result.current.swipeRight()
      result.current.swipeRight()
    })
    act(() => result.current.undo())
    expect(result.current.currentCard.id).toBe('c')
    expect(result.current.message).toBe('Undid swipe on Thu Ha.')
  })
})

describe('keyboard parity (keyboard)', () => {
  it('arrow keys and the Undo key produce the same history as the action functions', () => {
    const viaKeys = setupDeck()
    press('ArrowRight')
    press('ArrowLeft')
    press('Backspace')

    const viaActions = setupDeck()
    act(() => viaActions.result.current.swipeRight())
    act(() => viaActions.result.current.swipeLeft())
    act(() => viaActions.result.current.undo())

    expect(viaKeys.result.current.history).toEqual(viaActions.result.current.history)
    expect(viaKeys.result.current.score).toBe(viaActions.result.current.score)
  })

  it('"z" and "Z" both undo', () => {
    const { result } = setupDeck()
    act(() => result.current.swipeRight())
    press('z')
    expect(result.current.history).toEqual([])
    act(() => result.current.swipeRight())
    press('Z')
    expect(result.current.history).toEqual([])
  })

  it('typing in a text field does not swipe or undo the deck', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)
    const { result } = setupDeck()
    act(() => result.current.swipeRight())

    act(() => {
      input.focus()
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', bubbles: true }))
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    })

    expect(result.current.history).toEqual([{ cardId: 'a', direction: 'right' }])
  })

  it('auto-repeated arrow keys swipe at most once', () => {
    const { result } = setupDeck()
    press('ArrowRight')
    press('ArrowRight', { repeat: true })
    press('ArrowRight', { repeat: true })
    expect(result.current.history).toHaveLength(1)
  })
})

describe('controls and status stay in step with the deck', () => {
  function Screen() {
    const deck = useDeckActions(cards)
    useDeckKeyboard({ onSwipe: deck.swipe, onUndo: deck.undo })
    return (
      <>
        <DeckStatus message={deck.message} />
        <DeckControls
          canSwipe={deck.currentCard !== null}
          canUndo={deck.canUndo}
          onSwipe={deck.swipe}
          onUndo={deck.undo}
        />
      </>
    )
  }

  it('the Undo button enables after a swipe and disables after undoing it', () => {
    render(<Screen />)
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled()
    act(() => screen.getByRole('button', { name: 'Swipe right' }).click())
    expect(screen.getByRole('button', { name: 'Undo' })).toBeEnabled()
    act(() => screen.getByRole('button', { name: 'Undo' }).click())
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled()
  })

  it('the status announcement follows the last keyboard action', () => {
    render(<Screen />)
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    })
    expect(screen.getByRole('status')).toHaveTextContent('Swiped left: Minh Anh.')
  })
})

// Exercise the real pointer, controls and keyboard paths against the same reducer.
function UnifiedScreen() {
  const deck = useDeckActions(cards)
  useDeckKeyboard({ onSwipe: deck.swipe, onUndo: deck.undo })
  return (
    <>
      {deck.currentCard && <SwipeCard key={deck.currentCard.id} card={deck.currentCard} onSwipe={deck.swipe} />}
      <DeckControls canSwipe={deck.currentCard !== null} canUndo={deck.canUndo} onSwipe={deck.swipe} onUndo={deck.undo} />
      <DeckStatus message={deck.message} />
      <pre data-testid="deck-state">{JSON.stringify({ history: deck.history, score: deck.score })}</pre>
    </>
  )
}

function pointerSwipe(direction) {
  const article = screen.getByRole('article')
  // jsdom platform stubs only; no deck logic is mocked.
  article.setPointerCapture = () => {}
  article.releasePointerCapture = () => {}
  article.hasPointerCapture = () => true
  for (const [type, clientX] of [['pointerdown', 200], ['pointermove', direction === 'right' ? 340 : 60], ['pointerup', direction === 'right' ? 340 : 60]]) {
    act(() => {
      const event = new Event(type, { bubbles: true, cancelable: true })
      Object.defineProperties(event, {
        clientX: { value: clientX }, pointerId: { value: 1 }, button: { value: 0 },
      })
      article.dispatchEvent(event)
    })
  }
}

it('pointer, buttons and keyboard produce identical histories and scores', () => {
  const state = () => JSON.parse(screen.getByTestId('deck-state').textContent)
  const pointer = render(<UnifiedScreen />)
  pointerSwipe('right')
  pointerSwipe('left')
  press('z')
  const expected = { history: [{ cardId: 'a', direction: 'right' }], score: 10 }
  expect(state()).toEqual(expected)
  pointer.unmount()

  const buttons = render(<UnifiedScreen />)
  for (const name of ['Swipe right', 'Swipe left', 'Undo']) {
    act(() => screen.getByRole('button', { name }).click())
  }
  expect(state()).toEqual(expected)
  buttons.unmount()

  render(<UnifiedScreen />)
  press('ArrowRight')
  press('ArrowLeft')
  press('Backspace')
  expect(state()).toEqual(expected)
})
