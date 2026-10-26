import type { FFTSize } from '../types/audio-engine';
export class AudioEngine {
    private readonly context: AudioContext;
    private readonly analyser: AnalyserNode;
    private frequencyData: Uint8Array<ArrayBuffer>;


    constructor() {
        this.context = new AudioContext();

        this.analyser = this.context.createAnalyser();
        this.analyser.fftSize = 256;

        this.frequencyData = new Uint8Array(
            this.analyser.frequencyBinCount
        );
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
        this.analyser.getByteFrequencyData(
            this.frequencyData
        );

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

        // Download audio
        const response = await fetch(trackUrl, { signal });

        if (!response.ok) {
            throw new Error(
                `Audio download failed: HTTP ${response.status}`
            );
        }

        const contentType = response.headers.get('content-type');

        if (
            contentType?.includes('text/html')
        ) {
            throw new Error(
                'Audio download failed: URL returned HTML instead of audio.'
            );
        }


        const audioData = await response.arrayBuffer();

        // Check cancellation before decoding
        if (signal?.aborted) {
            throw new DOMException(
                'Audio loading cancelled.',
                'AbortError'
            );
        }

        // Decode audio data
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

        // Ignore results if cancelled during decoding
        if (signal?.aborted) {
            throw new DOMException(
                'Audio loading cancelled.',
                'AbortError'
            );
        }

        return buffer;
    }

    async close(): Promise<void> {
        if (this.context.state !== 'closed') {
            await this.context.close();
        }
    }



}
