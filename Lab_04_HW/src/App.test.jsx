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

const mainHeading = (name) =>
  within(screen.getByRole('main')).getByRole('heading', { level: 1, name })

describe('route table', () => {
  it('redirects the index route to /gallery', () => {
    renderApp(['/'])
    expect(screen.getByTestId('pathname')).toHaveTextContent(/^\/gallery$/)
    expect(mainHeading('Gallery')).toBeInTheDocument()
  })

  it('replaces the index entry in history instead of pushing a new one', () => {
    renderApp(['/start', '/'])
    expect(screen.getByTestId('pathname')).toHaveTextContent(/^\/gallery$/)

    fireEvent.click(screen.getByRole('button', { name: 'Probe back' }))

    expect(screen.getByTestId('pathname')).toHaveTextContent(/^\/start$/)
  })

  it.each([
    ['/gallery', 'Gallery'],
    ['/deck', 'Swipe Deck'],
  ])('renders %s inside the layout', (path, heading) => {
    renderApp([path])
    expect(mainHeading(heading)).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  })

  it('keeps rendering the gallery when query parameters are present', () => {
    renderApp(['/gallery?category=evidence&photo=64f1a2b3c4d5e6f7a8b9c0d1'])
    expect(mainHeading('Gallery')).toBeInTheDocument()
  })

  it('highlights the nav link of the current route and follows navigation', () => {
    renderApp(['/deck'])
    expect(screen.getByRole('link', { name: 'Deck' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Gallery' })).not.toHaveAttribute('aria-current')

    fireEvent.click(screen.getByRole('link', { name: 'Gallery' }))

    expect(mainHeading('Gallery')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Gallery' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Deck' })).not.toHaveAttribute('aria-current')
  })
})

describe('catch-all route', () => {
  it.each(['/nope', '/gallery/unknown', '/deck/extra/segments'])(
    'shows the not-found state inside the layout for %s',
    (path) => {
      renderApp([path])
      expect(mainHeading('Page not found')).toBeInTheDocument()
      expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Gallery' })).not.toHaveAttribute('aria-current')
      expect(screen.getByRole('link', { name: 'Deck' })).not.toHaveAttribute('aria-current')
      expect(screen.getByRole('link', { name: 'Back to gallery' })).toHaveAttribute('href', '/gallery')
    },
  )

  it('leads back to the gallery from the not-found state', () => {
    renderApp(['/nope'])

    fireEvent.click(screen.getByRole('link', { name: 'Back to gallery' }))

    expect(screen.getByTestId('pathname')).toHaveTextContent(/^\/gallery$/)
    expect(mainHeading('Gallery')).toBeInTheDocument()
  })
})
