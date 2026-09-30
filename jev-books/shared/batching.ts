import { BATCH_SIZE } from './constants';
import type { Book } from './types';

/**
 * Split books into batches of exactly `size`, preserving input order.
 *
 * Order is significant: both classifiers must receive the exact same batches in
 * the exact same order, so this function never shuffles and never samples. A
 * trailing batch is only ever shorter when the dataset is not a multiple of the
 * batch size.
 */
export function createBatches<T>(items: readonly T[], size: number = BATCH_SIZE): T[][] {
  if (!Number.isInteger(size) || size < 1) {
    throw new Error(`Batch size must be a positive integer, received ${size}.`);
  }

  const batches: T[][] = [];
  for (let start = 0; start < items.length; start += size) {
    batches.push(items.slice(start, start + size));
  }
  return batches;
}

/** Number of batches a dataset of `bookCount` books splits into. */
export function countBatches(bookCount: number, size: number = BATCH_SIZE): number {
  return Math.ceil(bookCount / size);
}

/** True when `batch` is a legal batch: a full batch, or a short final batch. */
export function isValidBatchSize(batchLength: number, totalBatches: number, batchNumber: number): boolean {
  const isFinalBatch = batchNumber === totalBatches;
  if (batchLength === BATCH_SIZE) return true;
  return isFinalBatch && batchLength > 0 && batchLength < BATCH_SIZE;
}

/** Books after the first `limit`, keeping their original order. */
export function takeBooks(books: readonly Book[], limit: number): Book[] {
  return books.slice(0, Math.max(0, limit));
}
