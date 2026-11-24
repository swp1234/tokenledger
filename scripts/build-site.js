#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ENGINE = require(path.join(ROOT, 'js', 'pricing-engine.js'));
const ORIGIN = 'https://tokenledger.pages.dev';
const REPO_URL = 'https://github.com/swp1234/tokenledger';
const TODAY = '2026-11-24';

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
    { href: '/', label: 'Cost Estimator', key: 'home' },
    { href: '/tools/agent-budget.html', label: 'Agent Burn', key: 'agent' },
    { href: '/tools/saas-margin.html', label: 'SaaS Margin', key: 'saas' },
    { href: '/tools/rag-calculator.html', label: 'RAG TCO', key: 'rag' },
    { href: '/tools/token-inspector.html', label: 'Token Inspector', key: 'inspector' },
    { href: '/guides/llm-cost-optimization-playbook.html', label: 'Playbook', key: 'guide' }
  ];
  const navHtml = nav.map(n => `        <a href="${n.href}"${opts.active === n.key ? ' class="active"' : ''}>${n.label}</a>`).join('\n');
  const scriptsHtml = (opts.scripts || []).map(s => `  <script src="${s}" defer></script>`).join('\n');

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': opts.schemaGraph
  }, null, 2);

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <title>${esc(opts.title)} | TokenLedger</title>
  <meta name="description" content="${esc(opts.description)}">
  <meta name="dateModified" content="${TODAY}">
  <link rel="canonical" href="${canonical}">

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
        <a href="/api/pricing.json" class="tl-icon-btn" title="Public JSON Pricing Feed">JSON API</a>
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
  { slug: 'prompt-caching-vs-batch-api', a: 'claude-sonnet-4', b: 'gpt-5', title: 'LLM Prompt Caching vs Batch API (50% Off): Which Saves More Money?', summary: 'Quantitative FinOps comparison of 75–90% prompt caching discounts versus 50% async batch API discounts for agents and bulk jobs.' }
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

registerPage('/', 'index.html', renderShell({
  path: '/',
  active: 'home',
  title: 'AI & LLM API Cost Calculator (24 Models) — Prompt Caching, Batch & FinOps Studio',
  description: 'Free, 100% browser-private AI & LLM API cost calculator comparing 24 models (GPT-5, Claude 4, Gemini 2.5, DeepSeek, Llama 4, Grok 3) with prompt caching, cascade routing, and CSV/PDF export.',
  scripts: ['/js/studio-home.js'],
  schemaGraph: [
    { '@type': 'SoftwareApplication', name: 'TokenLedger AI & LLM Cost Studio', applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', url: `${ORIGIN}/`, isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: 'Browser-private LLM API cost estimator, agent burn simulator, SaaS gross margin calculator, and RAG TCO planner.' },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Does TokenLedger send my pasted prompts to any server?', acceptedAnswer: { '@type': 'Answer', text: 'Never. All token estimation, pricing calculations, CSV/JSON exports, and minification run 100% locally inside your browser with zero network transmission of prompt text.' } },
      { '@type': 'Question', name: 'How does LLM prompt caching affect monthly API cost?', acceptedAnswer: { '@type': 'Answer', text: 'Major providers discount repeated prompt prefixes by 75% to 90%. For high-volume apps with stable system prompts or tool schemas, prompt caching often cuts total input spend by more than half.' } }
    ] }
  ],
  body: `  <section class="tl-hero">
    <div class="tl-kicker">24 MODELS &bull; 100% BROWSER-PRIVATE &bull; ZERO DATA UPLOAD</div>
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
      <h2 style="margin:0">3. 24-Model Side-by-Side Cost Matrix</h2>
      <div id="spreadSummary" class="kpi-sub num" style="margin:0"></div>
    </div>
    <div class="tl-chips" aria-label="Filter by Provider">
      <button type="button" class="tl-chip active" data-provider="all">All Providers (24)</button>
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
      <a class="tl-link-card" href="/tools/saas-margin.html"><strong>AI SaaS Gross Margin Simulator</strong><span>Calculate per-seat AI COGS, Stripe fees, net profit, and power-user break-even caps.</span><em>Open Simulator →</em></a>
      <a class="tl-link-card" href="/tools/rag-calculator.html"><strong>RAG &amp; Vector DB TCO Planner</strong><span>Estimate embedding ingestion, HNSW RAM footprint, re-index churn, and synthesis cost.</span><em>Open Planner →</em></a>
      <a class="tl-link-card" href="/tools/token-inspector.html"><strong>Context &amp; JSON Minifier Inspector</strong><span>Inspect OpenAI/Claude/Gemini tokens and minify tool JSON schemas for instant savings.</span><em>Open Inspector →</em></a>
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
    <p>We store only your dark/light theme preference (<code>tl_theme_v1</code>) in browser <code>localStorage</code>.</p>
    <h2>Affiliate Disclosure</h2>
    <p>Curated technical book recommendations link to Amazon with affiliate tag <code>dopabrain-20</code> and <code>rel="sponsored"</code> attributes.</p>
  </article>`
}), '0.3');

// --- SITEMAP.XML, ROBOTS.TXT, LLMS.TXT, LLMS-FULL.TXT, CLOUDFLARE _HEADERS ---
const smXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  ALL_URLS.map(u => `  <url><loc>${u.url}</loc><lastmod>${TODAY}</lastmod><changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`).join('\n') +
  `\n</urlset>\n`;
writeFile('sitemap.xml', smXml);

writeFile('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`);

writeFile('_headers', `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/api/pricing.json
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=3600
`);

const llmsTxt = `# TokenLedger — AI & LLM API FinOps Studio

> Browser-private AI & LLM API cost calculator, multi-turn agent burn simulator, SaaS gross margin calculator, RAG TCO planner, and public JSON pricing feed covering 24 flagship models.

## Core Interactive Tools
- [24-Model LLM API Cost Estimator](${ORIGIN}/): Live prompt token counter, prompt caching, 50% batch discounts, model cascade savings, CSV/JSON/PDF export.
- [AI Agent Loop Burn Calculator](${ORIGIN}/tools/agent-budget.html): Quadratic O(N²) turn-by-turn token snowballing vs. caching and sliding-window summarization.
- [AI SaaS Gross Margin Simulator](${ORIGIN}/tools/saas-margin.html): Per-seat LLM COGS, payment fees, gross margin %, and power-user break-even caps.
- [RAG & Vector DB TCO Planner](${ORIGIN}/tools/rag-calculator.html): Embedding ingestion, HNSW RAM footprint, re-index churn, and Top-K synthesis spend.
- [Context Window & JSON Minifier Inspector](${ORIGIN}/tools/token-inspector.html): OpenAI/Claude/Gemini token estimates and one-click JSON tool schema minification.

## Public Pricing Data API
- [Machine-Readable JSON Pricing Feed](${ORIGIN}/api/pricing.json): 24 LLM models + 6 embedding models (${TODAY}).

## Model Comparisons & Playbooks
${COMPARISONS.map(c => `- [${c.title}](${ORIGIN}/compare/${c.slug}.html): ${c.summary}`).join('\n')}
${GUIDES.map(g => `- [${g.title}](${ORIGIN}/guides/${g.slug}.html): ${g.desc}`).join('\n')}
`;
writeFile('llms.txt', llmsTxt);
writeFile('llms-full.txt', llmsTxt + `\n## Supported Models (${ENGINE.MODELS.length})\n` + ENGINE.MODELS.map(m => `- ${m.name} (${m.provider}): $${m.input}/1M in, $${m.cachedInput}/1M cached, $${m.output}/1M out, ${m.context} ctx`).join('\n') + '\n');

console.log(`[BUILD COMPLETE] Generated ${ALL_URLS.length} HTML pages + sitemap.xml + robots.txt + _headers + llms*.txt`);
