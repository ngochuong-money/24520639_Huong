import { Link, NavLink, Outlet } from 'react-router';
import { people } from './data/people.js';
import './PeopleLayout.css';

export default function PeopleLayout() {
  return (
    <main className="people-page">
      <Link to="/">Home</Link>
      {' · '}
      <NavLink to="/form" className={({ isActive }) => isActive ? 'active' : undefined}>
        Form
      </NavLink>
      <h1>People</h1>
      <section className="people-layout" aria-label="People directory">
        <nav aria-label="People directory">
          <ul className="people-list">
            {people.map((person) => (
              <li key={person.id}>
                <NavLink
                  to={person.id}
                  className={({ isActive }) => isActive ? 'active' : undefined}
                >
                  {person.name}
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
