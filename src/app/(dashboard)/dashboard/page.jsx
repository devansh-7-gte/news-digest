'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/lib/services/supabase';
import Button from '@/components/ui/Button';
import { 
  Activity, 
  Zap, 
  Newspaper, 
  MailCheck, 
  FileText, 
  ArrowRight, 
  ExternalLink, 
  SearchX,
  Mail,
  Send,
  Check
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

const FALLBACK_ARTICLES = [
  {
    id: 'demo-1',
    title: 'Gemini 2.0 Flash Multi-Agent Architecture Benchmark Released',
    domain: 'technology',
    published_at: new Date().toISOString(),
    url: 'https://techcrunch.com',
    article_summaries: [
      {
        summary_brief: 'Google DeepMind releases benchmarks for Gemini 2.0 Flash demonstrating 4x faster agentic execution and native multi-modal tool calling capability.',
      },
    ],
  },
  {
    id: 'demo-2',
    title: 'Global Tech Indices Rally As AI Chips Production Expands',
    domain: 'finance',
    published_at: new Date().toISOString(),
    url: 'https://bloomberg.com',
    article_summaries: [
      {
        summary_brief: 'Global stock markets recorded sharp gains today following positive revenue guidance and expanded semiconductor manufacturing capacity.',
      },
    ],
  },
  {
    id: 'demo-3',
    title: 'Biotech Breakthrough: mRNA Cancer Vaccine Enters Clinical Phase',
    domain: 'health',
    published_at: new Date().toISOString(),
    url: 'https://reuters.com',
    article_summaries: [
      {
        summary_brief: 'Researchers report promising immune responses in Phase 2 oncology trials utilizing personalized synthetic mRNA sequences.',
      },
    ],
  },
];

function withTimeout(promise, ms = 600) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve({ timeout: true }), ms)),
  ]);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    subscriptions: 0,
    digestsReceived: 0,
    totalArticles: 0,
  });
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [sendingDigest, setSendingDigest] = useState(false);
  const [digestMsg, setDigestMsg] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData(user.id, user.email);
    }
  }, [user]);

  async function fetchDashboardData(userId, email) {
    setLoading(true);
    if (email) setUserEmail(email);
    try {
      const res = await fetch(`/api/dashboard?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats || { subscriptions: 0, digestsReceived: 0, totalArticles: 0 });
        setRecentArticles(data.recentArticles || []);
      }
    } catch (e) {
      console.warn('Dashboard data fetch warning:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendDigestNow() {
    if (!user?.id) return;
    setSendingDigest(true);
    setDigestMsg(null);
    try {
      const res = await fetch('/api/email/send-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setDigestMsg({ type: 'success', text: `✓ Real digest sent to ${data.sentTo}!` });
        // Refresh dashboard stats
        fetchDashboardData(user.id, user.email);
      } else {
        setDigestMsg({ type: 'error', text: data.error || data.detail || 'Failed to dispatch digest' });
      }
    } catch (err) {
      setDigestMsg({ type: 'error', text: 'Network connection error' });
    } finally {
      setSendingDigest(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 border border-brand-border bg-white/[0.01] rounded-xl glass-card">
          <span className="w-3.5 h-3.5 rounded-full bg-brand-lime animate-ping mb-3" />
          <p className="text-xs font-mono tracking-widest text-brand-grey uppercase flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-brand-lime animate-pulse" />
            FETCHING_SYSTEM_METRICS...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Welcome Cyber Banner */}
        <div className="border border-brand-border bg-white/[0.01] rounded-xl p-8 relative overflow-hidden glass-card shadow-2xl">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-brand-border bg-white/[0.02] backdrop-blur-md mb-4">
              <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
              <span className="font-mono text-[10px] tracking-widest text-brand-lime uppercase flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-brand-lime" />
                PORTAL_SESSION // ACTIVE
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase leading-tight font-sans">
              Welcome Back, <span className="text-brand-lime">{userEmail ? userEmail.split('@')[0] : 'Operator'}</span>
            </h1>

            <p className="text-brand-grey text-sm mt-2 leading-relaxed">
              Autonomous scraping and LLM agents are actively indexing market-moving stories. View real-time articles, manage subscriptions, or dispatch your digest below.
            </p>

            {digestMsg && (
              <div className={`mt-4 p-3 rounded border font-mono text-xs flex items-center gap-2 ${
                digestMsg.type === 'success'
                  ? 'bg-brand-lime/10 text-brand-lime border-brand-lime/30'
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}>
                {digestMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <span className="shrink-0 font-bold">✗</span>}
                <span>{digestMsg.text}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-6">
              <Button href="/sources" variant="primary" className="text-xs font-mono tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>LIVE_SOURCES</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <Button href="/subscriptions" variant="secondary" className="text-xs font-mono tracking-wider">
                <Newspaper className="w-3.5 h-3.5" />
                <span>SUBSCRIPTIONS ({stats.subscriptions})</span>
              </Button>
              <Button 
                onClick={handleSendDigestNow}
                disabled={sendingDigest}
                variant="secondary" 
                className="text-xs font-mono tracking-wider border-brand-lime/40 text-brand-lime hover:bg-brand-lime/10"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingDigest ? 'DISPATCHING...' : 'SEND_DIGEST_NOW'}</span>
              </Button>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-blue-500/[0.05] blur-[60px] pointer-events-none rounded-full" />
        </div>

        {/* Cyber Stat Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            title="ACTIVE_SUBSCRIPTIONS"
            value={stats.subscriptions}
            Icon={Newspaper}
            description="Configured news domains"
            href="/subscriptions"
          />
          <StatCard
            title="DIGESTS_DISPATCHED"
            value={stats.digestsReceived}
            Icon={MailCheck}
            description="Delivered newsletter archives"
            href="/history"
          />
          <StatCard
            title="INDEXED_ARTICLES"
            value={stats.totalArticles}
            Icon={Zap}
            description="Real-time parsed stories"
            href="/sources"
          />
        </div>

        {/* Recent Live Feed Section */}
        <div className="border border-brand-border bg-white/[0.01] rounded-xl overflow-hidden glass-card shadow-2xl">
          <div className="px-6 py-5 border-b border-brand-border/60 flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] text-brand-lime tracking-widest uppercase flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-brand-lime" />
                REALTIME_STREAM
              </span>
              <h2 className="text-xl font-bold uppercase tracking-tight text-white mt-0.5">
                Subscribed Feed Headlines
              </h2>
            </div>

            <Button href="/sources" variant="ghost" className="text-xs font-mono tracking-wider">
              <span>VIEW_ALL</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="divide-y divide-brand-border/60">
            {recentArticles.length === 0 ? (
              <div className="px-6 py-16 text-center text-brand-grey font-mono text-xs flex flex-col items-center gap-2">
                <SearchX className="w-8 h-8 text-brand-grey/50" />
                <span>NO_ARTICLES_FOUND // SUBSCRIBE_TO_TOPICS</span>
              </div>
            ) : (
              recentArticles.map((art) => (
                <ArticleRow key={art.id} article={art} />
              ))
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, Icon, description, href }) {
  return (
    <Button href={href} variant="ghost" className="block text-left h-full p-0 border-0 hover:bg-transparent">
      <div className="border border-brand-border bg-white/[0.01] hover:border-brand-lime/40 rounded-xl p-6 transition-all duration-300 glass-card h-full">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[10px] tracking-widest text-brand-grey uppercase hover:text-brand-lime transition-colors">
            {title}
          </span>
          <div className="p-2 bg-white/[0.02] border border-brand-border rounded-lg text-brand-lime">
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-white font-mono">{value}</div>
        <p className="text-xs text-brand-grey/60 mt-1">{description}</p>
      </div>
    </Button>
  );
}

function ArticleRow({ article }) {
  const summary = 
    article.article_summaries?.[0]?.summary_brief || 
    article.article_summaries?.summary_brief || 
    'Summary processing in background...';

  return (
    <div className="p-6 hover:bg-white/[0.02] transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2 py-0.5 rounded border border-brand-lime/30 bg-brand-lime/10 text-brand-lime uppercase text-[10px] font-bold">
            {article.domain}
          </span>
          <span className="text-brand-grey/60">
            {article.published_at ? new Date(article.published_at).toLocaleDateString() : 'Recent'}
          </span>
        </div>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-brand-grey hover:text-white transition-colors flex items-center gap-1"
        >
          <span>SOURCE_LINK</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <h3 className="text-lg font-bold text-white mb-1.5 leading-snug">
        {article.title}
      </h3>
      <p className="text-sm text-brand-grey leading-relaxed line-clamp-2">
        {summary}
      </p>
    </div>
  );
}
