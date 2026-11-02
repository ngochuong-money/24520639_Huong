
import { useEffect, useState } from 'react'
import { fetchTelemetry } from '../services/telemetry'

export default function PubgMatchTelemetry({
    squadId = 'te',
}) {
    const [view, setView] = useState({
        status: 'IDLE',
        data: null,
        error: null,
    })

    const [retryTick] = useState(0)

    useEffect(() => {
        const controller = new AbortController()

        queueMicrotask(() => {
            if (!controller.signal.aborted) {
                setView({
                    status: 'LOADING',
                    data: null,
                    error: null,
                })
            }
        })

        fetchTelemetry(squadId, {
            signal: controller.signal,
        })
            .then((data) => {
                if (controller.signal.aborted) return

                setView({
                    status: 'SUCCESS',
                    data,
                    error: null,
                })
            })
            .catch((error) => {
                if (
                    controller.signal.aborted ||
                    error.name === 'AbortError'
                ) {
                    return
                }

                setView({
                    status: 'ERROR',
                    data: null,
                    error: error.message,
                })
            })

        return () => {
            controller.abort()
        }
    }, [squadId, retryTick])

    return (
        <section aria-labelledby="telemetry-heading">
            <h2 id="telemetry-heading">Match Telemetry</h2>

            <p>Status: {view.status}</p>

            {view.status === 'SUCCESS' && (
                <article>
                    <h3>{view.data.name}</h3>
                    <p>Map: {view.data.map}</p>
                    <p>Phase: {view.data.phase}</p>
                    <p>Alive: {view.data.alive}</p>
                    <p>Kills: {view.data.kills}</p>
                    <p>WWCD Probability: {view.data.wwcdProb}</p>
                    <p>Position: {view.data.status}</p>
                </article>
            )}

            {view.status === 'ERROR' && (
                <p>Telemetry error: {view.error}</p>
            )}
        </section>
    )
}
