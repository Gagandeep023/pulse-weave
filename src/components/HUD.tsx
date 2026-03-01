import React from 'react';
import type { GameState } from '../types.js';
import { DEFAULT_CONFIG } from '../engine/constants.js';

interface HUDProps {
  state: GameState;
  onShowRules: () => void;
}

export const HUD: React.FC<HUDProps> = ({ state, onShowRules }) => {
  const livesRemaining = DEFAULT_CONFIG.maxFalls - state.player.falls;
  const totalRings = state.rings.length;
  const currentRing = Math.min(state.player.currentRing, totalRings);

  return (
    <div className="pw-hud">
      <div className="pw-hud-left">
        <div className="pw-hud-level">Level {state.level}</div>
        <div className="pw-hud-progress">
          Ring {currentRing} / {totalRings}
        </div>
      </div>
      <div className="pw-hud-center">
        <div className="pw-hud-lives">
          {Array.from({ length: DEFAULT_CONFIG.maxFalls }, (_, i) => (
            <span
              key={i}
              className={`pw-life-dot ${i < livesRemaining ? 'pw-life-active' : 'pw-life-lost'}`}
            />
          ))}
        </div>
      </div>
      <div className="pw-hud-right">
        <button className="pw-rules-btn" onClick={onShowRules} aria-label="Show rules">
          ?
        </button>
      </div>
    </div>
  );
};
