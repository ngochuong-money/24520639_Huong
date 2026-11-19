import request from 'supertest'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp } from '../app.js'
import Card from '../models/Card.js'
import Photo from '../models/Photo.js'
import Swipe from '../models/Swipe.js'

const ID_PATTERN = /^[0-9a-f]{24}$/
const CATEGORY_MESSAGE = 'Must be 1-32 characters: lowercase letters, digits or hyphens.'

function mockFind(Model, docs) {
  const sort = vi.fn().mockReturnValue({ exec: async () => docs })
  const find = vi.spyOn(Model, 'find').mockReturnValue({ sort })
  return { find, sort }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('GET /api/cards', () => {
  const cardInput = { name: 'Minh Anh', bio: 'Coffee snob.', imageUrl: '/images/cards/card-01.svg' }

  it('returns cards in the contract shape, sorted by _id ascending', async () => {
    const { find, sort } = mockFind(Card, [new Card(cardInput)])

    const res = await request(createApp()).get('/api/cards')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([{ id: expect.stringMatching(ID_PATTERN), ...cardInput }])
    expect(res.body[0]).not.toHaveProperty('_id')
    expect(res.body[0]).not.toHaveProperty('__v')
    expect(find).toHaveBeenCalledWith({})
    expect(sort).toHaveBeenCalledWith({ _id: 1 })
  })

  it('returns an empty array when there are no cards', async () => {
    mockFind(Card, [])
    const res = await request(createApp()).get('/api/cards')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('ignores unknown query parameters', async () => {
    const { find } = mockFind(Card, [])
    const res = await request(createApp()).get('/api/cards?anything=1')
    expect(res.status).toBe(200)
    expect(find).toHaveBeenCalledWith({})
  })
})

describe('GET /api/photos', () => {
  const photoInput = {
    title: 'Evidence 01',
    alt: 'Placeholder image for evidence 01',
    category: 'evidence',
    src: '/images/photos/evidence-01.svg',
    width: 1200,
    height: 800,
  }

  it('returns all photos sorted by _id ascending when no category is given', async () => {
    const { find, sort } = mockFind(Photo, [new Photo(photoInput)])

    const res = await request(createApp()).get('/api/photos')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([{ id: expect.stringMatching(ID_PATTERN), ...photoInput }])
    expect(res.body[0]).not.toHaveProperty('_id')
    expect(res.body[0]).not.toHaveProperty('__v')
    expect(find).toHaveBeenCalledWith({})
    expect(sort).toHaveBeenCalledWith({ _id: 1 })
  })

  it('filters by a valid category', async () => {
    const { find } = mockFind(Photo, [new Photo(photoInput)])
    const res = await request(createApp()).get('/api/photos?category=evidence')
    expect(res.status).toBe(200)
    expect(find).toHaveBeenCalledWith({ category: 'evidence' })
  })

  it('returns an empty array for a valid category with no photos', async () => {
    mockFind(Photo, [])
    const res = await request(createApp()).get('/api/photos?category=nothing-here')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it.each([
    ['empty value', '?category='],
    ['uppercase', '?category=UPPER'],
    ['space', '?category=Bad%20Slug'],
    ['too long', `?category=${'x'.repeat(33)}`],
    ['repeated key', '?category=a&category=b'],
  ])('returns 400 VALIDATION_ERROR for an invalid category (%s)', async (label, query) => {
    const find = vi.spyOn(Photo, 'find')

    const res = await request(createApp()).get(`/api/photos${query}`)

    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed.',
        details: [{ field: 'category', message: CATEGORY_MESSAGE }],
      },
    })
    expect(find).not.toHaveBeenCalled()
  })
})

describe('GET /api/swipes', () => {
  const swipeInput = { cardId: '64f1a2b3c4d5e6f7a8b9c0d1', direction: 'right' }

  it('returns the history oldest to newest in the contract shape', async () => {
    const swipe = new Swipe({ ...swipeInput, createdAt: new Date('2026-11-19T08:30:00.000Z') })
    const { find, sort } = mockFind(Swipe, [swipe])

    const res = await request(createApp()).get('/api/swipes')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([
      { id: expect.stringMatching(ID_PATTERN), ...swipeInput, createdAt: '2026-11-19T08:30:00.000Z' },
    ])
    expect(res.body[0]).not.toHaveProperty('_id')
    expect(res.body[0]).not.toHaveProperty('__v')
    expect(find).toHaveBeenCalledWith({})
    expect(sort).toHaveBeenCalledWith({ createdAt: 1, _id: 1 })
  })

  it('returns an empty array when the history is empty', async () => {
    mockFind(Swipe, [])
    const res = await request(createApp()).get('/api/swipes')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

describe('database failures', () => {
  it.each([
    ['/api/cards', Card],
    ['/api/photos', Photo],
    ['/api/swipes', Swipe],
  ])('GET %s returns a generic 500 without leaking details', async (url, Model) => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const failure = new Error('connect failed mongodb://user:secret@host')
    vi.spyOn(Model, 'find').mockReturnValue({
      sort: () => ({
        exec: async () => {
          throw failure
        },
      }),
    })

    const res = await request(createApp()).get(url)

    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } })
    expect(JSON.stringify(res.body)).not.toContain('secret')
    consoleError.mockRestore()
  })
})
