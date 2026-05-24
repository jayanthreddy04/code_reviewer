/**
 * Vercel serverless entry — Express API (do not call app.listen here).
 * Local dev still uses: npm run dev:backend
 */
import app from '../backend/src/app.js';
import { ensureDatabase } from '../backend/src/config/database.js';

export const config = {
  maxDuration: 60,
};

app.use(async (req, res, next) => {
  try {
    await ensureDatabase();
    next();
  } catch (err) {
    console.error('Database connection failed:', err.message);
    res.status(503).json({
      success: false,
      message: 'Database unavailable. Check MONGODB_URI in Vercel environment variables.',
    });
  }
});

export default app;
