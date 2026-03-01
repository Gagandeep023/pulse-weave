import { describe, it, expect } from 'vitest';
import {
  normalizeAngle,
  isGapAligned,
  getRingCount,
  getGapSize,
  getRotationSpeed,
  generateRings,
  rotateRings,
} from '../src/engine/rings.js';
import { BASE_RING_COUNT, MAX_RINGS, MIN_GAP_SIZE, BASE_GAP_SIZE } from '../src/engine/constants.js';
import type { Ring } from '../src/types.js';

describe('normalizeAngle', () => {
  it('should keep angles in [0, 2PI) range', () => {
    expect(normalizeAngle(0)).toBeCloseTo(0);
    expect(normalizeAngle(Math.PI)).toBeCloseTo(Math.PI);
    expect(normalizeAngle(Math.PI * 2)).toBeCloseTo(0);
    expect(normalizeAngle(Math.PI * 3)).toBeCloseTo(Math.PI);
  });

  it('should handle negative angles', () => {
    expect(normalizeAngle(-Math.PI / 2)).toBeCloseTo(Math.PI * 1.5);
    expect(normalizeAngle(-Math.PI)).toBeCloseTo(Math.PI);
  });
});

describe('getRingCount', () => {
  it('should return BASE_RING_COUNT for level 1', () => {
    expect(getRingCount(1)).toBe(BASE_RING_COUNT);
  });

  it('should increase ring count with level', () => {
    expect(getRingCount(3)).toBe(BASE_RING_COUNT + 1);
    expect(getRingCount(5)).toBe(BASE_RING_COUNT + 2);
  });

  it('should cap at MAX_RINGS', () => {
    expect(getRingCount(100)).toBe(MAX_RINGS);
  });
});

describe('getGapSize', () => {
  it('should start near BASE_GAP_SIZE at level 1 for inner rings', () => {
    const gap = getGapSize(0, 4, 1);
    expect(gap).toBeCloseTo(BASE_GAP_SIZE, 1);
  });

  it('should decrease gap size with higher levels', () => {
    const gapLevel1 = getGapSize(0, 4, 1);
    const gapLevel5 = getGapSize(0, 4, 5);
    expect(gapLevel5).toBeLessThan(gapLevel1);
  });

  it('should not go below MIN_GAP_SIZE', () => {
    const gap = getGapSize(9, 10, 50);
    expect(gap).toBeGreaterThanOrEqual(MIN_GAP_SIZE);
  });

  it('should give outer rings smaller gaps than inner rings', () => {
    const innerGap = getGapSize(0, 6, 1);
    const outerGap = getGapSize(5, 6, 1);
    expect(outerGap).toBeLessThan(innerGap);
  });
});

describe('getRotationSpeed', () => {
  it('should increase speed with higher levels', () => {
    const speedL1 = Math.abs(getRotationSpeed(0, 1));
    const speedL5 = Math.abs(getRotationSpeed(0, 5));
    expect(speedL5).toBeGreaterThan(speedL1);
  });

  it('should alternate direction for even/odd ring indices', () => {
    const speed0 = getRotationSpeed(0, 1);
    const speed1 = getRotationSpeed(1, 1);
    expect(speed0).toBeGreaterThan(0);
    expect(speed1).toBeLessThan(0);
  });
});

describe('generateRings', () => {
  it('should generate the correct number of rings for level 1', () => {
    const rings = generateRings(1);
    expect(rings).toHaveLength(BASE_RING_COUNT);
  });

  it('should generate more rings at higher levels', () => {
    const ringsL1 = generateRings(1);
    const ringsL5 = generateRings(5);
    expect(ringsL5.length).toBeGreaterThan(ringsL1.length);
  });

  it('should have increasing radii', () => {
    const rings = generateRings(1);
    for (let i = 1; i < rings.length; i++) {
      expect(rings[i].radius).toBeGreaterThan(rings[i - 1].radius);
    }
  });

  it('should initialize currentAngle to 0', () => {
    const rings = generateRings(1);
    for (const ring of rings) {
      expect(ring.currentAngle).toBe(0);
    }
  });
});

describe('rotateRings', () => {
  it('should update ring angles based on speed and delta', () => {
    const rings: Ring[] = [
      { radius: 80, gapAngle: 0, gapSize: Math.PI / 3, rotationSpeed: 1, currentAngle: 0 },
    ];
    rotateRings(rings, 1.0);
    expect(rings[0].currentAngle).toBeCloseTo(1.0);
  });

  it('should rotate in both directions', () => {
    const rings: Ring[] = [
      { radius: 80, gapAngle: 0, gapSize: Math.PI / 3, rotationSpeed: 1, currentAngle: 0 },
      { radius: 110, gapAngle: 0, gapSize: Math.PI / 3, rotationSpeed: -1, currentAngle: Math.PI },
    ];
    rotateRings(rings, 0.5);
    expect(rings[0].currentAngle).toBeCloseTo(0.5);
    // -1 * 0.5 + PI = PI - 0.5, normalized
    expect(rings[1].currentAngle).toBeCloseTo(normalizeAngle(Math.PI - 0.5));
  });

  it('should wrap angles correctly', () => {
    const rings: Ring[] = [
      { radius: 80, gapAngle: 0, gapSize: Math.PI / 3, rotationSpeed: 2, currentAngle: Math.PI * 1.9 },
    ];
    rotateRings(rings, 0.5);
    const expected = normalizeAngle(Math.PI * 1.9 + 1.0);
    expect(rings[0].currentAngle).toBeCloseTo(expected);
  });
});

describe('isGapAligned', () => {
  it('should return true when player is within the gap', () => {
    const ring: Ring = {
      radius: 80,
      gapAngle: 0,
      gapSize: Math.PI / 3,
      rotationSpeed: 1,
      currentAngle: Math.PI * 1.5, // Gap at 1.5PI, player at 1.5PI (-PI/2 normalized)
    };
    const playerAngle = -Math.PI / 2; // = 1.5*PI normalized
    expect(isGapAligned(playerAngle, ring)).toBe(true);
  });

  it('should return false when player is outside the gap', () => {
    const ring: Ring = {
      radius: 80,
      gapAngle: 0,
      gapSize: Math.PI / 6,
      rotationSpeed: 1,
      currentAngle: 0, // Gap at 0, player at 1.5PI
    };
    const playerAngle = -Math.PI / 2;
    expect(isGapAligned(playerAngle, ring)).toBe(false);
  });

  it('should handle gap wrapping around 2PI', () => {
    const ring: Ring = {
      radius: 80,
      gapAngle: 0,
      gapSize: Math.PI / 3,
      rotationSpeed: 1,
      currentAngle: Math.PI * 1.9, // Gap starts at 1.9PI, extends past 2PI
    };
    // Player at a small positive angle (within the wrapped portion)
    const playerAngle = 0.05;
    expect(isGapAligned(playerAngle, ring)).toBe(true);
  });
});
