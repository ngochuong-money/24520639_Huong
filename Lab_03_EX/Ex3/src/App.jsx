
import { PUBG_VN_SQUADS } from './data/pubgVnSquads'

function App() {
  return (
    <main>
      <h1>PUBG Vietnam Series — Live Telemetry</h1>

      <section aria-labelledby="squads-heading">
        <h2 id="squads-heading">PUBG VN Squads</h2>

        <ul>
          {PUBG_VN_SQUADS.map((squad) => (
            <li key={squad.id}>
              <article>
                <h3>{squad.name}</h3>

                <dl>
                  <dt>Map</dt>
                  <dd>{squad.map}</dd>

                  <dt>Phase</dt>
                  <dd>{squad.phase}</dd>

                  <dt>Alive</dt>
                  <dd>{squad.alive}</dd>

                  <dt>Kills</dt>
                  <dd>{squad.kills}</dd>

                  <dt>WWCD Probability</dt>
                  <dd>{squad.wwcdProb}</dd>

                  <dt>Status</dt>
                  <dd>{squad.status}</dd>
                </dl>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default App
