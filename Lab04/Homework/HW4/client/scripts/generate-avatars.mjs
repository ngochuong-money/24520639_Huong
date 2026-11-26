// Generates original initial-avatar SVGs into public/avatars/ (no third-party assets).
import { mkdirSync, writeFileSync } from 'node:fs';
import { profiles } from '../../server/seed/profiles.data.js';

const OUT_DIR = new URL('../public/avatars/', import.meta.url);
const COLORS = {
  teal: '#0e7490', purple: '#7c3aed', amber: '#b45309', green: '#15803d',
  rose: '#be123c', slate: '#334155', sky: '#0369a1', indigo: '#4338ca',
};

const svg = ({ name, color }) => `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <rect width="600" height="800" fill="${COLORS[color] ?? '#334155'}"/>
  <circle cx="300" cy="330" r="170" fill="#ffffff" fill-opacity="0.15"/>
  <text x="300" y="330" fill="#ffffff" font-family="system-ui, sans-serif" font-size="180" font-weight="700" text-anchor="middle" dominant-baseline="middle">${name.slice(0, 2).toUpperCase()}</text>
</svg>
`;

mkdirSync(OUT_DIR, { recursive: true });
profiles.forEach((p) => writeFileSync(new URL(`${p.id}.svg`, OUT_DIR), svg(p)));
console.log(`Generated ${profiles.length} avatars in public/avatars/`);
