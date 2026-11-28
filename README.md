# TokenLedger v9.0 — Precision AI & LLM API FinOps Studio

> **100% browser-private** AI & LLM FinOps suite with **24 interactive workspaces**, **150 static pages**, **11 international markets**, **5-currency live switcher** (USD/EUR/GBP/JPY/KRW), **Ctrl+K Command Palette**, zero-dep CLI, and an open CORS JSON pricing feed across **44 flagship LLMs**, **5 managed Vector DBs**, **5 Guardrail stacks**, **15 STT/TTS audio engines**, and **16 image/video generation APIs**.

- Live Studio: **[https://tokenledger-8x7.pages.dev](https://tokenledger-8x7.pages.dev)**
- Public Pricing JSON API: **[https://tokenledger-8x7.pages.dev/api/pricing.json](https://tokenledger-8x7.pages.dev/api/pricing.json)**
- Embeddable Widget: `https://tokenledger-8x7.pages.dev/?embed=1`

## Why TokenLedger?

Most LLM calculators only price a single prompt or upload your prompts to a backend. TokenLedger runs **100% locally in your browser** (zero prompt uploads, zero login walls) and models the real architectural cost drivers that blow up production AI budgets:

### 24 Interactive FinOps Workspaces
1. **44-Model Live API Cost Estimator (`/`)** — Compare OpenAI (GPT-5, GPT-5 Pro, GPT-4.1, GPT-4o mini, o3, o3-pro, o4-mini), Anthropic (Claude 4.5 Opus/Sonnet/Haiku, Opus 4, Sonnet 4, 3.7/3.5 Sonnet, Haiku 3.5), Google (Gemini 2.5 Pro Deep Think/Pro/Flash/Flash-Lite, Gemini 2.0 Flash/Lite), DeepSeek (V3.1, V3-0324, V3, R1), Alibaba (Qwen 3 235B MoE, Qwen 2.5), AWS Bedrock (Amazon Nova Pro/Lite), Mistral (Large 2, Medium 3, Small 3.1, Codestral 25.01), Cohere (Command A), xAI (Grok 3), Meta (Llama 4, Llama 3.3 70B), and Perplexity with **Prompt Caching (0–95%)**, **50% Batch API**, **Model Cascade 70/30 routing**, shareable scenario URLs, **PNG Budget Cards**, and **CSV / JSON / Markdown / Print PDF** exports.
2. **AI Agent Loop Burn Calculator (`/tools/agent-budget.html`)** — Models quadratic $O(N^2)$ context accumulation in multi-turn ReAct/tool-calling agents and compares **Naive Full History vs. Prefix Caching vs. Sliding-Window Summarization** turn by turn.
3. **GPU VRAM & KV-Cache Quantization Calculator (`/tools/gpu-vram-calculator.html`)** — Calculates Q4/FP8/FP16 model weights + KV-cache memory across Llama 70B, DeepSeek-R1, Qwen 32B, and Mistral with FP8 KV-cache savings and GPU sizing (4090 / L40S / A100 / H100).
4. **CFO Hybrid Caching + Batch + Cascade Waterfall (`/tools/batch-vs-realtime-router.html`)** — Stacks prompt caching, frontier-to-mini cascade routing, and 50%-off async batch tiers into an executive annual savings waterfall.
5. **AI SaaS Gross Margin Simulator (`/tools/saas-margin.html`)** — Models per-seat LLM COGS, payment fees, gross margin %, net profit at scale, and the exact **break-even request cap per subscriber**.
6. **RAG & Vector DB TCO Planner (`/tools/rag-calculator.html`)** — Sizes one-time corpus embedding, monthly re-index churn, HNSW vector RAM footprint, and Top-K synthesis spend.
7. **Fine-Tuning vs. RAG vs. Caching TCO (`/tools/fine-tune-vs-rag.html`)** — 12-month architectural cost comparison of LoRA retrains, vector DB RAG, and long-context prompt caching with ADR export.
8. **Self-Hosted GPU vs. Cloud API Break-Even (`/tools/self-host-vs-api.html`)** — Compares RTX 4090 / L40S / A100 / H100 vLLM hosting + DevOps overhead against cloud APIs to find daily break-even request thresholds.
9. **LLM Rate-Limit (RPM/TPM) Capacity Planner (`/tools/llm-rate-limit-planner.html`)** — Computes burst peak TPM, Little's Law concurrency, required vendor tier, and exports ready-to-paste token-bucket rate-limiter JSON.
10. **MCP & Function-Calling Schema Tax Auditor (`/tools/mcp-schema-auditor.html`)** — Measures upfront token bloat from connected MCP servers, compares Prompt Caching vs. Lazy Tool Deferral, and ranks heaviest schemas from pasted JSON.
11. **Voice, Vision & Multimodal Cost Studio (`/tools/multimodal-budget.html`)** — Models PDF/image vision tokens, OpenAI Realtime vs. Gemini Live audio per-minute spend, and GPT Image / Imagen / Flux generation.
12. **AI Startup Runway & Burn Simulator (`/tools/ai-runway.html`)** — Projects 24-month cash runway as AI COGS scales alongside MRR growth.
13. **Prompt A/B Cost Diff & GitHub Action CI Guard (`/tools/prompt-diff.html`)** — Diffs prompt rewrites for token compression savings and exports a **GitHub Action CI YAML** budget gate.
14. **Context Window & JSON Schema Minifier Inspector (`/tools/token-inspector.html`)** — Estimates OpenAI/Claude/Gemini tokens locally and minifies bloated JSON tool schemas to show immediate annual savings.
15. **Speech-to-Text (STT) & TTS Audio API Cost Calculator (`/tools/audio-transcription-cost.html`)** — Compares 7 STT engines (Whisper, Deepgram Nova-3, Groq Whisper Turbo, AssemblyAI, Gemini Audio) and 8 TTS engines (ElevenLabs, Cartesia, OpenAI TTS, Deepgram Aura) with client/edge VAD silence trimming and phrase caching.
16. **AI Image & Video Generation Studio Budget (`/tools/image-video-gen-budget.html`)** — Models creative unit economics across 10 image APIs (FLUX 1.1 Pro/schnell, GPT-Image-1, Imagen 3, Ideogram 3) and 6 video APIs (Veo 2/3, Runway Gen-4 Turbo, Kling, Luma, Sora) with retry multipliers and draft-cascade savings.
17. **LLM Latency, TTFT & Streaming UX Speed Calculator (`/tools/llm-latency-ttft-calculator.html`)** — Benchmarks Time-to-First-Token, generation speed, total response wait, and SLA pass rates across 12 inference endpoints (Cerebras, Groq, Fireworks, Gemini, GPT-5, Claude 4.5, Nova Pro).
18. **AI SaaS Pricing Tier & Credit-Pack Architect (`/tools/ai-pricing-tier-designer.html`)** — Designs margin-safe Free/Pro/Team/Enterprise monthly credit allowances and overage pack pricing with Stripe fee modeling and copyable billing JSON specs.
19. **Vector Database Cloud Cost Comparator (`/tools/vector-db-cost-calculator.html`)** — Benchmarks Pinecone Serverless, Qdrant Cloud, PostgreSQL pgvector, Weaviate, and Turbopuffer across FP32, FP16, INT8 (4x), and Binary (32x) quantization with 12-month TCO Markdown export.
20. **AI Coding Assistant Seat vs. BYOK API Calculator (`/tools/ai-coding-seat-vs-api.html`)** — Calculates org-wide break-even sessions/day comparing Cursor Pro/Business, GitHub Copilot, Windsurf, and Claude Max flat seats against direct cached BYOK LLM API spend.
21. **LLM Prompt Caching TTL & Write-Premium ROI Calculator (`/tools/llm-context-caching-roi.html`)** — Models exact break-even hits/hour comparing No Caching, 5-minute ephemeral caching (1.25x write), 1-hour extended caching (2.0x write), and explicit storage TTL caches.
22. **LLM-as-a-Judge & CI Evaluation Budget Calculator (`/tools/ai-eval-judge-budget.html`)** — Sizes monthly CI PR regression suites and production trace sampling across 6 judge models with shared rubric prompt caching and 50% async Batch discounts.
23. **AI Guardrail, PII Redaction & Moderation Cost Calculator (`/tools/ai-guardrail-moderation-cost.html`)** — Quantifies monthly safety overhead % comparing OpenAI Moderation, Llama Guard 3 8B, Azure Content Safety, AWS Bedrock Guardrails, and custom LLM policy checks.
24. **Multi-Agent Orchestration & Swarm Cost Calculator (`/tools/multi-agent-orchestration-cost.html`)** — Models LangGraph/CrewAI Planner + Flash Workers + Critic swarm topologies vs. all-frontier orchestration with compact handoff state savings.

## Zero-Dependency CLI

```bash
node bin/tokenledger.js --in 2500 --out 600 --req 1000 --cache 50 --top 10 --format md
```

Available formats: `table`, `md` (ready for GitHub PRs / Notion RFCs), and `json`.

## 11 International Markets
English (`/`) · 한국어 (`/ko/`) · 日本語 (`/ja/`) · Deutsch (`/de/`) · Français (`/fr/`) · Español (`/es/`) · Português (`/pt/`) · 中文 (`/zh/`) · हिन्दी (`/hi/`) · Bahasa Indonesia (`/id/`) · Türkçe (`/tr/`)

Plus **80 head-to-head model & cloud comparisons** (`/compare/`) and **34 engineering FinOps guides** (`/guides/`).

## Local Development & Verification

```bash
# Regenerate all 150 static pages, sitemap.xml, robots.txt, and llms*.txt
node scripts/build-site.js

# Run pricing-engine unit tests + 150-page mobile/desktop Playwright E2E suite
node scripts/verify-tokenledger.js
```

## Public Machine-Readable Pricing Feed

Fetch `https://tokenledger-8x7.pages.dev/api/pricing.json` directly from CI, FinOps scripts, or AI agents (`Access-Control-Allow-Origin: *`).

## License

MIT — built and maintained openly. Pull requests to keep model list rates current are welcome.
