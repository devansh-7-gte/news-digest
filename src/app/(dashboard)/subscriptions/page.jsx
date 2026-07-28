'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/lib/services/supabase';
import Button from '@/components/ui/Button';
import { 
  Laptop, 
  DollarSign, 
  Activity, 
  Landmark, 
  Trophy, 
  Check, 
  Plus, 
  Newspaper, 
  SlidersHorizontal 
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

const DOMAINS = [
  {
    id: 'technology',
    name: 'Technology',
    Icon: Laptop,
    description: 'Artificial intelligence, cloud computing, startups, software engineering, and gadgets.',
    subTopicsOptions: ['AI & ML', 'Cloud Computing', 'Cybersecurity', 'Startups', 'Gadgets', 'DevOps'],
  },
  {
    id: 'finance',
    name: 'Finance & Markets',
    Icon: DollarSign,
    description: 'Global stock markets, cryptocurrency, macroeconomic policy, real estate, and venture capital.',
    subTopicsOptions: ['Stocks & Equities', 'Cryptocurrency', 'Macroeconomics', 'Venture Capital', 'Real Estate'],
  },
  {
    id: 'health',
    name: 'Health & Science',
    Icon: Activity,
    description: 'Biotechnology, medical research, fitness, neuroscience, public health, and longevity.',
    subTopicsOptions: ['Biotech & Pharma', 'Medical Research', 'Fitness & Nutrition', 'Longevity', 'Mental Health'],
  },
  {
    id: 'politics',
    name: 'Politics & Policy',
    Icon: Landmark,
    description: 'Global elections, international policy, defense, regulation, and legislative updates.',
    subTopicsOptions: ['Global Affairs', 'Elections', 'Regulation & Tech Policy', 'Economy Policy'],
  },
  {
    id: 'sports',
    name: 'Sports & Gaming',
    Icon: Trophy,
    description: 'Professional sports leagues, eSports, athletic technology, and tournament coverage.',
    subTopicsOptions: ['Football / Soccer', 'Basketball', 'Tennis', 'Formula 1', 'eSports'],
  },
];

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingDomain, setSavingDomain] = useState(null);

  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
      fetchSubscriptions(user.id);
    }
  }, [user]);

  async function fetchSubscriptions(uid) {
    setLoading(true);
    try {
      const res = await fetch(`/api/subscriptions?userId=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data || []);
      }
    } catch (e) {
      console.warn('Subscription load warning:', e);
    } finally {
      setLoading(false);
    }
  }

  async function toggleSubscription(domainId) {
    setSavingDomain(domainId);
    try {
      const existing = subscriptions.find((s) => s.domain === domainId);
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          domain: domainId,
          action: 'toggle_domain',
          isActive: existing ? !existing.is_active : true,
        }),
      });
      if (res.ok) {
        await fetchSubscriptions(userId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingDomain(null);
    }
  }

  async function toggleSubTopic(domainId, subTopicName) {
    const existing = subscriptions.find((s) => s.domain === domainId);
    if (!existing) return;

    let currentTopics = existing.sub_topics || [];
    let updatedTopics = currentTopics.includes(subTopicName)
      ? currentTopics.filter((t) => t !== subTopicName)
      : [...currentTopics, subTopicName];

    setSavingDomain(domainId);
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          domain: domainId,
          action: 'toggle_subtopic',
          subTopics: updatedTopics,
        }),
      });
      if (res.ok) {
        await fetchSubscriptions(userId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingDomain(null);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 border border-brand-border bg-white/[0.01] rounded-xl glass-card font-mono text-xs text-brand-grey">
          <span className="w-3 h-3 rounded-full bg-brand-lime animate-ping mb-3" />
          <p className="flex items-center gap-2">
            <Newspaper className="w-3.5 h-3.5 text-brand-lime animate-pulse" />
            LOADING_SUBSCRIPTIONS...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="border-b border-brand-border/60 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-brand-border bg-white/[0.02]">
            <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
            <span className="font-mono text-[10px] tracking-widest text-brand-lime uppercase flex items-center gap-1.5">
              <SlidersHorizontal className="w-3 h-3 text-brand-lime" />
              TOPIC_CONFIGURATION
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight uppercase mt-2">
            Manage Subscriptions
          </h1>
          <p className="text-brand-grey text-sm mt-1">
            Subscribe to domains and toggle granular sub-topics for custom AI roundups.
          </p>
        </div>

        {/* Domain Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {DOMAINS.map((domain) => {
            const subscription = subscriptions.find((s) => s.domain === domain.id);
            const isActive = subscription?.is_active || false;
            const activeSubTopics = subscription?.sub_topics || [];
            const isSaving = savingDomain === domain.id;
            const DomainIcon = domain.Icon;

            return (
              <div
                key={domain.id}
                className={`border rounded-xl p-6 transition-all duration-300 flex flex-col justify-between glass-card ${
                  isActive
                    ? 'border-brand-lime/50 bg-white/[0.02] shadow-[0_0_25px_rgba(195,255,46,0.06)]'
                    : 'border-brand-border bg-white/[0.01]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white/[0.02] border border-brand-border rounded-xl text-brand-lime">
                        <DomainIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white uppercase">{domain.name}</h3>
                        <span className="font-mono text-[10px] text-brand-grey">
                          {isActive ? 'STATUS // ACTIVE' : 'STATUS // INACTIVE'}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => toggleSubscription(domain.id)}
                      disabled={isSaving}
                      variant={isActive ? 'primary' : 'outline'}
                      className="text-xs font-mono tracking-wider px-3.5 py-1.5"
                    >
                      {isSaving ? (
                        'SAVING...'
                      ) : isActive ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>SUBSCRIBED</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>SUBSCRIBE</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-brand-grey leading-relaxed mb-6">
                    {domain.description}
                  </p>

                  {isActive && (
                    <div className="pt-4 border-t border-brand-border/60 space-y-3 font-mono text-xs">
                      <div className="text-[10px] tracking-widest text-brand-lime uppercase">
                        SUB_TOPICS_SELECT:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {domain.subTopicsOptions.map((topic) => {
                          const isTopicSelected = activeSubTopics.includes(topic);
                          return (
                            <button
                              key={topic}
                              onClick={() => toggleSubTopic(domain.id, topic)}
                              disabled={isSaving}
                              className={`px-3 py-1 rounded border text-[10px] transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                                isTopicSelected
                                  ? 'bg-brand-lime/20 text-brand-lime border-brand-lime/50'
                                  : 'bg-white/[0.02] text-brand-grey border-brand-border hover:text-white'
                              }`}
                            >
                              {isTopicSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                              <span>{topic}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </DashboardLayout>
  );
}
