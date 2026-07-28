import { NextResponse } from 'next/server';
import { prisma } from '@/lib/services/db';
import { sendDigestEmail } from '@/lib/services/resend';
import { render } from '@react-email/render';
import DigestEmail from '@/../emails/digest-template';
import React from 'react';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { email, userId } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Missing email address' }, { status: 400 });
    }

    // Pull up to 4 articles with summaries from the DB
    const articles = await prisma.article.findMany({
      where: { summaries: { isNot: null } },
      include: { summaries: true },
      orderBy: { publishedAt: 'desc' },
      take: 4,
    });

    if (articles.length === 0) {
      return NextResponse.json(
        { error: 'No articles with summaries found. Run the summarizer first.' },
        { status: 404 }
      );
    }

    // Format articles for the email template
    const emailArticles = articles.map(a => ({
      title: a.title,
      summary: a.summaries?.summaryMedium || a.summaries?.summaryBrief || a.title,
      url: a.url,
      domain: a.domain,
      keyPoints: a.summaries?.keyPoints || [],
    }));

    const userName = email.split('@')[0];
    const introduction = `Good morning, ${userName}! This is a sample SwiftIQ news digest from your subscribed categories. Below are today's top stories curated just for you.`;

    // Try React Email render, fall back to plain HTML
    let emailHtml = '';
    try {
      const rendered = render(React.createElement(DigestEmail, {
        userName,
        introduction,
        articles: emailArticles,
      }));
      emailHtml = rendered instanceof Promise ? await rendered : rendered;
    } catch (renderErr) {
      console.warn('[SampleEmail] React Email render failed, using plain HTML:', renderErr.message);
      emailHtml = buildFallbackHtml(userName, introduction, emailArticles);
    }

    const subject = `[SAMPLE] SwiftIQ // ${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;

    // Send directly via Resend (no queue)
    const result = await sendDigestEmail(email, subject, emailHtml);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Email send failed', detail: result.error },
        { status: 500 }
      );
    }

    // Log to email_queue for history tracking (status = 'sent' immediately)
    if (userId) {
      try {
        await prisma.emailQueue.create({
          data: {
            userId,
            subject,
            htmlContent: emailHtml,
            scheduledFor: new Date(),
            status: 'sent',
            sentAt: new Date(),
          },
        });
      } catch (_) {
        // Non-fatal — email already sent
      }
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      sentTo: email,
      articlesIncluded: emailArticles.length,
    });
  } catch (error) {
    console.error('[SampleEmail] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function buildFallbackHtml(userName, introduction, articles) {
  const rows = articles.map(a => `
    <div style="margin-bottom:28px;padding-bottom:28px;border-bottom:1px solid #1e1e1e;">
      <div style="font-family:monospace;font-size:10px;color:#C3FF2E;margin-bottom:8px;letter-spacing:1px;">${a.domain.toUpperCase()}</div>
      <h2 style="color:#fff;margin:0 0 10px;font-size:17px;font-weight:700;line-height:1.4;">${a.title}</h2>
      <p style="color:#aaa;margin:0 0 14px;font-size:13px;line-height:1.7;">${a.summary}</p>
      ${a.keyPoints.length ? `
        <div style="background:#111;border:1px solid #222;border-radius:6px;padding:14px 16px;margin-bottom:14px;">
          <div style="font-family:monospace;font-size:9px;color:#fff;letter-spacing:1px;margin-bottom:8px;">KEY_TAKEAWAYS</div>
          <ul style="margin:0;padding:0;list-style:none;">${a.keyPoints.map(p => `<li style="color:#ccc;font-size:12px;margin-bottom:5px;padding-left:14px;position:relative;"><span style="color:#C3FF2E;position:absolute;left:0;">•</span>${p}</li>`).join('')}</ul>
        </div>` : ''}
      <a href="${a.url}" style="color:#C3FF2E;font-family:monospace;font-size:11px;font-weight:700;text-decoration:none;">READ_FULL_STORY →</a>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SwiftIQ</title></head>
<body style="background:#050505;margin:0;padding:40px 16px;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;overflow:hidden;">
    <div style="padding:32px 40px 28px;border-bottom:1px solid #1a1a1a;">
      <div style="display:flex;align-items:center;margin-bottom:20px;">
        <span style="font-family:sans-serif;font-size:18px;font-weight:800;color:#fff;letter-spacing:0.5px;">Swift<span style="color:#C3FF2E;">IQ</span></span>
      </div>
      <h1 style="color:#fff;font-size:26px;font-weight:800;margin:0 0 14px;text-transform:uppercase;letter-spacing:-0.5px;">Good morning, ${userName} 🌅</h1>
      <p style="color:#aaa;font-size:14px;line-height:1.65;margin:0;">${introduction}</p>
    </div>
    <div style="padding:32px 40px;">${rows}</div>
    <div style="padding:28px 40px;background:#080808;text-align:center;border-top:1px solid #111;">
      <p style="font-family:monospace;color:#444;font-size:9px;margin:0;letter-spacing:1px;">AUTONOMOUS SCRAPING AGENT v1.0 // POWERED BY SWIFTIQ & GEMINI 2.0 FLASH</p>
    </div>
  </div>
</body>
</html>`;
}
