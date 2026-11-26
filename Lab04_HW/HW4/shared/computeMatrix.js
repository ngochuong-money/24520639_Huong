const SIZE = 5;
const LEVELS_DESC = [5, 4, 3, 2, 1];
const LEVELS_ASC = [1, 2, 3, 4, 5];

const assertSeverity = (value, label) => {
  if (!Number.isInteger(value) || value < 1 || value > SIZE) {
    throw new RangeError(`${label} must be an integer from 1 to ${SIZE}, got ${value}`);
  }
};

const median = (values) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const bandOf = (violation, sanction) => {
  const diff = sanction - violation;
  if (diff >= 2) return 'harsh';
  if (diff <= -2) return 'lenient';
  return 'proportionate';
};

const signed = (n) => (n > 0 ? `+${n}` : `${n}`);

/** Pure: derives the 5×5 disproportionality matrix and verdict from a dossier. */
export function computeMatrix({ violationSeverity, sanctionSeverity, precedents = [] }) {
  assertSeverity(violationSeverity, 'violationSeverity');
  assertSeverity(sanctionSeverity, 'sanctionSeverity');
  precedents.forEach((pr) => {
    assertSeverity(pr.violationSeverity, `precedent ${pr.id} violationSeverity`);
    assertSeverity(pr.sanctionSeverity, `precedent ${pr.id} sanctionSeverity`);
  });

  const rows = LEVELS_DESC.map((sanction) => ({
    sanction,
    cells: LEVELS_ASC.map((violation) => ({
      violation,
      sanction, // each cell is self-describing (coordinates on both axes)
      isCase: violation === violationSeverity && sanction === sanctionSeverity,
      precedentIds: precedents
        .filter((pr) => pr.violationSeverity === violation && pr.sanctionSeverity === sanction)
        .map((pr) => pr.id),
      band: bandOf(violation, sanction),
    })),
  }));

  const gap = sanctionSeverity - violationSeverity;
  const precedentMedianGap = median(precedents.map((pr) => pr.sanctionSeverity - pr.violationSeverity));
  const verdict = gap >= 2 || gap - precedentMedianGap >= 2 ? 'Disproportionate' : 'Proportionate';
  const reason = `Sanction level ${sanctionSeverity} vs violation level ${violationSeverity}: gap ${signed(gap)}, precedent median gap ${signed(precedentMedianGap)}.`;

  return { rows, gap, precedentMedianGap, verdict, reason };
}
