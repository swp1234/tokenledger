#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ENGINE = require(path.join(ROOT, 'js', 'pricing-engine.js'));
const ORIGIN = 'https://tokenledger-8x7.pages.dev';
const REPO_URL = 'https://github.com/swp1234/tokenledger';
const TODAY = '2026-11-28';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const CURATED_BOOKS = [
  { asin: '1098166302', title: 'AI Engineering', desc: 'Chip Huyen (O’Reilly) • Production architecture for foundation models, evaluation, RAG, and latency/cost budgets.' },
  { asin: '1098150724', title: 'Cloud FinOps (2nd Ed.)', desc: 'J.R. Storment & Mike Fuller (O’Reilly) • Collaborative cloud & AI unit-economics governance for engineering teams.' },
  { asin: '1098161769', title: 'Building LLMs for Production', desc: 'Louis-François Bouchard & Louie Peters • Practical prompting, caching, RAG, and cost-aware inference routing.' }
];

function renderResourcesCard() {
  const cards = CURATED_BOOKS.map(b => `      <a class="tl-res-item" href="https://www.amazon.com/dp/${b.asin}?tag=dopabrain-20" target="_blank" rel="noopener noreferrer nofollow sponsored">
        <strong>${esc(b.title)}</strong>
        <span>${esc(b.desc)}</span>
        <span class="tl-res-cta">View on Amazon ↗</span>
      </a>`).join('\n');
  return `  <section class="tl-resources" aria-label="Recommended AI Engineering and FinOps Books">
    <h2>Recommended AI Engineering &amp; Cloud FinOps Books</h2>
    <div class="tl-res-grid">
${cards}
    </div>
    <p class="tl-disclosure">Editorial note: Curated technical books for AI engineers and FinOps teams. Amazon links include affiliate tag dopabrain-20 (no extra cost to you) and help keep TokenLedger 100% free and ad-free. Interested in sponsoring TokenLedger? <a href="${REPO_URL}" target="_blank" rel="noopener" style="color:var(--accent)">Open a Sponsor / Partnership thread on GitHub ↗</a>.</p>
  </section>`;
}

function renderShell(opts) {
  const canonical = `${ORIGIN}${opts.path}`;
  const nav = [
    { href: '/', label: 'Estimator', key: 'home' },
    { href: '/tools/agent-budget.html', label: 'Agent Burn', key: 'agent' },
    { href: '/tools/mcp-schema-auditor.html', label: 'MCP Tax', key: 'mcp' },
    { href: '/tools/saas-margin.html', label: 'SaaS Margin', key: 'saas' },
    { href: '/tools/rag-calculator.html', label: 'RAG TCO', key: 'rag' },
    { href: '/tools/self-host-vs-api.html', label: 'GPU vs API', key: 'selfhost' },
    { href: '/tools/multimodal-budget.html', label: 'Voice & Vision', key: 'multimodal' },
    { href: '/tools/token-inspector.html', label: 'Inspector', key: 'inspector' }
  ];
  const navHtml = nav.map(n => `        <a href="${n.href}"${opts.active === n.key ? ' class="active"' : ''}>${n.label}</a>`).join('\n');
  const scriptsHtml = (opts.scripts || []).map(s => `  <script src="${s}" defer></script>`).join('\n');

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': opts.schemaGraph
  }, null, 2);

  return `<!DOCTYPE html>
<html lang="${opts.lang || 'en'}" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="google-site-verification" content="SaGeXV5HO2lva9I9zv9PY--mkPvtS7n29UgDVj5rM9I">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <title>${esc(opts.title)} | TokenLedger</title>
  <meta name="description" content="${esc(opts.description)}">
  <meta name="dateModified" content="${TODAY}">
  <link rel="canonical" href="${canonical}">
${opts.hreflangs || ''}

  <meta property="og:type" content="${opts.ogType || 'website'}">
  <meta property="og:title" content="${esc(opts.title)} | TokenLedger">
  <meta property="og:description" content="${esc(opts.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ORIGIN}/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(opts.title)} | TokenLedger">
  <meta name="twitter:description" content="${esc(opts.description)}">
  <meta name="twitter:image" content="${ORIGIN}/og-image.png">

  <link rel="stylesheet" href="/css/tokenledger.css">
  <script type="application/ld+json">
${jsonLd}
  </script>
</head>
<body>
  <a href="#main" class="skip-link">Skip to main content</a>
  <header class="tl-header">
    <div class="tl-nav-inner">
      <a href="/" class="tl-brand"><span class="tl-logo" aria-hidden="true">TL</span><span>TokenLedger</span></a>
      <nav class="tl-nav-links" aria-label="Primary">
${navHtml}
      </nav>
      <div class="tl-nav-actions">
        <button type="button" id="tlCmdOpen" class="tl-icon-btn" title="Quick Search (Ctrl+K)" aria-label="Quick Search">⌘K</button>
        <select id="tlCurrencySelect" class="tl-icon-btn" aria-label="Display Currency" style="padding:0 6px;cursor:pointer">
          <option value="USD">USD $</option>
          <option value="EUR">EUR €</option>
          <option value="GBP">GBP £</option>
          <option value="JPY">JPY ¥</option>
          <option value="KRW">KRW ₩</option>
        </select>
        <button type="button" id="tlThemeToggle" class="tl-icon-btn" aria-label="Toggle Light or Dark Theme">Light</button>
      </div>
    </div>
  </header>

  <main id="main" class="tl-wrap">
${opts.body}
${opts.hideBooks ? '' : renderResourcesCard()}
  </main>

  <footer class="tl-footer">
    <div class="tl-footer-inner">
      <div><strong>TokenLedger</strong> &bull; 100% Browser-Private AI &amp; LLM FinOps Studio &bull; Pricing snapshot: ${TODAY}</div>
      <div>
        <a href="/about.html">Methodology</a>
        <a href="/privacy.html">Privacy</a>
        <a href="/api/pricing.json">Pricing JSON</a>
        <a href="${REPO_URL}" target="_blank" rel="noopener">GitHub ↗</a>
      </div>
    </div>
  </footer>
  <script src="/js/pricing-engine.js"></script>
  <script src="/js/ui-shell.js"></script>
${scriptsHtml}
  <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"5b25f3b3091241dfbaf9f4ff2f1f6cdb"}'></script>
</body>
</html>`;
}

// 1. Home Page — 24-Model Live Cost Estimator
const COMPARISONS = [
  { slug: 'claude-sonnet-vs-gpt-4-1', a: 'claude-sonnet-4', b: 'gpt-4.1', title: 'Claude Sonnet 4 vs GPT-4.1 API Cost & Context Comparison (2026)', summary: 'Compare per-request, monthly, prompt-cached, and batch API pricing between Anthropic Claude Sonnet 4 and OpenAI GPT-4.1 across real production workloads.' },
  { slug: 'claude-opus-vs-gpt-5', a: 'claude-opus-4', b: 'gpt-5', title: 'Claude Opus 4 vs GPT-5 API Cost & Frontier Budget Comparison (2026)', summary: 'Calculate the exact monthly API spread between Claude Opus 4 ($15/$75) and GPT-5 ($1.25/$10) with prompt caching and cascade routing strategies.' },
  { slug: 'gemini-2-5-pro-vs-claude-sonnet', a: 'gemini-2.5-pro', b: 'claude-sonnet-4', title: 'Gemini 2.5 Pro vs Claude Sonnet 4 API Pricing & 1M Context Economics', summary: 'Side-by-side LLM FinOps breakdown comparing Google Gemini 2.5 Pro 1M context window pricing against Anthropic Claude Sonnet 4.' },
  { slug: 'deepseek-v3-vs-gpt-4-1-mini', a: 'deepseek-v3', b: 'gpt-4.1-mini', title: 'DeepSeek-V3 vs GPT-4.1 mini API Cost Comparison for High-Volume Apps', summary: 'Benchmark high-throughput unit economics between DeepSeek-V3 ($0.27/$1.10) and OpenAI GPT-4.1 mini ($0.40/$1.60).' },
  { slug: 'gemini-2-5-flash-vs-claude-haiku', a: 'gemini-2.5-flash', b: 'claude-3.5-haiku', title: 'Gemini 2.5 Flash vs Claude 3.5 Haiku API Cost & Latency Economics', summary: 'Compare low-latency router and classification costs between Google Gemini 2.5 Flash and Anthropic Claude 3.5 Haiku.' },
  { slug: 'o3-vs-deepseek-r1', a: 'o3', b: 'deepseek-r1', title: 'OpenAI o3 vs DeepSeek-R1 Reasoning Model API Cost Breakdown', summary: 'Estimate reasoning-token workloads for OpenAI o3 versus DeepSeek-R1 including prompt caching and async batch discounts.' },
  { slug: 'llama-4-vs-gpt-4-1', a: 'llama-4-maverick', b: 'gpt-4.1', title: 'Llama 4 Maverick (Hosted) vs GPT-4.1 API Cost & 1M Context Analysis', summary: 'Evaluate hosted open-weight Llama 4 Maverick economics against proprietary OpenAI GPT-4.1 across 1M-context workloads.' },
  { slug: 'prompt-caching-vs-batch-api', a: 'claude-sonnet-4', b: 'gpt-5', title: 'LLM Prompt Caching vs Batch API (50% Off): Which Saves More Money?', summary: 'Quantitative FinOps comparison of 75–90% prompt caching discounts versus 50% async batch API discounts for agents and bulk jobs.' },
  { slug: 'gpt-5-vs-gpt-4-1', a: 'gpt-5', b: 'gpt-4.1', title: 'GPT-5 vs GPT-4.1 API Pricing & Workload Migration Guide (2026)', summary: 'Compare input, cached input, output, and 1M-context costs between OpenAI GPT-5 ($1.25/$10) and GPT-4.1 ($2/$8).' },
  { slug: 'gpt-5-mini-vs-gemini-2-5-flash', a: 'gpt-5-mini', b: 'gemini-2.5-flash', title: 'GPT-5 mini vs Gemini 2.5 Flash API Cost & High-Volume Routing Comparison', summary: 'Compare the two top value workhorse models for production classification, RAG synthesis, and cascade routing.' },
  { slug: 'claude-sonnet-vs-deepseek-v3', a: 'claude-sonnet-4', b: 'deepseek-v3', title: 'Claude Sonnet 4 vs DeepSeek-V3 API Cost & Cascade Economics (2026)', summary: 'Calculate monthly API savings comparing Anthropic Claude Sonnet 4 ($3/$15) against DeepSeek-V3 ($0.27/$1.10).' },
  { slug: 'self-hosted-h100-vs-cloud-api', a: 'claude-sonnet-4', b: 'llama-4-maverick', title: 'Self-Hosted H100 vLLM vs Cloud LLM API: Break-Even Cost Analysis (2026)', summary: 'When does renting an NVIDIA H100 GPU beat paying per token for Claude Sonnet 4 or hosted Llama 4? See the exact daily request threshold.' },
  { slug: 'claude-sonnet-vs-gemini-2-5-flash', a: 'claude-sonnet-4', b: 'gemini-2.5-flash', title: 'Claude Sonnet 4 vs Gemini 2.5 Flash API Cost & Routing Comparison', summary: 'Quantify the 10x cost gap between Anthropic Claude Sonnet 4 and Google Gemini 2.5 Flash across agentic and RAG workloads.' },
  { slug: 'gpt-5-vs-gemini-2-5-pro', a: 'gpt-5', b: 'gemini-2.5-pro', title: 'GPT-5 vs Gemini 2.5 Pro API Cost & Caching Comparison (2026)', summary: 'Compare OpenAI GPT-5 ($1.25/$10, 90% cache) against Google Gemini 2.5 Pro ($1.25/$10, 1M context) on production token budgets.' },
  { slug: 'deepseek-r1-vs-claude-sonnet', a: 'deepseek-r1', b: 'claude-sonnet-4', title: 'DeepSeek-R1 vs Claude Sonnet 4 Reasoning & Coding Cost Analysis', summary: 'Benchmark DeepSeek-R1 ($0.55/$2.19) against Claude Sonnet 4 ($3/$15) for multi-step coding and reasoning pipelines.' },
  { slug: 'grok-3-vs-gpt-5', a: 'grok-3', b: 'gpt-5', title: 'xAI Grok 3 vs OpenAI GPT-5 API Pricing Breakdown (2026)', summary: 'Head-to-head monthly cost analysis comparing xAI Grok 3 ($3/$15) and OpenAI GPT-5 ($1.25/$10) with prompt caching.' },
  { slug: 'mistral-large-vs-claude-sonnet', a: 'mistral-large-2', b: 'claude-sonnet-4', title: 'Mistral Large 2 vs Claude Sonnet 4 EU Enterprise API Cost Comparison', summary: 'Compare EU-sovereign Mistral Large 2 ($2/$6) against Anthropic Claude Sonnet 4 ($3/$15) across high-volume workloads.' },
  { slug: 'openai-realtime-vs-gemini-live', a: 'gpt-5-mini', b: 'gemini-2.5-flash', title: 'OpenAI Realtime Voice vs Gemini Live Audio API Cost Comparison', summary: 'Compare per-minute voice agent economics ($0.24/min vs $0.042/min) and cascaded STT+LLM+TTS alternatives.' },
  { slug: 'qwen-2-5-vs-deepseek-v3', a: 'qwen-2.5-72b', b: 'deepseek-v3', title: 'Qwen 2.5 72B vs DeepSeek-V3 Hosted Open-Weight API Cost Comparison', summary: 'Compare multilingual Qwen 2.5 72B ($0.35/$0.40) against DeepSeek-V3 ($0.27/$1.10) on output-heavy workloads.' },
  { slug: 'gpt-5-nano-vs-gemini-2-5-flash-lite', a: 'gpt-5-nano', b: 'gemini-2.5-flash-lite', title: 'GPT-5 nano vs Gemini 2.5 Flash-Lite Ultra-Budget API Comparison', summary: 'Benchmark the two cheapest production API models ($0.05/$0.40 vs $0.10/$0.40) at 100K+ daily requests.' },
  { slug: 'o4-mini-vs-grok-3-mini', a: 'o4-mini', b: 'grok-3-mini', title: 'OpenAI o4-mini vs xAI Grok 3 Mini Fast Reasoning Cost Comparison', summary: 'Compare fast reasoning API economics between OpenAI o4-mini ($1.10/$4.40) and xAI Grok 3 Mini ($0.30/$0.50).' },
  { slug: 'claude-haiku-vs-gpt-4-1-mini', a: 'claude-3.5-haiku', b: 'gpt-4.1-mini', title: 'Claude 3.5 Haiku vs GPT-4.1 mini Low-Latency API Cost Breakdown', summary: 'Side-by-side FinOps analysis comparing Anthropic Claude 3.5 Haiku ($0.80/$4) and OpenAI GPT-4.1 mini ($0.40/$1.60).' },
  { slug: 'aws-bedrock-vs-direct-anthropic-api', a: 'claude-sonnet-4', b: 'claude-3.5-haiku', title: 'AWS Bedrock vs Direct Anthropic API Pricing & Enterprise FinOps Guide (2026)', summary: 'Compare AWS Bedrock on-demand, cross-region inference, and Provisioned Throughput against direct Anthropic API prompt caching and 50% batch discounts.' },
  { slug: 'google-vertex-ai-vs-gemini-api', a: 'gemini-2.5-pro', b: 'gemini-2.5-flash', title: 'Google Vertex AI vs Gemini Developer API Pricing & Enterprise TCO (2026)', summary: 'Evaluate Google Cloud Vertex AI IAM/VPC compliance and context caching economics alongside direct Gemini 2.5 Pro & Flash API rates.' },
  { slug: 'azure-openai-vs-openai-direct-api', a: 'gpt-5', b: 'gpt-4.1', title: 'Azure OpenAI Service vs OpenAI Direct API Pricing & PTU Comparison (2026)', summary: 'Compare Azure OpenAI Standard PayGo and Provisioned Throughput Units (PTU) against direct OpenAI API caching and Batch endpoints.' },
  { slug: 'fine-tuning-vs-rag-cost', a: 'gpt-4.1-mini', b: 'gpt-4.1', title: 'LLM Fine-Tuning vs RAG vs Prompt Caching: 12-Month Cost Comparison (2026)', summary: 'Quantitative 12-month TCO comparison of LoRA fine-tuning retrains, vector DB RAG synthesis, and long-context prompt caching.' },
  { slug: 'claude-sonnet-4-vs-openai-o3', a: 'claude-sonnet-4', b: 'o3', title: 'Claude Sonnet 4 vs OpenAI o3 Coding & Reasoning API Cost Comparison', summary: 'Benchmark multi-step coding and deep reasoning token spend between Anthropic Claude Sonnet 4 ($3/$15) and OpenAI o3 ($2/$8).' },
  { slug: 'gemini-2-5-flash-vs-deepseek-v3', a: 'gemini-2.5-flash', b: 'deepseek-v3', title: 'Gemini 2.5 Flash vs DeepSeek-V3 High-Volume API Cost Comparison (2026)', summary: 'Compare two ultra-efficient production models ($0.30/$2.50 vs $0.27/$1.10) across 1M-context RAG and structured JSON pipelines.' },
  { slug: 'openai-batch-api-vs-anthropic-batch-api', a: 'gpt-5', b: 'claude-sonnet-4', title: 'OpenAI Batch API vs Anthropic Message Batches (50% Off) Cost Guide', summary: 'Compare 24-hour async 50%-off batch pricing, prompt caching stacking, and throughput limits for nightly LLM pipelines.' },
  { slug: 'vllm-vs-ollama-production-tco', a: 'llama-4-maverick', b: 'qwen-2.5-72b', title: 'vLLM vs Ollama Production GPU Hosting TCO & Throughput Comparison (2026)', summary: 'Compare continuous-batching vLLM throughput per H100/L40S GPU against local Ollama deployments and pay-per-token open-weight APIs.' },
  { slug: 'llama-3-3-70b-vram-vs-cloud-api', a: 'llama-4-maverick', b: 'gpt-4.1-mini', title: 'Llama 3.3 70B Self-Hosted VRAM Cost vs Cloud API Pricing (2026)', summary: 'Calculate exact Q4/FP8 GPU VRAM requirements for Llama 70B versus hosted open-weight and GPT-4.1 mini APIs.' },
  { slug: 'deepseek-r1-671b-hosting-vs-api', a: 'deepseek-r1', b: 'o3', title: 'DeepSeek-R1 (671B MoE) Self-Hosting vs API Cost Breakdown (2026)', summary: 'Why self-hosting DeepSeek-R1 requires an 8x H100 cluster (~$15K/mo) and when API pricing ($0.55/$2.19) wins decisively.' },
  { slug: 'qwen-2-5-32b-local-vs-gpt-5-mini', a: 'qwen-2.5-72b', b: 'gpt-5-mini', title: 'Qwen 2.5 / QwQ 32B Local GPU vs OpenAI GPT-5 mini Cost Comparison', summary: 'Compare single-GPU RTX 4090 / L40S Qwen hosting economics against pay-per-token GPT-5 mini API spend.' },
  { slug: 'claude-opus-4-vs-gemini-2-5-pro', a: 'claude-opus-4', b: 'gemini-2.5-pro', title: 'Claude Opus 4 vs Gemini 2.5 Pro Flagship API Pricing & 1M Context Guide', summary: 'Compare Anthropic’s flagship Claude Opus 4 ($15/$75) against Google Gemini 2.5 Pro ($1.25/$10) with 80% prompt caching.' },
  { slug: 'gpt-5-mini-vs-deepseek-v3', a: 'gpt-5-mini', b: 'deepseek-v3', title: 'GPT-5 mini vs DeepSeek-V3 High-Throughput API Cost Comparison (2026)', summary: 'Benchmark OpenAI GPT-5 mini ($0.25/$2) against DeepSeek-V3 ($0.27/$1.10) across support bots and RAG pipelines.' },
  { slug: 'mistral-small-vs-gemini-2-5-flash-lite', a: 'mistral-small-3', b: 'gemini-2.5-flash-lite', title: 'Mistral Small 3 vs Gemini 2.5 Flash-Lite Ultra-Low-Cost API Comparison', summary: 'Head-to-head cost breakdown of EU-friendly Mistral Small 3 and Google Gemini 2.5 Flash-Lite at 100K+ daily requests.' },
  { slug: 'grok-3-mini-vs-deepseek-r1', a: 'grok-3-mini', b: 'deepseek-r1', title: 'xAI Grok 3 Mini vs DeepSeek-R1 Budget Reasoning API Comparison', summary: 'Compare affordable reasoning economics between xAI Grok 3 Mini ($0.30/$0.50) and DeepSeek-R1 ($0.55/$2.19).' },
  { slug: 'openai-o3-vs-claude-opus-4', a: 'o3', b: 'claude-opus-4', title: 'OpenAI o3 vs Claude Opus 4 Frontier Reasoning API Cost Analysis (2026)', summary: 'Quantify exact monthly and annual cost spreads for deep architectural reasoning between OpenAI o3 and Claude Opus 4.' },
  { slug: 'openai-whisper-vs-deepgram-nova-3', a: 'gpt-4.1-mini', b: 'gemini-2.5-flash', title: 'OpenAI Whisper vs Deepgram Nova-3 & Groq STT Audio API Pricing (2026)', summary: 'Compare per-minute speech-to-text costs ($0.006/min vs $0.0043/min vs $0.00067/min) plus VAD silence trimming savings for voice pipelines.' },
  { slug: 'elevenlabs-vs-openai-tts-cost', a: 'gpt-5-mini', b: 'gemini-2.5-flash', title: 'ElevenLabs vs OpenAI TTS-1 & Cartesia Voice Synthesis Cost Breakdown (2026)', summary: 'Calculate monthly character-based TTS spend comparing ElevenLabs ($90–$180/1M chars), Cartesia Sonic ($45/1M), and OpenAI TTS-1 ($15/1M).' },
  { slug: 'flux-pro-vs-gpt-image-1-vs-imagen-3', a: 'gpt-5', b: 'gemini-2.5-pro', title: 'FLUX 1.1 Pro vs OpenAI GPT-Image-1 vs Google Imagen 3 API Cost Guide (2026)', summary: 'Benchmark per-asset creative generation unit economics with retry multipliers and FLUX schnell draft-cascade optimization.' },
  { slug: 'google-veo-vs-runway-gen4-video-cost', a: 'gemini-2.5-pro', b: 'gpt-5', title: 'Google Veo 2/3 vs Runway Gen-4 Turbo & Sora Video Generation API Cost (2026)', summary: 'Model per-second video generation API costs ($0.05/s to $0.40/s) across agency production retry rates and clip lengths.' },
  { slug: 'groq-vs-together-ai-vs-fireworks-pricing', a: 'llama-4-maverick', b: 'deepseek-v3', title: 'Groq vs Together AI vs Fireworks AI Open-Weight Inference API Pricing (2026)', summary: 'Compare serverless open-weight token pricing, latency, and throughput across Llama 4, DeepSeek-V3, and Qwen 2.5 providers.' },
  { slug: 'openrouter-vs-direct-llm-api-cost', a: 'claude-sonnet-4', b: 'gpt-5', title: 'OpenRouter vs Direct OpenAI & Anthropic API Pricing & Margin Impact (2026)', summary: 'Evaluate unified multi-provider gateway fees and failover reliability versus direct vendor prompt caching and batch discounts.' },
  { slug: 'anthropic-claude-code-api-vs-max-plan', a: 'claude-sonnet-4', b: 'claude-opus-4', title: 'Claude Code Pay-As-You-Go API vs Flat-Rate Max Plan Cost Break-Even (2026)', summary: 'Calculate daily coding-agent token burn with 85% prompt caching to find the exact developer break-even between API billing and seat plans.' },
  { slug: 'cursor-pro-vs-byok-llm-api-cost', a: 'claude-sonnet-4', b: 'gpt-4.1', title: 'Cursor Pro / Ultra Seat vs Bring-Your-Own-Key (BYOK) LLM API Cost Analysis', summary: 'Compare flat monthly AI IDE seat fees against direct BYOK Anthropic & OpenAI API token spend across heavy engineering workflows.' },
  { slug: 'pinecone-vs-qdrant-vs-pgvector-rag-cost', a: 'gemini-2.5-flash', b: 'gpt-4.1-mini', title: 'Pinecone vs Qdrant vs pgvector RAG Storage & Query TCO Comparison (2026)', summary: 'Model HNSW memory footprints, monthly vector hosting costs, and top-K synthesis token budgets across 1M–50M embeddings.' },
  { slug: 'openai-embeddings-vs-voyage-3-vs-cohere', a: 'gpt-4.1-mini', b: 'gemini-2.5-flash-lite', title: 'OpenAI text-embedding-3 vs Voyage 3 Large vs Cohere Embed v3 Cost Guide', summary: 'Compare initial corpus ingestion, monthly churn re-indexing, and vector dimensionality RAM impact for enterprise RAG.' },
  { slug: 'cloudflare-workers-ai-vs-openai-mini', a: 'llama-4-scout', b: 'gpt-5-mini', title: 'Cloudflare Workers AI vs OpenAI GPT-5 mini Edge Inference Cost Comparison', summary: 'Benchmark edge-hosted open-weight inference pricing against OpenAI GPT-5 mini for high-volume classification and extraction.' },
  { slug: 'deepseek-v3-vs-llama-4-maverick-cost', a: 'deepseek-v3', b: 'llama-4-maverick', title: 'DeepSeek-V3 vs Llama 4 Maverick (1M Context) API Cost & Speed Comparison', summary: 'Head-to-head open-weight API pricing comparing DeepSeek-V3 ($0.27/$1.10) and hosted Llama 4 Maverick ($0.27/$0.85, 1M context).' },
  { slug: 'claude-sonnet-4-5-vs-gpt-5', a: 'claude-sonnet-4.5', b: 'gpt-5', title: 'Claude 4.5 Sonnet vs OpenAI GPT-5 API Cost & Coding Agent Comparison (2026)', summary: 'Compare Anthropic Claude 4.5 Sonnet ($3/$15) against OpenAI GPT-5 ($1.25/$10) with 90% prompt caching across production coding agents.' },
  { slug: 'claude-haiku-4-5-vs-gpt-5-mini', a: 'claude-haiku-4.5', b: 'gpt-5-mini', title: 'Claude 4.5 Haiku vs OpenAI GPT-5 mini Fast Agent Cost Comparison (2026)', summary: 'Head-to-head FinOps breakdown comparing Anthropic Claude 4.5 Haiku ($1/$5) and OpenAI GPT-5 mini ($0.25/$2) for low-latency routers.' },
  { slug: 'claude-haiku-4-5-vs-gemini-2-5-flash', a: 'claude-haiku-4.5', b: 'gemini-2.5-flash', title: 'Claude 4.5 Haiku vs Google Gemini 2.5 Flash API Pricing & Speed Guide (2026)', summary: 'Evaluate Claude 4.5 Haiku ($1/$5, 200K ctx) against Gemini 2.5 Flash ($0.30/$2.50, 1M ctx) for high-throughput RAG and extraction.' },
  { slug: 'openai-o3-pro-vs-claude-opus-4', a: 'o3-pro', b: 'claude-opus-4', title: 'OpenAI o3-pro vs Claude Opus 4 Ultra-Frontier API Cost Analysis (2026)', summary: 'Calculate monthly spend for deep multi-step reasoning between OpenAI o3-pro ($20/$80) and Anthropic Claude Opus 4 ($15/$75).' },
  { slug: 'deepseek-v3-1-vs-gpt-5-mini', a: 'deepseek-v3.1', b: 'gpt-5-mini', title: 'DeepSeek-V3.1 (Hybrid Thinking) vs GPT-5 mini API Cost Comparison (2026)', summary: 'Compare hybrid reasoning open-weight DeepSeek-V3.1 ($0.28/$1.10) against OpenAI GPT-5 mini ($0.25/$2) across real daily workloads.' },
  { slug: 'qwen-3-235b-vs-deepseek-v3-1', a: 'qwen-3-235b', b: 'deepseek-v3.1', title: 'Qwen 3 235B (MoE) vs DeepSeek-V3.1 Open-Weight API Pricing Comparison', summary: 'Benchmark Alibaba Qwen 3 235B-A22B ($0.22/$0.88) against DeepSeek-V3.1 ($0.28/$1.10) for multilingual production apps.' },
  { slug: 'amazon-nova-pro-vs-gemini-2-5-flash', a: 'amazon-nova-pro', b: 'gemini-2.5-flash', title: 'Amazon Nova Pro (AWS Bedrock) vs Gemini 2.5 Flash API Cost Comparison', summary: 'Compare AWS-native Amazon Nova Pro ($0.80/$3.20, 300K ctx) against Google Gemini 2.5 Flash ($0.30/$2.50, 1M ctx) on enterprise workloads.' },
  { slug: 'amazon-nova-pro-vs-claude-sonnet-4-5', a: 'amazon-nova-pro', b: 'claude-sonnet-4.5', title: 'Amazon Nova Pro vs Claude 4.5 Sonnet on AWS Bedrock: FinOps Cost Guide', summary: 'How AWS Bedrock teams save 70%+ by cascading routine workloads to Amazon Nova Pro while reserving Claude 4.5 Sonnet for hard reasoning.' },
  { slug: 'cerebras-vs-groq-llm-inference-speed-cost', a: 'llama-4-maverick', b: 'llama-4-scout', title: 'Cerebras vs Groq Ultra-Fast LLM Inference Latency & Cost Comparison (2026)', summary: 'Compare wafer-scale Cerebras (2,100 tok/s) against Groq LPU (330 tok/s) for voice agents, real-time coding autocomplete, and SLA budgets.' },
  { slug: 'qwen-3-235b-vs-gpt-5-mini', a: 'qwen-3-235b', b: 'gpt-5-mini', title: 'Qwen 3 235B MoE vs OpenAI GPT-5 mini Production API Cost Breakdown', summary: 'Quantify exact monthly API savings between hosted Qwen 3 235B ($0.22/$0.88) and GPT-5 mini ($0.25/$2.00) on output-heavy generation.' },
  { slug: 'deepseek-v3-1-vs-claude-sonnet-4-5', a: 'deepseek-v3.1', b: 'claude-sonnet-4.5', title: 'DeepSeek-V3.1 vs Claude 4.5 Sonnet Coding & Agent Cost Comparison (2026)', summary: 'Measure the 10x token-cost spread between DeepSeek-V3.1 and Claude 4.5 Sonnet and model a hybrid 70/30 engineering router.' },
  { slug: 'o3-pro-vs-gemini-2-5-pro', a: 'o3-pro', b: 'gemini-2.5-pro', title: 'OpenAI o3-pro vs Google Gemini 2.5 Pro Deep Reasoning Cost Guide (2026)', summary: 'Compare ultra-premium o3-pro ($20/$80) against Gemini 2.5 Pro ($1.25/$10, 1M context) for long-document synthesis and research pipelines.' },
  { slug: 'claude-opus-4-5-vs-gpt-5-pro', a: 'claude-opus-4.5', b: 'gpt-5-pro', title: 'Claude 4.5 Opus vs OpenAI GPT-5 Pro Ultra-Frontier API Pricing Comparison (2026)', summary: 'Benchmark maximum-capability frontier coding & research spend comparing Claude 4.5 Opus ($15/$75) against OpenAI GPT-5 Pro ($15/$120).' },
  { slug: 'mistral-medium-3-vs-gpt-4-1-mini', a: 'mistral-medium-3', b: 'gpt-4.1-mini', title: 'Mistral Medium 3 vs OpenAI GPT-4.1 mini EU Enterprise Cost Comparison (2026)', summary: 'Compare Mistral Medium 3 ($0.40/$2.00) against GPT-4.1 mini ($0.40/$1.60) for GDPR-friendly European production workloads.' },
  { slug: 'cohere-command-a-vs-claude-sonnet-4-5', a: 'cohere-command-a', b: 'claude-sonnet-4.5', title: 'Cohere Command A vs Claude 4.5 Sonnet Enterprise RAG API Cost Guide (2026)', summary: 'Compare Cohere Command A ($2.50/$10, 256K ctx) against Claude 4.5 Sonnet ($3/$15) for grounded enterprise retrieval and citation pipelines.' },
  { slug: 'amazon-nova-lite-vs-gpt-5-nano', a: 'amazon-nova-lite', b: 'gpt-5-nano', title: 'Amazon Nova Lite vs OpenAI GPT-5 nano Ultra-Budget API Pricing (2026)', summary: 'Benchmark ultra-cheap extraction and routing costs between AWS Amazon Nova Lite ($0.06/$0.24) and OpenAI GPT-5 nano ($0.05/$0.40).' },
  { slug: 'gemini-2-5-pro-think-vs-o3', a: 'gemini-2.5-pro-think', b: 'o3', title: 'Gemini 2.5 Pro Deep Think vs OpenAI o3 Reasoning API Cost Breakdown (2026)', summary: 'Calculate long-context reasoning budgets comparing Gemini 2.5 Pro Deep Think ($2.50/$15, 1M ctx) against OpenAI o3 ($2/$8).' },
  { slug: 'claude-opus-4-5-vs-claude-sonnet-4-5', a: 'claude-opus-4.5', b: 'claude-sonnet-4.5', title: 'Claude 4.5 Opus vs Claude 4.5 Sonnet Cost & Agent Cascade Guide (2026)', summary: 'Quantify the 5x cost gap between Claude 4.5 Opus and Sonnet and size a hybrid architect-plus-implementer coding workflow.' },
  { slug: 'claude-3-7-sonnet-vs-claude-sonnet-4-5', a: 'claude-3.7-sonnet', b: 'claude-sonnet-4.5', title: 'Claude 3.7 Sonnet vs Claude 4.5 Sonnet API Cost & Migration Guide (2026)', summary: 'Compare identical $3/$15 list rates, 90% prompt caching economics, and token efficiency when migrating production agents from Claude 3.7 Sonnet to 4.5 Sonnet.' },
  { slug: 'gemini-2-0-flash-vs-gemini-2-5-flash', a: 'gemini-2.0-flash', b: 'gemini-2.5-flash', title: 'Gemini 2.0 Flash vs Gemini 2.5 Flash API Pricing & Throughput Comparison (2026)', summary: 'Compare Google Gemini 2.0 Flash ($0.10/$0.40) against Gemini 2.5 Flash ($0.30/$2.50) across 1M-context extraction, classification, and RAG pipelines.' },
  { slug: 'llama-3-3-70b-vs-llama-4-maverick', a: 'llama-3.3-70b-hosted', b: 'llama-4-maverick', title: 'Llama 3.3 70B vs Llama 4 Maverick Hosted API Pricing Comparison (2026)', summary: 'Benchmark open-weight hosted pricing comparing Meta Llama 3.3 70B ($0.59/$0.79) against 1M-context Llama 4 Maverick ($0.27/$0.85).' },
  { slug: 'deepseek-v3-0324-vs-gpt-4-1-mini', a: 'deepseek-v3-0324', b: 'gpt-4.1-mini', title: 'DeepSeek-V3-0324 vs OpenAI GPT-4.1 mini Coding & Production Cost Guide (2026)', summary: 'Side-by-side unit economics comparing DeepSeek-V3-0324 ($0.27/$1.10) against OpenAI GPT-4.1 mini ($0.40/$1.60, 1M context).' },
  { slug: 'anthropic-5min-vs-1hour-prompt-cache', a: 'claude-sonnet-4.5', b: 'claude-opus-4.5', title: 'Anthropic 5-Min vs 1-Hour Extended Prompt Caching Write-Premium ROI (2026)', summary: 'Exact break-even hits per hour comparing 1.25x 5-minute ephemeral caching versus 2.0x 1-hour extended prompt caching across Claude 4.5 models.' },
  { slug: 'llm-as-a-judge-gpt-5-mini-vs-claude-sonnet', a: 'gpt-5-mini', b: 'claude-sonnet-4.5', title: 'LLM-as-a-Judge Cost Comparison: GPT-5 mini vs Claude 4.5 Sonnet CI Evals (2026)', summary: 'Calculate monthly CI regression and production trace sampling evaluation spend comparing GPT-5 mini ($0.25/$2) against Claude 4.5 Sonnet ($3/$15) with 50% Batch.' },
  { slug: 'gpt-4o-mini-vs-gpt-5-mini', a: 'gpt-4o-mini', b: 'gpt-5-mini', title: 'OpenAI GPT-4o mini vs GPT-5 mini Migration Cost & Caching Comparison (2026)', summary: 'Compare legacy GPT-4o mini ($0.15/$0.60, 50% cache) against GPT-5 mini ($0.25/$2.00, 90% cache, 400K ctx) when upgrading high-volume apps.' },
  { slug: 'claude-3-5-sonnet-vs-claude-sonnet-4-5', a: 'claude-3.5-sonnet', b: 'claude-sonnet-4.5', title: 'Claude 3.5 Sonnet vs Claude 4.5 Sonnet Upgrade Cost & Token Efficiency (2026)', summary: 'Compare identical $3/$15 list rates, 90% caching, and multi-turn coding efficiency when migrating legacy Claude 3.5 Sonnet pipelines.' },
  { slug: 'gemini-2-0-flash-lite-vs-gpt-5-nano', a: 'gemini-2.0-flash-lite', b: 'gpt-5-nano', title: 'Gemini 2.0 Flash-Lite vs OpenAI GPT-5 nano Ultra-Low-Cost API Benchmark (2026)', summary: 'Head-to-head ultra-budget extraction and routing comparison between Gemini 2.0 Flash-Lite ($0.075/$0.30, 1M ctx) and GPT-5 nano ($0.05/$0.40).' },
  { slug: 'mistral-codestral-vs-deepseek-v3-0324', a: 'mistral-codestral', b: 'deepseek-v3-0324', title: 'Mistral Codestral 25.01 vs DeepSeek-V3-0324 Code Completion API Cost (2026)', summary: 'Compare IDE fill-in-the-middle (FIM) coding completion costs between EU Mistral Codestral ($0.30/$0.90) and DeepSeek-V3-0324 ($0.27/$1.10).' },
  { slug: 'bedrock-guardrails-vs-llama-guard-3', a: 'claude-sonnet-4.5', b: 'llama-4-scout', title: 'AWS Bedrock Guardrails vs Llama Guard 3 8B & Azure Content Safety Cost (2026)', summary: 'Quantify safety moderation and PII redaction overhead % comparing AWS Bedrock Guardrails ($0.75/1K units) against hosted Llama Guard 3 ($0.05/1M).' },
  { slug: 'langgraph-multi-agent-frontier-vs-tiered', a: 'claude-opus-4.5', b: 'gemini-2.5-flash', title: 'Multi-Agent Swarm Cost: All-Frontier vs Tiered Planner + Flash Workers (2026)', summary: 'See how routing worker and critic hops in LangGraph/CrewAI swarms to Gemini 2.5 Flash & GPT-5 mini cuts orchestration bills by 70–85%.' }
];

const GUIDES = [
  {
    slug: 'llm-cost-optimization-playbook',
    title: 'LLM Cost Optimization Playbook: Cut API Spend 60–85% Without Losing Quality',
    desc: 'Field-tested AI FinOps playbook covering prompt caching, frontier-to-mini cascade routing, JSON schema minification, and async batch APIs.',
    sections: [
      { h2: '1. Put Static Context First to Unlock 75–90% Prompt Caching', p: 'Every modern frontier API (Anthropic, OpenAI, Google Gemini, DeepSeek) bills cached prompt prefixes at 10% to 25% of base input cost. Never inject dynamic timestamps, request UUIDs, or per-user metadata at the top of your system prompt—put immutable instructions, JSON tool schemas, and few-shot examples first so prefix hit rates cross 70–90%.' },
      { h2: '2. Implement a 70/30 Model Cascade Router', p: 'Sending every customer inquiry or classification task to a flagship reasoning model wastes 5x–15x budget. Use a fast classifier or rule gate on a mini/flash model ($0.10–$0.30/1M) to handle 70% of routine requests and escalate only complex reasoning to GPT-5 or Claude Sonnet/Opus.' },
      { h2: '3. Minify Tool Schemas and System Prompts', p: 'Pretty-printed JSON tool definitions with verbose descriptions routinely burn 1,500–4,000 input tokens on every single turn. Running whitespace minification and concise parameter descriptions cuts recurring spend permanently—test your exact savings in our Token Inspector.' },
      { h2: '4. Move Non-Interactive Jobs to 50% Batch APIs', p: 'Nightly summarization, eval suites, document enrichment, and SEO classification rarely need 2-second latency. Moving offline queues to OpenAI, Anthropic, or Gemini Batch endpoints cuts both input and output rates by 50% immediately.' }
    ],
    ctaHref: '/', ctaLabel: 'Open 24-Model Live Cost Estimator →'
  },
  {
    slug: 'ai-agent-token-snowball-fix',
    title: 'Fixing the AI Agent Token Snowball: Why a 15-Turn Agent Costs 12x More Than Expected',
    desc: 'Mathematical breakdown of quadratic context accumulation in multi-turn tool-calling agents and how prefix caching + sliding windows cap burn.',
    sections: [
      { h2: 'The Quadratic Trap Inside Every ReAct / Tool-Calling Loop', p: 'In a multi-turn agent, Turn 1 sends the system prompt + user request. Turn 2 resends Turn 1 plus the tool output. By Turn 15, the model re-reads all 14 prior tool payloads—turning linear steps into quadratic O(N²) input token spend.' },
      { h2: 'Why Prompt Caching Alone Is Half the Fix', p: 'Prefix caching slashes the cost of re-reading prior turns by up to 90%, yet verbose raw JSON/HTML tool outputs still degrade attention quality and inflate cache writes. Truncating raw tool payloads before appending them to message history compounds caching savings.' },
      { h2: 'Sliding-Window Rolling Summaries for Long Sessions', p: 'Capping active message history to the last 4–6 raw turns plus a compact 400-token structured state summary bounds per-turn input tokens flat even on 40-turn autonomous runs.' }
    ],
    ctaHref: '/tools/agent-budget.html', ctaLabel: 'Model Your Agent Burn Curve →'
  },
  {
    slug: 'saas-ai-gross-margin-benchmarks',
    title: 'AI SaaS Gross Margin Benchmarks: Pricing Seats Without Getting Crushed by Power Users',
    desc: 'How to model AI COGS, Stripe fees, gross margin targets (>=75%), and break-even usage caps for flat-rate AI subscriptions.',
    sections: [
      { h2: 'Traditional SaaS (85% Margin) vs. AI-Native SaaS (55–78% Margin)', p: 'Unlike classic CRUD SaaS where marginal server cost per user approaches pennies, an active AI seat running 500 frontier requests per month can easily burn $8–$20 in direct token COGS—wiping out a $20/month flat subscription once payment fees are included.' },
      { h2: 'Calculating Your Hard Power-User Break-Even Cap', p: 'Every subscription tier has an exact break-even request ceiling: (Price − Payment Fee − Fixed Infra) ÷ Cost per Request. Knowing that threshold lets you design fair soft-throttles (e.g., fast frontier credits followed by automatic Flash/Mini fallback) instead of silent negative margins.' },
      { h2: 'Three Pricing Levers That Protect Margin', p: '1) Hybrid seat + pooled team credits; 2) Automatic model routing by task complexity; 3) Prompt caching on shared workspace knowledge bases.' }
    ],
    ctaHref: '/tools/saas-margin.html', ctaLabel: 'Simulate Your SaaS Gross Margin →'
  },
  {
    slug: 'rag-chunking-cost-architecture',
    title: 'RAG & Vector Embedding Cost Architecture: Sizing Chunks, Re-Index Churn & Synthesis Spend',
    desc: 'Why embedding ingestion is rarely the real RAG bill—and how Top-K synthesis tokens and HNSW vector RAM dominate monthly TCO.',
    sections: [
      { h2: 'The RAG Cost Surprise: Ingestion Is Pennies, Synthesis Is 90% of the Bill', p: 'Embedding 25,000 documents with OpenAI text-embedding-3-small ($0.02/1M) costs less than $1 one-time. Yet retrieving Top-10 large chunks (8,000 tokens) into a frontier synthesis LLM 3,000 times a day quickly runs $1,000+/month.' },
      { h2: 'Chunk Size, Overlap & Top-K Discipline', p: 'Using 400–600 token semantic chunks with 10–15% overlap and a lightweight reranker to pass only the top 4–6 relevant passages cuts synthesis input tokens in half while improving grounded answer accuracy.' },
      { h2: 'Watch Vector Memory Footprint on High-Dimension Embeddings', p: '3072-dimension float32 vectors consume 2x the RAM of 1536-dimension vectors and 3x that of 1024-dimension models. Dimension reduction (Matryoshka embeddings) or scalar quantization cuts managed vector DB bills sharply at scale.' }
    ],
    ctaHref: '/tools/rag-calculator.html', ctaLabel: 'Calculate Your RAG Monthly TCO →'
  },
  {
    slug: 'mcp-tool-schema-token-bloat',
    title: 'MCP Tool Schema Token Bloat: Why 70 Connected Tools Quietly Burn 18,000 Tokens Every Turn',
    desc: 'How Model Context Protocol (MCP) JSON schemas inflate upfront prompt cost across Claude Code, Cursor, and custom agents—and how lazy tool deferral cuts it by 85%.',
    sections: [
      { h2: 'The Hidden Upfront Tax of Connected MCP Servers', p: 'Every MCP server you connect injects JSON tool names, verbose descriptions, and nested parameter schemas into the system context on every single turn. Five servers with 14 tools each easily consume 15,000 to 22,000 tokens before the user types a single word.' },
      { h2: 'Why Lazy Tool Deferral Beats Always-On Schemas', p: 'Sending only a compact 14-token name/summary index upfront and loading full JSON schemas on demand trims 80–90% of recurring schema tokens while also improving tool-selection accuracy.' },
      { h2: 'Audit & Minify Tool Descriptions Before Shipping', p: 'Paste your raw MCP or OpenAI tools JSON into TokenLedger’s MCP Schema Auditor to rank your heaviest tool definitions and strip redundant prose and pretty-print whitespace.' }
    ],
    ctaHref: '/tools/mcp-schema-auditor.html', ctaLabel: 'Audit Your MCP Schema Tax →'
  },
  {
    slug: 'multimodal-vision-voice-api-pricing',
    title: 'Multimodal Vision, PDF OCR & Realtime Voice API Pricing Guide (2026)',
    desc: 'Compare image tile billing, PDF page token counts, OpenAI Realtime ($0.24/min) vs Gemini Live ($0.042/min), and cascaded voice pipelines.',
    sections: [
      { h2: 'Why PDF & Image Billing Differs 5x Across Providers', p: 'Google Gemini bills standard images/pages at a flat ~258 tokens, whereas tile-based vision models (OpenAI high-detail, Anthropic Claude) can consume 765 to 1,600+ tokens per page depending on resolution. Resizing document scans to 1024px before upload saves 40–60% without hurting OCR accuracy.' },
      { h2: 'Speech-to-Speech Realtime vs. Cascaded Voice Pipelines', p: 'Native speech-to-speech Realtime APIs deliver ultra-low latency (~300ms) at $0.04–$0.24/minute, while a cascaded Whisper STT + Flash LLM + streaming TTS pipeline runs ~$0.025–$0.035/minute for structured support calls.' }
    ],
    ctaHref: '/tools/multimodal-budget.html', ctaLabel: 'Open Voice & Vision Cost Studio →'
  },
  {
    slug: 'prompt-caching-architecture-guide',
    title: 'LLM Prompt Caching Architecture: Ordering System Prompts for 80–90% Cache Hits',
    desc: 'Practical engineering rules for maximizing prefix cache hit rates across Anthropic, OpenAI, Google Gemini, and DeepSeek.',
    sections: [
      { h2: 'Prefix Stability Is Everything', p: 'Prompt caching hashes exact token prefixes from byte 0. Placing a changing ISO timestamp, user name, or random request ID near the top of your system prompt invalidates 100% of downstream cache blocks. Always order: (1) Static system rules, (2) Tool schemas, (3) Shared reference docs, (4) Dynamic user/session turn at the very bottom.' },
      { h2: 'Mind Minimum Block Thresholds & TTL Windows', p: 'Anthropic and OpenAI require minimum cacheable prefix lengths (1,024+ tokens) and keep ephemeral caches warm for 5–60 minutes. Batching traffic per tenant or workspace keeps hit rates consistently above 75%.' }
    ],
    ctaHref: '/', ctaLabel: 'Simulate Prompt Cache Hit Rates →'
  },
  {
    slug: 'model-cascade-router-design',
    title: 'Model Cascade & Semantic Router Design: Cut Frontier LLM Bills 70% in Production',
    desc: 'How to route routine traffic to Gemini 2.5 Flash or GPT-5 mini while reserving Claude Sonnet/Opus and GPT-5 for complex tasks.',
    sections: [
      { h2: 'Not Every Prompt Deserves a $15/1M Frontier Model', p: 'In most SaaS and support workloads, 65–80% of requests are classification, formatting, lookup summarization, or simple Q&A where a $0.25–$0.30/1M model achieves parity with frontier models at 1/10th the cost and 3x the speed.' },
      { h2: 'Confidence-Gated Escalation', p: 'Start with a lightweight rubric or structured JSON confidence score on the fast tier; escalate to the frontier tier only when multi-file reasoning, ambiguous edge cases, or low-confidence flags trigger.' }
    ],
    ctaHref: '/?frontier=claude-sonnet-4&mini=gemini-2.5-flash&offload=75', ctaLabel: 'Simulate 75/25 Cascade Savings →'
  },
  {
    slug: 'fine-tuning-vs-rag-cost-decision-matrix',
    title: 'Fine-Tuning vs. RAG vs. Prompt Caching: The 12-Month AI FinOps Decision Matrix',
    desc: 'When does LoRA fine-tuning actually save money over RAG or long-context prompt caching? Break down training refreshes, inference multipliers, and vector DB RAM.',
    sections: [
      { h2: '1. Why Fine-Tuning Rarely Beats RAG for Frequently Changing Knowledge', p: 'Every time product docs, prices, or policies change, a fine-tuned model requires dataset curation, training runs, eval regressions, and redeployment—plus many cloud vendors charge 1.5x–2x higher inference rates on custom fine-tuned weights. RAG updates knowledge in seconds for pennies of embedding cost.' },
      { h2: '2. When Fine-Tuning Wins Decisively on Unit Economics', p: 'If you run 20,000+ daily requests with a massive 6,000-token style guide or complex extraction rubric, distilling that behavior into a fine-tuned small model (e.g., GPT-4.1 mini or Llama 4) eliminates thousands of repeated input tokens per call and pays back training costs within weeks.' },
      { h2: '3. The Third Contender: Long-Context Prompt Caching Under 200K Tokens', p: 'If your entire domain knowledge fits under 100K–200K tokens and traffic is steady enough to keep caches warm, 90%-discounted prompt caching often delivers higher accuracy than RAG with zero vector database maintenance.' }
    ],
    ctaHref: '/tools/fine-tune-vs-rag.html', ctaLabel: 'Run 12-Month Fine-Tune vs RAG TCO →'
  },
  {
    slug: 'llm-rate-limits-tpm-rpm-architecture',
    title: 'LLM Rate Limits (RPM & TPM) in Production: Concurrency Math & Multi-Provider Failover',
    desc: 'Prevent HTTP 429 outages at peak traffic using Little’s Law concurrency sizing, burst multipliers, token-bucket rate limiters, and multi-region failover.',
    sections: [
      { h2: '1. Why Peak TPM — Not Daily Average — Breaks Production AI Apps', p: 'SaaS traffic is never evenly spread across 24 hours. A morning standup burst or batch webhook can spike RPM 2.5x–4x above average, instantly exhausting Anthropic or OpenAI Tokens-Per-Minute (TPM) ceilings and triggering cascading 429 retries.' },
      { h2: '2. Sizing Concurrent Streams with Little’s Law', p: 'Required concurrent open connections equal (Peak RPM ÷ 60) × Average Latency in seconds. A 300-RPM burst with 6-second streaming responses holds 30 concurrent workers open—meaning slow frontier reasoning models amplify connection-pool pressure.' },
      { h2: '3. Designing Graceful 429/529 Failover Policies', p: 'Combine jittered exponential backoff with cross-region endpoints (e.g., US + EU Bedrock/Vertex) or an automated secondary provider fallback so users never see hard timeouts during provider congestion.' }
    ],
    ctaHref: '/tools/llm-rate-limit-planner.html', ctaLabel: 'Calculate Peak TPM & Tier Capacity →'
  },
  {
    slug: 'enterprise-ai-gateway-bedrock-vertex-azure-pricing',
    title: 'Enterprise AI Gateway Pricing: AWS Bedrock vs. Google Vertex AI vs. Azure OpenAI vs. Direct APIs',
    desc: 'Hidden enterprise cloud FinOps trade-offs: regional surcharges, Provisioned Throughput Units (PTU), prompt caching parity, and committed cloud-spend burn.',
    sections: [
      { h2: '1. On-Demand List Parity vs. Hidden Regional & Cross-Region Premiums', p: 'While headline per-1M token list rates on AWS Bedrock, Google Vertex AI, and Azure OpenAI frequently match direct vendor APIs, regional endpoints (EU/APAC) and data-residency routing can add 10% premiums. Always verify whether prompt caching and 50% batch discounts are enabled in your target region.' },
      { h2: '2. When Provisioned Throughput (PTU / GSU) Pays Off', p: 'Reserved throughput eliminates noisy-neighbor 429 errors and guarantees p99 latency, yet under-utilized PTUs burn 24/7 fixed spend. Hybrid routing—sending steady base load to PTU and spilling peak bursts to PayGo—preserves both SLA and gross margin.' }
    ],
    ctaHref: '/tools/self-host-vs-api.html', ctaLabel: 'Model Dedicated vs PayGo Break-Even →'
  },
  {
    slug: 'ci-cd-llm-token-budget-guardrails',
    title: 'CI/CD LLM Token Budget Guardrails: Catching Prompt & MCP Schema Bloat Before Merge',
    desc: 'How engineering teams run automated token-budget checks in GitHub Actions pull requests to stop silent $10,000/yr prompt regressions.',
    sections: [
      { h2: '1. Why One Unreviewed PR Can Add $12,000/Year in Silent Token Spend', p: 'Adding 400 tokens of verbose few-shot examples or two unminified MCP JSON schemas to a high-volume system prompt looks harmless in code review—until 10,000 daily requests multiply that diff into a five-figure annual bill.' },
      { h2: '2. Automating Token Diffs in GitHub Actions', p: 'Run a zero-dependency CLI token budget check inside every pull request touching prompts/ or tools/ directories, posting exact monthly & annual cost impact directly into the GitHub Step Summary before merge.' }
    ],
    ctaHref: '/tools/prompt-diff.html', ctaLabel: 'Generate GitHub Action Budget Guard →'
  },
  {
    slug: 'llm-gpu-vram-kv-cache-quantization-guide',
    title: 'LLM GPU VRAM & KV-Cache Math: Sizing FP16, FP8 & Q4_K_M Without OOM Crashes',
    desc: 'Exact formula for model weights + Grouped-Query Attention (GQA) KV-cache memory across concurrent batches so you rent the right GPU node.',
    sections: [
      { h2: '1. Why Model Weights Are Only Half the VRAM Story', p: 'A 70B model in Q4_K_M takes ~41 GB of weights, yet serving 16 concurrent 32K-context users in FP16 KV-cache adds 20+ GB of dynamic KV memory plus activation buffers—pushing a single 48 GB L40S straight into OOM.' },
      { h2: '2. Cutting KV-Cache Footprint 50% with FP8 KV Quantization', p: 'Modern engines like vLLM and TensorRT-LLM support FP8 KV-cache quantization with negligible perplexity loss, immediately doubling concurrent batch capacity on the exact same GPU hardware.' }
    ],
    ctaHref: '/tools/gpu-vram-calculator.html', ctaLabel: 'Open GPU VRAM & KV-Cache Calculator →'
  },
  {
    slug: 'cfo-ai-unit-economics-finops-reporting',
    title: 'CFO Guide to AI Unit Economics: Turning LLM API Bills Into Predictable Gross Margins',
    desc: 'How finance and engineering leaders track cost-per-active-seat, waterfall savings (cache + cascade + batch), and AI COGS % of ARR.',
    sections: [
      { h2: '1. The Three Metrics Every Board Asks About AI COGS', p: 'Track (a) Blended Cost per Active User/Month, (b) Top-5% Power-User Margin Floor, and (c) Total AI COGS as a % of Gross Revenue (target under 15–22% for SaaS valuation multiples).' },
      { h2: '2. Stacking Caching, Cascade Routing & Async Batching', p: 'Combining 70% prompt caching + 55% mini-model routing + 25% async batch offloading routinely trims raw frontier API spend by 65–82% without degrading customer outcomes.' }
    ],
    ctaHref: '/tools/batch-vs-realtime-router.html', ctaLabel: 'Build CFO Savings Waterfall →'
  },
  {
    slug: 'prompt-caching-ttl-optimization-guide',
    title: 'Prompt Caching TTL & Hit-Rate Engineering: Keeping 85%+ Warm Caches in Production',
    desc: 'Practical patterns for 5-minute vs 1-hour cache TTLs, tenant affinity routing, and avoiding silent cache-busting timestamps.',
    sections: [
      { h2: '1. Cache Write Premium vs. Read Discount Break-Even', p: 'Because cache writes cost a small premium (typically 1.25x input) while reads drop 75–90%, you break even after just 1–2 cache hits within the TTL window.' },
      { h2: '2. Sticky Tenant Routing Multiplies Hit Rates', p: 'Routing requests for the same workspace or document corpus to shared prefixes keeps caches warm continuously during business hours.' }
    ],
    ctaHref: '/', ctaLabel: 'Simulate Cache Hit Savings Live →'
  },
  {
    slug: 'open-weight-moe-hosting-tco-guide',
    title: 'Hosting Open-Weight MoE Models (Llama 4 & DeepSeek-R1) vs. Managed APIs: 2026 TCO',
    desc: 'Understanding why Mixture-of-Experts models run fast per token yet demand huge total VRAM—and where the real cloud vs GPU break-even sits.',
    sections: [
      { h2: '1. Active Parameters vs. Total VRAM Footprint', p: 'An MoE model like DeepSeek-R1 activates only ~37B parameters per token (fast inference), yet ALL 671B weights must reside in GPU VRAM simultaneously—requiring an 8x H100/H200 node even for a single user.' },
      { h2: '2. When Managed Open-Weight Endpoints Beat Dedicated Clusters', p: 'Until sustained traffic utilizes >35% of an 8-GPU node around the clock, serverless APIs remain 5x–10x cheaper than dedicated bare-metal GPUs.' }
    ],
    ctaHref: '/tools/gpu-vram-calculator.html', ctaLabel: 'Size MoE VRAM & Monthly Cost →'
  },
  {
    slug: 'stt-tts-voice-pipeline-cost-optimization',
    title: 'Voice AI & Audio Pipeline FinOps: Cutting STT + TTS API Bills 40–75%',
    desc: 'Engineering playbook covering client-side VAD silence trimming, Groq/Deepgram vs Whisper routing, and TTS audio caching for common prompts.',
    sections: [
      { h2: '1. Strip Silence Before Calling STT APIs (25–40% Instant Savings)', p: 'Unedited customer support calls and meeting recordings contain 28% to 42% dead air. Running lightweight Silero VAD on-device or on edge workers strips silence before hitting Whisper or Deepgram, slashing billed minutes immediately.' },
      { h2: '2. Cache Repetitive TTS Phrases & Tier Expressive Voices', p: 'Greetings, confirmations, and IVR prompts account for 20–45% of spoken characters in production voice bots. Hashing static phrases to object storage and reserving ElevenLabs for high-value dialogue saves thousands monthly.' }
    ],
    ctaHref: '/tools/audio-transcription-cost.html', ctaLabel: 'Open STT & TTS Cost Calculator →'
  },
  {
    slug: 'ai-image-video-generation-agency-unit-economics',
    title: 'AI Image & Video Generation Unit Economics: Mastering Retry Multipliers & Draft Cascades',
    desc: 'Why published creative assets cost 2.5x–4x list API rates and how FLUX schnell draft-to-pro cascades cut image budgets by 60%+.',
    sections: [
      { h2: '1. The Hidden Cost Multiplier: Retries & Discarded Renders', p: 'Marketing teams and creative apps rarely publish the first generated image or video clip. Accounting for a realistic 2.5x–3.5x generation retry ratio prevents painful budget surprises on GPT-Image-1 High or Google Veo.' },
      { h2: '2. Two-Stage Draft Cascades (FLUX schnell -> Pro Final)', p: 'Generate 3–4 layout explorations on FLUX.1 schnell ($0.003/img) and invoke FLUX 1.1 Pro ($0.04) or GPT-Image-1 High ($0.167) only once the user approves the composition—cutting total studio image spend by up to 70%.' }
    ],
    ctaHref: '/tools/image-video-gen-budget.html', ctaLabel: 'Model Image & Video Studio Budget →'
  },
  {
    slug: 'vector-database-tco-pinecone-qdrant-pgvector',
    title: 'Vector Database TCO in 2026: Pinecone vs. Qdrant vs. pgvector Memory & Query Economics',
    desc: 'How embedding dimensions (1536 vs 3072), scalar/binary quantization, and HNSW RAM overhead govern your true monthly RAG infrastructure cost.',
    sections: [
      { h2: '1. Dimensionality Multiplies RAM Linearly', p: 'Storing 10M float32 vectors at 3072 dimensions consumes ~120 GB of raw vectors plus 40–60% HNSW graph overhead (~180 GB RAM). Applying Matryoshka truncation (1024 dims) or int8 scalar quantization shrinks memory footprint 4x–8x.' },
      { h2: '2. When pgvector Beats Dedicated Vector Clouds', p: 'Under 5M vectors with moderate QPS, co-locating pgvector (HNSW + halfvec) inside your existing PostgreSQL database eliminates cross-service latency and saves $200–$1,200/month in idle vector pods.' }
    ],
    ctaHref: '/tools/rag-calculator.html', ctaLabel: 'Calculate RAG & Vector DB TCO →'
  },
  {
    slug: 'llm-observability-evaluation-cost-budget',
    title: 'LLM-as-a-Judge & Eval Suite Cost Control: Avoiding Hidden QA Token Bills',
    desc: 'How to size continuous eval pipelines, use mini/flash judges for 90% of rubric checks, and run nightly regression suites on 50% Batch APIs.',
    sections: [
      { h2: '1. Why Naive Frontier Judges Double Production Spend', p: 'Running GPT-5 or Claude Opus as an online judge on 100% of production traces immediately doubles your API bill. Sample 5–10% of low-risk traces and run deterministic assertions (JSON schema, regex, latency) before invoking any LLM judge.' },
      { h2: '2. Shift Nightly Golden-Set Evals to 50% Batch APIs', p: 'CI/CD regression evals across 2,000 test cases rarely need synchronous 1-second streaming. Submitting nightly eval sets via OpenAI or Anthropic Batch APIs cuts QA token budgets by 50% flat.' }
    ],
    ctaHref: '/tools/batch-vs-realtime-router.html', ctaLabel: 'Model Batch & Cascade Savings →'
  },
  {
    slug: 'ai-coding-agent-seat-vs-api-tco',
    title: 'AI Coding Agent TCO: Flat-Rate Developer Seats vs. BYOK API Token Spend',
    desc: 'Quantitative comparison for engineering VPs evaluating Claude Code, Cursor, and custom internal coding agents across 10–200 developers.',
    sections: [
      { h2: '1. Why Coding Agents Have Extreme Input-to-Output Ratios (20:1)', p: 'Autonomous coding agents repeatedly read repository trees, diffs, and test logs—making prompt caching (80–90% prefix hit rate) the single biggest factor keeping per-developer API bills under $80–$150/month.' },
      { h2: '2. Hybrid Seat + API Budgeting by Engineer Persona', p: 'Power users running multi-hour autonomous refactors save money on capped subscription tiers, while occasional users and CI bot runners are far cheaper on pay-as-you-go cached API keys.' }
    ],
    ctaHref: '/tools/agent-budget.html', ctaLabel: 'Simulate Coding Agent Token Burn →'
  },
  {
    slug: 'multi-provider-llm-failover-cost-architecture',
    title: 'Multi-Provider LLM Failover & AI Gateway Cost Architecture (2026)',
    desc: 'Designing zero-downtime OpenAI -> Anthropic -> Gemini fallback lanes without blowing up prompt cache warmness or blowing margins.',
    sections: [
      { h2: '1. Primary Sticky Routing Preserves Prompt Caches', p: 'Round-robin load balancing across two LLM providers destroys prefix cache hit rates. Route 100% of healthy traffic to a primary provider and trigger fallback lanes only on HTTP 429/529 circuit-breaker trips.' },
      { h2: '2. Aligning Fallback Model Cost Tiers', p: 'Never fail over a $0.25/1M mini workload onto a $15/1M frontier model during an outage—map every tier to a same-cost cross-vendor peer (e.g., GPT-5 mini <-> Gemini 2.5 Flash).' }
    ],
    ctaHref: '/tools/llm-rate-limit-planner.html', ctaLabel: 'Generate Failover Rate-Limit Policy →'
  },
  {
    slug: 'llm-ttft-streaming-latency-ux-guide',
    title: 'LLM Latency & TTFT Engineering: Meeting Sub-2-Second Streaming UX SLAs Without Overpaying',
    desc: 'How Time-to-First-Token (TTFT), tokens-per-second throughput, and prompt-prefix caching control perceived responsiveness in production AI apps.',
    sections: [
      { h2: '1. Separate Perceived Latency (TTFT) From Total Generation Time', p: 'Users perceive an AI chat or voice agent as responsive when the first token streams under 500–800ms. Switching from non-streaming REST waits to Server-Sent Events (SSE) immediately cuts perceived lag by 70%.' },
      { h2: '2. Matching Inference Hardware to SLA Tier', p: 'Use ultra-fast Cerebras or Groq endpoints (300–2,100 tok/s) for voice agents and autocomplete, while reserving slower deep-reasoning models (o3, DeepSeek-R1) for async background research tabs.' }
    ],
    ctaHref: '/tools/llm-latency-ttft-calculator.html', ctaLabel: 'Open LLM Latency & TTFT Calculator →'
  },
  {
    slug: 'ai-saas-credit-pricing-tier-architecture',
    title: 'How to Price AI SaaS Tiers & Credit Packs Without Losing Money on Power Users',
    desc: 'Step-by-step packaging playbook covering Stripe fee drag, worst-case COGS caps, 75–82% gross margin floors, and transparent overage packs.',
    sections: [
      { h2: '1. Never Ship "Unlimited AI" on Frontier Models Without a Margin Floor', p: 'Even 2% of heavy subscribers running continuous multi-turn agents can turn a $29/mo flat subscription deeply cash-negative. Express tier allowances in clear monthly AI credits derived directly from your target gross margin floor.' },
      { h2: '2. Price Overage Packs at Target Margin Plus Buffer', p: 'When a user exhausts included credits, offer frictionless top-up packs priced at 4x–5x raw token COGS so expansion revenue boosts net dollar retention rather than eroding margins.' }
    ],
    ctaHref: '/tools/ai-pricing-tier-designer.html', ctaLabel: 'Design Margin-Safe Pricing Tiers →'
  },
  {
    slug: 'claude-4-5-sonnet-vs-haiku-agent-routing',
    title: 'Anthropic Claude 4.5 Sonnet + Haiku Routing: Cutting Agent Spend 60% While Keeping Quality',
    desc: 'Production patterns for pairing Claude 4.5 Haiku as planner/tool-filter with Claude 4.5 Sonnet as code/synthesis engine under shared 90% prompt caches.',
    sections: [
      { h2: '1. Offload Tool Parsing & Sub-Agent Summarization to Haiku 4.5', p: 'In multi-step coding and support agents, over half of LLM calls merely classify intent, compress long logs, or validate JSON outputs—tasks where Claude 4.5 Haiku runs 3x cheaper and noticeably faster than Sonnet.' },
      { h2: '2. Preserve Cache Breakpoints Across Multi-Turn Loops', p: 'Keep repository maps and tool definitions pinned above your cache breakpoint so every subsequent turn reads static context at 90% off.' }
    ],
    ctaHref: '/tools/batch-vs-realtime-router.html', ctaLabel: 'Simulate Cascade + Cache Waterfall →'
  },
  {
    slug: 'aws-bedrock-amazon-nova-finops-playbook',
    title: 'AWS Bedrock FinOps Playbook: Pairing Amazon Nova Pro With Claude Under Enterprise Commitments',
    desc: 'How AWS enterprise teams cut Bedrock monthly bills 50–70% using Nova Pro for routine extraction, prompt caching, and batch inference jobs.',
    sections: [
      { h2: '1. Right-Sizing Between Nova Pro ($0.80/$3.20) and Claude Sonnet ($3/$15)', p: 'Routing document classification, structured JSON extraction, and internal Q&A to Amazon Nova Pro immediately reduces AWS Bedrock token spend by 73% while remaining 100% inside IAM/VPC governance.' },
      { h2: '2. Avoiding Provisioned Throughput Over-Commitment', p: 'Only purchase Provisioned Throughput once sustained 24/7 utilization exceeds 60%; bursty daytime B2B traffic almost always costs less on On-Demand + Batch.' }
    ],
    ctaHref: '/compare/amazon-nova-pro-vs-claude-sonnet-4-5.html', ctaLabel: 'Compare Nova Pro vs Claude 4.5 →'
  },
  {
    slug: 'reasoning-model-token-budget-o3-deepseek-r1',
    title: 'Controlling Hidden Reasoning Tokens on OpenAI o3-pro & DeepSeek-R1',
    desc: 'Why invisible chain-of-thought output tokens inflate reasoning model bills 4x–10x and how reasoning_effort caps keep latency and spend predictable.',
    sections: [
      { h2: '1. Invisible Thinking Tokens Bill at Full Output Rates', p: 'A 300-word final answer from a reasoning model can silently consume 4,000–12,000 internal thinking tokens billed at full output rates ($8–$80/1M). Always monitor reasoning_tokens separately in telemetry.' },
      { h2: '2. Gate Reasoning Models Behind Complexity Classifiers', p: 'Reserve o3 and o3-pro strictly for hard architectural, mathematical, or legal synthesis—never for simple greetings, formatting, or schema lookups.' }
    ],
    ctaHref: '/tools/agent-budget.html', ctaLabel: 'Model Multi-Turn Reasoning Burn →'
  },
  {
    slug: 'qwen-3-open-weight-moe-finops-guide',
    title: 'Qwen 3 235B MoE & DeepSeek-V3.1: Open-Weight Economics for High-Volume Global Apps',
    desc: 'Why sparse Mixture-of-Experts open weights deliver near-frontier quality under $0.30/1M input tokens for multilingual SaaS products.',
    sections: [
      { h2: '1. Sparse Activation Unlocks Sub-Dollar Output Pricing', p: 'By activating only ~22B–37B parameters per token out of 235B–671B total weights, modern MoE architectures deliver massive quality-per-dollar breakthroughs for Asian and European multilingual workloads.' },
      { h2: '2. Serverless Hosted MoE vs. Dedicated Multi-GPU Nodes', p: 'Hosted endpoints let startups pay $0.22–$0.28/1M input with zero idle GPU burn, whereas self-hosting only makes financial sense above tens of millions of daily tokens.' }
    ],
    ctaHref: '/tools/self-host-vs-api.html', ctaLabel: 'Check GPU vs API Break-Even →'
  },
  {
    slug: 'vector-quantization-int8-binary-rag-savings',
    title: 'Scalar (INT8) & Binary Quantization in Vector Databases: Cutting RAG RAM Bills 4x–32x',
    desc: 'Engineering breakdown of how FP32 vs INT8 vs Binary vector compression lowers Pinecone, Qdrant, Weaviate, and pgvector hosting bills while keeping high recall.',
    sections: [
      { h2: '1. Why Float32 HNSW Indexes Blow Up Cloud Bills Past 5M Vectors', p: 'Every 1536-dimensional float32 vector requires 6 KB of raw memory plus ~45% HNSW graph overhead. At 20M vectors that crosses 170+ GB of RAM—costing thousands monthly on managed pods.' },
      { h2: '2. Two-Stage Binary/INT8 Search + Full-Precision Rescoring', p: 'Compressing in-memory HNSW vectors to INT8 (4x smaller) or 1-bit binary (32x smaller) and rescoring the top-100 candidates from NVMe disk preserves 97–99% recall at a fraction of the RAM bill.' }
    ],
    ctaHref: '/tools/vector-db-cost-calculator.html', ctaLabel: 'Compare Vector DB Cloud Costs →'
  },
  {
    slug: 'enterprise-ai-coding-budget-cursor-copilot-byok',
    title: 'VP Engineering Guide: Budgeting AI Coding Seats (Cursor, Copilot, Windsurf) vs. BYOK API Keys',
    desc: 'How engineering leaders model developer seat spend vs. cached BYOK Anthropic/OpenAI API keys across 10–500 engineers without surprise overages.',
    sections: [
      { h2: '1. Usage Follows a Steep Power Law Across Engineering Teams', p: 'Typically 20% of staff engineers consume 65% of AI coding tokens in long agentic refactors, while light users average under 4 sessions/day—making one-size-fits-all $100/seat plans wasteful.' },
      { h2: '2. Find Your Exact Sessions-Per-Day Break-Even Threshold', p: 'With 85% prompt caching on Claude 4.5 Sonnet, light/medium developers often cost $14–$28/month on BYOK APIs, whereas heavy autonomous coders rapidly cross $120+/month where flat seats win.' }
    ],
    ctaHref: '/tools/ai-coding-seat-vs-api.html', ctaLabel: 'Run Seat vs. BYOK Break-Even →'
  },
  {
    slug: 'llm-prompt-caching-ttl-write-premium-roi',
    title: 'Prompt Caching Write-Premium & TTL Math: When 5-Min Beats 1-Hour Extended Caching',
    desc: 'Exact break-even formulas for 1.25x 5-minute ephemeral writes, 2.0x 1-hour extended writes, and explicit storage TTL caches across real traffic cadences.',
    sections: [
      { h2: '1. Why Caching Can Increase Bills on Cold Low-Traffic Tenants', p: 'Anthropic charges a 1.25x write premium on 5-minute caches and 2.0x on 1-hour extended caches. If a tenant sends only one request every 20 minutes on a 5-minute TTL, every call pays a 25% surcharge with zero cache hits.' },
      { h2: '2. The 2-Hit & 3-Hit Break-Even Rules', p: 'With 90% read discounts, a 5-minute cache breaks even after just 2 cache hits within its TTL window, while a 1-hour extended cache breaks even at 3 hits—making extended TTL ideal for periodic agent cron jobs and sparse enterprise workspaces.' }
    ],
    ctaHref: '/tools/llm-context-caching-roi.html', ctaLabel: 'Calculate Cache TTL ROI →'
  },
  {
    slug: 'llm-as-a-judge-ci-eval-budget-architecture',
    title: 'LLM-as-a-Judge Evaluation Budgets: Sizing CI Regression Suites & Prod Trace Sampling',
    desc: 'How AI engineering teams run 500-case PR eval gates and continuous 5% production trace judging without letting evaluation API bills rival production spend.',
    sections: [
      { h2: '1. CI Eval Multiplier: Cases × Rubrics × PR Frequency', p: 'Running 500 golden test cases across 3 scoring rubrics on 80 pull requests per month executes 120,000 judge calls—costing $400+/mo on frontier judges unless batched and prompt-cached.' },
      { h2: '2. Stacking 65% Rubric Caching + 50% Async Batch + Mini Judges', p: 'Because judge rubric prompts stay identical across every test case, prefix caching plus 50%-off async batch endpoints and calibrated GPT-5 mini / Gemini 2.5 Flash judges cut monthly eval spend by 80–90%.' }
    ],
    ctaHref: '/tools/ai-eval-judge-budget.html', ctaLabel: 'Budget Your AI Eval Pipeline →'
  },
  {
    slug: 'ai-guardrail-pii-moderation-cost-architecture',
    title: 'AI Guardrail & PII Redaction Cost Architecture: Avoiding the 40% Safety Tax',
    desc: 'How enterprise AI teams size input/output moderation, prompt-injection shields, and PII redaction across OpenAI Moderation, Llama Guard 3, Azure, and AWS Bedrock.',
    sections: [
      { h2: '1. Why Unit-Priced Cloud Guardrails Can Exceed Your Base Mini LLM Bill', p: 'Scanning both 1,800-token prompts and 450-token completions on a 1,000-character unit rate ($0.38–$0.75 per 1K units) adds 9–12 units per request—quietly adding $1,500–$3,000/month on 300K requests.' },
      { h2: '2. Tiered Safety Pipelines: Regex PII + Fast Classifier + Frontier Escalation', p: 'Running local deterministic PII regex scrubbing plus a $0.05/1M open-weight safety classifier (Llama Guard 3) or free OpenAI Moderation cuts safety overhead below 2% of total AI spend.' }
    ],
    ctaHref: '/tools/ai-guardrail-moderation-cost.html', ctaLabel: 'Calculate Guardrail Overhead →'
  },
  {
    slug: 'multi-agent-swarm-orchestration-finops',
    title: 'Multi-Agent Swarm FinOps: Cutting LangGraph & CrewAI Token Burn by 75%+',
    desc: 'Why naive all-frontier multi-agent swarms burn 15x more tokens than single prompts, and how tiered Planner/Worker/Critic routing plus compact handoff state tames bills.',
    sections: [
      { h2: '1. The Multi-Agent Handoff Multiplier', p: 'A 4-worker swarm with 3 orchestration handoffs executes 19+ LLM calls per user task. Running every worker and critic on Claude Opus 4.5 or GPT-5 Pro multiplies monthly spend exponentially.' },
      { h2: '2. Frontier Planner + Flash Workers + Compact State JSON', p: 'Reserving frontier reasoning strictly for initial planning and final synthesis while assigning parallel workers to Gemini 2.5 Flash / GPT-5 mini and passing compact JSON state cuts swarm bills 70–85%.' }
    ],
    ctaHref: '/tools/multi-agent-orchestration-cost.html', ctaLabel: 'Model Multi-Agent Swarm Cost →'
  }
];

function writeFile(relPath, content) {
  const full = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
}

const ALL_URLS = [];
function registerPage(urlPath, relFile, html, priority = '0.8') {
  writeFile(relFile, html);
  ALL_URLS.push({ url: `${ORIGIN}${urlPath}`, priority });
}

// --- PAGE 1: HOME (/) ---
const homeCompareCards = COMPARISONS.map(c => `      <a class="tl-link-card" href="/compare/${c.slug}.html">
        <strong>${esc(c.title.replace(/ \(2026\)$/, ''))}</strong>
        <span>${esc(c.summary)}</span>
        <em>Open Comparison →</em>
      </a>`).join('\n');

const homeGuideCards = GUIDES.map(g => `      <a class="tl-link-card" href="/guides/${g.slug}.html">
        <strong>${esc(g.title)}</strong>
        <span>${esc(g.desc)}</span>
        <em>Read Playbook →</em>
      </a>`).join('\n');

const HOME_HREFLANGS = [
  `  <link rel="alternate" hreflang="en" href="${ORIGIN}/">`,
  `  <link rel="alternate" hreflang="ko" href="${ORIGIN}/ko/">`,
  `  <link rel="alternate" hreflang="ja" href="${ORIGIN}/ja/">`,
  `  <link rel="alternate" hreflang="de" href="${ORIGIN}/de/">`,
  `  <link rel="alternate" hreflang="fr" href="${ORIGIN}/fr/">`,
  `  <link rel="alternate" hreflang="es" href="${ORIGIN}/es/">`,
  `  <link rel="alternate" hreflang="pt" href="${ORIGIN}/pt/">`,
  `  <link rel="alternate" hreflang="zh" href="${ORIGIN}/zh/">`,
  `  <link rel="alternate" hreflang="hi" href="${ORIGIN}/hi/">`,
  `  <link rel="alternate" hreflang="id" href="${ORIGIN}/id/">`,
  `  <link rel="alternate" hreflang="tr" href="${ORIGIN}/tr/">`,
  `  <link rel="alternate" hreflang="x-default" href="${ORIGIN}/">`
].join('\n');

registerPage('/', 'index.html', renderShell({
  path: '/',
  active: 'home',
  hreflangs: HOME_HREFLANGS,
  title: 'AI & LLM API Cost Calculator (44 Models) — Prompt Caching, Batch & FinOps Studio',
  description: 'Free, 100% browser-private AI & LLM API cost calculator comparing 44 flagship models (GPT-5 Pro, GPT-4o mini, Claude 4.5/3.7/3.5, Gemini 2.5/2.0, DeepSeek-V3.1/0324, Qwen 3, Llama 4/3.3, Mistral Codestral/Medium 3, Cohere Command A, Nova Pro/Lite) with 24 FinOps workspaces.',
  scripts: ['/js/budget-card.js', '/js/studio-home.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger AI & LLM Cost Studio', applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', url: `${ORIGIN}/`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: 'Browser-private LLM API cost estimator, agent burn simulator, SaaS gross margin calculator, and RAG TCO planner.' },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Does TokenLedger send my pasted prompts to any server?', acceptedAnswer: { '@type': 'Answer', text: 'Never. All token estimation, pricing calculations, CSV/JSON exports, and minification run 100% locally inside your browser with zero network transmission of prompt text.' } },
      { '@type': 'Question', name: 'How does LLM prompt caching affect monthly API cost?', acceptedAnswer: { '@type': 'Answer', text: 'Major providers discount repeated prompt prefixes by 75% to 90%. For high-volume apps with stable system prompts or tool schemas, prompt caching often cuts total input spend by more than half.' } }
    ] }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">44 MODELS &bull; 24 WORKSPACES &bull; 100% BROWSER-PRIVATE</div>
    <h1>AI &amp; LLM API Cost Calculator &amp; FinOps Studio</h1>
    <p>Model real production spend across OpenAI GPT-5, Anthropic Claude 4, Google Gemini 2.5, DeepSeek, Llama 4, Grok 3, and Mistral — including Prompt Caching, 50% Batch discounts, Model Cascade routing, and executive CSV/PDF exports.</p>
    <div class="tl-pills">
      <span class="tl-pill">Live Token Counter</span>
      <span class="tl-pill">Prompt Caching &amp; Batch API</span>
      <span class="tl-pill">Cascade Router Savings</span>
      <span class="tl-pill">CSV / JSON / Print PDF</span>
    </div>
  </section>

  <section class="tl-grid-4" aria-label="Headline Cost Metrics">
    <div class="kpi-card"><div class="kpi-label">Lowest Monthly Cost</div><div class="kpi-val accent" id="kpiCheapest">$0.00/mo</div><div class="kpi-sub" id="kpiCheapestSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">OpenAI GPT-5</div><div class="kpi-val" id="kpiGpt5">$0.00/mo</div><div class="kpi-sub" id="kpiGpt5Sub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Claude Sonnet 4</div><div class="kpi-val" id="kpiSonnet">$0.00/mo</div><div class="kpi-sub" id="kpiSonnetSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Cascade Router Savings</div><div class="kpi-val accent" id="kpiCascadeSave">$0.00/mo</div><div class="kpi-sub" id="kpiCascadeSub">-</div></div>
  </section>

  <section class="tl-grid-2">
    <div class="tl-panel">
      <h2>1. Workload Parameters</h2>
      <div class="tl-chips" aria-label="Quick Workload Presets">
        <button type="button" class="tl-chip" data-preset="support">Support Bot (5K/d)</button>
        <button type="button" class="tl-chip" data-preset="coding">Coding Agent (18K in)</button>
        <button type="button" class="tl-chip" data-preset="rag">RAG Search (2K/d)</button>
        <button type="button" class="tl-chip" data-preset="batch">Batch ETL (15K/d)</button>
      </div>
      <div class="tl-row">
        <div class="tl-field"><label for="inTokens">Input Tokens / Request</label><input id="inTokens" class="tl-input num" type="number" min="0" step="100" value="2500"></div>
        <div class="tl-field"><label for="outTokens">Output Tokens / Request</label><input id="outTokens" class="tl-input num" type="number" min="0" step="50" value="600"></div>
      </div>
      <div class="tl-row">
        <div class="tl-field"><label for="dailyReqs">Requests / Day</label><input id="dailyReqs" class="tl-input num" type="number" min="1" step="100" value="1000"></div>
        <div class="tl-field"><label for="sortSelect">Sort Table By</label><select id="sortSelect" class="tl-select"><option value="monthly">Monthly Cost (Low → High)</option><option value="input">Input Rate ($/1M)</option><option value="context">Context Window (Largest)</option></select></div>
      </div>
      <div class="tl-field">
        <label for="cacheSlider">Prompt Cache Hit Rate <strong id="cacheVal">50%</strong></label>
        <input id="cacheSlider" class="tl-range" type="range" min="0" max="95" step="5" value="50">
      </div>
      <label class="tl-check-row"><input id="batchToggle" type="checkbox"><span>Apply 50% Async Batch API Discount (where provider supports Batch)</span></label>
      <div class="tl-btn-bar">
        <button type="button" id="btnShare" class="tl-btn tl-btn-primary">Copy Share URL</button>
        <button type="button" id="btnPngCard" class="tl-btn">Download PNG Card</button>
        <button type="button" id="btnMarkdown" class="tl-btn">Copy Markdown (PR/Notion)</button>
        <button type="button" id="btnEmbed" class="tl-btn">Copy Embed Widget</button>
        <button type="button" id="btnCsv" class="tl-btn">Export CSV</button>
        <button type="button" id="btnJson" class="tl-btn">Export JSON</button>
        <button type="button" id="btnPrint" class="tl-btn">Print / PDF</button>
      </div>
    </div>

    <div class="tl-panel">
      <h2>2. Live Prompt Token Estimator &amp; Model Cascade</h2>
      <div class="tl-field">
        <label for="livePrompt">Optional: Paste prompt to auto-fill input tokens (stays 100% local)</label>
        <textarea id="livePrompt" class="tl-textarea" placeholder="Paste system prompt, JSON tool schema, or user query here..."></textarea>
        <div id="promptStats" class="kpi-sub num" style="margin-top:6px">0 OpenAI tok · 0 Claude tok · 0 Gemini tok</div>
      </div>
      <hr style="border:0;border-top:1px solid var(--line);margin:14px 0">
      <h3>Model Cascade / Router Savings Simulator</h3>
      <div class="tl-row">
        <div class="tl-field"><label for="cascadeFrontier">Primary / Frontier Model</label><select id="cascadeFrontier" class="tl-select"></select></div>
        <div class="tl-field"><label for="cascadeMini">Routed Fast / Mini Model</label><select id="cascadeMini" class="tl-select"></select></div>
      </div>
      <div class="tl-field">
        <label for="offloadSlider">Traffic Routed to Fast/Mini Tier <strong id="offloadVal">70%</strong></label>
        <input id="offloadSlider" class="tl-range" type="range" min="0" max="95" step="5" value="70">
      </div>
      <div id="cascadeOut" class="kpi-sub num" style="padding:10px 12px;border-radius:10px;background:var(--accent-soft);color:var(--text);font-weight:600"></div>
    </div>
  </section>

  <section class="tl-panel" style="margin-bottom:24px">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px">
      <h2 style="margin:0">3. 44-Model Side-by-Side Cost Matrix</h2>
      <div id="spreadSummary" class="kpi-sub num" style="margin:0"></div>
    </div>
    <div class="tl-chips" aria-label="Filter by Provider">
      <button type="button" class="tl-chip active" data-provider="all">All Providers (44)</button>
      <button type="button" class="tl-chip" data-provider="OpenAI">OpenAI</button>
      <button type="button" class="tl-chip" data-provider="Anthropic">Anthropic</button>
      <button type="button" class="tl-chip" data-provider="Google">Google</button>
      <button type="button" class="tl-chip" data-provider="DeepSeek">DeepSeek</button>
      <button type="button" class="tl-chip" data-provider="xAI">xAI</button>
      <button type="button" class="tl-chip" data-provider="Meta">Meta</button>
      <button type="button" class="tl-chip" data-provider="Mistral">Mistral</button>
    </div>
    <div class="tl-table-wrap">
      <table class="tl-table">
        <thead><tr><th>Model &amp; Context</th><th>Tier</th><th>In / Out (1M)</th><th>Per Request</th><th>Monthly (30d)</th><th>Annual (365d)</th><th>Relative Cost</th></tr></thead>
        <tbody id="modelTableBody"></tbody>
      </table>
    </div>
  </section>

  <section style="margin-bottom:28px">
    <h2 style="margin:0 0 12px">Specialized AI FinOps Workspaces</h2>
    <div class="tl-card-grid">
      <a class="tl-link-card" href="/tools/agent-budget.html"><strong>AI Agent Loop Burn Calculator</strong><span>Visualize O(N²) multi-turn context snowballing vs. prompt caching &amp; sliding windows.</span><em>Open Calculator →</em></a>
      <a class="tl-link-card" href="/tools/mcp-schema-auditor.html"><strong>MCP &amp; Tool Schema Tax Auditor</strong><span>Audit hidden upfront token bloat across connected MCP servers + JSON schema ranker.</span><em>Audit MCP Tax →</em></a>
      <a class="tl-link-card" href="/tools/saas-margin.html"><strong>AI SaaS Gross Margin Simulator</strong><span>Calculate per-seat AI COGS, Stripe fees, net profit, and power-user break-even caps.</span><em>Open Simulator →</em></a>
      <a class="tl-link-card" href="/tools/rag-calculator.html"><strong>RAG &amp; Vector DB TCO Planner</strong><span>Estimate embedding ingestion, HNSW RAM footprint, re-index churn, and synthesis cost.</span><em>Open Planner →</em></a>
      <a class="tl-link-card" href="/tools/self-host-vs-api.html"><strong>Self-Hosted GPU vs Cloud API</strong><span>Calculate exact daily request break-even for H100/A100/L40S/4090 vLLM vs cloud APIs.</span><em>Compare GPU vs API →</em></a>
      <a class="tl-link-card" href="/tools/multimodal-budget.html"><strong>Voice, Vision &amp; Image Cost Studio</strong><span>Estimate PDF/image vision tokens, OpenAI Realtime vs Gemini Live voice, and Imagen/Flux.</span><em>Open Studio →</em></a>
      <a class="tl-link-card" href="/tools/ai-runway.html"><strong>AI Startup Burn &amp; Runway Planner</strong><span>Model LLM spend scaling with MRR, cloud infra, payroll, and exact Default-Alive month.</span><em>Model Runway →</em></a>
      <a class="tl-link-card" href="/tools/prompt-diff.html"><strong>Prompt A/B Compression Cost Diff</strong><span>Compare before vs. after system prompts and copy PR-ready annual USD savings tables + CI Action.</span><em>Run Prompt Diff →</em></a>
      <a class="tl-link-card" href="/tools/fine-tune-vs-rag.html"><strong>Fine-Tuning vs. RAG vs. Caching TCO</strong><span>Compare 12-month LoRA training refreshes, vector DB RAG, and long-context caching + ADR export.</span><em>Compare Architectures →</em></a>
      <a class="tl-link-card" href="/tools/llm-rate-limit-planner.html"><strong>LLM Rate-Limit (RPM/TPM) Planner</strong><span>Calculate peak TPM, Little’s Law concurrency, vendor tier needed, and export rate-limiter JSON.</span><em>Plan Capacity →</em></a>
      <a class="tl-link-card" href="/tools/gpu-vram-calculator.html"><strong>GPU VRAM &amp; KV-Cache Quantization</strong><span>Size FP16/FP8/Q4_K_M weights + GQA KV-cache for Llama 70B, Qwen 32B &amp; DeepSeek-R1 + hardware cost.</span><em>Size GPU VRAM →</em></a>
      <a class="tl-link-card" href="/tools/batch-vs-realtime-router.html"><strong>CFO Hybrid FinOps Waterfall Simulator</strong><span>Stack Prompt Caching + Mini Cascade + 50% Async Batch lanes and export an executive memo.</span><em>Model Savings →</em></a>
      <a class="tl-link-card" href="/tools/audio-transcription-cost.html"><strong>STT &amp; TTS Audio API Cost Calculator</strong><span>Compare Whisper, Deepgram Nova-3, Groq, ElevenLabs &amp; Cartesia with VAD silence trimming.</span><em>Price Audio Pipeline →</em></a>
      <a class="tl-link-card" href="/tools/image-video-gen-budget.html"><strong>AI Image &amp; Video Gen Studio Budget</strong><span>Estimate FLUX, GPT-Image-1, Imagen 3, Veo, Runway &amp; Sora with retry &amp; draft-cascade math.</span><em>Size Creative Budget →</em></a>
      <a class="tl-link-card" href="/tools/llm-latency-ttft-calculator.html"><strong>LLM Latency, TTFT &amp; Speed Calculator</strong><span>Compare Cerebras, Groq, Fireworks, Gemini, GPT-5 &amp; Claude 4.5 streaming UX against your SLA.</span><em>Benchmark Speed →</em></a>
      <a class="tl-link-card" href="/tools/ai-pricing-tier-designer.html"><strong>AI SaaS Pricing Tier &amp; Credit Architect</strong><span>Generate Free/Pro/Team/Enterprise credit caps &amp; Stripe JSON with hard gross-margin floors.</span><em>Design Tiers →</em></a>
      <a class="tl-link-card" href="/tools/vector-db-cost-calculator.html"><strong>Vector DB Cloud Cost Comparator</strong><span>Compare Pinecone, Qdrant, pgvector, Weaviate &amp; Turbopuffer across FP32/INT8/Binary quantization.</span><em>Compare Vector DBs →</em></a>
      <a class="tl-link-card" href="/tools/ai-coding-seat-vs-api.html"><strong>AI Coding Seat vs. BYOK API Calculator</strong><span>Benchmark Cursor, GitHub Copilot, Windsurf &amp; Claude Max seats vs cached BYOK token spend.</span><em>Compare Seats vs API →</em></a>
      <a class="tl-link-card" href="/tools/llm-context-caching-roi.html"><strong>Prompt Caching TTL &amp; Write-Premium ROI</strong><span>Compare 5-min ephemeral (1.25x) vs 1-hour extended (2.0x) vs explicit storage cache break-even hits.</span><em>Model Cache TTL →</em></a>
      <a class="tl-link-card" href="/tools/ai-eval-judge-budget.html"><strong>LLM-as-a-Judge &amp; CI Eval Budget</strong><span>Size monthly CI regression suites and prod trace sampling across 6 judge models with 50% Batch.</span><em>Budget AI Evals →</em></a>
      <a class="tl-link-card" href="/tools/ai-guardrail-moderation-cost.html"><strong>AI Guardrail, PII &amp; Moderation Cost</strong><span>Compare AWS Bedrock Guardrails, Azure Content Safety, Llama Guard 3 &amp; OpenAI Moderation overhead %.</span><em>Price Guardrails →</em></a>
      <a class="tl-link-card" href="/tools/multi-agent-orchestration-cost.html"><strong>Multi-Agent Swarm Cost Calculator</strong><span>Model LangGraph/CrewAI Planner + Flash Workers + Critic handoffs vs. all-frontier orchestration.</span><em>Model Swarm Cost →</em></a>
      <a class="tl-link-card" href="/tools/token-inspector.html"><strong>Context &amp; JSON Minifier Inspector</strong><span>Inspect OpenAI/Claude/Gemini tokens and minify tool JSON schemas for instant savings.</span><em>Open Inspector →</em></a>
    </div>
    <div class="tl-pills" style="margin-top:14px">
      <a class="tl-pill" href="/ko/" style="text-decoration:none;color:var(--accent)">한국어</a>
      <a class="tl-pill" href="/ja/" style="text-decoration:none;color:var(--accent)">日本語</a>
      <a class="tl-pill" href="/de/" style="text-decoration:none;color:var(--accent)">Deutsch</a>
      <a class="tl-pill" href="/fr/" style="text-decoration:none;color:var(--accent)">Français</a>
      <a class="tl-pill" href="/es/" style="text-decoration:none;color:var(--accent)">Español</a>
      <a class="tl-pill" href="/pt/" style="text-decoration:none;color:var(--accent)">Português</a>
      <a class="tl-pill" href="/zh/" style="text-decoration:none;color:var(--accent)">中文</a>
      <a class="tl-pill" href="/hi/" style="text-decoration:none;color:var(--accent)">हिन्दी</a>
      <a class="tl-pill" href="/id/" style="text-decoration:none;color:var(--accent)">Indonesia</a>
      <a class="tl-pill" href="/tr/" style="text-decoration:none;color:var(--accent)">Türkçe</a>
    </div>
  </section>

  <section style="margin-bottom:28px">
    <h2 style="margin:0 0 12px">Popular Model Pricing Comparisons</h2>
    <div class="tl-card-grid">
${homeCompareCards}
    </div>
  </section>

  <section style="margin-bottom:28px">
    <h2 style="margin:0 0 12px">AI FinOps Engineering Playbooks</h2>
    <div class="tl-card-grid">
${homeGuideCards}
    </div>
  </section>

  <section class="tl-prose">
    <h2>Frequently Asked Questions</h2>
    <div class="tl-faq-grid">
      <div class="tl-faq-item"><h3>Does TokenLedger send my pasted prompts to any server?</h3><p>Never. All token estimation, pricing calculations, CSV/JSON exports, and JSON minification run 100% locally inside your browser with zero network transmission of prompt text.</p></div>
      <div class="tl-faq-item"><h3>How does LLM prompt caching affect monthly API cost?</h3><p>Major providers discount repeated prompt prefixes by 75% to 90%. For high-volume apps with stable system prompts or tool schemas, prompt caching often cuts total input spend by more than half.</p></div>
    </div>
  </section>`
}), '1.0');

// --- PAGE 2: AGENT LOOP BURN CALCULATOR ---
registerPage('/tools/agent-budget.html', 'tools/agent-budget.html', renderShell({
  path: '/tools/agent-budget.html',
  active: 'agent',
  title: 'AI Agent Loop & Multi-Turn Token Snowball Burn Calculator',
  description: 'Model quadratic O(N²) context accumulation in multi-turn AI coding and research agents. Compare naive history vs. prompt caching and sliding-window summarization.',
  scripts: ['/js/agent-budget.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger AI Agent Burn Calculator', applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', url: `${ORIGIN}/tools/agent-budget.html`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Why do multi-turn AI agents cost dramatically more than single-turn chat?', acceptedAnswer: { '@type': 'Answer', text: 'Each agent turn re-sends the full growing history of prior assistant responses and tool outputs, causing input tokens to scale quadratically with turn count.' } }
    ] }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">MULTI-TURN FINOPS &bull; QUADRATIC CONTEXT CURVE</div>
    <h1>AI Agent Loop &amp; Tool-Call Burn Calculator</h1>
    <p>See why a 15-turn coding or research agent quietly burns 10x+ more tokens than a single prompt — and compare Naive Full-History vs. Prompt Caching vs. Sliding-Window Summarization turn by turn.</p>
  </section>

  <section class="tl-grid-4">
    <div class="kpi-card"><div class="kpi-label">Naive Full History</div><div class="kpi-val danger" id="kpiNaive">$0/mo</div><div class="kpi-sub" id="kpiNaiveSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">With Prompt Caching</div><div class="kpi-val accent" id="kpiCached">$0/mo</div><div class="kpi-sub" id="kpiCachedSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Sliding Window + Cache</div><div class="kpi-val accent" id="kpiWindow">$0/mo</div><div class="kpi-sub" id="kpiWindowSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Snowball Multiplier</div><div class="kpi-val warn" id="kpiMult">1.0x</div><div class="kpi-sub" id="kpiMultSub">-</div></div>
  </section>

  <section class="tl-grid-2">
    <div class="tl-panel">
      <h2>Agent Loop Parameters</h2>
      <div class="tl-field"><label for="agentModel">Agent Model</label><select id="agentModel" class="tl-select"></select></div>
      <div class="tl-field"><label for="agentTurns">Turns per Agent Run <strong id="turnsVal">14 turns</strong></label><input id="agentTurns" class="tl-range" type="range" min="2" max="40" step="1" value="14"></div>
      <div class="tl-row">
        <div class="tl-field"><label for="sysTokens">System + Tool Schema (tok)</label><input id="sysTokens" class="tl-input num" type="number" min="100" step="200" value="3200"></div>
        <div class="tl-field"><label for="toolGrowth">Tool Output / Turn (tok)</label><input id="toolGrowth" class="tl-input num" type="number" min="50" step="100" value="1400"></div>
      </div>
      <div class="tl-row">
        <div class="tl-field"><label for="outPerTurn">Model Output / Turn (tok)</label><input id="outPerTurn" class="tl-input num" type="number" min="50" step="50" value="450"></div>
        <div class="tl-field"><label for="runsPerDay">Agent Runs / Day</label><input id="runsPerDay" class="tl-input num" type="number" min="1" step="50" value="300"></div>
      </div>
      <div class="tl-field"><label for="agentCache">Prefix Cache Hit Rate <strong id="cacheVal">85%</strong></label><input id="agentCache" class="tl-range" type="range" min="0" max="95" step="5" value="85"></div>
      <div class="tl-field"><label for="winTurns">Sliding Window Size <strong id="winVal">5 turns</strong></label><input id="winTurns" class="tl-range" type="range" min="2" max="15" step="1" value="5"></div>
      <div class="tl-btn-bar"><button type="button" id="btnExportAgent" class="tl-btn tl-btn-primary">Export Turn-by-Turn CSV</button></div>
    </div>

    <div class="tl-panel">
      <h2>Turn-by-Turn Cost Accumulation (Red: Naive · Green: Cached)</h2>
      <div id="turnChart" class="tl-chart"></div>
    </div>
  </section>

  <section class="tl-prose">
    <h2>Frequently Asked Questions</h2>
    <div class="tl-faq-grid">
      <div class="tl-faq-item"><h3>Why do multi-turn AI agents cost dramatically more than single-turn chat?</h3><p>Each agent turn re-sends the full growing history of prior assistant responses and tool outputs, causing input tokens to scale quadratically with turn count.</p></div>
    </div>
  </section>`
}), '0.9');

// --- PAGE 3: AI SAAS GROSS MARGIN SIMULATOR ---
registerPage('/tools/saas-margin.html', 'tools/saas-margin.html', renderShell({
  path: '/tools/saas-margin.html',
  active: 'saas',
  title: 'AI SaaS Unit Economics, Gross Margin & Power-User Cap Simulator',
  description: 'Calculate AI SaaS gross margin %, per-seat LLM COGS, Stripe payment fees, 1,000-seat net profit, and exact break-even request caps per subscriber.',
  scripts: ['/js/saas-margin.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger AI SaaS Margin Simulator', applicationCategory: 'BusinessApplication', operatingSystem: 'Any', url: `${ORIGIN}/tools/saas-margin.html`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'What is a healthy gross margin target for an AI SaaS product?', acceptedAnswer: { '@type': 'Answer', text: 'Most software investors and founders target 70% to 80%+ gross margin after LLM token COGS, payment processing fees, and cloud infrastructure.' } }
    ] }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">FOUNDER UNIT ECONOMICS &bull; PRICING &amp; MARGIN GUARDRAILS</div>
    <h1>AI SaaS Gross Margin &amp; Break-Even Simulator</h1>
    <p>Stress-test your subscription price against real per-seat LLM COGS, payment processing fees, and heavy power users — plus find the exact request cap where a flat-rate seat turns negative.</p>
  </section>

  <section class="tl-grid-4">
    <div class="kpi-card"><div class="kpi-label">Gross Margin</div><div class="kpi-val accent" id="kpiMargin">0%</div><div class="kpi-sub" id="kpiMarginSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">AI COGS / Seat</div><div class="kpi-val" id="kpiCogs">$0</div><div class="kpi-sub" id="kpiCogsSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Monthly Gross Profit</div><div class="kpi-val accent" id="kpiProfit">$0/mo</div><div class="kpi-sub" id="kpiProfitSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Break-Even Cap / Seat</div><div class="kpi-val warn" id="kpiCap">0 reqs</div><div class="kpi-sub" id="kpiCapSub">-</div></div>
  </section>

  <section class="tl-grid-2">
    <div class="tl-panel">
      <h2>Subscription &amp; Usage Model</h2>
      <div class="tl-field"><label for="saasModel">Primary LLM Model</label><select id="saasModel" class="tl-select"></select></div>
      <div class="tl-row">
        <div class="tl-field"><label for="saasPrice">Monthly Plan Price ($ USD)</label><input id="saasPrice" class="tl-input num" type="number" min="1" step="1" value="29"></div>
        <div class="tl-field"><label for="saasSeats">Active Paying Seats</label><input id="saasSeats" class="tl-input num" type="number" min="1" step="50" value="500"></div>
      </div>
      <div class="tl-row">
        <div class="tl-field"><label for="saasReqs">Avg Requests / Seat / Month</label><input id="saasReqs" class="tl-input num" type="number" min="1" step="25" value="250"></div>
        <div class="tl-field"><label for="saasInfra">Fixed Hosting / Seat ($)</label><input id="saasInfra" class="tl-input num" type="number" min="0" step="0.05" value="0.45"></div>
      </div>
      <div class="tl-row">
        <div class="tl-field"><label for="saasIn">Avg Input Tokens / Req</label><input id="saasIn" class="tl-input num" type="number" min="50" step="100" value="2800"></div>
        <div class="tl-field"><label for="saasOut">Avg Output Tokens / Req</label><input id="saasOut" class="tl-input num" type="number" min="20" step="50" value="650"></div>
      </div>
      <div class="tl-field"><label for="saasCache">Prompt Cache Hit Rate <strong id="saasCacheVal">60%</strong></label><input id="saasCache" class="tl-range" type="range" min="0" max="95" step="5" value="60"></div>
      <div class="tl-btn-bar">
        <button type="button" id="btnSaasJson" class="tl-btn tl-btn-primary">Export Unit Economics JSON</button>
        <button type="button" id="btnSaasPrint" class="tl-btn">Print CFO Summary PDF</button>
      </div>
    </div>

    <div class="tl-panel">
      <h2>Gross Margin Sensitivity Across Flagship Models</h2>
      <div class="tl-table-wrap">
        <table class="tl-table" style="min-width:480px">
          <thead><tr><th>Model</th><th>AI COGS/Seat</th><th>Gross Margin</th><th>Break-Even Cap</th><th>Net Profit</th></tr></thead>
          <tbody id="saasCompareBody"></tbody>
        </table>
      </div>
    </div>
  </section>

  <section class="tl-prose">
    <h2>Frequently Asked Questions</h2>
    <div class="tl-faq-grid">
      <div class="tl-faq-item"><h3>What is a healthy gross margin target for an AI SaaS product?</h3><p>Most software investors and founders target 70% to 80%+ gross margin after LLM token COGS, payment processing fees, and cloud infrastructure.</p></div>
    </div>
  </section>`
}), '0.9');

// --- PAGE 4: RAG & VECTOR EMBEDDING TCO PLANNER ---
registerPage('/tools/rag-calculator.html', 'tools/rag-calculator.html', renderShell({
  path: '/tools/rag-calculator.html',
  active: 'rag',
  title: 'RAG & Vector Database Cost Calculator (Embeddings + HNSW RAM + Synthesis)',
  description: 'Calculate total cost of ownership for Retrieval-Augmented Generation (RAG): one-time embedding ingestion, monthly re-indexing, HNSW vector RAM, and synthesis LLM spend.',
  scripts: ['/js/rag-calculator.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger RAG TCO Planner', applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', url: `${ORIGIN}/tools/rag-calculator.html`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Which layer dominates monthly RAG infrastructure spend?', acceptedAnswer: { '@type': 'Answer', text: 'For active knowledge apps, LLM answer synthesis across Top-K retrieved chunks typically accounts for 75% to 95% of monthly spend, far exceeding embedding generation costs.' } }
    ] }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">RETRIEVAL ARCHITECTURE &bull; FULL-STACK RAG TCO</div>
    <h1>RAG &amp; Vector Embedding Cost Planner</h1>
    <p>Size your end-to-end RAG budget in seconds — combining initial corpus embedding, monthly re-index churn, HNSW vector RAM sizing, and Top-K synthesis LLM tokens.</p>
  </section>

  <section class="tl-grid-4">
    <div class="kpi-card"><div class="kpi-label">One-Time Ingestion</div><div class="kpi-val" id="kpiIngest">$0</div><div class="kpi-sub" id="kpiIngestSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Est. Vector DB / Mo</div><div class="kpi-val" id="kpiVector">$0/mo</div><div class="kpi-sub" id="kpiVectorSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">LLM Synthesis / Mo</div><div class="kpi-val warn" id="kpiSynth">$0/mo</div><div class="kpi-sub" id="kpiSynthSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Total Monthly RAG TCO</div><div class="kpi-val accent" id="kpiRagTotal">$0/mo</div><div class="kpi-sub" id="kpiRagTotalSub">-</div></div>
  </section>

  <section class="tl-panel">
    <h2>Corpus, Chunking &amp; Retrieval Parameters</h2>
    <div class="tl-row">
      <div class="tl-field"><label for="ragEmbed">Embedding Model</label><select id="ragEmbed" class="tl-select"></select></div>
      <div class="tl-field"><label for="ragLlm">Synthesis LLM Model</label><select id="ragLlm" class="tl-select"></select></div>
    </div>
    <div class="tl-row">
      <div class="tl-field"><label for="ragDocs">Total Documents</label><input id="ragDocs" class="tl-input num" type="number" min="10" step="1000" value="25000"></div>
      <div class="tl-field"><label for="ragTokDoc">Avg Tokens / Document</label><input id="ragTokDoc" class="tl-input num" type="number" min="50" step="100" value="1500"></div>
    </div>
    <div class="tl-row">
      <div class="tl-field"><label for="ragChunk">Chunk Size (tokens)</label><input id="ragChunk" class="tl-input num" type="number" min="128" step="64" value="512"></div>
      <div class="tl-field"><label for="ragQueries">Daily Retrieval Queries</label><input id="ragQueries" class="tl-input num" type="number" min="1" step="100" value="3000"></div>
    </div>
    <div class="tl-row">
      <div class="tl-field"><label for="ragOverlap">Chunk Overlap <strong id="ragOverlapVal">15%</strong></label><input id="ragOverlap" class="tl-range" type="range" min="0" max="40" step="5" value="15"></div>
      <div class="tl-field"><label for="ragChurn">Monthly Doc Re-Index Churn <strong id="ragChurnVal">12%</strong></label><input id="ragChurn" class="tl-range" type="range" min="0" max="100" step="2" value="12"></div>
    </div>
    <div class="tl-row">
      <div class="tl-field"><label for="ragTopK">Retrieved Chunks (Top-K) <strong id="ragTopKVal">Top-6</strong></label><input id="ragTopK" class="tl-range" type="range" min="1" max="20" step="1" value="6"></div>
      <div class="tl-field"><label for="ragOut">Avg Answer Output (tok)</label><input id="ragOut" class="tl-input num" type="number" min="50" step="50" value="500"></div>
    </div>
    <div class="tl-btn-bar"><button type="button" id="btnRagExport" class="tl-btn tl-btn-primary">Export RAG TCO JSON</button></div>
  </section>

  <section class="tl-prose">
    <h2>Frequently Asked Questions</h2>
    <div class="tl-faq-grid">
      <div class="tl-faq-item"><h3>Which layer dominates monthly RAG infrastructure spend?</h3><p>For active knowledge apps, LLM answer synthesis across Top-K retrieved chunks typically accounts for 75% to 95% of monthly spend, far exceeding embedding generation costs.</p></div>
    </div>
  </section>`
}), '0.9');

// --- PAGE 5: CONTEXT WINDOW & JSON MINIFIER TOKEN INSPECTOR ---
registerPage('/tools/token-inspector.html', 'tools/token-inspector.html', renderShell({
  path: '/tools/token-inspector.html',
  active: 'inspector',
  title: 'LLM Token Counter, Context Window Gauge & JSON Schema Minifier',
  description: 'Browser-private token estimator for OpenAI, Claude, and Gemini with 128K/200K/1M context fill bars and one-click JSON schema minification savings.',
  scripts: ['/js/token-inspector.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger Token & JSON Inspector', applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', url: `${ORIGIN}/tools/token-inspector.html`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Does minifying JSON tool schemas reduce LLM API costs?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Stripping pretty-printed indentation and redundant whitespace from JSON tool definitions typically trims 15% to 35% of schema tokens on every single API request.' } }
    ] }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">TOKEN DIAGNOSTICS &bull; ZERO UPLOAD &bull; JSON MINIFIER</div>
    <h1>Context Window &amp; Prompt Token Inspector</h1>
    <p>Inspect multi-family token estimates (OpenAI, Claude, Gemini), check context fill gauges across 128K / 200K / 1M windows, and minify bloated JSON tool schemas locally in one click.</p>
  </section>

  <section class="tl-grid-4">
    <div class="kpi-card"><div class="kpi-label">OpenAI Est. Tokens</div><div class="kpi-val accent" id="kpiTokOpenAI">0</div><div class="kpi-sub">o200k_base calibrated</div></div>
    <div class="kpi-card"><div class="kpi-label">Claude Est. Tokens</div><div class="kpi-val" id="kpiTokClaude">0</div><div class="kpi-sub">Anthropic BPE calibrated</div></div>
    <div class="kpi-card"><div class="kpi-label">Gemini Est. Tokens</div><div class="kpi-val" id="kpiTokGemini">0</div><div class="kpi-sub">SentencePiece calibrated</div></div>
    <div class="kpi-card"><div class="kpi-label">Characters</div><div class="kpi-val" id="kpiChars">0</div><div class="kpi-sub" id="kpiCharsSub">0 words · 0 lines</div></div>
  </section>

  <section class="tl-panel" style="margin-bottom:20px">
    <h2>Paste Prompt, Code, or JSON Tool Schema (100% Local)</h2>
    <textarea id="inspectorInput" class="tl-textarea" style="min-height:190px" placeholder="Paste any prompt, system instruction, markdown doc, or JSON schema here..."></textarea>
    <div id="minifySavings" hidden style="margin-top:10px;padding:10px 14px;border-radius:10px;background:var(--accent-soft);color:var(--accent);font-weight:700;font-size:0.88rem"></div>
    <div class="tl-btn-bar">
      <button type="button" id="btnMinifyJson" class="tl-btn tl-btn-primary">Minify JSON Schema</button>
      <button type="button" id="btnTrimWs" class="tl-btn">Compress Whitespace</button>
      <button type="button" id="btnSampleJson" class="tl-btn">Load Sample Tool JSON</button>
      <button type="button" id="btnCopyClean" class="tl-btn">Copy Cleaned Text</button>
    </div>
  </section>

  <section class="tl-panel">
    <h2>Context Window Fill Gauges</h2>
    <div class="tl-grid-3" style="margin-bottom:0">
      <div><div class="kpi-label">128K Window (DeepSeek / Mistral) — <span id="lbl128k" class="num">0.00%</span></div><div class="tl-bar-track" style="max-width:none;height:12px"><div id="bar128k" class="tl-bar-fill" style="width:0%"></div></div></div>
      <div><div class="kpi-label">200K Window (Claude 4 / o3) — <span id="lbl200k" class="num">0.00%</span></div><div class="tl-bar-track" style="max-width:none;height:12px"><div id="bar200k" class="tl-bar-fill" style="width:0%"></div></div></div>
      <div><div class="kpi-label">1M Window (Gemini 2.5 / GPT-4.1) — <span id="lbl1m" class="num">0.00%</span></div><div class="tl-bar-track" style="max-width:none;height:12px"><div id="bar1m" class="tl-bar-fill" style="width:0%"></div></div></div>
    </div>
  </section>

  <section class="tl-prose">
    <h2>Frequently Asked Questions</h2>
    <div class="tl-faq-grid">
      <div class="tl-faq-item"><h3>Does minifying JSON tool schemas reduce LLM API costs?</h3><p>Yes. Stripping pretty-printed indentation and redundant whitespace from JSON tool definitions typically trims 15% to 35% of schema tokens on every single API request.</p></div>
    </div>
  </section>`
}), '0.9');

// --- PAGE 6: SELF-HOSTED GPU (vLLM) VS CLOUD API BREAK-EVEN CALCULATOR ---
registerPage('/tools/self-host-vs-api.html', 'tools/self-host-vs-api.html', renderShell({
  path: '/tools/self-host-vs-api.html',
  active: 'selfhost',
  title: 'Self-Hosted GPU (H100/A100/L40S/4090) vs Cloud LLM API Break-Even Calculator',
  description: 'Calculate the exact daily request volume where self-hosting open-weight LLMs (Llama 4, DeepSeek, Qwen via vLLM) beats paying per token on OpenAI, Anthropic, or Gemini.',
  scripts: ['/js/self-host-vs-api.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger Self-Hosted GPU vs Cloud API Calculator', applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', url: `${ORIGIN}/tools/self-host-vs-api.html`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'When is self-hosting an H100 GPU cheaper than using a Cloud LLM API?', acceptedAnswer: { '@type': 'Answer', text: 'Self-hosting typically breaks even once steady daily request volume exceeds several thousand requests per day (often 3,000–15,000+ depending on output length and prompt caching) and GPU utilization stays above 25–35%.' } }
    ] }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">INFRASTRUCTURE FINOPS &bull; VLLM / GPU VS CLOUD API</div>
    <h1>Self-Hosted GPU vs. Cloud LLM API Break-Even Calculator</h1>
    <p>Compare dedicated GPU hosting (RTX 4090, L40S, A100, H100 nodes + DevOps overhead) against pay-per-token cloud APIs — and find your exact daily break-even request threshold.</p>
  </section>

  <section class="tl-grid-4">
    <div class="kpi-card"><div class="kpi-label">Self-Hosted Total</div><div class="kpi-val" id="kpiSelfHost">$0/mo</div><div class="kpi-sub" id="kpiSelfHostSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Cloud API Total</div><div class="kpi-val" id="kpiCloudApi">$0/mo</div><div class="kpi-sub" id="kpiCloudApiSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Break-Even Volume</div><div class="kpi-val warn" id="kpiBreakEven">0/day</div><div class="kpi-sub" id="kpiBreakEvenSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">FinOps Verdict</div><div class="kpi-val accent" id="kpiVerdict">-</div><div class="kpi-sub" id="kpiVerdictSub">-</div></div>
  </section>

  <section class="tl-grid-2">
    <div class="tl-panel">
      <h2>GPU Cluster &amp; Ops Overhead</h2>
      <div class="tl-field"><label for="shGpuPreset">GPU Preset</label><select id="shGpuPreset" class="tl-select"></select></div>
      <div class="tl-row">
        <div class="tl-field"><label for="shHourly">GPU Rental Rate ($/hr)</label><input id="shHourly" class="tl-input num" type="number" min="0.05" step="0.05" value="2.85"></div>
        <div class="tl-field"><label for="shHours">Active Hours / Day</label><input id="shHours" class="tl-input num" type="number" min="1" max="24" step="1" value="24"></div>
      </div>
      <div class="tl-row">
        <div class="tl-field"><label for="shDevops">Monthly DevOps / Monitoring ($)</label><input id="shDevops" class="tl-input num" type="number" min="0" step="50" value="450"></div>
        <div class="tl-field"><label for="shTps">Sustained Output Throughput (tok/s)</label><input id="shTps" class="tl-input num" type="number" min="5" step="10" value="340"></div>
      </div>
      <div class="tl-field"><label for="shUtil">Realistic Avg GPU Utilization <strong id="shUtilVal">35%</strong></label><input id="shUtil" class="tl-range" type="range" min="5" max="90" step="5" value="35"></div>
    </div>

    <div class="tl-panel">
      <h2>Cloud API Benchmark Workload</h2>
      <div class="tl-field"><label for="shModel">Compare Against Cloud Model</label><select id="shModel" class="tl-select"></select></div>
      <div class="tl-row">
        <div class="tl-field"><label for="shIn">Input Tokens / Request</label><input id="shIn" class="tl-input num" type="number" min="50" step="100" value="2500"></div>
        <div class="tl-field"><label for="shOut">Output Tokens / Request</label><input id="shOut" class="tl-input num" type="number" min="20" step="50" value="600"></div>
      </div>
      <div class="tl-field"><label for="shReqs">Daily Requests</label><input id="shReqs" class="tl-input num" type="number" min="1" step="500" value="8000"></div>
      <div class="tl-field"><label for="shCache">Cloud Prompt Cache Hit Rate <strong id="shCacheVal">50%</strong></label><input id="shCache" class="tl-range" type="range" min="0" max="95" step="5" value="50"></div>
      <div class="tl-btn-bar"><button type="button" id="btnShExport" class="tl-btn tl-btn-primary">Export GPU vs API Analysis JSON</button></div>
    </div>
  </section>

  <section class="tl-prose">
    <h2>Frequently Asked Questions</h2>
    <div class="tl-faq-grid">
      <div class="tl-faq-item"><h3>When is self-hosting an H100 GPU cheaper than using a Cloud LLM API?</h3><p>Self-hosting typically breaks even once steady daily request volume exceeds several thousand requests per day (often 3,000–15,000+ depending on output length and prompt caching) and GPU utilization stays above 25–35%.</p></div>
    </div>
  </section>`
}), '0.9');

// --- PAGE 7: MCP & TOOL-CALLING SCHEMA BLOAT AUDITOR ---
registerPage('/tools/mcp-schema-auditor.html', 'tools/mcp-schema-auditor.html', renderShell({
  path: '/tools/mcp-schema-auditor.html',
  active: 'mcp',
  title: 'MCP & Function-Calling Tool Schema Token Bloat Auditor (Claude, Cursor & Agents)',
  description: 'Calculate hidden upfront token tax from connected MCP servers and function schemas. Paste raw MCP tools JSON to rank bloated tools and estimate lazy-loading savings.',
  scripts: ['/js/mcp-auditor.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger MCP Schema Tax Auditor', applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', url: `${ORIGIN}/tools/mcp-schema-auditor.html`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'How many tokens do connected MCP servers add to every LLM turn?', acceptedAnswer: { '@type': 'Answer', text: 'A typical MCP tool schema uses 180 to 400 tokens; connecting 5 servers with 14 tools each injects roughly 15,000 to 22,000 tokens before the user types a prompt.' } }
    ] }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">MCP FINOPS &bull; TOOL SCHEMA TAX &bull; 100% LOCAL JSON AUDIT</div>
    <h1>MCP &amp; Tool-Calling Schema Bloat Auditor</h1>
    <p>Quantify the hidden upfront token tax of connected MCP servers (Claude Code, Cursor, OpenAI Agents SDK), compare Prompt Caching vs. Lazy Tool Deferral, and paste raw tool JSON to expose your heaviest schemas.</p>
  </section>

  <section class="tl-grid-4">
    <div class="kpi-card"><div class="kpi-label">Upfront Schema Tax</div><div class="kpi-val warn" id="kpiMcpTokens">0 tok</div><div class="kpi-sub" id="kpiMcpTokensSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Uncached MCP Tax</div><div class="kpi-val danger" id="kpiMcpUncached">$0/mo</div><div class="kpi-sub" id="kpiMcpUncachedSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">With Prompt Caching</div><div class="kpi-val" id="kpiMcpCached">$0/mo</div><div class="kpi-sub" id="kpiMcpCachedSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">With Lazy Tool Deferral</div><div class="kpi-val accent" id="kpiMcpLazy">$0/mo</div><div class="kpi-sub" id="kpiMcpLazySub">-</div></div>
  </section>

  <section class="tl-grid-2">
    <div class="tl-panel">
      <h2>1. Connected MCP Fleet Parameters</h2>
      <div class="tl-field"><label for="mcpModel">Agent / IDE Model</label><select id="mcpModel" class="tl-select"></select></div>
      <div class="tl-row">
        <div class="tl-field"><label for="mcpServers">Connected MCP Servers</label><input id="mcpServers" class="tl-input num" type="number" min="1" max="50" value="5"></div>
        <div class="tl-field"><label for="mcpToolsPer">Avg Tools / Server</label><input id="mcpToolsPer" class="tl-input num" type="number" min="1" max="100" value="14"></div>
      </div>
      <div class="tl-row">
        <div class="tl-field"><label for="mcpTokPer">Avg Tokens / Tool Schema</label><input id="mcpTokPer" class="tl-input num" type="number" min="40" step="20" value="260"></div>
        <div class="tl-field"><label for="mcpTurns">Avg Turns / Session</label><input id="mcpTurns" class="tl-input num" type="number" min="1" max="100" value="16"></div>
      </div>
      <div class="tl-field"><label for="mcpSessions">Sessions / Day</label><input id="mcpSessions" class="tl-input num" type="number" min="1" step="50" value="400"></div>
      <div class="tl-field"><label for="mcpCache">Prefix Cache Hit Rate <strong id="mcpCacheVal">80%</strong></label><input id="mcpCache" class="tl-range" type="range" min="0" max="95" step="5" value="80"></div>
      <div class="tl-field"><label for="mcpLazy">Lazy Tool-Search Deferral <strong id="mcpLazyVal">85%</strong></label><input id="mcpLazy" class="tl-range" type="range" min="0" max="95" step="5" value="85"></div>
      <div class="tl-btn-bar"><button type="button" id="btnMcpExport" class="tl-btn tl-btn-primary">Export MCP Audit JSON</button></div>
    </div>

    <div class="tl-panel">
      <h2>2. Paste Raw MCP / OpenAI Tools JSON (Local Ranker)</h2>
      <textarea id="mcpJsonInput" class="tl-textarea" style="min-height:170px" placeholder="Paste a JSON array of MCP or function-calling tool definitions..."></textarea>
      <div class="tl-btn-bar" style="margin-bottom:12px"><button type="button" id="btnMcpSample" class="tl-btn">Load Sample MCP Tools JSON</button></div>
      <div id="mcpAuditOut" hidden>
        <div id="mcpAuditSummary" class="kpi-sub num" style="margin-bottom:10px;color:var(--accent);font-weight:700"></div>
        <div class="tl-table-wrap">
          <table class="tl-table" style="min-width:360px">
            <thead><tr><th>Tool Name</th><th>Pretty Tok</th><th>Minified</th><th>Saved</th></tr></thead>
            <tbody id="mcpToolTableBody"></tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <section class="tl-prose">
    <h2>Frequently Asked Questions</h2>
    <div class="tl-faq-grid">
      <div class="tl-faq-item"><h3>How many tokens do connected MCP servers add to every LLM turn?</h3><p>A typical MCP tool schema uses 180 to 400 tokens; connecting 5 servers with 14 tools each injects roughly 15,000 to 22,000 tokens before the user types a prompt.</p></div>
    </div>
  </section>`
}), '0.9');

// --- PAGE 8: VOICE, REALTIME & MULTIMODAL COST STUDIO ---
registerPage('/tools/multimodal-budget.html', 'tools/multimodal-budget.html', renderShell({
  path: '/tools/multimodal-budget.html',
  active: 'multimodal',
  title: 'Voice Realtime, Vision PDF OCR & Image Generation API Cost Calculator',
  description: 'Calculate monthly spend for OpenAI Realtime Voice vs Gemini Live Audio, Vision/PDF page OCR tokens (GPT-5, Claude 4, Gemini 2.5), and GPT Image / Imagen / Flux generation.',
  scripts: ['/js/multimodal-budget.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger Multimodal Voice & Vision Cost Studio', applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', url: `${ORIGIN}/tools/multimodal-budget.html`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'How much does a Realtime AI voice agent cost per minute?', acceptedAnswer: { '@type': 'Answer', text: 'Depending on provider and speech-to-speech vs. cascaded architecture, AI voice agents typically range from $0.028/min (cascaded STT+Flash+TTS) to $0.042/min (Gemini Live) up to $0.24/min (OpenAI Realtime full).' } }
    ] }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">MULTIMODAL FINOPS &bull; VISION OCR &bull; REALTIME VOICE &bull; IMAGE GEN</div>
    <h1>Voice, Vision &amp; Multimodal API Cost Studio</h1>
    <p>Budget non-text AI workloads accurately — combining PDF/image vision token billing, per-minute Realtime Voice agents (OpenAI Realtime vs. Gemini Live vs. Cascaded STT+LLM+TTS), and Image Generation.</p>
  </section>

  <section class="tl-grid-4">
    <div class="kpi-card"><div class="kpi-label">Vision / PDF OCR</div><div class="kpi-val" id="kpiMmVision">$0/mo</div><div class="kpi-sub" id="kpiMmVisionSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Realtime Voice</div><div class="kpi-val warn" id="kpiMmVoice">$0/mo</div><div class="kpi-sub" id="kpiMmVoiceSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Image Generation</div><div class="kpi-val" id="kpiMmGen">$0/mo</div><div class="kpi-sub" id="kpiMmGenSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Combined Multimodal</div><div class="kpi-val accent" id="kpiMmTotal">$0/mo</div><div class="kpi-sub" id="kpiMmTotalSub">-</div></div>
  </section>

  <section class="tl-grid-2">
    <div class="tl-panel">
      <h2>Multimodal Workload Inputs</h2>
      <div class="tl-field"><label for="mmVisionModel">Vision / PDF OCR Model</label><select id="mmVisionModel" class="tl-select"></select></div>
      <div class="tl-row">
        <div class="tl-field"><label for="mmDailyImgs">Images or PDF Pages / Day</label><input id="mmDailyImgs" class="tl-input num" type="number" min="0" step="100" value="1500"></div>
        <div class="tl-field"><label for="mmVisionOut">Avg Output Tokens / Page</label><input id="mmVisionOut" class="tl-input num" type="number" min="0" step="50" value="250"></div>
      </div>
      <div class="tl-field"><label for="mmVoiceModel">Realtime Voice Pipeline</label><select id="mmVoiceModel" class="tl-select"></select></div>
      <div class="tl-field"><label for="mmVoiceMins">Total Voice Audio Minutes / Day</label><input id="mmVoiceMins" class="tl-input num" type="number" min="0" step="50" value="600"></div>
      <div class="tl-row">
        <div class="tl-field"><label for="mmImageModel">Image Generation Model</label><select id="mmImageModel" class="tl-select"></select></div>
        <div class="tl-field"><label for="mmGenImgs">Generated Images / Day</label><input id="mmGenImgs" class="tl-input num" type="number" min="0" step="50" value="200"></div>
      </div>
      <div class="tl-btn-bar"><button type="button" id="btnMmExport" class="tl-btn tl-btn-primary">Export Multimodal Budget JSON</button></div>
    </div>

    <div class="tl-panel">
      <h2>Voice Agent Cost Comparison (Current Daily Minutes)</h2>
      <div class="tl-table-wrap">
        <table class="tl-table" style="min-width:440px">
          <thead><tr><th>Voice Stack</th><th>Rate / Min</th><th>Monthly (30d)</th><th>Annual</th></tr></thead>
          <tbody id="voiceCompareBody"></tbody>
        </table>
      </div>
    </div>
  </section>

  <section class="tl-prose">
    <h2>Frequently Asked Questions</h2>
    <div class="tl-faq-grid">
      <div class="tl-faq-item"><h3>How much does a Realtime AI voice agent cost per minute?</h3><p>Depending on provider and speech-to-speech vs. cascaded architecture, AI voice agents typically range from $0.028/min (cascaded STT+Flash+TTS) to $0.042/min (Gemini Live) up to $0.24/min (OpenAI Realtime full).</p></div>
    </div>
  </section>`
}), '0.9');

// --- PAGE 9: AI STARTUP MONTHLY BURN & RUNWAY PLANNER ---
registerPage('/tools/ai-runway.html', 'tools/ai-runway.html', renderShell({
  path: '/tools/ai-runway.html',
  active: 'saas',
  title: 'AI Startup Burn Rate, LLM Spend Scaling & Runway Calculator (Default Alive)',
  description: 'Model startup cash runway with scaling LLM API spend, cloud infra, payroll, and MRR growth rate. See exact Default-Alive month and 24-month cash table.',
  scripts: ['/js/ai-runway.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger AI Startup Burn & Runway Planner', applicationCategory: 'BusinessApplication', operatingSystem: 'Any', url: `${ORIGIN}/tools/ai-runway.html`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">FOUNDER FINANCE &bull; AI BURN &amp; DEFAULT-ALIVE SIMULATOR</div>
    <h1>AI Startup Burn Rate &amp; Runway Planner</h1>
    <p>Unlike traditional SaaS, AI startup COGS grow alongside revenue. Model cash on hand, MRR growth, scaling LLM API spend, cloud infra, and payroll to see your exact runway and break-even month.</p>
  </section>

  <section class="tl-grid-4">
    <div class="kpi-card"><div class="kpi-label">Runway Status</div><div class="kpi-val accent" id="kpiRunway">-</div><div class="kpi-sub" id="kpiRunwaySub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Month-1 Net Burn</div><div class="kpi-val warn" id="kpiNetBurn">$0/mo</div><div class="kpi-sub" id="kpiNetBurnSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">AI Share of Burn</div><div class="kpi-val" id="kpiAiShare">0%</div><div class="kpi-sub" id="kpiAiShareSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Break-Even Month</div><div class="kpi-val accent" id="kpiBreakEvenMo">-</div><div class="kpi-sub" id="kpiBreakEvenMoSub">-</div></div>
  </section>

  <section class="tl-grid-2">
    <div class="tl-panel">
      <h2>Cash, MRR &amp; Operating Cost Inputs</h2>
      <div class="tl-row">
        <div class="tl-field"><label for="rwCash">Cash in Bank ($ USD)</label><input id="rwCash" class="tl-input num" type="number" min="1000" step="10000" value="250000"></div>
        <div class="tl-field"><label for="rwMrr">Current MRR ($ USD)</label><input id="rwMrr" class="tl-input num" type="number" min="0" step="1000" value="8000"></div>
      </div>
      <div class="tl-row">
        <div class="tl-field"><label for="rwGrowth">Monthly MRR Growth (%)</label><input id="rwGrowth" class="tl-input num" type="number" min="-50" max="200" step="1" value="12"></div>
        <div class="tl-field"><label for="rwAi">Current Monthly LLM Spend ($)</label><input id="rwAi" class="tl-input num" type="number" min="0" step="250" value="4500"></div>
      </div>
      <div class="tl-row">
        <div class="tl-field"><label for="rwCloud">Cloud / Vector DB / Hosting ($)</label><input id="rwCloud" class="tl-input num" type="number" min="0" step="200" value="1800"></div>
        <div class="tl-field"><label for="rwOps">Payroll &amp; Fixed Ops ($)</label><input id="rwOps" class="tl-input num" type="number" min="0" step="1000" value="18000"></div>
      </div>
      <label class="tl-check-row"><input id="rwScaleAi" type="checkbox" checked><span>Scale monthly LLM spend at 0.75x of MRR growth rate</span></label>
      <div class="tl-btn-bar"><button type="button" id="btnRwExport" class="tl-btn tl-btn-primary">Export 24-Month Projection JSON</button></div>
    </div>

    <div class="tl-panel">
      <h2>24-Month Runway &amp; Cash Trajectory</h2>
      <div class="tl-table-wrap">
        <table class="tl-table" style="min-width:480px">
          <thead><tr><th>Timeline</th><th>MRR</th><th>AI Spend</th><th>Gross Burn</th><th>Net Burn</th><th>Ending Cash</th></tr></thead>
          <tbody id="runwayTableBody"></tbody>
        </table>
      </div>
    </div>
  </section>`
}), '0.9');

// --- PAGE 10: PROMPT A/B COMPRESSION COST DIFF ---
registerPage('/tools/prompt-diff.html', 'tools/prompt-diff.html', renderShell({
  path: '/tools/prompt-diff.html',
  active: 'inspector',
  title: 'Prompt Compression A/B Token & Annual USD Savings Diff Tool',
  description: 'Paste Prompt A (before) vs Prompt B (after) locally to calculate exact token savings, compression %, and annual USD saved across GPT-5, Claude 4, and Gemini 2.5.',
  scripts: ['/js/prompt-diff.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger Prompt A/B Cost Diff', applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', url: `${ORIGIN}/tools/prompt-diff.html`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">PROMPT OPTIMIZATION &bull; PR COST-DIFF BENCHMARK</div>
    <h1>System Prompt A/B Compression Cost Diff</h1>
    <p>Compare your verbose original system prompt against a compressed rewrite locally — quantify exact token reduction, annual USD savings across 6 flagship models, and copy a Markdown diff for your GitHub PR.</p>
  </section>

  <section class="tl-grid-4">
    <div class="kpi-card"><div class="kpi-label">Prompt A (Before)</div><div class="kpi-val" id="kpiDiffA">0 tok</div><div class="kpi-sub" id="kpiDiffASub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Prompt B (After)</div><div class="kpi-val" id="kpiDiffB">0 tok</div><div class="kpi-sub" id="kpiDiffBSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Token Delta</div><div class="kpi-val accent" id="kpiDiffDelta">0 tok</div><div class="kpi-sub" id="kpiDiffDeltaSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Annual Savings (Sonnet 4)</div><div class="kpi-val accent" id="kpiDiffAnnual">$0/yr</div><div class="kpi-sub" id="kpiDiffAnnualSub">-</div></div>
  </section>

  <section class="tl-grid-2">
    <div class="tl-panel">
      <h2>Prompt A — Original (Verbose)</h2>
      <textarea id="diffA" class="tl-textarea" style="min-height:170px" placeholder="Paste original system prompt or schema..."></textarea>
    </div>
    <div class="tl-panel">
      <h2>Prompt B — Optimized (Compressed)</h2>
      <textarea id="diffB" class="tl-textarea" style="min-height:170px" placeholder="Paste tightened prompt or minified schema..."></textarea>
    </div>
  </section>

  <section class="tl-panel">
    <div class="tl-row" style="margin-bottom:12px">
      <div class="tl-field"><label for="diffReqs">Daily Requests</label><input id="diffReqs" class="tl-input num" type="number" min="1" step="500" value="2000"></div>
      <div class="tl-field"><label for="diffCache">Prompt Cache Hit Rate <strong id="diffCacheVal">50%</strong></label><input id="diffCache" class="tl-range" type="range" min="0" max="95" step="5" value="50"></div>
    </div>
    <div class="tl-btn-bar" style="margin-bottom:16px">
      <button type="button" id="btnDiffSample" class="tl-btn">Load Sample A/B Prompts</button>
      <button type="button" id="btnDiffMd" class="tl-btn tl-btn-primary">Copy PR Diff Markdown Table</button>
      <button type="button" id="btnCopyGhAction" class="tl-btn">Copy GitHub Action CI YAML</button>
    </div>
    <div class="tl-table-wrap">
      <table class="tl-table" style="min-width:440px">
        <thead><tr><th>Model</th><th>Provider</th><th>Monthly Delta</th><th>Annual Savings</th></tr></thead>
        <tbody id="diffTableBody"></tbody>
      </table>
    </div>
  </section>`
}), '0.9');

// --- PAGE 11: FINE-TUNING VS RAG VS PROMPT CACHING 12-MONTH TCO ---
registerPage('/tools/fine-tune-vs-rag.html', 'tools/fine-tune-vs-rag.html', renderShell({
  path: '/tools/fine-tune-vs-rag.html',
  active: 'rag',
  title: 'Fine-Tuning vs RAG vs Prompt Caching 12-Month TCO Calculator (2026)',
  description: 'Compare 12-month total cost of ownership across LoRA/SFT fine-tuning retrains, RAG + Vector DB synthesis, and long-context prompt caching — with one-click ADR Markdown export.',
  scripts: ['/js/fine-tune-vs-rag.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger Fine-Tuning vs RAG TCO Calculator', applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', url: `${ORIGIN}/tools/fine-tune-vs-rag.html`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'When is Fine-Tuning cheaper than RAG?', acceptedAnswer: { '@type': 'Answer', text: 'Fine-tuning typically beats RAG when request volume is very high (15,000+ req/day), knowledge changes infrequently, and distilling a long 3,000+ token rubric into fine-tuned weights eliminates heavy per-request input tokens.' } }
    ] }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">ARCHITECTURE FINOPS &bull; 12-MONTH TCO &bull; ADR EXPORT</div>
    <h1>Fine-Tuning vs. RAG vs. Prompt Caching 12-Month TCO</h1>
    <p>Model training costs, periodic knowledge retrains, fine-tuned inference multipliers, vector DB monthly hosting, and long-context prompt caching side by side to choose the highest-margin AI architecture.</p>
  </section>

  <section class="tl-grid-4">
    <div class="kpi-card"><div class="kpi-label">Lowest 12-Month TCO</div><div class="kpi-val accent" id="kpiFtWinner">-</div><div class="kpi-sub" id="kpiFtWinnerSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Fine-Tuning (12m)</div><div class="kpi-val" id="kpiFtAnnual">$0/yr</div><div class="kpi-sub" id="kpiFtAnnualSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">RAG + Vector DB (12m)</div><div class="kpi-val" id="kpiRagAnnual">$0/yr</div><div class="kpi-sub" id="kpiRagAnnualSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Long-Context Caching</div><div class="kpi-val" id="kpiCacheAnnual">$0/yr</div><div class="kpi-sub" id="kpiCacheAnnualSub">-</div></div>
  </section>

  <section class="tl-grid-2">
    <div class="tl-panel">
      <h2>1. Workload &amp; Knowledge Base</h2>
      <div class="tl-field"><label for="ftModel">Base Model</label><select id="ftModel" class="tl-select"></select></div>
      <div class="tl-row">
        <div class="tl-field"><label for="ftKbTokens">Knowledge Base Size (Tokens)</label><input id="ftKbTokens" class="tl-input num" type="number" min="1000" step="10000" value="150000"></div>
        <div class="tl-field"><label for="ftDailyReqs">Daily Requests</label><input id="ftDailyReqs" class="tl-input num" type="number" min="1" step="500" value="4000"></div>
      </div>
      <div class="tl-row">
        <div class="tl-field"><label for="ftUserTok">User Query Tokens / Req</label><input id="ftUserTok" class="tl-input num" type="number" min="20" step="50" value="350"></div>
        <div class="tl-field"><label for="ftOutTok">Output Tokens / Req</label><input id="ftOutTok" class="tl-input num" type="number" min="20" step="50" value="450"></div>
      </div>
      <div class="tl-field"><label for="ftCacheHit">Long-Context Cache Hit Rate <strong id="ftCacheVal">85%</strong></label><input id="ftCacheHit" class="tl-range" type="range" min="0" max="95" step="5" value="85"></div>
    </div>

    <div class="tl-panel">
      <h2>2. Fine-Tuning &amp; RAG Parameters</h2>
      <div class="tl-row">
        <div class="tl-field"><label for="ftTrainRate">Training Rate ($/1M tok)</label><input id="ftTrainRate" class="tl-input num" type="number" min="0.1" step="0.5" value="3.00"></div>
        <div class="tl-field"><label for="ftEpochs">Training Epochs</label><input id="ftEpochs" class="tl-input num" type="number" min="1" max="10" value="3"></div>
      </div>
      <div class="tl-row">
        <div class="tl-field"><label for="ftRetrains">Retrains / Year (Knowledge Updates)</label><input id="ftRetrains" class="tl-input num" type="number" min="1" max="52" value="6"></div>
        <div class="tl-field"><label for="ftInferMult">Fine-Tuned Inference Multiplier</label><input id="ftInferMult" class="tl-input num" type="number" min="1.0" max="4.0" step="0.1" value="1.6"></div>
      </div>
      <div class="tl-row">
        <div class="tl-field"><label for="ftRagTopK">RAG Retrieved Tokens / Req</label><input id="ftRagTopK" class="tl-input num" type="number" min="200" step="200" value="2400"></div>
        <div class="tl-field"><label for="ftVectorDb">Managed Vector DB ($/mo)</label><input id="ftVectorDb" class="tl-input num" type="number" min="0" step="10" value="70"></div>
      </div>
      <div class="tl-btn-bar"><button type="button" id="btnFtCopyAdr" class="tl-btn tl-btn-primary">Copy Architecture Decision Record (Markdown)</button></div>
    </div>
  </section>

  <section class="tl-panel">
    <h2>12-Month Architecture Comparison Matrix</h2>
    <div class="tl-table-wrap">
      <table class="tl-table" style="min-width:500px">
        <thead><tr><th>Architecture</th><th>Monthly Avg</th><th>12-Month TCO</th><th>Key Cost Driver</th></tr></thead>
        <tbody id="ftBreakdownBody"></tbody>
      </table>
    </div>
  </section>`
}), '0.9');

// --- PAGE 12: LLM RATE-LIMIT (RPM / TPM / CONCURRENCY) CAPACITY PLANNER ---
registerPage('/tools/llm-rate-limit-planner.html', 'tools/llm-rate-limit-planner.html', renderShell({
  path: '/tools/llm-rate-limit-planner.html',
  active: 'selfhost',
  title: 'LLM Rate-Limit (RPM, TPM & Concurrency) & Multi-Provider Failover Planner',
  description: 'Calculate exact peak Tokens-Per-Minute (TPM), Little’s Law concurrent streams, required OpenAI/Anthropic/Gemini tier, and export a ready-to-use token-bucket rate-limiter policy JSON.',
  scripts: ['/js/llm-rate-limit-planner.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger LLM Rate-Limit Capacity Planner', applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', url: `${ORIGIN}/tools/llm-rate-limit-planner.html`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'How do you calculate required LLM concurrency from RPM and latency?', acceptedAnswer: { '@type': 'Answer', text: 'By Little’s Law (L = λ × W), required concurrent streams equal (Peak RPM ÷ 60) × Average Response Latency in seconds.' } }
    ] }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">PRODUCTION RELIABILITY &bull; RPM / TPM / LITTLE'S LAW</div>
    <h1>LLM Rate-Limit (RPM / TPM) &amp; Failover Capacity Planner</h1>
    <p>Prevent HTTP 429 production outages before launch. Compute exact burst TPM, concurrent streaming workers via Little’s Law, recommended API tier, and export a ready-to-paste token-bucket policy JSON.</p>
  </section>

  <section class="tl-grid-4">
    <div class="kpi-card"><div class="kpi-label">Peak Required TPM</div><div class="kpi-val warn" id="kpiRlPeakTpm">0 TPM</div><div class="kpi-sub" id="kpiRlPeakTpmSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Peak Concurrency</div><div class="kpi-val accent" id="kpiRlConc">0 workers</div><div class="kpi-sub" id="kpiRlConcSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Vendor Tier Needed</div><div class="kpi-val" id="kpiRlTier">-</div><div class="kpi-sub" id="kpiRlTierSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Est. Monthly Spend</div><div class="kpi-val" id="kpiRlCost">$0/mo</div><div class="kpi-sub" id="kpiRlCostSub">-</div></div>
  </section>

  <section class="tl-grid-2">
    <div class="tl-panel">
      <h2>1. Traffic &amp; Latency Profile</h2>
      <div class="tl-field"><label for="rlModel">Primary LLM Endpoint</label><select id="rlModel" class="tl-select"></select></div>
      <div class="tl-row">
        <div class="tl-field"><label for="rlAvgRpm">Sustained Requests / Min (RPM)</label><input id="rlAvgRpm" class="tl-input num" type="number" min="1" step="10" value="120"></div>
        <div class="tl-field"><label for="rlLatency">Avg End-to-End Latency (sec)</label><input id="rlLatency" class="tl-input num" type="number" min="0.2" step="0.5" value="4.5"></div>
      </div>
      <div class="tl-field"><label for="rlBurst">Peak Burst Multiplier <strong id="rlBurstVal">2.5x</strong></label><input id="rlBurst" class="tl-range" type="range" min="1" max="8" step="0.5" value="2.5"></div>
      <div class="tl-row">
        <div class="tl-field"><label for="rlInTok">Avg Input Tokens / Req</label><input id="rlInTok" class="tl-input num" type="number" min="50" step="100" value="2500"></div>
        <div class="tl-field"><label for="rlOutTok">Avg Output Tokens / Req</label><input id="rlOutTok" class="tl-input num" type="number" min="20" step="50" value="600"></div>
      </div>
      <div class="tl-field"><label for="rlCache">Prompt Cache Hit Rate <strong id="rlCacheVal">50%</strong></label><input id="rlCache" class="tl-range" type="range" min="0" max="95" step="5" value="50"></div>
    </div>

    <div class="tl-panel">
      <h2>2. Generated Token-Bucket &amp; Failover Policy</h2>
      <pre id="rlConfigPreview" style="margin:0 0 12px;padding:14px;border-radius:10px;background:rgba(15,23,42,0.7);border:1px solid var(--border);overflow-x:auto;font-size:0.82rem;line-height:1.5;color:var(--text)"></pre>
      <div class="tl-btn-bar">
        <button type="button" id="btnRlCopyJson" class="tl-btn tl-btn-primary">Copy Rate-Limiter JSON</button>
        <button type="button" id="btnRlDownload" class="tl-btn">Download Policy File</button>
      </div>
    </div>
  </section>`
}), '0.9');

// --- PAGE 13: LLM GPU VRAM & KV-CACHE QUANTIZATION CALCULATOR ---
registerPage('/tools/gpu-vram-calculator.html', 'tools/gpu-vram-calculator.html', renderShell({
  path: '/tools/gpu-vram-calculator.html',
  active: 'selfhost',
  title: 'LLM GPU VRAM & KV-Cache Quantization Calculator (Llama 70B, DeepSeek-R1, Qwen)',
  description: 'Calculate exact GPU VRAM for open-weight LLMs across FP16, FP8, Q6_K, Q4_K_M, and Q3_K_M including GQA KV-Cache memory, concurrent batch size, and recommended H100/A100/L40S/4090 hardware.',
  scripts: ['/js/gpu-vram-calculator.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger GPU VRAM & KV-Cache Calculator', applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', url: `${ORIGIN}/tools/gpu-vram-calculator.html`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'How much VRAM does Llama 3.3 70B Q4_K_M need?', acceptedAnswer: { '@type': 'Answer', text: 'Llama 3.3 70B in Q4_K_M requires roughly 41 GB for weights plus 3–12 GB for KV-cache and activation overhead depending on context length and batch size, fitting on 1x 48GB L40S for small batches or 1x 80GB A100/H100 for multi-user serving.' } }
    ] }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">GPU INFRASTRUCTURE &bull; WEIGHTS + GQA KV-CACHE + QUANTIZATION</div>
    <h1>LLM GPU VRAM &amp; KV-Cache Quantization Calculator</h1>
    <p>Size exact GPU VRAM requirements for Llama 3.3/4, Qwen 2.5, Gemma 3, and DeepSeek-R1 across FP16, FP8, Q6_K, and Q4_K_M — including GQA KV-cache memory at your target context length and concurrent batch size.</p>
  </section>

  <section class="tl-grid-4">
    <div class="kpi-card"><div class="kpi-label">Total VRAM Needed</div><div class="kpi-val warn" id="kpiVrTotal">0 GB</div><div class="kpi-sub" id="kpiVrTotalSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Model Weights</div><div class="kpi-val" id="kpiVrWeights">0 GB</div><div class="kpi-sub" id="kpiVrWeightsSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">KV-Cache Memory</div><div class="kpi-val" id="kpiVrKv">0 GB</div><div class="kpi-sub" id="kpiVrKvSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Recommended GPU</div><div class="kpi-val accent" id="kpiVrHw">-</div><div class="kpi-sub" id="kpiVrHwSub">-</div></div>
  </section>

  <section class="tl-panel" style="margin-bottom:20px">
    <h2>Model, Quantization &amp; Concurrency Parameters</h2>
    <div class="tl-row">
      <div class="tl-field"><label for="vrModel">Open-Weight Model Preset</label><select id="vrModel" class="tl-select"></select></div>
      <div class="tl-field"><label for="vrQuant">Weight Quantization</label><select id="vrQuant" class="tl-select"><option value="fp16">FP16 / BF16 (16-bit)</option><option value="fp8">FP8 / INT8 (8-bit)</option><option value="q6k">GGUF Q6_K (~6.6-bit)</option><option value="q4km" selected>GGUF Q4_K_M / AWQ 4-bit</option><option value="q3km">GGUF Q3_K_M (~3.9-bit)</option></select></div>
    </div>
    <div class="tl-row">
      <div class="tl-field"><label for="vrCtx">Context Length (Tokens)</label><input id="vrCtx" class="tl-input num" type="number" min="512" max="1000000" step="1024" value="8192"></div>
      <div class="tl-field"><label for="vrBatch">Concurrent Batch Size (Users)</label><input id="vrBatch" class="tl-input num" type="number" min="1" max="256" step="1" value="4"></div>
    </div>
    <label class="tl-check-row"><input id="vrKvFp8" type="checkbox"><span>Enable FP8 KV-Cache Quantization (cuts KV-Cache VRAM by 50% in vLLM / TensorRT-LLM)</span></label>
    <div class="tl-btn-bar"><button type="button" id="btnVrCopyMd" class="tl-btn tl-btn-primary">Copy Hardware Sizing Markdown</button></div>
  </section>

  <section class="tl-panel">
    <h2>All Quantization Formats Comparison Matrix</h2>
    <div class="tl-table-wrap">
      <table class="tl-table" style="min-width:560px">
        <thead><tr><th>Quantization</th><th>Weights</th><th>KV-Cache</th><th>Total VRAM</th><th>Recommended Hardware</th><th>Est. Cloud GPU</th></tr></thead>
        <tbody id="vrMatrixBody"></tbody>
      </table>
    </div>
  </section>`
}), '0.9');

// --- PAGE 14: CFO HYBRID CACHING + BATCH + CASCADE SAVINGS WATERFALL ---
registerPage('/tools/batch-vs-realtime-router.html', 'tools/batch-vs-realtime-router.html', renderShell({
  path: '/tools/batch-vs-realtime-router.html',
  active: 'home',
  title: 'Enterprise LLM Savings Waterfall: Prompt Caching + Cascade Router + 50% Batch Simulator',
  description: 'Model stacked LLM cost reductions combining Prompt Caching, Fast/Mini Model Cascade routing, and 50% Async Batch APIs — and export a CFO-ready executive savings memo.',
  scripts: ['/js/batch-vs-realtime-router.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger Enterprise FinOps Waterfall Simulator', applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', url: `${ORIGIN}/tools/batch-vs-realtime-router.html`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">CFO FINOPS WATERFALL &bull; CACHING + CASCADE + BATCH</div>
    <h1>Enterprise LLM Savings Waterfall Simulator</h1>
    <p>Quantify how much your engineering org saves when stacking all three proven FinOps levers together: Prompt Caching, Fast/Mini Cascade routing, and 50% Async Batch APIs.</p>
  </section>

  <section class="tl-grid-4">
    <div class="kpi-card"><div class="kpi-label">Unoptimized Baseline</div><div class="kpi-val danger" id="kpiHyBase">$0/mo</div><div class="kpi-sub" id="kpiHyBaseSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Optimized Blended</div><div class="kpi-val accent" id="kpiHyOpt">$0/mo</div><div class="kpi-sub" id="kpiHyOptSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Monthly Savings</div><div class="kpi-val accent" id="kpiHySaveMo">$0/mo</div><div class="kpi-sub" id="kpiHySaveMoSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Annual CFO Impact</div><div class="kpi-val accent" id="kpiHySaveYr">$0/yr</div><div class="kpi-sub" id="kpiHySaveYrSub">-</div></div>
  </section>

  <section class="tl-grid-2">
    <div class="tl-panel">
      <h2>1. Baseline Traffic &amp; Models</h2>
      <div class="tl-row">
        <div class="tl-field"><label for="hyFrontier">Frontier Model</label><select id="hyFrontier" class="tl-select"></select></div>
        <div class="tl-field"><label for="hyMini">Fast / Mini Router Model</label><select id="hyMini" class="tl-select"></select></div>
      </div>
      <div class="tl-row">
        <div class="tl-field"><label for="hyInTok">Avg Input Tokens</label><input id="hyInTok" class="tl-input num" type="number" min="50" step="250" value="3500"></div>
        <div class="tl-field"><label for="hyOutTok">Avg Output Tokens</label><input id="hyOutTok" class="tl-input num" type="number" min="20" step="50" value="700"></div>
      </div>
      <div class="tl-field"><label for="hyReqs">Total Daily Requests</label><input id="hyReqs" class="tl-input num" type="number" min="1" step="1000" value="10000"></div>
    </div>

    <div class="tl-panel">
      <h2>2. Stacked FinOps Optimization Levers</h2>
      <div class="tl-field"><label for="hyCache">Prompt Cache Hit Rate <strong id="hyCacheVal">70%</strong></label><input id="hyCache" class="tl-range" type="range" min="0" max="95" step="5" value="70"></div>
      <div class="tl-field"><label for="hyMiniPct">Traffic Routed to Fast/Mini Model <strong id="hyMiniVal">55%</strong></label><input id="hyMiniPct" class="tl-range" type="range" min="0" max="90" step="5" value="55"></div>
      <div class="tl-field"><label for="hyBatchPct">Traffic Moved to 50% Async Batch API <strong id="hyBatchVal">25%</strong></label><input id="hyBatchPct" class="tl-range" type="range" min="0" max="90" step="5" value="25"></div>
      <div class="tl-btn-bar"><button type="button" id="btnHyMemo" class="tl-btn tl-btn-primary">Copy CFO Executive Savings Memo (Markdown)</button></div>
    </div>
  </section>

  <section class="tl-panel">
    <h2>Stacked Cost-Reduction Waterfall</h2>
    <div class="tl-table-wrap">
      <table class="tl-table" style="min-width:500px">
        <thead><tr><th>Optimization Stage</th><th>Monthly</th><th>Annualized</th><th>% of Baseline</th></tr></thead>
        <tbody id="hyWaterfallBody"></tbody>
      </table>
    </div>
  </section>`
}), '0.9');

// --- PAGE 15: SPEECH-TO-TEXT (STT) & TEXT-TO-SPEECH (TTS) AUDIO API COST CALCULATOR ---
registerPage('/tools/audio-transcription-cost.html', 'tools/audio-transcription-cost.html', renderShell({
  path: '/tools/audio-transcription-cost.html',
  active: 'multimodal',
  title: 'Speech-to-Text (STT) & TTS Audio API Cost Calculator — Whisper, Deepgram, Groq, ElevenLabs',
  description: 'Compare monthly & annual audio API pricing across OpenAI Whisper, Deepgram Nova-3, AssemblyAI, Groq Whisper, Gemini Audio, OpenAI TTS, Cartesia Sonic, and ElevenLabs with VAD silence trimming.',
  scripts: ['/js/audio-transcription-cost.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger STT & TTS Audio API Cost Calculator', applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', url: `${ORIGIN}/tools/audio-transcription-cost.html`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'How much does VAD silence trimming save on Whisper or Deepgram bills?', acceptedAnswer: { '@type': 'Answer', text: 'Real-world phone calls and meetings contain 25% to 40% silence. Running lightweight Voice Activity Detection (VAD) before transcription trims dead air and reduces billed STT minutes proportionally.' } }
    ] }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">VOICE &amp; AUDIO FINOPS &bull; STT + TTS + VAD SILENCE TRIMMING</div>
    <h1>Speech-to-Text (STT) &amp; TTS Audio API Cost Calculator</h1>
    <p>Benchmark Whisper, Deepgram Nova-3, Groq Whisper Turbo, AssemblyAI, ElevenLabs, Cartesia, and OpenAI TTS side by side — including VAD silence trimming and phrase caching savings.</p>
  </section>

  <section class="tl-grid-4">
    <div class="kpi-card"><div class="kpi-label">Combined Monthly</div><div class="kpi-val accent" id="kpiAuTotal">$0/mo</div><div class="kpi-sub" id="kpiAuTotalSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">STT Transcription</div><div class="kpi-val" id="kpiAuStt">$0/mo</div><div class="kpi-sub" id="kpiAuSttSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">TTS Synthesis</div><div class="kpi-val" id="kpiAuTts">$0/mo</div><div class="kpi-sub" id="kpiAuTtsSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">VAD + Cache Saved</div><div class="kpi-val accent" id="kpiAuSave">$0/mo</div><div class="kpi-sub" id="kpiAuSaveSub">-</div></div>
  </section>

  <section class="tl-grid-2">
    <div class="tl-panel">
      <h2>1. Speech-to-Text (Transcription)</h2>
      <div class="tl-field"><label for="auSttModel">STT Provider &amp; Model</label><select id="auSttModel" class="tl-select"></select></div>
      <div class="tl-field"><label for="auDailyMins">Raw Audio Minutes / Day</label><input id="auDailyMins" class="tl-input num" type="number" min="0" step="100" value="1200"></div>
      <div class="tl-field"><label for="auVadTrim">Client/Edge VAD Silence Trimming <strong id="auVadVal">30%</strong></label><input id="auVadTrim" class="tl-range" type="range" min="0" max="70" step="5" value="30"></div>
      <label class="tl-check-row"><input id="auDiarization" type="checkbox"><span>Include Speaker Diarization Add-On (where billed separately)</span></label>
    </div>

    <div class="tl-panel">
      <h2>2. Text-to-Speech (Voice Synthesis)</h2>
      <div class="tl-field"><label for="auTtsModel">TTS Voice Engine</label><select id="auTtsModel" class="tl-select"></select></div>
      <div class="tl-field"><label for="auTtsChars">Spoken Characters / Day</label><input id="auTtsChars" class="tl-input num" type="number" min="0" step="25000" value="250000"></div>
      <div class="tl-field"><label for="auTtsCache">Static Greeting / Phrase Cache Hit <strong id="auTtsCacheVal">25%</strong></label><input id="auTtsCache" class="tl-range" type="range" min="0" max="90" step="5" value="25"></div>
      <div class="tl-btn-bar">
        <button type="button" id="btnAuCopyMd" class="tl-btn tl-btn-primary">Copy Audio FinOps Markdown</button>
        <button type="button" id="btnAuExportCsv" class="tl-btn">Export Full CSV</button>
      </div>
    </div>
  </section>

  <section class="tl-grid-2">
    <div class="tl-panel">
      <h2>All 7 STT Engines Comparison</h2>
      <div class="tl-table-wrap"><table class="tl-table" style="min-width:440px"><thead><tr><th>STT Model</th><th>Rate</th><th>Monthly</th><th>Annual</th></tr></thead><tbody id="auSttTableBody"></tbody></table></div>
    </div>
    <div class="tl-panel">
      <h2>All 8 TTS Voice Engines Comparison</h2>
      <div class="tl-table-wrap"><table class="tl-table" style="min-width:440px"><thead><tr><th>TTS Engine</th><th>Rate</th><th>Monthly</th><th>Annual</th></tr></thead><tbody id="auTtsTableBody"></tbody></table></div>
    </div>
  </section>`
}), '0.9');

// --- PAGE 16: AI IMAGE & VIDEO GENERATION STUDIO BUDGET CALCULATOR ---
registerPage('/tools/image-video-gen-budget.html', 'tools/image-video-gen-budget.html', renderShell({
  path: '/tools/image-video-gen-budget.html',
  active: 'multimodal',
  title: 'AI Image & Video Generation API Cost Calculator — FLUX, GPT-Image-1, Imagen 3, Veo, Runway, Sora',
  description: 'Model agency & SaaS creative API budgets across FLUX 1.1 Pro, OpenAI GPT-Image-1, Google Imagen 3, Veo 2/3, Runway Gen-4 Turbo, Kling, and Sora with realistic retry multipliers and draft cascades.',
  scripts: ['/js/image-video-gen-budget.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger AI Image & Video Generation Budget Calculator', applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', url: `${ORIGIN}/tools/image-video-gen-budget.html`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'How does a FLUX schnell draft cascade reduce AI image generation costs?', acceptedAnswer: { '@type': 'Answer', text: 'Instead of paying $0.04–$0.167 for every rejected draft, teams generate composition drafts on FLUX.1 schnell ($0.003/image) and invoke the hero model only for the final approved asset, cutting monthly spend by 50–70%.' } }
    ] }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">CREATIVE AI FINOPS &bull; IMAGE + VIDEO + RETRY MULTIPLIERS</div>
    <h1>AI Image &amp; Video Generation Studio Budget Calculator</h1>
    <p>Calculate real unit economics per published creative asset across FLUX, GPT-Image-1, Imagen 3, Veo, Runway Gen-4, Kling, and Sora — including realistic discard/retry rates and draft-cascade savings.</p>
  </section>

  <section class="tl-grid-4">
    <div class="kpi-card"><div class="kpi-label">Total Studio API Spend</div><div class="kpi-val accent" id="kpiMvTotal">$0/mo</div><div class="kpi-sub" id="kpiMvTotalSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Image Generation</div><div class="kpi-val" id="kpiMvImg">$0/mo</div><div class="kpi-sub" id="kpiMvImgSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Video Generation</div><div class="kpi-val warn" id="kpiMvVid">$0/mo</div><div class="kpi-sub" id="kpiMvVidSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Draft Cascade Savings</div><div class="kpi-val accent" id="kpiMvSave">$0/mo</div><div class="kpi-sub" id="kpiMvSaveSub">-</div></div>
  </section>

  <section class="tl-grid-2">
    <div class="tl-panel">
      <h2>1. Image Generation Pipeline</h2>
      <div class="tl-field"><label for="mvImgModel">Production Image Model</label><select id="mvImgModel" class="tl-select"></select></div>
      <div class="tl-field"><label for="mvDailyImgs">Published Final Images / Day</label><input id="mvDailyImgs" class="tl-input num" type="number" min="0" step="25" value="150"></div>
      <div class="tl-field"><label for="mvImgRetry">Generations per Published Image (Retries) <strong id="mvImgRetryVal">2.5x</strong></label><input id="mvImgRetry" class="tl-range" type="range" min="1" max="8" step="0.5" value="2.5"></div>
      <label class="tl-check-row"><input id="mvDraftCascade" type="checkbox" checked><span>Enable FLUX.1 schnell ($0.003) Draft Cascade for Exploration Retries</span></label>
    </div>

    <div class="tl-panel">
      <h2>2. Video Generation Pipeline</h2>
      <div class="tl-field"><label for="mvVidModel">Production Video Model</label><select id="mvVidModel" class="tl-select"></select></div>
      <div class="tl-row">
        <div class="tl-field"><label for="mvDailyClips">Published Clips / Day</label><input id="mvDailyClips" class="tl-input num" type="number" min="0" step="5" value="15"></div>
        <div class="tl-field"><label for="mvClipSec">Avg Clip Length (sec)</label><input id="mvClipSec" class="tl-input num" type="number" min="1" max="60" step="1" value="6"></div>
      </div>
      <div class="tl-field"><label for="mvVidRetry">Renders per Published Clip (Retries) <strong id="mvVidRetryVal">3.0x</strong></label><input id="mvVidRetry" class="tl-range" type="range" min="1" max="8" step="0.5" value="3.0"></div>
      <div class="tl-btn-bar"><button type="button" id="btnMvCopyMd" class="tl-btn tl-btn-primary">Copy Studio Budget Markdown</button></div>
    </div>
  </section>

  <section class="tl-grid-2">
    <div class="tl-panel">
      <h2>10 Image Models Cost Matrix</h2>
      <div class="tl-table-wrap"><table class="tl-table" style="min-width:440px"><thead><tr><th>Image Model</th><th>Per Img</th><th>Monthly</th><th>Annual</th></tr></thead><tbody id="mvImgTableBody"></tbody></table></div>
    </div>
    <div class="tl-panel">
      <h2>6 Video Models Cost Matrix</h2>
      <div class="tl-table-wrap"><table class="tl-table" style="min-width:440px"><thead><tr><th>Video Model</th><th>Per Sec</th><th>Monthly</th><th>Annual</th></tr></thead><tbody id="mvVidTableBody"></tbody></table></div>
    </div>
  </section>`
}), '0.9');

// --- PAGE 17: LLM LATENCY, TTFT & STREAMING UX SPEED CALCULATOR ---
registerPage('/tools/llm-latency-ttft-calculator.html', 'tools/llm-latency-ttft-calculator.html', renderShell({
  path: '/tools/llm-latency-ttft-calculator.html',
  active: 'selfhost',
  title: 'LLM Latency, TTFT & Streaming UX Speed Calculator — Cerebras, Groq, OpenAI, Anthropic, Gemini',
  description: 'Calculate Time-to-First-Token (TTFT), inter-token generation speed, total response time, and SLA compliance across 12 inference providers including Cerebras, Groq, Fireworks, GPT-5, and Claude 4.5.',
  scripts: ['/js/llm-latency-ttft-calculator.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger LLM Latency & TTFT Calculator', applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', url: `${ORIGIN}/tools/llm-latency-ttft-calculator.html`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'How is total LLM streaming response latency calculated?', acceptedAnswer: { '@type': 'Answer', text: 'Total end-to-end latency equals Network RTT + Time-to-First-Token (prefill time) + (Output Tokens divided by Output Tokens Per Second).' } }
    ] }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">STREAMING UX &amp; SLA ENGINEERING &bull; TTFT + TOK/SEC</div>
    <h1>LLM Latency, TTFT &amp; Streaming Speed Calculator</h1>
    <p>Model Time-to-First-Token (TTFT), full generation time, and cost per 10K requests across Cerebras, Groq, Fireworks, Google Gemini, OpenAI GPT-5, AWS Nova, and Anthropic Claude 4.5.</p>
  </section>

  <section class="tl-grid-4">
    <div class="kpi-card"><div class="kpi-label">Selected TTFT</div><div class="kpi-val accent" id="kpiLtTtft">0.00s</div><div class="kpi-sub" id="kpiLtTtftSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Total Wait Time</div><div class="kpi-val" id="kpiLtTotal">0.00s</div><div class="kpi-sub" id="kpiLtTotalSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Fastest Endpoint</div><div class="kpi-val accent" id="kpiLtFastest">0.00s</div><div class="kpi-sub" id="kpiLtFastestSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">SLA Pass Rate</div><div class="kpi-val" id="kpiLtPass">0 / 12</div><div class="kpi-sub" id="kpiLtPassSub">-</div></div>
  </section>

  <section class="tl-panel" style="margin-bottom:20px">
    <h2>Workload &amp; SLA Parameters</h2>
    <div class="tl-row">
      <div class="tl-field"><label for="ltProfile">Primary Inference Endpoint</label><select id="ltProfile" class="tl-select"></select></div>
      <div class="tl-field"><label for="ltSla">Target End-to-End SLA (Seconds)</label><input id="ltSla" class="tl-input num" type="number" min="0.5" max="120" step="0.5" value="5.0"></div>
    </div>
    <div class="tl-row">
      <div class="tl-field"><label for="ltInTok">Input Prompt Tokens</label><input id="ltInTok" class="tl-input num" type="number" min="50" step="250" value="2500"></div>
      <div class="tl-field"><label for="ltOutTok">Generated Output Tokens</label><input id="ltOutTok" class="tl-input num" type="number" min="10" step="50" value="500"></div>
      <div class="tl-field"><label for="ltRtt">Network RTT Overhead (ms)</label><input id="ltRtt" class="tl-input num" type="number" min="0" max="2000" step="20" value="80"></div>
    </div>
    <div class="tl-btn-bar"><button type="button" id="btnLtCopyMd" class="tl-btn tl-btn-primary">Copy Latency &amp; SLA Report (Markdown)</button></div>
  </section>

  <section class="tl-panel">
    <h2>12 Inference Endpoints Speed vs. Cost Matrix</h2>
    <div class="tl-table-wrap"><table class="tl-table" style="min-width:580px"><thead><tr><th>Endpoint &amp; Speed</th><th>TTFT</th><th>Gen Time</th><th>Total</th><th>Cost / 10K</th><th>SLA</th></tr></thead><tbody id="ltTableBody"></tbody></table></div>
  </section>`
}), '0.9');

// --- PAGE 18: AI SAAS PRICING TIER & CREDIT-PACK ARCHITECT ---
registerPage('/tools/ai-pricing-tier-designer.html', 'tools/ai-pricing-tier-designer.html', renderShell({
  path: '/tools/ai-pricing-tier-designer.html',
  active: 'saas',
  title: 'AI SaaS Pricing Tier & Credit-Pack Architect — Margin-Safe Credit Caps & Stripe JSON',
  description: 'Design Free, Pro, Team, and Enterprise AI SaaS pricing tiers with mathematically safe monthly credit caps, Stripe fee modeling, overage pack pricing, and copyable Markdown/JSON.',
  scripts: ['/js/ai-pricing-tier-designer.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger AI SaaS Pricing Tier Architect', applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', url: `${ORIGIN}/tools/ai-pricing-tier-designer.html`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'How do you set safe monthly AI credit limits per SaaS tier?', acceptedAnswer: { '@type': 'Answer', text: 'Subtract Stripe fees (2.9% + $0.30) and fixed hosting overhead from your allowable COGS budget at your target gross margin floor (e.g. 78%), then divide the remaining AI budget by your per-action LLM token cost.' } }
    ] }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">SAAS MONETIZATION &bull; CREDIT CAPS + GROSS MARGIN FLOOR</div>
    <h1>AI SaaS Pricing Tier &amp; Credit-Pack Architect</h1>
    <p>Stop guessing monthly AI credit limits. Set your target gross margin floor, select your underlying LLM, and auto-generate worst-case-safe Free, Pro, Team, and Enterprise tiers plus overage pack pricing.</p>
  </section>

  <section class="tl-grid-4">
    <div class="kpi-card"><div class="kpi-label">COGS / AI Action</div><div class="kpi-val" id="kpiPtAction">$0.0000</div><div class="kpi-sub" id="kpiPtActionSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Safe Pro Allowance</div><div class="kpi-val accent" id="kpiPtProCap">0 cr/mo</div><div class="kpi-sub" id="kpiPtProCapSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Safe Team Allowance</div><div class="kpi-val accent" id="kpiPtTeamCap">0 cr/mo</div><div class="kpi-sub" id="kpiPtTeamCapSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Overage Pack Rate</div><div class="kpi-val warn" id="kpiPtOverage">$0 / 1K</div><div class="kpi-sub" id="kpiPtOverageSub">-</div></div>
  </section>

  <section class="tl-grid-2">
    <div class="tl-panel">
      <h2>1. Unit Action Economics</h2>
      <div class="tl-field"><label for="ptModel">Underlying LLM Model</label><select id="ptModel" class="tl-select"></select></div>
      <div class="tl-row">
        <div class="tl-field"><label for="ptInTok">Avg Input Tokens / Action</label><input id="ptInTok" class="tl-input num" type="number" min="50" step="100" value="2800"></div>
        <div class="tl-field"><label for="ptOutTok">Avg Output Tokens / Action</label><input id="ptOutTok" class="tl-input num" type="number" min="20" step="50" value="650"></div>
      </div>
      <div class="tl-field"><label for="ptCache">Prompt Cache Hit Rate <strong id="ptCacheVal">55%</strong></label><input id="ptCache" class="tl-range" type="range" min="0" max="95" step="5" value="55"></div>
      <div class="tl-field"><label for="ptFixedInfra">Fixed Non-AI Infra / User ($/mo)</label><input id="ptFixedInfra" class="tl-input num" type="number" min="0" step="0.1" value="0.65"></div>
    </div>

    <div class="tl-panel">
      <h2>2. Tier Prices &amp; Margin Guardrail</h2>
      <div class="tl-field"><label for="ptMargin">Target Gross Margin Floor <strong id="ptMarginVal">78%</strong></label><input id="ptMargin" class="tl-range" type="range" min="50" max="92" step="1" value="78"></div>
      <div class="tl-row">
        <div class="tl-field"><label for="ptProPrice">Pro ($/mo)</label><input id="ptProPrice" class="tl-input num" type="number" min="5" step="1" value="29"></div>
        <div class="tl-field"><label for="ptTeamPrice">Team ($/seat)</label><input id="ptTeamPrice" class="tl-input num" type="number" min="10" step="5" value="79"></div>
        <div class="tl-field"><label for="ptEntPrice">Enterprise ($/seat)</label><input id="ptEntPrice" class="tl-input num" type="number" min="50" step="10" value="299"></div>
      </div>
      <div class="tl-btn-bar">
        <button type="button" id="btnPtCopyMd" class="tl-btn tl-btn-primary">Copy Pricing Table Markdown</button>
        <button type="button" id="btnPtCopyJson" class="tl-btn">Copy Billing JSON Spec</button>
      </div>
    </div>
  </section>

  <section class="tl-panel">
    <h2>Generated Margin-Safe SaaS Pricing Architecture</h2>
    <div class="tl-table-wrap"><table class="tl-table" style="min-width:600px"><thead><tr><th>Tier</th><th>Price</th><th>Safe Credit Cap</th><th>Max AI COGS</th><th>Worst-Case Net</th><th>Margin Floor</th><th>Overage</th></tr></thead><tbody id="ptTableBody"></tbody></table></div>
  </section>`
}), '0.9');

// --- PAGE 19: VECTOR DATABASE CLOUD COST COMPARATOR ---
registerPage('/tools/vector-db-cost-calculator.html', 'tools/vector-db-cost-calculator.html', renderShell({
  path: '/tools/vector-db-cost-calculator.html',
  active: 'rag',
  title: 'Vector Database Cloud Cost Comparator — Pinecone vs Qdrant vs pgvector vs Weaviate vs Turbopuffer',
  description: 'Compare monthly and 12-month TCO across Pinecone Serverless, Qdrant Cloud, PostgreSQL pgvector, Weaviate, and Turbopuffer with FP32, FP16, INT8, and Binary quantization.',
  scripts: ['/js/vector-db-cost-calculator.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger Vector DB Cost Comparator', applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', url: `${ORIGIN}/tools/vector-db-cost-calculator.html`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'How much RAM does INT8 or binary quantization save in a vector database?', acceptedAnswer: { '@type': 'Answer', text: 'Converting float32 embeddings to INT8 scalar quantization shrinks raw vector memory by 4x, while 1-bit binary quantization reduces raw memory by 32x—cutting managed HNSW hosting costs dramatically.' } }
    ] }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">RAG INFRASTRUCTURE FINOPS &bull; 5 VECTOR CLOUDS + QUANTIZATION</div>
    <h1>Vector Database Cloud Cost Comparator</h1>
    <p>Benchmark Pinecone Serverless, Qdrant Cloud, PostgreSQL pgvector, Weaviate, and Turbopuffer side by side across vector scale, embedding dimensions, and FP32/INT8/Binary compression.</p>
  </section>

  <section class="tl-grid-4">
    <div class="kpi-card"><div class="kpi-label">Lowest Monthly TCO</div><div class="kpi-val accent" id="kpiVdbBest">$0/mo</div><div class="kpi-sub" id="kpiVdbBestSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">HNSW Index Footprint</div><div class="kpi-val" id="kpiVdbRam">0 GB</div><div class="kpi-sub" id="kpiVdbRamSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">1-Time Embed Ingest</div><div class="kpi-val" id="kpiVdbIngest">$0</div><div class="kpi-sub" id="kpiVdbIngestSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">12-Mo Cloud Spread</div><div class="kpi-val warn" id="kpiVdbSpread">$0/yr</div><div class="kpi-sub" id="kpiVdbSpreadSub">-</div></div>
  </section>

  <section class="tl-panel" style="margin-bottom:20px">
    <h2>Vector Corpus, Quantization &amp; Query Load</h2>
    <div class="tl-row">
      <div class="tl-field"><label for="vdbVectors">Total Stored Vectors</label><input id="vdbVectors" class="tl-input num" type="number" min="10000" step="500000" value="5000000"></div>
      <div class="tl-field"><label for="vdbDims">Embedding Dimensions</label><select id="vdbDims" class="tl-select"><option value="384">384d (MiniLM)</option><option value="1024">1024d (Cohere / Voyage / BGE)</option><option value="1536" selected>1536d (OpenAI small)</option><option value="3072">3072d (OpenAI large / Gemini)</option></select></div>
      <div class="tl-field"><label for="vdbQuant">Vector Quantization</label><select id="vdbQuant" class="tl-select"><option value="fp32" selected>FP32 (Full 4 bytes/dim)</option><option value="fp16">FP16 / halfvec (2x smaller)</option><option value="int8">INT8 Scalar (4x smaller)</option><option value="binary">Binary 1-bit (32x smaller)</option></select></div>
    </div>
    <div class="tl-row">
      <div class="tl-field"><label for="vdbQueries">Monthly Read Queries</label><input id="vdbQueries" class="tl-input num" type="number" min="1000" step="500000" value="3000000"></div>
      <div class="tl-field"><label for="vdbUpserts">Monthly Upserts / Churn</label><input id="vdbUpserts" class="tl-input num" type="number" min="0" step="100000" value="500000"></div>
      <div class="tl-field"><label for="vdbEmbed">Embedding Model</label><select id="vdbEmbed" class="tl-select"></select></div>
    </div>
    <div class="tl-btn-bar"><button type="button" id="btnVdbCopyMd" class="tl-btn tl-btn-primary">Copy Vector DB TCO Report (Markdown)</button></div>
  </section>

  <section class="tl-panel">
    <h2>5-Provider Monthly &amp; 12-Month TCO Matrix</h2>
    <div class="tl-table-wrap"><table class="tl-table" style="min-width:600px"><thead><tr><th>Vector Database</th><th>Billed Footprint</th><th>Storage/Mo</th><th>Query+Write</th><th>Total/Mo</th><th>12-Mo TCO</th></tr></thead><tbody id="vdbTableBody"></tbody></table></div>
  </section>`
}), '0.9');

// --- PAGE 20: AI CODING ASSISTANT SEAT VS BYOK API CALCULATOR ---
registerPage('/tools/ai-coding-seat-vs-api.html', 'tools/ai-coding-seat-vs-api.html', renderShell({
  path: '/tools/ai-coding-seat-vs-api.html',
  active: 'agent',
  title: 'AI Coding Assistant Seat vs BYOK API Calculator — Cursor, Copilot, Windsurf, Claude Max',
  description: 'Calculate exact monthly team costs and break-even sessions per day comparing Cursor Pro/Business, GitHub Copilot, Windsurf, and Claude Max flat seats against direct cached BYOK LLM API keys.',
  scripts: ['/js/ai-coding-seat-vs-api.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger AI Coding Seat vs BYOK API Calculator', applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', url: `${ORIGIN}/tools/ai-coding-seat-vs-api.html`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'When is a flat-rate AI coding seat cheaper than a BYOK API key?', acceptedAnswer: { '@type': 'Answer', text: 'Light or occasional users running a few sessions per day are often cheaper on cached BYOK API keys, whereas heavy autonomous coding-agent users rapidly surpass flat $20–$100/seat tiers.' } }
    ] }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">ENGINEERING ORG FINOPS &bull; FLAT SEATS VS. CACHED BYOK API</div>
    <h1>AI Coding Assistant Seat vs. BYOK API Calculator</h1>
    <p>Compare org-wide monthly spend for Cursor, GitHub Copilot, Windsurf, and Claude Max flat developer seats against direct pay-as-you-go BYOK API keys with prompt caching.</p>
  </section>

  <section class="tl-grid-4">
    <div class="kpi-card"><div class="kpi-label">BYOK Cost / Dev</div><div class="kpi-val" id="kpiCsApiDev">$0/dev</div><div class="kpi-sub" id="kpiCsApiDevSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">BYOK Team Monthly</div><div class="kpi-val accent" id="kpiCsApiTeam">$0/mo</div><div class="kpi-sub" id="kpiCsApiTeamSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Lowest-Cost Option</div><div class="kpi-val accent" id="kpiCsWinner">-</div><div class="kpi-sub" id="kpiCsWinnerSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Seat Break-Even</div><div class="kpi-val warn" id="kpiCsBreakEven">0 sess/d</div><div class="kpi-sub" id="kpiCsBreakEvenSub">-</div></div>
  </section>

  <section class="tl-panel" style="margin-bottom:20px">
    <h2>Team Size &amp; Daily Coding Agent Workload</h2>
    <div class="tl-row">
      <div class="tl-field"><label for="csModel">BYOK API Model</label><select id="csModel" class="tl-select"></select></div>
      <div class="tl-field"><label for="csDevs">Developers on Team</label><input id="csDevs" class="tl-input num" type="number" min="1" step="5" value="25"></div>
      <div class="tl-field"><label for="csDays">Active Coding Days / Mo</label><input id="csDays" class="tl-input num" type="number" min="5" max="31" step="1" value="21"></div>
    </div>
    <div class="tl-row">
      <div class="tl-field"><label for="csSessions">Agent Sessions / Dev / Day</label><input id="csSessions" class="tl-input num" type="number" min="1" step="1" value="12"></div>
      <div class="tl-field"><label for="csInTok">Avg Input Tokens / Session</label><input id="csInTok" class="tl-input num" type="number" min="1000" step="2000" value="24000"></div>
      <div class="tl-field"><label for="csOutTok">Avg Output Tokens / Session</label><input id="csOutTok" class="tl-input num" type="number" min="100" step="200" value="1600"></div>
    </div>
    <div class="tl-field"><label for="csCache">Prompt Cache Hit Rate <strong id="csCacheVal">85%</strong></label><input id="csCache" class="tl-range" type="range" min="0" max="95" step="5" value="85"></div>
    <div class="tl-btn-bar"><button type="button" id="btnCsCopyMd" class="tl-btn tl-btn-primary">Copy VP Engineering Budget Memo (Markdown)</button></div>
  </section>

  <section class="tl-panel">
    <h2>Flat-Rate Seat Plans vs. Direct BYOK API Matrix</h2>
    <div class="tl-table-wrap"><table class="tl-table" style="min-width:600px"><thead><tr><th>Seat Plan</th><th>Seat Price</th><th>Team Seat/Mo</th><th>BYOK API/Mo</th><th>Break-Even</th><th>Verdict</th></tr></thead><tbody id="csTableBody"></tbody></table></div>
  </section>`
}), '0.9');

// --- PAGE 21: LLM CONTEXT CACHING WRITE-PREMIUM & TTL ROI CALCULATOR ---
registerPage('/tools/llm-context-caching-roi.html', 'tools/llm-context-caching-roi.html', renderShell({
  path: '/tools/llm-context-caching-roi.html',
  active: 'home',
  title: 'LLM Prompt Caching TTL & Write-Premium ROI Calculator — 5-Min vs 1-Hour vs Storage Cache',
  description: 'Calculate exact break-even hits per hour and monthly savings comparing No Caching, 5-minute ephemeral caching (1.25x write), 1-hour extended caching (2.0x write), and explicit storage TTL caches.',
  scripts: ['/js/llm-context-caching-roi.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger Prompt Caching TTL ROI Calculator', applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', url: `${ORIGIN}/tools/llm-context-caching-roi.html`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'How many cache hits are needed to break even on Anthropic 5-minute vs 1-hour prompt caching?', acceptedAnswer: { '@type': 'Answer', text: 'At a 90% cached-read discount, a 1.25x write premium (5-minute ephemeral cache) breaks even after 2 hits within the TTL window, while a 2.0x write premium (1-hour extended cache) breaks even after 3 hits.' } }
    ] }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">PROMPT CACHING FINOPS &bull; WRITE PREMIUM + TTL BREAK-EVEN</div>
    <h1>LLM Prompt Caching TTL &amp; Write-Premium ROI Calculator</h1>
    <p>Stop overpaying on cold cache writes. Model 5-minute ephemeral (1.25x write), 1-hour extended (2.0x write), and explicit context storage TTL caching against your real hourly traffic cadence.</p>
  </section>

  <section class="tl-grid-4">
    <div class="kpi-card"><div class="kpi-label">Optimal Monthly Spend</div><div class="kpi-val accent" id="kpiCcBest">$0/mo</div><div class="kpi-sub" id="kpiCcBestSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Net Cache Savings</div><div class="kpi-val accent" id="kpiCcSaveMo">$0/mo</div><div class="kpi-sub" id="kpiCcSaveMoSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">5-Min TTL Break-Even</div><div class="kpi-val" id="kpiCcBe5m">2 hits</div><div class="kpi-sub" id="kpiCcBe5mSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">1-Hr TTL Break-Even</div><div class="kpi-val warn" id="kpiCcBe1h">3 hits</div><div class="kpi-sub" id="kpiCcBe1hSub">-</div></div>
  </section>

  <section class="tl-panel" style="margin-bottom:20px">
    <h2>Shared Prefix Size &amp; Hourly Request Cadence</h2>
    <div class="tl-row">
      <div class="tl-field"><label for="ccModel">LLM Model</label><select id="ccModel" class="tl-select"></select></div>
      <div class="tl-field"><label for="ccPrefix">Static Cached Prefix (tokens)</label><input id="ccPrefix" class="tl-input num" type="number" min="1024" step="1000" value="25000"></div>
      <div class="tl-field"><label for="ccReqsHr">Requests / Active Hour</label><input id="ccReqsHr" class="tl-input num" type="number" min="1" step="5" value="30"></div>
    </div>
    <div class="tl-row">
      <div class="tl-field"><label for="ccHoursDay">Active Traffic Hours / Day</label><input id="ccHoursDay" class="tl-input num" type="number" min="1" max="24" step="1" value="16"></div>
      <div class="tl-field"><label for="ccDynIn">Dynamic User Input / Req (tok)</label><input id="ccDynIn" class="tl-input num" type="number" min="0" step="100" value="400"></div>
      <div class="tl-field"><label for="ccOutTok">Avg Output / Req (tok)</label><input id="ccOutTok" class="tl-input num" type="number" min="0" step="100" value="500"></div>
    </div>
    <div class="tl-btn-bar"><button type="button" id="btnCcCopyMd" class="tl-btn tl-btn-primary">Copy Cache TTL ROI Report (Markdown)</button></div>
  </section>

  <section class="tl-panel">
    <h2>4-Strategy Prompt Caching Monthly Cost Matrix</h2>
    <div class="tl-table-wrap"><table class="tl-table" style="min-width:600px"><thead><tr><th>Caching Strategy</th><th>Est. Hit Rate</th><th>Write / Storage</th><th>Prefix Reads</th><th>Total/Mo</th><th>Savings</th></tr></thead><tbody id="ccTableBody"></tbody></table></div>
  </section>`
}), '0.9');

// --- PAGE 22: LLM-AS-A-JUDGE & AI EVALUATION PIPELINE BUDGET CALCULATOR ---
registerPage('/tools/ai-eval-judge-budget.html', 'tools/ai-eval-judge-budget.html', renderShell({
  path: '/tools/ai-eval-judge-budget.html',
  active: 'agent',
  title: 'LLM-as-a-Judge & AI Evaluation Pipeline Budget Calculator — CI/CD + Prod Trace Sampling',
  description: 'Calculate monthly LLM-as-a-Judge API spend across CI pull-request regression suites and production trace sampling with rubric prompt caching and 50% async Batch discounts.',
  scripts: ['/js/ai-eval-judge-budget.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger LLM-as-a-Judge Eval Budget Calculator', applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', url: `${ORIGIN}/tools/ai-eval-judge-budget.html`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'How do AI teams cut LLM-as-a-Judge evaluation costs without losing grading quality?', acceptedAnswer: { '@type': 'Answer', text: 'Keep grading rubrics identical at the top of the prompt for 65–85% prefix cache hits, route nightly regression and prod sampling through 50%-off async Batch APIs, and calibrate mini judge models (GPT-5 mini / Gemini 2.5 Flash) against frontier gold sets.' } }
    ] }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">AI QUALITY &amp; EVALS FINOPS &bull; CI GATES + PROD TRACE SAMPLING</div>
    <h1>LLM-as-a-Judge &amp; CI Evaluation Budget Calculator</h1>
    <p>Size exact monthly API spend for PR regression eval suites and continuous production trace judging across 6 popular judge models — with shared rubric caching and 50% async Batch discounts.</p>
  </section>

  <section class="tl-grid-4">
    <div class="kpi-card"><div class="kpi-label">Active Eval Spend</div><div class="kpi-val accent" id="kpiEvMonthly">$0/mo</div><div class="kpi-sub" id="kpiEvMonthlySub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Total Judge Calls</div><div class="kpi-val" id="kpiEvCalls">0/mo</div><div class="kpi-sub" id="kpiEvCallsSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Cost per 1K Evals</div><div class="kpi-val" id="kpiEvPer1k">$0/1K</div><div class="kpi-sub" id="kpiEvPer1kSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Batch API Savings</div><div class="kpi-val accent" id="kpiEvBatchSave">$0/mo</div><div class="kpi-sub" id="kpiEvBatchSaveSub">-</div></div>
  </section>

  <section class="tl-panel" style="margin-bottom:20px">
    <h2>CI Suite &amp; Production Trace Sampling Parameters</h2>
    <div class="tl-row">
      <div class="tl-field"><label for="evModel">Primary Judge Model</label><select id="evModel" class="tl-select"></select></div>
      <div class="tl-field"><label for="evCases">Golden Eval Cases / Suite</label><input id="evCases" class="tl-input num" type="number" min="10" step="50" value="500"></div>
      <div class="tl-field"><label for="evCiRuns">CI / PR Eval Runs / Month</label><input id="evCiRuns" class="tl-input num" type="number" min="0" step="10" value="60"></div>
    </div>
    <div class="tl-row">
      <div class="tl-field"><label for="evProdTraces">Production Traces / Day</label><input id="evProdTraces" class="tl-input num" type="number" min="0" step="1000" value="10000"></div>
      <div class="tl-field"><label for="evRubrics">Scoring Rubrics / Case</label><input id="evRubrics" class="tl-input num" type="number" min="1" max="10" step="1" value="2"></div>
      <div class="tl-field"><label for="evInTok">Avg Judge Input (Rubric+Trace)</label><input id="evInTok" class="tl-input num" type="number" min="100" step="200" value="2200"></div>
      <div class="tl-field"><label for="evOutTok">Avg Judge Output (Verdict)</label><input id="evOutTok" class="tl-input num" type="number" min="20" step="50" value="350"></div>
    </div>
    <div class="tl-row">
      <div class="tl-field"><label for="evSamplePct">Prod Trace Sampling Rate <strong id="evSampleVal">5%</strong></label><input id="evSamplePct" class="tl-range" type="range" min="0" max="50" step="1" value="5"></div>
      <div class="tl-field"><label for="evCache">Rubric Prefix Cache Hit Rate <strong id="evCacheVal">65%</strong></label><input id="evCache" class="tl-range" type="range" min="0" max="95" step="5" value="65"></div>
    </div>
    <label class="tl-check-row"><input id="evBatch" type="checkbox" checked><span>Apply 50% Async Batch API Discount for Nightly &amp; Sampled Evals</span></label>
    <div class="tl-btn-bar"><button type="button" id="btnEvCopyMd" class="tl-btn tl-btn-primary">Copy AI Eval Budget Memo (Markdown)</button></div>
  </section>

  <section class="tl-panel">
    <h2>6 Judge Models Cost Comparison Matrix</h2>
    <div class="tl-table-wrap"><table class="tl-table" style="min-width:600px"><thead><tr><th>Judge LLM</th><th>Per 1K Evals</th><th>Real-Time/Mo</th><th>50% Batch/Mo</th><th>Active/Mo</th><th>Annual</th></tr></thead><tbody id="evTableBody"></tbody></table></div>
  </section>`
}), '0.9');

// --- PAGE 23: AI GUARDRAIL, PII REDACTION & SAFETY MODERATION COST CALCULATOR ---
registerPage('/tools/ai-guardrail-moderation-cost.html', 'tools/ai-guardrail-moderation-cost.html', renderShell({
  path: '/tools/ai-guardrail-moderation-cost.html',
  active: 'saas',
  title: 'AI Guardrail, PII Redaction & Safety Moderation API Cost Calculator — Bedrock, Azure, Llama Guard',
  description: 'Calculate monthly AI safety guardrail overhead % across OpenAI Moderation, Llama Guard 3 8B, Azure Content Safety, AWS Bedrock Guardrails, and custom LLM policy checks.',
  scripts: ['/js/ai-guardrail-moderation-cost.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger AI Guardrail & Moderation Cost Calculator', applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', url: `${ORIGIN}/tools/ai-guardrail-moderation-cost.html`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'How much do AI guardrails and PII redaction add to an LLM API bill?', acceptedAnswer: { '@type': 'Answer', text: 'Hosted open-weight classifiers like Llama Guard 3 add under 1–3% overhead, whereas per-character cloud guardrails (AWS Bedrock Guardrails, Azure Content Safety) can add 15–50%+ on long-context inputs and outputs.' } }
    ] }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">ENTERPRISE AI SECURITY FINOPS &bull; GUARDRAILS + PII REDACTION</div>
    <h1>AI Guardrail, PII Redaction &amp; Moderation Cost Calculator</h1>
    <p>Quantify the exact safety-layer tax on top of your primary LLM bill across OpenAI Moderation, Llama Guard 3 8B, Azure Content Safety, AWS Bedrock Guardrails, and custom LLM policy checks.</p>
  </section>

  <section class="tl-grid-4">
    <div class="kpi-card"><div class="kpi-label">Primary LLM Spend</div><div class="kpi-val" id="kpiGrPrimary">$0/mo</div><div class="kpi-sub" id="kpiGrPrimarySub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Lowest Paid Guardrail</div><div class="kpi-val accent" id="kpiGrCheapPaid">$0/mo</div><div class="kpi-sub" id="kpiGrCheapPaidSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Highest Guardrail Stack</div><div class="kpi-val warn" id="kpiGrPriciest">$0/mo</div><div class="kpi-sub" id="kpiGrPriciestSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Scanned Payload</div><div class="kpi-val" id="kpiGrScanned">0 tok</div><div class="kpi-sub" id="kpiGrScannedSub">-</div></div>
  </section>

  <section class="tl-panel" style="margin-bottom:20px">
    <h2>Traffic Volume &amp; Safety Scanning Scope</h2>
    <div class="tl-row">
      <div class="tl-field"><label for="grModel">Primary Production LLM</label><select id="grModel" class="tl-select"></select></div>
      <div class="tl-field"><label for="grReqs">Daily Production Requests</label><input id="grReqs" class="tl-input num" type="number" min="10" step="1000" value="10000"></div>
    </div>
    <div class="tl-row">
      <div class="tl-field"><label for="grInTok">Avg Input Tokens / Req</label><input id="grInTok" class="tl-input num" type="number" min="50" step="100" value="1800"></div>
      <div class="tl-field"><label for="grOutTok">Avg Output Tokens / Req</label><input id="grOutTok" class="tl-input num" type="number" min="20" step="50" value="450"></div>
      <div class="tl-field"><label for="grCache">Primary Cache Hit Rate <strong id="grCacheVal">50%</strong></label><input id="grCache" class="tl-range" type="range" min="0" max="95" step="5" value="50"></div>
    </div>
    <label class="tl-check-row"><input id="grCheckOut" type="checkbox" checked><span>Scan Both User Input AND Model Output (Bidirectional Guardrail)</span></label>
    <label class="tl-check-row"><input id="grPiiScan" type="checkbox" checked><span>Include PII Entity Detection &amp; Redaction Policy Layer (+35% unit scan)</span></label>
    <div class="tl-btn-bar"><button type="button" id="btnGrCopyMd" class="tl-btn tl-btn-primary">Copy Guardrail Cost Report (Markdown)</button></div>
  </section>

  <section class="tl-panel">
    <h2>5-Provider Guardrail Overhead Comparison Matrix</h2>
    <div class="tl-table-wrap"><table class="tl-table" style="min-width:600px"><thead><tr><th>Guardrail Architecture</th><th>Guardrail/Mo</th><th>Overhead %</th><th>Combined/Mo</th><th>Annual</th></tr></thead><tbody id="grTableBody"></tbody></table></div>
  </section>`
}), '0.9');

// --- PAGE 24: MULTI-AGENT ORCHESTRATION & SWARM COST CALCULATOR ---
registerPage('/tools/multi-agent-orchestration-cost.html', 'tools/multi-agent-orchestration-cost.html', renderShell({
  path: '/tools/multi-agent-orchestration-cost.html',
  active: 'agent',
  title: 'Multi-Agent Orchestration & Swarm Cost Calculator — LangGraph, CrewAI, Planner + Workers',
  description: 'Model multi-agent Planner + Worker + Critic swarm token costs across LangGraph, CrewAI, and AutoGen — comparing All-Frontier swarms against Tiered Role Routing and Compact Handoff State.',
  scripts: ['/js/multi-agent-orchestration-cost.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger Multi-Agent Swarm Cost Calculator', applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', url: `${ORIGIN}/tools/multi-agent-orchestration-cost.html`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'How do you cut multi-agent LangGraph or CrewAI API costs?', acceptedAnswer: { '@type': 'Answer', text: 'Assign your frontier model strictly to the Planner/Orchestrator role, route parallel Worker agents to fast Flash/Mini models, and pass compact JSON state summaries instead of full raw transcripts between handoffs.' } }
    ] }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">MULTI-AGENT FINOPS &bull; PLANNER + WORKERS + CRITIC SWARMS</div>
    <h1>Multi-Agent Orchestration &amp; Swarm Cost Calculator</h1>
    <p>Size exact per-run, monthly, and annual costs for LangGraph, CrewAI, and AutoGen multi-agent pipelines — and quantify savings from tiered role routing and compact handoff state.</p>
  </section>

  <section class="tl-grid-4">
    <div class="kpi-card"><div class="kpi-label">All-Frontier Swarm</div><div class="kpi-val danger" id="kpiSwAllFront">$0/mo</div><div class="kpi-sub" id="kpiSwAllFrontSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Tiered Role Swarm</div><div class="kpi-val accent" id="kpiSwTiered">$0/mo</div><div class="kpi-sub" id="kpiSwTieredSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Tiered + Compact State</div><div class="kpi-val accent" id="kpiSwCompact">$0/mo</div><div class="kpi-sub" id="kpiSwCompactSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Annual Swarm Savings</div><div class="kpi-val accent" id="kpiSwSaveYr">$0/yr</div><div class="kpi-sub" id="kpiSwSaveYrSub">-</div></div>
  </section>

  <section class="tl-panel" style="margin-bottom:20px">
    <h2>Swarm Topology &amp; Role Model Assignment</h2>
    <div class="tl-row">
      <div class="tl-field"><label for="swPlanner">Planner / Orchestrator LLM</label><select id="swPlanner" class="tl-select"></select></div>
      <div class="tl-field"><label for="swWorker">Parallel Worker Agents LLM</label><select id="swWorker" class="tl-select"></select></div>
      <div class="tl-field"><label for="swCritic">Critic / Verifier LLM</label><select id="swCritic" class="tl-select"></select></div>
    </div>
    <div class="tl-row">
      <div class="tl-field"><label for="swWorkers">Parallel Workers / Run</label><input id="swWorkers" class="tl-input num" type="number" min="1" max="20" step="1" value="4"></div>
      <div class="tl-field"><label for="swHandoffs">Orchestration Handoff Rounds</label><input id="swHandoffs" class="tl-input num" type="number" min="1" max="15" step="1" value="3"></div>
      <div class="tl-field"><label for="swRuns">Swarm Runs / Day</label><input id="swRuns" class="tl-input num" type="number" min="1" step="50" value="250"></div>
    </div>
    <div class="tl-row">
      <div class="tl-field"><label for="swCtx">Avg Context / Agent Hop (tok)</label><input id="swCtx" class="tl-input num" type="number" min="500" step="500" value="6000"></div>
      <div class="tl-field"><label for="swOut">Avg Output / Agent Hop (tok)</label><input id="swOut" class="tl-input num" type="number" min="50" step="100" value="650"></div>
      <div class="tl-field"><label for="swCache">Prefix Cache Hit Rate <strong id="swCacheVal">75%</strong></label><input id="swCache" class="tl-range" type="range" min="0" max="95" step="5" value="75"></div>
    </div>
    <div class="tl-btn-bar"><button type="button" id="btnSwCopyMd" class="tl-btn tl-btn-primary">Copy Swarm Architecture Memo (Markdown)</button></div>
  </section>

  <section class="tl-panel">
    <h2>Multi-Agent Architecture Cost Comparison</h2>
    <div class="tl-table-wrap"><table class="tl-table" style="min-width:600px"><thead><tr><th>Swarm Architecture</th><th>Calls/Run</th><th>Cost/Run</th><th>Monthly</th><th>Annual</th><th>Savings</th></tr></thead><tbody id="swTableBody"></tbody></table></div>
  </section>`
}), '0.9');

// --- PAGES 6–13: 8 PROGRAMMATIC MODEL COMPARISON PAGES ---
for (const c of COMPARISONS) {
  const mA = ENGINE.getModel(c.a);
  const mB = ENGINE.getModel(c.b);
  const scenarios = [
    { name: 'Startup Chat / Support (2K in / 400 out · 1,000 req/d)', inT: 2000, outT: 400, req: 1000, cache: 50 },
    { name: 'Production RAG Assistant (5K in / 700 out · 5,000 req/d)', inT: 5000, outT: 700, req: 5000, cache: 60 },
    { name: 'Coding / Research Agent (18K in / 1.8K out · 500 req/d)', inT: 18000, outT: 1800, req: 500, cache: 80 }
  ];
  const rowsHtml = scenarios.map(s => {
    const rA = ENGINE.calcModelWorkload(mA, { inputTokens: s.inT, outputTokens: s.outT, dailyRequests: s.req, cacheHitRate: s.cache, useBatch: false });
    const rB = ENGINE.calcModelWorkload(mB, { inputTokens: s.inT, outputTokens: s.outT, dailyRequests: s.req, cacheHitRate: s.cache, useBatch: false });
    const winner = rA.monthly <= rB.monthly ? mA.name : mB.name;
    const save = Math.abs(rA.monthly - rB.monthly);
    return `        <tr><td><strong>${esc(s.name)}</strong></td><td class="num">${ENGINE.formatUsd(rA.monthly)}/mo</td><td class="num">${ENGINE.formatUsd(rB.monthly)}/mo</td><td><span class="tl-badge best">${esc(winner)} (-${ENGINE.formatUsd(save)}/mo)</span></td></tr>`;
  }).join('\n');

  const urlPath = `/compare/${c.slug}.html`;
  registerPage(urlPath, `compare/${c.slug}.html`, renderShell({
    path: urlPath,
    active: 'home',
    title: c.title,
    description: c.summary,
    ogType: 'article',
    schemaGraph: [
      { '@type': 'Article', headline: c.title, description: c.summary, datePublished: TODAY, dateModified: TODAY, author: { '@type': 'Organization', name: 'TokenLedger' }, mainEntityOfPage: `${ORIGIN}${urlPath}`, image: `${ORIGIN}/og-image.png` },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'TokenLedger', item: `${ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: c.title, item: `${ORIGIN}${urlPath}` }
      ] }
    ],
    body: `  <section class="tl-hero">
    <div class="tl-kicker">HEAD-TO-HEAD LLM FINOPS BENCHMARK</div>
    <h1>${esc(c.title)}</h1>
    <p>${esc(c.summary)}</p>
    <div class="tl-btn-bar">
      <a class="tl-btn tl-btn-primary" href="/?frontier=${mA.id}&amp;mini=${mB.id}&amp;in=2500&amp;out=600&amp;req=1000&amp;cache=50">Simulate Custom Workload Live →</a>
      <a class="tl-btn" href="/tools/saas-margin.html">Check SaaS Margin Impact</a>
    </div>
  </section>

  <section class="tl-grid-2">
    <div class="tl-panel">
      <h2>${esc(mA.name)} (${esc(mA.provider)})</h2>
      <div class="kpi-val num" style="margin-bottom:8px">$${mA.input.toFixed(2)} / $${mA.output.toFixed(2)}</div>
      <div class="kpi-sub">Per 1M Input / Output tokens · Cached Input: $${mA.cachedInput.toFixed(3)}/1M · Context: ${ENGINE.formatInt(mA.context)} tokens · Batch Discount: ${Math.round(mA.batchDiscount * 100)}%</div>
    </div>
    <div class="tl-panel">
      <h2>${esc(mB.name)} (${esc(mB.provider)})</h2>
      <div class="kpi-val num" style="margin-bottom:8px">$${mB.input.toFixed(2)} / $${mB.output.toFixed(2)}</div>
      <div class="kpi-sub">Per 1M Input / Output tokens · Cached Input: $${mB.cachedInput.toFixed(3)}/1M · Context: ${ENGINE.formatInt(mB.context)} tokens · Batch Discount: ${Math.round(mB.batchDiscount * 100)}%</div>
    </div>
  </section>

  <section class="tl-panel" style="margin-bottom:24px">
    <h2>Real-World Monthly Cost Comparison (With Realistic Prompt Caching)</h2>
    <div class="tl-table-wrap">
      <table class="tl-table">
        <thead><tr><th>Workload Scenario</th><th>${esc(mA.name)}</th><th>${esc(mB.name)}</th><th>Lower Cost Option</th></tr></thead>
        <tbody>
${rowsHtml}
        </tbody>
      </table>
    </div>
  </section>

  <section class="tl-prose">
    <h2>How Engineering Teams Combine Both Models</h2>
    <p>In production AI systems, choosing between ${esc(mA.name)} and ${esc(mB.name)} is rarely binary. High-margin teams route routine extraction, classification, and first-draft generation to the lower-cost tier while reserving higher-reasoning capacity for complex escalations — routinely capturing 60–80% cost reductions with minimal quality loss.</p>
  </section>`
  }), '0.8');
}

// --- PAGES 14–17: 4 DEEP ENGINEERING FINOPS GUIDES ---
for (const g of GUIDES) {
  const urlPath = `/guides/${g.slug}.html`;
  const secHtml = g.sections.map(s => `    <h2>${esc(s.h2)}</h2>\n    <p>${esc(s.p)}</p>`).join('\n');
  registerPage(urlPath, `guides/${g.slug}.html`, renderShell({
    path: urlPath,
    active: 'guide',
    title: g.title,
    description: g.desc,
    ogType: 'article',
    schemaGraph: [
      { '@type': 'Article', headline: g.title, description: g.desc, datePublished: TODAY, dateModified: TODAY, author: { '@type': 'Organization', name: 'TokenLedger' }, mainEntityOfPage: `${ORIGIN}${urlPath}`, image: `${ORIGIN}/og-image.png` },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'TokenLedger', item: `${ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: g.title, item: `${ORIGIN}${urlPath}` }
      ] }
    ],
    body: `  <section class="tl-hero">
    <div class="tl-kicker">AI FINOPS ENGINEERING PLAYBOOK</div>
    <h1>${esc(g.title)}</h1>
    <p>${esc(g.desc)}</p>
    <div class="tl-btn-bar"><a class="tl-btn tl-btn-primary" href="${g.ctaHref}">${esc(g.ctaLabel)}</a></div>
  </section>
  <article class="tl-panel tl-prose">
${secHtml}
    <div class="tl-btn-bar" style="margin-top:24px"><a class="tl-btn tl-btn-primary" href="${g.ctaHref}">${esc(g.ctaLabel)}</a><a class="tl-btn" href="/">All 24 Models Estimator</a></div>
  </article>`
  }), '0.8');
}

// --- PAGES 18–19: ABOUT/METHODOLOGY & PRIVACY ---
registerPage('/about.html', 'about.html', renderShell({
  path: '/about.html',
  active: '',
  title: 'Pricing Methodology, Sources & Open JSON Feed',
  description: 'How TokenLedger compiles public LLM API list rates, calibrates client-side token estimates, and keeps calculations 100% browser-private.',
  hideBooks: true,
  schemaGraph: [{ '@type': 'WebPage', name: 'TokenLedger Methodology', url: `${ORIGIN}/about.html` }],
  body: `  <section class="tl-hero"><div class="tl-kicker">TRANSPARENT METHODOLOGY</div><h1>Pricing Methodology &amp; Public JSON Feed</h1><p>TokenLedger is an independent, open-source AI FinOps workbench designed for engineers, founders, and finance leads.</p></section>
  <article class="tl-panel tl-prose">
    <h2>1. Rate Table Integrity</h2>
    <p>All 24 LLM rates and 6 embedding rates are stored in a single public JSON feed at <a href="/api/pricing.json" style="color:var(--accent)">/api/pricing.json</a> (snapshot date: ${TODAY}). Standard published list prices are used for planning estimates; enterprise committed-use discounts or regional surcharges should be verified directly on each vendor’s console.</p>
    <h2>2. Client-Side Token Estimation</h2>
    <p>To keep pasted prompts 100% private with zero server calls, TokenLedger runs a deterministic multi-family estimator calibrated separately for ASCII prose, code/JSON punctuation density, and CJK/Korean UTF-8 scripts across OpenAI o200k_base, Anthropic Claude BPE, and Google Gemini SentencePiece tokenizers. Expect ±5–10% variance compared to exact server-side tokenizers.</p>
    <h2>3. Sustainability &amp; Sponsorship</h2>
    <p>TokenLedger is free with no login wall. Selected pages feature curated AI Engineering &amp; FinOps books with disclosed affiliate links (dopabrain-20) and open GitHub sponsorship slots.</p>
  </article>`
}), '0.5');

registerPage('/privacy.html', 'privacy.html', renderShell({
  path: '/privacy.html',
  active: '',
  title: 'Privacy Policy — 100% Browser-Private AI Cost Calculator',
  description: 'TokenLedger processes every prompt, JSON schema, and financial parameter locally in your browser with zero server storage.',
  hideBooks: true,
  schemaGraph: [{ '@type': 'WebPage', name: 'TokenLedger Privacy Policy', url: `${ORIGIN}/privacy.html` }],
  body: `  <section class="tl-hero"><div class="tl-kicker">ZERO-UPLOAD PRIVACY</div><h1>Privacy Policy</h1><p>Last updated: ${TODAY}. TokenLedger is built as a static, 100% client-side web application.</p></section>
  <article class="tl-panel tl-prose">
    <h2>Zero Prompt &amp; Financial Data Collection</h2>
    <p>Anything you type or paste into TokenLedger — prompts, system instructions, JSON schemas, revenue numbers, or seat counts — is computed exclusively inside your browser’s local JavaScript runtime. We never upload, store, log, or train on your inputs.</p>
    <h2>Local Storage</h2>
    <p>We store only your dark/light theme preference (<code>tl_theme_v1</code>) and display currency preference (<code>tl_currency_v1</code>) in browser <code>localStorage</code>.</p>
    <h2>Cookie-Free Privacy-First Analytics</h2>
    <p>We use <strong>Cloudflare Web Analytics</strong> solely to count aggregated page views and Core Web Vitals performance without cookies, cross-site tracking, or personal identifiers. Your calculator inputs, prompts, and JSON schemas are never sent to any analytics service.</p>
    <h2>Affiliate Disclosure</h2>
    <p>Curated technical book recommendations link to Amazon with affiliate tag <code>dopabrain-20</code> and <code>rel="sponsored"</code> attributes.</p>
  </article>`
}), '0.3');

// --- INTERNATIONAL LOCALIZED LANDING HUBS (/ko/, /ja/, /de/, /fr/, /es/, /pt/) ---
const LOCALE_HUBS = [
  {
    lang: 'ko',
    kicker: '24개 AI 모델 · 100% 브라우저 로컬 · 서버 전송 없음',
    title: 'AI · LLM API 비용 계산기 (GPT-5, Claude 4, Gemini 2.5, DeepSeek) — 프롬프트 캐싱·배치·FinOps',
    desc: 'GPT-5, Claude 4, Gemini 2.5, DeepSeek, Llama 4 등 24개 LLM API 요금을 프롬프트 캐싱, 50% 배치 할인, 모델 라우팅 절감액과 함께 브라우저에서 무료로 계산하세요.',
    h1: 'AI · LLM API 비용 계산기 & FinOps 스튜디오',
    lead: 'OpenAI GPT-5, Anthropic Claude 4, Google Gemini 2.5, DeepSeek, Llama 4 등 24개 모델의 요청당·월간·연간 비용을 프롬프트 캐싱과 70/30 모델 라우팅 절감까지 포함해 즉시 비교하세요.',
    s1: '1. 워크로드 설정', s2: '2. 실시간 토큰 계산기 & 모델 캐스케이드', s3: '3. 24개 모델 실시간 비용 비교표',
    lIn: '요청당 입력 토큰', lOut: '요청당 출력 토큰', lReq: '일일 요청 수', lCache: '프롬프트 캐시 적중률', lBatch: '50% 비동기 Batch API 할인 적용', bShare: '공유 URL 복사', bMd: 'Markdown 표 복사'
  },
  {
    lang: 'ja',
    kicker: '24モデル対応 · 100% ブラウザ完結 · データ送信ゼロ',
    title: 'AI・LLM API料金計算ツール (GPT-5, Claude 4, Gemini 2.5, DeepSeek) — キャッシュ＆バッチ対応',
    desc: 'GPT-5・Claude 4・Gemini 2.5・DeepSeek・Llama 4など24モデルのAPI料金をプロンプトキャッシュや50%バッチ割引込みでブラウザ完結シミュレーション。',
    h1: 'AI・LLM API 料金シミュレーター & FinOps スタジオ',
    lead: '主要24モデルの1リクエスト・月額・年額コストをリアルタイム比較。プロンプトキャッシュ、50%バッチ割引、モデルルーティング削減効果やCSV/Markdown出力に対応。',
    s1: '1. ワークロード設定', s2: '2. ライブトークン計測 & モデルカスケード', s3: '3. 24モデル月額・年額比較マトリクス',
    lIn: '入力トークン / リクエスト', lOut: '出力トークン / リクエスト', lReq: '1日のリクエスト数', lCache: 'プロンプトキャッシュ率', lBatch: '50% Batch API 割引を適用', bShare: '共有URLコピー', bMd: 'Markdownコピー'
  },
  {
    lang: 'de',
    kicker: '24 KI-MODELLE · 100% LOKAL IM BROWSER · KEIN UPLOAD',
    title: 'KI & LLM API Kostenrechner (GPT-5, Claude 4, Gemini 2.5, DeepSeek) — Caching & Batch',
    desc: 'Kostenloser, 100% privater LLM API Kostenrechner für 24 Modelle inkl. Prompt Caching, 50% Batch-Rabatt, Model-Cascade-Routing sowie CSV- und PDF-Export.',
    h1: 'KI & LLM API Kostenrechner & FinOps Studio',
    lead: 'Vergleiche reale Produktionskosten für GPT-5, Claude 4, Gemini 2.5, DeepSeek, Llama 4 und Mistral – inklusive Prompt Caching, Batch-API, Agenten-Burn und SaaS-Marge.',
    s1: '1. Workload-Parameter', s2: '2. Live-Token-Schätzer & Model-Cascade', s3: '3. 24-Modelle Kostenmatrix im Vergleich',
    lIn: 'Input-Tokens / Anfrage', lOut: 'Output-Tokens / Anfrage', lReq: 'Anfragen / Tag', lCache: 'Prompt-Cache-Trefferquote', lBatch: '50% Async Batch-API-Rabatt anwenden', bShare: 'Link kopieren', bMd: 'Markdown kopieren'
  },
  {
    lang: 'fr',
    kicker: '24 MODÈLES IA · 100% LOCAL NAVIGATEUR · ZÉRO ENVOI',
    title: 'Calculateur Coût API LLM & IA (GPT-5, Claude 4, Gemini 2.5, DeepSeek) — Cache & Batch',
    desc: 'Simulateur gratuit et 100% privé des coûts API de 24 LLM (GPT-5, Claude 4, Gemini 2.5, DeepSeek, Mistral) avec Prompt Caching, remise Batch 50% et export CSV/PDF.',
    h1: 'Calculateur de Coût API LLM & Studio FinOps',
    lead: 'Estimez vos coûts mensuels et annuels sur 24 modèles IA (OpenAI, Anthropic, Google, DeepSeek, Meta, Mistral) avec mise en cache de prompts, routage cascade et export CSV/Markdown.',
    s1: '1. Paramètres de charge', s2: '2. Compteur de tokens & Routage Cascade', s3: '3. Comparatif des 24 modèles LLM',
    lIn: 'Tokens entrée / requête', lOut: 'Tokens sortie / requête', lReq: 'Requêtes / jour', lCache: 'Taux de cache prompt', lBatch: 'Appliquer -50% Batch API', bShare: 'Copier le lien', bMd: 'Copier Markdown'
  },
  {
    lang: 'es',
    kicker: '24 MODELOS IA · 100% PRIVADO EN NAVEGADOR · SIN ENVÍOS',
    title: 'Calculadora de Costos API LLM e IA (GPT-5, Claude 4, Gemini 2.5, DeepSeek) — Caché y Batch',
    desc: 'Calculadora gratuita y 100% local de costos API para 24 modelos LLM con Prompt Caching, descuento Batch 50%, enrutamiento en cascada y exportación CSV/Markdown.',
    h1: 'Calculadora de Costos API LLM & Estudio FinOps',
    lead: 'Compara el gasto mensual y anual en 24 modelos IA (GPT-5, Claude 4, Gemini 2.5, DeepSeek, Llama 4 y Mistral) con caché de prompts, agentes multiturno y márgenes SaaS.',
    s1: '1. Parámetros de carga', s2: '2. Contador de tokens y Cascada', s3: '3. Matriz comparativa de 24 modelos',
    lIn: 'Tokens entrada / petición', lOut: 'Tokens salida / petición', lReq: 'Peticiones / día', lCache: 'Acierto de Prompt Cache', lBatch: 'Aplicar 50% descuento Batch API', bShare: 'Copiar enlace', bMd: 'Copiar Markdown'
  },
  {
    lang: 'pt',
    kicker: '24 MODELOS IA · 100% LOCAL NO NAVEGADOR · SEM UPLOAD',
    title: 'Calculadora de Custos API LLM e IA (GPT-5, Claude 4, Gemini 2.5, DeepSeek) — Cache e Batch',
    desc: 'Simulador gratuito e 100% privado de custos API para 24 modelos LLM com Prompt Caching, desconto Batch 50%, roteamento em cascata e exportação CSV/PDF.',
    h1: 'Calculadora de Custos API LLM & Estúdio FinOps',
    lead: 'Compare custos mensais e anuais em 24 modelos de IA (GPT-5, Claude 4, Gemini 2.5, DeepSeek, Llama 4 e Mistral) com cache de prompts, agentes e margem SaaS.',
    s1: '1. Parâmetros de carga', s2: '2. Contador de tokens e Cascata', s3: '3. Matriz de custos dos 24 modelos',
    lIn: 'Tokens entrada / requisição', lOut: 'Tokens saída / requisição', lReq: 'Requisições / dia', lCache: 'Taxa de Prompt Cache', lBatch: 'Aplicar 50% desconto Batch API', bShare: 'Copiar link', bMd: 'Copiar Markdown'
  },
  {
    lang: 'zh',
    kicker: '24款大模型 · 100% 浏览器本地运行 · 零数据上传',
    title: 'AI 大模型 API 费用计算器 (GPT-5, Claude 4, Gemini 2.5, DeepSeek) — 缓存与批处理',
    desc: '免费、100%本地运行的24款大模型 API 成本计算器，支持提示词缓存、50% Batch 批处理折扣、70/30 模型路由省钱测算与 CSV/Markdown 导出。',
    h1: 'AI 与大模型 API 成本计算器 & FinOps 工作台',
    lead: '即时对比 OpenAI GPT-5、Claude 4、Gemini 2.5、DeepSeek、Llama 4 与通义千问等24款模型的单次、月度与年度 API 成本。',
    s1: '1. 业务负载参数', s2: '2. 实时 Token 估算与模型路由', s3: '3. 24款模型实时成本对比表',
    lIn: '每次请求输入 Token', lOut: '每次请求输出 Token', lReq: '每日请求次数', lCache: '提示词缓存命中率', lBatch: '启用 50% 异步 Batch API 折扣', bShare: '复制分享链接', bMd: '复制 Markdown 表格'
  },
  {
    lang: 'hi',
    kicker: '24 AI मॉडल · 100% ब्राउज़र प्राइवेट · कोई अपलोड नहीं',
    title: 'AI और LLM API कॉस्ट कैलकुलेटर (GPT-5, Claude 4, Gemini 2.5, DeepSeek)',
    desc: '24 प्रमुख LLM मॉडल के मासिक और वार्षिक API खर्च की गणना करें — प्रॉम्प्ट कैशिंग, 50% बैच छूट और मॉडल राउटिंग बचत के साथ।',
    h1: 'AI और LLM API लागत कैलकुलेटर व FinOps स्टूडियो',
    lead: 'GPT-5, Claude 4, Gemini 2.5, DeepSeek और Llama 4 सहित 24 मॉडलों की प्रति-रिक्वेस्ट, मासिक और वार्षिक लागत 100% ब्राउज़र में तुरंत तुलना करें।',
    s1: '1. वर्कलोड सेटिंग्स', s2: '2. लाइव टोकन काउंटर व मॉडल कैस्केड', s3: '3. 24 मॉडल लागत तुलना तालिका',
    lIn: 'इनपुट टोकन / रिक्वेस्ट', lOut: 'आउटपुट टोकन / रिक्वेस्ट', lReq: 'दैनिक रिक्वेस्ट', lCache: 'प्रॉम्प्ट कैश हिट रेट', lBatch: '50% बैच API छूट लागू करें', bShare: 'लिंक कॉपी करें', bMd: 'Markdown कॉपी करें'
  },
  {
    lang: 'id',
    kicker: '24 MODEL AI · 100% PRIVAT DI BROWSER · TANPA UPLOAD',
    title: 'Kalkulator Biaya API LLM & AI (GPT-5, Claude 4, Gemini 2.5, DeepSeek)',
    desc: 'Hitung biaya bulanan & tahunan 24 API LLM secara lokal dengan Prompt Caching, diskon Batch 50%, simulasi model router, dan ekspor CSV/Markdown.',
    h1: 'Kalkulator Biaya API LLM & Studio FinOps',
    lead: 'Bandingkan biaya real-time untuk GPT-5, Claude 4, Gemini 2.5, DeepSeek, Llama 4, dan Mistral lengkap dengan caching, agen multi-turn, dan margin SaaS.',
    s1: '1. Parameter Beban Kerja', s2: '2. Penghitung Token & Router Kaskade', s3: '3. Matriks Biaya 24 Model LLM',
    lIn: 'Token Input / Permintaan', lOut: 'Token Output / Permintaan', lReq: 'Permintaan / Hari', lCache: 'Rasio Prompt Cache', lBatch: 'Terapkan Diskon Batch API 50%', bShare: 'Salin Tautan', bMd: 'Salin Markdown'
  },
  {
    lang: 'tr',
    kicker: '24 YAPAY ZEKA MODELİ · %100 TARAYICIDA YEREL',
    title: 'Yapay Zeka & LLM API Maliyet Hesaplayıcı (GPT-5, Claude 4, Gemini 2.5, DeepSeek)',
    desc: 'Prompt Caching, %50 Batch API indirimi ve model yönlendirme tasarrufuyla 24 LLM modelinin aylık/yıllık API maliyetini tarayıcıda ücretsiz hesaplayın.',
    h1: 'AI & LLM API Maliyet Hesaplayıcı ve FinOps Stüdyosu',
    lead: 'GPT-5, Claude 4, Gemini 2.5, DeepSeek, Llama 4 ve Mistral dahil 24 modelin anlık maliyetlerini ve ajan/SaaS bütçelerini karşılaştırın.',
    s1: '1. İş Yükü Parametreleri', s2: '2. Canlı Token Ölçer ve Model Kaskadı', s3: '3. 24 Model Maliyet Karşılaştırma Tablosu',
    lIn: 'Girdi Token / İstek', lOut: 'Çıktı Token / İstek', lReq: 'Günlük İstek Sayısı', lCache: 'Prompt Cache İsabet Oranı', lBatch: '%50 Batch API İndirimi Uygula', bShare: 'Bağlantıyı Kopyala', bMd: 'Markdown Kopyala'
  }
];

for (const lh of LOCALE_HUBS) {
  const urlPath = `/${lh.lang}/`;
  registerPage(urlPath, `${lh.lang}/index.html`, renderShell({
    lang: lh.lang,
    path: urlPath,
    active: 'home',
    hreflangs: HOME_HREFLANGS,
    title: lh.title,
    description: lh.desc,
    scripts: ['/js/budget-card.js', '/js/studio-home.js'],
    schemaGraph: [
      { '@type': 'SoftwareApplication', name: `TokenLedger (${lh.lang.toUpperCase()})`, inLanguage: lh.lang, applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', url: `${ORIGIN}${urlPath}`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } }
    ],
    body: `  <section class="tl-hero">
    <div class="tl-kicker">${esc(lh.kicker)}</div>
    <h1>${esc(lh.h1)}</h1>
    <p>${esc(lh.lead)}</p>
    <div class="tl-pills">
      <a class="tl-pill" href="/" style="text-decoration:none">English</a>
      <a class="tl-pill" href="/ko/" style="text-decoration:none">한국어</a>
      <a class="tl-pill" href="/ja/" style="text-decoration:none">日本語</a>
      <a class="tl-pill" href="/de/" style="text-decoration:none">Deutsch</a>
      <a class="tl-pill" href="/fr/" style="text-decoration:none">Français</a>
      <a class="tl-pill" href="/es/" style="text-decoration:none">Español</a>
      <a class="tl-pill" href="/pt/" style="text-decoration:none">Português</a>
    </div>
  </section>

  <section class="tl-grid-4">
    <div class="kpi-card"><div class="kpi-label">Lowest Monthly</div><div class="kpi-val accent" id="kpiCheapest">$0.00/mo</div><div class="kpi-sub" id="kpiCheapestSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">OpenAI GPT-5</div><div class="kpi-val" id="kpiGpt5">$0.00/mo</div><div class="kpi-sub" id="kpiGpt5Sub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Claude Sonnet 4</div><div class="kpi-val" id="kpiSonnet">$0.00/mo</div><div class="kpi-sub" id="kpiSonnetSub">-</div></div>
    <div class="kpi-card"><div class="kpi-label">Cascade Savings</div><div class="kpi-val accent" id="kpiCascadeSave">$0.00/mo</div><div class="kpi-sub" id="kpiCascadeSub">-</div></div>
  </section>

  <section class="tl-grid-2">
    <div class="tl-panel">
      <h2>${esc(lh.s1)}</h2>
      <div class="tl-chips">
        <button type="button" class="tl-chip" data-preset="support">Support Bot (5K/d)</button>
        <button type="button" class="tl-chip" data-preset="coding">Coding Agent (18K in)</button>
        <button type="button" class="tl-chip" data-preset="rag">RAG Search (2K/d)</button>
        <button type="button" class="tl-chip" data-preset="batch">Batch ETL (15K/d)</button>
      </div>
      <div class="tl-row">
        <div class="tl-field"><label for="inTokens">${esc(lh.lIn)}</label><input id="inTokens" class="tl-input num" type="number" min="0" step="100" value="2500"></div>
        <div class="tl-field"><label for="outTokens">${esc(lh.lOut)}</label><input id="outTokens" class="tl-input num" type="number" min="0" step="50" value="600"></div>
      </div>
      <div class="tl-row">
        <div class="tl-field"><label for="dailyReqs">${esc(lh.lReq)}</label><input id="dailyReqs" class="tl-input num" type="number" min="1" step="100" value="1000"></div>
        <div class="tl-field"><label for="sortSelect">Sort</label><select id="sortSelect" class="tl-select"><option value="monthly">Monthly Cost</option><option value="input">Input $/1M</option><option value="context">Context Window</option></select></div>
      </div>
      <div class="tl-field"><label for="cacheSlider">${esc(lh.lCache)} <strong id="cacheVal">50%</strong></label><input id="cacheSlider" class="tl-range" type="range" min="0" max="95" step="5" value="50"></div>
      <label class="tl-check-row"><input id="batchToggle" type="checkbox"><span>${esc(lh.lBatch)}</span></label>
      <div class="tl-btn-bar">
        <button type="button" id="btnShare" class="tl-btn tl-btn-primary">${esc(lh.bShare)}</button>
        <button type="button" id="btnMarkdown" class="tl-btn">${esc(lh.bMd)}</button>
        <button type="button" id="btnCsv" class="tl-btn">CSV</button>
        <button type="button" id="btnJson" class="tl-btn">JSON</button>
        <button type="button" id="btnPrint" class="tl-btn">PDF</button>
      </div>
    </div>
    <div class="tl-panel">
      <h2>${esc(lh.s2)}</h2>
      <div class="tl-field">
        <label for="livePrompt">Prompt / JSON (100% Local)</label>
        <textarea id="livePrompt" class="tl-textarea" placeholder="Paste prompt or JSON here..."></textarea>
        <div id="promptStats" class="kpi-sub num" style="margin-top:6px">0 OpenAI tok · 0 Claude tok · 0 Gemini tok</div>
      </div>
      <div class="tl-row">
        <div class="tl-field"><label for="cascadeFrontier">Frontier Model</label><select id="cascadeFrontier" class="tl-select"></select></div>
        <div class="tl-field"><label for="cascadeMini">Fast / Mini Model</label><select id="cascadeMini" class="tl-select"></select></div>
      </div>
      <div class="tl-field"><label for="offloadSlider">Mini Traffic % <strong id="offloadVal">70%</strong></label><input id="offloadSlider" class="tl-range" type="range" min="0" max="95" step="5" value="70"></div>
      <div id="cascadeOut" class="kpi-sub num" style="padding:10px 12px;border-radius:10px;background:var(--accent-soft);color:var(--text);font-weight:600"></div>
    </div>
  </section>

  <section class="tl-panel">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px">
      <h2 style="margin:0">${esc(lh.s3)}</h2>
      <div id="spreadSummary" class="kpi-sub num" style="margin:0"></div>
    </div>
    <div class="tl-chips">
      <button type="button" class="tl-chip active" data-provider="all">All (${ENGINE.MODELS.length})</button>
      <button type="button" class="tl-chip" data-provider="OpenAI">OpenAI</button>
      <button type="button" class="tl-chip" data-provider="Anthropic">Anthropic</button>
      <button type="button" class="tl-chip" data-provider="Google">Google</button>
      <button type="button" class="tl-chip" data-provider="DeepSeek">DeepSeek</button>
    </div>
    <div class="tl-table-wrap">
      <table class="tl-table">
        <thead><tr><th>Model &amp; Context</th><th>Tier</th><th>In / Out (1M)</th><th>Per Req</th><th>Monthly</th><th>Annual</th><th>Relative</th></tr></thead>
        <tbody id="modelTableBody"></tbody>
      </table>
    </div>
  </section>`
  }), '0.9');
}

// --- INDEXNOW KEY FILE ---
const INDEXNOW_KEY = '7a3f9c12e84b4d6fa01c58e2b94d3f10';
writeFile(`${INDEXNOW_KEY}.txt`, INDEXNOW_KEY);

// --- SITEMAP.XML, ROBOTS.TXT, LLMS.TXT, LLMS-FULL.TXT, CLOUDFLARE _HEADERS ---
const smXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  ALL_URLS.map(u => `  <url><loc>${u.url}</loc><lastmod>${TODAY}</lastmod><changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`).join('\n') +
  `\n</urlset>\n`;
writeFile('sitemap.xml', smXml);

writeFile('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`);

writeFile('_headers', `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/api/pricing.json
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=3600
`);

const llmsTxt = `# TokenLedger — AI & LLM API FinOps Studio

> Browser-private AI & LLM API cost calculator, multi-turn agent burn simulator, SaaS gross margin calculator, AI Guardrail/PII cost planner, Multi-Agent Swarm calculator, Prompt Caching TTL ROI planner, LLM-as-a-Judge eval budgeter, Vector DB comparator, AI coding seat vs BYOK planner, and public JSON pricing feed covering ${ENGINE.MODELS.length} flagship models across 24 interactive workspaces.

## Core Interactive Tools
- [${ENGINE.MODELS.length}-Model LLM API Cost Estimator](${ORIGIN}/): Live prompt token counter, prompt caching, 50% batch discounts, model cascade savings, CSV/JSON/PDF export.
- [AI Guardrail, PII & Moderation Cost Calculator](${ORIGIN}/tools/ai-guardrail-moderation-cost.html): Quantify safety overhead % across AWS Bedrock Guardrails, Azure Content Safety, Llama Guard 3 & OpenAI Moderation.
- [Multi-Agent Orchestration & Swarm Cost Calculator](${ORIGIN}/tools/multi-agent-orchestration-cost.html): Model LangGraph/CrewAI Planner + Flash Workers + Critic swarms vs all-frontier orchestration.
- [LLM Prompt Caching TTL & Write-Premium ROI Calculator](${ORIGIN}/tools/llm-context-caching-roi.html): Compare 5-min ephemeral (1.25x write) vs 1-hour extended (2.0x write) vs explicit storage TTL caching break-even hits.
- [LLM-as-a-Judge & CI Evaluation Budget Calculator](${ORIGIN}/tools/ai-eval-judge-budget.html): Size monthly CI regression eval suites and prod trace sampling across 6 judge models with 50% Batch discounts.
- [AI Agent Loop Burn Calculator](${ORIGIN}/tools/agent-budget.html): Quadratic O(N²) turn-by-turn token snowballing vs. caching and sliding-window summarization.
- [MCP & Tool Schema Bloat Auditor](${ORIGIN}/tools/mcp-schema-auditor.html): Upfront MCP server schema token tax, lazy tool deferral savings, and raw JSON tool ranker.
- [AI SaaS Gross Margin Simulator](${ORIGIN}/tools/saas-margin.html): Per-seat LLM COGS, payment fees, gross margin %, and power-user break-even caps.
- [RAG & Vector DB TCO Planner](${ORIGIN}/tools/rag-calculator.html): Embedding ingestion, HNSW RAM footprint, re-index churn, and Top-K synthesis spend.
- [Vector Database Cloud Cost Comparator](${ORIGIN}/tools/vector-db-cost-calculator.html): Pinecone Serverless vs Qdrant Cloud vs pgvector vs Weaviate vs Turbopuffer across FP32/INT8/Binary quantization.
- [AI Coding Assistant Seat vs. BYOK API Calculator](${ORIGIN}/tools/ai-coding-seat-vs-api.html): Cursor, Copilot, Windsurf & Claude Max developer seat break-even vs cached BYOK token spend.
- [Self-Hosted GPU vs Cloud API Break-Even Calculator](${ORIGIN}/tools/self-host-vs-api.html): H100/A100/L40S/4090 vLLM hourly + DevOps break-even vs cloud LLM APIs.
- [Voice, Vision & Multimodal Cost Studio](${ORIGIN}/tools/multimodal-budget.html): PDF/image vision tokens, OpenAI Realtime vs Gemini Live voice, and image generation.
- [AI Startup Burn & Runway Planner](${ORIGIN}/tools/ai-runway.html): 24-month cash trajectory, MRR-scaled LLM burn, and Default-Alive month calculator.
- [Prompt A/B Compression Cost Diff & CI Guard](${ORIGIN}/tools/prompt-diff.html): Before/after prompt token savings across 6 flagship models + GitHub Action YAML generator.
- [Fine-Tuning vs. RAG vs. Prompt Caching 12-Month TCO](${ORIGIN}/tools/fine-tune-vs-rag.html): Compare LoRA retrains, vector DB synthesis, and long-context prompt caching with ADR export.
- [LLM Rate-Limit (RPM/TPM/Concurrency) Capacity Planner](${ORIGIN}/tools/llm-rate-limit-planner.html): Peak TPM, Little's Law concurrency sizing, vendor tier guidance, and rate-limiter JSON policy export.
- [LLM GPU VRAM & KV-Cache Quantization Calculator](${ORIGIN}/tools/gpu-vram-calculator.html): Exact weights + GQA KV-cache VRAM across FP16/FP8/Q4_K_M for Llama 70B, Qwen & DeepSeek-R1.
- [Enterprise LLM Savings Waterfall (Cache + Cascade + Batch)](${ORIGIN}/tools/batch-vs-realtime-router.html): Stacked FinOps savings waterfall & CFO executive memo export.
- [Speech-to-Text (STT) & TTS Audio API Cost Calculator](${ORIGIN}/tools/audio-transcription-cost.html): Compare Whisper, Deepgram Nova-3, Groq, AssemblyAI, ElevenLabs & Cartesia with VAD silence trimming.
- [AI Image & Video Generation Studio Budget Calculator](${ORIGIN}/tools/image-video-gen-budget.html): Unit economics for FLUX, GPT-Image-1, Imagen 3, Veo, Runway Gen-4 & Sora with retry multipliers and draft cascades.
- [LLM Latency, TTFT & Streaming Speed Calculator](${ORIGIN}/tools/llm-latency-ttft-calculator.html): Benchmark TTFT, tok/s throughput, and SLA pass rates across Cerebras, Groq, Fireworks, Gemini, GPT-5 & Claude 4.5.
- [AI SaaS Pricing Tier & Credit-Pack Architect](${ORIGIN}/tools/ai-pricing-tier-designer.html): Generate margin-safe Free/Pro/Team/Enterprise credit allowances & Stripe billing JSON specs.
- [Context Window & JSON Minifier Inspector](${ORIGIN}/tools/token-inspector.html): OpenAI/Claude/Gemini token estimates and one-click JSON tool schema minification.

## International Hubs
- [Korean (한국어)](${ORIGIN}/ko/) · [Japanese (日本語)](${ORIGIN}/ja/) · [German (Deutsch)](${ORIGIN}/de/) · [French (Français)](${ORIGIN}/fr/) · [Spanish (Español)](${ORIGIN}/es/) · [Portuguese (Português)](${ORIGIN}/pt/)

## Public Pricing Data API
- [Machine-Readable JSON Pricing Feed](${ORIGIN}/api/pricing.json): ${ENGINE.MODELS.length} LLM models + ${ENGINE.EMBEDDINGS.length} embedding models (${TODAY}).

## Model Comparisons & Playbooks
${COMPARISONS.map(c => `- [${c.title}](${ORIGIN}/compare/${c.slug}.html): ${c.summary}`).join('\n')}
${GUIDES.map(g => `- [${g.title}](${ORIGIN}/guides/${g.slug}.html): ${g.desc}`).join('\n')}
`;
writeFile('llms.txt', llmsTxt);
writeFile('llms-full.txt', llmsTxt + `\n## Supported Models (${ENGINE.MODELS.length})\n` + ENGINE.MODELS.map(m => `- ${m.name} (${m.provider}): $${m.input}/1M in, $${m.cachedInput}/1M cached, $${m.output}/1M out, ${m.context} ctx`).join('\n') + '\n');

console.log(`[BUILD COMPLETE] Generated ${ALL_URLS.length} HTML pages + sitemap.xml + robots.txt + _headers + llms*.txt`);
