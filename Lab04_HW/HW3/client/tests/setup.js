import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// jsdom implements HTMLDialogElement + `open` but not showModal()/close().
// Minimal polyfill mirroring browser rules that matter for our tests.
if (typeof HTMLDialogElement !== 'undefined') {
  const proto = HTMLDialogElement.prototype;

  if (!proto.showModal) {
    proto.showModal = function showModal() {
      if (this.open) {
        throw new DOMException('The dialog is already open.', 'InvalidStateError');
      }
      this.open = true;
    };
  }

  if (!proto.show) {
    proto.show = function show() {
      this.open = true;
    };
  }

  if (!proto.close) {
    proto.close = function close(returnValue) {
      if (!this.open) return; // browsers ignore close() on a closed dialog (no event)
      this.open = false;
      if (returnValue !== undefined) this.returnValue = String(returnValue);
      this.dispatchEvent(new Event('close')); // sync here; async in real browsers
    };
  }
}
