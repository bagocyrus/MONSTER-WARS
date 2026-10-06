import React, { useRef, useEffect } from 'react';
import { GameEngine } from '../engine/gameEngine';
import { PixelRenderer } from '../engine/pixelRenderer';
import { LANE_WIDTH } from '../data/gameData';

interface GameCanvasProps {
  engine: GameEngine;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ engine }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);
  const startXRef = useRef(0);
  const startYRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const renderLoop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Update Engine
      engine.update(dt);

      // Match canvas dimensions to container
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const targetW = Math.floor(rect.width);
        const targetH = Math.floor(rect.height);

        if (canvas.width !== targetW * dpr || canvas.height !== targetH * dpr) {
          canvas.width = targetW * dpr;
          canvas.height = targetH * dpr;
        }

        ctx.save();
        ctx.scale(dpr, dpr);

        // Render Frame
        PixelRenderer.render(
          ctx,
          engine.level.world,
          engine.cameraX,
          targetW,
          targetH,
          engine.playerCastle,
          engine.enemyCastle,
          engine.units,
          engine.projectiles,
          engine.particles,
          engine.floatingTexts,
          engine.weatherParticles,
          engine.gameTime,
          engine.screenShakeX,
          engine.screenShakeY,
          engine.lightningFlashAlpha,
          engine.selectedUnitId
        );

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [engine]);

  // Touch & Mouse Drag Camera Panning & Unit Inspection
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastMouseXRef.current = e.clientX;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseXRef.current;
    lastMouseXRef.current = e.clientX;

    // Pan camera across the lane (clamped)
    engine.cameraX = Math.max(250, Math.min(LANE_WIDTH - 250, engine.cameraX - dx * 1.5));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      const dx = Math.abs(e.clientX - startXRef.current);
      const dy = Math.abs(e.clientY - startYRef.current);

      // If click/tap was concise (not a camera drag pan), select unit at click location
      if (dx < 8 && dy < 8 && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const scale = Math.min(rect.width / 960, rect.height / 450);
        const renderScale = Math.max(0.6, Math.min(1.8, scale));
        const offsetX = rect.width / 2 - engine.cameraX * renderScale;
        const offsetY = Math.max(0, (rect.height - 450 * renderScale) / 2);

        const laneX = (clickX - offsetX) / renderScale;
        const laneY = (clickY - offsetY) / renderScale;

        engine.selectUnitAt(laneX, laneY);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};
