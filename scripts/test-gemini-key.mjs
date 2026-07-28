import { GoogleGenerativeAI } from '@google/generative-ai';
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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// All plausible Gemini model names (current + legacy + preview)
const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-002',
  'gemini-2.5-flash-preview-05-20',
  'gemini-2.5-flash-latest',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash-lite-002',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-002',
  'gemini-2.0-flash-latest',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash-002',
  'gemini-1.5-flash-8b',
];

async function testAll() {
  console.log('API Key:', process.env.GEMINI_API_KEY?.substring(0, 25) + '...\n');
  const working = [];
  
  for (const name of MODELS) {
    try {
      process.stdout.write(`  ${name.padEnd(38)} `);
      const model = genAI.getGenerativeModel({ model: name });
      const result = await model.generateContent('Say OK only, no punctuation');
      const text = result.response.text().trim();
      console.log(`✓  ${text}`);
      working.push(name);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
        console.log('⚠  QUOTA (model exists, quota exhausted)');
        working.push(`${name} [QUOTA]`);
      } else if (msg.includes('404') || msg.includes('not found') || msg.includes('no longer')) {
        console.log('✗  NOT FOUND');
      } else {
        console.log(`?  ${msg.substring(0, 60)}`);
      }
    }
    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n=== WORKING MODELS ===');
  working.forEach(m => console.log(' -', m));
}

testAll().finally(() => process.exit(0));
