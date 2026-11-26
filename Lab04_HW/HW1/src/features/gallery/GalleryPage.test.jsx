import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GalleryPage from './GalleryPage.jsx'

const VALID_ID = '64f1a2b3c4d5e6f7a8b9c0d1'
const ID_2 = '64f1a2b3c4d5e6f7a8b9c0d2'
const ID_3 = '64f1a2b3c4d5e6f7a8b9c0d3'
const ID_4 = '64f1a2b3c4d5e6f7a8b9c0d4'

const PHOTOS = [
  { id: VALID_ID, title: 'Evidence 01', alt: 'Desk with notes', category: 'evidence', src: '/e1.svg', width: 1200, height: 800 },
  { id: ID_2, title: 'Scene 01', alt: 'Street at night', category: 'scenes', src: '/s1.svg', width: 1200, height: 800 },
  { id: ID_3, title: 'Evidence 02', alt: 'Second desk', category: 'evidence', src: '/e2.svg', width: 1200, height: 800 },
  { id: ID_4, title: 'Document 01', alt: 'Signed letter', category: 'documents', src: '/d1.svg', width: 1200, height: 800 },
]

const usePhotosMock = vi.hoisted(() => vi.fn())
vi.mock('./usePhotos.js', () => ({ usePhotos: usePhotosMock }))

function LocationProbe() {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <>
      <p data-testid="gallery-location">{location.search}</p>
      <button type="button" onClick={() => navigate(-1)}>Probe back</button>
      <button type="button" onClick={() => navigate(1)}>Probe forward</button>
    </>
  )
}

const currentSearch = () => screen.getByTestId('gallery-location').textContent
const photoGrid = () => screen.getByRole('region', { name: 'Gallery' }).querySelector('.photo-grid')

function renderGallery(entry = '/gallery') {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <GalleryPage />
      <LocationProbe />
    </MemoryRouter>,
  )
}

const ready = (photos = PHOTOS) => usePhotosMock.mockReturnValue({ photos, status: 'ready', error: null })

beforeEach(() => {
  ready()
})

describe('GalleryPage data states', () => {
  it('shows an alert when photos fail to load', () => {
    usePhotosMock.mockReturnValue({ photos: [], status: 'error', error: new Error('down') })
    renderGallery()
    expect(screen.getByRole('alert')).toHaveTextContent(/could not load/i)
  })

  it('shows a loading status while photos are loading', () => {
    usePhotosMock.mockReturnValue({ photos: [], status: 'loading', error: null })
    renderGallery()
    expect(screen.getByRole('region', { name: 'Loading gallery' })).toBeInTheDocument()
    expect(screen.queryByRole('list')).toBeNull()
  })

  it('renders one grid item per photo when no filter is set', () => {
    renderGallery()
    expect(within(photoGrid()).getAllByRole('listitem')).toHaveLength(PHOTOS.length)
  })
})

describe('invalid query parameters', () => {
  it('falls back to all photos and says so for an invalid category', () => {
    renderGallery('/gallery?category=BAD')
    expect(screen.getByRole('status')).toHaveTextContent('Unknown category, showing all photos.')
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(photoGrid()).getAllByRole('listitem')).toHaveLength(PHOTOS.length)
  })

  it('falls back to all photos for a well-formed but unknown category', () => {
    renderGallery('/gallery?category=nothing-here')
    expect(screen.getByRole('status')).toHaveTextContent('Unknown category, showing all photos.')
    expect(within(photoGrid()).getAllByRole('listitem')).toHaveLength(PHOTOS.length)
  })

  it('closes the lightbox and says so for an unknown photo id', () => {
    renderGallery(`/gallery?photo=${'f'.repeat(24)}`)
    expect(screen.getByRole('status')).toHaveTextContent('Photo not found.')
    expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open')
  })

  it('closes the lightbox and reports a malformed photo id', () => {
    renderGallery('/gallery?photo=nope')
    expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open')
    expect(screen.getByRole('status')).toHaveTextContent('Photo not found.')
  })

  it('does not rewrite the URL when parameters are invalid', () => {
    renderGallery('/gallery?category=BAD&photo=nope')
    expect(currentSearch()).toBe('?category=BAD&photo=nope')
  })

  it('a photo that exists but is outside the current category is not found', () => {
    renderGallery(`/gallery?category=scenes&photo=${VALID_ID}`)
    expect(screen.getByRole('status')).toHaveTextContent('Photo not found.')
  })

  it('clears the message when the user picks a valid category', () => {
    renderGallery('/gallery?category=BAD')
    fireEvent.click(screen.getByRole('button', { name: 'Scenes' }))
    expect(screen.queryByText('Unknown category, showing all photos.')).toBeNull()
  })
})

describe('URL is the source of truth', () => {
  it('opens the lightbox on the photo named in the URL', () => {
    renderGallery(`/gallery?photo=${VALID_ID}`)
    const dialog = screen.getByRole('dialog', { hidden: true })
    expect(dialog).toHaveAttribute('open')
    expect(within(dialog).getByRole('img', { name: 'Desk with notes' })).toBeInTheDocument()
  })

  it('clicking a thumbnail pushes ?photo= and opens the lightbox', () => {
    renderGallery()
    fireEvent.click(within(photoGrid()).getAllByRole('button')[1])
    expect(currentSearch()).toBe(`?photo=${ID_2}`)
    expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('open')
  })

  it('changing category removes the photo parameter and keeps the category', () => {
    renderGallery(`/gallery?category=evidence&photo=${VALID_ID}`)
    fireEvent.click(screen.getByRole('button', { name: 'Scenes' }))
    expect(currentSearch()).toBe('?category=scenes')
  })

  it('shows only photos from the selected category', () => {
    renderGallery('/gallery?category=evidence')
    expect(within(photoGrid()).getAllByRole('listitem')).toHaveLength(2)
  })

  it('closing the lightbox replaces the entry and keeps the category', () => {
    renderGallery(`/gallery?category=evidence&photo=${VALID_ID}`)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(currentSearch()).toBe('?category=evidence')
  })

  it('next and previous move within the filtered list using replace', () => {
    renderGallery(`/gallery?category=evidence&photo=${VALID_ID}`)
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(currentSearch()).toBe(`?category=evidence&photo=${ID_3}`)
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }))
    expect(currentSearch()).toBe(`?category=evidence&photo=${VALID_ID}`)
  })

  it('Next is disabled on the last photo of the filtered list', () => {
    renderGallery(`/gallery?category=evidence&photo=${ID_3}`)
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })
})

describe('router history (real browser history is verified separately)', () => {
  it('Back from an open photo closes it and Forward reopens the same photo', () => {
    renderGallery()
    fireEvent.click(within(photoGrid()).getAllByRole('button')[0])
    expect(currentSearch()).toBe(`?photo=${VALID_ID}`)
    expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('open')

    fireEvent.click(screen.getByRole('button', { name: 'Probe back' }))
    expect(currentSearch()).toBe('')
    expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open')

    fireEvent.click(screen.getByRole('button', { name: 'Probe forward' }))
    expect(currentSearch()).toBe(`?photo=${VALID_ID}`)
    expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('open')
    expect(within(screen.getByRole('dialog')).getByRole('img', { name: 'Desk with notes' })).toBeInTheDocument()
  })
})

describe('keyboard navigation through the page (4.6)', () => {
  it('ArrowRight and ArrowLeft move between photos and replace the history entry', () => {
    renderGallery('/gallery?category=evidence')
    fireEvent.click(within(photoGrid()).getAllByRole('button')[0])
    const dialog = screen.getByRole('dialog', { hidden: true })

    fireEvent.keyDown(dialog, { key: 'ArrowRight' })
    expect(currentSearch()).toBe(`?category=evidence&photo=${ID_3}`)

    fireEvent.keyDown(dialog, { key: 'ArrowLeft' })
    expect(currentSearch()).toBe(`?category=evidence&photo=${VALID_ID}`)

    fireEvent.click(screen.getByRole('button', { name: 'Probe back' }))
    expect(currentSearch()).toBe('?category=evidence')
    expect(dialog).not.toHaveAttribute('open')
  })

  it('arrow keys stay inside the filtered category', () => {
    renderGallery(`/gallery?category=evidence&photo=${ID_3}`)
    fireEvent.keyDown(screen.getByRole('dialog', { hidden: true }), { key: 'ArrowRight' })
    expect(currentSearch()).toBe(`?category=evidence&photo=${ID_3}`)
  })
})
