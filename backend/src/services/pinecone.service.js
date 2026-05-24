import { Pinecone } from '@pinecone-database/pinecone';
import config from '../config/index.js';
import { generateSearchEmbedding } from './groq.service.js';

let pineconeClient = null;
let pineconeIndex = null;

const getIndex = async () => {
  if (!config.pinecone.apiKey) {
    return null;
  }

  if (!pineconeClient) {
    pineconeClient = new Pinecone({ apiKey: config.pinecone.apiKey });
  }

  if (!pineconeIndex) {
    pineconeIndex = pineconeClient.index(config.pinecone.indexName);
  }

  return pineconeIndex;
};

export const upsertReviewEmbedding = async (review) => {
  const index = await getIndex();
  if (!index) return null;

  const textForEmbedding = [
    review.title,
    review.summary,
    review.language,
    ...(review.bugs || []).slice(0, 5),
    ...(review.securityIssues || []).slice(0, 5),
    review.code?.slice(0, 2000),
  ]
    .filter(Boolean)
    .join('\n');

  const embedding = await generateSearchEmbedding(textForEmbedding);
  if (!embedding) return null;

  const id = review._id?.toString() || review.id;
  const namespace = config.pinecone.namespace;

  await index.namespace(namespace).upsert([
    {
      id,
      values: embedding,
      metadata: {
        userId: review.userId?.toString(),
        title: review.title?.slice(0, 200),
        language: review.language,
        qualityScore: review.qualityScore,
        sourceType: review.sourceType,
        summary: review.summary?.slice(0, 500),
        createdAt: review.createdAt?.toISOString?.() || new Date().toISOString(),
      },
    },
  ]);

  return id;
};

export const semanticSearchReviews = async (query, userId, topK = 10) => {
  const index = await getIndex();
  if (!index) {
    return { matches: [], pineconeEnabled: false };
  }

  const embedding = await generateSearchEmbedding(query);
  if (!embedding) {
    return { matches: [], pineconeEnabled: true };
  }

  const namespace = config.pinecone.namespace;
  const results = await index.namespace(namespace).query({
    vector: embedding,
    topK,
    includeMetadata: true,
    filter: userId ? { userId: { $eq: userId.toString() } } : undefined,
  });

  return {
    matches: (results.matches || []).map((m) => ({
      id: m.id,
      score: m.score,
      metadata: m.metadata,
    })),
    pineconeEnabled: true,
  };
};
