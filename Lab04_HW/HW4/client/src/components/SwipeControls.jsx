// The space before each visually-hidden suffix is a separate text node: accessible-name
// computation trims leading whitespace inside child elements ("Passon Ana" otherwise).
export default function SwipeControls({ profileName = '', canSwipe = false, canUndo = false, onSwipe, onUndo }) {
  const suffix = (text) => (text ? <>{' '}<span className="visually-hidden">{text}</span></> : null);

  return (
    <ul className="swipe-controls" aria-label="Swipe actions">
      <li>
        <button type="button" className="control control--pass" disabled={!canSwipe} onClick={() => onSwipe('left')}>
          <span aria-hidden="true">✕</span> Pass{suffix(profileName && `on ${profileName}`)}
        </button>
      </li>
      <li>
        <button type="button" className="control control--super" disabled={!canSwipe} onClick={() => onSwipe('up')}>
          <span aria-hidden="true">★</span> Super like{suffix(profileName)}
        </button>
      </li>
      <li>
        <button type="button" className="control control--like" disabled={!canSwipe} onClick={() => onSwipe('right')}>
          <span aria-hidden="true">♥</span> Like{suffix(profileName)}
        </button>
      </li>
      <li>
        <button type="button" className="control control--undo" disabled={!canUndo} onClick={onUndo}>
          <span aria-hidden="true">↶</span> Undo{suffix('last swipe')}
        </button>
      </li>
    </ul>
  );
}
