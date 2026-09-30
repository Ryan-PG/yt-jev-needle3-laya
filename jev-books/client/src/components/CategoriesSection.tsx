import { useState } from 'react';
import { DEFAULT_CATEGORIES, MAX_CATEGORIES, MIN_CATEGORIES } from '@shared/constants';
import { Button, Field, Notice, Section, TextInput } from './ui';

interface CategoriesSectionProps {
  categories: string[];
  onChange: (categories: string[]) => void;
  disabled: boolean;
}

export function CategoriesSection({ categories, onChange, disabled }: CategoriesSectionProps) {
  const [draft, setDraft] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  function addCategory(rawValue: string): void {
    const value = rawValue.trim();
    if (!value) return;

    if (categories.length >= MAX_CATEGORIES) {
      setMessage(`JEV Choice supports at most ${MAX_CATEGORIES} options per question.`);
      return;
    }
    if (categories.some((category) => category.toLowerCase() === value.toLowerCase())) {
      setMessage(`"${value}" is already in the list.`);
      return;
    }

    setMessage(null);
    onChange([...categories, value]);
    setDraft('');
  }

  function removeCategory(target: string): void {
    setMessage(null);
    onChange(categories.filter((category) => category !== target));
  }

  return (
    <Section
      title="Categories"
      description="Every book is assigned exactly one of these. At least two are required."
      actions={
        <div className="flex items-center gap-3">
          <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
            {categories.length} / {MAX_CATEGORIES}
          </span>
          <Button
            variant="ghost"
            disabled={disabled}
            onClick={() => {
              setMessage(null);
              onChange([...DEFAULT_CATEGORIES]);
            }}
          >
            Reset defaults
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {categories.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No categories yet — add at least two.
            </p>
          ) : (
            categories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white py-1 pl-3 pr-1.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {category}
                <button
                  type="button"
                  aria-label={`Remove ${category}`}
                  disabled={disabled}
                  onClick={() => removeCategory(category)}
                  className="rounded-full px-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:hover:bg-slate-800 dark:hover:text-slate-200 dark:disabled:hover:bg-transparent"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full max-w-xs">
            <Field label="Add a category" htmlFor="new-category">
              <TextInput
                id="new-category"
                value={draft}
                disabled={disabled}
                placeholder="e.g. Travel"
                onChange={setDraft}
              />
            </Field>
          </div>
          <Button
            variant="secondary"
            disabled={disabled || draft.trim() === ''}
            onClick={() => addCategory(draft)}
          >
            Add
          </Button>
        </div>

        {message ? <Notice tone="warning">{message}</Notice> : null}

        {categories.length > 0 && categories.length < MIN_CATEGORIES ? (
          <Notice tone="warning">Add at least {MIN_CATEGORIES} categories to run a benchmark.</Notice>
        ) : null}
      </div>
    </Section>
  );
}
