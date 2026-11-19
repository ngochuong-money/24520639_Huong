import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App.jsx'

describe('App', () => {
  it('renders the main heading inside a main landmark', () => {
    render(<App />)
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: /evidence gallery & swipe deck/i }),
    ).toBeInTheDocument()
  })
})
