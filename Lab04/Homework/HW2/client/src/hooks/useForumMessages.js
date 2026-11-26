import { useState } from 'react';
import { useAbortableGet } from './useAbortableGet.js';

const LOAD_ERROR = 'Could not load messages.';
const SEND_ERROR = 'Could not send message.';

const messagesUrl = (forum) => `/api/messages/${encodeURIComponent(forum)}`;

export function useForumMessages(forum) {
  const [reloadKey, setReloadKey] = useState(0);
  const { data, loading, error } = useAbortableGet(messagesUrl(forum), { reloadKey, errorMessage: LOAD_ERROR });

  const postMessage = async (payload) => {
    try {
      const response = await fetch(messagesUrl(forum), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));

      if (response.ok) {
        setReloadKey((key) => key + 1);
        return { ok: true };
      }
      return { ok: false, message: body.error ?? SEND_ERROR, fields: body.fields };
    } catch {
      return { ok: false, message: SEND_ERROR };
    }
  };

  return { data: data ?? [], loading, error, postMessage };
}
