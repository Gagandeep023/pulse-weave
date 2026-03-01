import { useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook that runs a game loop callback at ~60fps.
 * The callback receives the delta time in seconds.
 */
export function useGameLoop(
  callback: (delta: number) => void,
  active: boolean
): void {
  const callbackRef = useRef(callback);
  const lastTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!active) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const delta = Math.min((now - lastTimeRef.current) / 1000, 0.1); // cap delta at 100ms
      lastTimeRef.current = now;
      callbackRef.current(delta);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [active]);
}
