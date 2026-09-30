import type { Book, Classification } from '../../../shared/types';

export interface ValidationOk {
  ok: true;
  /** Classifications in the order of the input batch, with category labels normalized. */
  value: Classification[];
}

export interface ValidationFailure {
  ok: false;
  errors: string[];
}

export type ValidationResult = ValidationOk | ValidationFailure;

/**
 * Validation applied to *both* classifiers, so neither can quietly produce bad data.
 *
 * 1. every input book received exactly one classification
 * 2. every returned book id exists in the batch
 * 3. every category belongs to the configured categories
 * 4. there are no duplicate classifications for the same book
 *
 * Category labels are compared after trimming and lower-casing and are replaced
 * by the configured spelling. That normalizes a model that answers
 * "science fiction" into the configured "Science Fiction"; a label that matches
 * no configured category is a failure, so a classification outside the configured
 * set is never accepted.
 */
export function validateClassifications(
  books: readonly Book[],
  categories: readonly string[],
  classifications: readonly Classification[],
): ValidationResult {
  const errors: string[] = [];

  const byId = new Map<string, string>();
  const knownIds = new Set(books.map((book) => book.id));
  const canonicalCategory = new Map<string, string>();
  for (const category of categories) {
    canonicalCategory.set(category.trim().toLowerCase(), category);
  }

  for (const classification of classifications) {
    const rawId = typeof classification.bookId === 'string' ? classification.bookId.trim() : '';
    const rawCategory = typeof classification.category === 'string' ? classification.category.trim() : '';

    if (!rawId) {
      errors.push('Received a classification with an empty book id.');
      continue;
    }
    if (!knownIds.has(rawId)) {
      errors.push(`Received a classification for book id "${rawId}", which is not in this batch.`);
      continue;
    }
    if (byId.has(rawId)) {
      errors.push(`Book id "${rawId}" was classified more than once.`);
      continue;
    }
    if (!rawCategory) {
      errors.push(`Book id "${rawId}" was classified with an empty category.`);
      continue;
    }

    const canonical = canonicalCategory.get(rawCategory.toLowerCase());
    if (!canonical) {
      errors.push(
        `Book id "${rawId}" was classified as "${rawCategory}", which is not one of the configured categories.`,
      );
      continue;
    }

    byId.set(rawId, canonical);
  }

  for (const book of books) {
    if (!byId.has(book.id)) {
      errors.push(`Book id "${book.id}" (${JSON.stringify(book.title)}) was not classified.`);
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors: errors.slice(0, 25) };
  }

  // Return in batch order so downstream comparison is order-stable.
  return { ok: true, value: books.map((book) => ({ bookId: book.id, category: byId.get(book.id) as string })) };
}
