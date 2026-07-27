# Complete Getting Started Guide (JSX Version)

Step-by-step instructions to build and deploy the AI News Digest application.

---

## 🚀 Prerequisites

Before starting, ensure you have:

- **Node.js 18+** installed
- **npm** or **yarn** package manager
- **Git** version control
- Accounts for:
  - [Supabase](https://supabase.com) - Database & Auth
  - [Neon](https://neon.tech) - PostgreSQL
  - [Google Cloud](https://cloud.google.com) - Gemini API
  - [Resend](https://resend.com) - Email service
  - [Upstash](https://upstash.com) - Redis & QStash
  - [Vercel](https://vercel.com) - Hosting & Cron jobs

---

## 📦 Phase 1: Project Setup

### Step 1: Create Next.js Project

```bash
# Create new Next.js project with JavaScript
npx create-next-app@latest ai-news-digest \
  --js \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --eslint

cd ai-news-digest
```

### Step 2: Install Dependencies

```bash
# Core dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @prisma/client
npm install @google/generative-ai
npm install resend react-email
npm install @upstash/redis @upstash/qstash

# Web scraping
npm install cheerio puppeteer rss-parser

# UI & Styling
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select @radix-ui/react-tabs
npm install framer-motion
npm install lucide-react

# Utilities
npm install zod date-fns clsx tailwind-merge
npm install zustand @tanstack/react-query

# Development dependencies
npm install -D prettier eslint-config-prettier prisma
npm install -D jest @testing-library/react @testing-library/jest-dom
```

### Step 3: Project Structure

```bash
# Create directory structure
mkdir -p lib/{agents,services,scrapers,db,utils,types}
mkdir -p app/api/{auth,users,subscriptions,digest,cron,webhooks,admin}
mkdir -p components/{ui,dashboard,email-templates,admin}
mkdir -p emails
mkdir -p prisma
mkdir -p scripts
mkdir -p tests/{agents,api,integration}
mkdir -p .github/workflows
```

### Step 4: Copy Configuration Files

Copy these files from the previous guides into your project:
- `jsconfig.json` - JavaScript path configuration
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `.env.example` - Environment variables template
- `.gitignore` - Git ignore rules

```bash
cp .env.example .env.local
```

---

## 🗄️ Phase 2: Database Setup

### Step 1: Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Create new project
3. Choose Neon as your database
4. Get your credentials:
   - Project URL
   - Anon key
   - Service Role key

### Step 2: Update Environment Variables

Edit `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://user:password@host/database
```

### Step 3: Create Database Schema

```bash
# Initialize Prisma configurations if not done
npx prisma init

# Create the schema.prisma file inside the prisma directory (refer to the schema details in ai-news-digest-plan-jsx.md / implementation-guide-jsx.md)
# Execute database push to synchronize schemas
npx prisma db push
```

### Step 4: Verify Database

```bash
# Run Prisma Studio to visually browse database tables and schemas
npx prisma studio
```

---

## 🔑 Phase 3: External Services Setup

### Google Gemini API

```bash
# 1. Create Google Cloud project
# 2. Enable Generative AI API
# 3. Create API key
# 4. Add to .env.local

GEMINI_API_KEY=your-api-key
```

### Resend Email Service

```bash
# 1. Create account at resend.com
# 2. Get API key
# 3. Add to .env.local

RESEND_API_KEY=your-resend-api-key
```

### Upstash Redis

```bash
# 1. Create account at upstash.com
# 2. Create Redis database
# 3. Get REST URL and token
# 4. Add to .env.local

UPSTASH_REDIS_REST_URL=https://your-url
UPSTASH_REDIS_REST_TOKEN=your-token
```

### Upstash QStash

```bash
# 1. Enable QStash in Upstash
# 2. Get signing keys and token
# 3. Add to .env.local

QSTASH_CURRENT_SIGNING_KEY=your-key
QSTASH_NEXT_SIGNING_KEY=your-next-key
QSTASH_TOKEN=your-token
```

### Cron Secret

```bash
# Generate random secret for cron jobs
openssl rand -base64 32

# Add to .env.local
CRON_SECRET=your-random-secret
```

---

## 🏗️ Phase 4: Copy All Source Files

### Create Core Services

Copy all files from previous guides:

```
lib/services/
  - supabase.js
  - gemini.js
  - redis.js
  - resend.js

lib/agents/
  - scraper.js
  - classifier.js
  - summarizer.js
  - digest-generator.js
  - email-sender.js

lib/utils/
  - content-hasher.js
  - validators.js
  - formatters.js
  - errors.js
  - rate-limiter.js
  - logger.js
  - cache.js
```

### Create API Routes

```
app/api/
  auth/
  users/route.js
  subscriptions/route.js
  articles/route.js
  digest/preview/route.js
  analytics/track/route.js
  admin/
    sources/route.js
    stats/route.js
  cron/
    scrape-news/route.js
    classify-articles/route.js
    summarize-articles/route.js
    generate-digests/route.js
    send-emails/route.js
  webhooks/route.js
```

### Create Components

```
components/
  dashboard/
    DashboardLayout.jsx
    SubscriptionManager.jsx
    PreferencesForm.jsx
    DigestHistory.jsx
  admin/
    SourceManager.jsx
    Analytics.jsx
  ui/
    (shadcn components)

emails/
  digest-template.jsx
  welcome-email.jsx
```

### Create Pages

```
app/
  page.jsx (landing)
  layout.jsx
  (auth)/
    login/page.jsx
    signup/page.jsx
  (dashboard)/
    dashboard/page.jsx
    subscriptions/page.jsx
    preferences/page.jsx
    history/page.jsx
```

### Create Server Actions

```
app/actions/
  user-actions.js
  subscription-actions.js
  digest-actions.js
```

---

## 🧪 Phase 5: Testing & Development

### Start Development Server

```bash
# Start local development
npm run dev

# App will be available at http://localhost:3000
```

### Run Tests

```bash
# Run all tests
npm test

# Run with watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

### Seed Initial Data

```bash
# Seed news sources
npm run seed

# Test agents
npm run test:agents

# Test specific agent
node scripts/test-agents.js scraper
node scripts/test-agents.js classifier
node scripts/test-agents.js summarizer
```

### Test Email Templates

```bash
# Test React Email rendering
npm run test:emails
```

---

## 🚀 Phase 6: Deployment

### Deploy to Vercel

#### Step 1: Create Vercel Project

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

#### Step 2: Set Environment Variables

In Vercel dashboard:
1. Go to Settings → Environment Variables
2. Add all variables from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `RESEND_API_KEY`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `QSTASH_TOKEN`
   - `CRON_SECRET`

#### Step 3: Enable Cron Jobs

Create `vercel.json` in project root:

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

Push to GitHub and Vercel will automatically deploy.

#### Step 4: Configure Webhooks

For QStash callbacks:
1. Go to Upstash QStash dashboard
2. Add webhook URL: `https://your-vercel-url.vercel.app/api/webhooks`

---

## 📋 Phase 7: Post-Deployment Checklist

### Monitor & Setup

- [ ] Configure Sentry error tracking
  ```bash
  npm install @sentry/nextjs
  ```
  
  Create `sentry.server.config.js`:
  ```javascript
  import * as Sentry from "@sentry/nextjs";
  
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
  ```

- [ ] Set up monitoring dashboards
  - Monitor cron job executions
  - Track email delivery
  - Monitor API performance

- [ ] Configure alerts
  - Email alerts for failed cron jobs
  - Alert for high error rates
  - Alert for API rate limit hits

- [ ] Setup analytics
  - Track user signups
  - Monitor digest opens
  - Track article clicks

### Backup & Security

- [ ] Enable Supabase automated backups
- [ ] Configure database SSL certificates
- [ ] Set up IP whitelisting (if needed)
- [ ] Enable 2FA for all services
- [ ] Rotate API keys regularly

### Optimization

- [ ] Enable caching headers
- [ ] Optimize images with Vercel Image Optimization
- [ ] Enable gzip compression
- [ ] Monitor bundle size
- [ ] Setup CDN for static assets

---

## 🔍 Common Issues & Solutions

### Issue: Database Connection Failed

```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Verify Supabase credentials
npx supabase status
```

### Issue: Gemini API Rate Limit

Add retry logic:
```javascript
async function callGeminiWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### Issue: Redis Connection Timeout

Check Upstash status:
```bash
# Test Redis connection
curl -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN" \
  "$UPSTASH_REDIS_REST_URL/ping"
```

### Issue: Email Not Sending

Check Resend status:
```javascript
// Test email sending
const { error } = await resend.emails.send({
  from: 'test@example.com',
  to: 'your-email@example.com',
  subject: 'Test',
  html: '<p>Test email</p>',
});

console.log(error);
```

---

## 📊 Monitoring & Maintenance

### Daily Tasks

- Check cron job logs
- Monitor email delivery rate
- Check error tracking (Sentry)
- Review API performance metrics

### Weekly Tasks

- Review analytics dashboards
- Check database performance
- Monitor Redis usage
- Review user feedback

### Monthly Tasks

- Update dependencies
- Review and rotate API keys
- Analyze usage patterns
- Plan feature improvements

---

## 📚 Useful Commands

```bash
# Development
npm run dev               # Start dev server
npm run build            # Build for production
npm start                # Start production server
npm test                 # Run tests
npm run lint             # Run linter

# Database
npx supabase db push     # Push migrations
npx supabase db reset    # Reset database
npx supabase status      # Check status

# Scripts
npm run seed             # Seed news sources
npm run test:agents      # Test all agents
npm run format           # Format code

# Docker
docker-compose up        # Start services
docker-compose down      # Stop services
```

---

## 🎯 Next Steps After Deployment

### Phase 1: Testing in Production (Week 1)

- Monitor all agents running smoothly
- Test email delivery to real users
- Verify analytics tracking works
- Check database performance

### Phase 2: User Onboarding (Week 2)

- Invite beta users
- Collect feedback
- Monitor usage patterns
- Fix any issues

### Phase 3: Feature Improvements (Week 3+)

- Implement user suggestions
- Add advanced features:
  - Article recommendations
  - Reading time predictions
  - Topic deep dives
  - Multi-language support
  - Voice digests

---

## 🤝 Contributing & Maintenance

### Code Style

```bash
# Format code
npm run format

# Check formatting
npm run format:check

# Lint
npm run lint
```

### Git Workflow

```bash
# Feature branch
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "feat: add feature description"

# Push to remote
git push origin feature/feature-name

# Create pull request on GitHub
```

### Deployment Process

1. Create feature branch
2. Make changes and test locally
3. Push to GitHub
4. Create PR and request review
5. Merge to main after approval
6. Vercel automatically deploys

---

## 📞 Support & Resources

### Documentation

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Gemini API Docs](https://ai.google.dev/docs)
- [React Email Docs](https://react.email)
- [Upstash Docs](https://upstash.com/docs)

### Community

- [Next.js Discord](https://discord.gg/nextjs)
- [Supabase Community](https://discord.supabase.com)
- [Vercel Community](https://vercel.com/community)

### Getting Help

1. Check documentation first
2. Search existing issues
3. Create new issue with details
4. Post in community forums

---

## 📈 Success Metrics

Track these metrics to measure success:

```javascript
const successMetrics = {
  userMetrics: {
    signups: 'New users per week',
    retention: 'Users returning after 7 days',
    engagement: 'Digests opened per user',
  },
  
  performanceMetrics: {
    pageLoadTime: '<2s',
    apiResponseTime: '<200ms',
    errorRate: '<0.1%',
    uptime: '>99.9%',
  },
  
  businessMetrics: {
    emailDeliveryRate: '>99%',
    articlesProcessed: 'Per day',
    userSatisfaction: 'From surveys',
  },
};
```

---

This completes your comprehensive getting started guide! You now have everything needed to build and deploy the AI News Digest application. 🚀
