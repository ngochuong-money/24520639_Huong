
import { InventoryManager } from '../inventory/InventoryManager';
import { createPurchaseFlow } from './PurchaseFlow';
import type { ReservationSnapshot } from './ReservationSession';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function expectError(action: () => unknown): void {
  let rejected = false;

  try {
    action();
  } catch {
    rejected = true;
  }

  assert(rejected, 'Invalid transition was accepted');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function checkInventory(
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
    'Inventory total mismatch'
  );
}

export async function testFlashSaleFlow(): Promise<void> {
  console.log('Starting flash-sale E2E tests...');

  const inventory = new InventoryManager('flash-product', 5);
  const updates: ReservationSnapshot[] = [];

  const flow = createPurchaseFlow(
    inventory,
    'user-A',
    (snapshot) => updates.push(snapshot)
  );

  // Test 1: Reserve and start countdown
  const first = flow.reserve(2, 1000);

  assert(first.status === 'reserved', 'Reserve failed');
  assert(updates.length > 0, 'Countdown did not start');
  assert(
    updates[0].remainingMs > 0 &&
    updates[0].remainingMs <= 1000,
    'Invalid countdown value'
  );
  assert(
    inventory.getState().availableStock === 3 &&
    inventory.getState().reservedStock === 2,
    'Reservation stock incorrect'
  );

  checkInventory(inventory, 5);
  console.log('PASS: Reserve and countdown');

  // Test 2: Reject duplicate reservation
  expectError(() => flow.reserve(1, 1000));
  checkInventory(inventory, 5);

  console.log('PASS: Duplicate reservation blocked');

  // Test 3: Cancel and stop countdown
  const cancelled = flow.cancel();

  assert(cancelled.status === 'cancelled', 'Cancel failed');
  assert(inventory.getState().availableStock === 5, 'Stock not restored');
  assert(flow.getSnapshot()?.remainingMs === 0, 'Countdown not stopped');

  const countAfterCancel = updates.length;
  await sleep(150);

  assert(
    updates.length === countAfterCancel,
    'Countdown continued after cancellation'
  );

  expectError(() => flow.checkout());
  checkInventory(inventory, 5);

  console.log('PASS: Cancel and cleanup');

  // Test 4: Checkout before expiry
  const second = flow.reserve(3, 1000);
  const completed = flow.checkout();

  assert(second.id === completed.id, 'Wrong reservation checked out');
  assert(completed.status === 'checked_out', 'Checkout failed');
  assert(
    inventory.getState().soldStock === 3 &&
    inventory.getState().reservedStock === 0,
    'Checkout stock incorrect'
  );

  const countAfterCheckout = updates.length;
  await sleep(150);

  assert(
    updates.length === countAfterCheckout,
    'Countdown continued after checkout'
  );

  expectError(() => flow.checkout());
  checkInventory(inventory, 5);

  console.log('PASS: Checkout and double-checkout prevention');

  // Test 5: Automatic lock expiry
  const third = flow.reserve(1, 100);

  await sleep(250);

  assert(
    inventory.getReservation(third.id)?.status === 'expired',
    'Reservation did not expire'
  );

  assert(
    inventory.getState().availableStock === 2 &&
    inventory.getState().reservedStock === 0,
    'Expired stock not released'
  );

  assert(
    flow.getSnapshot()?.remainingMs === 0,
    'Expired countdown not stopped'
  );

  expectError(() => flow.checkout());
  checkInventory(inventory, 5);

  console.log('PASS: Lock expiry and checkout rejection');

  // Test 6: No countdown updates after expiry
  const countAfterExpiry = updates.length;
  await sleep(150);

  assert(
    updates.length === countAfterExpiry,
    'Countdown continued after expiry'
  );

  console.log('PASS: Expired countdown cleanup');

  // Test 7: Repeated reserve/cancel cycles
  for (let index = 0; index < 3; index++) {
    const reservation = flow.reserve(1, 1000);

    assert(reservation.status === 'reserved', 'Repeated reserve failed');

    flow.cancel();
    checkInventory(inventory, 5);
  }

  assert(
    inventory.getState().availableStock === 2 &&
    inventory.getState().reservedStock === 0 &&
    inventory.getState().soldStock === 3,
    'Incorrect inventory after repeated cycles'
  );

  console.log('PASS: Repeated reservation cycles');

  // Test 8: Dispose
  flow.dispose();

  expectError(() => flow.reserve(1, 1000));
  expectError(() => flow.cancel());
  expectError(() => flow.checkout());

  console.log('PASS: Disposed flow rejects operations');

  checkInventory(inventory, 5);
  console.log('ALL FLASH-SALE E2E TESTS PASSED');
}
