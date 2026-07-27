'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import GridBackground from '@/components/ui/GridBackground';
import GlowOrb from '@/components/ui/GlowOrb';
import MeshGradient from '@/components/ui/MeshGradient';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user, loading: authLoading, signIn } = useAuth();

  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await signIn(email, password);

      if (authError) {
        setError(authError.message);
        setLoading(false);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred. Please make sure your dev server has been restarted.');
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-brand-dark overflow-x-hidden noise-overlay">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <GridBackground />
        <MeshGradient />
        <div className="absolute inset-0 hero-spotlight pointer-events-none z-0" />
        <div className="absolute inset-0 aurora-gradient pointer-events-none z-0" />
        <GlowOrb className="-top-40 -left-40" variant="green" />
        <GlowOrb className="bottom-10 -right-40" variant="purple" />
      </div>

      {/* Navbar Header */}
      <header className="sticky top-0 z-50 w-full border-b border-brand-border bg-brand-dark/60 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 select-none">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-lime animate-pulse" />
            <span className="font-mono text-lg font-bold tracking-wider text-white">
              AI_NEWS_DIGEST
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md w-full space-y-8 bg-white/[0.01] backdrop-blur-xl p-8 rounded-xl border border-brand-border shadow-2xl relative overflow-hidden glass-card"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/[0.05] blur-[50px] pointer-events-none rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-brand-lime/[0.03] blur-[40px] pointer-events-none rounded-full" />
          
          <div className="relative z-10">
            <h2 className="text-center text-3xl font-extrabold text-white uppercase tracking-tight font-sans">
              Welcome back
            </h2>
            <p className="mt-2 text-center text-sm text-brand-grey">
              Sign in to your AI News Digest account
            </p>
          </div>

          <form className="mt-8 space-y-6 relative z-10" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-mono tracking-wider text-white uppercase">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 block w-full px-3.5 py-2.5 border border-brand-border bg-white/[0.02] rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-lime/50 focus:border-brand-lime/50 text-white placeholder-brand-grey/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-mono tracking-wider text-white uppercase">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 block w-full px-3.5 py-2.5 border border-brand-border bg-white/[0.02] rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-lime/50 focus:border-brand-lime/50 text-white placeholder-brand-grey/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full text-xs uppercase tracking-wider mt-6 py-3"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>

            <p className="text-center text-xs text-brand-grey mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-brand-lime hover:text-brand-lime-hover font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
