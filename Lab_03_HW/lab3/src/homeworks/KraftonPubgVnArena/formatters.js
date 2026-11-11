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