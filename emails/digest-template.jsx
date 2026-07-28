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
import * as React from 'react';

/**
 * Premium responsive dark-themed Digest Email template
 * Styled to fit the MacroGlide brand guidelines (cyber dark mode with neon lime accents)
 */
export default function DigestEmail({ userName, introduction, articles = [] }) {
  return (
    <Html>
      <Head />
      <Preview>SwiftIQ digest for {userName} - fresh tech, finance, and science updates</Preview>
      <Body style={mainBg}>
        <Container style={container}>
          {/* Brand Banner Header */}
          <Section style={headerSection}>
            <div style={logoWrapper}>
              <img src={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png`} width="32" height="32" alt="SwiftIQ" style={{ borderRadius: '6px', marginRight: '10px', verticalAlign: 'middle' }} />
              <span style={logoText}>Swift<span style={{ color: '#C3FF2E' }}>IQ</span></span>
            </div>
            <Heading style={h1}>Good morning, {userName} 🌅</Heading>
            <Text style={introText}>{introduction}</Text>
          </Section>

          {/* Articles Feed */}
          {articles.map((article, index) => (
            <Section key={index} style={articleCard}>
              {/* Domain Category Badge */}
              <div style={domainBadge}>
                {article.domain ? article.domain.toUpperCase() : 'NEWS'}
              </div>
              
              <Heading style={h2}>{article.title}</Heading>
              
              <Text style={summary}>{article.summary}</Text>
              
              {/* Key Takeaways */}
              {article.keyPoints && article.keyPoints.length > 0 && (
                <div style={keyPointsContainer}>
                  <Text style={keyPointsTitle}>KEY_TAKEAWAYS // ACCELERATED</Text>
                  <ul style={keyPointsList}>
                    {article.keyPoints.map((point, i) => (
                      <li key={i} style={keyPoint}>
                        <span style={bulletSign}>•</span> {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Read Full Link */}
              <div style={linkContainer}>
                <Link href={article.url} style={articleLink}>
                  READ_FULL_STORY ➔
                </Link>
              </div>
            </Section>
          ))}

          {/* Footer Navigation */}
          <Section style={footer}>
            <Text style={footerText}>
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/preferences`} style={footerLink}>
                DELIVERY_PREFERENCES
              </Link>
              <span style={footerDivider}> | </span>
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/subscriptions`} style={footerLink}>
                TOPIC_SUBSCRIPTIONS
              </Link>
            </Text>
            <Text style={copyrightText}>
              AUTONOMOUS SCRAPING AGENT v1.0 // POWERED BY SWIFTIQ & GEMINI 2.0 FLASH
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styling tokens (MacroGlide Premium Cyber Aesthetic)
const mainBg = {
  backgroundColor: '#050505',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: '0',
  padding: '40px 0',
};

const container = {
  backgroundColor: '#0A0A0A',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  margin: '0 auto',
  maxWidth: '600px',
  overflow: 'hidden',
};

const headerSection = {
  padding: '32px 40px 24px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
};

const logoWrapper = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '24px',
};

const logoDot = {
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  backgroundColor: '#C3FF2E',
  display: 'inline-block',
  marginRight: '8px',
};

const logoText = {
  fontFamily: 'monospace',
  fontSize: '14px',
  fontWeight: '700',
  letterSpacing: '1.5px',
  color: '#ffffff',
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '800',
  margin: '0 0 12px 0',
  letterSpacing: '-0.5px',
  textTransform: 'uppercase',
};

const introText = {
  color: '#A3A3A3',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const articleCard = {
  padding: '32px 40px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
};

const domainBadge = {
  display: 'inline-block',
  fontFamily: 'monospace',
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '1px',
  color: '#C3FF2E',
  backgroundColor: 'rgba(195, 255, 46, 0.08)',
  border: '1px solid rgba(195, 255, 46, 0.2)',
  padding: '3px 8px',
  borderRadius: '4px',
  marginBottom: '12px',
};

const h2 = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '700',
  lineHeight: '26px',
  margin: '0 0 10px 0',
};

const summary = {
  color: '#A3A3A3',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 16px 0',
};

const keyPointsContainer = {
  backgroundColor: '#121212',
  border: '1px solid rgba(255, 255, 255, 0.04)',
  borderRadius: '6px',
  padding: '16px',
  margin: '16px 0',
};

const keyPointsTitle = {
  fontFamily: 'monospace',
  color: '#ffffff',
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '1px',
  margin: '0 0 10px 0',
};

const keyPointsList = {
  margin: '0',
  padding: '0',
  listStyleType: 'none',
};

const keyPoint = {
  color: '#D4D4D4',
  fontSize: '13px',
  lineHeight: '19px',
  margin: '6px 0',
};

const bulletSign = {
  color: '#C3FF2E',
  marginRight: '6px',
  fontWeight: '700',
};

const linkContainer = {
  marginTop: '16px',
};

const articleLink = {
  fontFamily: 'monospace',
  color: '#C3FF2E',
  fontSize: '12px',
  fontWeight: '700',
  textDecoration: 'none',
};

const footer = {
  padding: '32px 40px',
  backgroundColor: '#080808',
  textAlign: 'center',
};

const footerText = {
  margin: '0 0 12px 0',
};

const footerLink = {
  fontFamily: 'monospace',
  color: '#A3A3A3',
  fontSize: '11px',
  textDecoration: 'none',
  fontWeight: '600',
};

const footerDivider = {
  color: 'rgba(255, 255, 255, 0.1)',
  margin: '0 8px',
};

const copyrightText = {
  fontFamily: 'monospace',
  color: '#525252',
  fontSize: '9px',
  letterSpacing: '0.5px',
  margin: '0',
};
