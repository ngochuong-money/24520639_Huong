import { useEffect, useRef, useState } from 'react';
import { formatDropTitle } from './formatters.js';

const updateStock = (drops, dropId, getNextStock) =>
  drops.map((drop) =>
    drop.id === dropId ? { ...drop, remainingStock: getNextStock(drop) } : drop,
  );

const withItem = (set, item) => new Set(set).add(item);

const withoutItem = (set, item) => {
  const next = new Set(set);
  next.delete(item);
  return next;
};

/**
 * Optimistic claim flow with an in-flight lock and 409 rollback.
 * @param {ReadonlyArray<import('./contract.js').CrateDrop>} initialDrops
 * @param {{ claim: Function }} api
 */
export function useOptimisticClaim(initialDrops, api) {
  const [drops, setDrops] = useState(initialDrops);
  const [pendingDropIds, setPendingDropIds] = useState(() => new Set());
  const [statusMessage, setStatusMessage] = useState('');
  const inFlightRef = useRef(new Map());
  const controllersRef = useRef(new Set());

  useEffect(() => {
    const controllers = controllersRef.current;
    return () => {
      controllers.forEach((controller) => controller.abort());
      controllers.clear();
    };
  }, []);

  const claim = async (dropId) => {
    const drop = drops.find((item) => item.id === dropId);
    if (!drop || drop.remainingStock <= 0 || inFlightRef.current.has(dropId)) return;

    const claimId = crypto.randomUUID();
    const controller = new AbortController();
    const title = formatDropTitle(drop);

    inFlightRef.current.set(dropId, claimId);
    controllersRef.current.add(controller);
    setPendingDropIds((prev) => withItem(prev, dropId));
    setDrops((prev) =>
      updateStock(prev, dropId, (item) => Math.max(0, item.remainingStock - 1)),
    );
    setStatusMessage(`Claiming ${title}…`);

    try {
      const result = await api.claim(dropId, claimId, { signal: controller.signal });
      setDrops((prev) => updateStock(prev, dropId, () => result.remainingStock));
      setStatusMessage(`Claimed ${title}. ${result.remainingStock} left.`);
    } catch (error) {
      if (error.name === 'AbortError') return;

      setDrops((prev) =>
        updateStock(prev, dropId, (item) =>
          Math.min(item.totalStock, item.remainingStock + 1),
        ),
      );
      setStatusMessage(
        error.status === 409
          ? `${title} was looted out by other players. Your claim was rolled back.`
          : `Claim for ${title} failed. Your claim was rolled back.`,
      );
    } finally {
      inFlightRef.current.delete(dropId);
      controllersRef.current.delete(controller);
      if (!controller.signal.aborted) {
        setPendingDropIds((prev) => withoutItem(prev, dropId));
      }
    }
  };

  return { drops, pendingDropIds, statusMessage, claim };
}