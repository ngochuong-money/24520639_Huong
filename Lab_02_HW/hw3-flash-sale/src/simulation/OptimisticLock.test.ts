
import { InventoryManager } from '../inventory/InventoryManager';
import { simulateConcurrentPurchases } from './ConcurrentPurchase';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
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

export async function testOptimisticLock(): Promise<void> {
  console.log('Starting optimistic lock contention tests...');

  // Test 1: Two users read the same version.
  const inventory = new InventoryManager('product-1', 2);
  const sharedVersion = inventory.getState().version;

  const first = inventory.reserve(
    'user-A', 1, sharedVersion, 30000
  );

  assert(
    inventory.getState().version === sharedVersion + 1,
    'Reserve did not increment version'
  );

  console.log('PASS: First reservation updates version');

  // Test 2: The stale version must be rejected.
  const beforeConflict = inventory.getState();

  expectError(
    () => inventory.reserve('user-B', 1, sharedVersion, 30000),
    'Inventory version conflict'
  );

  const afterConflict = inventory.getState();

  assert(
    JSON.stringify(beforeConflict) ===
      JSON.stringify(afterConflict),
    'Version conflict modified inventory'
  );

  console.log('PASS: Stale version rejected without mutation');

  // Test 3: Retry with the latest version.
  const latestVersion = inventory.getState().version;

  const second = inventory.reserve(
    'user-B', 1, latestVersion, 30000
  );

  assert(
    inventory.getState().availableStock === 0 &&
    inventory.getState().reservedStock === 2,
    'Retry reservation failed'
  );

  checkInventory(inventory, 2);
  console.log('PASS: Retry succeeds with latest version');

  // Test 4: A retry cannot oversell.
  const soldOutVersion = inventory.getState().version;

  expectError(
    () => inventory.reserve('user-C', 1, soldOutVersion, 30000),
    'Insufficient stock'
  );

  checkInventory(inventory, 2);
  console.log('PASS: Insufficient stock blocks retry');

  // Test 5: Checkout and cancel increment version.
  const beforeCheckout = inventory.getState().version;

  inventory.checkout(first.id, 'user-A');

  assert(
    inventory.getState().version === beforeCheckout + 1,
    'Checkout version incorrect'
  );

  const beforeCancel = inventory.getState().version;

  inventory.cancelReservation(second.id, 'user-B');

  assert(
    inventory.getState().version === beforeCancel + 1,
    'Cancel version incorrect'
  );

  const final = inventory.getState();

  assert(
    final.availableStock === 1 &&
    final.reservedStock === 0 &&
    final.soldStock === 1,
    'Incorrect final inventory'
  );

  checkInventory(inventory, 2);
  console.log('PASS: Checkout and cancel version increments');

  // Test 6: High contention simulation.
  const simulation = await simulateConcurrentPurchases({
    participants: 100,
    initialStock: 10,
    quantityPerUser: 1,
    lockDurationMs: 30000,
  });

  console.table({
    participants: simulation.config.participants,
    initialVersionConflicts:
      simulation.initialVersionConflicts,
    unresolvedVersionConflicts:
      simulation.versionConflicts,
    successfulCheckouts: simulation.successfulCheckouts,
    outOfStock: simulation.outOfStock,
    failed: simulation.failed,
    availableStock: simulation.finalInventory.availableStock,
    reservedStock: simulation.finalInventory.reservedStock,
    soldStock: simulation.finalInventory.soldStock,
  });

  assert(
    simulation.initialVersionConflicts === 99,
    'Incorrect initial conflict count'
  );

  assert(
    simulation.versionConflicts === 0,
    'Unexpected unresolved version conflicts'
  );

  assert(
    simulation.successfulCheckouts === 10,
    'Expected exactly 10 checkouts'
  );

  assert(
    simulation.outOfStock === 90,
    'Expected 90 out-of-stock attempts'
  );

  assert(
    simulation.finalInventory.availableStock === 0 &&
    simulation.finalInventory.reservedStock === 0 &&
    simulation.finalInventory.soldStock === 10,
    'High contention inventory incorrect'
  );

  console.log('PASS: High contention conflict handling');

  // Test 7: More buyers than stock, quantity > 1.
  const bulkSimulation = await simulateConcurrentPurchases({
    participants: 20,
    initialStock: 5,
    quantityPerUser: 2,
    lockDurationMs: 30000,
  });

  assert(
    bulkSimulation.successfulCheckouts === 2,
    'Expected 2 successful bulk checkouts'
  );

  assert(
    bulkSimulation.finalInventory.soldStock === 4 &&
    bulkSimulation.finalInventory.availableStock === 1 &&
    bulkSimulation.finalInventory.reservedStock === 0,
    'Bulk inventory incorrect'
  );

  assert(
    bulkSimulation.finalInventory.availableStock +
      bulkSimulation.finalInventory.reservedStock +
      bulkSimulation.finalInventory.soldStock === 5,
    'Bulk inventory invariant violated'
  );

  console.log('PASS: Bulk purchase prevents overselling');

  console.log('ALL OPTIMISTIC LOCK TESTS PASSED');
}
