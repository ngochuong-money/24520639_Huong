const ACTIVATION_KEYS = new Set(['Enter', ' ']);

export default function DrumPad({ pad, isActive = false, onPress, onRelease }) {
  const handlePointerDown = (event) => {
    if (event.button !== 0) return; // primary button / touch / pen only
    event.currentTarget.setPointerCapture(event.pointerId);
    onPress(pad.id);
  };

  // Fires on pointerup, pointercancel, or when capture is lost for any reason.
  const handleLostPointerCapture = () => {
    onRelease(pad.id);
  };

  const handleKeyDown = (event) => {
    if (!ACTIVATION_KEYS.has(event.key)) return;
    event.preventDefault(); // stop native click (Enter) and page scroll (Space)
    if (event.repeat) return;
    onPress(pad.id);
  };

  const handleKeyUp = (event) => {
    if (!ACTIVATION_KEYS.has(event.key)) return;
    event.preventDefault(); // stop native click on Space release
    onRelease(pad.id);
  };

  // detail === 0: activation not from pointer/keys handled above (e.g. screen reader).
  const handleClick = (event) => {
    if (event.detail !== 0) return;
    onPress(pad.id);
    onRelease(pad.id);
  };

  const handleBlur = () => {
    onRelease(pad.id);
  };

  return (
    <button className="drum-pad"
      type="button"
      aria-pressed={isActive}
      aria-keyshortcuts={pad.keyLabel}
      onPointerDown={handlePointerDown}
      onLostPointerCapture={handleLostPointerCapture}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onClick={handleClick}
      onBlur={handleBlur}
    >
      <kbd>{pad.keyLabel}</kbd> <span>{pad.name}</span>
    </button>
  );
}