import { loadEnvConfig } from '@next/env';
const projectDir = process.cwd();
loadEnvConfig(projectDir);

import { runScraperAgent } from '@/lib/agents/scraper';
import { runClassifierAgent } from '@/lib/agents/classifier';
import { runSummarizerAgent } from '@/lib/agents/summarizer';
import { runChunkerAgent } from '@/lib/agents/chunker';
import { runEmbedderAgent } from '@/lib/agents/embedder';
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
      const classified = await runClassifierAgent(100);
      console.log(`Classifier completed. Processed ${classified.length} raw articles.`);
    }

    // 3. Summarize articles with Gemini
    if (arg === 'summarize' || arg === 'all') {
      console.log('\n--- 3. Running Summarizer Agent ---');
      const summarized = await runSummarizerAgent(100);
      console.log(`Summarizer completed. Summarized ${summarized.length} articles.`);
    }

    // 3.5 Chunk summarized articles for the RAG layer (opt-in only, not part of `all`
    // since it's a new stage on top of the original 5-stage pipeline)
    if (arg === 'chunk') {
      console.log('\n--- 3.5 Running Chunker Agent ---');
      const { articlesProcessed, chunksCreated } = await runChunkerAgent(15);
      console.log(`Chunker completed. Chunked ${articlesProcessed} articles into ${chunksCreated} chunks.`);
    }

    // 3.6 Embed chunked content for the RAG layer (opt-in only, not part of `all`)
    if (arg === 'embed') {
      console.log('\n--- 3.6 Running Embedder Agent ---');
      const { chunksEmbedded } = await runEmbedderAgent(100);
      console.log(`Embedder completed. Embedded ${chunksEmbedded} chunks.`);
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
