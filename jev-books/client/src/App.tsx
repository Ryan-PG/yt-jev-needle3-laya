import { useCallback, useEffect, useMemo, useState } from 'react';
import { BATCH_SIZE, DEFAULT_BOOK_LIMIT, DEFAULT_CATEGORIES, MAX_CATEGORIES } from '@shared/constants';
import { countBatches } from '@shared/batching';
import type { LlmProviderInfo } from '@shared/types';

import { CategoriesSection } from './components/CategoriesSection';
import { ClassifierPanel } from './components/ClassifierPanel';
import { DatasetSection } from './components/DatasetSection';
import { ResultsSection } from './components/ResultsSection';
import { ThemeToggle } from './components/ThemeToggle';
import { Field, Notice, Select, TextInput } from './components/ui';
import { useBenchmarkRun } from './hooks/useBenchmarkRun';
import { api, ApiRequestError } from './lib/api';
import { parseBooksCsv, type ParsedDataset } from './lib/csv';
import { buildExport, buildJevReport, buildLlmReport, computeComparison, downloadJson } from './lib/export';
import { useTheme } from './lib/theme';

export default function App() {
  const theme = useTheme();
  const [dataset, setDataset] = useState<ParsedDataset | null>(null);
  const [parsing, setParsing] = useState(false);
  const [datasetError, setDatasetError] = useState<string | null>(null);
  const [bookLimit, setBookLimit] = useState<number>(DEFAULT_BOOK_LIMIT);
  const [categories, setCategories] = useState<string[]>([...DEFAULT_CATEGORIES]);

  const [jevToken, setJevToken] = useState('');

  const [providers, setProviders] = useState<LlmProviderInfo[] | null>(null);
  const [providersError, setProvidersError] = useState<string | null>(null);
  const [providerId, setProviderId] = useState('openai');
  const [llmModel, setLlmModel] = useState('gpt-5-mini');
  const [llmApiKey, setLlmApiKey] = useState('');
  const [llmBaseUrl, setLlmBaseUrl] = useState('');

  const jevRun = useBenchmarkRun();
  const llmRun = useBenchmarkRun();

  useEffect(() => {
    let cancelled = false;
    api
      .listProviders()
      .then((list) => {
        if (cancelled) return;
        setProviders(list);
        setProvidersError(null);
        const first = list.find((provider) => provider.id === 'openai') ?? list[0];
        if (first) {
          setProviderId(first.id);
          setLlmModel(first.defaultModel);
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setProvidersError(
          error instanceof ApiRequestError
            ? error.message
            : 'Could not load the list of LLM providers.',
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedBooks = useMemo(
    () => (dataset ? dataset.books.slice(0, bookLimit) : []),
    [dataset, bookLimit],
  );
  const batchCount = countBatches(selectedBooks.length);

  // Editing the dataset or the categories invalidates previous results.
  const categoriesKey = categories.join('\u0000');
  const anyRunning = jevRun.status === 'running' || llmRun.status === 'running';
  useEffect(() => {
    if (anyRunning) return;
    jevRun.reset();
    llmRun.reset();
    // Intentionally keyed on the inputs, not on the run objects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset, bookLimit, categoriesKey]);

  const handleFile = useCallback((file: File) => {
    setParsing(true);
    setDatasetError(null);
    parseBooksCsv(file)
      .then((parsed) => {
        setDataset(parsed);
        setBookLimit((current) =>
          current > 0 && current <= parsed.books.length ? current : Math.min(DEFAULT_BOOK_LIMIT, parsed.books.length),
        );
      })
      .catch((error: unknown) => {
        setDataset(null);
        setDatasetError(error instanceof Error ? error.message : 'Could not read the CSV file.');
      })
      .finally(() => setParsing(false));
  }, []);

  const handleBookLimitChange = useCallback(
    (value: number) => {
      if (!dataset) return;
      if (!Number.isFinite(value)) return;
      setBookLimit(Math.min(Math.max(1, Math.trunc(value)), dataset.books.length));
    },
    [dataset],
  );

  const handleProviderChange = useCallback(
    (nextId: string) => {
      setProviderId(nextId);
      const provider = providers?.find((entry) => entry.id === nextId);
      setLlmModel(provider?.defaultModel ?? '');
      if (!provider?.requiresBaseUrl) setLlmBaseUrl('');
    },
    [providers],
  );

  const activeProvider = providers?.find((provider) => provider.id === providerId) ?? null;

  /* Run gating ------------------------------------------------------------ */

  const baseBlockedReason = useMemo(() => {
    if (!dataset) return 'Upload a CSV to get started.';
    if (selectedBooks.length === 0) return 'Select at least one book.';
    if (categories.length < 2) return 'Add at least two categories.';
    if (categories.length > MAX_CATEGORIES) return `JEV supports at most ${MAX_CATEGORIES} categories.`;
    return null;
  }, [dataset, selectedBooks.length, categories.length]);

  const jevBlockedReason =
    baseBlockedReason ?? (jevToken.trim() === '' ? 'Enter your JEV API token.' : null);
  const llmBlockedReason =
    baseBlockedReason ??
    (providersError ? providersError : null) ??
    (llmApiKey.trim() === '' ? 'Enter an API key for the provider.' : null) ??
    (llmModel.trim() === '' ? 'Enter a model name.' : null) ??
    (activeProvider?.requiresBaseUrl && llmBaseUrl.trim() === '' ? 'Enter the provider base URL.' : null);

  const runJev = useCallback(() => {
    jevRun.run({
      books: selectedBooks,
      categories: [...categories],
      credentials: { system: 'jev', jev: { token: jevToken.trim() } },
    });
  }, [jevRun, selectedBooks, categories, jevToken]);

  const runLlm = useCallback(() => {
    llmRun.run({
      books: selectedBooks,
      categories: [...categories],
      credentials: {
        system: 'llm',
        llm: {
          providerId,
          model: llmModel.trim(),
          apiKey: llmApiKey.trim(),
          ...(llmBaseUrl.trim() ? { baseUrl: llmBaseUrl.trim() } : {}),
        },
      },
    });
  }, [llmRun, selectedBooks, categories, providerId, llmModel, llmApiKey, llmBaseUrl]);

  /* Results --------------------------------------------------------------- */

  const hasJevRun = jevRun.attempts.length > 0;
  const hasLlmRun = llmRun.attempts.length > 0;

  const comparison = useMemo(
    () =>
      computeComparison(
        hasJevRun ? jevRun.results : null,
        hasLlmRun ? llmRun.results : null,
      ),
    [hasJevRun, hasLlmRun, jevRun.results, llmRun.results],
  );

  const handleDownload = useCallback(() => {
    const document = buildExport({
      datasetName: dataset?.name ?? 'unknown.csv',
      totalBooks: selectedBooks.length,
      categories,
      jev: hasJevRun
        ? buildJevReport(
            { attempts: jevRun.attempts, metrics: jevRun.metrics, results: jevRun.results },
            jevRun.model ?? 'unknown',
          )
        : null,
      llm: hasLlmRun
        ? buildLlmReport(
            { attempts: llmRun.attempts, metrics: llmRun.metrics, results: llmRun.results },
            providerId,
            llmRun.model ?? llmModel,
          )
        : null,
    });
    downloadJson(`book-benchmark-${new Date().toISOString().replace(/[:.]/g, '-')}.json`, document);
  }, [
    dataset,
    selectedBooks.length,
    categories,
    hasJevRun,
    hasLlmRun,
    jevRun.attempts,
    jevRun.metrics,
    jevRun.results,
    jevRun.model,
    llmRun.attempts,
    llmRun.metrics,
    llmRun.results,
    llmRun.model,
    activeProvider,
    providerId,
    llmModel,
  ]);

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Book Classification Benchmark
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {BATCH_SIZE} books per request, same batches in the same order for both systems. Keys are
              sent to the API only and never stored.
            </p>
          </div>
          <ThemeToggle preference={theme.preference} onChange={theme.setPreference} />
        </header>

        <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <DatasetSection
            dataset={dataset}
            parsing={parsing}
            error={datasetError}
            bookLimit={bookLimit}
            onBookLimitChange={handleBookLimitChange}
            onFileSelected={handleFile}
            booksUsed={selectedBooks.length}
            batchCount={batchCount}
            disabled={anyRunning}
          />

          <CategoriesSection categories={categories} onChange={setCategories} disabled={anyRunning} />

          <ClassifierPanel
            title="JEV"
            description="TypeSafe System One, using the real JEV API — nothing is simulated."
            runLabel="Run JEV"
            onRun={runJev}
            canRun={jevBlockedReason === null}
            blockedReason={jevBlockedReason}
            runState={jevRun}
          >
            <div className="max-w-md">
              <Field
                label="API Token"
                htmlFor="jev-token"
                hint="Sent to the backend for this session only. Never stored in the browser or in the export."
              >
                <TextInput
                  id="jev-token"
                  type="password"
                  value={jevToken}
                  onChange={setJevToken}
                  placeholder="jev_…"
                  autoComplete="off"
                />
              </Field>
            </div>
          </ClassifierPanel>

          <ClassifierPanel
            title="LLM Competition"
            description="OpenAI-compatible chat completions. Same batches, same ids, same categories as JEV."
            runLabel="Run LLM"
            onRun={runLlm}
            canRun={llmBlockedReason === null}
            blockedReason={llmBlockedReason}
            runState={llmRun}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Provider" htmlFor="llm-provider">
                <Select
                  id="llm-provider"
                  value={providerId}
                  onChange={handleProviderChange}
                  disabled={providers === null}
                  options={
                    providers?.map((provider) => ({ value: provider.id, label: provider.label })) ?? [
                      { value: providerId, label: 'Loading…' },
                    ]
                  }
                />
              </Field>

              <Field label="Model" htmlFor="llm-model">
                <TextInput
                  id="llm-model"
                  value={llmModel}
                  onChange={setLlmModel}
                  placeholder="gpt-5-mini"
                  mono
                />
              </Field>

              {activeProvider?.requiresBaseUrl ? (
                <Field
                  label="Base URL"
                  htmlFor="llm-base-url"
                  hint="OpenAI-compatible base URL, e.g. http://localhost:11434/v1"
                >
                  <TextInput
                    id="llm-base-url"
                    value={llmBaseUrl}
                    onChange={setLlmBaseUrl}
                    placeholder="https://…/v1"
                    mono
                  />
                </Field>
              ) : null}

              <Field
                label="API Key"
                htmlFor="llm-api-key"
                hint="Sent to the backend for this session only. Never stored in the browser or in the export."
              >
                <TextInput
                  id="llm-api-key"
                  type="password"
                  value={llmApiKey}
                  onChange={setLlmApiKey}
                  placeholder="sk-…"
                />
              </Field>
            </div>

            {providersError ? (
              <Notice tone="error">
                {providersError} Make sure the API server is running, then reload the page.
              </Notice>
            ) : null}
          </ClassifierPanel>

          <ResultsSection
            jev={{ metrics: jevRun.metrics, hasRun: hasJevRun, subtitle: jevRun.model ?? 'System One' }}
            llm={{
              metrics: llmRun.metrics,
              hasRun: hasLlmRun,
              subtitle: hasLlmRun
                ? `${activeProvider?.label ?? providerId} · ${llmRun.model ?? llmModel}`
                : 'not run',
            }}
            comparison={comparison}
            onDownload={handleDownload}
            canDownload={hasJevRun || hasLlmRun}
          />
        </div>

        <footer className="mt-6 text-xs text-slate-500 dark:text-slate-400">
          Timing is wall-clock, measured with{' '}
          <code className="font-mono text-slate-600 dark:text-slate-300">performance.now()</code>. Failed
          batches keep the time they spent and are never counted as successes.
        </footer>
      </div>
    </div>
  );
}
