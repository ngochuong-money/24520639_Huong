import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App.jsx'

const ID_1 = '64f1a2b3c4d5e6f7a8b9c0d1'
const ID_2 = '64f1a2b3c4d5e6f7a8b9c0d2'
const ID_3 = '64f1a2b3c4d5e6f7a8b9c0d3'
const ID_4 = '64f1a2b3c4d5e6f7a8b9c0d4'
const MISSING_ID = 'f'.repeat(24)

const PHOTOS = [
  { id: ID_1, title: 'Evidence 01', alt: 'Desk with notes', category: 'evidence', src: '/e1.svg', width: 1200, height: 800 },
  { id: ID_2, title: 'Scene 01', alt: 'Street at night', category: 'scenes', src: '/s1.svg', width: 1200, height: 800 },
  { id: ID_3, title: 'Evidence 02', alt: 'Second desk', category: 'evidence', src: '/e2.svg', width: 1200, height: 800 },
  { id: ID_4, title: 'Document 01', alt: 'Signed letter', category: 'documents', src: '/d1.svg', width: 1200, height: 800 },
]

const usePhotosMock = vi.hoisted(() => vi.fn())
vi.mock('./usePhotos.js', () => ({ usePhotos: usePhotosMock }))


function LocationProbe() {
  const location = useLocation()
  return <p data-testid="deep-link-location">{location.search}</p>
}

// Full App (routes, layout, lazy GalleryPage) at a real URL, as a deep link would arrive.
async function openDeepLink(url) {
  render(
    <MemoryRouter initialEntries={[url]}>
      <App />
      <LocationProbe />
    </MemoryRouter>,
  )
  return within(await screen.findByRole('main')).findByRole('heading', { level: 1, name: 'Gallery' })
}

const dialog = () => screen.getByRole('dialog', { hidden: true })

beforeEach(() => {
  usePhotosMock.mockReturnValue({ photos: PHOTOS, status: 'ready', error: null })
})

describe('direct link opens the right view', () => {
  it('?category=evidence&photo=<id> shows the filtered grid with the photo open', async () => {
    await openDeepLink(`/gallery?category=evidence&photo=${ID_3}`)

    expect(within(document.querySelector('.photo-grid')).getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Evidence' })).toHaveAttribute('aria-pressed', 'true')
    expect(dialog()).toHaveAttribute('open')
    expect(within(dialog()).getByRole('img', { name: 'Second desk' })).toBeInTheDocument()
    expect(screen.getByTestId('deep-link-location').textContent).toBe(`?category=evidence&photo=${ID_3}`)
  })

  it('?photo=<id> alone opens the photo in the full list', async () => {
    await openDeepLink(`/gallery?photo=${ID_4}`)

    expect(within(document.querySelector('.photo-grid')).getAllByRole('listitem')).toHaveLength(PHOTOS.length)
    expect(within(dialog()).getByRole('img', { name: 'Signed letter' })).toBeInTheDocument()
  })

  it('a deep link for a photo outside the category is reported as not found, not opened', async () => {
    await openDeepLink(`/gallery?category=scenes&photo=${ID_1}`)

    expect(screen.getByRole('status')).toHaveTextContent('Photo not found.')
    expect(dialog()).not.toHaveAttribute('open')
  })

  it('a deep link with no parameters shows the closed gallery', async () => {
    await openDeepLink('/gallery')

    expect(dialog()).not.toHaveAttribute('open')
    expect(within(document.querySelector('.photo-grid')).getAllByRole('listitem')).toHaveLength(PHOTOS.length)
  })
})

describe('closing the modal keeps the category', () => {
  it.each([
    ['Close button', () => fireEvent.click(screen.getByRole('button', { name: 'Close' }))],
    ['backdrop click', () => fireEvent.click(dialog())],
    ['close event (Escape, handled by the browser)', () => fireEvent(dialog(), new Event('close'))],
  ])('closing with the %s removes ?photo= and keeps ?category=', async (label, close) => {
    await openDeepLink(`/gallery?category=evidence&photo=${ID_1}`)

    close()

    expect(screen.getByTestId('deep-link-location').textContent).toBe('?category=evidence')
    expect(dialog()).not.toHaveAttribute('open')
  })

  it('closing does not change the filtered grid', async () => {
    await openDeepLink(`/gallery?category=evidence&photo=${ID_1}`)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(within(document.querySelector('.photo-grid')).getAllByRole('listitem')).toHaveLength(2)
  })
})

describe('invalid parameters', () => {
  it('a malformed photo id reports the contract message and the URL is untouched', async () => {
    await openDeepLink('/gallery?photo=nope&category=evidence')

    expect(dialog()).not.toHaveAttribute('open')
    expect(screen.getByRole('status')).toHaveTextContent('Photo not found.')
    expect(screen.getByTestId('deep-link-location').textContent).toBe('?photo=nope&category=evidence')
  })

  it('an unknown well-formed photo id reports "Photo not found." and leaves the URL untouched', async () => {
    await openDeepLink(`/gallery?photo=${MISSING_ID}`)

    expect(screen.getByRole('status')).toHaveTextContent('Photo not found.')
    expect(dialog()).not.toHaveAttribute('open')
    expect(screen.getByTestId('deep-link-location').textContent).toBe(`?photo=${MISSING_ID}`)
  })

  it('a malformed category falls back to all photos and reports it', async () => {
    await openDeepLink('/gallery?category=BAD%20SLUG')

    expect(screen.getByRole('status')).toHaveTextContent('Unknown category, showing all photos.')
    expect(within(document.querySelector('.photo-grid')).getAllByRole('listitem')).toHaveLength(PHOTOS.length)
    expect(screen.getByTestId('deep-link-location').textContent).toBe('?category=BAD%20SLUG')
  })

  it('an unknown category reports it and still opens a valid photo from the full list', async () => {
    await openDeepLink(`/gallery?category=nothing-here&photo=${ID_2}`)

    expect(screen.getByRole('status')).toHaveTextContent('Unknown category, showing all photos.')
    expect(within(dialog()).getByRole('img', { name: 'Street at night' })).toBeInTheDocument()
  })

  it('a repeated category key uses its first value', async () => {
    await openDeepLink('/gallery?category=scenes&category=evidence')

    expect(within(document.querySelector('.photo-grid')).getAllByRole('listitem')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Scenes' })).toHaveAttribute('aria-pressed', 'true')
  })
})
