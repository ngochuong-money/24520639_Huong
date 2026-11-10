import { useEffect, useId, useState } from 'react';
import { LEVEL_MAX_DB, LEVEL_MIN_DB } from './drumSynth.js';

const DECAY_MS = 800;

export default function LevelMeter({ level, hitTime, min = LEVEL_MIN_DB, max = LEVEL_MAX_DB }) {
  const meterId = useId();
  const [now, setNow] = useState(0);

  // Drive the visual decay with animation frames; stop once decay ends or on a new hit/unmount.
  useEffect(() => {
    if (hitTime === undefined) return undefined;

    let frameId = requestAnimationFrame(function tick() {
      const current = Date.now();
      setNow(current);
      if (current - hitTime < DECAY_MS) {
        frameId = requestAnimationFrame(tick);
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [hitTime]);

  const progress = hitTime === undefined ? 1 : Math.min(1, Math.max(0, (now - hitTime) / DECAY_MS));
  const displayed = Math.round((level - (level - min) * progress) * 10) / 10;

  return (
    <p>
      <label htmlFor={meterId}>Hit level</label>{' '}
      <meter id={meterId} min={min} max={max} low={-6} high={-2} optimum={min} value={displayed}>
        {displayed} dB
      </meter>{' '}
      <span>Peak: {hitTime === undefined ? 'none' : `${level} dB`}</span>
    </p>
  );
}