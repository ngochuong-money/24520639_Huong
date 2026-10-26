
import { AudioEngine } from '../audio/audio-engine';

export class FrequencyVisualizer {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly audioEngine: AudioEngine;

    private animationId: number | null = null;
    private isRunning = false;



    private readonly barColor = '#3b82f6';

    constructor(
        canvas: HTMLCanvasElement,
        audioEngine: AudioEngine
    ) {
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Canvas 2D context is unavailable.');
        }

        this.canvas = canvas;
        this.ctx = ctx;
        this.audioEngine = audioEngine;
    }

    // Draw the current AnalyserNode frequency data.
    draw(): void {
        const data = this.audioEngine.getFrequencyData();
        const width = this.canvas.width;
        const height = this.canvas.height;
        const barWidth = width / data.length;

        this.ctx.clearRect(0, 0, width, height);
        this.ctx.fillStyle = this.barColor;

        for (let i = 0; i < data.length; i++) {
            const barHeight = (data[i] / 255) * height;
            const x = i * barWidth;
            const y = height - barHeight;

            this.ctx.fillRect(
                x,
                y,
                Math.max(0, barWidth - 1),
                barHeight
            );
        }
    }

    // Start one requestAnimationFrame loop.




    start(): void {
        if (this.isRunning) return;

        this.isRunning = true;

        const animate = () => {
            if (!this.isRunning) return;

            this.draw();

            if (this.isRunning) {
                this.animationId = requestAnimationFrame(animate);
            }
        };

        this.animationId = requestAnimationFrame(animate);
    }


    // Cancel animation when no longer needed.




    stop(): void {
        if (!this.isRunning) return;

        this.isRunning = false;

        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }




}
