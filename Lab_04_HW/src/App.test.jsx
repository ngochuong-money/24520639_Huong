import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router'
import { describe, expect, it } from 'vitest'
import App from './App.jsx'

function LocationProbe() {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <>
      <p data-testid="pathname">{location.pathname}</p>
      <button type="button" onClick={() => navigate(-1)}>
        Probe back
      </button>
    </>
  )
}

function renderApp(entries) {
  return render(
    <MemoryRouter initialEntries={entries}>
      <App />
      <LocationProbe />
    </MemoryRouter>,
  )
}

// Pages are lazy-loaded, so the heading appears asynchronously.
const findMainHeading = (name) =>
  within(screen.getByRole('main')).findByRole('heading', { level: 1, name })

describe('route table', () => {
  it('redirects the index route to /gallery', async () => {
    renderApp(['/'])
    expect(screen.getByTestId('pathname')).toHaveTextContent(/^\/gallery$/)
    expect(await findMainHeading('Gallery')).toBeInTheDocument()
  })

  it('replaces the index entry in history instead of pushing a new one', async () => {
    renderApp(['/start', '/'])
    expect(screen.getByTestId('pathname')).toHaveTextContent(/^\/gallery$/)
    await findMainHeading('Gallery')

    fireEvent.click(screen.getByRole('button', { name: 'Probe back' }))

    expect(screen.getByTestId('pathname')).toHaveTextContent(/^\/start$/)
    expect(await findMainHeading('Page not found')).toBeInTheDocument()
  })

  it.each([
    ['/gallery', 'Gallery'],
    ['/deck', 'Swipe Deck'],
  ])('renders %s inside the layout', async (path, heading) => {
    renderApp([path])
    expect(await findMainHeading(heading)).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  })

  it('keeps rendering the gallery when query parameters are present', async () => {
    renderApp(['/gallery?category=evidence&photo=64f1a2b3c4d5e6f7a8b9c0d1'])
    expect(await findMainHeading('Gallery')).toBeInTheDocument()
  })

  it('highlights the nav link of the current route and follows navigation', async () => {
    renderApp(['/deck'])
    await findMainHeading('Swipe Deck')
    expect(screen.getByRole('link', { name: 'Deck' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Gallery' })).not.toHaveAttribute('aria-current')

    fireEvent.click(screen.getByRole('link', { name: 'Gallery' }))

    expect(await findMainHeading('Gallery')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Gallery' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Deck' })).not.toHaveAttribute('aria-current')
  })
})

describe('catch-all route', () => {
  it.each(['/nope', '/gallery/unknown', '/deck/extra/segments'])(
    'shows the not-found state inside the layout for %s',
    async (path) => {
      renderApp([path])
      expect(await findMainHeading('Page not found')).toBeInTheDocument()
      expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Gallery' })).not.toHaveAttribute('aria-current')
      expect(screen.getByRole('link', { name: 'Deck' })).not.toHaveAttribute('aria-current')
      expect(screen.getByRole('link', { name: 'Back to gallery' })).toHaveAttribute('href', '/gallery')
    },
  )

  it('leads back to the gallery from the not-found state', async () => {
    renderApp(['/nope'])
    await findMainHeading('Page not found')

    fireEvent.click(screen.getByRole('link', { name: 'Back to gallery' }))

    expect(screen.getByTestId('pathname')).toHaveTextContent(/^\/gallery$/)
    expect(await findMainHeading('Gallery')).toBeInTheDocument()
  })
})
