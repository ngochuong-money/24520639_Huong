
import { simulateConcurrentPurchases } from './ConcurrentPurchase';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export async function testConcurrentPurchases(): Promise<void> {
  console.log('Starting concurrent purchase simulation...');

  // Test 1: 100 buyers competing for 10 items
  const result = await simulateConcurrentPurchases({
    participants: 100,
    initialStock: 10,
    quantityPerUser: 1,
    lockDurationMs: 30000,
  });

  console.table({
    participants: result.config.participants,
    initialStock: result.config.initialStock,
    successfulCheckouts: result.successfulCheckouts,
    versionConflicts: result.versionConflicts,
    outOfStock: result.outOfStock,
    expired: result.expired,
    failed: result.failed,
    availableStock: result.finalInventory.availableStock,
    reservedStock: result.finalInventory.reservedStock,
    soldStock: result.finalInventory.soldStock,
    durationMs: result.durationMs,
  });

  assert(result.successfulCheckouts === 10, 'Expected 10 checkouts');
  assert(result.finalInventory.soldStock === 10, 'Sold stock incorrect');
  assert(result.finalInventory.availableStock === 0, 'Available stock incorrect');
  assert(result.finalInventory.reservedStock === 0, 'Reserved stock not cleared');

  assert(
    result.attempts.length === 100,
    'Missing purchase attempts'
  );

  assert(
    result.attempts.filter(
      (attempt) => attempt.status === 'checked_out'
    ).length === result.successfulCheckouts,
    'Result count mismatch'
  );

  console.log('PASS: 100 buyers competing for 10 items');

  // Test 2: Zero inventory
  const emptyResult = await simulateConcurrentPurchases({
    participants: 20,
    initialStock: 0,
    quantityPerUser: 1,
    lockDurationMs: 1000,
  });

  assert(emptyResult.successfulCheckouts === 0, 'Overselling with zero stock');
  assert(emptyResult.finalInventory.soldStock === 0, 'Invalid sold stock');

  console.log('PASS: Zero stock prevents purchases');

  // Test 3: Inventory invariants
  for (const simulation of [result, emptyResult]) {
    const state = simulation.finalInventory;
    const initialStock = simulation.config.initialStock;

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
      'Inventory invariant violated'
    );

    assert(
      state.soldStock <= initialStock,
      'Overselling detected'
    );
  }

  console.log('PASS: Inventory invariants');

  // Test 4: Invalid configuration
  let rejected = false;

  try {
    await simulateConcurrentPurchases({
      participants: -1,
      initialStock: 10,
      quantityPerUser: 1,
      lockDurationMs: 1000,
    });
  } catch {
    rejected = true;
  }

  assert(rejected, 'Invalid configuration was accepted');

  console.log('PASS: Invalid configuration rejected');
  console.log('ALL CONCURRENT SIMULATION TESTS PASSED');
}
