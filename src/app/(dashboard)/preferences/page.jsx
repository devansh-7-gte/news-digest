'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/lib/services/supabase';
import Button from '@/components/ui/Button';
import { 
  Sliders, 
  Clock, 
  Globe, 
  Check, 
  FileText, 
  Save 
} from 'lucide-react';

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState({
    digest_frequency: 'daily',
    digest_time: '08:00:00',
    summary_length: 'medium',
    timezone: 'UTC',
  });
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    initializePage();
  }, []);

  async function initializePage() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await fetchPreferences(user.id);
      }
    } catch (e) {
      console.warn('Prefs init warning:', e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPreferences(uid) {
    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', uid)
      .single();

    if (data) {
      setPreferences({
        digest_frequency: data.digest_frequency || 'daily',
        digest_time: data.digest_time || '08:00:00',
        summary_length: data.summary_length || 'medium',
        timezone: data.timezone || 'UTC',
      });
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (userId) {
        await supabase
          .from('user_preferences')
          .update(preferences)
          .eq('user_id', userId);
      }
      setMessage({ type: 'success', text: 'PREFERENCES_SAVED_SUCCESSFULLY' });
    } catch (err) {
      setMessage({ type: 'error', text: 'FAILED_TO_SAVE_PREFERENCES' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 border border-brand-border bg-white/[0.01] rounded-xl glass-card font-mono text-xs text-brand-grey">
          <span className="w-3 h-3 rounded-full bg-brand-lime animate-ping mb-3" />
          <p className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-brand-lime animate-pulse" />
            LOADING_PREFERENCES...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-brand-border/60 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-brand-border bg-white/[0.02]">
            <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
            <span className="font-mono text-[10px] tracking-widest text-brand-lime uppercase flex items-center gap-1.5">
              <Sliders className="w-3 h-3 text-brand-lime" />
              DELIVERY_SETTINGS
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight uppercase mt-2">
            User Delivery Preferences
          </h1>
          <p className="text-brand-grey text-sm mt-1">
            Customize AI summary depth, cron schedule timing, and timezone.
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded border font-mono text-xs font-bold flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-brand-lime/10 text-brand-lime border-brand-lime/30'
                : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="border border-brand-border bg-white/[0.01] rounded-xl p-8 space-y-6 glass-card shadow-2xl font-mono text-xs">
          
          {/* Digest Frequency */}
          <div>
            <label className="block tracking-wider text-brand-grey uppercase mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-lime" />
              <span>Digest Frequency</span>
            </label>
            <select
              value={preferences.digest_frequency}
              onChange={(e) =>
                setPreferences({ ...preferences, digest_frequency: e.target.value })
              }
              className="block w-full bg-white/[0.02] border border-brand-border rounded px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-brand-lime/50"
            >
              <option value="daily" className="bg-brand-dark">Daily (Every 24 Hours)</option>
              <option value="twice_daily" className="bg-brand-dark">Twice Daily (Morning & Evening)</option>
              <option value="weekly" className="bg-brand-dark">Weekly Summary</option>
            </select>
          </div>

          {/* Digest Time */}
          <div>
            <label className="block tracking-wider text-brand-grey uppercase mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-lime" />
              <span>Preferred Delivery Time</span>
            </label>
            <input
              type="time"
              value={preferences.digest_time}
              onChange={(e) =>
                setPreferences({ ...preferences, digest_time: e.target.value })
              }
              className="block w-full bg-white/[0.02] border border-brand-border rounded px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-brand-lime/50"
            />
            <p className="mt-1.5 text-[10px] text-brand-grey/60">
              The automated cron scheduler will dispatch your digest near this time.
            </p>
          </div>

          {/* Summary Depth */}
          <div>
            <label className="block tracking-wider text-brand-grey uppercase mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-brand-lime" />
              <span>AI Summary Depth Mode</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'brief', title: 'BRIEF', desc: '1-2 key sentences' },
                { id: 'medium', title: 'MEDIUM', desc: '3-4 balanced sentences' },
                { id: 'detailed', title: 'DETAILED', desc: 'Full bullet breakdown' },
              ].map((opt) => {
                const isSelected = preferences.summary_length === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setPreferences({ ...preferences, summary_length: opt.id })}
                    className={`p-4 rounded border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-lime bg-brand-lime/10 text-white'
                        : 'border-brand-border bg-white/[0.01] hover:border-white/20 text-brand-grey'
                    }`}
                  >
                    <div className="font-bold text-white mb-1 flex items-center justify-between">
                      <span>{opt.title}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-brand-lime" />}
                    </div>
                    <div className="text-[10px] text-brand-grey">{opt.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className="block tracking-wider text-brand-grey uppercase mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-brand-lime" />
              <span>Timezone</span>
            </label>
            <select
              value={preferences.timezone}
              onChange={(e) =>
                setPreferences({ ...preferences, timezone: e.target.value })
              }
              className="block w-full bg-white/[0.02] border border-brand-border rounded px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-brand-lime/50"
            >
              <option value="UTC" className="bg-brand-dark">UTC (Coordinated Universal Time)</option>
              <option value="America/New_York" className="bg-brand-dark">Eastern Time (ET)</option>
              <option value="America/Chicago" className="bg-brand-dark">Central Time (CT)</option>
              <option value="America/Denver" className="bg-brand-dark">Mountain Time (MT)</option>
              <option value="America/Los_Angeles" className="bg-brand-dark">Pacific Time (PT)</option>
              <option value="Europe/London" className="bg-brand-dark">London (GMT/BST)</option>
              <option value="Europe/Paris" className="bg-brand-dark">Paris (CET)</option>
              <option value="Asia/Tokyo" className="bg-brand-dark">Tokyo (JST)</option>
              <option value="Asia/Kolkata" className="bg-brand-dark">India (IST)</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-brand-border flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              variant="primary"
              className="text-xs font-mono tracking-wider px-6 py-2.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'SAVING...' : 'SAVE_PREFERENCES'}</span>
            </Button>
          </div>

        </form>

      </div>
    </DashboardLayout>
  );
}
