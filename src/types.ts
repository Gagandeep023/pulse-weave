/** A single rotating ring with a gap */
export interface Ring {
  /** Distance from center in pixels */
  radius: number;
  /** Angle offset of the gap relative to ring's current rotation (radians) */
  gapAngle: number;
  /** Angular size of the gap (radians) */
  gapSize: number;
  /** Rotation speed in radians per second (negative = clockwise) */
  rotationSpeed: number;
  /** Current rotation angle (radians), updated each tick */
  currentAngle: number;
}

/** Player state */
export interface Player {
  /** Fixed radial angle the player travels along (radians) */
  angle: number;
  /** Current ring index: 0 = center, rings.length = past outermost */
  currentRing: number;
  /** Number of times bounced back to center this level */
  falls: number;
}

/** Game phase */
export type GamePhase = 'rules' | 'playing' | 'levelComplete' | 'over';

/** Full game state */
export interface GameState {
  phase: GamePhase;
  level: number;
  rings: Ring[];
  player: Player;
  score: number;
  highScore: number;
  /** Timestamp of last advance attempt for animation */
  lastAdvanceTime: number;
  /** Whether the player is currently animating a bounce */
  isBouncing: boolean;
  /** Whether the player is currently animating an advance */
  isAdvancing: boolean;
  /** Animation progress 0-1 for movement transitions */
  animationProgress: number;
  /** Source ring for animation */
  animationFromRing: number;
  /** Target ring for animation */
  animationToRing: number;
}

/** Configuration constants */
export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  centerX: number;
  centerY: number;
  innerRadius: number;
  ringSpacing: number;
  playerRadius: number;
  ringLineWidth: number;
  maxFalls: number;
  animationDuration: number;
}
