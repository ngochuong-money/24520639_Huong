import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import AppLayout from './AppLayout.jsx'

function renderLayout(initialPath = '/gallery') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="gallery" element={<p>Gallery page</p>} />
          <Route path="deck" element={<p>Deck page</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('AppLayout', () => {
  it('provides the banner, main navigation and main landmarks', () => {
    renderLayout()
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(screen.getAllByRole('main')).toHaveLength(1)
  })

  it('lists the two destinations as links inside a native list', () => {
    renderLayout()
    const nav = screen.getByRole('navigation', { name: 'Main' })

    expect(within(nav).getAllByRole('listitem')).toHaveLength(2)
    const links = within(nav).getAllByRole('link')
    expect(links.map((link) => link.textContent)).toEqual(['Gallery', 'Deck'])
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/gallery', '/deck'])
  })

  it('renders the matched child route inside main via <Outlet />', () => {
    renderLayout('/deck')
    expect(within(screen.getByRole('main')).getByText('Deck page')).toBeInTheDocument()
    expect(screen.queryByText('Gallery page')).not.toBeInTheDocument()
  })

  it('marks only the current destination as active', () => {
    renderLayout('/gallery')
    const gallery = screen.getByRole('link', { name: 'Gallery' })
    const deck = screen.getByRole('link', { name: 'Deck' })

    expect(gallery).toHaveAttribute('aria-current', 'page')
    expect(gallery).toHaveClass('is-active')
    expect(deck).not.toHaveAttribute('aria-current')
    expect(deck).not.toHaveClass('is-active')
  })

  it('moves the active state and the page content when a link is clicked', () => {
    renderLayout('/gallery')

    fireEvent.click(screen.getByRole('link', { name: 'Deck' }))

    expect(screen.getByRole('link', { name: 'Deck' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Gallery' })).not.toHaveAttribute('aria-current')
    expect(within(screen.getByRole('main')).getByText('Deck page')).toBeInTheDocument()
  })

  it('has a skip link as the first link, targeting a focusable main', () => {
    renderLayout()
    const [skipLink] = screen.getAllByRole('link')
    const main = screen.getByRole('main')

    expect(skipLink).toHaveTextContent('Skip to main content')
    expect(skipLink).toHaveAttribute('href', '#main')
    expect(main).toHaveAttribute('id', 'main')
    expect(main).toHaveAttribute('tabindex', '-1')
  })

  it('uses no <div> wrappers (zero div-soup)', () => {
    const { container } = renderLayout()
    expect(container.querySelectorAll('div')).toHaveLength(0)
  })
})
