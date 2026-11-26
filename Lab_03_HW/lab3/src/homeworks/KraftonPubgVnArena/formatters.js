import { DROP_KIND } from './contract.js';
const SECOND_MS = 1_000;

const splitDuration = (ms) => {
  const totalSeconds = Math.ceil(Math.max(0, ms) / SECOND_MS);
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
};

const pad = (value) => String(value).padStart(2, '0');

/** "09:58" or "1:05:09" for display. */
export function formatCountdown(ms) {
  const { hours, minutes, seconds } = splitDuration(ms);
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

/** Valid HTML duration for <time dateTime>, e.g. "PT0H9M58S". */
export function toIsoDuration(ms) {
  const { hours, minutes, seconds } = splitDuration(ms);
  return `PT${hours}H${minutes}M${seconds}S`;
}
const vndFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const countFormatter = new Intl.NumberFormat('vi-VN');

/** "1.500.000 ₫" */
export const formatVnd = (amount) => vndFormatter.format(amount);

/** "5.000" */
export const formatCount = (value) => countFormatter.format(value);
/** Unique display title, e.g. "G-Coin Contraband Crate (5.000 G-Coin)". */
export const formatDropTitle = (drop) =>
  drop.kind === DROP_KIND.G_COIN_CRATE
    ? `${drop.title} (${formatCount(drop.gCoinAmount)} G-Coin)`
    : drop.title;
const clockFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

/** "23:01:05" */
export const formatClock = (epochMs) => clockFormatter.format(epochMs);