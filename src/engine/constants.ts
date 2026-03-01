import type { GameConfig } from '../types.js';

export const DEFAULT_CONFIG: GameConfig = {
  canvasWidth: 600,
  canvasHeight: 600,
  centerX: 300,
  centerY: 300,
  innerRadius: 50,
  ringSpacing: 35,
  playerRadius: 8,
  ringLineWidth: 3,
  maxFalls: 3,
  animationDuration: 150,
};

/** Player's fixed radial angle: straight up */
export const PLAYER_ANGLE = -Math.PI / 2;

/** Max number of rings per level */
export const MAX_RINGS = 10;

/** Base ring count at level 1 */
export const BASE_RING_COUNT = 4;

/** Base gap size (radians) at level 1 */
export const BASE_GAP_SIZE = Math.PI / 3;

/** Minimum gap size (radians) */
export const MIN_GAP_SIZE = Math.PI / 6;

/** Base rotation speed range */
export const BASE_SPEED_MIN = 0.5;
export const BASE_SPEED_MAX = 1.5;

/** Speed scaling per level */
export const SPEED_LEVEL_SCALE_MIN = 0.1;
export const SPEED_LEVEL_SCALE_MAX = 0.2;
