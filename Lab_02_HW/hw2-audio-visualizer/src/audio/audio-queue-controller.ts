
import { AudioEngine } from './audio-engine';
import type { AudioTask } from '../types/audio-task';

export class AudioTaskQueue {
    private queue: AudioTask[] = [];
    private isProcessing = false;
    private activeController: AbortController | null = null;


    private readonly audioEngine: AudioEngine;

    constructor(audioEngine: AudioEngine) {
        this.audioEngine = audioEngine;
    }


    async enqueue(trackUrl: string): Promise<AudioBuffer> {
        const controller = new AbortController();

        return new Promise<AudioBuffer>((resolve, reject) => {
            this.queue.push({
                trackUrl,
                controller,
                resolve,
                reject,
            });

            void this.processNext();
        });
    }

    private async processNext(): Promise<void> {
        // Prevent concurrent queue processors.
        if (this.isProcessing || this.activeController !== null) {
            return;
        }

        this.isProcessing = true;

        try {
            while (this.queue.length > 0) {
                const task = this.queue.shift();

                if (!task) continue;

                this.activeController = task.controller;

                try {
                    const buffer = await this.audioEngine.loadAudioBuffer(
                        task.trackUrl,
                        task.controller.signal
                    );

                    task.resolve(buffer);
                } catch (error: unknown) {
                    task.reject(error);
                } finally {
                    this.activeController = null;
                }
            }
        } finally {
            this.isProcessing = false;
        }
    }
}
