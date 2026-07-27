'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Zap, 
  LayoutDashboard, 
  Radio, 
  Newspaper, 
  History, 
  Sliders, 
  LogOut, 
  Menu, 
  X, 
  User 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import GridBackground from '@/components/ui/GridBackground';
import MeshGradient from '@/components/ui/MeshGradient';
import GlowOrb from '@/components/ui/GlowOrb';
import Button from '@/components/ui/Button';

export default function DashboardLayout({ children }) {
  const { user, signOut, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  const navLinks = [
    { name: 'DASHBOARD', href: '/dashboard', Icon: LayoutDashboard },
    { name: 'LIVE_SOURCES', href: '/sources', Icon: Radio },
    { name: 'SUBSCRIPTIONS', href: '/subscriptions', Icon: Newspaper },
    { name: 'HISTORY', href: '/history', Icon: History },
    { name: 'PREFERENCES', href: '/preferences', Icon: Sliders },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark font-mono text-white noise-overlay">
        <div className="flex flex-col items-center gap-3">
          <span className="w-4 h-4 rounded-full bg-brand-lime animate-ping"></span>
          <div className="text-xs tracking-widest text-brand-grey uppercase flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-brand-lime animate-pulse" />
            INITIALIZING_PORTAL // AGENT_SESSION...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-brand-dark text-white font-sans overflow-x-hidden noise-overlay">
      
      {/* Background Decoration Wrapper */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <GridBackground />
        <MeshGradient />
        <div className="absolute inset-0 hero-spotlight pointer-events-none z-0" />
        <div className="absolute inset-0 aurora-gradient pointer-events-none z-0" />
        <GlowOrb className="-top-40 -left-40" variant="green" />
        <GlowOrb className="top-1/3 -right-40" variant="purple" />
        <GlowOrb className="-bottom-40 left-1/3" variant="blue" />
      </div>

      {/* Navbar Header */}
      <header className="sticky top-0 z-50 w-full border-b border-brand-border bg-brand-dark/70 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 select-none">
            <div className="w-8 h-8 rounded-lg bg-brand-lime/10 border border-brand-lime/30 flex items-center justify-center text-brand-lime">
              <Zap className="w-4 h-4" />
            </div>
            <span className="font-mono text-lg font-bold tracking-wider text-white">
              AI_NEWS_DIGEST
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map(({ name, href, Icon }) => {
              const isActive = pathname === href;
              return (
                <Button
                  key={href}
                  href={href}
                  variant={isActive ? 'primary' : 'ghost'}
                  className="text-xs font-mono tracking-wider px-3.5 py-1.5"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{name}</span>
                </Button>
              );
            })}
          </div>

          {/* User Profile & Sign Out */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-brand-border bg-white/[0.02] backdrop-blur-md text-xs font-mono">
              <User className="w-3.5 h-3.5 text-brand-lime" />
              <span className="text-brand-grey truncate max-w-[150px]">
                {user?.email || 'user@newsdigest.io'}
              </span>
            </div>

            <Button
              onClick={handleSignOut}
              variant="outline"
              className="text-xs font-mono tracking-wider px-3.5 py-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>SIGN_OUT</span>
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded border border-brand-border bg-white/[0.02] text-brand-grey hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-brand-dark/95 border-b border-brand-border px-4 pt-2 pb-4 space-y-2 font-mono text-xs">
            {navLinks.map(({ name, href, Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded border ${
                    isActive
                      ? 'bg-brand-lime text-brand-dark font-bold border-brand-lime'
                      : 'bg-white/[0.02] text-brand-grey border-brand-border hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{name}</span>
                </Link>
              );
            })}
            <div className="pt-3 border-t border-brand-border flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-brand-grey truncate max-w-[180px]">
                <User className="w-3.5 h-3.5 text-brand-lime" />
                <span className="truncate">{user?.email}</span>
              </div>
              <Button onClick={handleSignOut} variant="primary" className="text-xs px-3 py-1">
                SIGN_OUT
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-border bg-transparent py-8 text-brand-grey text-xs font-mono relative z-10">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-lime animate-pulse" />
            <span>AI_NEWS_DIGEST // ALL SYSTEMS OPERATIONAL</span>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard" className="hover:text-white transition-colors">DASHBOARD</Link>
            <Link href="/sources" className="hover:text-white transition-colors">LIVE_SOURCES</Link>
            <Link href="/subscriptions" className="hover:text-white transition-colors">SUBSCRIPTIONS</Link>
            <Link href="/history" className="hover:text-white transition-colors">HISTORY</Link>
            <Link href="/preferences" className="hover:text-white transition-colors">PREFERENCES</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
