/**
 * Vercel serverless entry — Express API (do not call app.listen here).
 * Local dev still uses: npm run dev:backend
 */
import app from '../backend/src/app.js';

export const config = {
  maxDuration: 60,
};

export default app;
