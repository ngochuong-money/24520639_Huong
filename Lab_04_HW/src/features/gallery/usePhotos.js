import { useEffect, useState } from 'react'
import { getPhotos } from '../../api/client.js'

// One GET /api/photos per mount. The effect owns its AbortController and cancels on unmount.
export function usePhotos() {
  const [state, setState] = useState({ photos: [], status: 'loading', error: null })

  useEffect(() => {
    const controller = new AbortController()

    getPhotos({ signal: controller.signal })
      .then((photos) => {
        setState({ photos, status: 'ready', error: null })
      })
      .catch((error) => {
        if (error?.name === 'AbortError') {
          return
        }
        setState({ photos: [], status: 'error', error })
      })

    return () => controller.abort()
  }, [])

  return state
}
