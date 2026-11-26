
import { createCountdown } from './countdown';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export async function testCountdown(): Promise<void> {
  console.log('Starting countdown tests...');

  // Test 1: Countdown accuracy and completion
  {
    const duration = 500;
    const startedAt = Date.now();
    const ticks: number[] = [];
    let completionCount = 0;

    createCountdown(
      duration,
      (remaining) => ticks.push(remaining),
      () => completionCount++
    );

    await sleep(800);

    const elapsed = Date.now() - startedAt;

    assert(ticks.length > 0, 'No ticks received');
    assert(ticks[0] <= duration, 'Invalid initial tick');
    assert(ticks.at(-1) === 0, 'Timer did not reach zero');
    assert(ticks.every((value) => value >= 0), 'Negative time');

    assert(
      ticks.every((value, i) => i === 0 || value <= ticks[i - 1]),
      'Remaining time increased'
    );

    assert(completionCount === 1, 'Completion called incorrectly');

    console.log('PASS: Accuracy and completion', {
      elapsed,
      ticks: ticks.length,
    });
  }

  // Test 2: Early cancellation
  {
    let tickCount = 0;
    let completionCount = 0;

    const cleanup = createCountdown(
      1000,
      () => tickCount++,
      () => completionCount++
    );

    await sleep(150);
    cleanup();

    const countAfterCleanup = tickCount;

    await sleep(300);

    assert(
      tickCount === countAfterCleanup,
      'Ticks continued after cleanup'
    );

    assert(
      completionCount === 0,
      'Cancelled timer triggered completion'
    );

    console.log('PASS: Early cancellation');
  }

  // Test 3: Cleanup can be called repeatedly
  {
    const cleanup = createCountdown(1000, () => {});

    cleanup();
    cleanup();

    console.log('PASS: Repeated cleanup');
  }

  // Test 4: Zero-duration countdown
  {
    let lastRemaining = -1;
    let completionCount = 0;

    createCountdown(
      0,
      (remaining) => {
        lastRemaining = remaining;
      },
      () => completionCount++
    );

    assert(lastRemaining === 0, 'Zero-duration timer failed');
    assert(completionCount === 1, 'Zero-duration completion failed');

    console.log('PASS: Zero duration');
  }

  // Test 5: Invalid duration
  {
    let rejected = false;

    try {
      createCountdown(-100, () => {});
    } catch (error) {
      rejected = error instanceof RangeError;
    }

    assert(rejected, 'Negative duration was accepted');

    console.log('PASS: Invalid duration');
  }

  // Test 6: Anti-drift under delayed callbacks
  {
    const duration = 200;
    const startedAt = Date.now();
    let lastRemaining = -1;

    createCountdown(duration, (remaining) => {
      lastRemaining = remaining;
    });

    // Simulate a temporarily blocked main thread.
    const blockUntil = performance.now() + 300;

    while (performance.now() < blockUntil) {
      // Intentional blocking for this test only.
    }

    await sleep(100);

    assert(
      lastRemaining === 0,
      'Countdown accumulated drift after delay'
    );

    assert(
      Date.now() - startedAt >= duration,
      'Countdown finished too early'
    );

    console.log('PASS: Anti-drift after delayed callback');
  }

  console.log('ALL COUNTDOWN TESTS PASSED');
}
