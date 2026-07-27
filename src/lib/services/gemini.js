import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Classify an article into domain, topics, sentiment
 * @param {string} title - Article title
 * @param {string} content - Article content
 * @returns {Promise<Object>} Classification result
 */
export async function classifyArticle(title, content) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const prompt = `You are a news classification expert. Analyze this article and provide classification data.

Article Title: ${title}
Article Content: ${content.slice(0, 2000)}

Respond ONLY with a JSON object (no markdown, no explanations) in this exact format:
{
  "domain": "one of: finance, technology, health, politics, sports",
  "subTopics": ["keyword1", "keyword2", "keyword3"],
  "sentiment": 0.5,
  "keywords": ["entity1", "entity2", "entity3"]
}

Rules:
- sentiment is a number between -1 (very negative) and 1 (very positive)
- subTopics are specific topics within the domain (max 3)
- keywords are key entities mentioned (companies, people, places - max 5)
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Classification error:', error);
    throw error;
  }
}

/**
 * Generate multi-tier summaries for an article
 * @param {string} title - Article title
 * @param {string} content - Article content
 * @returns {Promise<Object>} Summary result with brief, medium, detailed, and keyPoints
 */
export async function summarizeArticle(title, content) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const prompt = `You are an expert news summarizer. Create three versions of a summary for this article.

Article Title: ${title}
Article Content: ${content}

Respond ONLY with a JSON object (no markdown, no explanations) in this exact format:
{
  "brief": "1-2 sentence summary capturing the absolute essence",
  "medium": "3-4 sentence summary with main points and context",
  "detailed": "1 paragraph comprehensive overview with key details",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"]
}

Rules:
- Be factual and objective
- Preserve important numbers and dates
- Avoid speculation
- Use clear, concise language
- keyPoints should be 3-5 actionable takeaways
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Summarization error:', error);
    throw error;
  }
}

/**
 * Generate personalized digest introduction
 * @param {Array} articles - Array of article objects
 * @param {string} userName - User's name
 * @returns {Promise<string>} Personalized introduction
 */
export async function generatePersonalizedDigest(articles, userName) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const articlesText = articles.map((a, i) => 
    `${i + 1}. [${a.domain.toUpperCase()}] ${a.title}\n   ${a.summary}`
  ).join('\n\n');
  
  const prompt = `You are writing a personalized news digest for ${userName}.

Here are today's top articles:

${articlesText}

Write a brief, engaging introduction (2-3 sentences) that:
- Welcomes the reader
- Highlights the most important or interesting story
- Sets the tone for the digest

Be conversational but professional. Make it personal.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Digest generation error:', error);
    return `Good morning, ${userName}! Here's your personalized news digest for today.`;
  }
}
