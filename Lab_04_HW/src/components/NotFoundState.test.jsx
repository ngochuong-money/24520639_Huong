import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import NotFoundState from './NotFoundState.jsx'

function renderState(props) {
  return render(
    <MemoryRouter>
      <NotFoundState {...props} />
    </MemoryRouter>,
  )
}

describe('NotFoundState', () => {
  it('renders the default title, message and link', () => {
    renderState()
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByText('The page you are looking for does not exist.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to gallery' })).toHaveAttribute('href', '/gallery')
  })

  it('renders custom props', () => {
    renderState({
      title: 'Photo not found',
      message: 'That photo does not exist.',
      linkTo: '/deck',
      linkLabel: 'Go to the deck',
    })
    expect(screen.getByRole('heading', { level: 1, name: 'Photo not found' })).toBeInTheDocument()
    expect(screen.getByText('That photo does not exist.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to the deck' })).toHaveAttribute('href', '/deck')
  })

  it('labels its section landmark with the heading', () => {
    renderState()
    expect(screen.getByRole('region', { name: 'Page not found' })).toBeInTheDocument()
  })
})
