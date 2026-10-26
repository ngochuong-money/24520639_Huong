
import { InventoryManager } from '../inventory/InventoryManager';
import { createPurchaseFlow } from './PurchaseFlow';
import type { ReservationSnapshot } from './ReservationSession';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function expectError(action: () => unknown): void {
  let rejected = false;

  try {
    action();
  } catch {
    rejected = true;
  }

  assert(rejected, 'Expected operation to be rejected');
}

export async function testPurchaseFlow(): Promise<void> {
  console.log('Starting purchase flow tests...');

  const inventory = new InventoryManager('flash-product', 5);
  const updates: ReservationSnapshot[] = [];

  const flow = createPurchaseFlow(
    inventory,
    'user-A',
    (snapshot) => updates.push(snapshot)
  );

  // Test 1: Reserve
  const first = flow.reserve(2, 1000);

  assert(first.status === 'reserved', 'Reserve failed');
  assert(inventory.getState().availableStock === 3, 'Stock incorrect');
  assert(updates.length > 0, 'Countdown not started');

  console.log('PASS: Reserve and start countdown');

  // Test 2: Cannot reserve twice while active
  expectError(() => flow.reserve(1, 1000));

  console.log('PASS: Duplicate reservation blocked');

  // Test 3: Cancel
  const cancelled = flow.cancel();

  assert(cancelled.status === 'cancelled', 'Cancel failed');
  assert(inventory.getState().availableStock === 5, 'Stock not restored');
  assert(flow.getSnapshot()?.remainingMs === 0, 'Countdown not stopped');

  expectError(() => flow.checkout());

  console.log('PASS: Cancel and invalid checkout');

  // Test 4: Reserve again, then checkout
  const second = flow.reserve(3, 1000);
  assert(second.status === 'reserved', 'Second reserve failed');

  const checkedOut = flow.checkout();

  assert(checkedOut.status === 'checked_out', 'Checkout failed');
  assert(inventory.getState().soldStock === 3, 'Sold stock incorrect');
  assert(flow.getSnapshot()?.remainingMs === 0, 'Checkout timer not stopped');

  expectError(() => flow.checkout());

  console.log('PASS: Checkout and double-checkout prevention');

  // Test 5: Expiry
  const third = flow.reserve(1, 100);

  await sleep(200);

  assert(
    inventory.getReservation(third.id)?.status === 'expired',
    'Reservation did not expire'
  );

  assert(
    inventory.getState().availableStock === 2,
    'Expired stock not returned'
  );

  expectError(() => flow.checkout());

  console.log('PASS: Expiry and checkout rejection');

  // Test 6: Repeat reserve/cancel cycles
  for (let index = 0; index < 3; index++) {
    flow.reserve(1, 1000);
    flow.cancel();
  }

  const state = inventory.getState();

  assert(
    state.availableStock + state.reservedStock + state.soldStock === 5,
    'Inventory consistency failed'
  );

  assert(
    state.availableStock === 2 &&
    state.reservedStock === 0 &&
    state.soldStock === 3,
    'Incorrect final stock'
  );

  console.log('PASS: Repeated purchase cycles');

  // Test 7: Dispose
  flow.dispose();

  expectError(() => flow.reserve(1, 1000));
  expectError(() => flow.checkout());

  console.log('PASS: Dispose prevents new operations');
  console.log('ALL PURCHASE FLOW TESTS PASSED');
}
