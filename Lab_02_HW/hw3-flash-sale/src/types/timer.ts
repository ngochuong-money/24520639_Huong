
export type TimerStatus =
  | 'idle'
  | 'running'
  | 'completed'
  | 'cancelled';

export type TimerTickCallback = (
  remaining: number
) => void;

export type TimerCleanup = () => void;

export interface TimerState {
  status: TimerStatus;
  durationMs: number;
  targetTime: number;
  remainingMs: number;
}
