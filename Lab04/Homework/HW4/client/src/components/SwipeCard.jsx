import { useId } from 'react';

const BADGE_AT = 40;

export default function SwipeCard({ profile, pointerHandlers = {}, dragOffset = { x: 0, y: 0 }, isDragging = false }) {
  const headingId = useId();
  const { x, y } = dragOffset;

  let badge = null;
  if (-y > BADGE_AT && Math.abs(y) > Math.abs(x)) badge = 'Super';
  else if (x > BADGE_AT) badge = 'Like';
  else if (x < -BADGE_AT) badge = 'Pass';

  return (
    <article
      aria-labelledby={headingId}
      className={`swipe-card${isDragging ? ' is-dragging' : ''}`}
      style={{ transform: `translate(${x}px, ${y}px) rotate(${x / 20}deg)` }}
      {...pointerHandlers}
    >
      {badge && (
        <span className={`swipe-badge swipe-badge--${badge.toLowerCase()}`} aria-hidden="true">{badge}</span>
      )}
      <img src={profile.avatar} alt={profile.avatarAlt} width={600} height={800} draggable={false} className="swipe-card__photo" />
      <h2 id={headingId} className="swipe-card__name">{`${profile.name}, ${profile.age}`}</h2>
      <p className="swipe-card__city">{profile.city}</p>
      <p>{profile.bio}</p>
      {profile.interests.length > 0 && (
        <ul className="swipe-card__interests">
          {profile.interests.map((interest) => <li key={interest}>{interest}</li>)}
        </ul>
      )}
    </article>
  );
}
