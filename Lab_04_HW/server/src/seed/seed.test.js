import { afterEach, describe, expect, it, vi } from 'vitest'
import Card from '../models/Card.js'
import Photo from '../models/Photo.js'
import Swipe from '../models/Swipe.js'
import { cards, photos } from './data.js'
import { seedDatabase } from './seed.js'

function mockDatabase() {
  const query = { exec: async () => ({ deletedCount: 0 }) }
  return {
    deleteSwipes: vi.spyOn(Swipe, 'deleteMany').mockReturnValue(query),
    deleteCards: vi.spyOn(Card, 'deleteMany').mockReturnValue(query),
    deletePhotos: vi.spyOn(Photo, 'deleteMany').mockReturnValue(query),
    insertPhotos: vi.spyOn(Photo, 'insertMany').mockImplementation(async (docs) => docs),
    insertCards: vi.spyOn(Card, 'insertMany').mockImplementation(async (docs) => docs),
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('seedDatabase', () => {
  it('clears swipes, cards and photos before inserting, and returns the counts', async () => {
    const db = mockDatabase()

    const result = await seedDatabase()

    expect(result).toEqual({ photos: photos.length, cards: cards.length })
    const deleteOrders = [db.deleteSwipes, db.deleteCards, db.deletePhotos].map(
      (spy) => spy.mock.invocationCallOrder[0],
    )
    const insertOrders = [db.insertPhotos, db.insertCards].map((spy) => spy.mock.invocationCallOrder[0])
    expect(deleteOrders.every(Number.isInteger)).toBe(true)
    expect(Math.max(...deleteOrders)).toBeLessThan(Math.min(...insertOrders))
  })

  it('inserts cards in deck order: names follow the data and ids ascend', async () => {
    const db = mockDatabase()

    await seedDatabase()

    const docs = db.insertCards.mock.calls[0][0]
    expect(docs.map((doc) => doc.name)).toEqual(cards.map((card) => card.name))
    const ids = docs.map((doc) => doc._id.toString())
    expect(ids).toEqual([...ids].sort())
  })

  it('rejects invalid photo data without touching the database', async () => {
    const db = mockDatabase()
    const badPhotos = [{ ...photos[0], category: 'Bad Slug' }]

    await expect(seedDatabase({ photos: badPhotos, cards })).rejects.toThrow(/photos\[0\]\.category/)

    expect(db.deleteSwipes).not.toHaveBeenCalled()
    expect(db.deleteCards).not.toHaveBeenCalled()
    expect(db.deletePhotos).not.toHaveBeenCalled()
    expect(db.insertPhotos).not.toHaveBeenCalled()
  })

  it('rejects invalid card data without touching the database', async () => {
    const db = mockDatabase()
    const badCards = [{ ...cards[0], imageUrl: 'javascript:alert(1)' }]

    await expect(seedDatabase({ photos, cards: badCards })).rejects.toThrow(/cards\[0\]\.imageUrl/)

    expect(db.deleteCards).not.toHaveBeenCalled()
    expect(db.insertCards).not.toHaveBeenCalled()
  })
})
