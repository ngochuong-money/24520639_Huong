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
    SWITCH_TO_AI_DO: "SELF_RESPECT_EXIT",
    MESSAGE_TIMEOUT: "SELF_RESPECT_EXIT",
    STOP: "SELF_RESPECT_EXIT",
  },
  COMMITTED: {
    STOP: "SELF_RESPECT_EXIT",
  },
  SELF_RESPECT_EXIT: {},
};

export function getEffortError({ actor, steps, weight }) {
  if (actor !== "EM" && actor !== "AI_DO") {
    return "Vui lòng chọn người thực hiện hợp lệ.";
  }

  if (!Number.isSafeInteger(steps) || steps < 0) {
    return "Số lần phải là số nguyên không âm trong phạm vi an toàn.";
  }

  if (!Number.isFinite(weight) || weight < 0) {
    return "Trọng số phải là số hữu hạn không âm.";
  }

  if (!Number.isFinite(steps * weight)) {
    return "Giá trị đóng góp quá lớn. Vui lòng giảm số lần hoặc trọng số.";
  }

  return "";
}

export function situationshipReducer(state, action) {
  if (action.type === "ADD_SIGNAL") {
    if (state.phase === "SELF_RESPECT_EXIT") {
      return state;
    }

    const signal = action.payload;

    if (
      !signal ||
      typeof signal.id !== "string" ||
      signal.id.trim() === "" ||
      getEffortError(signal) ||
      state.signals.some((entry) => entry.id === signal.id)
    ) {
      return state;
    }

    return {
      ...state,
      signals: [...state.signals, { ...signal }],
    };
  }

  const transitions = TRANSITIONS[state.phase];

  if (
    !transitions ||
    !Object.hasOwn(transitions, action.type)
  ) {
    return state;
  }

  return {
    ...state,
    phase: transitions[action.type],
  };
}
