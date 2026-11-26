import { useId } from 'react';
import { midiToNoteName } from './pianoKeys.js';

const SPEEDS = [0.5, 1, 2];

function getStatusMessage(seqState, eventCount, speed, playbackResult) {
  if (seqState === 'recording') return 'Recording… play some notes, then press Stop Recording.';
  if (seqState === 'playing') return `Playing ${eventCount} notes at ${speed.toFixed(1)}x…`;
  if (eventCount === 0) return 'Press Record, then play some notes.';
  const queue = `${eventCount} note${eventCount === 1 ? '' : 's'} in the queue. Press Play to replay.`;
  if (playbackResult === 'finished') return `Playback finished. ${queue}`;
  if (playbackResult === 'stopped') return `Playback stopped. ${queue}`;
  return queue;
}

export default function SequencerControls({
  seqState,
  events,
  speed,
  playbackResult,
  onRecordToggle,
  onPlay,
  onStop,
  onSpeedChange,
  onClear,
}) {
  const speedGroupId = useId();
  const isIdle = seqState === 'idle';
  const isRecording = seqState === 'recording';
  const isPlaying = seqState === 'playing';
  const hasEvents = events.length > 0;

  return (
    <section className="sequencer" aria-labelledby="sequencer-heading">
      <h3 id="sequencer-heading">FIFO Sequencer</h3>
      <menu className="sequencer__actions">
        <li>
          <button type="button" onClick={onRecordToggle} disabled={isPlaying}>
            {isRecording ? 'Stop Recording' : 'Record'}
          </button>
        </li>
                <li>
          <button
            type="button"
            onClick={isPlaying ? onStop : onPlay}
            disabled={!isPlaying && (!isIdle || !hasEvents)}
          >
            {isPlaying ? 'Stop Sequence' : 'Play'}
          </button>
        </li>
        <li>
          <button type="button" onClick={onClear} disabled={!isIdle || !hasEvents}>
            Clear
          </button>
        </li>
      </menu>
      <fieldset className="sequencer__speed" disabled={isPlaying}>
        <legend>Replay speed</legend>
        {SPEEDS.map((value) => {
          const inputId = `${speedGroupId}-${value}`;
          return (
            <span key={value} className="sequencer__speed-option">
              <input
                type="radio"
                id={inputId}
                name={speedGroupId}
                value={value}
                checked={speed === value}
                onChange={(event) => onSpeedChange(Number(event.target.value))}
              />
              <label htmlFor={inputId}>{value.toFixed(1)}x</label>
            </span>
          );
        })}
      </fieldset>
      <output className="sequencer__status" aria-live="polite">
        {getStatusMessage(seqState, events.length, speed, playbackResult)}
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