
import type { FFTSize } from '../types/audio-engine';

export class AudioEngine {
  private readonly context: AudioContext;
  private readonly analyser: AnalyserNode;
  private frequencyData: Uint8Array<ArrayBuffer>;

  private activeSource: AudioBufferSourceNode | null = null;

  constructor() {
    this.context = new AudioContext();

    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 256;

    this.frequencyData = new Uint8Array(
      this.analyser.frequencyBinCount
    );

    // Connect once, not every time a track is played.
    this.analyser.connect(this.context.destination);
  }

  get audioContext(): AudioContext {
    return this.context;
  }

  get analyserNode(): AnalyserNode {
    return this.analyser;
  }

  setFFTSize(size: FFTSize): void {
    this.analyser.fftSize = size;

    this.frequencyData = new Uint8Array(
      this.analyser.frequencyBinCount
    );
  }

  getFrequencyData(): Uint8Array<ArrayBuffer> {
    this.analyser.getByteFrequencyData(this.frequencyData);
    return this.frequencyData;
  }

  async loadAudioBuffer(
    trackUrl: string,
    signal?: AbortSignal
  ): Promise<AudioBuffer> {
    if (!trackUrl.trim()) {
      throw new Error('Audio URL cannot be empty.');
    }

    if (signal?.aborted) {
      throw new DOMException(
        'Audio loading cancelled.',
        'AbortError'
      );
    }

    const response = await fetch(trackUrl, { signal });

    if (!response.ok) {
      throw new Error(
        `Audio download failed: HTTP ${response.status}`
      );
    }

    const contentType = response.headers.get('content-type');

    if (contentType?.includes('text/html')) {
      throw new Error(
        'Audio download failed: URL returned HTML instead of audio.'
      );
    }

    const audioData = await response.arrayBuffer();

    if (signal?.aborted) {
      throw new DOMException(
        'Audio loading cancelled.',
        'AbortError'
      );
    }

    let buffer: AudioBuffer;

    try {
      buffer = await this.context.decodeAudioData(audioData);
    } catch {
      if (signal?.aborted) {
        throw new DOMException(
          'Audio loading cancelled.',
          'AbortError'
        );
      }

      throw new Error(
        'Audio decoding failed: unsupported or invalid format.'
      );
    }

    if (signal?.aborted) {
      throw new DOMException(
        'Audio loading cancelled.',
        'AbortError'
      );
    }

    return buffer;
  }

  // Create a new source for each playback.
  async playBuffer(buffer: AudioBuffer): Promise<void> {
    if (this.context.state === 'closed') {
      throw new Error('AudioContext is closed.');
    }

    await this.context.resume();

    // Stop and release the previous source.
    this.stop();

    const source = this.context.createBufferSource();
    source.buffer = buffer;

    source.connect(this.analyser);

    this.activeSource = source;

    source.onended = () => {
      if (this.activeSource === source) {
        this.cleanupSource(source);
      }
    };

    try {
      source.start();
    } catch (error) {
      this.cleanupSource(source);
      throw error;
    }
  }

  // Stop the current source and release it.
  stop(): void {
    const source = this.activeSource;

    if (!source) return;

    source.onended = null;

    try {
      source.stop();
    } finally {
      this.cleanupSource(source);
    }
  }

  // Remove connections, handlers, and references.
  private cleanupSource(source: AudioBufferSourceNode): void {
    source.onended = null;
    source.disconnect();
    source.buffer = null;

    if (this.activeSource === source) {
      this.activeSource = null;
    }
  }

  // Clean up audio resources before closing.
  async close(): Promise<void> {
    if (this.context.state === 'closed') return;

    this.stop();
    this.analyser.disconnect();

    await this.context.close();
  }
}
