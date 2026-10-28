
import { testInventoryTransitions } from '../inventory/InventoryManager.test';
import { testReservationSession } from '../flash-sale/ReservationSession.test';
import { testPurchaseFlow } from '../flash-sale/PurchaseFlow.test';
import { testFlashSaleFlow } from '../flash-sale/FlashSaleFlow.test';
import { testConcurrentPurchases } from '../simulation/ConcurrentPurchase.test';
import { testOptimisticLock } from '../simulation/OptimisticLock.test';
import { testStockConsistency } from '../simulation/StockConsistency.test';

export async function testAIFixRegression(): Promise<void> {
  console.log('Starting HW3 AI Fix Regression Tests...');

  // Exercise 3: Inventory and null-safe reservation handling
  await testInventoryTransitions();
  console.log('PASS: Inventory regression');

  // Exercise 4: Timer, reservation and purchase lifecycle
  await testReservationSession();
  console.log('PASS: Reservation countdown regression');

  await testPurchaseFlow();
  console.log('PASS: Purchase flow regression');

  await testFlashSaleFlow();
  console.log('PASS: End-to-end flash-sale regression');

  // Exercise 6: Concurrency and stock consistency
  await testConcurrentPurchases();
  console.log('PASS: Concurrent purchase regression');

  await testOptimisticLock();
  console.log('PASS: Optimistic locking regression');

  await testStockConsistency();
  console.log('PASS: Stock consistency regression');

  console.log('ALL HW3 AI FIX REGRESSION TESTS PASSED');
}
