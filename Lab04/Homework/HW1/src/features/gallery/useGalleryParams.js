import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { isValidCategory, isValidId } from '../../../shared/validation.js'

const ALL = 'all'

export function useGalleryParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Derived on every render from the URL; no local state copy.
  // get() returns the first value of a repeated key.
  const rawCategory = searchParams.get('category')
  const rawPhoto = searchParams.get('photo')

  const category = rawCategory !== null && isValidCategory(rawCategory) ? rawCategory : ALL
  const photoId = rawPhoto !== null && isValidId(rawPhoto) ? rawPhoto : null

  // Setters are called from event handlers only, never during render.
  // Each one builds the next params from the current ones so unrelated keys survive.
  const setCategory = useCallback(
    (nextCategory) => {
      if (nextCategory !== ALL && !isValidCategory(nextCategory)) {
        return
      }
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          next.delete('photo')
          if (nextCategory === ALL) {
            next.delete('category')
          } else {
            next.set('category', nextCategory)
          }
          return next
        },
        { replace: false },
      )
    },
    [setSearchParams],
  )

  const openPhoto = useCallback(
    (id) => {
      if (!isValidId(id)) {
        return
      }
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          next.set('photo', id)
          return next
        },
        { replace: false },
      )
    },
    [setSearchParams],
  )

  const replacePhoto = useCallback(
    (id) => {
      if (!isValidId(id)) {
        return
      }
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          next.set('photo', id)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  // Idempotent: when no photo is open it does nothing, so the URL and history stay untouched.
  const closePhoto = useCallback(() => {
    if (!searchParams.has('photo')) {
      return
    }
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.delete('photo')
        return next
      },
      { replace: true },
    )
  }, [searchParams, setSearchParams])

  return useMemo(
    () => ({ category, photoId, setCategory, openPhoto, closePhoto, replacePhoto }),
    [category, photoId, setCategory, openPhoto, closePhoto, replacePhoto],
  )
}
