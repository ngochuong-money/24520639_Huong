import { Link, NavLink } from 'react-router';

export default function AppNav() {
  return (
    <header className="app-header">
      <Link to="/people" className="brand" aria-label="Workspace home">
        <span className="brand-mark" aria-hidden="true">h.</span>
        <span className="brand-name">Workspace<span className="brand-dot">.</span></span>
      </Link>
      <nav className="app-nav" aria-label="Main navigation">
        {['people', 'form', 'forum'].map((page) => (
          <NavLink
            key={page}
            to={`/${page}`}
            className={({ isActive }) => isActive ? 'active' : undefined}
          >
            {page[0].toUpperCase() + page.slice(1)}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
