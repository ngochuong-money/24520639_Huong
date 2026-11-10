/**
 * @typedef {object} ToneVoice
 * @property {'tone'} source - Oscillator with a pitch drop (kick, toms).
 * @property {number} startFrequency - Hz at attack.
 * @property {number} endFrequency - Hz at end of decay.
 * @property {number} decay - Seconds until silence.
 * @property {number} gain - Peak gain, 0–1.
 */

/**
 * @typedef {object} NoiseVoice
 * @property {'noise'} source - Filtered white noise (snare, hats, cymbals, clap).
 * @property {'highpass' | 'bandpass'} filterType
 * @property {number} frequency - Filter cutoff/center in Hz.
 * @property {number} decay - Seconds until silence.
 * @property {number} gain - Peak gain, 0–1.
 */

/** @typedef {ToneVoice | NoiseVoice} VoiceParams */

/**
 * @typedef {object} DrumPad
 * @property {string} id - Stable unique id, used as React key.
 * @property {string} code - Physical KeyboardEvent.code (layout/IME independent).
 * @property {string} keyLabel - Visible key hint.
 * @property {string} name - Human-readable sound name.
 * @property {VoiceParams} voice
 */

/** @type {readonly DrumPad[]} */
export const DRUM_PADS = Object.freeze([
  {
    id: 'crash',
    code: 'KeyW',
    keyLabel: 'W',
    name: 'Crash',
    voice: { source: 'noise', filterType: 'highpass', frequency: 5000, decay: 1.2, gain: 0.6 },
  },
  {
    id: 'kick',
    code: 'KeyA',
    keyLabel: 'A',
    name: 'Kick',
    voice: { source: 'tone', startFrequency: 150, endFrequency: 50, decay: 0.5, gain: 1 },
  },
  {
    id: 'snare',
    code: 'KeyS',
    keyLabel: 'S',
    name: 'Snare',
    voice: { source: 'noise', filterType: 'highpass', frequency: 1000, decay: 0.2, gain: 0.8 },
  },
  {
    id: 'hihat',
    code: 'KeyD',
    keyLabel: 'D',
    name: 'Hi-Hat',
    voice: { source: 'noise', filterType: 'highpass', frequency: 7000, decay: 0.05, gain: 0.5 },
  },
  {
    id: 'tom-low',
    code: 'KeyJ',
    keyLabel: 'J',
    name: 'Low Tom',
    voice: { source: 'tone', startFrequency: 120, endFrequency: 80, decay: 0.4, gain: 0.9 },
  },
  {
    id: 'tom-high',
    code: 'KeyK',
    keyLabel: 'K',
    name: 'High Tom',
    voice: { source: 'tone', startFrequency: 220, endFrequency: 160, decay: 0.3, gain: 0.8 },
  },
  {
    id: 'clap',
    code: 'KeyL',
    keyLabel: 'L',
    name: 'Clap',
    voice: { source: 'noise', filterType: 'bandpass', frequency: 1500, decay: 0.15, gain: 0.8 },
  },
]);

/** Physical key code → pad, built once at module load. */
export const PAD_MAP = new Map(DRUM_PADS.map((pad) => [pad.code, pad]));

/** Pad id → pad, for looking up display data from a hit. */
export const PAD_BY_ID = new Map(DRUM_PADS.map((pad) => [pad.id, pad]));