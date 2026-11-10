import { useId, useState } from 'react';

const NOTES_MAX_LENGTH = 120;

export default function SessionControls({ isKeyboardEnabled, onKeyboardEnabledChange, onClearLog }) {
  const keyboardId = useId();
  const notesId = useId();
  const notesHintId = useId();
  const [notes, setNotes] = useState('');

  return (
    <fieldset className="session-controls">
      <legend>Session controls</legend>
      <p>
        <input
          id={keyboardId}
          type="checkbox"
          role="switch"
          checked={isKeyboardEnabled}
          onChange={(event) => onKeyboardEnabledChange(event.target.checked)}
        />{' '}
        <label htmlFor={keyboardId}>Keyboard shortcuts</label>
      </p>
      <p>
        <button type="button" onClick={onClearLog}>
          Clear hit log
        </button>
      </p>
      <p>
        <label htmlFor={notesId}>Session notes</label>{' '}
        <input
          id={notesId}
          type="text"
          value={notes}
          maxLength={NOTES_MAX_LENGTH}
          autoComplete="off"
          aria-describedby={notesHintId}
          onChange={(event) => setNotes(event.target.value)}
        />{' '}
        <small id={notesHintId}>
          Drum shortcuts pause while you type here ({notes.length}/{NOTES_MAX_LENGTH}).
        </small>
      </p>
    </fieldset>
  );
}