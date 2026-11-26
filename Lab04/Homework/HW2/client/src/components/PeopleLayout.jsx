import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router';
import Skeleton from './Skeleton.jsx';

export default function PeopleLayout({ players = [] }) {
  return (
    <>
      <nav aria-label="Player dossiers" className="sidebar">
        <ul>
          {players.map((p) => (
            <li key={p.id}>
              <NavLink
                to={`/dossier/${p.id}`}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                {p.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main className="content-area">
        <Suspense fallback={<Skeleton />}>
          <Outlet />
        </Suspense>
      </main>
    </>
  );
}
