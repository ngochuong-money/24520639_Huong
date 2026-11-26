
import { InventoryManager } from '../inventory/InventoryManager';
import { simulateConcurrentPurchases } from './ConcurrentPurchase';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function verifyStock(
  inventory: InventoryManager,
  initialStock: number
): void {
  const state = inventory.getState();

  const quantities = [
    state.availableStock,
    state.reservedStock,
    state.soldStock,
  ];

  assert(
    quantities.every(
      (value) => Number.isSafeInteger(value) && value >= 0
    ),
    'Invalid or negative stock detected'
  );

  assert(
    state.availableStock +
      state.reservedStock +
      state.soldStock === initialStock,
    'Inventory conservation invariant violated'
  );

  assert(
    Number.isSafeInteger(state.version) && state.version >= 0,
    'Invalid inventory version'
  );
}

function expectRejectedWithoutMutation(
  inventory: InventoryManager,
  action: () => unknown
): void {
  const before = inventory.getState();
  let rejected = false;

  try {
    action();
  } catch {
    rejected = true;
  }

  assert(rejected, 'Invalid operation was accepted');

  const after = inventory.getState();

  assert(
    JSON.stringify(before) === JSON.stringify(after),
    'Rejected operation modified inventory'
  );
}

export async function testStockConsistency(): Promise<void> {
  console.log('Starting stock consistency tests...');

  // Test 1: Multiple users reserve from shared inventory.
  {
    const inventory = new InventoryManager('stock-1', 5);

    const a = inventory.reserve('A', 2, 0, 30000);
    verifyStock(inventory, 5);

    const b = inventory.reserve(
      'B', 2, inventory.getState().version, 30000
    );
    verifyStock(inventory, 5);

    assert(
      inventory.getState().availableStock === 1 &&
      inventory.getState().reservedStock === 4,
      'Incorrect stock after concurrent reservations'
    );

    // Checkout and cancellation are interleaved.
    inventory.checkout(a.id, 'A');
    verifyStock(inventory, 5);

    inventory.cancelReservation(b.id, 'B');
    verifyStock(inventory, 5);

    const final = inventory.getState();

    assert(
      final.availableStock === 3 &&
      final.reservedStock === 0 &&
      final.soldStock === 2,
      'Incorrect final stock after checkout and cancel'
    );

    console.log('PASS: Interleaved reserve/checkout/cancel');
  }

  // Test 2: Stale versions cannot corrupt inventory.
  {
    const inventory = new InventoryManager('stock-2', 2);
    const version = inventory.getState().version;

    const first = inventory.reserve('A', 1, version, 30000);
    verifyStock(inventory, 2);

    expectRejectedWithoutMutation(
      inventory,
      () => inventory.reserve('B', 1, version, 30000)
    );

    verifyStock(inventory, 2);

    inventory.checkout(first.id, 'A');
    verifyStock(inventory, 2);

    console.log('PASS: Stale version preserves stock');
  }

  // Test 3: Expiry returns stock exactly once.
  {
    const inventory = new InventoryManager('stock-3', 3);

    const first = inventory.reserve('A', 2, 0, 100);

    assert(
      inventory.getState().availableStock === 1,
      'Reservation did not reduce stock'
    );

    await sleep(200);

    const afterExpiry = inventory.getState();

    assert(
      inventory.getReservation(first.id)?.status === 'expired',
      'Reservation did not expire'
    );

    assert(
      afterExpiry.availableStock === 3 &&
      afterExpiry.reservedStock === 0,
      'Expired stock not returned'
    );

    const versionAfterExpiry = afterExpiry.version;

    await sleep(100);

    assert(
      inventory.getState().version === versionAfterExpiry,
      'Expiry released stock more than once'
    );

    verifyStock(inventory, 3);

    console.log('PASS: Expiry restores stock exactly once');
  }

  // Test 4: Terminal transitions cannot modify stock again.
  {
    const inventory = new InventoryManager('stock-4', 2);

    const reservation = inventory.reserve('A', 1, 0, 30000);
    inventory.checkout(reservation.id, 'A');

    expectRejectedWithoutMutation(
      inventory,
      () => inventory.checkout(reservation.id, 'A')
    );

    expectRejectedWithoutMutation(
      inventory,
      () => inventory.cancelReservation(reservation.id, 'A')
    );

    verifyStock(inventory, 2);

    assert(
      inventory.getState().soldStock === 1,
      'Double checkout modified sold stock'
    );

    console.log('PASS: Invalid terminal transitions');
  }

  // Test 5: One hundred purchase attempts, limited stock.
  {
    const result = await simulateConcurrentPurchases({
      participants: 100,
      initialStock: 10,
      quantityPerUser: 1,
      lockDurationMs: 30000,
    });

    const state = result.finalInventory;

    assert(result.attempts.length === 100, 'Missing attempts');
    assert(result.successfulCheckouts === 10, 'Incorrect checkout count');
    assert(result.outOfStock === 90, 'Incorrect rejection count');
    assert(result.initialVersionConflicts === 99, 'Conflict count mismatch');
    assert(result.failed === 0, 'Unexpected failed attempts');

    assert(
      state.availableStock === 0 &&
      state.reservedStock === 0 &&
      state.soldStock === 10,
      'High-contention inventory mismatch'
    );

    assert(
      state.availableStock + state.reservedStock +
        state.soldStock === 10,
      'High-contention invariant violated'
    );

    console.log('PASS: 100 attempts with 10-stock limit');
  }

  // Test 6: Several repeated simulation scenarios.
  {
    const scenarios = [
      { participants: 50, initialStock: 5, quantityPerUser: 1 },
      { participants: 20, initialStock: 7, quantityPerUser: 2 },
      { participants: 30, initialStock: 0, quantityPerUser: 1 },
      { participants: 10, initialStock: 20, quantityPerUser: 1 },
    ];

    for (const scenario of scenarios) {
      const result = await simulateConcurrentPurchases({
        ...scenario,
        lockDurationMs: 30000,
      });

      const state = result.finalInventory;

      assert(
        state.availableStock >= 0 &&
        state.reservedStock >= 0 &&
        state.soldStock >= 0,
        'Negative stock in repeated simulation'
      );

      assert(
        state.availableStock +
          state.reservedStock +
          state.soldStock === scenario.initialStock,
        'Stock mismatch in repeated simulation'
      );

      assert(
        state.soldStock <= scenario.initialStock,
        'Overselling in repeated simulation'
      );

      assert(
        result.successfulCheckouts *
          scenario.quantityPerUser === state.soldStock,
        'Checkout count does not match sold stock'
      );
    }

    console.log('PASS: Multiple high-contention scenarios');
  }

  console.log('ALL STOCK CONSISTENCY TESTS PASSED');
}
