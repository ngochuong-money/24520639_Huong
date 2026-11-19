import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Skeleton from './Skeleton.jsx'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Skeleton', () => {
  it.each([
    [undefined, 'Loading gallery'],
    ['gallery', 'Loading gallery'],
    ['deck', 'Loading swipe deck'],
    ['unknown', 'Loading gallery'],
  ])('variant %s is a busy, polite live region named "%s"', (variant, name) => {
    render(<Skeleton variant={variant} />)

    const region = screen.getByRole('region', { name })

    expect(region).toHaveAttribute('aria-busy', 'true')
    expect(region).toHaveAttribute('aria-live', 'polite')
    expect(region).toHaveClass('page')
    expect(within(region).getByText(`${name}…`)).toBeInTheDocument()
  })

  it('gallery variant mirrors the gallery layout: title, filter row, status line, 12 tiles', () => {
    const { container } = render(<Skeleton variant="gallery" />)

    expect(container.querySelectorAll('.page-title')).toHaveLength(1)
    expect(container.querySelectorAll('.filter-row')).toHaveLength(1)
    expect(container.querySelectorAll('.page-line')).toHaveLength(1)
    const tiles = container.querySelectorAll('.photo-tile')
    expect(tiles).toHaveLength(12)
    tiles.forEach((tile) => {
      expect(tile.querySelector('.photo-tile-media')).not.toBeNull()
      expect(tile.querySelector('.photo-tile-caption')).not.toBeNull()
    })
    expect(container.querySelector('.deck-card')).toBeNull()
  })

  it('deck variant mirrors the deck layout: title, score line, card, 3 controls, status line', () => {
    const { container } = render(<Skeleton variant="deck" />)

    expect(container.querySelectorAll('.page-title')).toHaveLength(1)
    expect(container.querySelectorAll('.page-line')).toHaveLength(2)
    expect(container.querySelectorAll('.deck-card')).toHaveLength(1)
    expect(container.querySelectorAll('.deck-controls')).toHaveLength(1)
    expect(container.querySelectorAll('.deck-control')).toHaveLength(3)
    expect(container.querySelector('.photo-grid')).toBeNull()
  })

  it.each(['gallery', 'deck'])('hides every %s placeholder from assistive technology', (variant) => {
    render(<Skeleton variant={variant} />)
    const region = screen.getByRole('region')

    Array.from(region.children)
      .filter((child) => !child.classList.contains('visually-hidden'))
      .forEach((child) => {
        expect(child).toHaveAttribute('aria-hidden', 'true')
      })
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.queryAllByRole('link')).toHaveLength(0)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('uses no div elements and logs no React warnings (keys)', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { container } = render(
      <>
        <Skeleton variant="gallery" />
        <Skeleton variant="deck" />
      </>,
    )

    expect(container.querySelectorAll('div')).toHaveLength(0)
    expect(consoleError).not.toHaveBeenCalled()
  })
})
