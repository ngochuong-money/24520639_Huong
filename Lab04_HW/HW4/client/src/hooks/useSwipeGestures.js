import { useRef, useState } from 'react';

const ZERO = Object.freeze({ x: 0, y: 0 });
const KEY_TO_DIRECTION = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up' };

const isEditable = (el) =>
  el?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el?.tagName);

export function useSwipeGestures({ onSwipe, onUndo, enabled = true, threshold = 80 } = {}) {
  const startRef = useRef(null); // { x, y, pointerId } — not state: no re-render on pointerdown
  const [dragOffset, setDragOffset] = useState(ZERO);
  const isDragging = dragOffset.x !== 0 || dragOffset.y !== 0;

  const resetDrag = () => {
    startRef.current = null;
    setDragOffset(ZERO); // same frozen object → React skips the re-render when already reset
  };

  const onKeyDown = (event) => {
    if (!enabled || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    if (isEditable(event.target)) return; // typing in a field must never swipe or undo

    const direction = KEY_TO_DIRECTION[event.key];
    if (direction) {
      event.preventDefault(); // no page scroll
      onSwipe(direction);
    } else if (event.key === 'Backspace') {
      event.preventDefault();
      onUndo();
    }
  };

  const onPointerDown = (event) => {
    if (!enabled || event.button !== 0 || !event.isPrimary) return;
    startRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    const start = startRef.current;
    if (!start || event.pointerId !== start.pointerId) return;
    setDragOffset({ x: event.clientX - start.x, y: event.clientY - start.y });
  };

  const onPointerUp = (event) => {
    const start = startRef.current;
    if (!start || event.pointerId !== start.pointerId) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    resetDrag();
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    if (-dy > threshold && Math.abs(dy) > Math.abs(dx)) onSwipe('up');
    else if (dx > threshold) onSwipe('right');
    else if (dx < -threshold) onSwipe('left');
    // otherwise: short drag → snap back
  };

  return {
    keyHandlers: { onKeyDown },
    pointerHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: resetDrag,
      onLostPointerCapture: resetDrag,
    },
    dragOffset,
    isDragging,
  };
}
