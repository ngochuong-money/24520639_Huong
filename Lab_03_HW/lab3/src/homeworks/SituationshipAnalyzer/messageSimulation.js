export function waitForReplyTimeout(signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Operation aborted", "AbortError"));
      return;
    }

    function handleAbort() {
      clearTimeout(timerId);
      signal.removeEventListener("abort", handleAbort);
      reject(new DOMException("Operation aborted", "AbortError"));
    }

    const timerId = setTimeout(() => {
      signal.removeEventListener("abort", handleAbort);
      resolve();
    }, 5000);

    signal.addEventListener("abort", handleAbort, { once: true });
  });
}