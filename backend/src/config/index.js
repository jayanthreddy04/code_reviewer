import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

export const getAllowedOrigins = () => {
  const origins = new Set([
    'http://localhost:5173',
    'http://localhost:4173',
    process.env.CLIENT_URL,
  ]);

  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL}`);
  }
  if (process.env.VERCEL_BRANCH_URL) {
    origins.add(process.env.VERCEL_BRANCH_URL.startsWith('http')
      ? process.env.VERCEL_BRANCH_URL
      : `https://${process.env.VERCEL_BRANCH_URL}`);
  }

  return [...origins].filter(Boolean);
};

const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  isVercel: Boolean(process.env.VERCEL),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/code-reviewer',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  },
  langsmith: {
    tracing: process.env.LANGSMITH_TRACING === 'true',
    project: process.env.LANGSMITH_PROJECT || 'automated-code-reviewer',
    traceCode: process.env.LANGSMITH_TRACE_CODE === 'true',
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    indexName: process.env.PINECONE_INDEX_NAME || 'code-reviews',
    namespace: process.env.PINECONE_NAMESPACE || 'default',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  github: {
    token: process.env.GITHUB_TOKEN,
  },
};

export default config;
