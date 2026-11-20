import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DeckControls from './DeckControls.jsx'
import { useDeckKeyboard } from './useDeckKeyboard.js'
import { useDeckActions } from './useDeckActions.js'
import DeckStatus from './DeckStatus.jsx'

const cards = [
  { id: 'a', name: 'Minh Anh', bio: '', imageUrl: '/a.svg' },
  { id: 'b', name: 'Gia Bao', bio: '', imageUrl: '/b.svg' },
]

// Minimal harness: real hook + status region, no mocks.
function Harness() {
  const deck = useDeckActions(cards)
  return (
    <>
      <DeckStatus message={deck.message} />
      <button type="button" onClick={deck.swipeLeft}>left</button>
      <button type="button" onClick={deck.swipeRight}>right</button>
      <button type="button" onClick={deck.undo} disabled={!deck.canUndo}>undo</button>
    </>
  )
}

describe('status region (5.7)', () => {
  it('is a polite live region that is always rendered, even when empty', () => {
    render(<Harness />)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toBeEmptyDOMElement()
  })

  it('announces a left swipe with the card name', () => {
    render(<Harness />)
    act(() => screen.getByRole('button', { name: 'left' }).click())
    expect(screen.getByRole('status')).toHaveTextContent('Swiped left: Minh Anh.')
  })

  it('announces a right swipe with the card name', () => {
    render(<Harness />)
    act(() => screen.getByRole('button', { name: 'right' }).click())
    expect(screen.getByRole('status')).toHaveTextContent('Swiped right: Minh Anh.')
  })

  it('announces undo with the name of the restored card', () => {
    render(<Harness />)
    act(() => screen.getByRole('button', { name: 'right' }).click())
    act(() => screen.getByRole('button', { name: 'undo' }).click())
    expect(screen.getByRole('status')).toHaveTextContent('Undid swipe on Minh Anh.')
  })

  it('disables undo when there is nothing to undo', () => {
    render(<Harness />)
    expect(screen.getByRole('button', { name: 'undo' })).toBeDisabled()
  })

  it('announces that the deck is finished after the last card', () => {
    render(<Harness />)
    act(() => screen.getByRole('button', { name: 'right' }).click())
    act(() => screen.getByRole('button', { name: 'right' }).click())
    expect(screen.getByRole('status')).toHaveTextContent('No more cards.')
  })

  it('never uses alert() or role="alert" for normal messages', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    render(<Harness />)
    act(() => screen.getByRole('button', { name: 'left' }).click())
    expect(alertSpy).not.toHaveBeenCalled()
    expect(screen.queryByRole('alert')).toBeNull()
    alertSpy.mockRestore()
  })
})

function ControlsHarness() {
  const deck = useDeckActions(cards)
  useDeckKeyboard({ onSwipe: deck.swipe, onUndo: deck.undo })
  return (
    <>
      <DeckControls canSwipe={deck.remaining > 0} canUndo={deck.canUndo} onSwipe={deck.swipe} onUndo={deck.undo} />
      <DeckStatus message={deck.message} />
    </>
  )
}

describe('real controls and event-only messages', () => {
  it('disables the actual Undo control until a swipe, then disables it after undo', () => {
    render(<ControlsHarness />)
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Swipe right' }))
    expect(screen.getByRole('status')).toHaveTextContent('Swiped right: Minh Anh.')
    expect(screen.getByRole('button', { name: 'Undo' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled()
  })

  it('empty undo shortcuts do not create or replace a message', () => {
    render(<ControlsHarness />)
    fireEvent.keyDown(window, { key: 'z' })
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    fireEvent.click(screen.getByRole('button', { name: 'Swipe left' }))
    fireEvent.keyDown(window, { key: 'z' })
    expect(screen.getByRole('status')).toHaveTextContent('Undid swipe on Minh Anh.')
    fireEvent.keyDown(window, { key: 'Backspace' })
    expect(screen.getByRole('status')).toHaveTextContent('Undid swipe on Minh Anh.')
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('undo from the finished deck announces the restored last card', () => {
    render(<ControlsHarness />)
    fireEvent.click(screen.getByRole('button', { name: 'Swipe right' }))
    fireEvent.click(screen.getByRole('button', { name: 'Swipe right' }))
    expect(screen.getByRole('status')).toHaveTextContent('No more cards.')
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(screen.getByRole('status')).toHaveTextContent('Undid swipe on Gia Bao.')
  })

  it('initially empty cards do not announce exhaustion', () => {
    const { result } = renderHook(() => useDeckActions([]))
    expect(result.current.message).toBe('')
    expect(result.current.canUndo).toBe(false)
  })

  it('ignores invalid directions and exposes the same message-aware swipe for all consumers', () => {
    const { result } = renderHook(() => useDeckActions(cards))
    act(() => result.current.swipe('up'))
    expect(result.current.history).toEqual([])
    expect(result.current.message).toBe('')
    act(() => result.current.swipe('right'))
    expect(result.current.history).toEqual([{ cardId: 'a', direction: 'right' }])
    expect(result.current.message).toBe('Swiped right: Minh Anh.')
  })

  it('DeckStatus has an empty default and reserves the page-line frame', () => {
    render(<DeckStatus />)
    expect(screen.getByRole('status')).toHaveClass('page-line')
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })
})
