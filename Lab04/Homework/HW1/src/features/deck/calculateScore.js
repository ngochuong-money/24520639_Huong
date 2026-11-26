// Constants from docs/API_CONTRACT.md section 7 (provisional until confirmed against the assignment).
export const SCORE_BY_DIRECTION = Object.freeze({ right: 10, left: -5 })

// Derived from history only: never stored, never kept in state.
export function calculateScore(history) {
  return history.reduce((total, { direction }) => {
    const points = Object.hasOwn(SCORE_BY_DIRECTION, direction) ? SCORE_BY_DIRECTION[direction] : 0
    return total + points
  }, 0)
}
