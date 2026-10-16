
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


export function attachRootEventListener(root) {
  root.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button || !root.contains(button)) {
      return;
    }

    if (typeof button._onClick === "function") {
      button._onClick(event);
    }
  });

  root.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const target = event.target;

    if (!(target instanceof Element) || !root.contains(target)) {
      return;
    }

    // Native buttons already support keyboard activation.
    if (target.matches("button")) {
      return;
    }
  });
}
