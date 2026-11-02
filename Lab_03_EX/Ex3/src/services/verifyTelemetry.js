
import { fetchTelemetry } from './telemetry.js'

async function verifyAbort() {
  const controller = new AbortController()

  const request = fetchTelemetry('ces', {
    signal: controller.signal,
  })

  controller.abort()

  try {
    await request
    throw new Error('FAIL: aborted request resolved')
  } catch (error) {
    if (error.name !== 'AbortError') {
      throw error
    }

    console.log('PASS: aborted request rejects with AbortError')
  }
}

async function verifyUnknownSquad() {
  try {
    await fetchTelemetry('unknown')
    throw new Error('FAIL: unknown squad resolved')
  } catch (error) {
    if (error.message !== 'Unknown squad') {
      throw error
    }

    console.log('PASS: unknown squad is rejected')
  }
}

await verifyAbort()
await verifyUnknownSquad()
