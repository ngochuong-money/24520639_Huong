import { useCallback, useEffect, useRef, useState } from 'react';
import { PIANO_KEYS } from './pianoKeys.js';
import { PolyphonicSynth } from './polyphonicSynth.js';
import { usePianoKeyboard } from './usePianoKeyboard.js';
import PianoKey from './PianoKey.jsx';
import './GrandPiano88.css';

const KEY_BY_MIDI = new Map(PIANO_KEYS.map((key) => [key.midi, key]));

// Each slot = one white key + the black key directly above it (if any): 52 slots
const KEY_SLOTS = PIANO_KEYS.reduce((slots, key) => {
  if (!key.isBlack) return [...slots, { white: key, black: null }];
  const last = slots.at(-1);
  return [...slots.slice(0, -1), { ...last, black: key }];
}, []);

export default function GrandPiano88() {
  const [pressedNotes, setPressedNotes] = useState(() => new Set());
  const synthRef = useRef(null);

  // Synth object is created once; its AudioContext is still created lazily on the first note.
  const getSynth = () => {
    synthRef.current ??= new PolyphonicSynth();
    return synthRef.current;
  };

  const handleNoteOn = useCallback((midi) => {
    getSynth().noteOn(midi, KEY_BY_MIDI.get(midi).freqHz);
    setPressedNotes((prev) => (prev.has(midi) ? prev : new Set(prev).add(midi)));
  }, []);

  const handleNoteOff = useCallback((midi) => {
    synthRef.current?.noteOff(midi);
    setPressedNotes((prev) => {
      if (!prev.has(midi)) return prev;
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });
  }, []);

  usePianoKeyboard({ onNoteOn: handleNoteOn, onNoteOff: handleNoteOff });

  // Silence every voice when leaving the page/route.
  useEffect(() => () => synthRef.current?.stopAll(), []);

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