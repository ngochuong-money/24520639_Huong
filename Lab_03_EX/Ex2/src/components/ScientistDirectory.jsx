
import { useId, useRef, useState } from "react";
import { SMART_PEOPLE } from "../data/smartPeople.js";
import styles from "./ScientistDirectory.module.css";

export default function ScientistDirectory({
  initialData = SMART_PEOPLE,
}) {
  const [people, setPeople] = useState(() => [...initialData]);
  const [query, setQuery] = useState("");
  const [minIq, setMinIq] = useState(0);
  const [sortBy, setSortBy] = useState("iq-desc");

  const searchId = useId();
  const minIqId = useId();
  const sortId = useId();
  const statusId = useId();

  const resetButtonRef = useRef(null);
  const deleteButtonRefs = useRef(new Map());

  const visiblePeople = people
    .filter((person) =>
      person.name.toLowerCase().includes(query.trim().toLowerCase()),
    )
    .filter((person) => person.iq >= minIq)
    .toSorted((a, b) =>
      sortBy === "age-asc" ? a.age - b.age : b.iq - a.iq,
    );

  function handleDelete(id) {
    const index = visiblePeople.findIndex((person) => person.id === id);

    const nextPerson = visiblePeople[index + 1] ?? visiblePeople[index - 1];
    const nextButton = nextPerson
      ? deleteButtonRefs.current.get(nextPerson.id)
      : resetButtonRef.current;

    setPeople((previous) =>
      previous.filter((person) => person.id !== id),
    );

    requestAnimationFrame(() => {
      if (nextButton?.isConnected) {
        nextButton.focus();
      } else {
        resetButtonRef.current?.focus();
      }
    });
  }

  function handleReset() {
    setPeople([...initialData]);
  }

  return (
    <section
      className={styles.directory}
      aria-labelledby="scientist-directory-heading"
    >
      <header className={styles.header}>
        <h2 id="scientist-directory-heading">
          Scientist Directory
        </h2>
        <p>Explore remarkable scientists and pioneers.</p>
      </header>

      <form
        className={styles.filters}
        role="search"
        aria-label="Search and filter scientists"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className={styles.field}>
          <label htmlFor={searchId}>Search by name</label>
          <input
            id={searchId}
            type="search"
            placeholder="Search scientists..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={minIqId}>Minimum IQ</label>
          <input
            id={minIqId}
            type="number"
            min="0"
            value={minIq}
            onChange={(event) => {
              const value = event.target.valueAsNumber;
              setMinIq(Number.isNaN(value) ? 0 : Math.max(0, value));
            }}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={sortId}>Sort by</label>
          <select
            id={sortId}
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="iq-desc">IQ: High to Low</option>
            <option value="age-asc">Age: Low to High</option>
          </select>
        </div>
      </form>

      <div className={styles.resultsHeading}>
        <h3>Scientists</h3>

        <output
          id={statusId}
          aria-live="polite"
          aria-atomic="true"
        >
          {visiblePeople.length} results
        </output>
      </div>

      <button
        ref={resetButtonRef}
        type="button"
        className={styles.resetButton}
        onClick={handleReset}
      >
        Reset scientists
      </button>

      {visiblePeople.length === 0 ? (
        <p className={styles.empty}>
          No scientists match your search.
        </p>
      ) : (
        <ul className={styles.list}>
          {visiblePeople.map((person) => (
            <li key={person.id} className={styles.listItem}>
              <article className={styles.card}>
                <h4>{person.name}</h4>

                <div className={styles.details}>
                  <p>Age: {person.age}</p>
                  <p>IQ (demo): {person.iq}</p>
                </div>

                <button
                  ref={(element) => {
                    if (element) {
                      deleteButtonRefs.current.set(person.id, element);
                    } else {
                      deleteButtonRefs.current.delete(person.id);
                    }
                  }}
                  type="button"
                  className={styles.deleteButton}
                  aria-label={`Delete ${person.name}`}
                  onClick={() => handleDelete(person.id)}
                >
                  Delete
                </button>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
