import { useEffect, useCallback } from 'react';

/**
 * Custom hook that listens for click/tap/keyboard input and calls the handler.
 * The entire game is controlled by a single action: tap/click anywhere or press space.
 */
export function useInput(
  handler: () => void,
  active: boolean
): void {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!active) return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handler();
      }
    },
    [handler, active]
  );

  useEffect(() => {
    if (!active) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, active]);
}
