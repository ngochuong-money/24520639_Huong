
const stateStore = [];
let cursor = 0;

export function resetCursor() {
  cursor = 0;
}

export function useState(initialValue) {
  const currentIndex = cursor;

  if (currentIndex >= stateStore.length) {
    stateStore.push(initialValue);
  }

  const state = stateStore[currentIndex];

  function setState(newValue) {
    stateStore[currentIndex] =
      typeof newValue === "function"
        ? newValue(stateStore[currentIndex])
        : newValue;

    renderApp();
  }

  cursor++;

  return [state, setState];
}
