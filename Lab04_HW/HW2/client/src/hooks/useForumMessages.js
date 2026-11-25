import { useEffect, useState } from 'react';

const LOAD_ERROR = 'Could not load messages.';
const SEND_ERROR = 'Could not send message.';

const messagesUrl = (forum) => `/api/messages/${encodeURIComponent(forum)}`;

export function useForumMessages(forum) {
  const [reloadKey, setReloadKey] = useState(0);
  // Last settled GET, tagged with the request it belongs to
  const [result, setResult] = useState({ forum: null, reloadKey: -1, messages: [], error: null });

  // Derived during render
  const loading = result.forum !== forum || result.reloadKey !== reloadKey;
  const data = result.forum === forum ? result.messages : [];
  const error = loading ? null : result.error;

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchMessages = async () => {
      try {
        const response = await fetch(messagesUrl(forum), { signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const messages = await response.json();
        if (signal.aborted) return;
        setResult({ forum, reloadKey, messages, error: null });
      } catch (err) {
        if (err.name === 'AbortError' || signal.aborted) return;
        setResult({ forum, reloadKey, messages: [], error: LOAD_ERROR });
      }
    };

    fetchMessages();
    return () => controller.abort();
  }, [forum, reloadKey]);

  const postMessage = async (payload) => {
    try {
      const response = await fetch(messagesUrl(forum), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));

      if (response.ok) {
        setReloadKey((key) => key + 1); // triggers a fresh, abortable GET
        return { ok: true };
      }
      return { ok: false, message: body.error ?? SEND_ERROR, fields: body.fields };
    } catch {
      return { ok: false, message: SEND_ERROR };
    }
  };

  return { data, loading, error, postMessage };
}
