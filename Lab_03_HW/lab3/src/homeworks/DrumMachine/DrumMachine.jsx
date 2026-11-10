import { useId, useState } from 'react';
import DrumPad from './DrumPad.jsx';
import HitLog from './HitLog.jsx';
import LevelMeter from './LevelMeter.jsx';
import SessionControls from './SessionControls.jsx';
import { DRUM_PADS, PAD_BY_ID, PAD_MAP } from './drumPads.js';
import { LEVEL_MIN_DB, playVoice } from './drumSynth.js';
import { useDrumKeyboard } from './useDrumKeyboard.js';
import './DrumMachine.css';
const MAX_HITS = 8;

export default function DrumMachine() {
  const headingId = useId();
  const [activePadIds, setActivePadIds] = useState([]);
  const [hits, setHits] = useState([]);
  const [isKeyboardEnabled, setIsKeyboardEnabled] = useState(true);

  const latestHit = hits[0];

  const handlePress = (padId) => {
    const level = playVoice(padId);
    const { name, keyLabel } = PAD_BY_ID.get(padId);
    const hit = { id: crypto.randomUUID(), padId, name, keyLabel, level, time: Date.now() };

    setHits((prev) => [hit, ...prev].slice(0, MAX_HITS));
    setActivePadIds((ids) => (ids.includes(padId) ? ids : [...ids, padId]));
  };

  const handleRelease = (padId) => {
    setActivePadIds((ids) => ids.filter((id) => id !== padId));
  };

  const handleClearLog = () => {
    setHits([]);
  };

  useDrumKeyboard(PAD_MAP, handlePress, handleRelease, isKeyboardEnabled);

  return (
    <section className="drum-machine" aria-labelledby={headingId}>
      <h2 id={headingId}>Production Studio Drum Kit</h2>
      <SessionControls
        isKeyboardEnabled={isKeyboardEnabled}
        onKeyboardEnabledChange={setIsKeyboardEnabled}
        onClearLog={handleClearLog}
      />
      <ul className="drum-pads" aria-label="Drum pads">
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
      <LevelMeter level={latestHit?.level ?? LEVEL_MIN_DB} hitTime={latestHit?.time} />
      <HitLog hits={hits} latestHit={latestHit} />
    </section>
  );
}