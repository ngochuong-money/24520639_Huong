import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SwipeCard from './SwipeCard.jsx'

const CARD = { id: 'a', name: 'Minh Anh', bio: 'Coffee snob.', imageUrl: '/images/cards/card-01.svg' }

// jsdom has no pointer capture; provide stubs so the component's calls do not throw.
function stubPointerCapture(article) {
  article.setPointerCapture = vi.fn()
  article.releasePointerCapture = vi.fn()
  article.hasPointerCapture = vi.fn(() => true)
}

function renderCard(props = {}) {
  const onSwipe = vi.fn()
  const utils = render(<SwipeCard card={CARD} onSwipe={onSwipe} {...props} />)
  const article = screen.getByRole('article')
  stubPointerCapture(article)
  return { ...utils, article, onSwipe }
}

// fireEvent with a PointerEvent-like init: jsdom lacks PointerEvent, so set fields explicitly.
function firePointer(el, type, clientX) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperties(event, {
    clientX: { value: clientX },
    pointerId: { value: 1 },
    button: { value: 0 },
  })
  fireEvent(el, event)
}

describe('SwipeCard structure', () => {
  it('renders an article labelled by the card name with image, name and bio', () => {
    renderCard()
    const article = screen.getByRole('article', { name: 'Minh Anh' })
    expect(article).toHaveClass('deck-card')
    expect(article.querySelector('img')).toHaveAttribute('src', CARD.imageUrl)
    expect(screen.getByRole('heading', { level: 2, name: 'Minh Anh' })).toBeInTheDocument()
    expect(screen.getByText('Coffee snob.')).toBeInTheDocument()
  })

  it('uses no div elements', () => {
    const { container } = renderCard()
    expect(container.querySelectorAll('div')).toHaveLength(0)
  })

})

describe('SwipeCard drag and release', () => {
  it('fires onSwipe("right") when dragged past the threshold to the right', () => {
    const { article, onSwipe } = renderCard()
    firePointer(article, 'pointerdown', 200)
    firePointer(article, 'pointermove', 340)
    firePointer(article, 'pointerup', 340)
    expect(onSwipe).toHaveBeenCalledTimes(1)
    expect(onSwipe).toHaveBeenCalledWith('right')
  })

  it('fires onSwipe("left") when dragged past the threshold to the left', () => {
    const { article, onSwipe } = renderCard()
    firePointer(article, 'pointerdown', 200)
    firePointer(article, 'pointermove', 60)
    firePointer(article, 'pointerup', 60)
    expect(onSwipe).toHaveBeenCalledWith('left')
  })

  it('does not swipe for a drag shorter than the threshold and snaps back', () => {
    const { article, onSwipe } = renderCard()
    firePointer(article, 'pointerdown', 200)
    firePointer(article, 'pointermove', 250)
    firePointer(article, 'pointerup', 250)
    expect(onSwipe).not.toHaveBeenCalled()
    expect(article.style.transform).toBe('translateX(0px)')
  })

  it('moves the card with the pointer while dragging', () => {
    const { article } = renderCard()
    firePointer(article, 'pointerdown', 200)
    firePointer(article, 'pointermove', 260)
    expect(article.style.transform).toBe('translateX(60px)')
  })

  it('ignores moves when no drag is in progress', () => {
    const { article } = renderCard()
    firePointer(article, 'pointermove', 400)
    expect(article.style.transform).toBe('translateX(0px)')
  })

  it('pointer cancel resets the card and never swipes', () => {
    const { article, onSwipe } = renderCard()
    firePointer(article, 'pointerdown', 200)
    firePointer(article, 'pointermove', 400)
    firePointer(article, 'pointercancel', 400)
    expect(onSwipe).not.toHaveBeenCalled()
    expect(article.style.transform).toBe('translateX(0px)')
  })

  it('captures the pointer on pointer down', () => {
    const { article } = renderCard()
    firePointer(article, 'pointerdown', 200)
    expect(article.setPointerCapture).toHaveBeenCalledWith(1)
  })

  it('swipes once per gesture even if pointerup fires twice', () => {
    const { article, onSwipe } = renderCard()
    firePointer(article, 'pointerdown', 200)
    firePointer(article, 'pointermove', 340)
    firePointer(article, 'pointerup', 340)
    firePointer(article, 'pointerup', 340)
    expect(onSwipe).toHaveBeenCalledTimes(1)
  })
})

describe('SwipeCard disabled', () => {
  it('ignores the whole gesture when disabled', () => {
    const { article, onSwipe } = renderCard({ disabled: true })
    firePointer(article, 'pointerdown', 200)
    firePointer(article, 'pointermove', 400)
    firePointer(article, 'pointerup', 400)
    expect(onSwipe).not.toHaveBeenCalled()
    expect(article.style.transform).toBe('translateX(0px)')
  })
})

describe('SwipeCard reduced motion', () => {
  it('exposes the transition only through the stylesheet, never inline', () => {
    const { article } = renderCard()
    expect(article.style.transition).toBe('')
  })
})

describe('SwipeCard contract boundaries', () => {
  it.each([100, -100])('commits a drag of exactly %i pixels', (offset) => {
    const { article, onSwipe } = renderCard()
    firePointer(article, 'pointerdown', 200)
    firePointer(article, 'pointermove', 200 + offset)
    firePointer(article, 'pointerup', 200 + offset)
    expect(onSwipe).toHaveBeenCalledWith(offset > 0 ? 'right' : 'left')
  })

  it('does not commit when disabled during a gesture', () => {
    const { article, onSwipe, rerender } = renderCard()
    firePointer(article, 'pointerdown', 200)
    firePointer(article, 'pointermove', 340)
    rerender(<SwipeCard card={CARD} onSwipe={onSwipe} disabled />)
    firePointer(article, 'pointerup', 340)
    expect(onSwipe).not.toHaveBeenCalled()
    expect(article.style.transform).toBe('translateX(0px)')
  })

  it('keeps transitions in CSS while dragging too', () => {
    const { article } = renderCard()
    firePointer(article, 'pointerdown', 200)
    expect(article.style.transition).toBe('')
  })
})
