import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/client.js'

const hookMock = vi.hoisted(() => vi.fn())
vi.mock('./useSwipePersistence.js', () => ({ useSwipePersistence: hookMock }))

import DeckPage from './DeckPage.jsx'

const card = { id: 'a', name: 'Minh Anh', bio: 'Coffee snob.', imageUrl: '/a.svg' }

function base(overrides = {}) {
  return {
    cards: [card],
    history: [],
    queue: [card],
    currentCard: card,
    remaining: 1,
    score: 0,
    canUndo: false,
    canSwipe: true,
    isSyncing: false,
    status: 'ready',
    error: null,
    swipe: vi.fn(),
    undo: vi.fn(),
    hydrate: vi.fn(),
    retry: vi.fn(),
    ...overrides,
  }
}

beforeEach(() => {
  hookMock.mockReturnValue(base())
})

const renderPage = () =>
  render(
    <MemoryRouter>
      <DeckPage />
    </MemoryRouter>,
  )

describe('DeckPage loading and error states', () => {
  it('shows the deck skeleton while loading', () => {
    hookMock.mockReturnValue(base({ status: 'loading', currentCard: null, canSwipe: false }))
    renderPage()
    expect(screen.getByRole('region', { name: 'Loading swipe deck' })).toHaveAttribute('aria-busy', 'true')
  })

  it('shows a retry button when loading failed', () => {
    const failure = new ApiError(0, 'NETWORK_ERROR', 'x')
    hookMock.mockReturnValue(base({ status: 'error', error: failure, currentCard: null, canSwipe: false }))
    renderPage()
    expect(screen.getByRole('alert')).toHaveTextContent(/connection lost/i)
    expect(screen.getByRole('button', { name: 'Try again' })).toHaveAttribute('type', 'button')
  })

  it('shows a save error next to the working deck without hiding the card', () => {
    const failure = new ApiError(409, 'ALREADY_SWIPED', 'x')
    hookMock.mockReturnValue(base({ error: failure }))
    renderPage()
    expect(screen.getByRole('alert')).toHaveTextContent(/already swiped/i)
    expect(screen.getByRole('heading', { level: 2, name: 'Minh Anh' })).toBeInTheDocument()
  })

  it('shows no alert when there is no error', () => {
    renderPage()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('disables swiping while saving', () => {
    hookMock.mockReturnValue(base({ isSyncing: true, canSwipe: false }))
    renderPage()
    expect(within(screen.getByRole('region', { name: 'Deck controls' })).getByRole('button', { name: 'Swipe left' })).toBeDisabled()
  })

  it('retry reloads the deck through the hook', () => {
    const retry = vi.fn()
    hookMock.mockReturnValue(base({ status: 'error', error: new ApiError(0, 'NETWORK_ERROR', 'x'), currentCard: null, canSwipe: false, retry }))
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(retry).toHaveBeenCalledTimes(1)
  })
})


describe('DeckPage presentation edge cases', () => {
  it('shows an empty state rather than rendering a null SwipeCard', () => {
    hookMock.mockReturnValue(base({ cards: [], queue: [], currentCard: null, remaining: 0, canSwipe: false }))
    renderPage()
    expect(screen.getByText('No cards available.')).toBeInTheDocument()
    expect(screen.queryByRole('article')).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Results' })).toBeNull()
  })

  it('shows Results and the finished status after a nonempty deck is exhausted', () => {
    hookMock.mockReturnValue(base({ history: [{ cardId: 'a', direction: 'right' }], queue: [], currentCard: null, remaining: 0, score: 10, canUndo: true, canSwipe: false }))
    renderPage()
    expect(screen.getByRole('heading', { name: 'Results' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('No more cards.')
    expect(screen.queryByRole('article')).toBeNull()
  })

  it('disables Undo as well as swipe controls while a write is pending', () => {
    hookMock.mockReturnValue(base({ isSyncing: true, canUndo: true, canSwipe: false }))
    renderPage()
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled()
  })

  it('buttons and keyboard dispatch to the same persistence actions', () => {
    const deck = base()
    hookMock.mockReturnValue(deck)
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Swipe left' }))
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(deck.swipe.mock.calls).toEqual([['left'], ['right']])
  })
})
