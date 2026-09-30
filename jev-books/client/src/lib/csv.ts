import Papa from 'papaparse';
import { DESCRIPTION_COLUMN, TITLE_COLUMN } from '@shared/constants';
import type { Book } from '@shared/types';

export interface ParsedDataset {
  /** File name, shown in the UI and recorded in the export. */
  name: string;
  /** Every usable book in file order. */
  books: Book[];
  /** Rows skipped because they had neither a title nor a description. */
  skippedRows: number;
}

/** A CSV row, keyed by header name. Only two columns are ever read. */
type CsvRow = Record<string, string | undefined>;

function normalizeHeader(header: string): string {
  return header.replace(/^﻿/, '').trim().toLowerCase();
}

function findField(fields: readonly string[], wanted: string): string | undefined {
  return fields.find((field) => normalizeHeader(field) === wanted);
}

/**
 * Turn parsed CSV rows into books.
 *
 * Pure on purpose: it is the part worth testing, and it is where "ignore every
 * other column" is enforced.
 */
export function toDataset(name: string, results: Papa.ParseResult<CsvRow>): ParsedDataset {
  const fields = results.meta.fields ?? [];
  const titleField = findField(fields, TITLE_COLUMN);
  const descriptionField = findField(fields, DESCRIPTION_COLUMN);

  if (!titleField || !descriptionField) {
    const missing = [
      titleField ? null : `"${TITLE_COLUMN}"`,
      descriptionField ? null : `"${DESCRIPTION_COLUMN}"`,
    ].filter((value): value is string => value !== null);
    throw new Error(
      `The CSV is missing the required column${missing.length > 1 ? 's' : ''} ${missing.join(' and ')}. ` +
        `Found: ${fields.length > 0 ? fields.join(', ') : 'no header row'}.`,
    );
  }

  const books: Book[] = [];
  let skippedRows = 0;

  for (const row of results.data) {
    const title = (row[titleField] ?? '').trim();
    const description = (row[descriptionField] ?? '').trim();

    // Every other column is ignored on purpose.
    if (!title && !description) {
      skippedRows += 1;
      continue;
    }

    books.push({
      // Stable identifier: 1-based position among the usable books.
      id: String(books.length + 1),
      title,
      description,
    });
  }

  if (books.length === 0) {
    throw new Error('The CSV contained no rows with a title or a description.');
  }

  return { name, books, skippedRows };
}

/** Parse an uploaded CSV, reading only the `title` and `description` columns. */
export function parseBooksCsv(file: File): Promise<ParsedDataset> {
  return new Promise((resolve, reject) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        try {
          resolve(toDataset(file.name, results));
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Could not read the CSV file.'));
        }
      },
      error: (error: Error) => {
        reject(new Error(`Could not read the CSV file: ${error.message}`));
      },
    });
  });
}
