import React, { useState, useCallback, useRef } from 'react';
import type { GameState } from '../types.js';
import { createGameState, startGame, tick, advance, nextLevel, restartGame } from '../engine/state.js';
import { GameCanvas } from './GameCanvas.js';
import { HUD } from './HUD.js';
import { Rules } from './Rules.js';
import { GameOver } from './GameOver.js';
import { useGameLoop } from '../hooks/useGameLoop.js';
import { useInput } from '../hooks/useInput.js';
import { useHighScore } from '../hooks/useHighScore.js';

export const PulseWeaveGame: React.FC = () => {
  const [highScore, updateHighScore] = useHighScore();
  const [state, setState] = useState<GameState>(() => createGameState(highScore));
  const [showRules, setShowRules] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const isPlaying = state.phase === 'playing';

  // Game loop
  const handleTick = useCallback((delta: number) => {
    setState(prev => tick(prev, delta));
  }, []);
  useGameLoop(handleTick, isPlaying);

  // Handle tap/click to advance
  const handleAdvance = useCallback(() => {
    setState(prev => {
      const next = advance(prev);
      if (next.phase === 'over' || next.phase === 'levelComplete') {
        updateHighScore(next.highScore);
      }
      return next;
    });
  }, [updateHighScore]);

  // Keyboard input
  useInput(handleAdvance, isPlaying);

  // Handle canvas tap (also triggers advance during play)
  const handleCanvasTap = useCallback(() => {
    const current = stateRef.current;
    if (current.phase === 'playing') {
      handleAdvance();
    }
  }, [handleAdvance]);

  // Start game from rules
  const handleStart = useCallback(() => {
    setState(prev => startGame(prev));
  }, []);

  // Next level
  const handleNextLevel = useCallback(() => {
    setState(prev => nextLevel(prev));
  }, []);

  // Restart from game over
  const handleRestart = useCallback(() => {
    setState(prev => restartGame(prev));
  }, []);

  // Show/hide rules
  const handleShowRules = useCallback(() => {
    setShowRules(true);
  }, []);

  const handleCloseRules = useCallback(() => {
    setShowRules(false);
  }, []);

  return (
    <div className="pw-container">
      <GameCanvas state={state} onTap={handleCanvasTap} />

      {isPlaying && !showRules && (
        <HUD state={state} onShowRules={handleShowRules} />
      )}

      {state.phase === 'rules' && (
        <Rules onStart={handleStart} />
      )}

      {state.phase === 'levelComplete' && (
        <div className="pw-overlay">
          <div className="pw-overlay-content">
            <h2 className="pw-level-complete-title">Level {state.level} Complete</h2>
            <p className="pw-level-score">Score: {state.score}</p>
            <button className="pw-start-btn" onClick={handleNextLevel}>
              Next Level
            </button>
          </div>
        </div>
      )}

      {state.phase === 'over' && (
        <GameOver state={state} onRestart={handleRestart} />
      )}

      {showRules && state.phase === 'playing' && (
        <div className="pw-overlay" onClick={handleCloseRules}>
          <div className="pw-overlay-content" onClick={e => e.stopPropagation()}>
            <h2>Rules</h2>
            <ol className="pw-rules-list">
              <li>Rings rotate around the center. Each has a gap.</li>
              <li>Tap anywhere to jump to the next ring outward.</li>
              <li>Time it right to pass through the gap.</li>
              <li>Miss the gap and you bounce back to the center.</li>
              <li>Three bounces in one level and it is over.</li>
            </ol>
            <button className="pw-start-btn" onClick={handleCloseRules}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
