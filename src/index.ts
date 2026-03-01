// Components
export { PulseWeaveGame } from './components/PulseWeaveGame.js';
export { GameCanvas } from './components/GameCanvas.js';
export { HUD } from './components/HUD.js';
export { Rules } from './components/Rules.js';
export { GameOver } from './components/GameOver.js';

// Engine
export {
  normalizeAngle,
  isGapAligned,
  getRingCount,
  getGapSize,
  getRotationSpeed,
  generateRings,
  rotateRings,
} from './engine/rings.js';
export {
  createPlayer,
  attemptAdvance,
  isGameOver,
  getPlayerRadius,
} from './engine/player.js';
export type { AdvanceResult } from './engine/player.js';
export {
  createGameState,
  startGame,
  tick,
  advance,
  nextLevel,
  restartGame,
  getPhase,
} from './engine/state.js';
export { DEFAULT_CONFIG, PLAYER_ANGLE, MAX_RINGS, BASE_RING_COUNT } from './engine/constants.js';

// Hooks
export { useGameLoop } from './hooks/useGameLoop.js';
export { useInput } from './hooks/useInput.js';
export { useHighScore } from './hooks/useHighScore.js';

// Types
export type {
  Ring,
  Player,
  GamePhase,
  GameState,
  GameConfig,
} from './types.js';
