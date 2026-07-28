import { prisma } from '@/lib/services/db';
import { generatePersonalizedDigest } from '@/lib/services/gemini';
import { render } from '@react-email/render';
import DigestEmail from '../../../emails/digest-template';
import React from 'react';

/**
 * Generate digest for a specific user based on preferences
 * @param {string} userId - User ID
 * @param {Object} options - Override options
 * @param {number} options.lookbackDays - How many days back to look for articles (default: 7)
 * @returns {Promise<Object|null>} Queued email record or null
 */
export async function generateDigestForUser(userId, { lookbackDays = 7 } = {}) {
  console.log(`[DigestGenerator] Processing digest for user ${userId}...`);

  // Fetch user + preferences + active subscriptions
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      preferences: true,
      subscriptions: { where: { isActive: true } }
    }
  });

  if (!user) {
    console.error(`[DigestGenerator] User not found: ${userId}`);
    return null;
  }

  const subscribedDomains = user.subscriptions.map(s => s.domain);
  if (subscribedDomains.length === 0) {
    console.log(`[DigestGenerator] User ${userId} has no active subscriptions.`);
    return null;
  }

  // Look back `lookbackDays` days for articles (wider window for dev/testing)
  const since = new Date();
  since.setDate(since.getDate() - lookbackDays);

  const domainFilter = subscribedDomains.length > 0
    ? { domain: { in: subscribedDomains } }
    : {};

  const articles = await prisma.article.findMany({
    where: {
      ...domainFilter,
      // Only include articles that have summaries
      summaries: { isNot: null },
    },
    include: { summaries: true },
    orderBy: { publishedAt: 'desc' },
    take: 5, // Keep digest concise to save tokens
  });

  if (articles.length === 0) {
    console.log(`[DigestGenerator] No articles with summaries found for user ${userId}.`);
    return null;
  }

  // Format articles using user's preferred summary length
  const summaryLength = user.preferences?.summaryLength || 'medium';
  const emailArticles = articles.map(article => {
    let summaryText = article.title;
    if (article.summaries) {
      if (summaryLength === 'brief') summaryText = article.summaries.summaryBrief || article.title;
      else if (summaryLength === 'medium') summaryText = article.summaries.summaryMedium || article.summaries.summaryBrief || article.title;
      else if (summaryLength === 'detailed') summaryText = article.summaries.summaryDetailed || article.summaries.summaryMedium || article.summaries.summaryBrief || article.title;
    }
    return {
      title: article.title,
      summary: summaryText,
      url: article.url,
      domain: article.domain,
      keyPoints: article.summaries?.keyPoints || [],
    };
  });

  // Generate personalized intro via Gemini (with fallback)
  const userName = user.fullName || user.email.split('@')[0];
  let introduction = `Good morning, ${userName}! Here is your personalized AI news digest. Here are today's top stories from your subscribed categories.`;
  try {
    introduction = await generatePersonalizedDigest(emailArticles, userName);
  } catch (err) {
    console.warn('[DigestGenerator] Gemini intro generation failed, using fallback:', err.message);
  }

  // Render React Email template to HTML
  let emailHtml = '';
  try {
    // render() may return a Promise in newer @react-email/render versions
    const rendered = render(React.createElement(DigestEmail, { userName, introduction, articles: emailArticles }));
    emailHtml = rendered instanceof Promise ? await rendered : rendered;
  } catch (renderError) {
    console.error('[DigestGenerator] React Email render failed, using plain HTML fallback:', renderError.message);
    // Plain HTML fallback so email still sends even if React Email breaks
    emailHtml = buildPlainHtmlEmail(userName, introduction, emailArticles);
  }

  // Queue in email_queue
  const subject = `SwiftIQ // ${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
  const queuedEmail = await prisma.emailQueue.create({
    data: {
      userId: user.id,
      subject,
      htmlContent: emailHtml,
      scheduledFor: new Date(),
      status: 'pending',
    },
  });

  console.log(`[DigestGenerator] Queued digest email ${queuedEmail.id} for user ${userId} (${emailArticles.length} articles).`);
  return queuedEmail;
}

/**
 * Minimal plain HTML email fallback (used when React Email render fails)
 */
function buildPlainHtmlEmail(userName, introduction, articles) {
  const articleRows = articles.map(a => `
    <div style="margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid #222;">
      <div style="font-family:monospace;font-size:10px;color:#C3FF2E;margin-bottom:8px;">${a.domain.toUpperCase()}</div>
      <h2 style="color:#fff;margin:0 0 8px;font-size:16px;">${a.title}</h2>
      <p style="color:#aaa;margin:0 0 12px;font-size:13px;line-height:1.6;">${a.summary}</p>
      ${a.keyPoints.length ? `<ul style="margin:0;padding:0 0 0 16px;color:#ccc;font-size:12px;">${a.keyPoints.map(p => `<li style="margin-bottom:4px;">${p}</li>`).join('')}</ul>` : ''}
      <a href="${a.url}" style="color:#C3FF2E;font-family:monospace;font-size:11px;font-weight:700;text-decoration:none;display:inline-block;margin-top:10px;">READ_FULL_STORY →</a>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="background:#050505;margin:0;padding:40px 0;font-family:system-ui,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;overflow:hidden;">
    <div style="padding:32px 40px;border-bottom:1px solid #1a1a1a;">
      <div style="font-family:sans-serif;font-size:16px;font-weight:800;color:#fff;margin-bottom:16px;">Swift<span style="color:#C3FF2E;">IQ</span></div>
      <h1 style="color:#fff;font-size:26px;font-weight:800;margin:0 0 12px;text-transform:uppercase;">Good morning, ${userName} 🌅</h1>
      <p style="color:#aaa;font-size:14px;line-height:1.6;margin:0;">${introduction}</p>
    </div>
    <div style="padding:32px 40px;">${articleRows}</div>
    <div style="padding:24px 40px;background:#080808;text-align:center;">
      <p style="font-family:monospace;color:#555;font-size:9px;margin:0;letter-spacing:1px;">AUTONOMOUS SCRAPING AGENT v1.0 // POWERED BY SWIFTIQ & GEMINI 2.0 FLASH</p>
    </div>
  </div>
</body></html>`;
}

/**
 * Run digest generation for all active users
 */
export async function runDigestGeneratorAgent() {
  console.log('[DigestGenerator] Starting agent sweep...');

  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true }
  });

  if (users.length === 0) {
    console.log('[DigestGenerator] No active users found.');
    return [];
  }

  const generated = [];
  for (const user of users) {
    try {
      const digest = await generateDigestForUser(user.id);
      if (digest) generated.push(digest);
    } catch (err) {
      console.error(`[DigestGenerator] Failed for user ${user.id}:`, err.message);
    }
  }

  console.log(`[DigestGenerator] Complete. Queued ${generated.length} digests.`);
  return generated;
}
