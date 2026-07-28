import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model fallback chain — tries in order, falls back on quota/rate limit errors
const MODEL_CHAIN = ['gemini-2.0-flash', 'gemini-2.0-flash-lite'];

async function generateWithFallback(prompt) {
  let lastError;
  for (const modelName of MODEL_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return { text: result.response.text(), model: modelName };
    } catch (err) {
      lastError = err;
      const isQuota =
        err.message?.includes('429') ||
        err.message?.includes('RESOURCE_EXHAUSTED') ||
        err.message?.includes('quota');
      if (isQuota && modelName !== MODEL_CHAIN[MODEL_CHAIN.length - 1]) {
        console.warn(`[Gemini] ${modelName} quota hit, falling back...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

/**
 * Classify an article into domain, topics, sentiment.
 * Cost-optimized: short prompt, 400-char content cap enforced by callers.
 */
export async function classifyArticle(title, content, sourceDomain = null) {
  // Compact prompt with source category hint — fewer tokens, better accuracy
  const sourceHint = sourceDomain ? `Source Category: ${sourceDomain}\n` : '';
  const prompt = `Classify this news article. Reply ONLY with JSON, no markdown.

${sourceHint}Title: ${title}
Content: ${content.slice(0, 400)}

JSON format:
{"domain":"finance|technology|health|politics|sports","subTopics":["t1","t2"],"sentiment":0.0,"keywords":["k1","k2","k3"]}`;

  try {
    const { text, model } = await generateWithFallback(prompt);
    console.log(`[Gemini] Classified via ${model}`);
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Classification error:', error.message);
    throw error;
  }
}

/**
 * Generate multi-tier summaries for an article.
 * Cost-optimized: compact prompt, 500-char content cap enforced by callers.
 */
export async function summarizeArticle(title, content) {
  // Compact prompt — fewer tokens = lower cost
  const prompt = `Summarize this news article. Reply ONLY with JSON, no markdown.

Title: ${title}
Content: ${content.slice(0, 500)}

JSON format:
{"brief":"1-2 sentence essence","medium":"3-4 sentence overview","detailed":"full paragraph","keyPoints":["p1","p2","p3"]}`;

  try {
    const { text, model } = await generateWithFallback(prompt);
    console.log(`[Gemini] Summarized via ${model}`);
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Summarization error:', error.message);
    throw error;
  }
}

/**
 * Generate personalized digest introduction.
 * Cost-optimized: uses only titles, no full summaries.
 */
export async function generatePersonalizedDigest(articles, userName) {
  // Use only titles to minimize token count
  const topTitles = articles
    .slice(0, 5)
    .map((a, i) => `${i + 1}. [${a.domain}] ${a.title}`)
    .join('\n');

  const prompt = `Write a 2-sentence personalized news digest intro for ${userName}.
Top stories:\n${topTitles}\nBe warm, concise, and highlight the most interesting story.`;

  try {
    const { text } = await generateWithFallback(prompt);
    return text;
  } catch (error) {
    console.error('Digest generation error:', error.message);
    return `Good morning, ${userName}! Here's your personalized news digest for today.`;
  }
}
