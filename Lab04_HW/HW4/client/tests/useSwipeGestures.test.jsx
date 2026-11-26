import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSwipeGestures } from '../src/hooks/useSwipeGestures.js';

// Test-only harness: deck section (keys) containing a card (pointer) and an input
function Harness({ onSwipe, onUndo, enabled = true }) {
  const { keyHandlers, pointerHandlers, dragOffset } = useSwipeGestures({ onSwipe, onUndo, enabled });
  return (
    <section aria-label="deck" tabIndex={0} {...keyHandlers}>
      <article aria-label="card" data-x={dragOffset.x} data-y={dragOffset.y} {...pointerHandlers}>card</article>
      <input aria-label="Notes" />
    </section>
  );
}

const setup = (props = {}) => {
  const onSwipe = vi.fn();
  const onUndo = vi.fn();
  const user = userEvent.setup();
  render(<Harness onSwipe={onSwipe} onUndo={onUndo} {...props} />);
  return { onSwipe, onUndo, user, deck: screen.getByRole('region', { name: 'deck' }), card: screen.getByRole('article', { name: 'card' }) };
};

const drag = (card, { dx = 0, dy = 0, end = 'pointerUp' } = {}) => {
  fireEvent.pointerDown(card, { clientX: 100, clientY: 100, pointerId: 1, button: 0, isPrimary: true });
  fireEvent.pointerMove(card, { clientX: 100 + dx, clientY: 100 + dy, pointerId: 1 });
  fireEvent[end](card, { clientX: 100 + dx, clientY: 100 + dy, pointerId: 1 });
};

describe('useSwipeGestures — keyboard', () => {
  test('G1. arrows swipe and prevent page scroll', () => {
    const { onSwipe, deck } = setup();
    expect(fireEvent.keyDown(deck, { key: 'ArrowRight' })).toBe(false); // false = defaultPrevented
    fireEvent.keyDown(deck, { key: 'ArrowLeft' });
    fireEvent.keyDown(deck, { key: 'ArrowUp' });
    expect(onSwipe.mock.calls.map(([d]) => d)).toEqual(['right', 'left', 'up']);
  });

  test('G2. Backspace undoes on the deck, but not while typing in an input', async () => {
    const { onUndo, deck, user } = setup();
    expect(fireEvent.keyDown(deck, { key: 'Backspace' })).toBe(false);
    expect(onUndo).toHaveBeenCalledTimes(1);

    const notes = screen.getByLabelText('Notes');
    await user.type(notes, 'hi{Backspace}');
    expect(notes).toHaveValue('h');
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  test('G3. repeated keys and modifier combos are ignored', () => {
    const { onSwipe, onUndo, deck } = setup();
    fireEvent.keyDown(deck, { key: 'ArrowRight', repeat: true });
    fireEvent.keyDown(deck, { key: 'ArrowLeft', ctrlKey: true });
    fireEvent.keyDown(deck, { key: 'ArrowUp', altKey: true });
    fireEvent.keyDown(deck, { key: 'Backspace', metaKey: true });
    expect(onSwipe).not.toHaveBeenCalled();
    expect(onUndo).not.toHaveBeenCalled();
  });

  test('G4. disabled → keys and drags do nothing', () => {
    const { onSwipe, deck, card } = setup({ enabled: false });
    fireEvent.keyDown(deck, { key: 'ArrowRight' });
    drag(card, { dx: 150 });
    expect(onSwipe).not.toHaveBeenCalled();
  });
});

describe('useSwipeGestures — pointer', () => {
  test('G5. drag past the threshold swipes right / left / up', () => {
    const { onSwipe, card } = setup();
    drag(card, { dx: 120 });
    drag(card, { dx: -120 });
    drag(card, { dx: 10, dy: -120 });
    expect(onSwipe.mock.calls.map(([d]) => d)).toEqual(['right', 'left', 'up']);
  });

  test('G6. short drag snaps back without swiping', () => {
    const { onSwipe, card } = setup();
    drag(card, { dx: 30, dy: -20 });
    expect(onSwipe).not.toHaveBeenCalled();
    expect(card).toHaveAttribute('data-x', '0');
  });

  test('G7. dragOffset follows the pointer while dragging', () => {
    const { card } = setup();
    fireEvent.pointerDown(card, { clientX: 100, clientY: 100, pointerId: 1, button: 0, isPrimary: true });
    fireEvent.pointerMove(card, { clientX: 150, clientY: 90, pointerId: 1 });
    expect(card).toHaveAttribute('data-x', '50');
    expect(card).toHaveAttribute('data-y', '-10');
  });

  test('G8. pointercancel resets without swiping', () => {
    const { onSwipe, card } = setup();
    drag(card, { dx: 150, end: 'pointerCancel' });
    expect(onSwipe).not.toHaveBeenCalled();
    expect(card).toHaveAttribute('data-x', '0');
  });

  test('G9. non-primary button (right click) is ignored', () => {
    const { onSwipe, card } = setup();
    fireEvent.pointerDown(card, { clientX: 100, clientY: 100, pointerId: 1, button: 2, isPrimary: true });
    fireEvent.pointerMove(card, { clientX: 250, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(card, { clientX: 250, clientY: 100, pointerId: 1 });
    expect(onSwipe).not.toHaveBeenCalled();
  });
});
