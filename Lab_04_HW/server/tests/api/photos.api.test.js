import request from 'supertest'
import { describe, expect, it } from 'vitest'
import {
  CATEGORY_MESSAGE,
  invalidCategories,
  validCategories,
} from '../../../shared/validation.cases.js'
import { createApp } from '../../src/app.js'
import { photoInputs, seedFixtures } from './fixtures.js'

const app = createApp()

// Only strings can travel in a query string; the rest of the shared table is covered at function level.
const invalidStringCategories = invalidCategories.filter(([, value]) => typeof value === 'string')
const expectedPhotos = (photoIds, inputs) =>
  inputs.map((input) => ({ id: photoIds[photoInputs.indexOf(input)], ...input }))

const categoryError = {
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Request validation failed.',
    details: [{ field: 'category', message: CATEGORY_MESSAGE }],
  },
}

describe('GET /api/photos', () => {
  it('returns an empty array when there are no photos', async () => {
    const res = await request(app).get('/api/photos')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('returns all photos in the contract shape, sorted by id ascending', async () => {
    const { photoIds } = await seedFixtures()

    const res = await request(app).get('/api/photos')

    expect(res.status).toBe(200)
    expect(res.body).toEqual(expectedPhotos(photoIds, photoInputs))
  })

  it('filters by category and keeps the id order', async () => {
    const { photoIds } = await seedFixtures()
    const evidence = photoInputs.filter((photo) => photo.category === 'evidence')

    const res = await request(app).get('/api/photos?category=evidence')

    expect(res.status).toBe(200)
    expect(res.body).toEqual(expectedPhotos(photoIds, evidence))
    expect(res.body.length).toBeGreaterThan(0)
    expect(res.body.length).toBeLessThan(photoInputs.length)
  })

  it.each(validCategories)('accepts the valid category "%s" with 200', async (category) => {
    await seedFixtures()
    const res = await request(app).get(`/api/photos?category=${encodeURIComponent(category)}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('returns [] for a valid category that has no photos', async () => {
    await seedFixtures()
    const res = await request(app).get('/api/photos?category=nothing-here')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it.each(invalidStringCategories)('rejects an invalid category (%s) with 400', async (label, value) => {
    await seedFixtures()
    const res = await request(app).get(`/api/photos?category=${encodeURIComponent(value)}`)
    expect(res.status).toBe(400)
    expect(res.body).toEqual(categoryError)
  })

  it('rejects a repeated category key with 400', async () => {
    await seedFixtures()
    const res = await request(app).get('/api/photos?category=evidence&category=scenes')
    expect(res.status).toBe(400)
    expect(res.body).toEqual(categoryError)
  })
})
