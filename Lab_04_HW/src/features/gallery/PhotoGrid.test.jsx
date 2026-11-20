import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PhotoGrid from './PhotoGrid.jsx'

const PHOTOS = [
  { id: '64f1a2b3c4d5e6f7a8b9c0d1', title: 'Evidence 01', alt: 'Desk with notes', category: 'evidence', src: '/images/photos/evidence-01.svg', width: 1200, height: 800 },
  { id: '64f1a2b3c4d5e6f7a8b9c0d2', title: 'Scene 01', alt: 'Street at night', category: 'scenes', src: '/images/photos/scenes-01.svg', width: 1200, height: 800 },
  { id: '64f1a2b3c4d5e6f7a8b9c0d3', title: 'Document 01', alt: 'Signed letter', category: 'documents', src: '/images/photos/documents-01.svg', width: 1200, height: 800 },
]

function renderGrid(photos = PHOTOS, onOpen = vi.fn()) {
  return { onOpen, ...render(<PhotoGrid photos={photos} onOpen={onOpen} />) }
}

describe('PhotoGrid structure', () => {
  it('renders a native list with one item per photo', () => {
    renderGrid()
    const list = screen.getByRole('list')
    expect(list).toHaveClass('photo-grid')
    expect(within(list).getAllByRole('listitem')).toHaveLength(PHOTOS.length)
  })

  it('wraps each photo in a figure with a caption', () => {
    const { container } = renderGrid()
    const figures = container.querySelectorAll('figure')
    expect(figures).toHaveLength(PHOTOS.length)
    figures.forEach((figure, index) => {
      expect(figure.querySelector('figcaption')).toHaveTextContent(PHOTOS[index].title)
      expect(figure.querySelector('figcaption')).toHaveClass('photo-tile-caption')
    })
  })

  it('uses no div elements and no index keys (React warns on bad keys)', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { container } = renderGrid()
    expect(container.querySelectorAll('div')).toHaveLength(0)
    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it('renders an empty list without error', () => {
    renderGrid([])
    expect(screen.getByRole('list')).toBeEmptyDOMElement()
  })
})

describe('PhotoGrid images', () => {
  it('gives images intrinsic sizes and prioritizes the first image while lazy-loading the rest', () => {
    renderGrid()
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(PHOTOS.length)
    images.forEach((img, index) => {
      expect(img).toHaveAttribute('alt', PHOTOS[index].alt)
      expect(img).toHaveAttribute('width', '1200')
      expect(img).toHaveAttribute('height', '800')
      expect(img).toHaveAttribute('loading', index === 0 ? 'eager' : 'lazy')
      if (index === 0) expect(img).toHaveAttribute('fetchpriority', 'high')
      expect(img).toHaveAttribute('decoding', 'async')
      expect(img).toHaveAttribute('src', PHOTOS[index].src)
    })
  })

  it('keeps the media box at the 3:2 ratio from layout.css', () => {
    const { container } = renderGrid()
    container.querySelectorAll('img').forEach((img) => {
      expect(img.parentElement).toHaveClass('photo-tile-media')
    })
  })
})

describe('PhotoGrid interaction', () => {
  it('makes each image a button that opens a dialog', () => {
    renderGrid()
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(PHOTOS.length)
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('type', 'button')
      expect(button).toHaveAttribute('aria-haspopup', 'dialog')
      expect(button.querySelector('img')).not.toBeNull()
    })
  })

  it('calls onOpen with the photo id when a tile is clicked', () => {
    const { onOpen } = renderGrid()
    fireEvent.click(screen.getAllByRole('button')[1])
    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(onOpen).toHaveBeenCalledWith(PHOTOS[1].id)
  })

  it('is reachable and activatable from the keyboard', () => {
    const { onOpen } = renderGrid()
    const first = screen.getAllByRole('button')[0]

    first.focus()
    expect(first).toHaveFocus()
    fireEvent.click(first)

    expect(onOpen).toHaveBeenCalledWith(PHOTOS[0].id)
  })

  it('does not make the image itself focusable', () => {
    renderGrid()
    screen.getAllByRole('img').forEach((img) => {
      expect(img).not.toHaveAttribute('tabindex')
    })
  })
})
