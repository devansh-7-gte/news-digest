'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Next.js Route Error Boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-4 font-mono select-none">
      <div className="max-w-md w-full border border-red-500/20 bg-[#0A0A0A] p-8 rounded-xl shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500/50" />
        
        <div className="mx-auto w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-6">
          <AlertTriangle className="w-6 h-6 animate-pulse" />
        </div>

        <h2 className="text-xl font-bold uppercase tracking-wider mb-2">
          SYSTEM_ERROR // COMPONENT_FAULT
        </h2>
        
        <p className="text-xs text-neutral-400 mb-6 leading-relaxed font-sans">
          An unexpected runtime exception was encountered in the application thread. The layout boundary has isolated this fault.
        </p>

        {error?.message && (
          <div className="bg-red-500/5 border border-red-500/20 text-red-400/90 text-[11px] p-3 rounded mb-6 text-left overflow-x-auto max-h-32 scrollbar-none">
            {error.message}
          </div>
        )}

        <div className="flex justify-center gap-3">
          <Button
            onClick={() => reset()}
            variant="primary"
            className="text-xs tracking-wider"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RETRY_EXECUTION</span>
          </Button>
          <Button
            href="/"
            variant="secondary"
            className="text-xs tracking-wider"
          >
            <span>RETURN_HOME</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
