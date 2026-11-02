
import { useId, useState } from 'react'
import { PUBG_VN_SQUADS } from './data/pubgVnSquads'
import PubgMatchTelemetry from './components/PubgMatchTelemetry'

function App() {
  const [selectedSquadId, setSelectedSquadId] = useState('te')
  const squadSelectId = useId()

  return (
    <main>
      <h1>PUBG Vietnam Series — Live Telemetry</h1>

      <section aria-labelledby="squads-heading">
        <h2 id="squads-heading">PUBG VN Squads</h2>

        <label htmlFor={squadSelectId}>
          Select squad
        </label>

        <select
          id={squadSelectId}
          value={selectedSquadId}
          onChange={(event) => {
            setSelectedSquadId(event.target.value)
          }}
        >
          {PUBG_VN_SQUADS.map((squad) => (
            <option key={squad.id} value={squad.id}>
              {squad.name}
            </option>
          ))}
        </select>
      </section>

      <PubgMatchTelemetry squadId={selectedSquadId} />
    </main>
  )
}

export default App
