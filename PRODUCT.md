# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Professional operators (Tech, Finance, Health, Politics) seeking noise-free, high-density market-moving digests.

## Product Purpose
Provide high-density, synthesised news roundups, removing clutter and helping busy operators stay up to date with zero friction.

## Positioning
An autonomous, end-to-end processing pipeline (Scrape ➔ Classify ➔ Summarize ➔ Queue) that automatically ingests articles, tags sentiment, classifies domains, and generates custom digests.

## Operating Context
Users receive custom daily digests directly in their inboxes, and manage preferences or browse archived articles in a premium web dashboard.

## Capabilities and Constraints
- Next.js 14 App Router, Prisma ORM, PostgreSQL (Supabase), Upstash Redis, Resend email dispatch.
- Google Gemini 2.0 Flash for text classification, sentiment metrics, and multi-tier summarization.
- MacroGlide-inspired dark cyber theme with glassmorphic UI.

## Brand Commitments
- Name: AI_NEWS_DIGEST
- Color Scheme: Pure black theme with neon lime (#C3FF2E) highlights, deep purple and blue floating gradients.
- Typography: Plus Jakarta Sans.

## Evidence on Hand
- Scraper, Classifier, and Summarizer agents implemented.
- Secure cron API dispatch routes at `/api/cron/*`.
- Dark-mode responsive React Email template at `emails/digest-template.jsx`.

## Product Principles
- **Noise Elimination**: Synthesize news into key bullet-point takeaways.
- **Visual Integrity**: Clean, high-density dark mode design with no placeholders.
- **Resilient Delivery**: Retries, rate limits, and error handling integrated into background agents.
