import { useSyncExternalStore } from 'react';

function subscribe(onChange) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

const getSnapshot = () => window.location.hash.slice(1);
const getServerSnapshot = () => '';

export function useHashRoute() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}