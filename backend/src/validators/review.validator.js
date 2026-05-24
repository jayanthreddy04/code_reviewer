import { body, query } from 'express-validator';

export const reviewCodeValidator = [
  body('code').notEmpty().withMessage('Code is required'),
  body('language')
    .optional()
    .isIn(['javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'go', 'ruby', 'php'])
    .withMessage('Unsupported language'),
  body('title').optional().trim(),
];

export const reviewGithubValidator = [
  body('repoUrl').notEmpty().withMessage('Repository URL is required'),
  body('filePath').optional().trim(),
  body('maxFiles').optional().isInt({ min: 1, max: 10 }),
];

export const searchValidator = [
  body('query').trim().notEmpty().withMessage('Search query is required'),
  body('limit').optional().isInt({ min: 1, max: 50 }),
];

export const historyQueryValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];
