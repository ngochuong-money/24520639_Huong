import { act, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import App from './App.jsx'

const gates = vi.hoisted(() => {
  const createGate = () => {
    let release
    const promise = new Promise((resolve) => {
      release = resolve
    })
    return { promise, release }
  }
  return { gallery: createGate(), deck: createGate() }
})

vi.mock('./features/gallery/GalleryPage.jsx', async () => {
  await gates.gallery.promise
  const { createElement } = await import('react')
  return { default: () => createElement('h1', null, 'Gallery page loaded') }
})

vi.mock('./features/deck/DeckPage.jsx', async () => {
  await gates.deck.promise
  const { createElement } = await import('react')
  return { default: () => createElement('h1', null, 'Deck page loaded') }
})

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('lazy routes', () => {
  it('shows the deck skeleton inside the layout until the deck chunk has loaded', async () => {
    renderAt('/deck')

    const skeleton = screen.getByRole('region', { name: 'Loading swipe deck' })
    expect(skeleton).toHaveAttribute('aria-busy', 'true')
    expect(skeleton).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Deck' })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('heading', { name: 'Deck page loaded' })).not.toBeInTheDocument()

    await act(async () => {
      gates.deck.release()
    })

    const heading = await within(screen.getByRole('main')).findByRole('heading', {
      level: 1,
      name: 'Deck page loaded',
    })
    expect(heading).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: /loading/i })).not.toBeInTheDocument()
  })

  it('shows the gallery skeleton until the gallery chunk has loaded', async () => {
    renderAt('/gallery')

    expect(screen.getByRole('region', { name: 'Loading gallery' })).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Gallery page loaded' })).not.toBeInTheDocument()

    await act(async () => {
      gates.gallery.release()
    })

    expect(
      await within(screen.getByRole('main')).findByRole('heading', {
        level: 1,
        name: 'Gallery page loaded',
      }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: /loading/i })).not.toBeInTheDocument()
  })
})
