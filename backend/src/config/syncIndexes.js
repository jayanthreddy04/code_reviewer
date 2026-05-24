import Review from '../models/Review.js';

/** Drop legacy text index that conflicts with the `language` (code lang) field. */
export const cleanupReviewIndexes = async () => {
  let indexes = [];

  try {
    indexes = await Review.collection.indexes();
  } catch (err) {
    const collectionDoesNotExist =
      err.code === 26 || /ns does not exist/i.test(err.message || '');

    if (!collectionDoesNotExist) {
      throw err;
    }
  }

  for (const idx of indexes) {
    const isTextIndex =
      idx.key?.title === 'text' ||
      idx.key?.summary === 'text' ||
      idx.name?.includes('text');

    if (isTextIndex && idx.name !== '_id_') {
      try {
        await Review.collection.dropIndex(idx.name);
        console.log(`Dropped legacy text index: ${idx.name}`);
      } catch {
        // Index may already be gone
      }
    }
  }

  await Review.syncIndexes();
};
