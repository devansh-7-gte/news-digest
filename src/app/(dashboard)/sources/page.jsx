'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/lib/services/supabase';
import Button from '@/components/ui/Button';
import { 
  Globe, 
  Laptop, 
  DollarSign, 
  Activity, 
  Landmark, 
  Trophy, 
  Search, 
  Radio, 
  Zap, 
  ExternalLink, 
  SearchX, 
  X, 
  BookOpen, 
  Layers, 
  Lightbulb 
} from 'lucide-react';

const DOMAINS = [
  { id: 'all', name: 'ALL_NEWS', Icon: Globe },
  { id: 'technology', name: 'TECH', Icon: Laptop },
  { id: 'finance', name: 'FINANCE', Icon: DollarSign },
  { id: 'health', name: 'HEALTH', Icon: Activity },
  { id: 'politics', name: 'POLITICS', Icon: Landmark },
  { id: 'sports', name: 'SPORTS', Icon: Trophy },
];

export default function SourcesPage() {
  const [articles, setArticles] = useState([]);
  const [newsSources, setNewsSources] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeModalArticle, setActiveModalArticle] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedDomain]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/sources?domain=${selectedDomain}`);
      if (res.ok) {
        const data = await res.json();
        setNewsSources(data.newsSources || []);
        setArticles(data.articles || []);
      }
    } catch (e) {
      console.warn('Error fetching sources:', e);
    } finally {
      setLoading(false);
    }
  }

  const filteredArticles = articles.filter((art) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      art.title?.toLowerCase().includes(q) ||
      art.domain?.toLowerCase().includes(q) ||
      art.keywords?.some((k) => k.toLowerCase().includes(q))
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border/60 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-brand-border bg-white/[0.02]">
              <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
              <span className="font-mono text-[10px] tracking-widest text-brand-lime uppercase flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-brand-lime" />
                REALTIME_INDEX // ENGINE_LIVE
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight uppercase mt-2">
              Live Sources & AI Summaries
            </h1>
            <p className="text-brand-grey text-sm mt-1">
              Scraped feeds, LLM sentiment classifications, and multi-tier summary cards.
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-80 relative">
            <input
              type="text"
              placeholder="Search headline, keyword, domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.02] border border-brand-border text-white placeholder-brand-grey/50 font-mono text-xs rounded-lg pl-9 pr-4 py-3 focus:outline-none focus:border-brand-lime/50 transition-all"
            />
            <Search className="w-4 h-4 text-brand-grey absolute left-3 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Active Sources Pulse Bar */}
        {newsSources.length > 0 && (
          <div className="border border-brand-border bg-white/[0.01] rounded-xl p-5 glass-card font-mono text-xs">
            <div className="text-[10px] tracking-widest uppercase text-brand-grey mb-3 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-brand-lime" />
              <span>ACTIVE_NEWS_SOURCES ({newsSources.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {newsSources.map((src) => (
                <div
                  key={src.id}
                  className="bg-white/[0.02] border border-brand-border px-3 py-1.5 rounded flex items-center gap-2"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${src.is_active ? 'bg-brand-lime animate-pulse' : 'bg-amber-400'}`} />
                  <span className="text-white font-bold">{src.name}</span>
                  <span className="text-brand-grey uppercase text-[10px]">[{src.domain}]</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Domain Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono text-xs">
          {DOMAINS.map(({ id, name, Icon }) => {
            const isActive = selectedDomain === id;
            return (
              <button
                key={id}
                onClick={() => setSelectedDomain(id)}
                className={`px-4 py-2 rounded border whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-brand-lime text-brand-dark font-bold border-brand-lime shadow-[0_0_15px_rgba(195,255,46,0.15)]'
                    : 'bg-white/[0.02] text-brand-grey border-brand-border hover:text-white hover:border-white/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{name}</span>
              </button>
            );
          })}
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 border border-brand-border bg-white/[0.01] rounded-xl glass-card font-mono text-xs">
            <span className="w-3 h-3 rounded-full bg-brand-lime animate-ping mb-3" />
            <p className="text-brand-grey flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-brand-lime animate-pulse" />
              STREAMING_ARTICLES...
            </p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-20 border border-brand-border bg-white/[0.01] rounded-xl glass-card font-mono text-xs text-brand-grey flex flex-col items-center gap-2">
            <SearchX className="w-8 h-8 text-brand-grey/50" />
            <h3 className="text-sm font-bold text-white uppercase">No stories found</h3>
            <p className="mt-1">Try clearing your search term or switching domain tabs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((art) => (
              <ArticleCard
                key={art.id}
                article={art}
                onOpenSummary={() => setActiveModalArticle(art)}
              />
            ))}
          </div>
        )}

        {/* Quick Summary Modal */}
        {activeModalArticle && (
          <SummaryModal
            article={activeModalArticle}
            onClose={() => setActiveModalArticle(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function ArticleCard({ article, onOpenSummary }) {
  const summaryBrief = article.article_summaries?.[0]?.summary_brief || 'Summary processing in background...';
  const sentiment = article.sentiment !== null ? parseFloat(article.sentiment) : 0.5;

  let sentimentTag = 'SENTIMENT // NEUTRAL';
  let sentimentStyle = 'text-brand-grey border-brand-border';

  if (sentiment > 0.6) {
    sentimentTag = 'SENTIMENT // POSITIVE';
    sentimentStyle = 'text-brand-lime border-brand-lime/30 bg-brand-lime/10';
  } else if (sentiment < 0.4) {
    sentimentTag = 'SENTIMENT // NEGATIVE';
    sentimentStyle = 'text-red-400 border-red-500/30 bg-red-500/10';
  }

  return (
    <div className="border border-brand-border bg-white/[0.01] hover:border-brand-border/90 rounded-xl p-6 flex flex-col justify-between glass-card transition-all duration-300">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3 font-mono text-[10px]">
          <span className="px-2 py-0.5 rounded border border-brand-border uppercase text-white font-bold">
            {article.domain}
          </span>
          <span className={`px-2 py-0.5 rounded border ${sentimentStyle}`}>
            {sentimentTag}
          </span>
        </div>

        <h3 className="text-base font-bold text-white mb-2 leading-snug line-clamp-2">
          {article.title}
        </h3>

        <p className="text-xs text-brand-grey line-clamp-3 mb-4 leading-relaxed">
          {summaryBrief}
        </p>

        {article.keywords && article.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4 font-mono text-[10px]">
            {article.keywords.slice(0, 3).map((kw, i) => (
              <span key={i} className="text-brand-grey/70 bg-white/[0.02] border border-brand-border px-2 py-0.5 rounded">
                #{kw}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between font-mono text-xs">
        <button
          onClick={onOpenSummary}
          className="text-brand-lime hover:text-brand-lime-hover font-bold flex items-center gap-1.5"
        >
          <Zap className="w-3.5 h-3.5 text-brand-lime" />
          <span>AI_SUMMARY</span>
        </button>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-grey hover:text-white transition-colors flex items-center gap-1"
        >
          <span>SOURCE</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

function SummaryModal({ article, onClose }) {
  const summaryObj = article.article_summaries?.[0] || {};

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <div className="border border-brand-border bg-brand-dark rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col glass-card shadow-2xl">
        
        <div className="p-6 border-b border-brand-border flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1.5 font-mono text-xs">
              <span className="px-2 py-0.5 rounded bg-brand-lime/10 border border-brand-lime/30 text-brand-lime font-bold uppercase">
                {article.domain}
              </span>
              <span className="text-brand-grey">
                {article.published_at ? new Date(article.published_at).toLocaleDateString() : 'Recent'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white leading-tight uppercase font-sans">{article.title}</h2>
          </div>
          <button onClick={onClose} className="text-brand-grey hover:text-white font-mono p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-xs font-mono leading-relaxed text-brand-grey">
          <div>
            <div className="text-[10px] tracking-widest text-brand-lime uppercase mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-brand-lime" />
              <span>EXECUTIVE_SUMMARY</span>
            </div>
            <p className="bg-white/[0.02] border border-brand-border p-4 rounded text-white font-sans text-sm">
              {summaryObj.summary_brief || 'No summary available.'}
            </p>
          </div>

          {summaryObj.summary_medium && (
            <div>
              <div className="text-[10px] tracking-widest text-brand-grey uppercase mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-brand-grey" />
                <span>DETAILED_BREAKDOWN</span>
              </div>
              <p className="text-slate-300 font-sans text-sm">{summaryObj.summary_medium}</p>
            </div>
          )}

          {summaryObj.key_points && summaryObj.key_points.length > 0 && (
            <div>
              <div className="text-[10px] tracking-widest text-brand-lime uppercase mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-brand-lime" />
                <span>KEY_TAKEAWAYS</span>
              </div>
              <ul className="space-y-2 list-disc list-inside text-slate-300 font-sans text-sm">
                {summaryObj.key_points.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-brand-border flex justify-end">
          <Button onClick={onClose} variant="primary" className="text-xs font-mono">
            CLOSE
          </Button>
        </div>

      </div>
    </div>
  );
}
