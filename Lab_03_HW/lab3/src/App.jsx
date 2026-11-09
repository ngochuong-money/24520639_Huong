import { useId } from 'react';
import { HOMEWORKS } from './homeworks/registry.js';
import { useHashRoute } from './hooks/useHashRoute.js';

export default function App() {
  const route = useHashRoute();
  const welcomeHeadingId = useId();
  const ActiveHomework = HOMEWORKS.find((hw) => hw.id === route)?.Component;

  return (
    <>
      <header>
        <h1>Lab 3 — React 19 Homeworks</h1>
        <nav aria-label="Homeworks">
          <ul>
            {HOMEWORKS.map(({ id, title }) => (
              <li key={id}>
                <a href={`#${id}`} aria-current={id === route ? 'page' : undefined}>
                  {title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main>
        {ActiveHomework ? (
          <ActiveHomework />
        ) : (
          <section aria-labelledby={welcomeHeadingId}>
            <h2 id={welcomeHeadingId}>Select a homework</h2>
            <p>Choose a homework from the navigation to open it.</p>
          </section>
        )}
      </main>
    </>
  );
}