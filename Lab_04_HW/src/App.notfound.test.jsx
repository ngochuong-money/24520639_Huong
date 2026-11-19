import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App.jsx'

const VALID_ID = '64f1a2b3c4d5e6f7a8b9c0d1'

function renderApp(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

// Pages are lazy-loaded, so headings appear asynchronously.
const findMainHeading = (name) =>
  within(screen.getByRole('main')).findByRole('heading', { level: 1, name })

afterEach(() => {
  vi.restoreAllMocks()
})

describe('paths that fall through to the not-found state', () => {
  it.each([
    ['an id-shaped path under gallery (deep links use ?photo=)', `/gallery/${VALID_ID}`],
    ['an id-shaped path under deck', `/deck/${VALID_ID}`],
    ['a nested unknown path', '/gallery/photos/1'],
    ['an unknown top-level path', '/photos'],
    ['an encoded non-ASCII path', '/caf%C3%A9'],
    ['a file-like path', '/index.html'],
    ['an unknown path that carries query parameters', `/nope?category=evidence&photo=${VALID_ID}`],
  ])('%s', async (label, path) => {
    renderApp(path)

    expect(await findMainHeading('Page not found')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to gallery' })).toHaveAttribute('href', '/gallery')
  })

  it('keeps the layout, a single main landmark and a single h1', async () => {
    renderApp(`/gallery/${VALID_ID}`)
    await findMainHeading('Page not found')

    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('renders without console errors or warnings', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    renderApp('/nope')
    await findMainHeading('Page not found')

    expect(consoleError).not.toHaveBeenCalled()
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  it('recovers: the navigation still works from the not-found state', async () => {
    renderApp('/nope')
    await findMainHeading('Page not found')

    fireEvent.click(screen.getByRole('link', { name: 'Deck' }))

    expect(await findMainHeading('Swipe Deck')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Page not found' })).not.toBeInTheDocument()
  })
})

describe('paths that still match a page', () => {
  it.each([
    ['a trailing slash on gallery', '/gallery/', 'Gallery'],
    ['a trailing slash on deck', '/deck/', 'Swipe Deck'],
    ['different letter case (React Router default)', '/GALLERY', 'Gallery'],
  ])('%s', async (label, path, heading) => {
    renderApp(path)

    expect(await findMainHeading(heading)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Page not found' })).not.toBeInTheDocument()
  })
})
