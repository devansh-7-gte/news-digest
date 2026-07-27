import { prisma } from '@/lib/services/db';
import { generatePersonalizedDigest } from '@/lib/services/gemini';
import { render } from '@react-email/render';
import DigestEmail from '../../../emails/digest-template';
import React from 'react';

/**
 * Generate digest for a specific user based on preferences
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Queued email record or null
 */
export async function generateDigestForUser(userId) {
  console.log(`[DigestGenerator] Processing digest generation for user ${userId}...`);

  // Fetch user information, preferences, and active subscriptions
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      preferences: true,
      subscriptions: {
        where: { isActive: true }
      }
    }
  });

  if (!user) {
    console.error(`[DigestGenerator] User not found: ${userId}`);
    return null;
  }

  // Get active subscribed domains
  const subscribedDomains = user.subscriptions.map(sub => sub.domain);
  if (subscribedDomains.length === 0) {
    console.log(`[DigestGenerator] User ${userId} has no active subscriptions.`);
    return null;
  }

  // Fetch articles from the last 24 hours in the user's subscribed domains
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);

  const articles = await prisma.article.findMany({
    where: {
      domain: { in: subscribedDomains },
      publishedAt: { gte: twentyFourHoursAgo }
    },
    include: {
      summaries: true
    },
    orderBy: {
      publishedAt: 'desc'
    },
    take: 8 // Limit to top 8 articles to prevent email overload
  });

  if (articles.length === 0) {
    console.log(`[DigestGenerator] No new articles found in subscribed domains for user ${userId}.`);
    return null;
  }

  // Format articles based on summary length preference
  const summaryLength = user.preferences?.summaryLength || 'medium';
  const emailArticles = articles.map(article => {
    let summaryText = article.title;
    if (article.summaries) {
      if (summaryLength === 'brief') summaryText = article.summaries.summaryBrief;
      else if (summaryLength === 'medium') summaryText = article.summaries.summaryMedium || article.summaries.summaryBrief;
      else if (summaryLength === 'detailed') summaryText = article.summaries.summaryDetailed || article.summaries.summaryMedium || article.summaries.summaryBrief;
    }

    return {
      title: article.title,
      summary: summaryText,
      url: article.url,
      domain: article.domain,
      keyPoints: article.summaries?.keyPoints || [],
    };
  });

  // Generate personalized introduction from Gemini AI
  const userName = user.fullName || user.email.split('@')[0];
  let introduction = '';
  try {
    introduction = await generatePersonalizedDigest(emailArticles, userName);
  } catch (error) {
    console.error('[DigestGenerator] Gemini introduction generation failed:', error.message);
    introduction = `Good morning, ${userName}! Here is your personalized daily update containing key summaries from your subscribed categories.`;
  }

  // Render React Email component to responsive HTML
  let emailHtml = '';
  try {
    emailHtml = render(
      React.createElement(DigestEmail, {
        userName,
        introduction,
        articles: emailArticles
      })
    );
  } catch (renderError) {
    console.error('[DigestGenerator] Failed to render React Email template:', renderError.message);
    return null;
  }

  // Queue digest in email_queue
  const queuedEmail = await prisma.emailQueue.create({
    data: {
      userId: user.id,
      subject: `AI_NEWS_DIGEST // ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      htmlContent: emailHtml,
      scheduledFor: new Date(),
      status: 'pending'
    }
  });

  console.log(`[DigestGenerator] Successfully queued digest email ${queuedEmail.id} for user ${userId}.`);
  return queuedEmail;
}

/**
 * Scan all active users and trigger digest generation
 * @returns {Promise<Array>} List of successfully queued email records
 */
export async function runDigestGeneratorAgent() {
  console.log('[DigestGenerator] Starting digest generation agent sweep...');

  // Get active users who have preferences set up
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true }
  });

  if (users.length === 0) {
    console.log('[DigestGenerator] No active users found.');
    return [];
  }

  const generatedDigests = [];

  for (const user of users) {
    try {
      const digest = await generateDigestForUser(user.id);
      if (digest) {
        generatedDigests.push(digest);
      }
    } catch (error) {
      console.error(`[DigestGenerator] Failed to generate digest for user ${user.id}:`, error.message);
    }
  }

  console.log(`[DigestGenerator] Digest generator agent sweep complete. Queued ${generatedDigests.length} digests.`);
  return generatedDigests;
}
