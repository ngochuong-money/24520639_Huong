
import { useEffect, useState } from 'react'
import { fetchTelemetry } from '../services/telemetry'
import styles from './PubgMatchTelemetry.module.css'
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
    const handleRetry = () => {
        setRetryTick((current) => current + 1)
    }

    return (
        <section
            className={styles.telemetry}
            aria-labelledby="telemetry-heading"
        >
            <header className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>KRAFTON × PUBG Vietnam</p>
                    <h2 id="telemetry-heading">Live Match Radar</h2>
                    <p className={styles.subtitle}>
                        Real-time squad telemetry simulation
                    </p>
                </div>

                <span className={styles.status} data-status={view.status}>
                    {view.status}
                </span>
            </header>

            {view.status === 'IDLE' && (
                <p className={styles.message}>Waiting for telemetry...</p>
            )}

            {view.status === 'LOADING' && (
                <section
                    className={styles.skeleton}
                    aria-label="Loading match telemetry"
                    aria-busy="true"
                    role="status"
                >
                    <span className={styles.skeletonCircle} aria-hidden="true" />
                    <p>Syncing KRAFTON Radar...</p>
                </section>
            )}

            {view.status === 'ERROR' && (
                <section className={styles.error} role="alert">
                    <h3>Blue-Zone Link Lost</h3>
                    <p>{view.error}</p>
                    <button
                        type="button"
                        className={styles.retryButton}
                        onClick={handleRetry}
                    >
                        Reconnect Satellite (Retry)
                    </button>
                </section>
            )}

            {view.status === 'SUCCESS' && view.data && (
                <article className={styles.radar} aria-live="polite">
                    <h3>{view.data.name}</h3>

                    <dl className={styles.stats}>
                        <div>
                            <dt>Map</dt>
                            <dd>{view.data.map}</dd>
                        </div>
                        <div>
                            <dt>Phase</dt>
                            <dd>{view.data.phase}</dd>
                        </div>
                        <div>
                            <dt>Alive</dt>
                            <dd>{view.data.alive}</dd>
                        </div>
                        <div>
                            <dt>Kills</dt>
                            <dd>{view.data.kills}</dd>
                        </div>
                        <div>
                            <dt>WWCD Probability</dt>
                            <dd>{view.data.wwcdProb}</dd>
                        </div>
                        <div>
                            <dt>Position</dt>
                            <dd>{view.data.status}</dd>
                        </div>
                    </dl>
                </article>
            )}
        </section>
    )
}
