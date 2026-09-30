# yt-jev-needle3-laya

[![Watch the video](assets/thumbnail.png)](https://www.youtube.com/watch?v=VIDEO_ID)

**📺 This repo is the companion code for a YouTube video.** Every folder below is something we
build on screen — watch it first, then clone this repo and follow along.

▶️ **[Watch on YouTube](https://www.youtube.com/watch?v=VIDEO_ID)**

---

Companion code for a video series exploring three small, fast decision systems:

| System | What it is | Where it runs |
| --- | --- | --- |
| **JEV** (TypeSafe System One) | Hosted decision API — `choice`, `score`, `noul` questions over a JSON state | Cloud |
| **Needle 3** (Cactus) | Local tool-calling agent run from Python | Your machine |
| **Laya** | Local routing/classification runtime — picks a checkpoint and answers typed questions | Your machine (GPU optional) |

The repo is a set of five self-contained demos and benchmarks. Each directory stands on its
own — nothing here imports anything else, so you can copy out a single folder and use it.

## Projects

| Directory | Stack | What it does |
| --- | --- | --- |
| [`jev-books/`](jev-books/) | React + Vite + TypeScript, Express | Web app that benchmarks **JEV vs an LLM** on book classification, same books and same batches for both |
| [`jev-laya-books-benchmark/`](jev-laya-books-benchmark/) | Jupyter/Colab notebook | Benchmarks **Laya vs JEV** on book classification — latency, throughput, agreement, charts |
| [`jev-automode/`](jev-automode/) | LangChain + `langchain-typesafe` | Agent with **AutoModeMiddleware**: a criteria decides which tool calls are auto-approved and which are blocked |
| [`cactus-needle/`](cactus-needle/) | Python + `cactus-needle` | Three **Needle 3** agents: a 3-tool intro, a 100-tool terminal agent, and a Persian mobile-assistant simulator |
| [`laya/`](laya/) | Jupyter notebook | **Laya** quickstart: one `Router`, mixed question types, automatic language routing |

## Requirements at a glance

- **Python** 3.11+ for `cactus-needle/`, `jev-automode/`, and the notebooks
- **Node.js** 18+ (developed on 22) for `jev-books/`
- A **TypeSafe API token** ([docs.typesafe.ai/api](https://docs.typesafe.ai/api)) for anything that calls JEV
- An **OpenAI-compatible API key** for `jev-automode/` and the LLM side of `jev-books/`
- A **GPU** is optional everywhere; Laya falls back to CPU

---

## jev-books — JEV vs LLM benchmark (web app)

A one-page dashboard: upload `books_train.csv`, pick how many books, edit the categories, then
run JEV and an LLM over identical batches and compare.

```bash
cd jev-books
npm install
cp .env.example .env    # optional — every value has a working default
npm run dev
```

| Process | URL |
| --- | --- |
| Express API | http://localhost:8787 |
| React client (proxies `/api`) | http://localhost:5173 |

Books are split into batches of **exactly 100**, never shuffled, and both classifiers receive the
same books in the same order. The dataset has no ground truth, so the comparison is reported as
**JEV / LLM agreement rate** rather than accuracy. API keys are entered in the UI, sent once, and
held in server memory only (30-minute TTL) — never written to disk or to the JSON export.

Other scripts: `npm run build`, `npm start` (API only), `npm run typecheck`.

→ Full details, wire formats, validation and timing rules: [`jev-books/README.md`](jev-books/README.md)

## jev-laya-books-benchmark — Laya vs JEV (notebook)

Open `Laya_vs_JEV_Book_Classification_Benchmark.ipynb` in Colab (or Jupyter). It uploads a
`books.json`, classifies up to 1000 books in batches of 100 with both systems, and reports
median/P95/P99 latency, throughput, error rates, per-batch throughput, and the agreement rate
between the two. Requires `JEV_API_KEY` — in Colab, add it under **Secrets** and enable notebook
access. Only `title` and `description` are sent to the classifiers.

## jev-automode — criteria-gated tool calls

A LangChain agent whose destructive tools are gated by a TypeSafe `NoulCriteria` instead of a
human approval prompt:

```python
AutoModeMiddleware(
    tools=["send_email", "shutdown_server"],
    criteria=NoulCriteria(true=..., false=...),  # true = has an external side effect
)
```

```bash
cd jev-automode
pip install -r requirements.txt
cp .env.example .env    # fill in AGENT_* and JEV_*
python main.py
```

Type a prompt at the `>` prompt; `exit` or `quit` to stop. Only the tools listed in the middleware
are gated — `get_weather` runs unchecked. This uses the `experimental` namespace of
`langchain-typesafe`, so the API may move.

## cactus-needle — Needle 3 agents

```bash
cd cactus-needle
pip install -r requirements.txt
python main.py       # 3 tools, one fixed prompt (weather in Tehran)
python 200main.py    # 100 tools, interactive terminal menu
python assistant.py  # ~120 tools, Persian mobile voice assistant, interactive
```

- `main.py` — smallest possible example: three `@needle.tool` functions and one `agent.run(...)`.
- `200main.py` — 100 tools across ten domains (smart home, weather, comms, finance, calendar,
  health, media, travel, shopping, system), with a menu to run six default tasks or a custom one.
- `assistant.py` — the largest set, given a Persian/`fa-IR`/Android `system` prompt and a
  persistent `tool_index_path`. Prints reasoning, confidence, function calls, suppressed calls and
  prefill/decode tokens per second.

All tools are **stubs** returning canned dictionaries — they print what they were called with and
return a plausible result, so nothing touches a real device or account. `result.json` is a
captured sample response.

## laya — quickstart notebook

`laya.ipynb` installs `laya`, creates a preloaded `Router`, and sends one state through four
question types at once:

- `choice` — pick one of several categorised options (`department`)
- `score` — pick a point on an ordered scale (`urgency`)
- `noul` — a yes/no judgement (`churn_risk`, `refund_requested`)

It shows automatic routing (English → ModernBERT, Hindi → multilingual mmBERT) and an explicit
`model="typed-decisions"` override, with the wall-clock time printed for each. A GPU is used when
available.

---

## Notes

- Every project keeps its own dependencies; there is no root-level package manager or virtualenv.
- Nothing in the repo contains or reads a credential from a committed file — the `.env.example`
  files are templates and real `.env` files are gitignored.
- The benchmarks measure **wall-clock** time end to end, network round-trips included, so
  run-to-run variance from your connection is expected and real.
