import { describe, expect, it } from 'vitest'
import Card from './Card.js'
import Photo from './Photo.js'
import Swipe from './Swipe.js'

const invalidPaths = (doc) => Object.keys(doc.validateSync()?.errors ?? {})
const ID_PATTERN = /^[0-9a-f]{24}$/

const validPhoto = {
  title: 'Overhead desk photo',
  alt: 'Overhead view of a desk with scattered documents',
  category: 'evidence',
  src: '/images/evidence-01.jpg',
  width: 1200,
  height: 800,
}
const validCard = { name: 'Alex', bio: 'Likes long walks.', imageUrl: 'https://example.com/alex.jpg' }
const validSwipe = { cardId: '64f1a2b3c4d5e6f7a8b9c0d1', direction: 'right' }

describe('Photo model', () => {
  it('accepts a valid photo', () => {
    expect(invalidPaths(new Photo(validPhoto))).toEqual([])
  })

  it.each(['title', 'alt', 'category', 'src', 'width', 'height'])('requires %s', (field) => {
    const input = { ...validPhoto }
    delete input[field]
    expect(invalidPaths(new Photo(input))).toContain(field)
  })

  it.each([
    ['title', { title: '   ' }],
    ['title', { title: 'x'.repeat(121) }],
    ['alt', { alt: 'x'.repeat(251) }],
    ['category', { category: 'Bad Slug' }],
    ['category', { category: 'UPPER' }],
    ['category', { category: '' }],
    ['category', { category: 'x'.repeat(33) }],
    ['src', { src: 'javascript:alert(1)' }],
    ['src', { src: 'http://example.com/a.jpg' }],
    ['src', { src: '//evil.example/a.jpg' }],
    ['src', { src: 'images/a.jpg' }],
    ['width', { width: 0 }],
    ['width', { width: -5 }],
    ['width', { width: Infinity }],
    ['height', { height: 0 }],
  ])('rejects invalid %s', (path, override) => {
    expect(invalidPaths(new Photo({ ...validPhoto, ...override }))).toContain(path)
  })

  it('serialises with id, without _id/__v, and drops unknown fields', () => {
    const json = JSON.parse(JSON.stringify(new Photo({ ...validPhoto, extra: 'ignored' })))
    expect(json).toEqual({ id: expect.stringMatching(ID_PATTERN), ...validPhoto })
  })
})

describe('Card model', () => {
  it('accepts a valid card and defaults bio to an empty string', () => {
    expect(invalidPaths(new Card(validCard))).toEqual([])
    expect(new Card({ name: 'Sam', imageUrl: '/images/sam.jpg' }).bio).toBe('')
  })

  it.each(['name', 'imageUrl'])('requires %s', (field) => {
    const input = { ...validCard }
    delete input[field]
    expect(invalidPaths(new Card(input))).toContain(field)
  })

  it.each([
    ['name', { name: 'x'.repeat(81) }],
    ['bio', { bio: 'x'.repeat(281) }],
    ['imageUrl', { imageUrl: 'javascript:alert(1)' }],
    ['imageUrl', { imageUrl: 'http://example.com/a.jpg' }],
  ])('rejects invalid %s', (path, override) => {
    expect(invalidPaths(new Card({ ...validCard, ...override }))).toContain(path)
  })

  it('serialises with id and without _id/__v', () => {
    const json = JSON.parse(JSON.stringify(new Card(validCard)))
    expect(json).toEqual({ id: expect.stringMatching(ID_PATTERN), ...validCard })
  })
})

describe('Swipe model', () => {
  it.each(['left', 'right'])('accepts direction %s', (direction) => {
    expect(invalidPaths(new Swipe({ ...validSwipe, direction }))).toEqual([])
  })

  it.each([
    ['direction', { direction: 'up' }],
    ['direction', { direction: 'RIGHT' }],
    ['direction', { direction: '' }],
    ['cardId', { cardId: 'abc' }],
  ])('rejects invalid %s', (path, override) => {
    expect(invalidPaths(new Swipe({ ...validSwipe, ...override }))).toContain(path)
  })

  it.each(['cardId', 'direction'])('requires %s', (field) => {
    const input = { ...validSwipe }
    delete input[field]
    expect(invalidPaths(new Swipe(input))).toContain(field)
  })

  it('serialises createdAt as an ISO string', () => {
    const swipe = new Swipe({ ...validSwipe, createdAt: new Date('2026-11-19T08:30:00.000Z') })
    expect(JSON.parse(JSON.stringify(swipe))).toEqual({
      id: expect.stringMatching(ID_PATTERN),
      ...validSwipe,
      createdAt: '2026-11-19T08:30:00.000Z',
    })
  })

  it('has a unique index on cardId and an index for LIFO ordering', () => {
    const indexes = Swipe.schema.indexes()
    expect(indexes).toContainEqual([{ cardId: 1 }, expect.objectContaining({ unique: true })])
    expect(indexes).toContainEqual([{ createdAt: -1, _id: -1 }, expect.any(Object)])
  })
})
