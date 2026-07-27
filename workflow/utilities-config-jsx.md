# Advanced Utilities & Configuration (JSX)

Complete utility functions, helpers, and configuration files for production deployment.

---

## 🛠️ Utility Functions

### lib/utils/validators.js

```javascript
/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with score and message
 */
export function validatePassword(password) {
  let score = 0;
  let feedback = [];

  if (password.length >= 8) score += 1;
  else feedback.push('At least 8 characters');

  if (password.length >= 12) score += 1;

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Numbers');

  if (/[!@#$%^&*]/.test(password)) score += 1;
  else feedback.push('Special characters');

  const strength = score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong';
  const message = feedback.length > 0 
    ? `Add: ${feedback.join(', ')}`
    : 'Strong password!';

  return { score, strength, message };
}

/**
 * Sanitize HTML content
 * @param {string} html - HTML to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Validate subscription domain
 * @param {string} domain - Domain to validate
 * @returns {boolean} True if valid domain
 */
export function validateDomain(domain) {
  const validDomains = ['finance', 'technology', 'health', 'politics', 'sports'];
  return validDomains.includes(domain);
}

/**
 * Validate time format (HH:MM:SS)
 * @param {string} time - Time string to validate
 * @returns {boolean} True if valid time
 */
export function validateTime(time) {
  const re = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;
  return re.test(time);
}
```

### lib/utils/formatters.js

```javascript
/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} format - Format string (short, long, relative)
 * @returns {string} Formatted date
 */
export function formatDate(date, format = 'short') {
  const d = new Date(date);

  if (format === 'relative') {
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
  }

  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // short format
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format time to display format
 * @param {string} time - Time string (HH:MM:SS)
 * @returns {string} Formatted time (h:MM AM/PM)
 */
export function formatTime(time) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add (default '...')
 * @returns {string} Truncated text
 */
export function truncateText(text, length = 100, suffix = '...') {
  if (text.length <= length) return text;
  return text.slice(0, length - suffix.length) + suffix;
}

/**
 * Format numbers with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  return num.toLocaleString();
}

/**
 * Capitalize string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert domain name to display format
 * @param {string} domain - Domain (e.g., 'technology')
 * @returns {string} Display format (e.g., 'Technology')
 */
export function formatDomain(domain) {
  const icons = {
    finance: '💰 Finance',
    technology: '💻 Technology',
    health: '🏥 Health',
    politics: '🏛️ Politics',
    sports: '⚽ Sports',
  };

  return icons[domain] || capitalize(domain);
}
```

### lib/utils/errors.js

```javascript
/**
 * Custom error classes
 */
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'Not authenticated') {
    super(message);
    this.name = 'AuthenticationError';
    this.status = 401;
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Not authorized') {
    super(message);
    this.name = 'AuthorizationError';
    this.status = 403;
  }
}

export class NotFoundError extends Error {
  constructor(resource = 'Resource') {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

export class ConflictError extends Error {
  constructor(message = 'Resource already exists') {
    super(message);
    this.name = 'ConflictError';
    this.status = 409;
  }
}

export class InternalError extends Error {
  constructor(message = 'Internal server error') {
    super(message);
    this.name = 'InternalError';
    this.status = 500;
  }
}

/**
 * Handle and format errors for API responses
 * @param {Error} error - Error to handle
 * @returns {Object} Formatted error response
 */
export function handleError(error) {
  console.error('Error:', error);

  if (error.status) {
    return {
      status: error.status,
      message: error.message,
      name: error.name,
    };
  }

  return {
    status: 500,
    message: 'An unexpected error occurred',
    name: 'InternalError',
  };
}
```

### lib/utils/rate-limiter.js

```javascript
import { redis } from '@/lib/services/redis';

/**
 * Rate limit helper class
 */
export class RateLimiter {
  constructor(limit, windowSeconds) {
    this.limit = limit;
    this.windowSeconds = windowSeconds;
  }

  async checkLimit(identifier) {
    return await redis.incr(`ratelimit:${identifier}`);
  }

  async resetLimit(identifier) {
    await redis.del(`ratelimit:${identifier}`);
  }

  async isLimited(identifier) {
    const key = `ratelimit:${identifier}`;
    const current = await redis.get(key);

    if (!current) {
      await redis.set(key, 0, { ex: this.windowSeconds });
      return false;
    }

    if (current >= this.limit) {
      return true;
    }

    await redis.incr(key);
    return false;
  }

  async getRemainingAttempts(identifier) {
    const key = `ratelimit:${identifier}`;
    const current = await redis.get(key);
    return Math.max(0, this.limit - (current || 0));
  }
}

/**
 * Create rate limiters for different endpoints
 */
export const emailRateLimiter = new RateLimiter(5, 3600); // 5 per hour
export const apiRateLimiter = new RateLimiter(100, 3600); // 100 per hour
export const authRateLimiter = new RateLimiter(10, 900); // 10 per 15 minutes
```

### lib/utils/logger.js

```javascript
/**
 * Logger utility for consistent logging
 */
const logLevels = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

/**
 * Format log message with timestamp and level
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 * @returns {string} Formatted log message
 */
function formatLog(level, message, data) {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`;
}

export const logger = {
  error: (message, data) => {
    const log = formatLog(logLevels.ERROR, message, data);
    console.error(log);

    // Send to error tracking (e.g., Sentry)
    if (process.env.NEXT_PUBLIC_SENTRY_DSN && typeof window !== 'undefined') {
      try {
        // Sentry would be initialized elsewhere
        // Sentry.captureException(new Error(message), { extra: data });
      } catch (e) {
        console.error('Failed to log to Sentry:', e);
      }
    }
  },

  warn: (message, data) => {
    const log = formatLog(logLevels.WARN, message, data);
    console.warn(log);
  },

  info: (message, data) => {
    const log = formatLog(logLevels.INFO, message, data);
    console.log(log);
  },

  debug: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      const log = formatLog(logLevels.DEBUG, message, data);
      console.log(log);
    }
  },
};
```

### lib/utils/cache.js

```javascript
import { redis } from '@/lib/services/redis';

/**
 * Cache helper class
 */
export class CacheManager {
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached value or null
   */
  static async get(key) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   */
  static async set(key, value, ttl = 3600) {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   */
  static async delete(key) {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Get or set cache with loader function
   * @param {string} key - Cache key
   * @param {Function} loader - Async function to load data
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<any>} Cached or loaded value
   */
  static async getOrSet(key, loader, ttl = 3600) {
    try {
      // Try to get from cache
      const cached = await this.get(key);
      if (cached) return cached;

      // Load fresh data
      const data = await loader();

      // Cache it
      await this.set(key, data, ttl);

      return data;
    } catch (error) {
      console.error('Cache getOrSet error:', error);
      return await loader(); // Fallback to loader
    }
  }

  /**
   * Clear cache by prefix
   * @param {string} prefix - Key prefix
   */
  static async clearPrefix(prefix) {
    try {
      // This is a simplified version - Redis KEYS pattern matching
      const pattern = `${prefix}*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await Promise.all(keys.map(key => redis.del(key)));
      }
    } catch (error) {
      console.error('Cache clearPrefix error:', error);
    }
  }
}

/**
 * Cache key generators
 */
export const cacheKeys = {
  article: (id) => `article:${id}`,
  articles: (domain, page) => `articles:${domain}:${page}`,
  user: (id) => `user:${id}`,
  userDigests: (userId) => `digests:${userId}`,
  subscriptions: (userId) => `subscriptions:${userId}`,
  stats: 'stats:global',
};
```

---

## 📋 Configuration Files

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
    ],
  },

  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=10, stale-while-revalidate=59',
          },
        ],
      },
    ];
  },

  redirects: async () => {
    return [
      {
        source: '/old-page',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },

  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
```

### .env.example

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Neon Database
DATABASE_URL=postgresql://user:password@host/database

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Resend Email Service
RESEND_API_KEY=your-resend-api-key

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# QStash Job Queue
QSTASH_CURRENT_SIGNING_KEY=your-qstash-signing-key
QSTASH_NEXT_SIGNING_KEY=your-qstash-next-key
QSTASH_TOKEN=your-qstash-token

# Cron Jobs Secret
CRON_SECRET=your-random-secret-key

# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### .gitignore

```
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
Thumbs.db
```

### package.json (Updated)

```json
{
  "name": "ai-news-digest",
  "version": "1.0.0",
  "description": "AI-powered news summarization service",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "seed": "node scripts/seed-sources.js",
    "test:agents": "node scripts/test-agents.js all",
    "format": "prettier --write \"**/*.{js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,json,md}\"",
    "db:push": "npx supabase db push",
    "db:reset": "npx supabase db reset",
    "migrate": "npx supabase migration new"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/auth-helpers-nextjs": "^0.8.0",
    "@google/generative-ai": "^0.1.3",
    "resend": "^3.0.0",
    "@react-email/components": "^0.0.16",
    "@react-email/render": "^0.0.16",
    "@upstash/redis": "^1.25.0",
    "@upstash/qstash": "^0.2.0",
    "cheerio": "^1.0.0-rc.12",
    "puppeteer": "^21.0.0",
    "rss-parser": "^3.13.0",
    "framer-motion": "^10.16.0",
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.0.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "lucide-react": "^0.293.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "date-fns": "^2.30.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.3.0",
    "prettier": "^3.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0"
  }
}
```

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './emails/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        secondary: '#8b5cf6',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

### postcss.config.js

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

---

## 🐳 Docker Configuration

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - RESEND_API_KEY=${RESEND_API_KEY}
      - UPSTASH_REDIS_REST_URL=${UPSTASH_REDIS_REST_URL}
      - UPSTASH_REDIS_REST_TOKEN=${UPSTASH_REDIS_REST_TOKEN}
      - CRON_SECRET=${CRON_SECRET}
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=news_digest
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## ✅ GitHub Actions CI/CD

### .github/workflows/deploy.yml

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

This completes all utilities and configuration files!
