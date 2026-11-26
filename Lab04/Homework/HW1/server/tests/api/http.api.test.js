import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from '../../src/app.js'
import { seedFixtures } from './fixtures.js'

const app = createApp()
const MISSING_CARD_ID = '000000000000000000000000'

describe('routes that the contract does not define', () => {
  it.each([
    ['get', '/api/nope'],
    ['get', '/api/swipes/last'],
    ['post', '/api/cards'],
    ['put', '/api/swipes/last'],
    ['delete', '/api/swipes'],
    ['delete', '/api/swipes/abc'],
  ])('%s %s returns 404 ROUTE_NOT_FOUND', async (method, url) => {
    const res = await request(app)[method](url)
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: { code: 'ROUTE_NOT_FOUND', message: 'Route not found.' } })
  })
})

describe('error format', () => {
  const failingRequests = [
    ['unknown route', () => request(app).get('/api/nope')],
    ['invalid category', () => request(app).get('/api/photos?category=Bad%20Slug')],
    [
      'malformed JSON',
      () => request(app).post('/api/swipes').set('Content-Type', 'application/json').send('{bad'),
    ],
    ['validation error', () => request(app).post('/api/swipes').send({})],
    [
      'card not found',
      () => request(app).post('/api/swipes').send({ cardId: MISSING_CARD_ID, direction: 'left' }),
    ],
    ['empty history', () => request(app).delete('/api/swipes/last')],
  ]

  it.each(failingRequests)('%s uses the contract shape and leaks nothing', async (label, send) => {
    const res = await send()

    expect(res.status).toBeGreaterThanOrEqual(400)
    expect(res.headers['content-type']).toMatch(/application\/json/)
    expect(Object.keys(res.body)).toEqual(['error'])
    expect(res.body.error.code).toMatch(/^[A-Z_]+$/)
    expect(typeof res.body.error.message).toBe('string')
    expect(JSON.stringify(res.body)).not.toMatch(/stack|node_modules|mongodb|mongoose/i)
  })
})

describe('CORS', () => {
  it('sends Access-Control-Allow-Origin on real responses', async () => {
    await seedFixtures()
    const res = await request(app).get('/api/cards').set('Origin', 'http://localhost:5173')
    expect(res.status).toBe(200)
    expect(res.headers['access-control-allow-origin']).toBeDefined()
  })
})
