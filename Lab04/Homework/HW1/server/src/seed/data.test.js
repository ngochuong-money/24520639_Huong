import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import Card from '../models/Card.js'
import Photo from '../models/Photo.js'
import { cards, PHOTO_CATEGORIES, photos } from './data.js'

const publicFile = (urlPath) => new URL(`../../../public${urlPath}`, import.meta.url)

describe('seed photos', () => {
  it('has 12 photos that all pass the Photo schema', () => {
    expect(photos).toHaveLength(12)
    photos.forEach((photo) => {
      expect(new Photo(photo).validateSync()).toBeUndefined()
    })
  })

  it('covers every category equally', () => {
    expect(new Set(photos.map((photo) => photo.category))).toEqual(new Set(PHOTO_CATEGORIES))
    PHOTO_CATEGORIES.forEach((category) => {
      expect(photos.filter((photo) => photo.category === category)).toHaveLength(4)
    })
  })

  it('has unique titles and src values', () => {
    expect(new Set(photos.map((photo) => photo.title)).size).toBe(photos.length)
    expect(new Set(photos.map((photo) => photo.src)).size).toBe(photos.length)
  })

  it('mixes categories at the start so the "All" view is not grouped', () => {
    expect(photos.slice(0, 3).map((photo) => photo.category)).toEqual([...PHOTO_CATEGORIES])
  })

  it('references image files that exist in public/', () => {
    photos.forEach((photo) => {
      expect(existsSync(publicFile(photo.src)), photo.src).toBe(true)
    })
  })
})

describe('seed cards', () => {
  it('has 10 cards that all pass the Card schema', () => {
    expect(cards).toHaveLength(10)
    cards.forEach((card) => {
      expect(new Card(card).validateSync()).toBeUndefined()
    })
  })

  it('has unique names and image URLs', () => {
    expect(new Set(cards.map((card) => card.name)).size).toBe(cards.length)
    expect(new Set(cards.map((card) => card.imageUrl)).size).toBe(cards.length)
  })

  it('references image files that exist in public/', () => {
    cards.forEach((card) => {
      expect(existsSync(publicFile(card.imageUrl)), card.imageUrl).toBe(true)
    })
  })
})
