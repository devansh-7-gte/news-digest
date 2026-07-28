'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/lib/services/supabase';
import Button from '@/components/ui/Button';
import { 
  History as HistoryIcon, 
  Inbox, 
  Mail, 
  Copy, 
  Check, 
  Search, 
  FileText 
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDigest, setActiveDigest] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchHistoryData(user.id);
    }
  }, [user]);

  async function fetchHistoryData(userId) {
    setLoading(true);
    try {
      const res = await fetch(`/api/history?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setHistory(data);
          setActiveDigest(data[0]);
        }
      }
    } catch (e) {
      console.warn('History error:', e);
    } finally {
      setLoading(false);
    }
  }

  const filteredHistory = history.filter((item) => {
    const matchesSearch = searchQuery
      ? item.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesStatus =
      statusFilter === 'all' ? true : item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function handleCopyContent() {
    if (!activeDigest?.html_content) return;
    navigator.clipboard.writeText(activeDigest.html_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 border border-brand-border bg-white/[0.01] rounded-xl glass-card font-mono text-xs text-brand-grey">
          <span className="w-3 h-3 rounded-full bg-brand-lime animate-ping mb-3" />
          <p className="flex items-center gap-2">
            <HistoryIcon className="w-3.5 h-3.5 text-brand-lime animate-pulse" />
            LOADING_HISTORY_ARCHIVE...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border/60 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-brand-border bg-white/[0.02]">
              <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
              <span className="font-mono text-[10px] tracking-widest text-brand-lime uppercase flex items-center gap-1.5">
                <HistoryIcon className="w-3 h-3 text-brand-lime" />
                DIGEST_ARCHIVE // LOGS
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight uppercase mt-2">
              Digest History & Reader
            </h1>
            <p className="text-brand-grey text-sm mt-1">
              Read past newsletters dispatched to your inbox.
            </p>
          </div>

          <div className="w-full md:w-72 relative">
            <input
              type="text"
              placeholder="Search subject line..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.02] border border-brand-border text-white placeholder-brand-grey/50 font-mono text-xs rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-brand-lime/50 transition-all"
            />
            <Search className="w-4 h-4 text-brand-grey absolute left-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Reader Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* List Sidebar */}
          <div className="lg:col-span-4 border border-brand-border bg-white/[0.01] rounded-xl overflow-hidden glass-card flex flex-col h-[600px]">
            
            <div className="p-3 border-b border-brand-border flex gap-2 font-mono text-xs">
              {['all', 'sent', 'pending'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded capitalize font-bold transition-all ${
                    statusFilter === st
                      ? 'bg-brand-lime text-brand-dark'
                      : 'text-brand-grey hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-brand-border/60">
              {filteredHistory.length === 0 ? (
                <div className="p-8 text-center font-mono text-xs text-brand-grey flex flex-col items-center gap-2">
                  <Inbox className="w-8 h-8 text-brand-grey/40" />
                  <span>NO_DIGESTS_QUEUED</span>
                </div>
              ) : (
                filteredHistory.map((digest) => {
                  const isSelected = activeDigest?.id === digest.id;
                  const date = new Date(digest.scheduled_for).toLocaleDateString();

                  return (
                    <div
                      key={digest.id}
                      onClick={() => setActiveDigest(digest)}
                      className={`p-4 cursor-pointer transition-colors border-l-2 ${
                        isSelected
                          ? 'bg-white/[0.03] border-brand-lime text-white'
                          : 'border-transparent text-brand-grey hover:text-white hover:bg-white/[0.01]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1 font-mono text-[10px]">
                        <span>{date}</span>
                        <span className={`uppercase font-bold ${digest.status === 'sent' ? 'text-brand-lime' : 'text-amber-400'}`}>
                          [{digest.status}]
                        </span>
                      </div>
                      <h3 className="text-xs font-bold truncate">{digest.subject}</h3>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Preview Window */}
          <div className="lg:col-span-8 border border-brand-border bg-white/[0.01] rounded-xl h-[600px] overflow-hidden flex flex-col glass-card">
            {activeDigest ? (
              <div className="flex flex-col h-full">
                
                <div className="p-5 border-b border-brand-border flex items-center justify-between font-mono text-xs">
                  <div>
                    <h2 className="text-base font-bold text-white uppercase">{activeDigest.subject}</h2>
                    <span className="text-[10px] text-brand-grey">
                      SCHEDULED // {new Date(activeDigest.scheduled_for).toLocaleString()}
                    </span>
                  </div>

                  <Button onClick={handleCopyContent} variant="secondary" className="text-xs font-mono py-1.5 px-3">
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'COPIED' : 'COPY_HTML'}</span>
                  </Button>
                </div>

                <div className="flex-1 p-6 overflow-y-auto bg-black/60">
                  <div
                    className="bg-white text-black p-6 rounded-lg shadow-xl prose prose-sm max-w-none font-sans"
                    dangerouslySetInnerHTML={{ __html: activeDigest.html_content }}
                  />
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-brand-grey font-mono text-xs p-8 gap-2">
                <Mail className="w-10 h-10 text-brand-grey/40" />
                <span>SELECT_DIGEST_TO_PREVIEW</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
