import type { Player, Ring } from '../types.js';
import { PLAYER_ANGLE, DEFAULT_CONFIG } from './constants.js';
import { isGapAligned } from './rings.js';

/**
 * Create a new player at the center
 */
export function createPlayer(): Player {
  return {
    angle: PLAYER_ANGLE,
    currentRing: 0,
    falls: 0,
  };
}

/**
 * Result of an advance attempt
 */
export interface AdvanceResult {
  success: boolean;
  /** Player fell back to center */
  fell: boolean;
  /** Player passed the last ring and completed the level */
  levelComplete: boolean;
}

/**
 * Attempt to advance the player one ring outward.
 * Returns the result of the attempt.
 */
export function attemptAdvance(player: Player, rings: Ring[]): AdvanceResult {
  const nextRingIndex = player.currentRing;

  // Already past all rings (shouldn't happen, but guard)
  if (nextRingIndex >= rings.length) {
    return { success: true, fell: false, levelComplete: true };
  }

  const targetRing = rings[nextRingIndex];
  const aligned = isGapAligned(player.angle, targetRing);

  if (aligned) {
    player.currentRing = nextRingIndex + 1;

    // Check if player cleared all rings
    if (player.currentRing > rings.length) {
      player.currentRing = rings.length;
    }

    const levelComplete = player.currentRing >= rings.length;
    return { success: true, fell: false, levelComplete };
  }

  // Bounce back
  const wasOnRingZero = player.currentRing === 0;
  player.currentRing = 0;

  // Only count as a fall if they actually moved back to center
  // Being at center and hitting ring 0 wall still counts as a fall
  player.falls += 1;

  return {
    success: false,
    fell: true,
    levelComplete: false,
  };
}

/**
 * Check if the player has exceeded the max falls
 */
export function isGameOver(player: Player): boolean {
  return player.falls >= DEFAULT_CONFIG.maxFalls;
}

/**
 * Get the pixel radius for the player's current position
 */
export function getPlayerRadius(player: Player, rings: Ring[]): number {
  if (player.currentRing === 0) {
    return DEFAULT_CONFIG.innerRadius * 0.5;
  }
  if (player.currentRing > rings.length) {
    return rings[rings.length - 1].radius + DEFAULT_CONFIG.ringSpacing;
  }
  // Player sits just outside the ring they passed through
  return rings[player.currentRing - 1].radius + DEFAULT_CONFIG.ringSpacing * 0.3;
}
