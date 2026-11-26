
import { PUBG_VN_SQUADS } from '../data/pubgVnSquads.js'

const REQUEST_DELAY_MS = 1500
const PACKET_LOSS_RATE = 0.35

export function fetchTelemetry(squadId, { signal } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Request aborted', 'AbortError'))
      return
    }

    const squad = PUBG_VN_SQUADS.find(
      (item) => item.id === squadId
    )

    if (!squad) {
      reject(new Error('Unknown squad'))
      return
    }

    const onAbort = () => {
      clearTimeout(timer)
      reject(new DOMException('Request aborted', 'AbortError'))
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)

      if (Math.random() < PACKET_LOSS_RATE) {
        reject(new Error('Satellite packet timeout'))
        return
      }

      resolve({ ...squad })
    }, REQUEST_DELAY_MS)

    signal?.addEventListener('abort', onAbort, { once: true })
  })
}
