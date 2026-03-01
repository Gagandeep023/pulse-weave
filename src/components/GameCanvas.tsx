import React, { useRef, useEffect, useCallback } from 'react';
import type { GameState } from '../types.js';
import { DEFAULT_CONFIG, PLAYER_ANGLE } from '../engine/constants.js';
import { normalizeAngle } from '../engine/rings.js';

interface GameCanvasProps {
  state: GameState;
  onTap: () => void;
}

/**
 * Lerp between two values
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/**
 * Get the pixel radius for a ring index
 */
function getRingPixelRadius(ringIndex: number, rings: { radius: number }[]): number {
  if (ringIndex <= 0) {
    return DEFAULT_CONFIG.innerRadius * 0.5;
  }
  if (ringIndex > rings.length) {
    return rings[rings.length - 1].radius + DEFAULT_CONFIG.ringSpacing;
  }
  // Player sits between the ring they passed and the next
  return rings[ringIndex - 1].radius + DEFAULT_CONFIG.ringSpacing * 0.3;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ state, onTap }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { centerX, centerY, playerRadius, ringLineWidth } = DEFAULT_CONFIG;
    const { rings, player } = state;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw subtle radial line (player's path)
    ctx.strokeStyle = 'rgba(100, 255, 218, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    const lineEndRadius = rings.length > 0
      ? rings[rings.length - 1].radius + DEFAULT_CONFIG.ringSpacing * 2
      : DEFAULT_CONFIG.innerRadius * 3;
    ctx.lineTo(
      centerX + Math.cos(PLAYER_ANGLE) * lineEndRadius,
      centerY + Math.sin(PLAYER_ANGLE) * lineEndRadius
    );
    ctx.stroke();

    // Draw center dot
    ctx.fillStyle = 'rgba(100, 255, 218, 0.15)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw rings
    for (let i = 0; i < rings.length; i++) {
      const ring = rings[i];
      const isNextRing = i === player.currentRing;
      const isPlayerRing = i === player.currentRing - 1;

      // Ring color: inner rings dimmer, outer brighter
      const brightness = 40 + (i / rings.length) * 60;
      let strokeColor = `rgb(${brightness}, ${brightness}, ${brightness + 10})`;
      let lineWidth = ringLineWidth;
      let glowSize = 0;

      if (isNextRing) {
        strokeColor = 'rgba(100, 255, 218, 0.6)';
        lineWidth = ringLineWidth + 1;
        glowSize = 8;
      } else if (isPlayerRing) {
        strokeColor = 'rgba(100, 255, 218, 0.35)';
        glowSize = 4;
      }

      // Calculate gap positions
      const gapStart = normalizeAngle(ring.currentAngle + ring.gapAngle);
      const gapEnd = normalizeAngle(gapStart + ring.gapSize);

      // Draw glow
      if (glowSize > 0) {
        ctx.save();
        ctx.shadowColor = '#64ffda';
        ctx.shadowBlur = glowSize;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        if (gapStart < gapEnd) {
          ctx.arc(centerX, centerY, ring.radius, gapEnd, gapStart + Math.PI * 2);
        } else {
          ctx.arc(centerX, centerY, ring.radius, gapEnd, gapStart);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Draw ring arc (skipping the gap)
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      if (gapStart < gapEnd) {
        // Draw from gapEnd around to gapStart
        ctx.arc(centerX, centerY, ring.radius, gapEnd, gapStart + Math.PI * 2);
      } else {
        // Wrap-around: draw from gapEnd to gapStart
        ctx.arc(centerX, centerY, ring.radius, gapEnd, gapStart);
      }
      ctx.stroke();

      // Gap edge glow when gap is near player's radial line
      const playerNorm = normalizeAngle(PLAYER_ANGLE);
      const distToGapStart = Math.abs(normalizeAngle(gapStart - playerNorm));
      const distToGapEnd = Math.abs(normalizeAngle(gapEnd - playerNorm));
      const proximity = Math.min(distToGapStart, distToGapEnd,
        Math.abs(Math.PI * 2 - distToGapStart),
        Math.abs(Math.PI * 2 - distToGapEnd));

      if (proximity < Math.PI / 4 && isNextRing) {
        const glowAlpha = (1 - proximity / (Math.PI / 4)) * 0.5;
        ctx.fillStyle = `rgba(100, 255, 218, ${glowAlpha})`;

        // Glow at gap start edge
        const sx = centerX + Math.cos(gapStart) * ring.radius;
        const sy = centerY + Math.sin(gapStart) * ring.radius;
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fill();

        // Glow at gap end edge
        const ex = centerX + Math.cos(gapEnd) * ring.radius;
        const ey = centerY + Math.sin(gapEnd) * ring.radius;
        ctx.beginPath();
        ctx.arc(ex, ey, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Calculate player visual position (with animation)
    let playerVisualRadius: number;
    if (state.isBouncing || state.isAdvancing) {
      const fromRadius = getRingPixelRadius(state.animationFromRing, rings);
      const toRadius = getRingPixelRadius(state.animationToRing, rings);
      playerVisualRadius = lerp(fromRadius, toRadius, state.animationProgress);
    } else {
      playerVisualRadius = getRingPixelRadius(player.currentRing, rings);
    }

    const playerX = centerX + Math.cos(PLAYER_ANGLE) * playerVisualRadius;
    const playerY = centerY + Math.sin(PLAYER_ANGLE) * playerVisualRadius;

    // Player trail (subtle)
    if (state.isAdvancing && state.animationProgress > 0) {
      const trailFromRadius = getRingPixelRadius(state.animationFromRing, rings);
      const trailLength = 3;
      for (let t = 0; t < trailLength; t++) {
        const trailProgress = Math.max(0, state.animationProgress - t * 0.1);
        const trailRadius = lerp(trailFromRadius, playerVisualRadius, trailProgress);
        const tx = centerX + Math.cos(PLAYER_ANGLE) * trailRadius;
        const ty = centerY + Math.sin(PLAYER_ANGLE) * trailRadius;
        const alpha = 0.3 * (1 - t / trailLength);
        ctx.fillStyle = `rgba(100, 255, 218, ${alpha})`;
        ctx.beginPath();
        ctx.arc(tx, ty, playerRadius * (1 - t * 0.2), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Bounce flash effect
    if (state.isBouncing && state.animationProgress < 0.3) {
      const flashAlpha = (1 - state.animationProgress / 0.3) * 0.4;
      ctx.fillStyle = `rgba(255, 80, 80, ${flashAlpha})`;
      ctx.beginPath();
      ctx.arc(playerX, playerY, playerRadius * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Player dot with glow
    ctx.save();
    ctx.shadowColor = '#64ffda';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#64ffda';
    ctx.beginPath();
    ctx.arc(playerX, playerY, playerRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Inner bright core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(playerX, playerY, playerRadius * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }, [state]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={DEFAULT_CONFIG.canvasWidth}
      height={DEFAULT_CONFIG.canvasHeight}
      className="pw-canvas"
      onClick={onTap}
      onTouchStart={(e) => {
        e.preventDefault();
        onTap();
      }}
    />
  );
};
