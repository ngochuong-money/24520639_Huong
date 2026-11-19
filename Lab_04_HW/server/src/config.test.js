import { describe, expect, it } from 'vitest'
import { loadConfig } from './config.js'

describe('loadConfig', () => {
  it('reads MONGODB_URI and PORT from the given env', () => {
    expect(loadConfig({ MONGODB_URI: 'mongodb://example/db', PORT: '4000' })).toEqual({
      port: 4000,
      mongodbUri: 'mongodb://example/db',
    })
  })

  it('defaults PORT to 5000', () => {
    expect(loadConfig({ MONGODB_URI: 'mongodb://example/db' }).port).toBe(5000)
  })

  it('throws when MONGODB_URI is missing or blank', () => {
    expect(() => loadConfig({})).toThrow(/MONGODB_URI/)
    expect(() => loadConfig({ MONGODB_URI: '   ' })).toThrow(/MONGODB_URI/)
  })

  it('throws on an invalid PORT', () => {
    expect(() => loadConfig({ MONGODB_URI: 'x', PORT: 'abc' })).toThrow(/PORT/)
    expect(() => loadConfig({ MONGODB_URI: 'x', PORT: '70000' })).toThrow(/PORT/)
  })
})
