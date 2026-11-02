
import { useId, useState } from "react";
import { SMART_PEOPLE } from "../data/smartPeople.js";
import styles from "./ScientistDirectory.module.css";

export default function ScientistDirectory({
  initialData = SMART_PEOPLE,
}) {
  const [query, setQuery] = useState("");
  const [minIq, setMinIq] = useState(0);
  const [sortBy, setSortBy] = useState("iq-desc");

  const searchId = useId();
  const minIqId = useId();
  const sortId = useId();

  const visiblePeople = initialData
    .filter((person) =>
      person.name.toLowerCase().includes(query.trim().toLowerCase()),
    )
    .filter((person) => person.iq >= minIq)
    .toSorted((a, b) =>
      sortBy === "age-asc" ? a.age - b.age : b.iq - a.iq,
    );

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
        <span>{visiblePeople.length} results</span>
      </div>

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
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
