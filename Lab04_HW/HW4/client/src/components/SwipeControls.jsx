// aria-disabled (not `disabled`) keeps focus on a button that becomes unavailable (WCAG 2.4.3).
function ControlButton({ unavailable, onPress, className, children }) {
  return (
    <button
      type="button"
      className={`control ${className}`}
      aria-disabled={unavailable || undefined}
      onClick={unavailable ? undefined : onPress}
    >
      {children}
    </button>
  );
}

// The space before each visually-hidden suffix is a separate text node: accessible-name
// computation trims leading whitespace inside child elements ("Passon Ana" otherwise — H4-F01).
const suffix = (text) => (text ? <>{' '}<span className="visually-hidden">{text}</span></> : null);

export default function SwipeControls({ profileName = '', canSwipe = false, canUndo = false, onSwipe, onUndo }) {
  return (
    <ul className="swipe-controls" aria-label="Swipe actions">
      <li>
        <ControlButton className="control--pass" unavailable={!canSwipe} onPress={() => onSwipe('left')}>
          <span aria-hidden="true">✕</span> Pass{suffix(profileName && `on ${profileName}`)}
        </ControlButton>
      </li>
      <li>
        <ControlButton className="control--super" unavailable={!canSwipe} onPress={() => onSwipe('up')}>
          <span aria-hidden="true">★</span> Super like{suffix(profileName)}
        </ControlButton>
      </li>
      <li>
        <ControlButton className="control--like" unavailable={!canSwipe} onPress={() => onSwipe('right')}>
          <span aria-hidden="true">♥</span> Like{suffix(profileName)}
        </ControlButton>
      </li>
      <li>
        <ControlButton className="control--undo" unavailable={!canUndo} onPress={onUndo}>
          <span aria-hidden="true">↶</span> Undo{suffix('last swipe')}
        </ControlButton>
      </li>
    </ul>
  );
}
