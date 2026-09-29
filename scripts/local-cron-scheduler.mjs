/**
 * Local Cron Runner for Development
 * Automatically triggers all 5 cron endpoints on their configured intervals
 * using the local CRON_SECRET header.
 * 
 * Usage: node scripts/local-cron-scheduler.mjs
 */

import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnvFile(filePath) {
  try {
    const content = readFileSync(resolve(filePath), 'utf-8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) return;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    });
  } catch (_) {}
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || 'your-random-secret-key';

async function triggerCron(name, path) {
  const url = `${APP_URL}${path}`;
  const now = new Date().toLocaleTimeString();
  console.log(`[${now}] ⏰ Triggering cron: ${name} (${path})...`);
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
      },
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`[${now}] ✓ ${name} Success:`, JSON.stringify(data));
    } else {
      console.log(`[${now}] ✗ ${name} Failed (${res.status}):`, JSON.stringify(data));
    }
    return data;
  } catch (err) {
    console.error(`[${now}] ✗ ${name} Error:`, err.message);
    return null;
  }
}

async function runInitialPipeline() {
  console.log('🚀 Running initial full pipeline sequence...\n');
  await triggerCron('Scrape News', '/api/cron/scrape-news');
  await new Promise(r => setTimeout(r, 2000));
  await triggerCron('Classify Articles', '/api/cron/classify-articles');
  await new Promise(r => setTimeout(r, 2000));
  await triggerCron('Summarize Articles', '/api/cron/summarize-articles');
  await new Promise(r => setTimeout(r, 2000));
  await triggerCron('Generate Digests', '/api/cron/generate-digests');
  await new Promise(r => setTimeout(r, 2000));
  await triggerCron('Send Emails', '/api/cron/send-emails');
  console.log('\n✨ Initial pipeline sweep complete. Entering scheduled intervals...\n');
}

console.log('====================================================');
console.log('🤖 LOCAL CRON SCHEDULER STARTED');
console.log(`Targeting: ${APP_URL}`);
console.log('Schedules:');
console.log('  - Scrape News:         Every 10 minutes');
console.log('  - Classify Articles:   Every 5 minutes');
console.log('  - Summarize Articles:  Every 5 minutes');
console.log('  - Generate Digests:    Every 15 minutes');
console.log('  - Send Emails:         Every 2 minutes');
console.log('====================================================\n');

// Run complete initial pipeline sweep
runInitialPipeline();

// Set recurring intervals
setInterval(() => triggerCron('Scrape News', '/api/cron/scrape-news'), 10 * 60 * 1000);
setInterval(() => triggerCron('Classify Articles', '/api/cron/classify-articles'), 5 * 60 * 1000);
setInterval(() => triggerCron('Summarize Articles', '/api/cron/summarize-articles'), 5 * 60 * 1000);
setInterval(() => triggerCron('Generate Digests', '/api/cron/generate-digests'), 15 * 60 * 1000);
setInterval(() => triggerCron('Send Emails', '/api/cron/send-emails'), 2 * 60 * 1000);
