# Quick Start Implementation Guide (JSX Version)

This guide provides the exact JSX/JavaScript code you need to start building each component of the AI News Digest system.

## 🎬 Initial Setup

### 1. Create Next.js Project (JavaScript)

```bash
npx create-next-app@latest ai-news-digest --js --tailwind --app --src-dir --import-alias "@/*"
cd ai-news-digest
```

### 2. Install Dependencies

```bash
# Core dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @google/generative-ai
npm install resend react-email
npm install @upstash/redis @upstash/qstash

# Web scraping
npm install cheerio puppeteer rss-parser

# UI Components
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select @radix-ui/react-tabs
npm install framer-motion
npm install lucide-react

# Utils
npm install zod date-fns clsx tailwind-merge

# Dev tools
npm install -D prettier eslint-config-prettier
```

### 3. Configure jsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### 4. Project Structure Setup

```bash
mkdir -p lib/{agents,services,scrapers,db,utils}
mkdir -p app/api/{auth,users,subscriptions,digest,cron,webhooks}
mkdir -p components/{ui,dashboard,email-templates,admin}
mkdir -p emails
mkdir -p supabase/migrations
mkdir -p scripts
```

---

## 🗄️ Database Setup

### supabase/migrations/001_initial_schema.sql
### prisma/schema.prisma

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id               String            @id @default(uuid()) @db.Uuid
  email            String            @unique
  fullName         String?           @map("full_name")
  createdAt        DateTime          @default(now()) @map("created_at") @db.Timestamptz
  lastLogin        DateTime?         @map("last_login") @db.Timestamptz
  isActive         Boolean           @default(true) @map("is_active")
  preferences      UserPreference?
  subscriptions    Subscription[]
  emailQueue       EmailQueue[]
  analyticsEvents  AnalyticsEvent[]

  @@map("users")
}

model UserPreference {
  id              String   @id @default(uuid()) @db.Uuid
  userId          String   @unique @map("user_id") @db.Uuid
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  digestFrequency String   @default("daily") @map("digest_frequency") // 'daily', 'twice_daily', 'weekly'
  digestTime      String   @default("08:00:00") @map("digest_time")
  timezone        String   @default("UTC")
  summaryLength   String   @default("medium") @map("summary_length") // 'brief', 'medium', 'detailed'
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime @updatedAt @map("updated_at") @db.Timestamptz

  @@map("user_preferences")
}

model Subscription {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  domain    String // 'finance', 'technology', 'health', 'politics', 'sports'
  subTopics String[] @default([]) @map("sub_topics")
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz

  @@unique([userId, domain])
  @@map("subscriptions")
}

model NewsSource {
  id                    String       @id @default(uuid()) @db.Uuid
  name                  String
  domain                String // 'finance', 'technology', etc.
  sourceType            String       @map("source_type") // 'rss', 'scrape'
  url                   String
  selectorConfig        Json?        @map("selector_config") // CSS selectors for scraping
  fetchFrequencyMinutes Int          @default(60) @map("fetch_frequency_minutes")
  isActive              Boolean      @default(true) @map("is_active")
  lastFetchedAt         DateTime?    @map("last_fetched_at") @db.Timestamptz
  errorCount            Int          @default(0) @map("error_count")
  createdAt             DateTime     @default(now()) @map("created_at") @db.Timestamptz
  rawArticles           RawArticle[]

  @@map("news_sources")
}

model RawArticle {
  id           String      @id @default(uuid()) @db.Uuid
  sourceId     String?     @map("source_id") @db.Uuid
  source       NewsSource? @relation(fields: [sourceId], references: [id], onDelete: SetNull)
  title        String
  url          String      @unique
  rawContent   String?     @map("raw_content") @db.Text
  publishedAt  DateTime?   @map("published_at") @db.Timestamptz
  fetchedAt    DateTime    @default(now()) @map("fetched_at") @db.Timestamptz
  isProcessed  Boolean     @default(false) @map("is_processed")
  contentHash  String?     @unique @map("content_hash")
  articles     Article[]

  @@index([isProcessed])
  @@map("raw_articles")
}

model Article {
  id           String            @id @default(uuid()) @db.Uuid
  rawArticleId String?           @map("raw_article_id") @db.Uuid
  rawArticle   RawArticle?       @relation(fields: [rawArticleId], references: [id], onDelete: SetNull)
  title        String
  url          String            @unique
  domain       String
  subTopics    String[]          @default([]) @map("sub_topics")
  sentiment    Decimal?          @db.Decimal(3, 2)
  keywords     String[]          @default([])
  imageUrl     String?           @map("image_url")
  publishedAt  DateTime?         @map("published_at") @db.Timestamptz
  createdAt    DateTime          @default(now()) @map("created_at") @db.Timestamptz
  summaries    ArticleSummary?

  @@index([domain])
  @@index([publishedAt(sort: Desc)])
  @@map("articles")
}

model ArticleSummary {
  id              String   @id @default(uuid()) @db.Uuid
  articleId       String   @unique @map("article_id") @db.Uuid
  article         Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  summaryBrief    String   @map("summary_brief") @db.Text
  summaryMedium   String?  @map("summary_medium") @db.Text
  summaryDetailed String?  @map("summary_detailed") @db.Text
  keyPoints       String[] @default([]) @map("key_points")
  modelUsed       String   @default("gemini-2.0-flash") @map("model_used")
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz

  @@map("article_summaries")
}

model EmailQueue {
  id           String    @id @default(uuid()) @db.Uuid
  userId       String    @map("user_id") @db.Uuid
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  subject      String
  htmlContent  String    @map("html_content") @db.Text
  scheduledFor DateTime  @map("scheduled_for") @db.Timestamptz
  sentAt       DateTime? @map("sent_at") @db.Timestamptz
  status       String    @default("pending") // 'pending', 'sent', 'failed'
  errorMessage String?   @map("error_message") @db.Text
  retryCount   Int       @default(0) @map("retry_count")
  createdAt    DateTime  @default(now()) @map("created_at") @db.Timestamptz

  @@index([status, scheduledFor])
  @@map("email_queue")
}

model AnalyticsEvent {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String?  @map("user_id") @db.Uuid
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  eventType String   @map("event_type") // 'email_opened', 'link_clicked', 'preferences_updated'
  metadata  Json     @default("{}")
  createdAt DateTime @db.Timestamptz @map("created_at") @default(now())

  @@map("analytics_events")
}
```

### prisma/seed.js

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const newsSources = [
    // Technology
    { name: 'TechCrunch', domain: 'technology', sourceType: 'rss', url: 'https://techcrunch.com/feed/' },
    { name: 'The Verge', domain: 'technology', sourceType: 'rss', url: 'https://www.theverge.com/rss/index.xml' },
    { name: 'Ars Technica', domain: 'technology', sourceType: 'rss', url: 'https://feeds.arstechnica.com/arstechnica/index' },
    { name: 'Hacker News', domain: 'technology', sourceType: 'scrape', url: 'https://news.ycombinator.com/' },
    
    // Finance
    { name: 'Bloomberg', domain: 'finance', sourceType: 'rss', url: 'https://www.bloomberg.com/feed/podcast/etf-iq.xml' },
    { name: 'Reuters Finance', domain: 'finance', sourceType: 'rss', url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best' },
    { name: 'Yahoo Finance', domain: 'finance', sourceType: 'rss', url: 'https://finance.yahoo.com/news/rssindex' },
    
    // Health
    { name: 'Medical News Today', domain: 'health', sourceType: 'rss', url: 'https://www.medicalnewstoday.com/rss' },
    { name: 'WebMD', domain: 'health', sourceType: 'scrape', url: 'https://www.webmd.com/news/default.htm' },
    
    // Politics
    { name: 'Politico', domain: 'politics', sourceType: 'rss', url: 'https://www.politico.com/rss/politics08.xml' },
    { name: 'The Hill', domain: 'politics', sourceType: 'rss', url: 'https://thehill.com/feed/' },
    
    // Sports
    { name: 'ESPN', domain: 'sports', sourceType: 'rss', url: 'https://www.espn.com/espn/rss/news' },
    { name: 'BBC Sport', domain: 'sports', sourceType: 'rss', url: 'http://feeds.bbci.co.uk/sport/rss.xml' }
  ];

  console.log('Seeding news sources...');
  for (const source of newsSources) {
    await prisma.newsSource.upsert({
      where: { url: source.url },
      update: {},
      create: source,
    });
  }
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```s.xml');
```

---

## 🔑 Core Services Implementation (JSX/JavaScript)

### lib/services/db.js

```javascript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### lib/services/gemini.js

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Classify an article into domain, topics, sentiment
 * @param {string} title - Article title
 * @param {string} content - Article content
 * @returns {Promise<Object>} Classification result
 */
export async function classifyArticle(title, content) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const prompt = `You are a news classification expert. Analyze this article and provide classification data.

Article Title: ${title}
Article Content: ${content.slice(0, 2000)}

Respond ONLY with a JSON object (no markdown, no explanations) in this exact format:
{
  "domain": "one of: finance, technology, health, politics, sports",
  "subTopics": ["keyword1", "keyword2", "keyword3"],
  "sentiment": 0.5,
  "keywords": ["entity1", "entity2", "entity3"]
}

Rules:
- sentiment is a number between -1 (very negative) and 1 (very positive)
- subTopics are specific topics within the domain (max 3)
- keywords are key entities mentioned (companies, people, places - max 5)
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Classification error:', error);
    throw error;
  }
}

/**
 * Generate multi-tier summaries for an article
 * @param {string} title - Article title
 * @param {string} content - Article content
 * @returns {Promise<Object>} Summary result with brief, medium, detailed, and keyPoints
 */
export async function summarizeArticle(title, content) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const prompt = `You are an expert news summarizer. Create three versions of a summary for this article.

Article Title: ${title}
Article Content: ${content}

Respond ONLY with a JSON object (no markdown, no explanations) in this exact format:
{
  "brief": "1-2 sentence summary capturing the absolute essence",
  "medium": "3-4 sentence summary with main points and context",
  "detailed": "1 paragraph comprehensive overview with key details",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"]
}

Rules:
- Be factual and objective
- Preserve important numbers and dates
- Avoid speculation
- Use clear, concise language
- keyPoints should be 3-5 actionable takeaways
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Summarization error:', error);
    throw error;
  }
}

/**
 * Generate personalized digest introduction
 * @param {Array} articles - Array of article objects
 * @param {string} userName - User's name
 * @returns {Promise<string>} Personalized introduction
 */
export async function generatePersonalizedDigest(articles, userName) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const articlesText = articles.map((a, i) => 
    `${i + 1}. [${a.domain.toUpperCase()}] ${a.title}\n   ${a.summary}`
  ).join('\n\n');
  
  const prompt = `You are writing a personalized news digest for ${userName}.

Here are today's top articles:

${articlesText}

Write a brief, engaging introduction (2-3 sentences) that:
- Welcomes the reader
- Highlights the most important or interesting story
- Sets the tone for the digest

Be conversational but professional. Make it personal.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Digest generation error:', error);
    return `Good morning, ${userName}! Here's your personalized news digest for today.`;
  }
}
```

### lib/services/redis.js

```javascript
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Check rate limit for an identifier
 * @param {string} identifier - Unique identifier (user ID, IP, etc)
 * @param {number} limit - Maximum requests allowed
 * @param {number} window - Time window in seconds
 * @returns {Promise<Object>} Rate limit result
 */
export async function checkRateLimit(identifier, limit, window) {
  const key = `rate_limit:${identifier}`;
  
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, window);
  }
  
  if (count > limit) {
    return { success: false, remaining: 0 };
  }
  
  return { success: true, remaining: limit - count };
}

/**
 * Cache article data
 * @param {string} url - Article URL
 * @param {Object} data - Article data to cache
 * @param {number} ttl - Time to live in seconds
 */
export async function cacheArticle(url, data, ttl = 3600) {
  const key = `article:${url}`;
  await redis.setex(key, ttl, JSON.stringify(data));
}

/**
 * Get cached article
 * @param {string} url - Article URL
 * @returns {Promise<Object|null>} Cached article data or null
 */
export async function getCachedArticle(url) {
  const key = `article:${url}`;
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}
```

### lib/services/resend.js

```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send digest email to user
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @returns {Promise<Object>} Send result
 */
export async function sendDigestEmail(to, subject, html) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'AI News Digest <digest@yourcompany.com>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email send exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send welcome email to new user
 * @param {string} to - Recipient email
 * @param {string} userName - User's name
 * @returns {Promise<Object>} Send result
 */
export async function sendWelcomeEmail(to, userName) {
  const html = `
    <h1>Welcome to AI News Digest, ${userName}!</h1>
    <p>Thank you for signing up. We're excited to help you stay informed.</p>
    <p>Your personalized news digests will be delivered based on your preferences.</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/preferences">Manage your preferences</a></p>
  `;

  return sendDigestEmail(to, 'Welcome to AI News Digest!', html);
}
```

### lib/utils/content-hasher.js

```javascript
import { createHash } from 'crypto';

/**
 * Generate MD5 hash for content deduplication
 * @param {string} content - Content to hash
 * @returns {string} MD5 hash
 */
export function generateContentHash(content) {
  return createHash('md5').update(content).digest('hex');
### lib/agents/scraper.js

```javascript
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { generateContentHash } from '@/lib/utils/content-hasher';
import { prisma } from '@/lib/services/db';

const rssParser = new Parser();

/**
 * Scrape articles from RSS feed
 * @param {string} url - RSS feed URL
 * @param {string} sourceId - Source ID
 * @returns {Promise<Array>} Array of articles
 */
async function scrapeRSSFeed(url, sourceId) {
  try {
    const feed = await rssParser.parseURL(url);
    const articles = [];

    for (const item of feed.items) {
      if (!item.link || !item.title) continue;

      const contentHash = generateContentHash(item.link);

      articles.push({
        sourceId: sourceId,
        title: item.title,
        url: item.link,
        rawContent: item.contentSnippet || item.content || '',
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        contentHash: contentHash,
      });
    }

    return articles;
  } catch (error) {
    console.error(`RSS scraping failed for ${url}:`, error);
    return [];
  }
}

/**
 * Scrape articles from web page
 * @param {string} url - Web page URL
 * @param {string} sourceId - Source ID
 * @returns {Promise<Array>} Array of articles
 */
async function scrapeWebPage(url, sourceId) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    const articles = [];

    // Simple scraper rule (finds all article headlines and links)
    $('a').each((i, el) => {
      const title = $(el).text().trim();
      const href = $(el).attr('href');

      if (title.length > 20 && href && href.startsWith('http')) {
        const contentHash = generateContentHash(href);
        articles.push({
          sourceId: sourceId,
          title: title,
          url: href,
          rawContent: '',
          publishedAt: new Date(),
          contentHash: contentHash,
        });
      }
    });

    return articles;
  } catch (error) {
    console.error(`Web scraping failed for ${url}:`, error);
    return [];
  }
}

/**
 * Run the scraper agent to fetch articles from all active sources
 * @returns {Promise<Array>} Array of scraped articles
 */
export async function runScraperAgent() {
  // Get active news sources
  const sources = await prisma.newsSource.findMany({
    where: { isActive: true }
  });

  const allArticles = [];

  for (const source of sources) {
    let articles = [];

    if (source.sourceType === 'rss') {
      articles = await scrapeRSSFeed(source.url, source.id);
    } else if (source.sourceType === 'scrape') {
      articles = await scrapeWebPage(source.url, source.id);
    }

    if (articles.length > 0) {
      try {
        // Bulk insert new raw articles, ignoring duplicate URLs/hashes
        await prisma.rawArticle.createMany({
          data: articles,
          skipDuplicates: true
        });
        allArticles.push(...articles);
      } catch (insertError) {
        console.error(`Failed to insert articles from ${source.name}:`, insertError);
      }

      // Update last fetched time
      await prisma.newsSource.update({
        where: { id: source.id },
        data: { lastFetchedAt: new Date() }
      });
    }
  }

  return allArticles;
}
```

### lib/agents/classifier.js

```javascript
import { prisma } from '@/lib/services/db';
import { classifyArticle } from '@/lib/services/gemini';

/**
 * Run the classifier agent to classify unprocessed articles
 * @returns {Promise<Array>} Array of classified articles
 */
export async function runClassifierAgent() {
  // Get unprocessed articles
  const rawArticles = await prisma.rawArticle.findMany({
    where: { isProcessed: false },
    take: 10 // Process in batches
  });

  if (rawArticles.length === 0) {
    console.log('No articles to classify');
    return [];
  }

  const processedArticles = [];

  for (const rawArticle of rawArticles) {
    try {
      // Classify with Gemini
      const classification = await classifyArticle(
        rawArticle.title,
        rawArticle.rawContent || ''
      );

      // Insert into articles table
      const article = await prisma.article.create({
        data: {
          rawArticleId: rawArticle.id,
          title: rawArticle.title,
          url: rawArticle.url,
          domain: classification.domain,
          subTopics: classification.subTopics,
          sentiment: classification.sentiment,
          keywords: classification.keywords,
          publishedAt: rawArticle.publishedAt,
        }
      });

      // Mark raw article as processed
      await prisma.rawArticle.update({
        where: { id: rawArticle.id },
        data: { isProcessed: true }
      });

      processedArticles.push(article);

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Classification failed for article ${rawArticle.id}:`, error);
    }
  }

  return processedArticles;
}
```

### lib/agents/summarizer.js

```javascript
import { prisma } from '@/lib/services/db';
import { summarizeArticle } from '@/lib/services/gemini';

/**
 * Run the summarizer agent to create summaries for articles
 * @returns {Promise<Array>} Array of created summaries
 */
export async function runSummarizerAgent() {
  // Get articles without summaries
  const articlesWithoutSummaries = await prisma.article.findMany({
    where: {
      summaries: null
    },
    include: {
      rawArticle: {
        select: { rawContent: true }
      }
    },
    take: 10
  });

  if (articlesWithoutSummaries.length === 0) {
    console.log('All articles already have summaries');
    return [];
  }

  const summaries = [];

  for (const article of articlesWithoutSummaries) {
    try {
      const rawContent = article.rawArticle?.rawContent || '';

      // Generate summary with Gemini
      const summary = await summarizeArticle(article.title, rawContent);

      // Insert summary
      const insertedSummary = await prisma.articleSummary.create({
        data: {
          articleId: article.id,
          summaryBrief: summary.brief,
          summaryMedium: summary.medium,
          summaryDetailed: summary.detailed,
          keyPoints: summary.keyPoints,
        }
      });

      summaries.push(insertedSummary);

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Summarization failed for article ${article.id}:`, error);
    }
  }

  return summaries;
}
```

### lib/agents/digest-generator.js

```javascript
import { prisma } from '@/lib/services/db';
import { generatePersonalizedDigest } from '@/lib/services/gemini';
import { render } from '@react-email/render';
import DigestEmail from '@/emails/digest-template';

/**
 * Generate digest for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Generated digest or null
 */
export async function generateDigestForUser(userId) {
  // Get user info and preferences
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      preferences: true,
      subscriptions: true
    }
  });

  if (!user) {
    console.error('Failed to fetch user:', userId);
    return null;
  }

  // Get user's subscribed domains
  const subscribedDomains = user.subscriptions
    .filter(sub => sub.isActive)
    .map(sub => sub.domain);

  if (subscribedDomains.length === 0) {
    console.log(`User ${userId} has no active subscriptions`);
    return null;
  }

  // Get articles from last 24 hours in subscribed domains
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const articles = await prisma.article.findMany({
    where: {
      domain: { in: subscribedDomains },
      publishedAt: { gte: yesterday }
    },
    include: {
      summaries: true
    },
    orderBy: {
      publishedAt: 'desc'
    },
    take: 10
  });

  if (articles.length === 0) {
    console.log(`No articles found for user ${userId}`);
    return null;
  }

  // Prepare article data for email
  const summaryLength = user.preferences?.summaryLength || 'medium';
  const emailArticles = articles.map(article => {
    let summaryText = article.title;
    if (article.summaries) {
      if (summaryLength === 'brief') summaryText = article.summaries.summaryBrief;
      else if (summaryLength === 'medium') summaryText = article.summaries.summaryMedium;
      else if (summaryLength === 'detailed') summaryText = article.summaries.summaryDetailed;
    }

    return {
      title: article.title,
      summary: summaryText,
      url: article.url,
      domain: article.domain,
      keyPoints: article.summaries?.keyPoints || [],
    };
  });

  // Generate personalized introduction
  const userName = user.fullName || user.email.split('@')[0];
  const introduction = await generatePersonalizedDigest(
    emailArticles,
    userName
  );

  // Render email HTML
  const emailHtml = render(
    <DigestEmail
      userName={userName}
      introduction={introduction}
      articles={emailArticles}
    />
  );

  // Queue email
  const queuedEmail = await prisma.emailQueue.create({
    data: {
      userId: userId,
      subject: `Your Daily News Digest - ${new Date().toLocaleDateString()}`,
      htmlContent: emailHtml,
      scheduledFor: new Date(),
      status: 'pending',
    }
  });

  return queuedEmail;
}

/**
 * Run digest generator for all active users
 * @returns {Promise<Array>} Array of generated digests
 */
export async function runDigestGeneratorAgent() {
  // Get all active users
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true }
  });

  const digests = [];

  for (const user of users) {
    try {
      const digest = await generateDigestForUser(user.id);
      if (digest) {
        digests.push(digest);
      }
    } catch (error) {
      console.error(`Failed to generate digest for user ${user.id}:`, error);
    }
  }

  return digests;
}
```

### lib/agents/email-sender.js

```javascript
import { prisma } from '@/lib/services/db';
import { sendDigestEmail } from '@/lib/services/resend';
import { checkRateLimit } from '@/lib/services/redis';

/**
 * Run email sender agent to process pending emails
 * @returns {Promise<Array>} Array of sent emails
 */
export async function runEmailSenderAgent() {
  // Get pending emails
  const emails = await prisma.emailQueue.findMany({
    where: {
      status: 'pending',
      scheduledFor: { lte: new Date() }
    },
    include: {
      user: {
        select: { email: true }
      }
    },
    take: 50
  });

  if (emails.length === 0) {
    console.log('No pending emails to send');
    return [];
  }

  const sentEmails = [];

  for (const email of emails) {
    try {
      // Check rate limit (100 emails per hour)
      const rateLimitCheck = await checkRateLimit('email_sender', 100, 3600);
      
      if (!rateLimitCheck.success) {
        console.log('Rate limit reached, stopping');
        break;
      }

      // Send email
      const result = await sendDigestEmail(
        email.user.email,
        email.subject,
        email.htmlContent
      );

      if (result.success) {
        // Update email status
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
          }
        });

        sentEmails.push(email);
      } else {
        // Update error status
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: {
            status: 'failed',
            errorMessage: result.error,
            retryCount: email.retryCount + 1,
          }
        });
      }

      // Small delay between sends
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to send email ${email.id}:`, error);
    }
  }

  return sentEmails;
}

### app/api/cron/scrape-news/route.js

```javascript
import { NextResponse } from 'next/server';
import { runScraperAgent } from '@/lib/agents/scraper';

export async function GET(request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const articles = await runScraperAgent();
    
    return NextResponse.json({
      success: true,
      articlesScraped: articles.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Scraper cron failed:', error);
    
    return NextResponse.json(
      { error: 'Scraping failed', message: error.message },
      { status: 500 }
    );
  }
}
```

### app/api/cron/classify-articles/route.js

```javascript
import { NextResponse } from 'next/server';
import { runClassifierAgent } from '@/lib/agents/classifier';

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const articles = await runClassifierAgent();
    
    return NextResponse.json({
      success: true,
      articlesClassified: articles.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Classifier cron failed:', error);
    
    return NextResponse.json(
      { error: 'Classification failed', message: error.message },
      { status: 500 }
    );
  }
}
```

### app/api/cron/summarize-articles/route.js

```javascript
import { NextResponse } from 'next/server';
import { runSummarizerAgent } from '@/lib/agents/summarizer';

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const summaries = await runSummarizerAgent();
    
    return NextResponse.json({
      success: true,
      summariesCreated: summaries.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Summarizer cron failed:', error);
    
    return NextResponse.json(
      { error: 'Summarization failed', message: error.message },
      { status: 500 }
    );
  }
}
```

### app/api/cron/generate-digests/route.js

```javascript
import { NextResponse } from 'next/server';
import { runDigestGeneratorAgent } from '@/lib/agents/digest-generator';

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const digests = await runDigestGeneratorAgent();
    
    return NextResponse.json({
      success: true,
      digestsGenerated: digests.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Digest generator cron failed:', error);
    
    return NextResponse.json(
      { error: 'Digest generation failed', message: error.message },
      { status: 500 }
    );
  }
}
```

### app/api/cron/send-emails/route.js

```javascript
import { NextResponse } from 'next/server';
import { runEmailSenderAgent } from '@/lib/agents/email-sender';

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const emails = await runEmailSenderAgent();
    
    return NextResponse.json({
      success: true,
      emailsSent: emails.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Email sender cron failed:', error);
    
    return NextResponse.json(
      { error: 'Email sending failed', message: error.message },
      { status: 500 }
    );
  }
}
```

### vercel.json

```json
{
  "crons": [
    {
      "path": "/api/cron/scrape-news",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/classify-articles",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/summarize-articles",
      "schedule": "*/30 * * * *"
    },
    {
      "path": "/api/cron/generate-digests",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/cron/send-emails",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

---

## 📧 Email Template (JSX)

### emails/digest-template.jsx

```javascript
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export default function DigestEmail({ userName, introduction, articles }) {
  return (
    <Html>
      <Head />
      <Preview>Your daily news digest is ready</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Good morning, {userName}! 🌅</Heading>
          
          <Text style={text}>{introduction}</Text>
          
          {articles.map((article, index) => (
            <Section key={index} style={articleSection}>
              <Text style={domain}>{article.domain.toUpperCase()}</Text>
              <Heading style={h2}>{article.title}</Heading>
              <Text style={summary}>{article.summary}</Text>
              
              {article.keyPoints && article.keyPoints.length > 0 && (
                <div style={keyPointsContainer}>
                  <Text style={keyPointsTitle}>Key Points:</Text>
                  <ul style={keyPointsList}>
                    {article.keyPoints.map((point, i) => (
                      <li key={i} style={keyPoint}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <Link href={article.url} style={link}>
                Read full article →
              </Link>
            </Section>
          ))}
          
          <Section style={footer}>
            <Text style={footerText}>
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/preferences`}>
                Manage preferences
              </Link>
              {' · '}
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe`}>
                Unsubscribe
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '32px',
  fontWeight: '700',
  margin: '40px 0 20px',
  padding: '0 40px',
};

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '24px',
  padding: '0 40px',
};

const articleSection = {
  padding: '24px 40px',
  borderBottom: '1px solid #e6e6e6',
};

const domain = {
  color: '#0070f3',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '0.5px',
  margin: '0 0 8px',
};

const h2 = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 12px',
  lineHeight: '28px',
};

const summary = {
  color: '#484848',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0 0 16px',
};

const keyPointsContainer = {
  backgroundColor: '#f8f9fa',
  borderRadius: '6px',
  padding: '16px',
  margin: '16px 0',
};

const keyPointsTitle = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px',
};

const keyPointsList = {
  margin: '0',
  paddingLeft: '20px',
};

const keyPoint = {
  color: '#484848',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '4px 0',
};

const link = {
  color: '#0070f3',
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'none',
};

const footer = {
  padding: '24px 40px',
};

const footerText = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center',
};
```

---

## 🎨 Example UI Component (JSX)

### components/dashboard/SubscriptionManager.jsx

```javascript
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/services/supabase';

export default function SubscriptionManager({ userId }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const domains = ['finance', 'technology', 'health', 'politics', 'sports'];

  useEffect(() => {
    fetchSubscriptions();
  }, [userId]);

  async function fetchSubscriptions() {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching subscriptions:', error);
    } else {
      setSubscriptions(data || []);
    }
    setLoading(false);
  }

  async function toggleSubscription(domain) {
    const existing = subscriptions.find(sub => sub.domain === domain);

    if (existing) {
      // Toggle active status
      const { error } = await supabase
        .from('subscriptions')
        .update({ is_active: !existing.is_active })
        .eq('id', existing.id);

      if (!error) {
        fetchSubscriptions();
      }
    } else {
      // Create new subscription
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          domain: domain,
          is_active: true,
        });

      if (!error) {
        fetchSubscriptions();
      }
    }
  }

  if (loading) {
    return <div>Loading subscriptions...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Manage Your Subscriptions</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {domains.map((domain) => {
          const subscription = subscriptions.find(sub => sub.domain === domain);
          const isActive = subscription?.is_active || false;

          return (
            <div
              key={domain}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                isActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleSubscription(domain)}
            >
              <h3 className="text-lg font-semibold capitalize mb-2">
                {domain}
              </h3>
              <p className="text-sm text-gray-600">
                {isActive ? 'Subscribed ✓' : 'Click to subscribe'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## 🚀 Getting Started

```bash
# 1. Create Next.js project (JavaScript)
npx create-next-app@latest ai-news-digest --js --tailwind --app

# 2. Install dependencies
npm install @supabase/supabase-js @google/generative-ai resend react-email
npm install @upstash/redis cheerio rss-parser

# 3. Set up Supabase
npx supabase init
npx supabase start

# 4. Run migrations
npx supabase db push

# 5. Create .env.local with your keys

# 6. Start development
npm run dev
```

---

This implementation guide provides everything in JSX/JavaScript. You can now build the entire project without TypeScript!
