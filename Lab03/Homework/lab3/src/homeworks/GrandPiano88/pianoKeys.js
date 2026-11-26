const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_PITCH_CLASSES = new Set([1, 3, 6, 8, 10]);

export const MIDI_MIN = 21; // A0
export const MIDI_MAX = 108; // C8

export function midiToFreq(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function midiToNoteName(midi) {
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[midi % 12]}${octave}`;
}

export function isBlackKey(midi) {
  return BLACK_PITCH_CLASSES.has(midi % 12);
}

export const PIANO_KEYS = Object.freeze(
  Array.from({ length: MIDI_MAX - MIDI_MIN + 1 }, (_, offset) => {
    const midi = MIDI_MIN + offset;
    return Object.freeze({
      midi,
      noteName: midiToNoteName(midi),
      isBlack: isBlackKey(midi),
      freqHz: midiToFreq(midi),
    });
  }),
);