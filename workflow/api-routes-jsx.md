# API Routes & Server Actions (JSX/JavaScript)

Complete backend API implementation for the AI News Digest application.

---

## 📡 API Routes

### app/api/users/route.js

```javascript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/services/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('id');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
        subscriptions: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updates
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
```

### app/api/subscriptions/route.js

```javascript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/services/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: userId }
    });

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, domain, subTopics } = body;

    if (!userId || !domain) {
      return NextResponse.json(
        { error: 'User ID and domain required' },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: userId,
        domain: domain,
        subTopics: subTopics || [],
        isActive: true,
      }
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { subscriptionId, updates } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID required' },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: updates
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const subscriptionId = searchParams.get('id');

  if (!subscriptionId) {
    return NextResponse.json(
      { error: 'Subscription ID required' },
      { status: 400 }
    );
  }

  try {
    await prisma.subscription.delete({
      where: { id: subscriptionId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}
```

### app/api/digest/preview/route.js

```javascript
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/services/supabase';
import { generatePersonalizedDigest } from '@/lib/services/gemini';
import { render } from '@react-email/render';
import DigestEmail from '@/emails/digest-template';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get user info
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        user_preferences(*),
        subscriptions(*)
      `)
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Get subscribed domains
    const subscribedDomains = user.subscriptions
      .filter(sub => sub.is_active)
      .map(sub => sub.domain);

    if (subscribedDomains.length === 0) {
      return NextResponse.json(
        { error: 'No active subscriptions' },
        { status: 400 }
      );
    }

    // Get recent articles
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: articles, error: articlesError } = await supabaseAdmin
      .from('articles')
      .select(`
        *,
        article_summaries(*)
      `)
      .in('domain', subscribedDomains)
      .gte('published_at', yesterday.toISOString())
      .order('published_at', { ascending: false })
      .limit(10);

    if (articlesError) throw articlesError;

    if (!articles || articles.length === 0) {
      return NextResponse.json(
        { error: 'No recent articles found' },
        { status: 404 }
      );
    }

    // Prepare article data
    const summaryLength = user.user_preferences?.summary_length || 'medium';
    const emailArticles = articles.map(article => ({
      title: article.title,
      summary: article.article_summaries?.[0]?.[`summary_${summaryLength}`] || article.title,
      url: article.url,
      domain: article.domain,
      keyPoints: article.article_summaries?.[0]?.key_points || [],
    }));

    // Generate personalized introduction
    const introduction = await generatePersonalizedDigest(
      emailArticles,
      user.full_name || user.email.split('@')[0]
    );

    // Render email HTML
    const emailHtml = render(
      <DigestEmail
        userName={user.full_name || user.email.split('@')[0]}
        introduction={introduction}
        articles={emailArticles}
      />
    );

    return NextResponse.json({
      html: emailHtml,
      articleCount: emailArticles.length,
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}
```

### app/api/articles/route.js

```javascript
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/services/supabase';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    let query = supabaseAdmin
      .from('articles')
      .select(`
        *,
        article_summaries(*)
      `)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (domain) {
      query = query.eq('domain', domain);
    }

    const { data: articles, error } = await query;

    if (error) throw error;

    return NextResponse.json({ articles, count: articles.length });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
```

### app/api/analytics/track/route.js

```javascript
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/services/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, eventType, metadata } = body;

    if (!eventType) {
      return NextResponse.json(
        { error: 'Event type required' },
        { status: 400 }
      );
    }

    const { data: event, error } = await supabaseAdmin
      .from('analytics_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error tracking event:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
```

### app/api/admin/sources/route.js

```javascript
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/services/supabase';

export async function GET(request) {
  try {
    const { data: sources, error } = await supabaseAdmin
      .from('news_sources')
      .select('*')
      .order('domain');

    if (error) throw error;

    return NextResponse.json({ sources });
  } catch (error) {
    console.error('Error fetching sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sources' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, domain, sourceType, url, selectorConfig } = body;

    if (!name || !domain || !sourceType || !url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: source, error } = await supabaseAdmin
      .from('news_sources')
      .insert({
        name,
        domain,
        source_type: sourceType,
        url,
        selector_config: selectorConfig || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ source });
  } catch (error) {
    console.error('Error creating source:', error);
    return NextResponse.json(
      { error: 'Failed to create source' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { sourceId, updates } = body;

    if (!sourceId) {
      return NextResponse.json(
        { error: 'Source ID required' },
        { status: 400 }
      );
    }

    const { data: source, error } = await supabaseAdmin
      .from('news_sources')
      .update(updates)
      .eq('id', sourceId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ source });
  } catch (error) {
    console.error('Error updating source:', error);
    return NextResponse.json(
      { error: 'Failed to update source' },
      { status: 500 }
    );
  }
}
```

### app/api/admin/stats/route.js

```javascript
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/services/supabase';

export async function GET(request) {
  try {
    // Get total users
    const { count: usersCount } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get total articles
    const { count: articlesCount } = await supabaseAdmin
      .from('articles')
      .select('*', { count: 'exact', head: true });

    // Get emails sent today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: emailsSentToday } = await supabaseAdmin
      .from('email_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sent')
      .gte('sent_at', today.toISOString());

    // Get active subscriptions
    const { count: activeSubscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get articles by domain
    const { data: articlesByDomain } = await supabaseAdmin
      .from('articles')
      .select('domain')
      .limit(1000);

    const domainCounts = {};
    articlesByDomain?.forEach(article => {
      domainCounts[article.domain] = (domainCounts[article.domain] || 0) + 1;
    });

    return NextResponse.json({
      stats: {
        totalUsers: usersCount || 0,
        totalArticles: articlesCount || 0,
        emailsSentToday: emailsSentToday || 0,
        activeSubscriptions: activeSubscriptions || 0,
        articlesByDomain: domainCounts,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
```

---

## ⚡ Server Actions

### app/actions/user-actions.js

```javascript
'use server';

import { supabaseAdmin } from '@/lib/services/supabase';
import { revalidatePath } from 'next/cache';

export async function updateUserPreferences(userId, preferences) {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_preferences')
      .update(preferences)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/preferences');
    return { success: true, data };
  } catch (error) {
    console.error('Error updating preferences:', error);
    return { success: false, error: error.message };
  }
}

export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        user_preferences(*),
        subscriptions(*)
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { success: false, error: error.message };
  }
}

export async function updateUserProfile(userId, updates) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard');
    return { success: true, data };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message };
  }
}
```

### app/actions/subscription-actions.js

```javascript
'use server';

import { supabaseAdmin } from '@/lib/services/supabase';
import { revalidatePath } from 'next/cache';

export async function createSubscription(userId, domain, subTopics = []) {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        user_id: userId,
        domain: domain,
        sub_topics: subTopics,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/subscriptions');
    return { success: true, data };
  } catch (error) {
    console.error('Error creating subscription:', error);
    return { success: false, error: error.message };
  }
}

export async function toggleSubscription(subscriptionId, isActive) {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update({ is_active: isActive })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/subscriptions');
    return { success: true, data };
  } catch (error) {
    console.error('Error toggling subscription:', error);
    return { success: false, error: error.message };
  }
}

export async function updateSubscriptionTopics(subscriptionId, subTopics) {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update({ sub_topics: subTopics })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/subscriptions');
    return { success: true, data };
  } catch (error) {
    console.error('Error updating topics:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteSubscription(subscriptionId) {
  try {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .delete()
      .eq('id', subscriptionId);

    if (error) throw error;

    revalidatePath('/subscriptions');
    return { success: true };
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return { success: false, error: error.message };
  }
}

export async function getUserSubscriptions(userId) {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('domain');

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return { success: false, error: error.message };
  }
}
```

### app/actions/digest-actions.js

```javascript
'use server';

import { supabaseAdmin } from '@/lib/services/supabase';
import { generateDigestForUser } from '@/lib/agents/digest-generator';

export async function requestDigestGeneration(userId) {
  try {
    const digest = await generateDigestForUser(userId);

    if (!digest) {
      return { success: false, error: 'No articles available for digest' };
    }

    return { success: true, data: digest };
  } catch (error) {
    console.error('Error generating digest:', error);
    return { success: false, error: error.message };
  }
}

export async function getDigestHistory(userId, limit = 10) {
  try {
    const { data, error } = await supabaseAdmin
      .from('email_queue')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching digest history:', error);
    return { success: false, error: error.message };
  }
}

export async function resendDigest(emailId) {
  try {
    const { data, error } = await supabaseAdmin
      .from('email_queue')
      .update({
        status: 'pending',
        scheduled_for: new Date().toISOString(),
        retry_count: 0,
      })
      .eq('id', emailId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error resending digest:', error);
    return { success: false, error: error.message };
  }
}
```

---

## 🔒 Middleware for Protected Routes

### middleware.js

```javascript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes
  const protectedPaths = ['/dashboard', '/subscriptions', '/preferences', '/history'];
  const isProtectedPath = protectedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect logged-in users away from auth pages
  if ((req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup') && session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/subscriptions/:path*', '/preferences/:path*', '/history/:path*', '/login', '/signup'],
};
```

---

## 🧪 Testing Utilities

### scripts/test-agents.js

```javascript
#!/usr/bin/env node

import { runScraperAgent } from '../lib/agents/scraper.js';
import { runClassifierAgent } from '../lib/agents/classifier.js';
import { runSummarizerAgent } from '../lib/agents/summarizer.js';

async function testScraper() {
  console.log('Testing Scraper Agent...');
  const articles = await runScraperAgent();
  console.log(`✓ Scraped ${articles.length} articles`);
}

async function testClassifier() {
  console.log('Testing Classifier Agent...');
  const articles = await runClassifierAgent();
  console.log(`✓ Classified ${articles.length} articles`);
}

async function testSummarizer() {
  console.log('Testing Summarizer Agent...');
  const summaries = await runSummarizerAgent();
  console.log(`✓ Created ${summaries.length} summaries`);
}

async function main() {
  const agent = process.argv[2];

  switch (agent) {
    case 'scraper':
      await testScraper();
      break;
    case 'classifier':
      await testClassifier();
      break;
    case 'summarizer':
      await testSummarizer();
      break;
    case 'all':
      await testScraper();
      await testClassifier();
      await testSummarizer();
      break;
    default:
      console.log('Usage: node scripts/test-agents.js [scraper|classifier|summarizer|all]');
      process.exit(1);
  }
}

main().catch(console.error);
```

### scripts/seed-sources.js

```javascript
#!/usr/bin/env node

import { supabaseAdmin } from '../lib/services/supabase.js';

const sources = [
  // Technology
  { name: 'TechCrunch', domain: 'technology', source_type: 'rss', url: 'https://techcrunch.com/feed/' },
  { name: 'The Verge', domain: 'technology', source_type: 'rss', url: 'https://www.theverge.com/rss/index.xml' },
  { name: 'Ars Technica', domain: 'technology', source_type: 'rss', url: 'https://feeds.arstechnica.com/arstechnica/index' },
  
  // Finance
  { name: 'Reuters Finance', domain: 'finance', source_type: 'rss', url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best' },
  { name: 'Yahoo Finance', domain: 'finance', source_type: 'rss', url: 'https://finance.yahoo.com/news/rssindex' },
  
  // Health
  { name: 'Medical News Today', domain: 'health', source_type: 'rss', url: 'https://www.medicalnewstoday.com/rss' },
  
  // Politics
  { name: 'Politico', domain: 'politics', source_type: 'rss', url: 'https://www.politico.com/rss/politics08.xml' },
  { name: 'The Hill', domain: 'politics', source_type: 'rss', url: 'https://thehill.com/feed/' },
  
  // Sports
  { name: 'ESPN', domain: 'sports', source_type: 'rss', url: 'https://www.espn.com/espn/rss/news' },
  { name: 'BBC Sport', domain: 'sports', source_type: 'rss', url: 'http://feeds.bbci.co.uk/sport/rss.xml' },
];

async function seedSources() {
  console.log('Seeding news sources...');

  for (const source of sources) {
    const { error } = await supabaseAdmin
      .from('news_sources')
      .upsert(source, { onConflict: 'url' });

    if (error) {
      console.error(`Failed to seed ${source.name}:`, error);
    } else {
      console.log(`✓ Seeded ${source.name}`);
    }
  }

  console.log('Done!');
}

seedSources().catch(console.error);
```

---

This completes all API routes and server actions in JavaScript! Ready to use.
