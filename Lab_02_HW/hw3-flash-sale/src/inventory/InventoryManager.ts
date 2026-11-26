
import type {
    InventoryState,
    InventoryReservation,
} from '../types/inventory';

export class InventoryManager {
    private state: InventoryState;
    private reservations = new Map<string, InventoryReservation>();
    private expiryTimers = new Map<string, ReturnType<typeof setTimeout>>();

    constructor(productId: string, initialStock: number) {
        if (
            !productId.trim() ||
            !Number.isSafeInteger(initialStock) ||
            initialStock < 0
        ) {
            throw new Error('Invalid inventory configuration');
        }

        this.state = {
            productId,
            availableStock: initialStock,
            reservedStock: 0,
            soldStock: 0,
            version: 0,
        };
    }

    getState(): InventoryState {
        this.expireDueReservations();
        return { ...this.state };
    }

    getReservation(id: string): InventoryReservation | null {
        this.expireDueReservations();
        const reservation = this.reservations.get(id);
        return reservation ? { ...reservation } : null;
    }

    reserve(
        userId: string,
        quantity: number,
        expectedVersion: number,
        lockDurationMs: number
    ): InventoryReservation {
        if (!userId.trim()) {
            throw new Error('User ID is required');
        }

        if (!Number.isSafeInteger(quantity) || quantity <= 0) {
            throw new Error('Quantity must be a positive integer');
        }

        if (
            !Number.isSafeInteger(expectedVersion) ||
            expectedVersion < 0
        ) {
            throw new Error('Invalid inventory version');
        }

        // Limit to the reliable browser setTimeout range.
        if (
            !Number.isSafeInteger(lockDurationMs) ||
            lockDurationMs <= 0 ||
            lockDurationMs > 2147483647
        ) {
            throw new Error('Invalid lock duration');
        }

        // Expired reservations must release stock first.
        this.expireDueReservations();

        if (expectedVersion !== this.state.version) {
            throw new Error('Inventory version conflict');
        }

        if (quantity > this.state.availableStock) {
            throw new Error('Insufficient stock');
        }

        const createdAt = Date.now();

        const reservation: InventoryReservation = {
            id: crypto.randomUUID(),
            productId: this.state.productId,
            userId,
            quantity,
            status: 'reserved',
            createdAt,
            expiresAt: createdAt + lockDurationMs,
        };

        this.state.availableStock -= quantity;
        this.state.reservedStock += quantity;
        this.state.version += 1;

        this.reservations.set(reservation.id, reservation);

        // Automatically expire at the actual deadline.
        const scheduleExpiry = (): void => {
            const remaining = reservation.expiresAt - Date.now();

            if (remaining <= 0) {
                this.expireReservation(reservation.id);
                return;
            }

            const timer = setTimeout(scheduleExpiry, remaining);
            this.expiryTimers.set(reservation.id, timer);
        };

        scheduleExpiry();

        return { ...reservation };
    }

    // Return inventory when a reservation expires.
    private expireReservation(id: string): void {
        const reservation = this.reservations.get(id);

        if (
            !reservation ||
            reservation.status !== 'reserved' ||
            Date.now() < reservation.expiresAt
        ) {
            return;
        }

        reservation.status = 'expired';
        this.releaseStock(reservation);
    }

    // Correct expiration even if browser timers were delayed.
    private expireDueReservations(): void {
        for (const reservation of this.reservations.values()) {
            if (
                reservation.status === 'reserved' &&
                Date.now() >= reservation.expiresAt
            ) {
                this.expireReservation(reservation.id);
            }
        }
    }

    // Shared stock release for expiration and cancellation.
    private releaseStock(reservation: InventoryReservation): void {
        this.clearExpiryTimer(reservation.id);

        this.state.availableStock += reservation.quantity;
        this.state.reservedStock -= reservation.quantity;
        this.state.version += 1;
    }

    private clearExpiryTimer(id: string): void {
        const timer = this.expiryTimers.get(id);

        if (timer !== undefined) {
            clearTimeout(timer);
            this.expiryTimers.delete(id);
        }
    }

    // Cancel a reservation owned by the requesting user.
    cancelReservation(
        id: string,
        userId: string
    ): InventoryReservation {
        this.expireDueReservations();

        const reservation = this.requireActiveReservation(id, userId);

        reservation.status = 'cancelled';
        this.releaseStock(reservation);

        return { ...reservation };
    }

    // Finalize a reservation before its lock expires.
    checkout(
        id: string,
        userId: string
    ): InventoryReservation {
        this.expireDueReservations();

        const reservation = this.requireActiveReservation(id, userId);

        reservation.status = 'checked_out';
        this.clearExpiryTimer(id);

        this.state.reservedStock -= reservation.quantity;
        this.state.soldStock += reservation.quantity;
        this.state.version += 1;

        return { ...reservation };
    }

    private requireActiveReservation(
        id: string,
        userId: string
    ): InventoryReservation {
        const reservation = this.reservations.get(id);

        if (!reservation) {
            throw new Error('Reservation not found');
        }

        if (reservation.userId !== userId) {
            throw new Error('Reservation does not belong to this user');
        }

        if (reservation.status !== 'reserved') {
            throw new Error(`Reservation is ${reservation.status}`);
        }

        if (Date.now() >= reservation.expiresAt) {
            this.expireReservation(id);
            throw new Error('Reservation has expired');
        }

        return reservation;
    }
}
