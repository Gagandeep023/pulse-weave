import { describe, it, expect } from 'vitest';
import {
  createPlayer,
  attemptAdvance,
  isGameOver,
  getPlayerRadius,
} from '../src/engine/player.js';
import { PLAYER_ANGLE, DEFAULT_CONFIG } from '../src/engine/constants.js';
import type { Ring, Player } from '../src/types.js';

function makeRingWithGapAt(gapCenterAngle: number, gapSize: number = Math.PI / 3): Ring {
  return {
    radius: 80,
    gapAngle: gapCenterAngle,
    gapSize,
    rotationSpeed: 1,
    currentAngle: 0,
  };
}

describe('createPlayer', () => {
  it('should create player at center with 0 falls', () => {
    const player = createPlayer();
    expect(player.currentRing).toBe(0);
    expect(player.falls).toBe(0);
    expect(player.angle).toBe(PLAYER_ANGLE);
  });
});

describe('attemptAdvance', () => {
  it('should succeed when gap is aligned with player angle', () => {
    const player = createPlayer();
    // Player angle is -PI/2 = 3PI/2 normalized
    // Make gap at the player's position: currentAngle + gapAngle should be near 3PI/2
    const ring: Ring = {
      radius: 80,
      gapAngle: 0,
      gapSize: Math.PI / 3,
      rotationSpeed: 1,
      currentAngle: Math.PI * 1.5 - Math.PI / 6, // Gap centered at player
    };
    const result = attemptAdvance(player, [ring]);
    expect(result.success).toBe(true);
    expect(result.fell).toBe(false);
    expect(player.currentRing).toBe(1);
  });

  it('should fail and bounce when gap is not aligned', () => {
    const player = createPlayer();
    const ring: Ring = {
      radius: 80,
      gapAngle: 0,
      gapSize: Math.PI / 6,
      rotationSpeed: 1,
      currentAngle: 0, // Gap is at 0, player is at 3PI/2
    };
    const result = attemptAdvance(player, [ring]);
    expect(result.success).toBe(false);
    expect(result.fell).toBe(true);
    expect(player.currentRing).toBe(0);
    expect(player.falls).toBe(1);
  });

  it('should increment fall counter on each bounce', () => {
    const player = createPlayer();
    const ring: Ring = {
      radius: 80,
      gapAngle: 0,
      gapSize: Math.PI / 6,
      rotationSpeed: 1,
      currentAngle: 0,
    };
    attemptAdvance(player, [ring]);
    expect(player.falls).toBe(1);
    attemptAdvance(player, [ring]);
    expect(player.falls).toBe(2);
  });

  it('should detect level complete when passing all rings', () => {
    const player = createPlayer();
    // Single ring with gap aligned
    const ring: Ring = {
      radius: 80,
      gapAngle: 0,
      gapSize: Math.PI / 3,
      rotationSpeed: 1,
      currentAngle: Math.PI * 1.5 - Math.PI / 6,
    };
    const result = attemptAdvance(player, [ring]);
    expect(result.success).toBe(true);
    expect(result.levelComplete).toBe(true);
  });

  it('should not detect level complete when more rings remain', () => {
    const player = createPlayer();
    const rings: Ring[] = [
      {
        radius: 80,
        gapAngle: 0,
        gapSize: Math.PI / 3,
        rotationSpeed: 1,
        currentAngle: Math.PI * 1.5 - Math.PI / 6,
      },
      {
        radius: 110,
        gapAngle: 0,
        gapSize: Math.PI / 3,
        rotationSpeed: 1,
        currentAngle: 0,
      },
    ];
    const result = attemptAdvance(player, rings);
    expect(result.success).toBe(true);
    expect(result.levelComplete).toBe(false);
    expect(player.currentRing).toBe(1);
  });

  it('should bounce player back to ring 0 on failure', () => {
    const player = createPlayer();
    // First, advance past ring 0
    const rings: Ring[] = [
      {
        radius: 80,
        gapAngle: 0,
        gapSize: Math.PI / 3,
        rotationSpeed: 1,
        currentAngle: Math.PI * 1.5 - Math.PI / 6,
      },
      {
        radius: 110,
        gapAngle: 0,
        gapSize: Math.PI / 6,
        rotationSpeed: 1,
        currentAngle: 0, // Not aligned
      },
    ];
    attemptAdvance(player, rings); // Pass ring 0
    expect(player.currentRing).toBe(1);

    const result = attemptAdvance(player, rings); // Fail at ring 1
    expect(result.success).toBe(false);
    expect(result.fell).toBe(true);
    expect(player.currentRing).toBe(0); // Bounced back to center
  });
});

describe('isGameOver', () => {
  it('should return false when falls < maxFalls', () => {
    const player = createPlayer();
    player.falls = 2;
    expect(isGameOver(player)).toBe(false);
  });

  it('should return true when falls >= maxFalls', () => {
    const player = createPlayer();
    player.falls = 3;
    expect(isGameOver(player)).toBe(true);
  });
});

describe('getPlayerRadius', () => {
  it('should return inner radius for player at center', () => {
    const player = createPlayer();
    const rings: Ring[] = [makeRingWithGapAt(0)];
    const radius = getPlayerRadius(player, rings);
    expect(radius).toBe(DEFAULT_CONFIG.innerRadius * 0.5);
  });

  it('should return a position beyond the ring for advanced player', () => {
    const player = createPlayer();
    player.currentRing = 1;
    const rings: Ring[] = [makeRingWithGapAt(0)];
    const radius = getPlayerRadius(player, rings);
    expect(radius).toBeGreaterThan(rings[0].radius);
  });
});
