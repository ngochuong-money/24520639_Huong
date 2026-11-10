import { midiToNoteName } from './pianoKeys.js';

function getStatusMessage(seqState, eventCount) {
  if (seqState === 'recording') return 'Recording… play some notes, then press Stop Recording.';
  if (eventCount === 0) return 'Press Record, then play some notes.';
  return `Recording stopped. ${eventCount} note${eventCount === 1 ? '' : 's'} in the queue.`;
}

export default function SequencerControls({ seqState, events, onRecordToggle, onClear }) {
  const isRecording = seqState === 'recording';

  return (
    <section className="sequencer" aria-labelledby="sequencer-heading">
      <h3 id="sequencer-heading">FIFO Sequencer</h3>
      <menu className="sequencer__actions">
        <li>
          <button type="button" onClick={onRecordToggle}>
            {isRecording ? 'Stop Recording' : 'Record'}
          </button>
        </li>
        <li>
          <button type="button" onClick={onClear} disabled={isRecording || events.length === 0}>
            Clear
          </button>
        </li>
      </menu>
      <output className="sequencer__status" aria-live="polite">
        {getStatusMessage(seqState, events.length)}
      </output>
      <details>
        <summary>Recorded notes ({events.length})</summary>
        <ol className="sequencer__queue">
          {events.map((event) => (
            <li key={event.id}>
              {midiToNoteName(event.midi)}: +{event.deltaMs} ms, held{' '}
              {event.durationMs === null ? '…' : `${event.durationMs} ms`}
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}