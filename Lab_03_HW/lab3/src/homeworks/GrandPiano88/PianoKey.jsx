import { memo } from 'react';

const noop = () => {};
const ACTIVATION_KEYS = new Set([' ', 'Enter']);

function PianoKey({
  midi,
  noteName,
  isBlack,
  isPressed = false,
  onNoteOn = noop,
  onNoteOff = noop,
}) {
  const handlePointerDown = (event) => {
    if (event.button !== 0) return;
    onNoteOn(midi);
  };

  const handleRelease = () => {
    if (isPressed) onNoteOff(midi);
  };

  const handleKeyDown = (event) => {
    if (!ACTIVATION_KEYS.has(event.key)) return;
    event.preventDefault();
    if (event.repeat) return;
    onNoteOn(midi);
  };

  const handleKeyUp = (event) => {
    if (!ACTIVATION_KEYS.has(event.key)) return;
    event.preventDefault();
    handleRelease();
  };

  return (
    <button
      type="button"
      className={`key ${isBlack ? 'key--black' : 'key--white'}`}
      aria-pressed={isPressed}
      onPointerDown={handlePointerDown}
      onPointerUp={handleRelease}
      onPointerLeave={handleRelease}
      onPointerCancel={handleRelease}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      <span className="key__label">{noteName}</span>
    </button>
  );
}

export default memo(PianoKey);