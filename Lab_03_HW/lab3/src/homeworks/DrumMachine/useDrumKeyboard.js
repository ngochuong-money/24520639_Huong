import { useEffect, useEffectEvent } from 'react';

const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function isTypingTarget(target) {
  return target instanceof HTMLElement && (TYPING_TAGS.has(target.tagName) || target.isContentEditable);
}

function hasShortcutModifier(event) {
  return event.ctrlKey || event.metaKey || event.altKey;
}

/**
 * Global drum shortcuts by physical key (`KeyboardEvent.code`), IME/layout independent.
 * @param {Map<string, { id: string }>} padMap - code → pad.
 * @param {(padId: string) => void} onPress
 * @param {(padId: string) => void} onRelease
 * @param {boolean} [isEnabled=true]
 */
export function useDrumKeyboard(padMap, onPress, onRelease, isEnabled = true) {
  // Always call the latest callbacks without re-attaching listeners on every render.
  const handlePress = useEffectEvent(onPress);
  const handleRelease = useEffectEvent(onRelease);

  useEffect(() => {
    if (!isEnabled) return undefined;

    const heldCodes = new Set();

    const releaseAll = () => {
      for (const code of heldCodes) {
        handleRelease(padMap.get(code).id);
      }
      heldCodes.clear();
    };

    const onKeyDown = (event) => {
      if (event.repeat) return;
      if (hasShortcutModifier(event) || isTypingTarget(event.target)) return;

      const pad = padMap.get(event.code);
      if (!pad || heldCodes.has(event.code)) return;

      event.preventDefault();
      heldCodes.add(event.code);
      handlePress(pad.id);
    };

    const onKeyUp = (event) => {
      // Only release keys this hook pressed; works even if focus moved into an input meanwhile.
      if (!heldCodes.delete(event.code)) return;
      handleRelease(padMap.get(event.code).id);
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
  }, [padMap, isEnabled]);
}