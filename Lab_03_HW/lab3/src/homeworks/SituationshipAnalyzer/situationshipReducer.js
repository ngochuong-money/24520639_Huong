export const INITIAL_STATE = {
  phase: "STRANGERS",
  signals: [],
};

const TRANSITIONS = {
  STRANGERS: {
    START_DATING: "DATING_NO_LOVE",
    STOP: "SELF_RESPECT_EXIT",
  },
  DATING_NO_LOVE: {
    CONFIRM_COMMITMENT: "COMMITTED",
    STOP: "SELF_RESPECT_EXIT",
  },
  COMMITTED: {
    STOP: "SELF_RESPECT_EXIT",
  },
  SELF_RESPECT_EXIT: {},
};

export function situationshipReducer(state, action) {
  const nextPhase = TRANSITIONS[state.phase]?.[action.type];

  if (!nextPhase) {
    return state;
  }

  return {
    ...state,
    phase: nextPhase,
  };
}