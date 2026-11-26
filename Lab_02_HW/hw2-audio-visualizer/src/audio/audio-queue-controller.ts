
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

  enqueue(trackUrl: string): Promise<AudioBuffer> {
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

  // Cancel the currently active task.
  cancelActive(): void {
    this.activeController?.abort();
  }

  // Cancel all tasks that have not started.
  cancelQueued(): void {
    const pendingTasks = this.queue.splice(0);

    for (const task of pendingTasks) {
      task.controller.abort();
      task.reject(
        new DOMException('Audio task cancelled.', 'AbortError')
      );
    }
  }

  // Cancel both active and queued tasks.
  cancelAll(): void {
    this.cancelActive();
    this.cancelQueued();
  }

  // Allow a task to stop waiting during decoding.
  private async loadWithCancellation(
    task: AudioTask
  ): Promise<AudioBuffer> {
    const signal = task.controller.signal;

    if (signal.aborted) {
      throw new DOMException(
        'Audio task cancelled.',
        'AbortError'
      );
    }

    let onAbort: () => void = () => {};

    const cancelled = new Promise<never>((_, reject) => {
      onAbort = () => {
        reject(
          new DOMException(
            'Audio task cancelled.',
            'AbortError'
          )
        );
      };

      signal.addEventListener('abort', onAbort, {
        once: true,
      });
    });

    try {
      const loading = this.audioEngine.loadAudioBuffer(
        task.trackUrl,
        signal
      );

      return await Promise.race([loading, cancelled]);
    } finally {
      signal.removeEventListener('abort', onAbort);
    }
  }

  private async processNext(): Promise<void> {
    if (
      this.isProcessing ||
      this.activeController !== null
    ) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        const task = this.queue.shift();

        if (!task) continue;

        this.activeController = task.controller;

        try {
          const buffer = await this.loadWithCancellation(
            task
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
