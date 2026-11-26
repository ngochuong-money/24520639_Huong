import { useEffect, useEffectEvent } from 'react';

const NON_TEXT_INPUT_TYPES = new Set([
  'button', 'checkbox', 'color', 'file', 'image', 'radio', 'range', 'reset', 'submit',
]);

/** True when the user is entering text, where letter keys must not trigger notes. */
function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLInputElement) return !NON_TEXT_INPUT_TYPES.has(target.type);
  return target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
}

function hasShortcutModifier(event) {
  return event.ctrlKey || event.metaKey || event.altKey;
}

/** Physical key (`KeyboardEvent.code`) → MIDI: one octave C4–C5 laid out like piano keys. */
export const KEY_CODE_TO_MIDI = new Map([
  ['KeyA', 60], ['KeyW', 61], ['KeyS', 62], ['KeyE', 63], ['KeyD', 64],
  ['KeyF', 65], ['KeyT', 66], ['KeyG', 67], ['KeyY', 68], ['KeyH', 69],
  ['KeyU', 70], ['KeyJ', 71], ['KeyK', 72],
]);

/**
 * Global piano shortcuts by physical key, IME/layout independent.
 * @param {{ onNoteOn: (midi: number) => void, onNoteOff: (midi: number) => void, isEnabled?: boolean }} options
 */
export function usePianoKeyboard({ onNoteOn, onNoteOff, isEnabled = true }) {
  // Always call the latest callbacks without re-attaching listeners on every render.
  const handleNoteOn = useEffectEvent(onNoteOn);
  const handleNoteOff = useEffectEvent(onNoteOff);

  useEffect(() => {
    if (!isEnabled) return undefined;

    const heldCodes = new Set();

    const releaseAll = () => {
      for (const code of heldCodes) {
        handleNoteOff(KEY_CODE_TO_MIDI.get(code));
      }
      heldCodes.clear();
    };

    const onKeyDown = (event) => {
      if (event.repeat) return;
      if (hasShortcutModifier(event) || isTypingTarget(event.target)) return;

      const midi = KEY_CODE_TO_MIDI.get(event.code);
      if (midi === undefined || heldCodes.has(event.code)) return;

      event.preventDefault();
      heldCodes.add(event.code);
      handleNoteOn(midi);
    };

    const onKeyUp = (event) => {
      // Only release keys this hook pressed.
      if (!heldCodes.delete(event.code)) return;
      handleNoteOff(KEY_CODE_TO_MIDI.get(event.code));
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', releaseAll);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', releaseAll);
      releaseAll();
    };
  }, [isEnabled]);
}