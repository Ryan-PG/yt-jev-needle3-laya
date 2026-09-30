import { useEffect, useRef, useState } from 'react';
import { BOOK_LIMIT_PRESETS } from '../lib/presets';
import type { ParsedDataset } from '../lib/csv';
import { Button, Field, Notice, Section, TextInput } from './ui';
import { formatCount } from '../lib/format';

const presetButtonClasses =
  'rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 ' +
  'disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-white ' +
  'dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:disabled:text-slate-600 dark:disabled:hover:bg-slate-900';

interface DatasetSectionProps {
  dataset: ParsedDataset | null;
  parsing: boolean;
  error: string | null;
  bookLimit: number;
  onBookLimitChange: (value: number) => void;
  onFileSelected: (file: File) => void;
  /** Books actually used in a run: the first `bookLimit` books. */
  booksUsed: number;
  batchCount: number;
  disabled: boolean;
}

export function DatasetSection({
  dataset,
  parsing,
  error,
  bookLimit,
  onBookLimitChange,
  onFileSelected,
  booksUsed,
  batchCount,
  disabled,
}: DatasetSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // The number field is edited as text so it can be cleared while typing; the
  // committed value always comes back down from the parent.
  const [bookLimitDraft, setBookLimitDraft] = useState(String(bookLimit));

  useEffect(() => {
    setBookLimitDraft(String(bookLimit));
  }, [bookLimit]);

  return (
    <Section
      title="Dataset"
      description="Upload a CSV. Only the title and description columns are read; every other column is ignored."
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onFileSelected(file);
              // Allow re-selecting the same file.
              event.target.value = '';
            }}
          />
          <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={parsing || disabled}>
            {parsing ? 'Reading…' : dataset ? 'Replace CSV' : 'Upload CSV'}
          </Button>
          {dataset ? (
            <span className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium text-slate-900 dark:text-slate-100">{dataset.name}</span> ·{' '}
              {formatCount(dataset.books.length)} usable books
              {dataset.skippedRows > 0 ? ` · ${formatCount(dataset.skippedRows)} empty rows skipped` : ''}
            </span>
          ) : (
            <span className="text-sm text-slate-500 dark:text-slate-400">No dataset loaded</span>
          )}
        </div>

        {error ? <Notice tone="error">{error}</Notice> : null}

        {dataset ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Books to classify"
              htmlFor="book-limit"
              hint={`Taken from the top of the file, never shuffled. ${batchCount} batches of 100.`}
            >
              <div className="flex items-center gap-2">
                <TextInput
                  id="book-limit"
                  type="number"
                  min={1}
                  max={dataset.books.length}
                  value={bookLimitDraft}
                  disabled={disabled}
                  mono
                  onChange={(value) => {
                    setBookLimitDraft(value);
                    const parsed = Number.parseInt(value, 10);
                    if (Number.isFinite(parsed)) onBookLimitChange(parsed);
                  }}
                  onBlur={() => setBookLimitDraft(String(bookLimit))}
                />
                <div className="flex shrink-0 gap-1">
                  {BOOK_LIMIT_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      disabled={disabled || preset > dataset.books.length}
                      onClick={() => onBookLimitChange(preset)}
                      className={presetButtonClasses}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </Field>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {formatCount(booksUsed)} books · {batchCount} batches · 100 books per batch
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Available: {formatCount(dataset.books.length)} books in this file.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </Section>
  );
}
