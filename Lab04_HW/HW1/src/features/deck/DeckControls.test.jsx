import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DeckControls from './DeckControls.jsx'

function renderControls(props = {}) {
  const onSwipe = vi.fn()
  const onUndo = vi.fn()
  render(<DeckControls canSwipe canUndo onSwipe={onSwipe} onUndo={onUndo} {...props} />)
  return { onSwipe, onUndo }
}

describe('DeckControls', () => {
  it('is a labelled section with three native buttons', () => {
    renderControls()
    const section = screen.getByRole('region', { name: 'Deck controls' })
    expect(within(section).getAllByRole('button')).toHaveLength(3)
    expect(within(section).getAllByRole('button').map((button) => button.textContent.trim())).toEqual(['Swipe left', 'Swipe right', 'Undo'])
    section.querySelectorAll('button').forEach((b) => expect(b).toHaveAttribute('type', 'button'))
  })

  it('swipes left and right through onSwipe', () => {
    const { onSwipe } = renderControls()
    fireEvent.click(screen.getByRole('button', { name: 'Swipe left' }))
    fireEvent.click(screen.getByRole('button', { name: 'Swipe right' }))
    expect(onSwipe.mock.calls).toEqual([['left'], ['right']])
  })

  it('calls onUndo from the Undo button', () => {
    const { onUndo } = renderControls()
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(onUndo).toHaveBeenCalledTimes(1)
  })

  it('disables Undo when there is nothing to undo', () => {
    renderControls({ canUndo: false })
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled()
  })

  it('disables swiping when canSwipe is false (deck finished or syncing)', () => {
    renderControls({ canSwipe: false })
    expect(screen.getByRole('button', { name: 'Swipe left' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Swipe right' })).toBeDisabled()
  })

  it('uses no div elements', () => {
    const { container } = render(<DeckControls canSwipe canUndo onSwipe={vi.fn()} onUndo={vi.fn()} />)
    expect(container.querySelectorAll('div')).toHaveLength(0)
  })
})
