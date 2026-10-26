
import { InventoryManager } from './InventoryManager';

function assert(condition: boolean, message: string): void {
    if (!condition) throw new Error(message);
}

function expectError(
    action: () => unknown,
    expectedMessage: string
): void {
    let actualMessage = '';

    try {
        action();
    } catch (error) {
        if (error instanceof Error) {
            actualMessage = error.message;
        }
    }

    assert(
        actualMessage === expectedMessage,
        `Expected "${expectedMessage}", got "${actualMessage}"`
    );
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function checkStock(
    inventory: InventoryManager,
    initialStock: number
): void {
    const state = inventory.getState();

    assert(
        state.availableStock >= 0 &&
        state.reservedStock >= 0 &&
        state.soldStock >= 0,
        'Negative inventory detected'
    );

    assert(
        state.availableStock +
        state.reservedStock +
        state.soldStock === initialStock,
        'Inventory total is inconsistent'
    );
}

export async function testInventoryTransitions(): Promise<void> {
    console.log('Starting inventory tests...');

    const inventory = new InventoryManager('product-001', 5);

    // Test 1: Initial state
    const initial = inventory.getState();

    assert(initial.availableStock === 5, 'Incorrect initial stock');
    assert(initial.version === 0, 'Incorrect initial version');
    checkStock(inventory, 5);

    console.log('PASS: Initial state');

    // Test 2: Successful reservation
    const first = inventory.reserve('user-A', 2, 0, 1000);

    assert(first.status === 'reserved', 'Reservation failed');
    assert(inventory.getState().availableStock === 3, 'Stock not reduced');
    assert(inventory.getState().reservedStock === 2, 'Reserved stock incorrect');
    assert(inventory.getState().version === 1, 'Version not updated');

    checkStock(inventory, 5);
    console.log('PASS: Successful reservation');

    // Test 3: Optimistic version conflict
    expectError(
        () => inventory.reserve('user-B', 1, 0, 1000),
        'Inventory version conflict'
    );

    assert(inventory.getState().version === 1, 'Conflict changed version');
    checkStock(inventory, 5);

    console.log('PASS: Version conflict');

    // Test 4: Insufficient stock
    expectError(
        () => inventory.reserve('user-B', 4, 1, 1000),
        'Insufficient stock'
    );

    checkStock(inventory, 5);
    console.log('PASS: Insufficient stock');

    // Test 5: Invalid input
    expectError(
        () => inventory.reserve('user-B', 0, 1, 1000),
        'Quantity must be a positive integer'
    );

    expectError(
        () => inventory.reserve('user-B', -1, 1, 1000),
        'Quantity must be a positive integer'
    );

    expectError(
        () => inventory.reserve('user-B', 1, 1, 0),
        'Invalid lock duration'
    );

    expectError(
        () => inventory.reserve('', 1, 1, 1000),
        'User ID is required'
    );

    checkStock(inventory, 5);
    console.log('PASS: Invalid input rejected');

    // Test 6: Reservation ownership
    expectError(
        () => inventory.cancelReservation(first.id, 'user-B'),
        'Reservation does not belong to this user'
    );

    expectError(
        () => inventory.checkout(first.id, 'user-B'),
        'Reservation does not belong to this user'
    );

    console.log('PASS: Ownership validation');

    // Test 7: Cancellation
    const cancelled = inventory.cancelReservation(first.id, 'user-A');

    assert(cancelled.status === 'cancelled', 'Cancellation failed');
    assert(inventory.getState().availableStock === 5, 'Stock not restored');
    assert(inventory.getState().reservedStock === 0, 'Reserved stock not released');

    checkStock(inventory, 5);
    console.log('PASS: Cancellation');

    // Test 8: Invalid transitions after cancellation
    expectError(
        () => inventory.cancelReservation(first.id, 'user-A'),
        'Reservation is cancelled'
    );

    expectError(
        () => inventory.checkout(first.id, 'user-A'),
        'Reservation is cancelled'
    );

    checkStock(inventory, 5);
    console.log('PASS: Invalid cancelled transitions');

    // Test 9: Checkout
    const second = inventory.reserve(
        'user-C',
        3,
        inventory.getState().version,
        1000
    );

    const checkedOut = inventory.checkout(second.id, 'user-C');

    assert(checkedOut.status === 'checked_out', 'Checkout failed');
    assert(inventory.getState().soldStock === 3, 'Sold stock incorrect');
    assert(inventory.getState().reservedStock === 0, 'Reserved stock incorrect');
    assert(inventory.getState().availableStock === 2, 'Available stock incorrect');

    checkStock(inventory, 5);
    console.log('PASS: Checkout');

    // Test 10: Double checkout and release
    expectError(
        () => inventory.checkout(second.id, 'user-C'),
        'Reservation is checked_out'
    );

    expectError(
        () => inventory.cancelReservation(second.id, 'user-C'),
        'Reservation is checked_out'
    );

    checkStock(inventory, 5);
    console.log('PASS: Double checkout prevented');

    // Test 11: Automatic lock expiry
    const third = inventory.reserve(
        'user-D',
        1,
        inventory.getState().version,
        100
    );

    await sleep(200);

    assert(
        inventory.getReservation(third.id)?.status === 'expired',
        'Lock did not expire'
    );

    assert(inventory.getState().availableStock === 2, 'Expired stock not restored');
    assert(inventory.getState().reservedStock === 0, 'Expired lock retained stock');

    expectError(
        () => inventory.checkout(third.id, 'user-D'),
        'Reservation is expired'
    );

    checkStock(inventory, 5);
    console.log('PASS: Lock expiry');

    // Test 12: No duplicate release after timer completion
    const versionAfterExpiry = inventory.getState().version;

    await sleep(150);

    assert(
        inventory.getState().version === versionAfterExpiry,
        'Expired reservation changed stock more than once'
    );

    checkStock(inventory, 5);
    console.log('PASS: No duplicate expiry');

    // Test 13: Unknown reservation
    expectError(
        () => inventory.checkout('unknown-id', 'user-A'),
        'Reservation not found'
    );

    console.log('PASS: Unknown reservation rejected');

    // Test 14: Defensive copies
    const stateCopy = inventory.getState();
    stateCopy.availableStock = 999;

    assert(
        inventory.getState().availableStock === 2,
        'External mutation changed internal state'
    );


    const reservationCopy = inventory.getReservation(second.id);

    if (reservationCopy === null) {
        throw new Error('Reservation missing');
    }

    reservationCopy.status = 'cancelled';

    assert(
        inventory.getReservation(second.id)?.status === 'checked_out',
        'External mutation changed reservation'
    );


    assert(
        inventory.getReservation(second.id)?.status === 'checked_out',
        'External mutation changed reservation'
    );

    console.log('PASS: Defensive copies');

    console.log('ALL INVENTORY TESTS PASSED');
}
