/**
 * Constants shared by the browser client and the Express server.
 * Runtime values, imported normally by both sides.
 */

/**
 * Books per request. Both classifiers must use exactly this batch size.
 * Never send the whole dataset in one request, and never classify one book per
 * request.
 */
export const BATCH_SIZE = 100;

/** How many books are taken from the uploaded CSV unless the user says otherwise. */
export const DEFAULT_BOOK_LIMIT = 1000;

/**
 * Maximum categories per run.
 *
 * JEV's Choice primitive accepts at most 255 options per question
 * (https://docs.typesafe.ai/api), so the UI and the API both refuse to send more
 * than this rather than silently forwarding an unsupported request.
 */
export const MAX_CATEGORIES = 255;

/** A choice between fewer than two options is not a classification. */
export const MIN_CATEGORIES = 2;

/** Categories offered by default; fully editable in the UI. */
export const DEFAULT_CATEGORIES: readonly string[] = [
  'Fiction',
  'Mystery',
  'Romance',
  'Fantasy',
  'Science Fiction',
  'Biography',
  'History',
  'Business',
  'Philosophy',
];

/** The only two columns read from the uploaded CSV. Everything else is ignored. */
export const TITLE_COLUMN = 'title';
export const DESCRIPTION_COLUMN = 'description';
