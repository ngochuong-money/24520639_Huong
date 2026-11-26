
import { InventoryManager } from '../inventory/InventoryManager';
import type { InventoryState } from '../types/inventory';

export interface SimulationConfig {
    participants: number;
    initialStock: number;
    quantityPerUser: number;
    lockDurationMs: number;
}

export type AttemptStatus =
    | 'checked_out'
    | 'version_conflict'
    | 'out_of_stock'
    | 'expired'
    | 'failed';

export interface PurchaseAttempt {
    userId: string;
    status: AttemptStatus;
    reservationId: string | null;
    message: string;
}

export interface SimulationResult {
    config: SimulationConfig;
    attempts: PurchaseAttempt[];
    successfulCheckouts: number;
    initialVersionConflicts: number;
    versionConflicts: number;
    outOfStock: number;
    expired: number;
    failed: number;
    finalInventory: InventoryState;
    durationMs: number;

}

function validateConfig(config: SimulationConfig): void {
    if (
        !Number.isSafeInteger(config.participants) ||
        config.participants <= 0 ||
        !Number.isSafeInteger(config.initialStock) ||
        config.initialStock < 0 ||
        !Number.isSafeInteger(config.quantityPerUser) ||
        config.quantityPerUser <= 0 ||
        !Number.isSafeInteger(config.lockDurationMs) ||
        config.lockDurationMs <= 0 ||
        config.lockDurationMs > 2147483647
    ) {
        throw new Error('Invalid simulation configuration');
    }
}

function classifyError(error: unknown): AttemptStatus {
    if (!(error instanceof Error)) return 'failed';

    switch (error.message) {
        case 'Inventory version conflict':
            return 'version_conflict';
        case 'Insufficient stock':
            return 'out_of_stock';
        case 'Reservation is expired':
        case 'Reservation has expired':
            return 'expired';
        default:
            return 'failed';
    }
}

export async function simulateConcurrentPurchases(
    config: SimulationConfig
): Promise<SimulationResult> {
    validateConfig(config);

    const inventory = new InventoryManager(
        'flash-sale-concurrency-product',
        config.initialStock
    );

    const startTime = performance.now();

    // Capture the same initial version for all contenders.
    // This intentionally creates optimistic-lock contention.
    const initialVersion = inventory.getState().version;
    let initialVersionConflicts = 0;

    async function attemptPurchase(
        index: number
    ): Promise<PurchaseAttempt> {
        const userId = `sim-user-${index + 1}`;
        let reservationId: string | null = null;

        try {
            // Yield to the microtask queue so requests begin as a batch.
            await Promise.resolve();

            // First attempt uses the shared version snapshot.
            // A version conflict may retry with the latest version.
            let reservation;

            try {
                reservation = inventory.reserve(
                    userId,
                    config.quantityPerUser,
                    initialVersion,
                    config.lockDurationMs
                );
            } catch (error) {
                if (
                    error instanceof Error &&
                    error.message === 'Inventory version conflict'
                ) {
                    initialVersionConflicts += 1;
                    // Retry once using the latest inventory version.
                    const latestVersion = inventory.getState().version;

                    try {
                        reservation = inventory.reserve(
                            userId,
                            config.quantityPerUser,
                            latestVersion,
                            config.lockDurationMs
                        );
                    } catch (retryError) {
                        return {
                            userId,
                            status: classifyError(retryError),
                            reservationId: null,
                            message:
                                retryError instanceof Error
                                    ? retryError.message
                                    : 'Unknown reservation error',
                        };
                    }
                } else {
                    throw error;
                }
                
            }

            reservationId = reservation.id;

            // Checkout must pass InventoryManager validation.
            const checkedOut = inventory.checkout(
                reservation.id,
                userId
            );

            return {
                userId,
                status: checkedOut.status === 'checked_out'
                    ? 'checked_out'
                    : 'failed',
                reservationId,
                message: 'Checkout completed',
            };
        } catch (error) {
            return {
                userId,
                status: classifyError(error),
                reservationId,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Unknown purchase error',
            };
        }
    }

    const attempts = await Promise.all(
        Array.from(
            { length: config.participants },
            (_, index) => attemptPurchase(index)
        )
    );

    const finalInventory = inventory.getState();

    return {
        config,
        attempts,
        successfulCheckouts: attempts.filter(
            (attempt) => attempt.status === 'checked_out'
        ).length,
        initialVersionConflicts,
        versionConflicts: attempts.filter(
            (attempt) => attempt.status === 'version_conflict'
        ).length,
        outOfStock: attempts.filter(
            (attempt) => attempt.status === 'out_of_stock'
        ).length,
        expired: attempts.filter(
            (attempt) => attempt.status === 'expired'
        ).length,
        failed: attempts.filter(
            (attempt) => attempt.status === 'failed'
        ).length,
        finalInventory,
        durationMs: performance.now() - startTime,
    };
}
