'use client';

import { useEffect, useRef } from 'react';

/**
 * Animated flowing mesh gradient background rendered on a canvas.
 * Optimized for performance: smooth time step, pre-computed color stops,
 * and lightweight canvas operations to prevent GPU/CSS lag.
 */
export default function MeshGradient({ className = '' }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let width = 0;
    let height = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    resize();
    window.addEventListener('resize', resize);

    const blobs = [
      {
        cx: 0.35,
        cy: 0.35,
        rx: 0.0008,
        ry: 0.0006,
        r: 450,
        colorCore: 'rgba(195, 255, 46, 0.45)',
        colorMid: 'rgba(195, 255, 46, 0.15)',
        colorEdge: 'rgba(195, 255, 46, 0.04)',
        phase: 0
      },
      {
        cx: 0.55,
        cy: 0.55,
        rx: 0.0006,
        ry: 0.0009,
        r: 480,
        colorCore: 'rgba(168, 85, 247, 0.45)',
        colorMid: 'rgba(168, 85, 247, 0.15)',
        colorEdge: 'rgba(168, 85, 247, 0.04)',
        phase: 2.1
      },
      {
        cx: 0.65,
        cy: 0.4,
        rx: 0.0005,
        ry: 0.0007,
        r: 520,
        colorCore: 'rgba(59, 130, 246, 0.48)',
        colorMid: 'rgba(59, 130, 246, 0.16)',
        colorEdge: 'rgba(59, 130, 246, 0.04)',
        phase: 4.2
      }
    ];

    let t = 0;

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'screen';

      for (let i = 0; i < blobs.length; i++) {
        const blob = blobs[i];
        const x = width * blob.cx + Math.sin(t * blob.rx + blob.phase) * width * 0.2;
        const y = height * blob.cy + Math.cos(t * blob.ry + blob.phase) * height * 0.15;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, blob.r);
        gradient.addColorStop(0, blob.colorCore);
        gradient.addColorStop(0.4, blob.colorMid);
        gradient.addColorStop(0.8, blob.colorEdge);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      t += 1.0;
      animationRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-screen h-screen pointer-events-none z-0 ${className}`}
      style={{ opacity: 0.85 }}
    />
  );
}
