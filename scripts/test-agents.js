import { loadEnvConfig } from '@next/env';
const projectDir = process.cwd();
loadEnvConfig(projectDir);

import { runScraperAgent } from '@/lib/agents/scraper';
import { runClassifierAgent } from '@/lib/agents/classifier';
import { runSummarizerAgent } from '@/lib/agents/summarizer';
import { runDigestGeneratorAgent } from '@/lib/agents/digest-generator';
import { runEmailSenderAgent } from '@/lib/agents/email-sender';
import { prisma } from '@/lib/services/db';

async function main() {
  const arg = process.argv[2] || 'all';
  console.log(`🧪 Starting local agent test runner (mode: ${arg})`);

  try {
    // 1. Scrape Feed news sources
    if (arg === 'scrape' || arg === 'all') {
      console.log('\n--- 1. Running Scraper Agent ---');
      const scraped = await runScraperAgent();
      console.log(`Scraper completed. Fetched ${scraped.length} articles.`);
    }

    // 2. Classify raw articles with Gemini
    if (arg === 'classify' || arg === 'all') {
      console.log('\n--- 2. Running Classifier Agent ---');
      const classified = await runClassifierAgent(5); // limit to 5 for fast testing
      console.log(`Classifier completed. Processed ${classified.length} raw articles.`);
    }

    // 3. Summarize articles with Gemini
    if (arg === 'summarize' || arg === 'all') {
      console.log('\n--- 3. Running Summarizer Agent ---');
      const summarized = await runSummarizerAgent(5); // limit to 5 for fast testing
      console.log(`Summarizer completed. Summarized ${summarized.length} articles.`);
    }

    // 4. Generate user digests and queue them
    if (arg === 'digest' || arg === 'all') {
      console.log('\n--- 4. Running Digest Generator Agent ---');
      const digests = await runDigestGeneratorAgent();
      console.log(`Digest Generator completed. Queued ${digests.length} digests.`);
    }

    // 5. Send emails
    if (arg === 'send' || arg === 'all') {
      console.log('\n--- 5. Running Email Sender Agent ---');
      const sent = await runEmailSenderAgent(5); // limit to 5 for testing
      console.log(`Email Sender completed. Dispatched ${sent.length} emails.`);
    }

    console.log('\n✨ Local agent test runner completed successfully.');
  } catch (error) {
    console.error('\n❌ Test runner failed with error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
