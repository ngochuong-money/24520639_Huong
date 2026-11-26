import { act, renderHook } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { useGalleryParams } from './useGalleryParams.js'

const VALID_ID = '64f1a2b3c4d5e6f7a8b9c0d1'
const OTHER_ID = '64f1a2b3c4d5e6f7a8b9c0d2'

// Read params and location in the same renderHook callback, without a ref probe.
function setup(entry = '/gallery') {
  const wrapper = ({ children }) => (
    <MemoryRouter initialEntries={[entry]}>
      {children}
    </MemoryRouter>
  )
  const hook = renderHook(
    () => ({ params: useGalleryParams(), location: useLocation() }),
    { wrapper },
  )
  return {
    ...hook,
    result: {
      get current() {
        return hook.result.current.params
      },
    },
    location: () => hook.result.current.location,
  }
}

describe('reading the URL (derived, never copied into state)', () => {
  it('defaults to all photos and no open photo', () => {
    const { result } = setup('/gallery')
    expect(result.current.category).toBe('all')
    expect(result.current.photoId).toBeNull()
  })

  it('reads a valid category and photo', () => {
    const { result } = setup(`/gallery?category=evidence&photo=${VALID_ID}`)
    expect(result.current.category).toBe('evidence')
    expect(result.current.photoId).toBe(VALID_ID)
  })

  it.each([
    ['uppercase', '?category=EVIDENCE'],
    ['space', '?category=bad%20slug'],
    ['too long', `?category=${'x'.repeat(33)}`],
    ['empty', '?category='],
    ['repeated key, first value invalid', '?category=BAD&category=evidence'],
  ])('falls back to "all" for an invalid category (%s)', (label, query) => {
    const { result } = setup(`/gallery${query}`)
    expect(result.current.category).toBe('all')
  })

  it('uses the first value when the category key is repeated and the first value is valid', () => {
    const { result } = setup('/gallery?category=scenes&category=evidence')
    expect(result.current.category).toBe('scenes')
  })

  it('passes a well-formed but unknown category through unchanged (existence is checked in GalleryPage)', () => {
    const { result } = setup('/gallery?category=nothing-here')
    expect(result.current.category).toBe('nothing-here')
  })

  it.each([
    ['uppercase hex', `?photo=${VALID_ID.toUpperCase()}`],
    ['too short', `?photo=${VALID_ID.slice(0, 23)}`],
    ['too long', `?photo=${VALID_ID}0`],
    ['non-hex', `?photo=${'g'.repeat(24)}`],
    ['empty', '?photo='],
    ['padded', `?photo=%20${VALID_ID}`],
  ])('treats an invalid photo id as closed (%s)', (label, query) => {
    const { result } = setup(`/gallery${query}`)
    expect(result.current.photoId).toBeNull()
  })

  it('does not write the URL while rendering', () => {
    const { location } = setup('/gallery?category=BAD&photo=nope')
    const before = location()
    // The invalid values stay in the URL: the hook never "fixes" the URL during render.
    expect(before.search).toBe('?category=BAD&photo=nope')
  })
})

describe('writing the URL through setters', () => {
  it('setCategory pushes a new entry and removes the photo', () => {
    const { result, location } = setup(`/gallery?category=evidence&photo=${VALID_ID}`)
    const keyBefore = location().key

    act(() => result.current.setCategory('scenes'))

    expect(result.current.category).toBe('scenes')
    expect(result.current.photoId).toBeNull()
    expect(location().search).toBe('?category=scenes')
    expect(location().key).not.toBe(keyBefore)
  })

  it('setCategory("all") clears the category parameter', () => {
    const { result, location } = setup('/gallery?category=scenes')
    act(() => result.current.setCategory('all'))
    expect(result.current.category).toBe('all')
    expect(location().search).toBe('')
  })

  it('setCategory ignores an invalid slug and leaves the URL unchanged', () => {
    const { result, location } = setup('/gallery?category=evidence')
    act(() => result.current.setCategory('Bad Slug'))
    expect(result.current.category).toBe('evidence')
    expect(location().search).toBe('?category=evidence')
  })

  it('openPhoto pushes a new entry with the photo id, keeping the category', () => {
    const { result, location } = setup('/gallery?category=evidence')
    const keyBefore = location().key

    act(() => result.current.openPhoto(VALID_ID))

    expect(result.current.photoId).toBe(VALID_ID)
    expect(result.current.category).toBe('evidence')
    expect(location().key).not.toBe(keyBefore)
  })

  it('openPhoto ignores an invalid id', () => {
    const { result, location } = setup('/gallery')
    act(() => result.current.openPhoto('not-an-id'))
    expect(result.current.photoId).toBeNull()
    expect(location().search).toBe('')
  })

  it('closePhoto removes the photo and replaces the entry (no extra history step)', () => {
    const { result, location } = setup(`/gallery?category=evidence&photo=${VALID_ID}`)
    const keyBefore = location().key

    act(() => result.current.closePhoto())

    expect(result.current.photoId).toBeNull()
    expect(location().search).toBe('?category=evidence')
    expect(location().key).not.toBe(keyBefore)
  })

  it('closePhoto is idempotent when no photo is open', () => {
    const { result, location } = setup('/gallery?category=evidence')
    const keyBefore = location().key

    act(() => result.current.closePhoto())

    expect(location().key).toBe(keyBefore)
    expect(location().search).toBe('?category=evidence')
  })

  it('replacePhoto swaps the open photo and replaces the entry', () => {
    const { result, location } = setup(`/gallery?photo=${VALID_ID}`)
    const keyBefore = location().key

    act(() => result.current.replacePhoto(OTHER_ID))

    expect(result.current.photoId).toBe(OTHER_ID)
    expect(location().key).not.toBe(keyBefore)
  })

  it('setters keep unrelated parameters', () => {
    const { result, location } = setup('/gallery?utm=abc&category=evidence')
    act(() => result.current.openPhoto(VALID_ID))
    expect(location().search).toContain('utm=abc')
    expect(location().search).toContain('category=evidence')
  })
})
