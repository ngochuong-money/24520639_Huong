
import { InventoryManager } from '../inventory/InventoryManager';
import {
  createReservationSession,
  type ReservationSnapshot,
} from './ReservationSession';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function testReservationSession(): Promise<void> {
  console.log('Starting reservation countdown tests...');

  // Test 1: Countdown starts and reservation expires.
  {
    const inventory = new InventoryManager('product-1', 3);
    const updates: ReservationSnapshot[] = [];

    const session = createReservationSession(
      inventory, 'user-A', 1, 0, 150,
      (snapshot) => updates.push(snapshot)
    );

    assert(updates.length > 0, 'Countdown did not start');
    assert(updates[0].remainingMs > 0, 'Invalid initial time');

    await sleep(250);

    assert(
      inventory.getReservation(session.reservationId)?.status === 'expired',
      'Reservation did not expire'
    );
    assert(
      inventory.getState().availableStock === 3,
      'Expired stock was not restored'
    );

    const count = updates.length;
    await sleep(150);
    assert(updates.length === count, 'Countdown continued after expiry');

    session.dispose();
    console.log('PASS: Reservation expiry and countdown cleanup');
  }

  // Test 2: Cancellation releases stock and stops countdown.
  {
    const inventory = new InventoryManager('product-2', 3);
    const updates: ReservationSnapshot[] = [];

    const session = createReservationSession(
      inventory, 'user-B', 2, 0, 1000,
      (snapshot) => updates.push(snapshot)
    );

    const result = session.cancel();

    assert(result.status === 'cancelled', 'Cancellation failed');
    assert(inventory.getState().availableStock === 3, 'Stock not returned');
    assert(
      updates.at(-1)?.reservation.status === 'cancelled',
      'Cancellation state not synchronized'
    );

    const count = updates.length;
    await sleep(150);
    assert(updates.length === count, 'Cancelled countdown continued');

    session.dispose();
    console.log('PASS: Cancellation synchronization');
  }

  // Test 3: Checkout commits stock and stops countdown.
  {
    const inventory = new InventoryManager('product-3', 3);
    const updates: ReservationSnapshot[] = [];

    const session = createReservationSession(
      inventory, 'user-C', 2, 0, 1000,
      (snapshot) => updates.push(snapshot)
    );

    const result = session.checkout();

    assert(result.status === 'checked_out', 'Checkout failed');
    assert(inventory.getState().soldStock === 2, 'Sold stock incorrect');
    assert(
      inventory.getState().reservedStock === 0,
      'Reserved stock not cleared'
    );
    assert(
      updates.at(-1)?.reservation.status === 'checked_out',
      'Checkout state not synchronized'
    );

    session.dispose();
    console.log('PASS: Checkout synchronization');
  }

  // Test 4: Checkout after expiry must fail.
  {
    const inventory = new InventoryManager('product-4', 1);
    const session = createReservationSession(
      inventory, 'user-D', 1, 0, 100,
      () => {}
    );

    await sleep(200);

    let rejected = false;
    try {
      session.checkout();
    } catch {
      rejected = true;
    }

    assert(rejected, 'Expired checkout was accepted');
    assert(inventory.getState().soldStock === 0, 'Invalid stock commit');
    assert(inventory.getState().availableStock === 1, 'Stock not released');

    session.dispose();
    console.log('PASS: Checkout after expiry rejected');
  }

  // Test 5: Repeated reservation cycles.
  {
    const inventory = new InventoryManager('product-5', 2);

    for (let index = 0; index < 3; index++) {
      const session = createReservationSession(
        inventory,
        'user-E',
        1,
        inventory.getState().version,
        1000,
        () => {}
      );

      session.cancel();
      session.dispose();

      assert(
        inventory.getState().availableStock === 2,
        'Stock corrupted by repeated cancellation'
      );
    }

    console.log('PASS: Repeated reserve/cancel cycles');
  }

  console.log('ALL RESERVATION SESSION TESTS PASSED');
}
