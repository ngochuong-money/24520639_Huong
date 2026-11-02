
import { SMART_PEOPLE } from "../data/smartPeople.js";

export default function ScientistDirectory({
  initialData = SMART_PEOPLE,
}) {
  return (
    <section aria-labelledby="scientist-directory-heading">
      <h2 id="scientist-directory-heading">
        Scientist Directory
      </h2>

      <ul>
        {initialData.map((person) => (
          <li key={person.id}>
            <article>
              <h3>{person.name}</h3>
              <p>Age: {person.age}</p>
              <p>IQ (demo): {person.iq}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
