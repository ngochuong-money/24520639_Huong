const VOICE_GAIN = 0.12; // 8 voices × 0.12 ≈ 0.96, stays below clipping at full polyphony
const SILENT_GAIN = 0.0001; // exponential ramps cannot reach 0
const ATTACK_S = 0.01;
const RELEASE_S = 0.04;
// Events that grant user activation (autoplay policy). Mouse activation comes on mousedown, after pointerdown.
const ACTIVATION_EVENTS = ['keydown', 'mousedown', 'pointerup', 'touchend'];

function hasUserActivation() {
  return !navigator.userActivation || navigator.userActivation.hasBeenActive;
}

export class PolyphonicSynth {
  constructor(maxVoices = 8) {
    this.ctx = null;
    this.maxVoices = maxVoices;
    this.voices = new Map(); // FIFO insertion order: midi -> { osc, gain }
    this.pendingNotes = new Map(); // midi -> freqHz, requested before user activation
    this.activationWait = null; // AbortController for activation listeners
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

  #deferUntilActivation(midi, freqHz) {
    this.pendingNotes.set(midi, freqHz);
    if (this.activationWait) return;

    const controller = new AbortController();
    this.activationWait = controller;
    const onActivation = () => {
      if (!hasUserActivation()) return;
      this.#stopWaitingForActivation();
      const pending = [...this.pendingNotes];
      this.pendingNotes.clear();
      pending.forEach(([pendingMidi, pendingFreq]) => this.noteOn(pendingMidi, pendingFreq));
    };
    ACTIVATION_EVENTS.forEach((type) => {
      window.addEventListener(type, onActivation, { capture: true, signal: controller.signal });
    });
  }

  #stopWaitingForActivation() {
    this.activationWait?.abort();
    this.activationWait = null;
  }

  noteOn(midi, freqHz) {
    if (!this.ctx && !hasUserActivation()) {
      this.#deferUntilActivation(midi, freqHz);
      return;
    }

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
    this.pendingNotes.delete(midi);
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
    this.pendingNotes.clear();
    this.#stopWaitingForActivation();
    [...this.voices.keys()].forEach((midi) => this.noteOff(midi));
  }

  get activeCount() {
    return this.voices.size;
  }
}