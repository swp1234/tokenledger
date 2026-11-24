# TokenLedger — Precision AI & LLM API FinOps Studio

> **100% browser-private** AI & LLM API cost calculator, multi-turn agent burn simulator, AI SaaS gross margin calculator, RAG TCO planner, and open JSON pricing feed across **24 flagship models**.

Live app: **[https://tokenledger-8x7.pages.dev](https://tokenledger-8x7.pages.dev)**  
Public pricing JSON API: **[https://tokenledger-8x7.pages.dev/api/pricing.json](https://tokenledger-8x7.pages.dev/api/pricing.json)**

## Why TokenLedger?

Most LLM calculators are single-prompt toys or upload your prompts to a backend. TokenLedger runs **100% locally in your browser** (zero prompt uploads, zero login walls) and models the real cost drivers that blow up production AI budgets:

1. **24-Model Live API Cost Estimator (`/`)** — Compare OpenAI (GPT-5, GPT-4.1, o3, o4-mini), Anthropic (Claude Opus 4, Sonnet 4, Haiku 3.5), Google (Gemini 2.5 Pro/Flash/Flash-Lite), DeepSeek (V3, R1), xAI (Grok 3), Meta (Llama 4), Mistral, Qwen, and Perplexity with **Prompt Caching (0–95%)**, **50% Batch API**, **Model Cascade 70/30 routing**, shareable scenario URLs, and **CSV / JSON / Print PDF** exports.
2. **AI Agent Loop Burn Calculator (`/tools/agent-budget.html`)** — Models quadratic $O(N^2)$ context accumulation in multi-turn ReAct/tool-calling agents and visualizes **Naive Full History vs. Prefix Prompt Caching vs. Sliding-Window Summarization** turn by turn.
3. **AI SaaS Gross Margin Simulator (`/tools/saas-margin.html`)** — Calculates per-seat LLM COGS, payment processing fees, gross margin %, net profit at scale, and the exact **break-even request cap per subscriber**.
4. **RAG & Vector DB TCO Planner (`/tools/rag-calculator.html`)** — Sizes one-time corpus embedding, monthly re-index churn, HNSW vector RAM footprint, and Top-K synthesis spend.
5. **Context Window & JSON Schema Minifier Inspector (`/tools/token-inspector.html`)** — Estimates OpenAI/Claude/Gemini tokens locally and minifies bloated JSON tool schemas to show immediate annual USD savings.

## Local Development & Verification

```bash
# Regenerate all 19 static pages, sitemap.xml, robots.txt, and llms*.txt from pricing data
node scripts/build-site.js

# Run unit tests + 19-page mobile/desktop Playwright E2E suite
node scripts/verify-tokenledger.js
```

## Public Machine-Readable Pricing Feed

Fetch `https://tokenledger-8x7.pages.dev/api/pricing.json` directly from CI, FinOps scripts, or AI agents (`Access-Control-Allow-Origin: *`).

## License

MIT — built and maintained openly. Pull requests to keep model list rates current are welcome.
