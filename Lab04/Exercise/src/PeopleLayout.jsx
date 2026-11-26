import { NavLink, Outlet } from 'react-router';
import { people } from './data/people.js';
import AppNav from './AppNav.jsx';
import './PeopleLayout.css';

export default function PeopleLayout() {
  return (
    <main className="page-shell people-page">
      <AppNav />
      <header className="page-heading">
        <p className="eyebrow">YOUR DIRECTORY</p>
        <h1>People<span className="heading-count">{String(people.length).padStart(2, '0')}</span></h1>
        <p>A few remarkable minds. Select a profile to get to know them.</p>
      </header>
      <section className="people-layout" aria-label="People directory">
        <nav className="directory-panel" aria-label="People directory">
          <h2 className="directory-heading">All people <span>{people.length}</span></h2>
          <ul className="people-list">
            {people.map((person) => (
              <li key={person.id}>
                <NavLink
                  to={person.id}
                  className={({ isActive }) => isActive ? 'active' : undefined}
                >
                  <span className="person-avatar" aria-hidden="true">
                    {person.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                  </span>
                  <span className="person-summary">
                    <strong>{person.name}</strong>
                    <span>{person.role}</span>
                  </span>
                  <span className="person-arrow" aria-hidden="true">›</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <Outlet />
      </section>
    </main>
  );
}
