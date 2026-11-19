import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Lightbox from './Lightbox.jsx'

const PHOTO = {
  id: '64f1a2b3c4d5e6f7a8b9c0d1',
  title: 'Evidence 01',
  alt: 'Desk with notes',
  category: 'evidence',
  src: '/images/photos/evidence-01.svg',
  width: 1200,
  height: 800,
}

function renderLightbox(props = {}) {
  const handlers = { onClose: vi.fn(), onPrev: vi.fn(), onNext: vi.fn() }
  const utils = render(<Lightbox photo={null} {...handlers} {...props} />)
  const dialog = screen.getByRole('dialog', { hidden: true })
  return { ...utils, dialog, ...handlers }
}

const rerenderWith = (rerender, props) =>
  rerender(<Lightbox onClose={vi.fn()} onPrev={vi.fn()} onNext={vi.fn()} {...props} />)

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Lightbox structure', () => {
  it('keeps the dialog in the DOM but closed and empty when no photo is open', () => {
    const { dialog } = renderLightbox({ photo: null })
    expect(dialog).not.toHaveAttribute('open')
    expect(dialog.querySelector('img')).toBeNull()
  })

  it('renders a native dialog labelled by the photo title', () => {
    const { dialog } = renderLightbox({ photo: PHOTO })
    expect(dialog.tagName).toBe('DIALOG')
    expect(screen.getByRole('dialog', { name: 'Evidence 01' })).toBe(dialog)
  })

  it('renders the image with alt text, intrinsic size and decoding hint', () => {
    renderLightbox({ photo: PHOTO })
    const img = screen.getByRole('img', { name: 'Desk with notes' })
    expect(img).toHaveAttribute('src', PHOTO.src)
    expect(img).toHaveAttribute('width', '1200')
    expect(img).toHaveAttribute('height', '800')
    expect(img).toHaveAttribute('decoding', 'async')
  })

  it('uses no div elements', () => {
    const { container } = renderLightbox({ photo: PHOTO })
    expect(container.querySelectorAll('div')).toHaveLength(0)
  })
})

describe('Lightbox open and close synced with the photo prop', () => {
  it('opens as a modal when a photo is given', () => {
    const { dialog, rerender } = renderLightbox({ photo: null })
    expect(dialog.hasAttribute('open')).toBe(false)

    rerenderWith(rerender, { photo: PHOTO })

    expect(dialog.hasAttribute('open')).toBe(true)
  })

  it('closes when the photo becomes null', () => {
    const { dialog, rerender } = renderLightbox({ photo: PHOTO })
    rerenderWith(rerender, { photo: null })
    expect(dialog.hasAttribute('open')).toBe(false)
  })

  it('switches between photos without closing or re-opening', () => {
    const { dialog, rerender } = renderLightbox({ photo: PHOTO })
    const other = { ...PHOTO, id: '64f1a2b3c4d5e6f7a8b9c0d2', title: 'Evidence 02', alt: 'Second desk' }

    rerenderWith(rerender, { photo: other })

    expect(dialog.hasAttribute('open')).toBe(true)
    expect(screen.getByRole('img', { name: 'Second desk' })).toBeInTheDocument()
  })
})

describe('Lightbox closing paths all go through the close event', () => {
  it('calls onClose when the dialog fires close (Esc is handled natively by the browser)', () => {
    const { dialog, onClose } = renderLightbox({ photo: PHOTO })
    fireEvent(dialog, new Event('close'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes from the Close button and reports it once through onClose', () => {
    const { dialog, onClose } = renderLightbox({ photo: PHOTO })

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(dialog.hasAttribute('open')).toBe(false)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes on a click on the backdrop (the dialog element itself)', () => {
    const { dialog, onClose } = renderLightbox({ photo: PHOTO })

    fireEvent.click(dialog)

    expect(dialog.hasAttribute('open')).toBe(false)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close when clicking inside the photo', () => {
    const { dialog, onClose } = renderLightbox({ photo: PHOTO })

    fireEvent.click(screen.getByRole('img', { name: 'Desk with notes' }))

    expect(dialog.hasAttribute('open')).toBe(true)
    expect(onClose).not.toHaveBeenCalled()
  })
})

describe('Lightbox navigation', () => {
  it('disables Previous and Next when there is no neighbour', () => {
    renderLightbox({ photo: PHOTO, hasPrev: false, hasNext: false })
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('enables Previous and Next when neighbours exist', () => {
    renderLightbox({ photo: PHOTO, hasPrev: true, hasNext: true })
    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled()
  })

  it('calls onNext and onPrev from the arrow keys when a neighbour exists', () => {
    const { dialog, onPrev, onNext } = renderLightbox({ photo: PHOTO, hasPrev: true, hasNext: true })

    fireEvent.keyDown(dialog, { key: 'ArrowRight' })
    fireEvent.keyDown(dialog, { key: 'ArrowLeft' })

    expect(onNext).toHaveBeenCalledTimes(1)
    expect(onPrev).toHaveBeenCalledTimes(1)
  })

  it('ignores the arrow keys when there is no neighbour', () => {
    const { dialog, onPrev, onNext } = renderLightbox({ photo: PHOTO, hasPrev: false, hasNext: false })

    fireEvent.keyDown(dialog, { key: 'ArrowRight' })
    fireEvent.keyDown(dialog, { key: 'ArrowLeft' })

    expect(onNext).not.toHaveBeenCalled()
    expect(onPrev).not.toHaveBeenCalled()
  })

  it('ignores other keys and never uses keypress or keyCode', () => {
    const { dialog, onPrev, onNext, onClose } = renderLightbox({ photo: PHOTO, hasPrev: true, hasNext: true })

    fireEvent.keyDown(dialog, { key: 'a' })
    fireEvent.keyDown(dialog, { key: 'Enter' })

    expect(onNext).not.toHaveBeenCalled()
    expect(onPrev).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})

describe('Lightbox focus and console hygiene', () => {
  it('returns focus to the element that opened it', () => {
    const { rerender } = render(
      <>
        <button type="button">Open photo</button>
        <Lightbox photo={null} onClose={vi.fn()} />
      </>,
    )
    const opener = screen.getByRole('button', { name: 'Open photo' })

    opener.focus()
    rerender(
      <>
        <button type="button">Open photo</button>
        <Lightbox photo={PHOTO} onClose={vi.fn()} />
      </>,
    )
    const closeButton = screen.getByRole('button', { name: 'Close' })
    closeButton.focus()
    fireEvent.click(closeButton)

    expect(opener).toHaveFocus()
  })

  it('does not reset the opener when switching photos while open', () => {
    const { rerender } = render(
      <>
        <button type="button">Open photo</button>
        <Lightbox photo={null} onClose={vi.fn()} />
      </>,
    )
    const opener = screen.getByRole('button', { name: 'Open photo' })
    opener.focus()
    rerender(
      <>
        <button type="button">Open photo</button>
        <Lightbox photo={PHOTO} onClose={vi.fn()} />
      </>,
    )
    screen.getByRole('button', { name: 'Close' }).focus()
    const other = { ...PHOTO, id: '64f1a2b3c4d5e6f7a8b9c0d2', alt: 'Second desk' }
    rerender(
      <>
        <button type="button">Open photo</button>
        <Lightbox photo={other} onClose={vi.fn()} />
      </>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(opener).toHaveFocus()
  })

  it('renders and closes without console errors or warnings', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { dialog, onClose } = renderLightbox({ photo: PHOTO })
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(dialog.hasAttribute('open')).toBe(false)
    expect(onClose).toHaveBeenCalled()
    expect(consoleError).not.toHaveBeenCalled()
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('Lightbox keyboard navigation (4.6)', () => {
  it('ignores keypress and uses event.key rather than a conflicting legacy keyCode', () => {
    const { dialog, onNext } = renderLightbox({ photo: PHOTO, hasNext: true })
    fireEvent.keyPress(dialog, { key: 'ArrowRight', charCode: 13 })
    expect(onNext).not.toHaveBeenCalled()
    fireEvent.keyDown(dialog, { key: 'a', keyCode: 39 })
    expect(onNext).not.toHaveBeenCalled()
  })

  it('moves focus to Previous when Next is disabled on the last photo', () => {
    const { rerender } = renderLightbox({ photo: PHOTO, hasPrev: true, hasNext: true })
    const next = screen.getByRole('button', { name: 'Next' })
    next.focus()

    rerenderWith(rerender, { photo: PHOTO, hasPrev: true, hasNext: false })

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous' })).toHaveFocus()
  })

  it('moves focus to Next when Previous is disabled on the first photo', () => {
    const { rerender } = renderLightbox({ photo: PHOTO, hasPrev: true, hasNext: true })
    screen.getByRole('button', { name: 'Previous' }).focus()

    rerenderWith(rerender, { photo: PHOTO, hasPrev: false, hasNext: true })

    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus()
  })

  it('does not steal focus when the disabled button was not focused', () => {
    const { rerender } = renderLightbox({ photo: PHOTO, hasPrev: true, hasNext: true })
    screen.getByRole('button', { name: 'Close' }).focus()

    rerenderWith(rerender, { photo: PHOTO, hasPrev: true, hasNext: false })

    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()
  })

  it('lets Escape and Tab reach the browser (the handler does not prevent them)', () => {
    const { dialog, onPrev, onNext } = renderLightbox({ photo: PHOTO, hasPrev: true, hasNext: true })
    const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    dialog.dispatchEvent(escape)
    dialog.dispatchEvent(tab)
    expect(escape.defaultPrevented).toBe(false)
    expect(tab.defaultPrevented).toBe(false)
    expect(onPrev).not.toHaveBeenCalled()
    expect(onNext).not.toHaveBeenCalled()
  })
})
