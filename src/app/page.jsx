'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Terminal, Shield, Mail, Activity, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';
import GridBackground from '@/components/ui/GridBackground';
import GlowOrb from '@/components/ui/GlowOrb';
import Button from '@/components/ui/Button';
import FAQAccordion from '@/components/ui/FAQAccordion';
import MeshGradient from '@/components/ui/MeshGradient';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { useAuth } from '@/hooks/useAuth';


/* ─────────────── Floating Particle Dots ─────────────── */
function FloatingParticles() {
  const particles = useMemo(() => [
    { size: 3, left: '12%', top: '18%', delay: 'animate-float', opacity: 0.25 },
    { size: 2, left: '85%', top: '12%', delay: 'animate-float-delayed', opacity: 0.2 },
    { size: 4, left: '70%', top: '35%', delay: 'animate-float-slow', opacity: 0.15 },
    { size: 2, left: '25%', top: '55%', delay: 'animate-float', opacity: 0.2 },
    { size: 3, left: '90%', top: '60%', delay: 'animate-float-delayed', opacity: 0.18 },
    { size: 2, left: '50%', top: '80%', delay: 'animate-float-slow', opacity: 0.15 },
    { size: 3, left: '8%',  top: '75%', delay: 'animate-float', opacity: 0.22 },
    { size: 2, left: '40%', top: '25%', delay: 'animate-float-delayed', opacity: 0.18 },
  ], []);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className={`absolute rounded-full bg-blue-400 ${p.delay}`}
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            top: p.top,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────── Animated Counter ─────────────── */
function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*                    MAIN COMPONENT                      */
/* ═══════════════════════════════════════════════════════ */

export default function Home() {
  const [email, setEmail] = useState('');
  const [activeRegion, setActiveRegion] = useState('Global');
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { user, signOut } = useAuth();

  const regions = ['Global', 'Americas', 'EMEA', 'APAC'];

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  // Parallax scroll transforms
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.3]);

  const mockNews = useMemo(() => [
    { source: 'TechCrunch', domain: 'TECH', text: 'Scraped: "Gemini 2.0 Flash agentic features released..."' },
    { source: 'Bloomberg', domain: 'FINANCE', text: 'Classified: Sentiment [0.72] positive on stock indices...' },
    { source: 'Reuters', domain: 'POLITICS', text: 'Summarized: Brief, medium, and detailed summaries generated...' },
    { source: 'BBC Sport', domain: 'SPORTS', text: 'Queued: Digest package ready for Resend delivery API...' }
  ], []);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      const log = mockNews[index % mockNews.length];
      const timestamp = new Date().toLocaleTimeString();
      setTerminalLogs(prev => [
        `[${timestamp}] [${log.domain}] ${log.source} - ${log.text}`,
        ...prev.slice(0, 4)
      ]);
      index++;
    }, 2800);
    return () => clearInterval(interval);
  }, [mockNews]);

  const handleSubscribe = useCallback((e) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail('');
      }, 4000);
    }
  }, [email]);

  return (
    <div className="relative min-h-screen flex flex-col bg-brand-dark overflow-x-hidden noise-overlay">
      {/* ───── Background Decoration Wrapper (Clips Bottom/Top Overflow) ───── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <GridBackground />
        <MeshGradient />
        <div className="absolute inset-0 hero-spotlight pointer-events-none z-0" />
        <div className="absolute inset-0 aurora-gradient pointer-events-none z-0" />
        <FloatingParticles />
        <GlowOrb className="-top-40 -left-40" variant="green" />
        <GlowOrb className="top-1/3 -right-40" variant="purple" />
        <GlowOrb className="-bottom-40 left-1/3" variant="blue" />
      </div>

      {/* ───── Navbar ───── */}
      <header className="sticky top-0 z-50 w-full border-b border-brand-border bg-brand-dark/60 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 select-none">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-lime animate-pulse" />
            <span className="font-mono text-lg font-bold tracking-wider text-white">
              AI_NEWS_DIGEST
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-grey">
            <Link href="#features" className="hover:text-white transition-colors">FEATURES</Link>
            <Link href="#terminal" className="hover:text-white transition-colors">TERMINAL_LIVE</Link>
            <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {user ? (
              <>
                <Button href="/sources" variant="ghost" className="hidden lg:flex text-xs font-mono tracking-wider">
                  LIVE_SOURCES
                </Button>
                <Button href="/subscriptions" variant="ghost" className="hidden lg:flex text-xs font-mono tracking-wider">
                  SUBSCRIPTIONS
                </Button>
                <Button href="/history" variant="ghost" className="hidden lg:flex text-xs font-mono tracking-wider">
                  HISTORY
                </Button>
                <Button href="/preferences" variant="ghost" className="hidden lg:flex text-xs font-mono tracking-wider">
                  PREFERENCES
                </Button>
                <Button href="/dashboard" variant="outline" className="text-xs font-mono tracking-wider">
                  DASHBOARD
                </Button>
                <Button onClick={signOut} variant="primary" className="text-xs font-mono tracking-wider px-3.5 py-2">
                  SIGN_OUT
                </Button>
              </>
            ) : (
              <>
                <Button href="/login" variant="ghost" className="hidden sm:flex text-xs font-mono tracking-wider">
                  SIGN_IN
                </Button>
                <Button href="/signup" variant="primary" className="text-xs font-mono tracking-wider px-4 py-2">
                  GET_STARTED
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 pt-16 md:pt-24 pb-20 relative z-10">

        {/* ═══════════ HERO SECTION ═══════════ */}
        <motion.section
          style={{ y: heroY, opacity: heroOpacity }}
          className="text-center max-w-4xl mx-auto mb-20 md:mb-32"
        >
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-border bg-white/[0.02] backdrop-blur-md mb-8 select-none"
          >
            <Activity className="w-3.5 h-3.5 text-brand-lime" />
            <span className="font-mono text-[10px] tracking-widest text-brand-lime uppercase">
              AGENT_CLUSTER // STABLE_RUNNING
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white tracking-tight leading-[1.05] mb-6 uppercase"
          >
            Your Daily News, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-lime via-white to-brand-lime bg-[length:200%_auto] animate-[aurora_6s_linear_infinite]">
              Synthesized by AI
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="text-white/70 text-lg md:text-xl font-normal tracking-tight max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Five autonomous agents <span className="text-white font-medium">scrape, classify, and summarize</span> market-moving news across <span className="text-white font-medium">Finance, Tech, Health, and Politics</span>. Delivered straight to your inbox daily.
          </motion.p>

          {/* Email Subscription Box */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-md mx-auto mb-12"
          >
            <form onSubmit={handleSubscribe} className="relative flex items-center p-1.5 rounded-lg border border-brand-border bg-white/[0.02] backdrop-blur-md focus-within:border-brand-lime/50 focus-within:shadow-[0_0_30px_rgba(195,255,46,0.08)] transition-all duration-500">
              <Mail className="w-5 h-5 text-brand-grey ml-3 pointer-events-none" />
              <input
                type="email"
                placeholder="Enter email to subscribe..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-0 outline-none ring-0 text-sm text-white px-3 py-2.5 placeholder-brand-grey/60"
                required
              />
              <Button type="submit" variant="primary" className="text-xs uppercase whitespace-nowrap tracking-wider">
                {isSubmitted ? 'Subscribed' : 'Initialize'}
              </Button>
            </form>
            <AnimatePresence>
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 text-xs text-brand-lime flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Subscription queued! Verify your inbox for welcome credentials.
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Region Selectors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="flex items-center justify-center gap-3 border-t border-b border-brand-border/60 py-4 max-w-xl mx-auto"
          >
            <span className="font-mono text-[10px] text-brand-grey/60 tracking-wider">INDEX_FILTER:</span>
            <div className="flex gap-2">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setActiveRegion(region)}
                  className={`px-3 py-1 rounded text-xs font-mono transition-all duration-300 border ${
                    activeRegion === region
                      ? 'bg-brand-lime border-brand-lime text-brand-dark font-semibold shadow-[0_0_12px_rgba(195,255,46,0.25)]'
                      : 'bg-white/[0.02] border-brand-border text-brand-grey hover:text-white hover:border-white/20'
                  }`}
                >
                  {region.toUpperCase()}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* ═══════════ LIVE TERMINAL SECTION ═══════════ */}
        <section id="terminal" className="grid lg:grid-cols-12 gap-8 items-center mb-24 md:mb-36">
          <ScrollReveal variant="fade-left" className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 text-brand-lime bg-brand-lime/5 border border-brand-lime/20 px-2.5 py-1 rounded text-[10px] font-mono tracking-wider uppercase">
              <Terminal className="w-3.5 h-3.5" />
              Live Operations Feed
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white leading-tight">
              Observe Scraper & Classifier Flows In Real Time
            </h2>
            <p className="text-brand-grey leading-relaxed text-sm md:text-base">
              The agent cluster continuously processes data feeds from global news channels. Watch the log output to see active article fetches, LLM classifications, and queued digest updates.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-brand-grey">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
                DEDUPLICATION [ON]
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                GEMINI 2.0 FLASH [READY]
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-right" delay={0.15} className="lg:col-span-7">
            <div className="bg-brand-dark-base border border-brand-border rounded-xl p-6 relative overflow-hidden glass-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-brand-border/60 pb-4 mb-4 select-none">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="font-mono text-[10px] tracking-wider text-brand-grey">bash // agent_stream.log</span>
              </div>

              <div className="font-mono text-xs space-y-3.5 min-h-[180px] text-left">
                <AnimatePresence>
                  {terminalLogs.length === 0 ? (
                    <div className="text-brand-grey/50">Listening for agent triggers...</div>
                  ) : (
                    terminalLogs.map((log, i) => (
                      <motion.div
                        key={log}
                        initial={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className={`leading-relaxed break-all ${i === 0 ? 'text-brand-lime' : 'text-brand-grey/70'}`}
                      >
                        {log}
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/[0.05] blur-[50px] pointer-events-none rounded-full" />
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-blue-500/[0.03] blur-[40px] pointer-events-none rounded-full" />
            </div>
          </ScrollReveal>
        </section>

        {/* ═══════════ FEATURES / AGENT PIPELINES ═══════════ */}
        <section id="features" className="mb-24 md:mb-36">
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1 text-brand-lime font-mono text-[10px] tracking-widest uppercase">
              <Cpu className="w-3.5 h-3.5" /> Pipeline Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white mt-3">
              The Agent Pipelines
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', icon: <Cpu className="w-5 h-5 text-brand-lime" />, title: 'Scraper Agent', desc: 'Scrapes targets hourly. Compiles feed data, extracts body text, and enforces MD5 hash validation for deduplication.' },
              { step: '02', icon: <Shield className="w-5 h-5 text-brand-lime" />, title: 'Classifier Agent', desc: 'Integrates Gemini AI to tag categories, extract topics, analyze sentiments, and tag relevant keywords.' },
              { step: '03', icon: <Sparkles className="w-5 h-5 text-brand-lime" />, title: 'Summarizer Agent', desc: 'Generates 3-tier summaries (brief, medium, and comprehensive) alongside key bullet takeaways.' },
              { step: '04', icon: <Mail className="w-5 h-5 text-brand-lime" />, title: 'Dispatch Agent', desc: 'Assembles beautiful HTML digest emails based on user timing preferences, executing Resend deliverability APIs.' },
            ].map((card, i) => (
              <ScrollReveal key={card.step} variant="fade-up" delay={i * 0.1}>
                <FeatureCard {...card} />
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ═══════════ METRICS (Animated Counters) ═══════════ */}
        <ScrollReveal variant="scale">
          <section className="border border-brand-border bg-white/[0.01] rounded-2xl p-8 md:p-12 mb-24 md:mb-36 glass-card relative overflow-hidden">
            <div className="absolute inset-0 aurora-gradient pointer-events-none opacity-60" />
            <div className="absolute inset-0 radial-glow pointer-events-none opacity-40" />
            <div className="grid sm:grid-cols-3 gap-8 text-center relative z-10">
              <div className="space-y-2">
                <span className="font-mono text-[10px] tracking-wider text-brand-grey uppercase">Articles Tracked</span>
                <div className="text-3xl sm:text-5xl font-extrabold text-white">
                  <AnimatedCounter target={4821} suffix=" / Hr" />
                </div>
              </div>
              <div className="space-y-2 border-y sm:border-y-0 sm:border-x border-brand-border/60 py-6 sm:py-0">
                <span className="font-mono text-[10px] tracking-wider text-brand-grey uppercase">LLM Categorization</span>
                <div className="text-3xl sm:text-5xl font-extrabold text-brand-lime">
                  <AnimatedCounter target={99} suffix=".8% Acc" />
                </div>
              </div>
              <div className="space-y-2">
                <span className="font-mono text-[10px] tracking-wider text-brand-grey uppercase">Queue Latency</span>
                <div className="text-3xl sm:text-5xl font-extrabold text-white">
                  &lt;<AnimatedCounter target={8} suffix="" duration={1500} /><span className="text-brand-grey/60">.0</span> Sec
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ═══════════ FAQ SECTION ═══════════ */}
        <section id="faq" className="max-w-3xl mx-auto mb-20 md:mb-32">
          <ScrollReveal className="text-center mb-16">
            <span className="font-mono text-[10px] text-brand-lime tracking-widest uppercase">System Q&A</span>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white mt-2">
              Frequently Answered Questions
            </h2>
          </ScrollReveal>

          <div className="space-y-4 text-left">
            {[
              { q: 'How often do the scraper agents run?', a: 'By default, the scraping engine executes every hour via Vercel cron triggers. It searches your configured RSS feeds and static page list for new articles, automatically filtering duplicates.' },
              { q: 'Can I customize which topics I receive in my daily digest?', a: 'Absolutely. Under your subscription panel, you can choose to enable or disable target categories (Finance, Tech, Sports, etc.). Gemini AI will filter daily roundups dynamically to match your choices.' },
              { q: 'How does the agent prevent duplicate news articles?', a: 'Before processing any article, the Scraper Agent hashes the URL using MD5. The database enforces a unique constraint on this hash, automatically skipping inserts if an article exists.' },
              { q: 'What models are used to summarize the articles?', a: 'We integrate Google Gemini 2.0 Flash to classify and summarize content. It is extremely fast, cost-effective, and generates three granular summary lengths simultaneously.' },
            ].map((faq, i) => (
              <ScrollReveal key={i} variant="fade-up" delay={i * 0.08}>
                <FAQAccordion question={faq.q} answer={faq.a} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      </main>

      {/* ───── Footer ───── */}
      <ScrollReveal variant="fade-up">
        <footer className="border-t border-brand-border bg-transparent py-16 text-brand-grey text-xs">
          <div className="container mx-auto px-4 grid sm:grid-cols-2 md:grid-cols-4 gap-10 text-left mb-12">
            <div>
              <span className="font-mono font-bold text-white tracking-wider block mb-4">SYSTEM</span>
              <ul className="space-y-2.5">
                <li><Link href="/" className="hover:text-white transition-colors">AGENT_CLUSTER</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">METRIC_LOGS</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">SCHEDULING</Link></li>
              </ul>
            </div>
            <div>
              <span className="font-mono font-bold text-white tracking-wider block mb-4">DEVELOPER</span>
              <ul className="space-y-2.5">
                <li><Link href="/" className="hover:text-white transition-colors">PRISMA_SCHEMA</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">GEMINI_SDK</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">RESEND_API</Link></li>
              </ul>
            </div>
            <div>
              <span className="font-mono font-bold text-white tracking-wider block mb-4">RESOURCES</span>
              <ul className="space-y-2.5">
                <li><Link href="/" className="hover:text-white transition-colors">DOCUMENTATION</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">API_ENDPOINTS</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">DEPLOYMENT</Link></li>
              </ul>
            </div>
            <div>
              <span className="font-mono font-bold text-white tracking-wider block mb-4">LEGAL</span>
              <ul className="space-y-2.5">
                <li><Link href="/" className="hover:text-white transition-colors">TERMS_OF_SERVICE</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">PRIVACY_POLICY</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">DATA_COMPLIANCE</Link></li>
              </ul>
            </div>
          </div>

          <div className="container mx-auto px-4 pt-8 border-t border-brand-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-brand-grey/50">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-lime animate-pulse" />
              <span>© 2026 AI_NEWS_DIGEST. ALL SYSTEMS FUNCTIONAL.</span>
            </div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">GITHUB</a>
              <span>/</span>
              <a href="#" className="hover:text-white transition-colors">TELEMETRY</a>
            </div>
          </div>
        </footer>
      </ScrollReveal>
    </div>
  );
}

/* ─────────────── Feature Card ─────────────── */
function FeatureCard({ step, icon, title, desc }) {
  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.3, ease: 'easeOut' } }}
      className="group border border-brand-border bg-white/[0.01] rounded-xl p-6 text-left glass-card relative overflow-hidden transition-all duration-300 hover:border-blue-500/20 hover:shadow-[0_0_40px_rgba(20,80,160,0.08)] h-full"
    >
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="p-2 rounded bg-brand-lime/5 border border-brand-lime/10 group-hover:border-brand-lime/30 transition-colors">
          {icon}
        </div>
        <span className="font-mono text-[10px] tracking-wider text-brand-grey/50">{step}</span>
      </div>
      <h3 className="text-base font-bold uppercase tracking-tight text-white mb-2 relative z-10 group-hover:text-brand-lime transition-colors">
        {title}
      </h3>
      <p className="text-brand-grey leading-relaxed text-xs relative z-10">
        {desc}
      </p>
      {/* Hover glow */}
      <div className="absolute -bottom-4 -right-4 w-28 h-28 bg-blue-500/0 blur-[45px] pointer-events-none rounded-full group-hover:bg-blue-500/[0.06] transition-all duration-500" />
    </motion.div>
  );
}
