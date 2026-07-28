import React from 'react';

/**
 * SwiftIQ Logo Icon & Typography Component using the official provided logo image.
 * Styled with enhanced glow and enlarged scale for maximum visibility.
 */
export function SwiftIQIcon({ className = "w-12 h-12", glow = true }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      {glow && (
        <div className="absolute -inset-1 bg-[#C3FF2E]/30 rounded-xl blur-md pointer-events-none animate-pulse" />
      )}
      <div className="w-full h-full rounded-xl bg-black border-2 border-brand-lime/50 flex items-center justify-center p-1 shadow-[0_0_20px_rgba(195,255,46,0.25)] relative z-10 overflow-hidden group-hover:border-brand-lime transition-all duration-300">
        <img src="/logo.png" alt="SwiftIQ Logo" className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300" />
      </div>
    </div>
  );
}

export function SwiftIQLogo({ iconSize = "w-11 h-11", textSize = "text-2xl", showBadge = false }) {
  return (
    <div className="flex items-center gap-3 select-none group">
      <SwiftIQIcon className={iconSize} />
      <div className="flex flex-col">
        <span className={`font-sans ${textSize} font-extrabold tracking-tight text-white group-hover:text-brand-lime transition-colors leading-none flex items-center gap-1`}>
          Swift<span className="text-brand-lime">IQ</span>
        </span>
        {showBadge && (
          <span className="font-mono text-[9px] tracking-widest text-brand-lime/80 uppercase mt-1">
            AI_INTELLIGENCE // v1.0
          </span>
        )}
      </div>
    </div>
  );
}

export default SwiftIQLogo;
