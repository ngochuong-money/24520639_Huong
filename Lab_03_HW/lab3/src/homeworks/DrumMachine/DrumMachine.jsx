import { useId, useState } from 'react';
import DrumPad from './DrumPad.jsx';
import { DRUM_PADS, PAD_MAP } from './drumPads.js';
import { playVoice } from './drumSynth.js';
import { useDrumKeyboard } from './useDrumKeyboard.js';

export default function DrumMachine() {
  const headingId = useId();
  const [activePadIds, setActivePadIds] = useState([]);

  const handlePress = (padId) => {
    playVoice(padId);
    setActivePadIds((ids) => (ids.includes(padId) ? ids : [...ids, padId]));
  };

  const handleRelease = (padId) => {
    setActivePadIds((ids) => ids.filter((id) => id !== padId));
  };

  useDrumKeyboard(PAD_MAP, handlePress, handleRelease);

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId}>Production Studio Drum Kit</h2>
      <ul aria-label="Drum pads">
        {DRUM_PADS.map((pad) => (
          <li key={pad.id}>
            <DrumPad
              pad={pad}
              isActive={activePadIds.includes(pad.id)}
              onPress={handlePress}
              onRelease={handleRelease}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}