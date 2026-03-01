import { describe, it, expect } from 'vitest';
import {
  createGameState,
  startGame,
  tick,
  advance,
  nextLevel,
  restartGame,
  getPhase,
} from '../src/engine/state.js';
import { generateRings, normalizeAngle } from '../src/engine/rings.js';
import type { GameState } from '../src/types.js';

describe('createGameState', () => {
  it('should create initial state in rules phase', () => {
    const state = createGameState();
    expect(state.phase).toBe('rules');
    expect(state.level).toBe(1);
    expect(state.score).toBe(0);
    expect(state.player.currentRing).toBe(0);
    expect(state.player.falls).toBe(0);
  });

  it('should preserve high score', () => {
    const state = createGameState(10);
    expect(state.highScore).toBe(10);
  });
});

describe('startGame', () => {
  it('should transition from rules to playing', () => {
    const state = createGameState();
    const next = startGame(state);
    expect(next.phase).toBe('playing');
    expect(next.level).toBe(1);
    expect(next.score).toBe(0);
  });
});

describe('tick', () => {
  it('should rotate rings during playing phase', () => {
    let state = createGameState();
    state = startGame(state);
    const initialAngles = state.rings.map(r => r.currentAngle);

    const next = tick(state, 1.0);
    const changed = next.rings.some(
      (r, i) => r.currentAngle !== initialAngles[i]
    );
    expect(changed).toBe(true);
  });

  it('should not update during rules phase', () => {
    const state = createGameState();
    const next = tick(state, 1.0);
    expect(next).toBe(state);
  });

  it('should update animation progress when animating', () => {
    let state = createGameState();
    state = startGame(state);
    state = { ...state, isBouncing: true, animationProgress: 0 };
    const next = tick(state, 0.05);
    expect(next.animationProgress).toBeGreaterThan(0);
  });
});

describe('advance', () => {
  it('should not advance during non-playing phase', () => {
    const state = createGameState();
    const next = advance(state);
    expect(next.phase).toBe('rules');
  });

  it('should not advance while animating', () => {
    let state = createGameState();
    state = startGame(state);
    state = { ...state, isBouncing: true };
    const next = advance(state);
    expect(next.player.currentRing).toBe(state.player.currentRing);
  });

  it('should trigger bounce when gap is not aligned', () => {
    let state = createGameState();
    state = startGame(state);
    // Force rings to have gaps at 0 (far from player at 3PI/2)
    state = {
      ...state,
      rings: state.rings.map(r => ({
        ...r,
        currentAngle: 0,
        gapAngle: 0,
        gapSize: Math.PI / 8, // Small gap at 0, player is at 3PI/2
      })),
    };

    const next = advance(state);
    expect(next.player.falls).toBe(1);
    expect(next.isBouncing).toBe(true);
    expect(next.player.currentRing).toBe(0);
  });

  it('should advance player when gap is aligned', () => {
    let state = createGameState();
    state = startGame(state);
    // Place gap at player's position (3PI/2 = -PI/2)
    const playerAngleNorm = normalizeAngle(-Math.PI / 2);
    state = {
      ...state,
      rings: state.rings.map(r => ({
        ...r,
        currentAngle: playerAngleNorm - Math.PI / 6, // Gap starts just before player
        gapAngle: 0,
        gapSize: Math.PI / 3, // Big enough gap
      })),
    };

    const next = advance(state);
    expect(next.player.currentRing).toBe(1);
    expect(next.isAdvancing).toBe(true);
  });

  it('should trigger game over after 3 falls', () => {
    let state = createGameState();
    state = startGame(state);
    // Set up rings with no aligned gap
    state = {
      ...state,
      rings: state.rings.map(r => ({
        ...r,
        currentAngle: 0,
        gapAngle: 0,
        gapSize: Math.PI / 8,
      })),
    };

    // Fall 1
    state = advance(state);
    expect(state.phase).toBe('playing');
    state = { ...state, isBouncing: false }; // Reset animation

    // Fall 2
    state = advance(state);
    expect(state.phase).toBe('playing');
    state = { ...state, isBouncing: false };

    // Fall 3 = game over
    state = advance(state);
    expect(state.phase).toBe('over');
    expect(state.player.falls).toBe(3);
  });
});

describe('nextLevel', () => {
  it('should only work from levelComplete phase', () => {
    const state = createGameState();
    const next = nextLevel(state);
    expect(next.phase).toBe('rules'); // No change
  });

  it('should advance level and reset player', () => {
    let state = createGameState();
    state = { ...state, phase: 'levelComplete', level: 2, score: 2 };
    const next = nextLevel(state);
    expect(next.phase).toBe('playing');
    expect(next.level).toBe(3);
    expect(next.player.currentRing).toBe(0);
    expect(next.player.falls).toBe(0);
  });
});

describe('restartGame', () => {
  it('should reset to level 1 playing', () => {
    let state = createGameState();
    state = { ...state, phase: 'over', level: 5, score: 4 };
    const next = restartGame(state);
    expect(next.phase).toBe('playing');
    expect(next.level).toBe(1);
    expect(next.score).toBe(0);
    expect(next.player.currentRing).toBe(0);
    expect(next.player.falls).toBe(0);
  });
});

describe('getPhase', () => {
  it('should return current phase', () => {
    const state = createGameState();
    expect(getPhase(state)).toBe('rules');
  });
});

describe('level progression flow', () => {
  it('should complete a full level cycle', () => {
    let state = createGameState();
    state = startGame(state);

    // Set up single ring with aligned gap for easy pass
    const playerAngleNorm = normalizeAngle(-Math.PI / 2);
    state = {
      ...state,
      rings: [{
        radius: 80,
        gapAngle: 0,
        gapSize: Math.PI / 3,
        rotationSpeed: 1,
        currentAngle: playerAngleNorm - Math.PI / 6,
      }],
    };

    // Advance through the only ring
    state = advance(state);
    expect(state.phase).toBe('levelComplete');
    expect(state.score).toBe(1);

    // Move to next level
    state = nextLevel(state);
    expect(state.phase).toBe('playing');
    expect(state.level).toBe(2);
    expect(state.rings.length).toBeGreaterThanOrEqual(4);
  });
});
