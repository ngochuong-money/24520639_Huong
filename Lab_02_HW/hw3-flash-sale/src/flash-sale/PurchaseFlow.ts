
import { InventoryManager } from '../inventory/InventoryManager';
import {
  createReservationSession,
  type ReservationSession,
  type ReservationSnapshot,
} from './ReservationSession';
import type { InventoryReservation } from '../types/inventory';

export interface PurchaseFlow {
  reserve(
    quantity: number,
    lockDurationMs: number
  ): InventoryReservation;

  cancel(): InventoryReservation;
  checkout(): InventoryReservation;
  getSnapshot(): ReservationSnapshot | null;
  dispose(): void;
}

export function createPurchaseFlow(
  inventory: InventoryManager,
  userId: string,
  onUpdate: (snapshot: ReservationSnapshot) => void
): PurchaseFlow {
  if (!userId.trim()) {
    throw new Error('User ID is required');
  }

  let session: ReservationSession | null = null;
  let disposed = false;

  function ensureActive(): ReservationSession {
    if (disposed) {
      throw new Error('Purchase flow is disposed');
    }

    if (!session) {
      throw new Error('No active reservation');
    }

    return session;
  }

  function getSnapshot(): ReservationSnapshot | null {
    if (!session) return null;

    const reservation = inventory.getReservation(
      session.reservationId
    );

    if (!reservation) return null;

    return {
      reservation,
      remainingMs:
        reservation.status === 'reserved'
          ? Math.max(0, reservation.expiresAt - Date.now())
          : 0,
    };
  }

  return {
    reserve(quantity, lockDurationMs) {
      if (disposed) {
        throw new Error('Purchase flow is disposed');
      }

      const previous = getSnapshot();

      if (previous?.reservation.status === 'reserved') {
        throw new Error('An active reservation already exists');
      }

      // Previous session has already reached a terminal state.
      session?.dispose();

      // Read the current version for optimistic reservation.
      const expectedVersion = inventory.getState().version;

      session = createReservationSession(
        inventory,
        userId,
        quantity,
        expectedVersion,
        lockDurationMs,
        onUpdate
      );

      const snapshot = getSnapshot();

      if (!snapshot) {
        throw new Error('Reservation could not be retrieved');
      }

      return snapshot.reservation;
    },

    cancel() {
      return ensureActive().cancel();
    },

    checkout() {
      return ensureActive().checkout();
    },

    getSnapshot,

    dispose() {
      if (disposed) return;

      disposed = true;
      session?.dispose();
      session = null;
    },
  };
}
