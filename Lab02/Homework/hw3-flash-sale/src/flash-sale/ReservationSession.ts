
import { InventoryManager } from '../inventory/InventoryManager';
import { createCountdown } from '../timer/countdown';
import type { InventoryReservation } from '../types/inventory';
import type { TimerCleanup } from '../types/timer';

export interface ReservationSnapshot {
  reservation: InventoryReservation;
  remainingMs: number;
}

export interface ReservationSession {
  reservationId: string;
  cancel(): InventoryReservation;
  checkout(): InventoryReservation;
  dispose(): void;
}

export function createReservationSession(
  inventory: InventoryManager,
  userId: string,
  quantity: number,
  expectedVersion: number,
  lockDurationMs: number,
  onUpdate: (snapshot: ReservationSnapshot) => void
): ReservationSession {
  // InventoryManager remains responsible for reservation validity.
  const reservation = inventory.reserve(
    userId,
    quantity,
    expectedVersion,
    lockDurationMs
  );

  let disposed = false;
  let cleanup: TimerCleanup = () => {};

  function publish(): void {
    if (disposed) return;

    const current = inventory.getReservation(reservation.id);
    if (!current) return;

    const remainingMs =
      current.status === 'reserved'
        ? Math.max(0, current.expiresAt - Date.now())
        : 0;

    onUpdate({
      reservation: current,
      remainingMs,
    });

    // Stop displaying ticks once reservation is terminal.
    if (current.status !== 'reserved') {
      cleanup();
    }
  }

  const duration = Math.max(
    0,
    reservation.expiresAt - Date.now()
  );

  cleanup = createCountdown(
    duration,
    () => publish(),
    () => publish()
  );

  // If the first synchronous tick already ended, this is safe.
  if (inventory.getReservation(reservation.id)?.status !== 'reserved') {
    cleanup();
  }

  return {
    reservationId: reservation.id,

    cancel(): InventoryReservation {
      if (disposed) {
        throw new Error('Reservation session is disposed');
      }

      const result = inventory.cancelReservation(
        reservation.id,
        userId
      );

      cleanup();
      publish();
      return result;
    },

    checkout(): InventoryReservation {
      if (disposed) {
        throw new Error('Reservation session is disposed');
      }

      try {
        const result = inventory.checkout(
          reservation.id,
          userId
        );

        cleanup();
        publish();
        return result;
      } catch (error) {
        // InventoryManager may have expired the reservation.
        publish();
        throw error;
      }
    },

    dispose(): void {
      if (disposed) return;

      disposed = true;
      cleanup();
    },
  };
}
