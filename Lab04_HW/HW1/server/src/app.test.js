import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from './app.js'

describe('createApp', () => {
  it('returns 404 ROUTE_NOT_FOUND in the contract error shape for unknown routes', async () => {
    const res = await request(createApp()).get('/api/does-not-exist')
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: { code: 'ROUTE_NOT_FOUND', message: 'Route not found.' } })
  })

  it('sends CORS headers', async () => {
    const res = await request(createApp())
      .get('/api/does-not-exist')
      .set('Origin', 'http://localhost:5173')
    expect(res.headers['access-control-allow-origin']).toBeDefined()
  })

  it('returns 400 INVALID_JSON for a malformed JSON body, without a stack trace', async () => {
    const res = await request(createApp())
      .post('/api/swipes')
      .set('Content-Type', 'application/json')
      .send('{bad')
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('INVALID_JSON')
    expect(JSON.stringify(res.body)).not.toMatch(/stack|node_modules/i)
  })
})
