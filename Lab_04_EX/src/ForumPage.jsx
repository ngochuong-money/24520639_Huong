import { useState, useId, Fragment } from 'react';
import { useForumMessages } from './useForumMessages';
import AppNav from './AppNav.jsx';

const CHANNELS = ['nasa', 'esports-tribunal', 'notNasa'];

export default function ForumPage() {
  const [channelId, setChannelId] = useState(CHANNELS[0]);
  const { msgs, error } = useForumMessages(channelId);
  const headingId = useId();

  return (
    <main className="page-shell forum-page" aria-labelledby={headingId}>
      <AppNav />
      <header className="page-heading">
        <p className="eyebrow">ROOM FOR CONVERSATION</p>
        <h1 id={headingId}>Forum</h1>
        <p>Pick a channel and catch up with the conversation.</p>
      </header>

      <nav aria-label="Channels">
        <ul className="channel-list">
          {CHANNELS.map((c) => (
            <li key={c}>
              <button
                type="button"
                onClick={() => setChannelId(c)}
                aria-pressed={c === channelId}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <section className="forum-messages" aria-live="polite" aria-label={`Messages in ${channelId}`}>
        <h2>Messages <span className="channel-tag">{channelId}</span></h2>
        {error && <p role="alert">Could not load messages: {error}</p>}
        {msgs.length === 0 && !error ? (
          <p>No messages yet.</p>
        ) : (
          <dl>
            {msgs.map((msg) => (
              <Fragment key={msg.id}>
                <dt>{msg.author}</dt>
                <dd>{msg.text}</dd>
              </Fragment>
            ))}
          </dl>
        )}
      </section>
    </main>
  );
}
