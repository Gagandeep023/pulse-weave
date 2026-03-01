import type { GameState, GamePhase } from '../types.js';
import { generateRings, rotateRings } from './rings.js';
import { createPlayer, attemptAdvance, isGameOver } from './player.js';
import { DEFAULT_CONFIG } from './constants.js';

/**
 * Create the initial game state
 */
export function createGameState(highScore: number = 0): GameState {
  return {
    phase: 'rules',
    level: 1,
    rings: generateRings(1),
    player: createPlayer(),
    score: 0,
    highScore,
    lastAdvanceTime: 0,
    isBouncing: false,
    isAdvancing: false,
    animationProgress: 0,
    animationFromRing: 0,
    animationToRing: 0,
  };
}

/**
 * Start playing from the rules screen
 */
export function startGame(state: GameState): GameState {
  return {
    ...state,
    phase: 'playing',
    level: 1,
    rings: generateRings(1),
    player: createPlayer(),
    score: 0,
    isBouncing: false,
    isAdvancing: false,
    animationProgress: 0,
  };
}

/**
 * Update the game state by one tick
 */
export function tick(state: GameState, delta: number): GameState {
  if (state.phase !== 'playing') return state;

  // Rotate rings
  const rings = state.rings.map(r => ({ ...r }));
  rotateRings(rings, delta);

  // Update animation
  let animationProgress = state.animationProgress;
  let isBouncing = state.isBouncing;
  let isAdvancing = state.isAdvancing;

  if (isBouncing || isAdvancing) {
    animationProgress += delta / (DEFAULT_CONFIG.animationDuration / 1000);
    if (animationProgress >= 1) {
      animationProgress = 0;
      isBouncing = false;
      isAdvancing = false;
    }
  }

  return {
    ...state,
    rings,
    animationProgress,
    isBouncing,
    isAdvancing,
  };
}

/**
 * Attempt to advance the player. Returns the new state.
 */
export function advance(state: GameState): GameState {
  if (state.phase !== 'playing') return state;
  if (state.isBouncing || state.isAdvancing) return state;

  const player = { ...state.player };
  const fromRing = player.currentRing;
  const result = attemptAdvance(player, state.rings);

  if (result.levelComplete) {
    const newLevel = state.level + 1;
    const newScore = state.score + 1;
    const newHighScore = Math.max(newScore, state.highScore);
    return {
      ...state,
      phase: 'levelComplete',
      player,
      score: newScore,
      highScore: newHighScore,
      isAdvancing: true,
      animationProgress: 0,
      animationFromRing: fromRing,
      animationToRing: player.currentRing,
      lastAdvanceTime: Date.now(),
    };
  }

  if (result.fell && isGameOver(player)) {
    const newHighScore = Math.max(state.score, state.highScore);
    return {
      ...state,
      phase: 'over',
      player,
      highScore: newHighScore,
      isBouncing: true,
      animationProgress: 0,
      animationFromRing: fromRing,
      animationToRing: 0,
      lastAdvanceTime: Date.now(),
    };
  }

  if (result.fell) {
    return {
      ...state,
      player,
      isBouncing: true,
      animationProgress: 0,
      animationFromRing: fromRing,
      animationToRing: 0,
      lastAdvanceTime: Date.now(),
    };
  }

  // Successful advance
  return {
    ...state,
    player,
    isAdvancing: true,
    animationProgress: 0,
    animationFromRing: fromRing,
    animationToRing: player.currentRing,
    lastAdvanceTime: Date.now(),
  };
}

/**
 * Progress to the next level after level complete
 */
export function nextLevel(state: GameState): GameState {
  if (state.phase !== 'levelComplete') return state;

  const newLevel = state.level + 1;
  return {
    ...state,
    phase: 'playing',
    level: newLevel,
    rings: generateRings(newLevel),
    player: createPlayer(),
    isBouncing: false,
    isAdvancing: false,
    animationProgress: 0,
  };
}

/**
 * Restart the game from game over
 */
export function restartGame(state: GameState): GameState {
  return {
    ...state,
    phase: 'playing',
    level: 1,
    rings: generateRings(1),
    player: createPlayer(),
    score: 0,
    isBouncing: false,
    isAdvancing: false,
    animationProgress: 0,
  };
}

/**
 * Get the current game phase
 */
export function getPhase(state: GameState): GamePhase {
  return state.phase;
}
