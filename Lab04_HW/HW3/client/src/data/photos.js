/**
 * Gallery seed — id is used in the URL (?photoId=<id>), so it must be unique and URL-safe.
 * width/height = intrinsic image size (prevents layout shift).
 */
export const photos = Object.freeze([
  Object.freeze({
    id: 'arena-stage',
    title: 'Arena Stage',
    alt: 'Wide view of the main arena stage lit in teal before the grand final.',
    src: '/photos/arena-stage.svg',
    width: 1200,
    height: 800,
    credit: 'Placeholder artwork generated for HW3',
  }),
  Object.freeze({
    id: 'player-booth',
    title: 'Player Booth',
    alt: 'Tall soundproof player booth glowing purple between matches.',
    src: '/photos/player-booth.svg',
    width: 800,
    height: 1200,
    credit: 'Placeholder artwork generated for HW3',
  }),
  Object.freeze({
    id: 'caster-desk',
    title: 'Caster Desk',
    alt: 'Amber-lit caster desk where commentators call the match.',
    src: '/photos/caster-desk.svg',
    width: 1200,
    height: 800,
    credit: 'Placeholder artwork generated for HW3',
  }),
  Object.freeze({
    id: 'trophy-lift',
    title: 'Trophy Lift',
    alt: 'Champions raising the trophy under green stage lights.',
    src: '/photos/trophy-lift.svg',
    width: 800,
    height: 1200,
    credit: 'Placeholder artwork generated for HW3',
  }),
  Object.freeze({
    id: 'crowd-wave',
    title: 'Crowd Wave',
    alt: 'Audience doing a wave in red light across the stands.',
    src: '/photos/crowd-wave.svg',
    width: 1200,
    height: 800,
    credit: 'Placeholder artwork generated for HW3',
  }),
  Object.freeze({
    id: 'referee-review',
    title: 'Referee Review',
    alt: 'Referees reviewing a replay on monitors in a dim control room.',
    src: '/photos/referee-review.svg',
    width: 1200,
    height: 800,
    credit: 'Placeholder artwork generated for HW3',
  }),
]);

export const findPhoto = (id) => photos.find((p) => p.id === id);
