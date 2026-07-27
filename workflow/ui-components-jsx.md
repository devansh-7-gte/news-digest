# Complete UI Components (JSX)

This file contains all the frontend components you'll need for the AI News Digest application.

---

## 🎨 Dashboard Components

### app/layout.jsx

```javascript
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AI News Digest',
  description: 'Personalized AI-powered news summaries delivered daily',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### app/page.jsx (Landing Page)

```javascript
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <div className="text-2xl font-bold text-indigo-600">
            AI News Digest
          </div>
          <div className="space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 text-indigo-600 hover:text-indigo-700"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Sign Up
            </Link>
          </div>
        </nav>

        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Your Daily News, <span className="text-indigo-600">Simplified</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            AI-powered summaries of the latest news in Finance, Technology, and more.
            Delivered straight to your inbox every morning.
          </p>
          
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Get Started Free
          </Link>

          <div className="mt-24 grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🤖"
              title="AI-Powered Summaries"
              description="Gemini AI analyzes and condenses articles into bite-sized insights"
            />
            <FeatureCard
              icon="📧"
              title="Daily Delivery"
              description="Receive your personalized digest at your preferred time"
            />
            <FeatureCard
              icon="🎯"
              title="Custom Topics"
              description="Subscribe to Finance, Tech, Health, Politics, or Sports"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
```

### app/(auth)/login/page.jsx

```javascript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/services/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Sign in to your account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
```

### app/(auth)/signup/page.jsx

```javascript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/services/supabase';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: fullName,
      });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    // Create default preferences
    const { error: prefsError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: authData.user.id,
      });

    if (prefsError) {
      console.error('Failed to create preferences:', prefsError);
    }

    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Start receiving personalized news digests
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
```

### components/dashboard/DashboardLayout.jsx

```javascript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/services/supabase';

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
    } else {
      setUser(user);
    }
    setLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-indigo-600">
                  AI News Digest
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="border-transparent text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium hover:border-indigo-500"
                >
                  Dashboard
                </Link>
                <Link
                  href="/subscriptions"
                  className="border-transparent text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium hover:border-indigo-500"
                >
                  Subscriptions
                </Link>
                <Link
                  href="/preferences"
                  className="border-transparent text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium hover:border-indigo-500"
                >
                  Preferences
                </Link>
                <Link
                  href="/history"
                  className="border-transparent text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium hover:border-indigo-500"
                >
                  History
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
```

### app/(dashboard)/dashboard/page.jsx

```javascript
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/lib/services/supabase';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    subscriptions: 0,
    digestsReceived: 0,
    articlesRead: 0,
  });
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // Fetch subscriptions count
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    // Fetch recent articles from subscribed domains
    const subscribedDomains = subs?.map(s => s.domain) || [];
    
    const { data: articles } = await supabase
      .from('articles')
      .select(`
        *,
        article_summaries(summary_brief)
      `)
      .in('domain', subscribedDomains)
      .order('published_at', { ascending: false })
      .limit(5);

    setStats({
      subscriptions: subs?.length || 0,
      digestsReceived: 0, // You can calculate this from email_queue
      articlesRead: 0,
    });

    setRecentArticles(articles || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Active Subscriptions"
            value={stats.subscriptions}
            icon="📰"
          />
          <StatCard
            title="Digests Received"
            value={stats.digestsReceived}
            icon="📧"
          />
          <StatCard
            title="Articles Read"
            value={stats.articlesRead}
            icon="📖"
          />
        </div>

        {/* Recent Articles */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Articles
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentArticles.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No articles yet. Subscribe to topics to get started!
              </div>
            ) : (
              recentArticles.map((article) => (
                <ArticleItem key={article.id} article={article} />
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-4xl">{icon}</span>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-3xl font-semibold text-gray-900">
                {value}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArticleItem({ article }) {
  const summary = article.article_summaries?.[0]?.summary_brief || 'No summary available';
  
  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {article.domain}
            </span>
            <span className="ml-2 text-sm text-gray-500">
              {new Date(article.published_at).toLocaleDateString()}
            </span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {article.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {summary}
          </p>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Read full article →
          </a>
        </div>
      </div>
    </div>
  );
}
```

### app/(dashboard)/subscriptions/page.jsx

```javascript
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/lib/services/supabase';

const DOMAINS = [
  {
    id: 'finance',
    name: 'Finance',
    icon: '💰',
    description: 'Markets, stocks, cryptocurrency, and economic news',
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: '💻',
    description: 'Tech news, startups, gadgets, and innovations',
  },
  {
    id: 'health',
    name: 'Health',
    icon: '🏥',
    description: 'Medical breakthroughs, wellness, and healthcare',
  },
  {
    id: 'politics',
    name: 'Politics',
    icon: '🏛️',
    description: 'Political news, policy changes, and elections',
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: '⚽',
    description: 'Sports news, scores, and athlete updates',
  },
];

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializePage();
  }, []);

  async function initializePage() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      await fetchSubscriptions(user.id);
    }
    setLoading(false);
  }

  async function fetchSubscriptions(uid) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', uid);

    if (error) {
      console.error('Error fetching subscriptions:', error);
    } else {
      setSubscriptions(data || []);
    }
  }

  async function toggleSubscription(domainId) {
    const existing = subscriptions.find(sub => sub.domain === domainId);

    if (existing) {
      // Toggle active status
      const { error } = await supabase
        .from('subscriptions')
        .update({ is_active: !existing.is_active })
        .eq('id', existing.id);

      if (!error) {
        await fetchSubscriptions(userId);
      }
    } else {
      // Create new subscription
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          domain: domainId,
          is_active: true,
        });

      if (!error) {
        await fetchSubscriptions(userId);
      }
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Subscriptions</h1>
          <p className="mt-2 text-gray-600">
            Choose the topics you want to receive in your daily digest
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {DOMAINS.map((domain) => {
            const subscription = subscriptions.find(sub => sub.domain === domain.id);
            const isActive = subscription?.is_active || false;

            return (
              <div
                key={domain.id}
                className={`relative bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all border-2 ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleSubscription(domain.id)}
              >
                {isActive && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-indigo-600 text-white rounded-full p-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
                
                <div className="text-4xl mb-4">{domain.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {domain.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {domain.description}
                </p>
                <div className="text-sm font-medium">
                  {isActive ? (
                    <span className="text-indigo-600">Subscribed ✓</span>
                  ) : (
                    <span className="text-gray-500">Click to subscribe</span>
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
```

### app/(dashboard)/preferences/page.jsx

```javascript
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/lib/services/supabase';

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
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      await fetchPreferences(user.id);
    }
    setLoading(false);
  }

  async function fetchPreferences(uid) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', uid)
      .single();

    if (error) {
      console.error('Error fetching preferences:', error);
    } else if (data) {
      setPreferences(data);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from('user_preferences')
      .update(preferences)
      .eq('user_id', userId);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } else {
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-0 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Preferences</h1>
          <p className="mt-2 text-gray-600">
            Customize how you receive your news digests
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white shadow rounded-lg p-6 space-y-6">
          {/* Digest Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Digest Frequency
            </label>
            <select
              value={preferences.digest_frequency}
              onChange={(e) =>
                setPreferences({ ...preferences, digest_frequency: e.target.value })
              }
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="daily">Daily</option>
              <option value="twice_daily">Twice Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          {/* Digest Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Time
            </label>
            <input
              type="time"
              value={preferences.digest_time}
              onChange={(e) =>
                setPreferences({ ...preferences, digest_time: e.target.value })
              }
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              When would you like to receive your digest?
            </p>
          </div>

          {/* Summary Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Summary Length
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="brief"
                  checked={preferences.summary_length === 'brief'}
                  onChange={(e) =>
                    setPreferences({ ...preferences, summary_length: e.target.value })
                  }
                  className="mr-2"
                />
                <span className="text-sm">
                  Brief (1-2 sentences) - Quick overview
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="medium"
                  checked={preferences.summary_length === 'medium'}
                  onChange={(e) =>
                    setPreferences({ ...preferences, summary_length: e.target.value })
                  }
                  className="mr-2"
                />
                <span className="text-sm">
                  Medium (3-4 sentences) - Balanced detail
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="detailed"
                  checked={preferences.summary_length === 'detailed'}
                  onChange={(e) =>
                    setPreferences({ ...preferences, summary_length: e.target.value })
                  }
                  className="mr-2"
                />
                <span className="text-sm">
                  Detailed (1 paragraph) - Comprehensive
                </span>
              </label>
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={preferences.timezone}
              onChange={(e) =>
                setPreferences({ ...preferences, timezone: e.target.value })
              }
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Asia/Kolkata">India</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
```

---

This completes the core UI components! All in JSX/JavaScript with no TypeScript.
