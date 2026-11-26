export default function ScoreBoard({ score = 0, remainingCount = 0 }) {
  return (
    <dl className="scoreboard">
      <dt>Score</dt>
      <dd>{score}</dd>
      <dt>Profiles left</dt>
      <dd>{remainingCount}</dd>
    </dl>
  );
}
