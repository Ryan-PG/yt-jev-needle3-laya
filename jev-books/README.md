# Book Classification Benchmark

A small web app that benchmarks **JEV** (TypeSafe System One) against an **LLM** on the
same book-classification task: same books, same batches, same order, real timings.

- **Client** — React + Vite + TypeScript + Tailwind
- **Server** — Express + TypeScript (credentials held in memory only)
- No database, no auth, no Docker, no state-management library.

## Requirements

- Node.js 18+ (developed on Node 22)
- A JEV API token from [TypeSafe](https://docs.typesafe.ai/api)
- An API key for an OpenAI-compatible LLM provider

## Setup

```bash
npm install
cp .env.example .env    # optional: every value has a working default
npm run dev
```

`npm run dev` starts both processes from the repository root:

| Process | URL |
| --- | --- |
| Express API | http://localhost:8787 |
| React client | http://localhost:5173 |

The client proxies `/api` to the API, so there is nothing to configure between them.
Other scripts: `npm run build` (builds the client, typechecks the server),
`npm start` (runs the API alone), `npm run typecheck`.

## Usage

1. **Upload** `books_train.csv`. Only the `title` and `description` columns are read —
   every other column is ignored. Books keep their file order.
2. **Choose how many books** to use. Default **1000**, taken from the top of the file.
3. **Edit the categories.** Nine defaults are provided (`Fiction`, `Mystery`, `Romance`,
   `Fantasy`, `Science Fiction`, `Biography`, `History`, `Business`, `Philosophy`).
   At least 2 are required, and at most **255** — the documented ceiling for JEV's
   Choice primitive. The limit is enforced in the UI *and* on the server, so an
   unsupported number of options is never silently sent.
4. **Run JEV** with your JEV API token.
5. **Run the LLM** with a provider, model and API key
   (OpenAI, OpenRouter, Groq, Together AI, or any custom OpenAI-compatible base URL).
6. **Compare** the results and **Download JSON**.

Both systems can run in either order; the comparison appears once both have run.

## Theme

A **Light / Dark / System** switch sits in the header. `System` (the default) follows
`prefers-color-scheme` and keeps following it while the page is open. The choice is applied
by a small inline script in `client/index.html` before the first paint, so a dark-preference
visitor never sees a white flash, and is rendered with Tailwind's `dark:` variants
(`darkMode: 'class'`). The preference is remembered in `localStorage` under
`book-benchmark-theme` — that key and nothing else is ever written to browser storage.

## How batching works

This is the core of the benchmark, and it is deliberate:

- Books are split into batches of **exactly 100** (`BATCH_SIZE` in `shared/constants.ts`).
  1000 books become exactly 10 batches: 1–100, 101–200, … 901–1000.
- The dataset is **never shuffled** and **never independently sampled** per system. Both
  classifiers receive the same book objects, in the same order, in the same batches.
- Batches are sent **sequentially**, one request per batch — never 1000 books in one
  request, never one book per request.
- Every book gets a stable id (its 1-based position), which is what identifies it in
  both directions of the wire format.
- A shorter final batch only happens when the book count is not a multiple of 100.

## JEV integration

`server/services/jev.ts` holds every JEV-specific detail. It follows the official
reference at <https://docs.typesafe.ai/api>:

```
POST {JEV_BASE_URL}/systemone          # default https://api.typesafe.ai/v1/systemone
Authorization: Bearer <JEV token>
Content-Type: application/json
```

Each batch becomes **one request** containing **one `choice` question per book**:

```json
{
  "model": "jev-latest",
  "state": "Benchmark batch 1 of 10: 100 books to classify. …",
  "questions": {
    "book_1": {
      "type": "choice",
      "instructions": {
        "task": "Classify the book in `book` into exactly one of the categories offered as options. …",
        "book": { "id": "1", "title": "…", "description": "…" }
      },
      "criteria": { "Fiction": null, "Mystery": null, "Fantasy": null }
    }
  }
}
```

- `criteria` keys are the available categories; null means "no extra rubric detail".
- The per-book answer is read from `answers["book_<id>"].choice`.
- No JEV response is simulated anywhere: without a valid token the batches fail and say so.

If the API changes or your account pins a different model, adjust `JEV_BASE_URL` /
`JEV_MODEL` in `.env`; the request builder is isolated in `buildJevRequestBody`.

## LLM competition

`server/services/llm.ts` drives an OpenAI-compatible `POST {baseUrl}/chat/completions`
call with the same 100 books, ids, titles, descriptions, categories and batch order as
JEV. The response is required to be JSON (`{"classifications":[{"bookId","category"}]}`)
and is parsed tolerantly (bare arrays, `results` instead of `classifications`, and
fenced ```json blocks all work).

Adding a provider is one entry in the `LLM_PROVIDERS` registry — base URL, default model,
suggested models, and whether it accepts JSON mode. The UI dropdown and the server both
read from that registry.

## Validation

Both classifiers are held to **identical rules** (`server/src/services/validation.ts`):

1. every input book received exactly one classification
2. every returned book id exists in the batch
3. every category belongs to the configured categories
4. there are no duplicate classifications for the same book

Category labels are matched ignoring case and surrounding whitespace and are normalized
to the configured spelling; a label matching no configured category fails the batch.
**If validation fails, the batch is marked failed** (HTTP 422 with per-book reasons) and
is never turned into partly-wrong data.

## Timing

Wall-clock time only, measured with `performance.now()`:

- **Total time** — accumulated over each batch, from the moment its request was sent until
  it settled. With no reruns this is the wall clock from the first request to the last
  batch finishing.
- **Per batch** — `batchNumber`, `startedAt`, `finishedAt`, `durationMs` (offsets relative
  to the start of the run).
- **Average batch time** — `totalTime / numberOfSuccessfulBatches`.
- **Throughput** — `successfulBooks / (totalTimeMs / 1000)`.

Failures count honestly: a failed batch keeps the wall-clock time it burned and its books
are reported as failed, never as successes.

## Results and agreement

There is **no ground truth** in this dataset, so nothing is called accuracy. The dashboard
compares total time, average batch time, throughput, successful/failed classifications,
and:

```
agreementRate = books where JEV category == LLM category
                ────────────────────────────────────────
                books successfully classified by both
```

shown as **JEV / LLM Agreement**.

## JSON export

`Download JSON` writes the complete benchmark: dataset info, categories, a full report per
system (timings, per-batch timings, failures, and every book with its classification), and
the comparison. **No API keys or tokens are included** — the export builder never sees them.

## Error handling

- A failed batch is shown as failed, with its error, in that system's panel.
- Remaining batches continue, and successful earlier batches are kept.
- Nothing is fabricated to fill a gap.
- **Rerun failed (n)** retries only the failed batches against the same session, leaving
  successful batches untouched.
- `401/403` from a provider is reported as a rejected credential; `429` as rate limiting;
  timeouts and upstream failures as such. Upstream error text is surfaced, but request
  headers and bodies are never logged and credentials are never echoed back.

## Security

- API keys and tokens are entered in the UI and sent to the API **once**, when a session is
  created. They are held in an in-memory `Map` on the server for that benchmark session
  (TTL 30 minutes by default) and dropped when the session is cleared, the page unloads,
  or the TTL expires.
- Nothing is written to `localStorage`, `sessionStorage`, a database, or the exported JSON.
  The one exception is the theme preference (`book-benchmark-theme`), which holds a string
  like `dark` and never any credential.
- No endpoint returns a credential, and no credential is ever logged.
- `.env` holds server configuration only — never keys.

## Project structure

```
.
├── client/                     # React dashboard
│   ├── src/App.tsx             # one-page dashboard
│   ├── src/components/         # dataset, categories, classifier panels, results, theme toggle
│   ├── src/hooks/useBenchmarkRun.ts   # batching, sequencing, timing, retries
│   └── src/lib/                # csv parsing, api client, metrics, export, theme
├── server/
│   └── src/
│       ├── app.ts              # routes + request validation
│       ├── config.ts           # env config (no keys)
│       └── services/
│           ├── jev.ts          # all JEV API logic
│           ├── llm.ts          # provider registry + OpenAI-compatible calls
│           ├── session.ts      # in-memory credentials
│           └── validation.ts   # shared validation rules
├── shared/                     # types, constants and batching used by both sides
├── .env.example
└── README.md
```

## Notes and limitations

- The JEV docs do not publish a per-request question cap, so one request carries one
  question per book (100). If the API ever rejects that, the batch fails visibly with the
  API's message rather than producing wrong data; `buildJevRequestBody` is the one place
  that would need to change.
- Timing includes network round-trips, which is what end-to-end wall-clock benchmarking
  should measure, but it does mean run-to-run variance from your connection.
- Requests carry whole descriptions, so a 1000-book run sends roughly the size of the
  dataset once per system.
