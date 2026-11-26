// Stub — implemented in WBS 3.2
export function useSwipeDeck() {
  return {
    profiles: [], loading: true, error: null, history: [],
    currentProfile: undefined, score: 0, isFinished: false, canUndo: false, remainingCount: 0,
    announcement: '', swipe: async () => {}, undo: async () => {}, reset: async () => {},
  };
}
