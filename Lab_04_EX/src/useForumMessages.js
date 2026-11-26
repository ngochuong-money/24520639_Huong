import { useState, useEffect } from 'react';

export function useForumMessages(channelId) {
  const [msgs, setMsgs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/channels/${channelId}/messages`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setMsgs(data);
        setError(null);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error(err);
          setError(err.message);
        }
      });

    return () => controller.abort();
  }, [channelId]);

  return { msgs, error };
}
