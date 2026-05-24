import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/AppError.js';
import {
  performCodeReview,
  getUserReviews,
  getReviewById,
} from '../services/review.service.js';
import {
  parseRepoUrl,
  getRepositoryInfo,
  fetchRepositoryCodeFiles,
  fetchSingleFile,
} from '../services/github.service.js';
import { semanticSearchReviews } from '../services/pinecone.service.js';
import { generateTextReport, generatePdfBuffer } from '../services/export.service.js';
import Review from '../models/Review.js';

export const reviewCode = asyncHandler(async (req, res) => {
  const { code, language, title, context } = req.body;

  const review = await performCodeReview({
    userId: req.user._id,
    code,
    language: language || 'javascript',
    title: title || 'Code Snippet Review',
    sourceType: 'snippet',
    context,
  });

  sendSuccess(res, { review }, 'Code review completed', 201);
});

export const reviewFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const code = req.file.buffer.toString('utf-8');
  const language = req.body.language || detectLanguage(req.file.originalname);

  const review = await performCodeReview({
    userId: req.user._id,
    code,
    language,
    title: req.body.title || `File Review: ${req.file.originalname}`,
    sourceType: 'file',
    fileName: req.file.originalname,
  });

  sendSuccess(res, { review }, 'File review completed', 201);
});

export const reviewGithub = asyncHandler(async (req, res) => {
  const { repoUrl, filePath, branch, maxFiles = 3 } = req.body;
  const { owner, repo } = parseRepoUrl(repoUrl);

  const repoInfo = await getRepositoryInfo(owner, repo);
  const reviews = [];

  if (filePath) {
    const file = await fetchSingleFile(owner, repo, filePath);
    const review = await performCodeReview({
      userId: req.user._id,
      code: file.content,
      language: file.language,
      title: `${repo}/${file.path}`,
      sourceType: 'github',
      fileName: file.path,
      githubRepo: `${owner}/${repo}`,
      githubPath: file.path,
      context: `Branch: ${branch || 'default'}, Repo: ${repoInfo.description || ''}`,
    });
    reviews.push(review);
  } else {
    const files = await fetchRepositoryCodeFiles(owner, repo, Number(maxFiles));
    if (!files.length) {
      throw new AppError('No reviewable code files found in repository', 404);
    }

    for (const file of files) {
      const review = await performCodeReview({
        userId: req.user._id,
        code: file.content,
        language: file.language,
        title: `${repo}/${file.path}`,
        sourceType: 'github',
        fileName: file.path,
        githubRepo: `${owner}/${repo}`,
        githubPath: file.path,
        context: `Repository: ${repoInfo.full_name}, Description: ${repoInfo.description || 'N/A'}`,
      });
      reviews.push(review);
    }
  }

  sendSuccess(
    res,
    { reviews, repository: { owner, repo, name: repoInfo.full_name } },
    'GitHub repository review completed',
    201
  );
});

export const getHistory = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query;
  const result = await getUserReviews(req.user._id, {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
    search,
  });
  sendSuccess(res, result);
});

export const getReview = asyncHandler(async (req, res) => {
  const review = await getReviewById(req.params.id, req.user._id);
  sendSuccess(res, { review });
});

export const searchReviews = asyncHandler(async (req, res) => {
  const { query, limit } = req.body;

  const pineconeResults = await semanticSearchReviews(
    query,
    req.user._id,
    Number(limit) || 10
  );

  let reviews = [];
  if (pineconeResults.matches?.length) {
    const ids = pineconeResults.matches.map((m) => m.id);
    reviews = await Review.find({ _id: { $in: ids }, userId: req.user._id }).select('-code');
    reviews.sort(
      (a, b) =>
        pineconeResults.matches.findIndex((m) => m.id === a._id.toString()) -
        pineconeResults.matches.findIndex((m) => m.id === b._id.toString())
    );
  }

  if (!reviews.length) {
    const textResults = await getUserReviews(req.user._id, {
      page: 1,
      limit: Number(limit) || 10,
      search: query,
    });
    reviews = textResults.reviews;
  }

  sendSuccess(res, {
    reviews,
    semanticSearch: pineconeResults.pineconeEnabled,
    matchScores: pineconeResults.matches?.map((m) => ({ id: m.id, score: m.score })),
  });
});

export const exportReview = asyncHandler(async (req, res) => {
  const review = await getReviewById(req.params.id, req.user._id);
  const format = req.query.format || 'txt';

  if (format === 'pdf') {
    const buffer = await generatePdfBuffer(review);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="review-${review._id}.pdf"`
    );
    return res.send(buffer);
  }

  const text = generateTextReport(review);
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="review-${review._id}.txt"`
  );
  res.send(text);
});

function detectLanguage(filename) {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  const map = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.java': 'java',
    '.cpp': 'cpp',
    '.c': 'c',
    '.go': 'go',
  };
  return map[ext] || 'javascript';
}
