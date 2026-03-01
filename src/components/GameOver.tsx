import React from 'react';
import type { GameState } from '../types.js';

interface GameOverProps {
  state: GameState;
  onRestart: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ state, onRestart }) => {
  return (
    <div className="pw-overlay">
      <div className="pw-overlay-content">
        <h1 className="pw-game-over-title">Signal Lost</h1>

        <div className="pw-score-section">
          <div className="pw-score-row">
            <span className="pw-score-label">Levels Cleared</span>
            <span className="pw-score-value">{state.score}</span>
          </div>
          <div className="pw-score-row">
            <span className="pw-score-label">Best Level Reached</span>
            <span className="pw-score-value">{state.level}</span>
          </div>
          <div className="pw-score-row pw-high-score">
            <span className="pw-score-label">High Score</span>
            <span className="pw-score-value">{state.highScore}</span>
          </div>
        </div>

        <button className="pw-start-btn" onClick={onRestart}>
          Try Again
        </button>
      </div>
    </div>
  );
};
