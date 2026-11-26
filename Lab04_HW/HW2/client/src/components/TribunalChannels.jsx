import { useId, useState } from 'react';
import { CHANNELS } from '@shared/channels.js';
import { useForumMessages } from '../hooks/useForumMessages.js';
import MessageForm from './MessageForm.jsx';

const timeFormatter = new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' });

export default function TribunalChannels({ defaultChannel = 'esports-tribunal' }) {
  const headingId = useId();
  const [forum, setForum] = useState(defaultChannel);
  const { data, loading, error, postMessage } = useForumMessages(forum);
  const messages = Array.isArray(data) ? data : [];

  return (
    <section aria-labelledby={headingId} className="tribunal">
      <h3 id={headingId}>Tribunal discussion</h3>

      <fieldset className="channel-switcher">
        <legend>Channel</legend>
        {CHANNELS.map((channel) => (
          <button
            key={channel}
            type="button"
            aria-pressed={channel === forum}
            onClick={() => setForum(channel)}
            className="channel-button"
          >
            #{channel}
          </button>
        ))}
      </fieldset>

      <section aria-label={`Messages in #${forum}`} aria-busy={loading} className="message-panel">
        {error && <p role="alert" className="field-error">{error}</p>}
        {!loading && !error && messages.length === 0 && <p>No messages yet.</p>}
        {messages.length > 0 && (
          <ol className="message-list">
            {messages.map((m) => (
              <li key={m.id}>
                <p className="history-meta">
                  <strong>{m.author}</strong>{' · '}
                  <time dateTime={m.createdAt}>{timeFormatter.format(new Date(m.createdAt))}</time>
                </p>
                <p>{m.text}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <MessageForm key={forum} postMessage={postMessage} />
    </section>
  );
}
