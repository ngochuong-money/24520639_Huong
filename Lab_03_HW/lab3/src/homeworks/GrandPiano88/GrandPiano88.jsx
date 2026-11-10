import { useCallback, useEffect, useRef, useState } from 'react';
import { PIANO_KEYS } from './pianoKeys.js';
import { PolyphonicSynth } from './polyphonicSynth.js';
import { playSequence } from './sequencePlayer.js';
import { usePianoKeyboard } from './usePianoKeyboard.js';
import PianoKey from './PianoKey.jsx';
import SequencerControls from './SequencerControls.jsx';
import './GrandPiano88.css';

const KEY_BY_MIDI = new Map(PIANO_KEYS.map((key) => [key.midi, key]));

// Each slot = one white key + the black key directly above it (if any): 52 slots
const KEY_SLOTS = PIANO_KEYS.reduce((slots, key) => {
  if (!key.isBlack) return [...slots, { white: key, black: null }];
  const last = slots.at(-1);
  return [...slots.slice(0, -1), { ...last, black: key }];
}, []);

// Explicit state machine: state -> action -> next state. Unlisted actions are ignored.
const SEQ_TRANSITIONS = {
  idle: { RECORD: 'recording', PLAY: 'playing' },
  recording: { STOP_RECORDING: 'idle' },
  playing: { FINISH: 'idle' },
};

export default function GrandPiano88() {
  const [pressedNotes, setPressedNotes] = useState(() => new Set());
  const [seqState, setSeqState] = useState('idle'); // 'idle' | 'recording' | 'playing'
  const [recording, setRecording] = useState([]); // FIFO queue of RecordedNote
  const [speed, setSpeed] = useState(1); // 0.5 | 1 | 2

  const synthRef = useRef(null);
  const seqStateRef = useRef('idle'); // read by stable note handlers
  const noteStartRef = useRef(new Map()); // midi -> { id, startedAt } for notes held while recording
  const lastNoteOnRef = useRef(null); // timestamp of previous recorded note-on
  const abortRef = useRef(null); // AbortController of the current playback, if any

  // Synth object is created once; its AudioContext is still created lazily on the first note.
  const getSynth = () => {
    synthRef.current ??= new PolyphonicSynth();
    return synthRef.current;
  };

  /** Applies a state-machine action; returns false if it is not allowed from the current state. */
  const dispatchSeq = (action) => {
    const nextState = SEQ_TRANSITIONS[seqStateRef.current][action];
    if (!nextState) return false;
    seqStateRef.current = nextState;
    setSeqState(nextState);
    return true;
  };

  const setDuration = (id, durationMs) => {
    setRecording((prev) => prev.map((event) => (event.id === id ? { ...event, durationMs } : event)));
  };

  const handleNoteOn = useCallback((midi) => {
    const { freqHz } = KEY_BY_MIDI.get(midi);
    getSynth().noteOn(midi, freqHz);
    setPressedNotes((prev) => (prev.has(midi) ? prev : new Set(prev).add(midi)));

    if (seqStateRef.current !== 'recording' || noteStartRef.current.has(midi)) return;

    const now = performance.now();
    const deltaMs = lastNoteOnRef.current === null ? 0 : Math.round(now - lastNoteOnRef.current);
    const event = { id: crypto.randomUUID(), midi, freqHz, durationMs: null, deltaMs };
    lastNoteOnRef.current = now;
    noteStartRef.current.set(midi, { id: event.id, startedAt: now });
    setRecording((prev) => [...prev, event]);
  }, []);

  const handleNoteOff = useCallback((midi) => {
    synthRef.current?.noteOff(midi);
    setPressedNotes((prev) => {
      if (!prev.has(midi)) return prev;
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });

    const started = noteStartRef.current.get(midi);
    if (!started) return;
    noteStartRef.current.delete(midi);
    setDuration(started.id, Math.round(performance.now() - started.startedAt));
  }, []);

  usePianoKeyboard({ onNoteOn: handleNoteOn, onNoteOff: handleNoteOff });

    // Leaving the page/route: cancel pending playback, then silence every voice.
  useEffect(
    () => () => {
      abortRef.current?.abort();
      synthRef.current?.stopAll();
    },
    [],
  );

  const handleRecordToggle = () => {
    if (seqStateRef.current === 'recording') {
      // Finalize notes still held when recording stops.
      const now = performance.now();
      for (const { id, startedAt } of noteStartRef.current.values()) {
        setDuration(id, Math.round(now - startedAt));
      }
      noteStartRef.current.clear();
      dispatchSeq('STOP_RECORDING');
      return;
    }
    if (!dispatchSeq('RECORD')) return;
    noteStartRef.current.clear();
    lastNoteOnRef.current = null;
    setRecording([]);
  };

    const handlePlay = async () => {
    if (recording.length === 0 || !dispatchSeq('PLAY')) return;
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await playSequence(recording, {
        speed,
        signal: controller.signal,
        onNoteOn: handleNoteOn,
        onNoteOff: handleNoteOff,
      });
    } catch (error) {
      if (error?.name !== 'AbortError') throw error; // Stop/unmount is expected; real errors still surface
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      dispatchSeq('FINISH');
    }
  };

  const handleStop = () => {
    if (seqStateRef.current !== 'playing') return;
    abortRef.current?.abort(); // rejects every pending sleep: no further note-on/off timers fire
    synthRef.current?.stopAll(); // release oscillators that are already sounding
    setPressedNotes(new Set());
  };

  const handleClear = () => {
    if (seqStateRef.current !== 'idle') return;
    setRecording([]);
  };

  const renderKey = (key) => (
    <PianoKey
      midi={key.midi}
      noteName={key.noteName}
      isBlack={key.isBlack}
      isPressed={pressedNotes.has(key.midi)}
      onNoteOn={handleNoteOn}
      onNoteOff={handleNoteOff}
    />
  );

  return (
    <section className="grand-piano" aria-labelledby="grand-piano-heading">
      <h2 id="grand-piano-heading">HW2: 88-Key Polyphonic Piano</h2>
      <p>
        Click or tap a key, or focus it and press Space or Enter. Computer keys{' '}
        <kbd>A</kbd> to <kbd>K</kbd> (with <kbd>W</kbd> <kbd>E</kbd> <kbd>T</kbd> <kbd>Y</kbd>{' '}
        <kbd>U</kbd> for sharps) play C4–C5. Scroll the keyboard horizontally to reach all 88 keys.
      </p>
      <SequencerControls
        seqState={seqState}
        events={recording}
        speed={speed}
        onRecordToggle={handleRecordToggle}
        onPlay={handlePlay}
        onStop={handleStop}
        onSpeedChange={setSpeed}
        onClear={handleClear}
      />
      <ul className="piano" aria-label="Piano keyboard, A0 to C8">
        {KEY_SLOTS.map(({ white, black }) => (
          <li key={white.midi} className="piano__slot">
            {renderKey(white)}
            {black && renderKey(black)}
          </li>
        ))}
      </ul>
    </section>
  );
}