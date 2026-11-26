export default function PeopleEmptyState() {
  return (
    <section className="detail-pane empty-profile" aria-labelledby="empty-profile-heading">
      <span className="empty-profile-icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.7">
          <circle cx="24" cy="18" r="7" />
          <path d="M11 39v-3a13 13 0 0 1 26 0v3M7 12h5M9.5 9.5v5M37 22h5M39.5 19.5v5" strokeLinecap="round" />
        </svg>
      </span>
      <p className="eyebrow">A PLACE FOR EVERY PROFILE</p>
      <h2 id="empty-profile-heading">Get to know someone.</h2>
      <p>Select a person to view their details.</p>
      <span className="empty-profile-hint">Choose a name from the directory</span>
    </section>
  );
}
