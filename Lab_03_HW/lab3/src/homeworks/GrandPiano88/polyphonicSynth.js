const VOICE_GAIN = 0.12; // 8 voices × 0.12 ≈ 0.96, stays below clipping at full polyphony
const SILENT_GAIN = 0.0001; // exponential ramps cannot reach 0
const ATTACK_S = 0.01;
const RELEASE_S = 0.04;

export class PolyphonicSynth {
  constructor(maxVoices = 8) {
    this.ctx = null;
    this.maxVoices = maxVoices;
    this.voices = new Map(); // FIFO insertion order: midi -> { osc, gain }
  }

  #ensureContext() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  noteOn(midi, freqHz) {
    const ctx = this.#ensureContext();
    if (this.voices.has(midi)) return;

    if (this.voices.size >= this.maxVoices) {
      const oldestMidi = this.voices.keys().next().value;
      this.noteOff(oldestMidi); // FIFO voice stealing
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freqHz, now);
    gain.gain.setValueAtTime(SILENT_GAIN, now);
    gain.gain.exponentialRampToValueAtTime(VOICE_GAIN, now + ATTACK_S);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);

    this.voices.set(midi, { osc, gain });
  }

  noteOff(midi) {
    const voice = this.voices.get(midi);
    if (!voice) return;

    this.voices.delete(midi);
    const { osc, gain } = voice;
    const now = this.ctx.currentTime;

    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(Math.max(gain.gain.value, SILENT_GAIN), now); // anchor ramp at current level
    gain.gain.exponentialRampToValueAtTime(SILENT_GAIN, now + RELEASE_S);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    osc.stop(now + RELEASE_S);
  }

  stopAll() {
    [...this.voices.keys()].forEach((midi) => this.noteOff(midi));
  }

  get activeCount() {
    return this.voices.size;
  }
}