import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})

// jsdom does not implement the modal dialog API. Install a minimal stand-in
// that mirrors the browser behaviour the app depends on (open state, close event).
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function close() {
    if (!this.hasAttribute('open')) {
      return
    }
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}
