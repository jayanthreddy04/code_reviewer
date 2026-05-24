import { Router } from 'express';
import multer from 'multer';
import {
  reviewCode,
  reviewFile,
  reviewGithub,
  getHistory,
  getReview,
  searchReviews,
  exportReview,
} from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  reviewCodeValidator,
  reviewGithubValidator,
  searchValidator,
  historyQueryValidator,
} from '../validators/review.validator.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(js|jsx|ts|tsx|py|java|cpp|c|h|go|rb|php|cs|rs|vue|txt)$/i;
    if (allowed.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  },
});

router.use(protect);

router.post('/code', reviewCodeValidator, validate, reviewCode);
router.post('/file', upload.single('file'), reviewFile);
router.post('/github', reviewGithubValidator, validate, reviewGithub);
router.get('/history', historyQueryValidator, validate, getHistory);
router.post('/search', searchValidator, validate, searchReviews);
router.get('/:id/export', exportReview);
router.get('/:id', getReview);

export default router;
