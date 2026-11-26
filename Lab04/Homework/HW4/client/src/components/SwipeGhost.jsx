export default function SwipeGhost({ profile, direction }) {
  if (!profile) return null;
  return (
    <article className={`swipe-card swipe-ghost swipe-ghost--${direction}`} aria-hidden="true" inert>
      <img src={profile.avatar} alt="" width={600} height={800} draggable={false} className="swipe-card__photo" />
      <p className="swipe-card__name">{`${profile.name}, ${profile.age}`}</p>
    </article>
  );
}
