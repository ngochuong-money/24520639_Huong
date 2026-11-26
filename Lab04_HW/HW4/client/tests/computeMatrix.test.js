import { computeMatrix } from '@shared/computeMatrix.js';
import { findPlayer } from '@shared/players.js';

const dossier = (v, s, precedents = []) => ({ name: 'X', violationSeverity: v, sanctionSeverity: s, precedents });
const p = (id, v, s) => ({ id, label: id, violationSeverity: v, sanctionSeverity: s });
const cell = (m, v, s) => m.rows.find((r) => r.sanction === s).cells.find((c) => c.violation === v);

describe('computeMatrix', () => {
  test('16a. 5×5 grid: sanction rows 5 → 1, violation columns 1 → 5', () => {
    const m = computeMatrix(dossier(3, 4));
    expect(m.rows.map((r) => r.sanction)).toEqual([5, 4, 3, 2, 1]);
    m.rows.forEach((r) => expect(r.cells.map((c) => c.violation)).toEqual([1, 2, 3, 4, 5]));
  });

  test('16b. marks exactly one case cell and the precedent cells', () => {
    const m = computeMatrix(dossier(3, 4, [p('a', 3, 3), p('b', 3, 3), p('c', 5, 5)]));
    const caseCells = m.rows.flatMap((r) => r.cells).filter((c) => c.isCase);
    expect(caseCells).toHaveLength(1);
    expect(caseCells[0]).toMatchObject({ violation: 3, sanction: 4 });
    expect(cell(m, 3, 3).precedentIds).toEqual(['a', 'b']);
    expect(cell(m, 5, 5).precedentIds).toEqual(['c']);
    expect(cell(m, 1, 1).precedentIds).toEqual([]);
  });

  test('16c. band per cell: harsh (s − v ≥ 2), lenient (≤ −2), otherwise proportionate', () => {
    const m = computeMatrix(dossier(3, 3));
    expect(cell(m, 1, 3).band).toBe('harsh');
    expect(cell(m, 3, 1).band).toBe('lenient');
    expect(cell(m, 2, 3).band).toBe('proportionate');
  });

  test('16d. rule 1: gap ≥ 2 → Disproportionate; gap 1 → Proportionate', () => {
    expect(computeMatrix(dossier(1, 3)).verdict).toBe('Disproportionate');
    expect(computeMatrix(dossier(2, 3)).verdict).toBe('Proportionate');
  });

  test('16e. rule 2: gap − precedent median gap ≥ 2 → Disproportionate', () => {
    const m = computeMatrix(dossier(3, 4, [p('a', 3, 2), p('b', 4, 3), p('c', 2, 1)])); // gaps −1, −1, −1
    expect(m.gap).toBe(1);
    expect(m.precedentMedianGap).toBe(-1);
    expect(m.verdict).toBe('Disproportionate');
  });

  test('16f. median of an even number of gaps is the average; no precedents → 0', () => {
    expect(computeMatrix(dossier(3, 3, [p('a', 1, 1), p('b', 1, 2)])).precedentMedianGap).toBe(0.5);
    expect(computeMatrix(dossier(3, 3)).precedentMedianGap).toBe(0);
  });

  test('16g. invalid severities throw RangeError', () => {
    expect(() => computeMatrix(dossier(0, 3))).toThrow(RangeError);
    expect(() => computeMatrix(dossier(3, 6))).toThrow(RangeError);
    expect(() => computeMatrix(dossier(2.5, 3))).toThrow(RangeError);
    expect(() => computeMatrix(dossier(3, 3, [p('a', 9, 1)]))).toThrow(RangeError);
  });

  test('17. seed verdicts: Himass Proportionate, TanVuu Disproportionate', () => {
    const himass = computeMatrix(findPlayer('himass'));
    expect(himass).toMatchObject({ gap: 1, precedentMedianGap: 0, verdict: 'Proportionate' });
    expect(computeMatrix(findPlayer('tanvuu'))).toMatchObject({ gap: 2, verdict: 'Disproportionate' });
    expect(himass.reason).toMatch(/gap \+1/);
  });
});
