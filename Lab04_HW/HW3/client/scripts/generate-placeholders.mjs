// Generates simple original SVG placeholders into public/photos/ (no third-party assets).
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT_DIR = new URL('../public/photos/', import.meta.url);

const items = [
  { file: 'arena-stage.svg', w: 1200, h: 800, from: '#0e7490', to: '#0f172a', label: 'Arena Stage' },
  { file: 'player-booth.svg', w: 800, h: 1200, from: '#7c3aed', to: '#1e1b4b', label: 'Player Booth' },
  { file: 'caster-desk.svg', w: 1200, h: 800, from: '#b45309', to: '#1c1917', label: 'Caster Desk' },
  { file: 'trophy-lift.svg', w: 800, h: 1200, from: '#15803d', to: '#052e16', label: 'Trophy Lift' },
  { file: 'crowd-wave.svg', w: 1200, h: 800, from: '#be123c', to: '#1f0a12', label: 'Crowd Wave' },
  { file: 'referee-review.svg', w: 1200, h: 800, from: '#334155', to: '#020617', label: 'Referee Review' },
];

const svg = ({ w, h, from, to, label }) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <circle cx="${w * 0.75}" cy="${h * 0.3}" r="${Math.min(w, h) * 0.18}" fill="#ffffff" fill-opacity="0.12"/>
  <text x="50%" y="50%" fill="#ffffff" font-family="system-ui, sans-serif" font-size="${Math.round(Math.min(w, h) / 10)}" font-weight="700" text-anchor="middle" dominant-baseline="middle">${label}</text>
</svg>
`;

mkdirSync(OUT_DIR, { recursive: true });
items.forEach((item) => writeFileSync(new URL(item.file, OUT_DIR), svg(item)));
console.log(`Generated ${items.length} placeholders in public/photos/`);
