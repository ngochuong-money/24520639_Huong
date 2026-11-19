import { NavLink, Outlet } from 'react-router'
import './AppLayout.css'

const NAV_ITEMS = [
  { to: '/gallery', label: 'Gallery' },
  { to: '/deck', label: 'Deck' },
]

export default function AppLayout() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <header className="site-header">
        <p className="site-title">Evidence Gallery &amp; Swipe Deck</p>
        <nav aria-label="Main">
          <ul className="nav-list">
            {NAV_ITEMS.map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} end className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  )
}
