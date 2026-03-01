import type { Ring } from '../types.js';
import {
  DEFAULT_CONFIG,
  MAX_RINGS,
  BASE_RING_COUNT,
  BASE_GAP_SIZE,
  MIN_GAP_SIZE,
  BASE_SPEED_MIN,
  BASE_SPEED_MAX,
  SPEED_LEVEL_SCALE_MIN,
  SPEED_LEVEL_SCALE_MAX,
} from './constants.js';

/**
 * Normalize an angle to [0, 2*PI) range
 */
export function normalizeAngle(angle: number): number {
  const twoPi = Math.PI * 2;
  let result = angle % twoPi;
  if (result < 0) result += twoPi;
  return result;
}

/**
 * Check if the player's radial angle passes through a ring's gap
 */
export function isGapAligned(playerAngle: number, ring: Ring): boolean {
  const normPlayer = normalizeAngle(playerAngle);
  const gapStart = normalizeAngle(ring.currentAngle + ring.gapAngle);
  const gapEnd = normalizeAngle(gapStart + ring.gapSize);

  if (gapStart < gapEnd) {
    return normPlayer >= gapStart && normPlayer <= gapEnd;
  }
  // Wrap-around case
  return normPlayer >= gapStart || normPlayer <= gapEnd;
}

/**
 * Calculate the number of rings for a given level
 */
export function getRingCount(level: number): number {
  return Math.min(BASE_RING_COUNT + Math.floor(level / 2), MAX_RINGS);
}

/**
 * Calculate gap size for a ring at a given index and level.
 * Inner rings get larger gaps, outer rings smaller.
 * Higher levels shrink gaps overall.
 */
export function getGapSize(ringIndex: number, ringCount: number, level: number): number {
  const levelFactor = Math.max(0, 1 - (level - 1) * 0.08);
  const positionFactor = 1 - (ringIndex / ringCount) * 0.4;
  const gap = BASE_GAP_SIZE * levelFactor * positionFactor;
  return Math.max(gap, MIN_GAP_SIZE);
}

/**
 * Calculate rotation speed for a ring at a given index and level.
 * Alternate direction every other ring.
 */
export function getRotationSpeed(ringIndex: number, level: number): number {
  const minSpeed = BASE_SPEED_MIN + (level - 1) * SPEED_LEVEL_SCALE_MIN;
  const maxSpeed = BASE_SPEED_MAX + (level - 1) * SPEED_LEVEL_SCALE_MAX;
  const t = ringIndex / Math.max(1, MAX_RINGS - 1);
  const speed = minSpeed + t * (maxSpeed - minSpeed);
  const direction = ringIndex % 2 === 0 ? 1 : -1;
  return speed * direction;
}

/**
 * Generate rings for a level. Uses a seeded pseudo-random for gap angle placement
 * so levels are reproducible.
 */
export function generateRings(level: number): Ring[] {
  const count = getRingCount(level);
  const rings: Ring[] = [];

  for (let i = 0; i < count; i++) {
    const radius = DEFAULT_CONFIG.innerRadius + (i + 1) * DEFAULT_CONFIG.ringSpacing;
    const gapSize = getGapSize(i, count, level);
    const rotationSpeed = getRotationSpeed(i, level);
    // Distribute gap angles around the ring, offset by level for variety
    const gapAngle = normalizeAngle((i * Math.PI * 2) / count + level * 0.7);

    rings.push({
      radius,
      gapAngle,
      gapSize,
      rotationSpeed,
      currentAngle: 0,
    });
  }

  return rings;
}

/**
 * Rotate all rings by the given time delta (seconds)
 */
export function rotateRings(rings: Ring[], delta: number): void {
  for (const ring of rings) {
    ring.currentAngle = normalizeAngle(ring.currentAngle + ring.rotationSpeed * delta);
  }
}
