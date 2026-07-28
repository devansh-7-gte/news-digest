# ⚡ SwiftIQ (AI News Digest) — Complete Architecture, Workflow & Tech Stack Specification

> **Single Source of Truth Document**  
> **Project**: SwiftIQ / AI News Digest (`swiftiq`)  
> **Location**: `workflow/ARCHITECTURE_AND_WORKFLOW.md`  
> **Last Updated**: July 2026

---

## 🎯 1. Core Purpose & Value Proposition

### 1.1 Core Mission
**SwiftIQ** is an autonomous, AI-driven news intelligence and automated digest platform built for high-throughput decision-makers, tech executives, financial analysts, and market operators. The primary goal of SwiftIQ is **noise elimination**: converting an overwhelming flood of raw RSS feeds, online news articles, and media updates into ultra-high-density, multi-tier, sentiment-analyzed intelligence delivered straight to user inboxes and interactive web dashboards.

### 1.2 Key Problems Solved
- **Information Overload & Clutter**: Eliminates fluff, clickbait, and repetitive reporting across top news outlets.
- **Manual Curation Fatigue**: Replaces manual newsletter curation with an autonomous end-to-end multi-agent pipeline (**Scrape ➔ Classify ➔ Summarize ➔ Personalized Queue ➔ Dispatch**).
- **One-Size-Fits-All Newsletters**: Delivers customized digests matching individual user preferences for domain categories (`finance`, `technology`, `health`, `politics`, `sports`), delivery schedules, and summary detail levels (`brief`, `medium`, `detailed`).

---

## 🛠️ 2. Technology Stack & Ecosystem

SwiftIQ is engineered on a modern JavaScript/TypeScript stack utilizing serverless edge patterns, AI models, relational and cache persistence layers, and transactional mail services.

```
+-----------------------------------------------------------------------------------+
|                                  SWIFTIQ TECH STACK                                |
+-----------------------------------------------------------------------------------+
|  Frontend        | Next.js 14 App Router, React 18, Tailwind CSS, Lucide React,  |
|                  | Framer Motion, TanStack Query (React Query v5), Zustand       |
+------------------+----------------------------------------------------------------+
|  Backend & API   | Next.js API Routes (Node.js runtime), Supabase Auth & SSR,     |
|                  | Server Actions, Prisma ORM v5, Zod Schema Validation           |
+------------------+----------------------------------------------------------------+
|  AI & Intelligence| Google Gemini 2.0 / 1.5 Flash SDK (`@google/generative-ai`)  |
|                  | Multi-stage prompt engine (Domain, Sentiment, Key Points, Summaries)|
+------------------+----------------------------------------------------------------+
|  Data Ingestion  | RSS Parser (`rss-parser`), Cheerio (`cheerio`), Puppeteer,     |
|                  | Content Hash Deduplication (`crypto` SHA-256)                  |
+------------------+----------------------------------------------------------------+
|  Database & Cache| Supabase PostgreSQL Database, Prisma ORM, Upstash Redis &     |
|                  | Upstash QStash (Distributed queuing and rate-limiting)        |
+------------------+----------------------------------------------------------------+
|  Email Dispatch  | Resend Email API, React Email (`@react-email/components`),     |
|                  | Responsive Cyber-Dark HTML Email Templates                     |
+------------------+----------------------------------------------------------------+
|  DevOps & Testing| Jest, React Testing Library, ESLint, Prettier, PostCSS,        |
|                  | Custom CLI Runners & Local Cron Schedulers (`tsx` engine)      |
+-----------------------------------------------------------------------------------+
```

### 2.1 Core Dependencies & Libraries
- **`next` (`14.2.35`)**: App router framework handling SSR, Client Components, and API routes.
- **`@google/generative-ai` (`^0.24.1`)**: Google Gemini AI model client for zero-shot article classification, sentiment rating, and multi-tier summarization.
- **`@prisma/client` & `prisma` (`^5.15.0`)**: Type-safe ORM connecting to Supabase PostgreSQL.
- **`@supabase/auth-helpers-nextjs` & `@supabase/supabase-js` (`^2.38.0`)**: User authentication, session management, and database client.
- **`@upstash/redis` & `@upstash/qstash`**: Redis caching, deduplication tracking, and distributed task/cron scheduling.
- **`resend` & `@react-email/components`**: Transactional email generation and rendering engine.
- **`rss-parser` & `cheerio` & `puppeteer`**: Robust scraping tools for pulling RSS feeds and scraping JS-rendered web content.
- **`framer-motion` & `lucide-react`**: Smooth UI animations and modern dark-theme iconography.

---

## 🏛️ 3. End-to-End System Architecture

The following diagram illustrates the component architecture and data flow between the user interface, autonomous agent pipeline, persistence layer, and external services.

```mermaid
graph TD
    subgraph Client Layer
        Browser[Client Web Dashboard / Mobile]
        EmailClient[User Email Inbox]
    end

    subgraph App Layer - Next.js 14
        Middleware[Auth & Session Middleware]
        APIRoutes[REST API Routes /api/*]
        CronRoutes[Cron Pipeline Endpoints /api/cron/*]
        ReactEmail[React Email Component Engine]
    end

    subgraph Auth & Identity
        SupabaseAuth[Supabase Auth Service]
    end

    subgraph Autonomous AI Agent Pipeline
        AgentScraper[1. Scraper Agent]
        AgentClassifier[2. Classifier Agent]
        AgentSummarizer[3. Summarizer Agent]
        AgentDigestGen[4. Digest Generator Agent]
        AgentEmailSender[5. Email Sender Agent]
    end

    subgraph Intelligence Engine
        Gemini[Google Gemini 2.0 Flash AI]
    end

    subgraph Data & Storage Layer
        PrismaPostgres[(PostgreSQL Database)]
        UpstashRedis[(Upstash Redis Cache)]
    end

    subgraph External Dispatch
        ResendAPI[Resend Email Delivery API]
        ExternalFeeds[External News Outlets & RSS Feeds]
    end

    %% Flow Connections
    Browser --> Middleware
    Middleware --> APIRoutes
    APIRoutes --> PrismaPostgres
    APIRoutes --> SupabaseAuth

    CronRoutes --> AgentScraper
    AgentScraper --> ExternalFeeds
    AgentScraper --> UpstashRedis
    AgentScraper --> PrismaPostgres

    CronRoutes --> AgentClassifier
    AgentClassifier --> PrismaPostgres
    AgentClassifier --> Gemini

    CronRoutes --> AgentSummarizer
    AgentSummarizer --> PrismaPostgres
    AgentSummarizer --> Gemini

    CronRoutes --> AgentDigestGen
    AgentDigestGen --> PrismaPostgres

    CronRoutes --> AgentEmailSender
    AgentEmailSender --> PrismaPostgres
    AgentEmailSender --> ReactEmail
    ReactEmail --> ResendAPI
    ResendAPI --> EmailClient
```

---

## 🔄 4. Complete Application Workflow & Processing Pipelines

The system operates through an **autonomous 5-stage processing pipeline**. Each step is decoupled, resilient, idempotent, and capable of running via automated cron triggers or background runner scripts.

```mermaid
sequenceDiagram
    autonumber
    participant Cron as Cron / Scheduler
    participant Scraper as 1. Scraper Agent
    participant Classifier as 2. Classifier Agent
    participant Summarizer as 3. Summarizer Agent
    participant DigestGen as 4. Digest Generator
    participant EmailSender as 5. Email Sender Agent
    participant DB as PostgreSQL (Prisma)
    participant Gemini as Google Gemini AI
    participant Resend as Resend API

    %% Stage 1
    Cron->>Scraper: Trigger /api/cron/scrape
    Scraper->>DB: Fetch Active NewsSources
    Scraper->>Scraper: Parse RSS Feeds & HTML Web Content
    Scraper->>Scraper: Compute SHA-256 Content Hashes
    Scraper->>DB: Insert Unprocessed RawArticles (skip duplicates)

    %% Stage 2
    Cron->>Classifier: Trigger /api/cron/classify
    Classifier->>DB: Fetch Unprocessed RawArticles
    Classifier->>Gemini: Classify Domain, SubTopics, Sentiment (-1 to +1) & Keywords
    Gemini-->>Classifier: Return Structured JSON Classification
    Classifier->>DB: Insert Transformed Articles & mark RawArticle isProcessed=true

    %% Stage 3
    Cron->>Summarizer: Trigger /api/cron/summarize
    Summarizer->>DB: Fetch Articles missing Summaries
    Summarizer->>Gemini: Generate 3-Tier Summaries (Brief, Medium, Detailed) + Key Points
    Gemini-->>Summarizer: Return Structured Summaries JSON
    Summarizer->>DB: Insert ArticleSummary Records

    %% Stage 4
    Cron->>DigestGen: Trigger /api/cron/generate-digests
    DigestGen->>DB: Query Active Users & UserPreferences
    DigestGen->>DB: Match User Subscriptions against Recent Synthesized Articles
    DigestGen->>DB: Queue Personal Digests in EmailQueue (Status: pending)

    %% Stage 5
    Cron->>EmailSender: Trigger /api/cron/send-emails
    EmailSender->>DB: Fetch Pending EmailQueue Items
    EmailSender->>EmailSender: Render HTML via React Email Template
    EmailSender->>Resend: Send Transactional Email
    Resend-->>EmailSender: Email Delivered Confirmation
    EmailSender->>DB: Update EmailQueue Status to "sent" & Log AnalyticsEvent
```

---

### 4.1 Detailed Breakdown of Pipeline Stages

#### Stage 1: Feed Ingestion (`Scraper Agent`)
- **File**: `src/lib/agents/scraper.js`
- **Functionality**:
  - Queries active sources from `NewsSource` table (e.g. Hacker News, TechCrunch, Wall Street Journal, Reuters, Bloomberg, etc.).
  - Extracts title, URL, published date, and raw article text/HTML.
  - Generates a SHA-256 hash of the content URL or body (`content_hash`).
  - Skips already ingested articles to ensure zero duplicate records in `RawArticle`.

#### Stage 2: AI Classification & Sentiment Tagging (`Classifier Agent`)
- **File**: `src/lib/agents/classifier.js`
- **Functionality**:
  - Batches raw articles where `isProcessed` is `false`.
  - Prompts Gemini 2.0 Flash to evaluate content and assign:
    1. **Primary Domain**: `technology`, `finance`, `health`, `politics`, or `sports`.
    2. **Sub-Topics**: Micro-tags (e.g., `["AI", "SaaS", "Semiconductors"]`).
    3. **Sentiment Score**: Decimal value between `-1.00` (very negative/bearish) and `+1.00` (very positive/bullish).
    4. **Keywords**: Key entity tags for quick searching.
  - Inserts populated record into `Article` table and marks `RawArticle.isProcessed = true`.

#### Stage 3: Multi-Tier AI Summarization (`Summarizer Agent`)
- **File**: `src/lib/agents/summarizer.js`
- **Functionality**:
  - Identifies articles lacking an associated `ArticleSummary`.
  - Engages Gemini AI to generate three levels of density:
    - **`summaryBrief`**: 1-2 sentence core takeaway for ultra-fast reading.
    - **`summaryMedium`**: Concise 1-paragraph synthesis.
    - **`summaryDetailed`**: Comprehensive multi-paragraph analysis with context.
    - **`keyPoints`**: Array of 3-5 bullet points covering vital metrics, quotes, and conclusions.
  - Saves outcome into `ArticleSummary` table with `modelUsed: "gemini-2.0-flash"`.

#### Stage 4: Custom Digest Assembly (`Digest Generator Agent`)
- **File**: `src/lib/agents/digest-generator.js`
- **Functionality**:
  - Evaluates active users against their `UserPreference` configuration (Frequency: `daily`, `twice_daily`, `weekly`; Scheduled Time; Preferred Summary Length).
  - Fetches user domain subscriptions from `Subscription` table.
  - Filters articles matching user domains and published within the target delivery window.
  - Compiles personalized digest payloads and inserts them into `EmailQueue` with `status: "pending"`.

#### Stage 5: Transactional Delivery & Analytics (`Email Sender Agent`)
- **File**: `src/lib/agents/email-sender.js`
- **Functionality**:
  - Pulls `pending` items scheduled for execution from `EmailQueue`.
  - Renders email markup using the Cyber-Dark `@react-email` template (`emails/digest-template.jsx`).
  - Calls `resend.emails.send()`.
  - On success, updates `sentAt` timestamp and sets status to `sent`.
  - On failure, increments `retryCount`, logs `errorMessage`, and retains item for retry.
  - Records an `AnalyticsEvent` record for delivery tracking.

---

## 📊 5. Database Schema & Data Models

SwiftIQ uses PostgreSQL managed via **Prisma ORM**. The schema is optimized with explicit foreign key relationships, indexes on frequent queries (`domain`, `publishedAt`, `status`), and unique constraints to enforce data integrity.

```mermaid
erDiagram
    users ||--o| user_preferences : "configures"
    users ||--o{ subscriptions : "subscribes to"
    users ||--o{ email_queue : "receives"
    users ||--o{ analytics_events : "triggers"
    news_sources ||--o{ raw_articles : "ingests"
    raw_articles ||--o{ articles : "transforms into"
    articles ||--o| article_summaries : "has"

    users {
        uuid id PK
        string email UK
        string full_name
        datetime created_at
        datetime last_login
        boolean is_active
    }

    user_preferences {
        uuid id PK
        uuid user_id FK, UK
        string digest_frequency
        string digest_time
        string timezone
        string summary_length
    }

    subscriptions {
        uuid id PK
        uuid user_id FK
        string domain
        string_array sub_topics
        boolean is_active
    }

    news_sources {
        uuid id PK
        string name
        string domain
        string source_type
        string url UK
        json selector_config
        int fetch_frequency_minutes
        boolean is_active
        datetime last_fetched_at
    }

    raw_articles {
        uuid id PK
        uuid source_id FK
        string title
        string url UK
        text raw_content
        string content_hash UK
        boolean is_processed
        datetime published_at
    }

    articles {
        uuid id PK
        uuid raw_article_id FK
        string title
        string url UK
        string domain
        decimal sentiment
        string_array keywords
        string image_url
        datetime published_at
    }

    article_summaries {
        uuid id PK
        uuid article_id FK, UK
        text summary_brief
        text summary_medium
        text summary_detailed
        string_array key_points
        string model_used
    }

    email_queue {
        uuid id PK
        uuid user_id FK
        string subject
        text html_content
        datetime scheduled_for
        datetime sent_at
        string status
        int retry_count
    }

    analytics_events {
        uuid id PK
        uuid user_id FK
        string event_type
        json metadata
        datetime created_at
    }
```

---

## 🌐 6. Web Application & API Routes Reference

### 6.1 Frontend Route Hierarchy (`src/app`)
- **`/` (Landing Page)**: Hero banner, value prop showcase, interactive live preview demo, pricing tier summary, CTA to register.
- **`/(auth)/login` & `/(auth)/register`**: Supabase authentication forms with email/password and magic link auth.
- **`/(dashboard)/dashboard`**: Main reader portal featuring recent news cards, domain filter tabs, sentiment indicators, and summary detail toggle.
- **`/(dashboard)/subscriptions`**: Domain preference selector (`technology`, `finance`, `health`, `politics`, `sports`) and granular sub-topic toggles.
- **`/(dashboard)/preferences`**: Digest schedule configuration (frequency, preferred delivery hour, summary tier, timezone).
- **`/(dashboard)/history`**: Historical archive of delivered email digests with web preview and re-send options.
- **`/(dashboard)/sources`**: Source health monitor showcasing RSS connection status, last fetch time, and error counters.

### 6.2 Backend REST & API Directory (`src/app/api`)

| Category | API Endpoint | Method | Purpose |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/callback` | GET | Handles Supabase OAuth/magic link auth callbacks |
| **Users** | `/api/users/profile` | GET / PUT | Fetch and update user account profile details |
| **Preferences** | `/api/preferences` | GET / PUT | Read and update user digest schedule settings |
| **Subscriptions** | `/api/subscriptions` | GET / POST / DELETE | Manage domain category subscriptions |
| **Digest** | `/api/digest/latest` | GET | Pull current personalized news feed for dashboard |
| **History** | `/api/history` | GET | Retrieve user's archived digests |
| **Sources** | `/api/sources` | GET / POST | Admin endpoint to manage and add news sources |
| **Cron Pipeline** | `/api/cron/scrape` | POST / GET | Trigger Scraper agent pipeline |
| **Cron Pipeline** | `/api/cron/classify` | POST / GET | Trigger Classifier agent pipeline |
| **Cron Pipeline** | `/api/cron/summarize` | POST / GET | Trigger Summarizer agent pipeline |
| **Cron Pipeline** | `/api/cron/generate-digests` | POST / GET | Trigger Digest Generator agent pipeline |
| **Cron Pipeline** | `/api/cron/send-emails` | POST / GET | Trigger Email Sender agent pipeline |
| **Cron Pipeline** | `/api/cron/full-pipeline` | POST / GET | Run entire end-to-end pipeline in sequence |

---

## 🎨 7. UI/UX Design System & Aesthetic Principles

SwiftIQ incorporates the **MacroGlide Cyber-Dark** design language:
- **Color Palette**:
  - **Background**: Deep Pure Black (`#000000`) and Obsidian (`#09090B`).
  - **Primary Accent**: Neon Cyber Lime (`#C3FF2E`) for highlights, CTA buttons, and active states.
  - **Gradients**: Deep Cyber Violet (`#3B0764`) and Electric Blue background ambient glows.
  - **Sentiment Badges**: Neon Green (`#22C55E`) for Bullish/Positive, Crimson (`#EF4444`) for Bearish/Negative, Slate (`#64748B`) for Neutral.
- **Glassmorphism**: Semi-transparent card overlays (`backdrop-blur-md bg-white/5 border border-white/10`).
- **Typography**: Google Font **Plus Jakarta Sans** for modern, crisp readability.
- **Interactivity**: Micro-animations powered by Framer Motion, hover glow transitions, and instant tab switching via TanStack Query.

---

## ⚙️ 8. Environment Configuration & Setup

To execute SwiftIQ locally or in production, configure the following `.env` parameters:

```bash
# Database & ORM
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Supabase Auth & Storage
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1Ni..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1Ni..."

# AI Engine - Google Gemini API
GEMINI_API_KEY="AIzaSy..."

# Email Dispatch - Resend API
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="SwiftIQ <digest@news.yourdomain.com>"

# Redis & Cron Security
UPSTASH_REDIS_REST_URL="https://[INSTANCE].upstash.io"
UPSTASH_REDIS_REST_TOKEN="AZ..."
CRON_SECRET="super-secret-cron-token"
```

---

## 🚀 9. Execution Commands & Development Operations

### Development Commands
```bash
# Run Next.js web application dev server (port 3000)
npm run dev

# Launch autonomous local cron scheduler (triggers agents periodically)
npm run cron

# Seed default news sources into PostgreSQL
npm run seed

# Run standalone agent testing suite
npm run test:agents

# Database migrations & management
npx prisma db push
npx prisma studio
```

---

## 📌 10. Summary Matrix

| Metric / Dimension | Specification |
| :--- | :--- |
| **Application Name** | SwiftIQ (AI News Digest) |
| **Core Architecture** | Event-driven Multi-Agent Pipeline on Next.js 14 & Node.js |
| **Primary AI Engine** | Google Gemini 2.0 Flash |
| **Database & Cache** | PostgreSQL (Supabase) + Prisma ORM + Upstash Redis |
| **Email Infrastructure** | Resend API with React Email Cyber-Dark Template |
| **Pipeline Stages** | Scrape ➔ Classify ➔ Summarize ➔ Queue ➔ Dispatch |
| **Supported Domains** | `technology`, `finance`, `health`, `politics`, `sports` |
| **Summary Tiers** | `brief` (1-2 sentences), `medium` (1 paragraph), `detailed` (bullet points) |

---
*Documentation generated inside `workflow/ARCHITECTURE_AND_WORKFLOW.md` for team alignment and architectural clarity.*
