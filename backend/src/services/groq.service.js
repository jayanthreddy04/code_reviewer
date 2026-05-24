import Groq from 'groq-sdk';
import config from '../config/index.js';
import { AppError } from '../utils/AppError.js';

let groqClient = null;

const getClient = () => {
  if (!config.groq.apiKey) {
    throw new AppError('Groq API key not configured. Set GROQ_API_KEY in .env', 503);
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey: config.groq.apiKey });
  }
  return groqClient;
};

const REVIEW_SYSTEM_PROMPT = `You are an expert senior software engineer performing automated code reviews.
Analyze the provided code thoroughly and respond ONLY with valid JSON (no markdown fences) matching this schema:
{
  "qualityScore": number (0-100),
  "summary": "brief overall assessment",
  "bugs": ["array of bug descriptions"],
  "securityIssues": ["array of security vulnerabilities"],
  "performanceTips": ["array of performance improvements"],
  "bestPractices": ["array of clean code recommendations"],
  "refactoringIdeas": ["array of refactoring suggestions"],
  "duplicateCode": ["array of duplicate code observations"],
  "complexityAnalysis": "cyclomatic complexity and maintainability assessment",
  "inlineComments": [
    {
      "line": number,
      "message": "specific issue or praise",
      "severity": "low" | "medium" | "high",
      "category": "bug|security|performance|style|best-practice",
      "suggestion": "actionable fix"
    }
  ],
  "markdownReport": "full markdown formatted review report with headers, bullet points, and code examples where helpful"
}`;

export const analyzeCodeWithGroq = async ({ code, language, fileName, context = '' }) => {
  const client = getClient();

  const userPrompt = `Programming language: ${language}
${fileName ? `File: ${fileName}` : ''}
${context ? `Context: ${context}` : ''}

Code to review:
\`\`\`
${code.slice(0, 50000)}
\`\`\`

Provide comprehensive analysis including bugs, security, performance, best practices, refactoring, complexity, and line-by-line inline comments.`;

  try {
    const completion = await client.chat.completions.create({
      model: config.groq.model,
      messages: [
        { role: 'system', content: REVIEW_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 8192,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new AppError('Empty response from Groq API', 502);
    }

    return parseGroqResponse(content);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Groq API error: ${error.message}`, 502);
  }
};

function parseGroqResponse(content) {
  try {
    const parsed = JSON.parse(content);
    return {
      qualityScore: Math.min(100, Math.max(0, Number(parsed.qualityScore) || 70)),
      summary: parsed.summary || 'Review completed',
      bugs: parsed.bugs || [],
      securityIssues: parsed.securityIssues || [],
      performanceTips: parsed.performanceTips || [],
      bestPractices: parsed.bestPractices || [],
      refactoringIdeas: parsed.refactoringIdeas || [],
      duplicateCode: parsed.duplicateCode || [],
      complexityAnalysis: parsed.complexityAnalysis || '',
      inlineComments: (parsed.inlineComments || []).map((c) => ({
        line: Number(c.line) || 1,
        message: c.message || '',
        severity: ['low', 'medium', 'high'].includes(c.severity) ? c.severity : 'medium',
        category: c.category || 'general',
        suggestion: c.suggestion || '',
      })),
      markdownReport: parsed.markdownReport || '',
    };
  } catch {
    return {
      qualityScore: 70,
      summary: content.slice(0, 500),
      bugs: [],
      securityIssues: [],
      performanceTips: [],
      bestPractices: [],
      refactoringIdeas: [],
      duplicateCode: [],
      complexityAnalysis: '',
      inlineComments: [],
      markdownReport: content,
    };
  }
}

export const generateSearchEmbedding = async (text) => {
  if (!config.openai.apiKey) {
    return null;
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.openai.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000),
    }),
  });

  if (!response.ok) {
    console.warn('Embedding generation failed');
    return null;
  }

  const data = await response.json();
  return data.data[0]?.embedding || null;
};
