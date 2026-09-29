# 🗓️ RAG Layer — 4-Week Practical Transition Plan

> **Companion to**: `RAG_ARCHITECTURE_AND_MIGRATION.md`
> **Goal**: Turn the 8-phase migration plan into something buildable in 4 weeks, where each week teaches and ships exactly one new piece of technology against the real SwiftIQ schema — not a toy demo.
> **Ground rule**: nothing in this plan touches Scraper/Classifier/Summarizer output correctness. It's all additive until Week 3, Day 16.

**Mapping to the original 8 phases**: Week 1 = Phase 1. Week 2 = Phase 2. Week 3 = Phase 3 + first half of Phase 4. Week 4 = rest of Phase 4 + Phase 5. Phases 6–8 (story threading, full LangGraph ingestion rewrite, scale hardening) are intentionally **not** in this 4 weeks — see "After Week 4" at the bottom. This matches the source doc's own advice: 1→2→3→4 first because that's what makes a demoable assistant.

---

## Week 1 — Postgres `pgvector` + Embeddings (no LangChain, no LangGraph yet)

**Single tech focus**: `pgvector` extension + `@xenova/transformers` (in-process HF embeddings). Nothing else new this week — resist the urge to install LangChain early, you don't need it yet.

| Day | Task | Deliverable |
|---|---|---|
| 1 | Enable `pgvector` on Supabase Postgres (`CREATE EXTENSION vector`). Read pgvector README (distance ops: `<=>` cosine, `<->` L2). Add `ArticleChunk` model to `prisma/schema.prisma` exactly as in the RAG doc §3.1, run `npx prisma db push`. | Migration applied; `ArticleChunk` table exists, empty. |
| 2 | Manually insert 2-3 fake rows with a hardcoded `vector(384)` literal via raw SQL (`$queryRaw`). Practice a cosine-distance `ORDER BY embedding <=> $1 LIMIT 5` query directly in `prisma studio` / psql so you understand the primitive before wrapping it in code. | You can explain what `<=>` returns and why lower = more similar. |
| 3 | `npm install @xenova/transformers`. Write a standalone script `scripts/embed-test.mjs` that loads `Xenova/all-MiniLM-L6-v2`, embeds 3 sample strings, prints vector length (should be 384) and cosine similarity between two related vs one unrelated string. | Confirms model loads locally, no Python needed, dims match schema. |
| 4 | Build **Chunking Agent** (`src/lib/agents/chunker.js`): for each `Article` with a `summary_detailed`, split into 300–500 token chunks (use `RecursiveCharacterTextSplitter` — this one import from `langchain/text_splitter` is fine to bring in early, it's a utility not the framework migration). `summary_brief`/`summary_medium` become single chunks each. Write rows into `ArticleChunk` with `chunkIndex`, `tokenCount`, `sourceTier`, leave `embedding` null for now. | Chunker runs over existing articles, populates rows without embeddings. |
| 5 | Build **Embedding Agent** (`src/lib/agents/embedder.js`): batch-fetch chunks missing embeddings (32–64 per batch), embed via the Week-1-Day-3 script's approach, `UPDATE ArticleChunk SET embedding = ...` via raw SQL (Prisma doesn't natively type `vector`, so this stays raw). Wire it behind `/api/cron/embed`. | Running `/api/cron/embed` on ~50–100 real articles fully populates `ArticleChunk.embedding`. |
| 6–7 | Validation day: write `scripts/test-vector-query.mjs` — embed a hand-typed query string, run the cosine query from Day 2 against real data, eyeball whether top-5 results are topically relevant. Fix chunking/embedding bugs found here. | You trust the embeddings before building retrieval logic on top of them next week. |

**Week 1 exit criteria**: real articles chunked and embedded end-to-end; you can run a raw SQL vector query and get sensible results by hand.

---

## Week 2 — Retrieval: HNSW Index + Hybrid Search (still no LangChain/LangGraph)

**Single tech focus**: Postgres `HNSW` indexing + `tsvector` full-text search + Reciprocal Rank Fusion. This is pure Postgres/algorithm work — the highest-leverage week for understanding *why* RAG scales or doesn't.

| Day | Task | Deliverable |
|---|---|---|
| 8 | Read why HNSW beats IVFFlat for continuously-ingesting data (RAG doc §3.3). Create the index (`CREATE INDEX ... USING hnsw ...`). Time a query before/after the index exists (`EXPLAIN ANALYZE`) at your current row count — note it won't show much until you have thousands of rows, but learn to read the query plan now. | Index exists; you can read an `EXPLAIN ANALYZE` output and identify whether it used the index scan. |
| 9 | Write `src/lib/rag/retrieve-dense.js`: given a query string, embed it, run top-k=25 cosine search. Pure function, no framework. | Callable function returning `[{articleId, chunkId, content, score}]`. |
| 10 | Add a `tsvector` generated column on `ArticleChunk.content` (or a functional index `to_tsvector('english', content)`). Write `src/lib/rag/retrieve-sparse.js` using `plainto_tsquery` + `ts_rank`, top-k=25. | Sparse retrieval function returns keyword-matched chunks (test with an entity name like a company ticker that dense search might miss). |
| 11 | Implement Reciprocal Rank Fusion by hand (RAG doc §3.4) — it's ~15 lines, no library needed: merge the two ranked lists by `1/(k+rank)`. Write `src/lib/rag/fuse.js`. | Given dense + sparse result lists, returns one fused ranked list. |
| 12 | Cross-encoder reranking: load `Xenova/ms-marco-MiniLM-L-6-v2` (or equivalent transformers.js-compatible cross-encoder) via `@xenova/transformers`. Write `src/lib/rag/rerank.js`: score (query, chunk) pairs from the fused top-25, return top 5–8. | Reranker measurably reorders results — verify with a query where the naive top-1 isn't actually the best answer. |
| 13–14 | Build `scripts/test-retrieval.mjs`: end-to-end CLI — type a query, see dense results, sparse results, fused results, reranked final 5–8, side by side. Run 5–10 real questions against your actual article corpus and judge quality. | A CLI tool you (or a demo) can run to prove retrieval quality without any UI yet. |

**Week 2 exit criteria**: a CLI-testable hybrid retriever that returns good top-5 chunks for real questions, entirely in raw Postgres + transformers.js, no LangChain.

---

## Week 3 — LangChain: Structured Output + Generation Chain

**Single tech focus**: LangChain. This is the first week you touch the framework, and only after you already understand what it's abstracting (Weeks 1–2 were deliberately framework-free so LangChain doesn't feel like magic).

| Day | Task | Deliverable |
|---|---|---|
| 15 | `npm install langchain @langchain/core @langchain/google-genai`. Learn 3 concepts only: `PromptTemplate`, `Runnable`/LCEL piping (`.pipe()`), and structured output via `.withStructuredOutput(zodSchema)`. Do this in a throwaway script first, not in the real agents. | You can write a 5-line LCEL chain that takes text in, returns typed JSON out. |
| 16 | Refactor **Classifier Agent** only: replace the raw `@google/generative-ai` call with a LangChain chain + Zod schema for `{domain, subTopics, sentiment, keywords}`. Keep the DB write logic untouched. A/B the output against the last 10 runs of the old classifier on the same articles to confirm parity. | Classifier still produces identical shape of data, now via LangChain — safe, reversible refactor. |
| 17 | Same refactor for **Summarizer Agent** (3-tier summary + key points as one structured call). A/B check again. | Summarizer refactored, output parity confirmed. |
| 18 | Build the **generation chain** (RAG doc §3.5): strict prompt template — answer only from provided chunks, cite `article_id` inline, explicitly instructed to say "not enough recent coverage" instead of hallucinating. Use `@langchain/google-genai` `ChatGoogleGenerativeAI` as the model. | A chain that takes `{query, chunks[]}` → cited answer string. |
| 19 | Wire Week 2's retrieval pipeline (dense→sparse→RRF→rerank) as the input to Day 18's generation chain — one function `src/lib/rag/answer.js`. Test with the same 5–10 questions from Week 2 Day 13, now checking answer quality + correct citations, not just retrieval quality. | End-to-end retrieve→generate function callable from a script. |
| 20–21 | Expose as `POST /api/rag/query` (non-streaming — RAG doc §6, Phase 4 first half). Test via curl/Postman/Thunder Client with real questions. No UI yet. | A working, testable REST endpoint: send a question, get a cited answer back as JSON. |

**Week 3 exit criteria**: `/api/rag/query` answers real questions about your corpus with inline citations, backed by LangChain-structured Classifier/Summarizer and a hybrid-retrieval-grounded generation chain.

---

## Week 4 — LangGraph: Agentic Loop + Conversational Streaming

**Single tech focus**: LangGraph (`StateGraph`, cycles, checkpointing) + Vercel AI SDK streaming. This is where "chain" becomes "agent" — the one genuinely new mental model of the month: a graph with conditional edges and a loop, not a pipeline.

| Day | Task | Deliverable |
|---|---|---|
| 22 | `npm install @langchain/langgraph @langchain/langgraph-checkpoint-postgres`. Learn `StateGraph` basics with a trivial 2-node example first (node → node, no cycle) before touching the real graph. | You understand nodes, edges, and state annotation in isolation. |
| 23 | Build the query-time graph from RAG doc §4.2 **without the cycle first**: `classify (needs decomposition?) → retrieve → rerank → generate`, wrapping Week 3's functions as graph nodes. Linear graph, still just LangGraph plumbing. | Graph runs and produces the same answers as the plain function did. |
| 24 | Add the actual agentic loop: `grade` node (enough evidence?) → conditional edge to `rewrite query → retrieve` (Corrective RAG) or `generate` → `critique` node (self-check: grounded?) → conditional edge to `regenerate` or `return`. This is the part LangChain-alone can't express cleanly. | Graph now retries/rewrites on a deliberately vague or off-corpus test question instead of just returning a weak answer. |
| 25 | Add `Conversation`/`Message` Prisma models (RAG doc §4.2). Wire the Postgres-backed LangGraph checkpointer to your existing `DATABASE_URL` (no new infra) so multi-turn state persists across requests. | A second request referencing "it" from a prior message resolves correctly. |
| 26 | `npm install ai` (Vercel AI SDK). Learn `streamText`/`toDataStreamResponse` basics, confirm it's LCEL/LangGraph-stream-compatible. Expose `POST /api/rag/stream`. | Streaming endpoint verified via curl (`--no-buffer`) showing token-by-token output. |
| 27–28 | Build `/dashboard/ask` — minimal chat UI (reuse existing Cyber-Dark components/Tailwind classes), wired to `/api/rag/stream`, rendering citations as clickable article links. Manually test a full multi-turn conversation end to end in the browser. | A working "Ask SwiftIQ" chat page in the actual dashboard, streaming, citing, remembering context. |

**Week 4 exit criteria**: a demoable conversational RAG assistant in the real dashboard — the capstone-shippable state the source doc calls "Phases 1→4."

---

## After Week 4 (not in this plan — sequence for later)

The source doc's Phases 6–8 are deliberately excluded from these 4 weeks because each is its own tech focus and would dilute the month:

- **Story Threading** (Phase 6) — new tech: similarity-based clustering logic + `StoryThread`/`ThreadArticle` tables + `/dashboard/threads` timeline UI. Natural "Week 5."
- **Ingestion Graph Migration** (Phase 7) — rebuild the existing Scrape→...→Dispatch cron chain as a single LangGraph `StateGraph` with checkpointed retries. Do this *last* and only once Weeks 1–4 are stable — it's the most disruptive change since it touches orchestration of code that already works.
- **Scale Hardening** (Phase 8) — time-partitioned `article_chunks`, `ef_search`/`ef_construction` tuning, Redis caching (RAG doc §5), LangSmith tracing. This is also where it converges with the *already-planned* Phase 5 in `sprint-roadmap.md` (Docker/BullMQ/CI-CD/Prometheus) — worth doing both together since they're both "operate this at scale" work.

## Weekly tech-isolation summary

| Week | New tech introduced | Explicitly NOT touched |
|---|---|---|
| 1 | pgvector, `@xenova/transformers` | LangChain, LangGraph, hybrid search, reranking |
| 2 | HNSW indexing, Postgres full-text search, RRF | LangChain, LangGraph |
| 3 | LangChain (LCEL, structured output, chains) | LangGraph, streaming, UI |
| 4 | LangGraph (`StateGraph`, cycles, checkpointer), Vercel AI SDK streaming | New retrieval/generation logic — reuses Week 2–3 as-is |
