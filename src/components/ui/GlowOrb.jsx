'use client';

/**
 * Renders a lightweight, GPU-optimized glow orb background element.
 * Uses CSS transforms and opacity to prevent layout/style crash in browser.
 */
export default function GlowOrb({ className = '', variant = 'green' }) {
  const glowClass = 
    variant === 'green' ? 'radial-glow-green' :
    variant === 'purple' ? 'radial-glow-purple' :
    'radial-glow-blue';
  
  return (
    <div
      className={`absolute w-[350px] md:w-[500px] h-[350px] md:h-[500px] pointer-events-none z-0 rounded-full blur-[60px] opacity-40 will-change-transform ${glowClass} ${className}`}
    />
  );
}
