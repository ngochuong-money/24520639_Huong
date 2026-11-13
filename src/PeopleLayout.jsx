import { Link, NavLink, Outlet } from 'react-router';
import { people } from './data/people.js';

export default function PeopleLayout() {
  return (
    <main className="people-page">
      <Link to="/">Home</Link>
      <h1>People</h1>
      <section className="people-grid" aria-label="People directory">
        <nav aria-label="People">
          <ul>
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
