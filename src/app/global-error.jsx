'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Global Error Boundary:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#050505] text-white min-h-screen flex items-center justify-center p-4 font-mono select-none">
        <div className="max-w-md w-full border border-red-500/20 bg-[#0A0A0A] p-8 rounded-xl shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500/50" />
          
          <div className="mx-auto w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-6">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>

          <h2 className="text-xl font-bold uppercase tracking-wider mb-2">
            GLOBAL_SYSTEM_ERROR
          </h2>
          
          <p className="text-xs text-neutral-400 mb-6 leading-relaxed font-sans">
            A critical error occurred in the global root layout shell.
          </p>

          {error?.message && (
            <div className="bg-red-500/5 border border-red-500/20 text-red-400/90 text-[11px] p-3 rounded mb-6 text-left overflow-x-auto max-h-32 scrollbar-none">
              {error.message}
            </div>
          )}

          <div className="flex justify-center">
            <Button
              onClick={() => reset()}
              variant="primary"
              className="text-xs tracking-wider"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>RELOAD_ROOT</span>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
