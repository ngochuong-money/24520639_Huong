import mongoose from 'mongoose'
import { describe, expect, it } from 'vitest'
import { DEFAULT_TEST_URI, getTestMongoUri, isSafeTestDatabase } from './testDatabase.js'

describe('test database safety', () => {
  it.each(['lab04_hw_test', 'anything_test'])('treats "%s" as safe', (name) => {
    expect(isSafeTestDatabase(name)).toBe(true)
  })

  it.each(['lab04_hw', 'test', '_test', '', 'lab04_hw_test_backup', undefined, null])(
    'treats %j as unsafe',
    (name) => {
      expect(isSafeTestDatabase(name)).toBe(false)
    },
  )

  it('defaults to a database that is not the dev database', () => {
    expect(getTestMongoUri({})).toBe(DEFAULT_TEST_URI)
    expect(DEFAULT_TEST_URI.endsWith('/lab04_hw_test')).toBe(true)
  })

  it('takes MONGODB_TEST_URI from the environment and never MONGODB_URI', () => {
    const env = { MONGODB_URI: 'mongodb://127.0.0.1:27017/lab04_hw', MONGODB_TEST_URI: 'mongodb://127.0.0.1:27017/other_test' }
    expect(getTestMongoUri(env)).toBe('mongodb://127.0.0.1:27017/other_test')
    expect(getTestMongoUri({ MONGODB_URI: env.MONGODB_URI })).toBe(DEFAULT_TEST_URI)
  })

  it('runs connected to a safe database', () => {
    expect(isSafeTestDatabase(mongoose.connection.name)).toBe(true)
  })
})
