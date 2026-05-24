import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config, { getAllowedOrigins } from './config/index.js';
import { ensureDatabase } from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import reviewRoutes from './routes/review.routes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { AppError } from './utils/AppError.js';

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const corsOrigin = (origin, callback) => {
  if (!origin) {
    return callback(null, true);
  }
  const allowed = getAllowedOrigins();
  const isAllowed =
    allowed.includes(origin) ||
    /\.vercel\.app$/i.test(origin);
  callback(null, isAllowed);
};

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.nodeEnv === 'production' ? 100 : 500,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api', limiter);

const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: config.nodeEnv === 'production' ? 20 : 100,
  message: { success: false, message: 'Review rate limit exceeded' },
});
app.use('/api/review', reviewLimiter);

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Automated Code Reviewer API is running',
    timestamp: new Date().toISOString(),
  });
});

const requireDatabase = async (_req, res, next) => {
  try {
    await ensureDatabase();
    next();
  } catch (err) {
    console.error('Database connection failed:', err.message);
    res.status(503).json({
      success: false,
      message: 'Database unavailable. Check MONGODB_URI and Atlas network access.',
    });
  }
};

app.use('/api/auth', requireDatabase);
app.use('/api/review', requireDatabase);

app.use('/api/auth', authRoutes);
app.use('/api/review', reviewRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
