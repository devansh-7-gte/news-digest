# AI News Digest - Agentic News Summarization Service (JSX Version)

## 🎯 Project Overview

A production-grade, agentic AI service that autonomously scrapes news from multiple sources, intelligently categorizes content by domain (Finance, Tech, etc.), generates concise summaries using Google's Gemini LLM, and delivers personalized email digests to registered users.

**Why This Project Stands Out:**
- **Full-stack mastery**: Next.js 14 (App Router with JSX), Supabase/PostgreSQL
- **AI/LLM integration**: Gemini API with intelligent prompt engineering
- **Distributed systems**: Cron jobs, background workers, event-driven architecture
- **Real-world scalability**: Database design, caching, rate limiting
- **DevOps**: Docker, CI/CD, monitoring, error handling

---

## 🏗️ Technology Stack

### Frontend
- **Next.js 14** (App Router with Server Components)
- **JavaScript (JSX)** - No TypeScript
- **Tailwind CSS** + **Framer Motion** (animations)
- **shadcn/ui** (component library)
- **Zustand** or **TanStack Query** (state management)

### Backend & Database
**Supabase + Neon PostgreSQL**

| Aspect | Supabase + Neon | Traditional MERN |
|--------|----------------|------------------|
| **Learning Curve** | PostgreSQL (industry standard), edge functions, real-time subscriptions, RLS | Familiar but less impressive |
| **Scalability** | Serverless Postgres, auto-scaling, connection pooling | Manual scaling, cluster management |
| **Resume Appeal** | Modern, cutting-edge stack shows adaptability | Common, expected stack |
| **Auth** | Built-in with JWT, OAuth providers | Requires manual implementation |
| **Developer Experience** | Instant APIs, real-time subscriptions | Manual API creation |

### AI & Processing
- **Google Gemini API** (2.0 Flash - fast, cost-effective)
- **Cheerio** / **Puppeteer** (web scraping)
- **Vercel Cron Jobs** (scheduled tasks)
- **Upstash Redis** (caching, rate limiting)

### Email & Communication
- **Resend** (modern email API)
- **React Email** (JSX-based email templates)

### DevOps & Monitoring
- **Vercel** (deployment)
- **Sentry** (error tracking)
- **Upstash QStash** (job queue for async processing)
- **Docker** (local dev environment)

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  Next.js 14 App (SSR + Client Components)                   │
│  - Dashboard (news preferences, digest history)              │
│  - Admin Panel (monitor scraping jobs, user analytics)       │
│  - Authentication (Supabase Auth)                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│  Route Handlers (/app/api/*)                                │
│  - /api/users (CRUD user preferences)                       │
│  - /api/subscriptions (manage topics)                       │
│  - /api/digest/preview (real-time digest generation)        │
│  - /api/webhooks (QStash callbacks)                         │
│                                                              │
│  Server Actions (app/actions/*)                             │
│  - User preference mutations                                │
│  - Digest regeneration requests                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AGENT ORCHESTRATION                       │
├─────────────────────────────────────────────────────────────┤
│  Cron Jobs (Vercel Cron / QStash)                           │
│                                                              │
│  1. News Scraper Agent (runs hourly)                        │
│     ├─ Fetch from RSS feeds                                 │
│     ├─ Scrape website articles (Cheerio/Puppeteer)          │
│     ├─ Extract: title, content, URL, publish date           │
│     └─ Store in raw_articles table                          │
│                                                              │
│  2. Classification Agent (runs every 15 min)                │
│     ├─ Fetch unclassified articles                          │
│     ├─ Use Gemini to categorize (Finance/Tech/etc)          │
│     ├─ Extract keywords, sentiment                          │
│     └─ Update article metadata                              │
│                                                              │
│  3. Summarization Agent (runs every 30 min)                 │
│     ├─ Fetch unsummarized articles                          │
│     ├─ Use Gemini with domain-specific prompts              │
│     ├─ Generate 3-tier summaries (brief/medium/detailed)    │
│     └─ Store in article_summaries table                     │
│                                                              │
│  4. Digest Generation Agent (runs daily at user-set times)  │
│     ├─ Fetch user preferences & subscriptions               │
│     ├─ Aggregate relevant articles (last 24h)               │
│     ├─ Use Gemini to create personalized digest             │
│     ├─ Generate HTML email (React Email)                    │
│     └─ Queue for sending                                    │
│                                                              │
│  5. Email Delivery Agent (runs every 5 min)                 │
│     ├─ Fetch pending emails from queue                      │
│     ├─ Send via Resend API                                  │
│     ├─ Handle rate limits (Upstash Redis)                   │
│     └─ Update delivery status                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA & STORAGE LAYER                      │
├─────────────────────────────────────────────────────────────┤
│  Neon PostgreSQL (via Supabase)                             │
│  - users, user_preferences, subscriptions                   │
│  - news_sources, raw_articles, article_summaries            │
│  - email_queue, delivery_logs                               │
│  - analytics_events                                         │
│                                                              │
│  Upstash Redis                                              │
│  - Rate limiting (per-user, per-source)                     │
│  - Caching (article deduplication, API responses)           │
│  - Session storage                                          │
│                                                              │
│  Supabase Storage                                           │
│  - User profile images                                      │
│  - Email template assets                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                        │
├─────────────────────────────────────────────────────────────┤
│  - Google Gemini API (summarization, classification)        │
│  - Resend (email delivery)                                  │
│  - News RSS Feeds (TechCrunch, Reuters, Bloomberg)          │
│  - Sentry (error tracking)                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

```prisma
// prisma/schema.prisma

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

---

## 📁 Project Structure (JSX Version)

```
ai-news-digest/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.jsx
│   │   └── signup/
│   │       └── page.jsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.jsx
│   │   ├── preferences/
│   │   │   └── page.jsx
│   │   ├── subscriptions/
│   │   │   └── page.jsx
│   │   └── history/
│   │       └── page.jsx
│   ├── (admin)/
│   │   ├── admin/
│   │   │   └── page.jsx
│   │   └── analytics/
│   │       └── page.jsx
│   ├── api/
│   │   ├── auth/
│   │   ├── users/
│   │   │   └── route.js
│   │   ├── subscriptions/
│   │   │   └── route.js
│   │   ├── digest/
│   │   │   └── route.js
│   │   ├── cron/
│   │   │   ├── scrape-news/
│   │   │   │   └── route.js
│   │   │   ├── classify-articles/
│   │   │   │   └── route.js
│   │   │   ├── summarize-articles/
│   │   │   │   └── route.js
│   │   │   ├── generate-digests/
│   │   │   │   └── route.js
│   │   │   └── send-emails/
│   │   │       └── route.js
│   │   └── webhooks/
│   │       └── route.js
│   ├── actions/
│   │   ├── user-actions.js
│   │   ├── subscription-actions.js
│   │   └── digest-actions.js
│   ├── layout.jsx
│   └── page.jsx
├── lib/
│   ├── agents/
│   │   ├── scraper.js
│   │   ├── classifier.js
│   │   ├── summarizer.js
│   │   ├── digest-generator.js
│   │   └── email-sender.js
│   ├── services/
│   │   ├── gemini.js
│   │   ├── resend.js
│   │   ├── redis.js
│   │   └── supabase.js
│   ├── scrapers/
│   │   ├── rss-scraper.js
│   │   ├── web-scraper.js
│   │   └── scraper-factory.js
│   ├── db/
│   │   ├── schema.js
│   │   ├── queries.js
│   │   └── migrations/
│   ├── utils/
│   │   ├── content-hasher.js
│   │   ├── rate-limiter.js
│   │   └── validators.js
│   └── types/
│       └── index.js
├── components/
│   ├── ui/ (shadcn components in JSX)
│   ├── dashboard/
│   │   ├── PreferencesForm.jsx
│   │   ├── SubscriptionManager.jsx
│   │   └── DigestHistory.jsx
│   ├── email-templates/
│   │   └── DigestEmail.jsx
│   └── admin/
│       ├── SourceManager.jsx
│       └── Analytics.jsx
├── emails/
│   ├── digest-template.jsx
│   └── welcome-email.jsx
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── scripts/
│   ├── seed-sources.js
│   └── test-agents.js
├── tests/
│   ├── agents/
│   ├── api/
│   └── integration/
├── .env.local
├── .env.example
├── docker-compose.yml
├── next.config.js
├── jsconfig.json
└── package.json
```

---

## 🚀 Implementation Roadmap

For a detailed daily schedule, process tracking, and progress logs, please refer to the [Sprint Roadmap](file:///a:/news-digest/workflow/sprint-roadmap.md).

### Phase 1: Foundation & Infrastructure (Week 1)
- [ ] Initialize Next.js 14 project templates & dependencies.
- [ ] Configure Supabase and Neon PostgreSQL database and deploy schemas.
- [ ] Set up authentication flows with Supabase Auth.
- [ ] Configure clients for Gemini AI, Upstash Redis, and Resend.
- [ ] Implement core utilities (errors, logger, cache, rate-limiter, content-hasher).

### Phase 2: Ingestion & AI Agents (Week 2)
- [ ] Build RSS & dynamic Cheerio/Puppeteer scrapers.
- [ ] Write Scraper Ingestion Agent with hashing-based deduplication.
- [ ] Develop Gemini Classifier Agent for domain/topic mapping and sentiment analysis.
- [ ] Build Gemini Summarizer Agent to output multi-tier summaries.
- [ ] Add local seeding and agent test runner scripts.

### Phase 3: Web Portal & Core Actions (Week 3)
- [ ] Build Landing page and responsive Auth layouts.
- [ ] Design User Dashboard, subscription forms, and history views.
- [ ] Secure frontend fields with Zod validator schemas.
- [ ] Write Server Actions and backend REST APIs with rate limiting middlewares.

### Phase 4: Delivery, Automation & Launch (Week 4)
- [ ] Design newsletters with React Email templates.
- [ ] Program Digest Generator Agent to match subscriptions and build queue.
- [ ] Implement Queue Sender Agent using Resend API with rate limits & retries.
- [ ] Secure cron endpoints under Vercel Cron and Upstash QStash.
- [ ] Configure Docker settings, Sentry telemetry, and deploy to Vercel.

---

## 📝 Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Neon Database
DATABASE_URL=your_neon_connection_string

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Resend
RESEND_API_KEY=your_resend_api_key

# Upstash Redis
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# QStash
QSTASH_CURRENT_SIGNING_KEY=your_qstash_key
QSTASH_NEXT_SIGNING_KEY=your_qstash_next_key
QSTASH_TOKEN=your_qstash_token

# Cron Secret
CRON_SECRET=your_random_secret

# Sentry
SENTRY_DSN=your_sentry_dsn

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📊 Learning Outcomes

By building this project in JSX, you'll master:

### JavaScript & JSX
- **Modern JavaScript**: ES6+, async/await, destructuring, spread operators
- **JSX Patterns**: Component composition, prop drilling, children patterns
- **State Management**: Hooks (useState, useEffect, useReducer)
- **API Integration**: Fetch, error handling, loading states

### Database & Backend
- **PostgreSQL**: Complex queries, joins, indexes, migrations
- **Supabase**: Row Level Security, Edge Functions, real-time subscriptions
- **API Design**: RESTful endpoints, server actions, webhook handlers
- **Caching Strategies**: Redis for rate limiting, session storage

### AI/LLM Engineering
- **Prompt Engineering**: Few-shot learning, chain-of-thought reasoning
- **Model Selection**: Choosing the right model for tasks
- **Error Handling**: Retries, fallbacks, rate limiting
- **Cost Optimization**: Token management, caching responses

### Distributed Systems
- **Cron Jobs**: Scheduled task execution
- **Job Queues**: Async processing with QStash
- **Event-Driven Architecture**: Webhooks, callbacks
- **Rate Limiting**: Preventing API abuse

---

## 💡 Resume Highlights

When presenting this project:

**Technical Achievements:**
- "Built a scalable agentic AI system processing 10,000+ articles daily"
- "Implemented multi-agent orchestration with autonomous scheduling"
- "Designed a PostgreSQL schema with RLS for multi-tenant architecture"
- "Integrated Gemini LLM with custom prompt engineering for 95% classification accuracy"
- "Achieved 99.9% email delivery rate with robust retry mechanisms"

**Technical Skills Demonstrated:**
```
Frontend: Next.js 14, JavaScript/JSX, React, Tailwind CSS, Framer Motion
Backend: Node.js, Supabase, PostgreSQL, Edge Functions
AI/ML: Google Gemini, Prompt Engineering, NLP, Classification
Infrastructure: Vercel, Redis, Docker, QStash, Sentry
Tools: Git, GitHub Actions, Supabase CLI
```

---

## 🚦 Getting Started (JSX Version)

```bash
# 1. Clone and install
git clone https://github.com/yourusername/ai-news-digest
cd ai-news-digest
npm install

# 2. Set up Supabase project
npx supabase init
npx supabase start

# 3. Run migrations
npx supabase db push

# 4. Seed data
npm run seed

# 5. Start development server
npm run dev

# 6. Run tests
npm test
```

---

## 🎯 Final Thoughts

This project is a **complete full-stack showcase in JSX** that demonstrates:
- Modern JavaScript development practices
- AI/LLM integration skills
- Distributed systems knowledge
- Production-ready engineering

The Supabase + Neon stack gives you:
- **PostgreSQL expertise** (industry standard)
- **Serverless architecture** (modern scaling)
- **Real-time capabilities** (competitive advantage)
- **Modern API patterns** (auto-generated REST APIs)

**Estimated Time to MVP**: 4 weeks (condensed sprint)
**Estimated Cost**: ~$20/month (free tiers + minimal paid usage)

Good luck building! 🚀
