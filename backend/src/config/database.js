import mongoose from 'mongoose';
import config from './index.js';
import { cleanupReviewIndexes } from './syncIndexes.js';

const globalCache = globalThis;

if (!globalCache._mongooseCache) {
  globalCache._mongooseCache = { conn: null, promise: null, indexesSynced: false };
}

const cache = globalCache._mongooseCache;

const connectOnce = async () => {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(config.mongodbUri, {
        bufferCommands: false,
        maxPoolSize: 10,
      })
      .then((mongooseInstance) => {
        console.log('MongoDB connected');
        return mongooseInstance;
      });
  }

  cache.conn = await cache.promise;

  if (!cache.indexesSynced) {
    try {
      await cleanupReviewIndexes();
      cache.indexesSynced = true;
    } catch (err) {
      console.warn('Index sync warning:', err.message);
    }
  }

  return cache.conn;
};

/** Serverless-safe connection (reuses pool across warm invocations). */
export const ensureDatabase = async () => {
  if (!config.mongodbUri) {
    throw new Error('MONGODB_URI is not configured');
  }
  return connectOnce();
};

/** Local dev / traditional server startup. */
export const connectDatabase = async () => {
  try {
    await ensureDatabase();
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    if (config.nodeEnv === 'production' && !process.env.VERCEL) {
      process.exit(1);
    }
    if (!process.env.VERCEL) {
      console.warn('Running without MongoDB in development mode');
    } else {
      throw error;
    }
  }
};
