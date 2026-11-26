import { useId, useMemo } from 'react';
import { computeMatrix } from '@shared/computeMatrix.js';

export default function DisproportionalityMatrix({ dossier }) {
  const headingId = useId();
  const matrix = useMemo(() => computeMatrix(dossier), [dossier]); // derived in render, no effect
  const labelOf = (id) => dossier.precedents.find((pr) => pr.id === id)?.label ?? id;

  return (
    <section aria-labelledby={headingId} className="matrix">
      <h2 id={headingId}>Disproportionality matrix</h2>
      <table className="matrix-table">
        <caption>Disproportionality matrix for {dossier.name}</caption>
        <thead>
          <tr>
            <td />
            {matrix.rows[0].cells.map((c) => (
              <th key={c.violation} scope="col">Violation {c.violation}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.rows.map((row) => (
            <tr key={row.sanction}>
              <th scope="row">Sanction {row.sanction}</th>
              {row.cells.map((c) => (
                <td key={c.violation} className={`matrix-cell matrix-cell--${c.band}${c.isCase ? ' is-case' : ''}`}>
                  {c.isCase && <strong>Case</strong>}
                  {c.isCase && c.precedentIds.length > 0 && ' · '}
                  {c.precedentIds.length > 0 && (
                    <>
                      <span aria-hidden="true">P×{c.precedentIds.length}</span>
                      <span className="visually-hidden">
                        Precedents: {c.precedentIds.map(labelOf).join(', ')}
                      </span>
                    </>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p className={`verdict verdict--${matrix.verdict.toLowerCase()}`}>
        <strong>Verdict: {matrix.verdict}.</strong> {matrix.reason}
      </p>

      <dl className="matrix-legend">
        <dt>Case</dt><dd>This dossier</dd>
        <dt>P×n</dt><dd>Number of precedents in that cell</dd>
        <dt>Shading</dt><dd>Harsh (sanction ≥ 2 above violation) · Proportionate · Lenient</dd>
      </dl>
    </section>
  );
}
