import { useState, useCallback } from 'react';

const STORAGE_KEY = 'pulse-weave-high-score';

/**
 * Custom hook for persisting high score to localStorage
 */
export function useHighScore(): [number, (score: number) => void] {
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? parseInt(stored, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const updateHighScore = useCallback((score: number) => {
    setHighScore(prev => {
      const next = Math.max(prev, score);
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // localStorage unavailable
      }
      return next;
    });
  }, []);

  return [highScore, updateHighScore];
}
