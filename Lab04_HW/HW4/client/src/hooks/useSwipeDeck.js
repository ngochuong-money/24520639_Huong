import { useState } from 'react';
import { computeScore } from '@shared/computeScore.js';
import { useAbortableGet } from './useAbortableGet.js';

const VERBS = { left: 'Passed on', right: 'Liked', up: 'Super liked' };
const MESSAGES = {
  save: 'Could not save your swipe. Please try again.',
  undo: 'Could not undo. Please try again.',
  reset: 'Could not start over. Please try again.',
};

const toEntry = ({ id, profileId, direction }) => ({ id, profileId, direction, pending: false });

export function useSwipeDeck() {
  const profilesQuery = useAbortableGet('/api/profiles', { errorMessage: 'Could not load profiles.' });
  const swipesQuery = useAbortableGet('/api/swipes', { errorMessage: 'Could not load your swipes.' });

  // null = user has not acted yet → fall back to the server history (no effect needed)
  const [localHistory, setLocalHistory] = useState(null);
  const [lastAction, setLastAction] = useState(null);

  // ---- Derived during render ----
  const profiles = Array.isArray(profilesQuery.data) ? profilesQuery.data : [];
  const serverHistory = Array.isArray(swipesQuery.data) ? swipesQuery.data.map(toEntry) : [];
  const history = localHistory ?? serverHistory;

  const loading = profilesQuery.loading || swipesQuery.loading;
  const error = profilesQuery.error ?? swipesQuery.error;

  const swipedIds = new Set(history.map((entry) => entry.profileId));
  const remaining = profiles.filter((p) => !swipedIds.has(p.id));
  const currentProfile = remaining[0];
  const remainingCount = remaining.length;
  const score = computeScore(history);
  const isFinished = profiles.length > 0 && !currentProfile;
  const canUndo = history.length > 0 && !history.at(-1).pending;

  const nameOf = (profileId) => profiles.find((p) => p.id === profileId)?.name ?? 'this profile';
  let announcement = '';
  if (lastAction?.type === 'error') announcement = lastAction.message;
  else if (lastAction?.type === 'swipe') {
    announcement = `${VERBS[lastAction.direction]} ${nameOf(lastAction.profileId)}. Score ${score}.${isFinished ? ' No more profiles.' : ''}`;
  } else if (lastAction?.type === 'undo') {
    announcement = `Undid swipe on ${nameOf(lastAction.profileId)}. Score ${score}.`;
  } else if (lastAction?.type === 'reset') {
    announcement = 'Starting over. Score 0.';
  }

  // Immutable updates on top of whatever history is current
  const updateHistory = (updater) => setLocalHistory((prev) => updater(prev ?? serverHistory));

  // ---- Actions ----
  const swipe = async (direction) => {
    if (!currentProfile) return;
    const { id: profileId } = currentProfile;
    const tempId = `pending-${crypto.randomUUID()}`;

    updateHistory((h) => [...h, { id: tempId, profileId, direction, pending: true }]); // optimistic
    setLastAction({ type: 'swipe', profileId, direction });

    try {
      const response = await fetch('/api/swipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, direction }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const saved = await response.json();
      updateHistory((h) => h.map((entry) => (entry.id === tempId ? toEntry(saved) : entry)));
    } catch {
      updateHistory((h) => h.filter((entry) => entry.id !== tempId)); // rollback
      setLastAction({ type: 'error', message: MESSAGES.save });
    }
  };

  const undo = async () => {
    if (!canUndo) return;
    const last = history.at(-1);

    updateHistory((h) => h.slice(0, -1)); // LIFO pop
    setLastAction({ type: 'undo', profileId: last.profileId });

    try {
      const response = await fetch(`/api/swipes/${encodeURIComponent(last.id)}`, { method: 'DELETE' });
      if (!response.ok && response.status !== 404) throw new Error(`HTTP ${response.status}`); // 404 = already gone
    } catch {
      updateHistory((h) => [...h, last]); // restore
      setLastAction({ type: 'error', message: MESSAGES.undo });
    }
  };

  const reset = async () => {
    try {
      const response = await fetch('/api/swipes', { method: 'DELETE' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setLocalHistory([]);
      setLastAction({ type: 'reset' });
    } catch {
      setLastAction({ type: 'error', message: MESSAGES.reset });
    }
  };

  return {
    profiles, loading, error, history,
    currentProfile, score, isFinished, canUndo, remainingCount,
    announcement, swipe, undo, reset,
  };
}
