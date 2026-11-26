import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from '../../src/app.js'
import { cardInputs, seedFixtures } from './fixtures.js'

const app = createApp()

describe('GET /api/cards', () => {
  it('returns an empty array when there are no cards', async () => {
    const res = await request(app).get('/api/cards')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('returns every card in the contract shape, sorted by id ascending', async () => {
    const { cardIds } = await seedFixtures()

    const res = await request(app).get('/api/cards')

    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/application\/json/)
    // toEqual on exact objects also proves that _id and __v are not exposed.
    expect(res.body).toEqual(cardInputs.map((input, index) => ({ id: cardIds[index], ...input })))
  })

  it('ignores unknown query parameters', async () => {
    await seedFixtures()
    const res = await request(app).get('/api/cards?anything=1')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(cardInputs.length)
  })
})
