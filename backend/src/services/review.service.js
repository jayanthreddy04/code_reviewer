import Review from '../models/Review.js';
import { analyzeCodeWithGroq } from './groq.service.js';
import { analyzeCodeStatically } from './staticAnalysis.service.js';
import { upsertReviewEmbedding } from './pinecone.service.js';
import { AppError } from '../utils/AppError.js';

const mergeInlineComments = (aiComments, staticIssues) => {
  const map = new Map();

  [...(aiComments || []), ...(staticIssues || [])].forEach((comment) => {
    const key = `${comment.line}-${comment.category}`;
    if (!map.has(key) || severityRank(comment.severity) > severityRank(map.get(key).severity)) {
      map.set(key, comment);
    }
  });

  return Array.from(map.values()).sort((a, b) => a.line - b.line);
};

const severityRank = (s) => ({ low: 1, medium: 2, high: 3 }[s] || 2);

export const performCodeReview = async ({
  userId,
  code,
  language = 'javascript',
  title,
  sourceType = 'snippet',
  fileName,
  githubRepo,
  githubPath,
  context,
}) => {
  if (!code?.trim()) {
    throw new AppError('Code content is required', 400);
  }

  const staticResult = analyzeCodeStatically(code, language);
  const aiResult = await analyzeCodeWithGroq({ code, language, fileName, context });

  const inlineComments = mergeInlineComments(aiResult.inlineComments, staticResult.issues);

  const review = await Review.create({
    userId,
    title: title || fileName || `Code Review - ${language}`,
    sourceType,
    language,
    code: code.slice(0, 100000),
    fileName,
    githubRepo,
    githubPath,
    qualityScore: aiResult.qualityScore,
    summary: aiResult.summary,
    markdownReport: aiResult.markdownReport,
    bugs: aiResult.bugs,
    securityIssues: aiResult.securityIssues,
    performanceTips: aiResult.performanceTips,
    bestPractices: aiResult.bestPractices,
    refactoringIdeas: aiResult.refactoringIdeas,
    duplicateCode: [...aiResult.duplicateCode, ...staticResult.duplicateBlocks.map((d) => `Lines ${d.startLine}-${d.startLine + d.lines}`)],
    complexityAnalysis: aiResult.complexityAnalysis,
    inlineComments,
    staticAnalysis: staticResult.metrics,
    metadata: { staticIssuesCount: staticResult.issues.length },
  });

  try {
    const pineconeId = await upsertReviewEmbedding(review);
    if (pineconeId) {
      review.pineconeId = pineconeId;
      await review.save();
    }
  } catch (err) {
    console.warn('Pinecone upsert failed:', err.message);
  }

  return review;
};

export const getUserReviews = async (userId, { page = 1, limit = 20, search } = {}) => {
  const query = { userId };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { summary: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    Review.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-code'),
    Review.countDocuments(query),
  ]);

  return {
    reviews,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const getReviewById = async (reviewId, userId) => {
  const review = await Review.findOne({ _id: reviewId, userId });
  if (!review) {
    throw new AppError('Review not found', 404);
  }
  return review;
};
