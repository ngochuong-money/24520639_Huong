import { DRUM_PADS } from './drumPads.js';

/** Meter range in dBFS; consumed by LevelMeter (Task 1.7). */
export const LEVEL_MIN_DB = -12;
export const LEVEL_MAX_DB = 0;

const SILENCE = 0.0001; // exponential ramps cannot reach 0
const STOP_PADDING = 0.05; // seconds after envelope ends
const NOISE_SECONDS = 2; // longer than the longest decay (crash 1.2s)

const VOICE_BY_ID = new Map(DRUM_PADS.map(({ id, voice }) => [id, voice]));

let audioContext = null;
let noiseBuffer = null;

/** Lazily creates the single shared AudioContext; resumes it if the browser suspended it. */
function getAudioContext() {
  audioContext ??= new AudioContext();
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

/** White noise generated once and reused by every noise voice. */
function getNoiseBuffer(ctx) {
  if (!noiseBuffer) {
    const length = Math.ceil(ctx.sampleRate * NOISE_SECONDS);
    noiseBuffer = new AudioBuffer({ length, sampleRate: ctx.sampleRate, numberOfChannels: 1 });
    const samples = noiseBuffer.getChannelData(0);
    for (let i = 0; i < samples.length; i += 1) {
      samples[i] = Math.random() * 2 - 1;
    }
  }
  return noiseBuffer;
}

/** Builds the sound source for a voice; returns the node to start and the node to route onward. */
function createSource(ctx, voice, startTime) {
  if (voice.source === 'tone') {
    const oscillator = new OscillatorNode(ctx, { type: 'sine' });
    oscillator.frequency.setValueAtTime(voice.startFrequency, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(voice.endFrequency, startTime + voice.decay);
    return { source: oscillator, output: oscillator };
  }

  const noise = new AudioBufferSourceNode(ctx, { buffer: getNoiseBuffer(ctx) });
  const filter = new BiquadFilterNode(ctx, { type: voice.filterType, frequency: voice.frequency });
  noise.connect(filter);
  return { source: noise, output: filter };
}

function gainToDb(gain) {
  const db = 20 * Math.log10(gain);
  const clamped = Math.min(LEVEL_MAX_DB, Math.max(LEVEL_MIN_DB, db));
  return Math.round(clamped * 10) / 10;
}

/**
 * Plays one drum hit. Must be called from a user gesture handler the first time
 * so the browser allows audio.
 * @param {string} padId - An id from DRUM_PADS.
 * @returns {number} Peak hit level in dBFS (LEVEL_MIN_DB…LEVEL_MAX_DB).
 */
export function playVoice(padId) {
  const voice = VOICE_BY_ID.get(padId);
  if (!voice) {
    throw new Error(`Unknown drum pad id: ${padId}`);
  }

  const ctx = getAudioContext();
  const startTime = ctx.currentTime;
  const endTime = startTime + voice.decay;

  const envelope = new GainNode(ctx);
  envelope.gain.setValueAtTime(voice.gain, startTime);
  envelope.gain.exponentialRampToValueAtTime(SILENCE, endTime);

  const { source, output } = createSource(ctx, voice, startTime);
  output.connect(envelope).connect(ctx.destination);

  source.addEventListener(
    'ended',
    () => {
      source.disconnect();
      output.disconnect();
      envelope.disconnect();
    },
    { once: true },
  );

  source.start(startTime);
  source.stop(endTime + STOP_PADDING);

  return gainToDb(voice.gain);
}