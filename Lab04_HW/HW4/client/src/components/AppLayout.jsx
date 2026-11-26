import { Suspense } from 'react';
import { Link, NavLink, Outlet } from 'react-router';
import Skeleton from './Skeleton.jsx';

const LINKS = [
  { to: '/swipe', label: 'Swipe' },
  { to: '/dossier/himass', label: 'Himass' },
  { to: '/dossier/tanvuu', label: 'TanVuu' },
];

export default function AppLayout() {
  return (
    <>
      <header className="app-header">
        <Link to="/swipe" className="app-name">Hen Ho Nhung Khong Yeu</Link>
        <nav aria-label="Main">
          <ul className="main-nav">
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <Suspense fallback={<Skeleton />}>
        <Outlet />
      </Suspense>
    </>
  );
}
