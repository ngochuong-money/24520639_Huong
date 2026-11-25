import { useEffect, useState } from 'react';

/**
 * Abortable GET with derived loading/data/error.
 * The result is tagged with the request it belongs to, so a stale response can never be shown.
 */
export function useAbortableGet(url, { reloadKey = 0, errorMessage = 'Could not load data.' } = {}) {
  const [result, setResult] = useState({ url: null, reloadKey: -1, data: null, error: null });

  const loading = result.url !== url || result.reloadKey !== reloadKey;
  const data = result.url === url ? result.data : null; // keep showing same-URL data during a refetch
  const error = loading ? null : result.error;

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const load = async () => {
      try {
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const body = await response.json();
        if (signal.aborted) return;
        setResult({ url, reloadKey, data: body, error: null });
      } catch (err) {
        if (err.name === 'AbortError' || signal.aborted) return;
        setResult({ url, reloadKey, data: null, error: errorMessage });
      }
    };

    load();
    return () => controller.abort();
  }, [url, reloadKey, errorMessage]);

  return { data, loading, error };
}
