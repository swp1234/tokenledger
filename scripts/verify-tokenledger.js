#!/usr/bin/env node
'use strict';
const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ENGINE = require(path.join(ROOT, 'js', 'pricing-engine.js'));

// Load Playwright from parent workspace if not installed locally
let chromium;
try { ({ chromium } = require('playwright')); }
catch (_) { ({ chromium } = require('e:\\Fire Project\\node_modules\\playwright')); }

function runUnitTests() {
  const apiJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'api', 'pricing.json'), 'utf8'));
  assert.strictEqual(apiJson.models.length, 24, 'Expected 24 models in api/pricing.json');
  assert.strictEqual(apiJson.models.length, ENGINE.MODELS.length, 'api/pricing.json and pricing-engine.js model count mismatch');
  assert.strictEqual(apiJson.embeddings.length, ENGINE.EMBEDDINGS.length, 'embedding count mismatch');
  for (let i = 0; i < apiJson.models.length; i++) {
    assert.strictEqual(apiJson.models[i].id, ENGINE.MODELS[i].id);
    assert.strictEqual(apiJson.models[i].input, ENGINE.MODELS[i].input);
    assert.strictEqual(apiJson.models[i].output, ENGINE.MODELS[i].output);
  }

  // Token estimator sanity (ASCII, JSON, Korean)
  const enEst = ENGINE.estimateTokens('Calculate the monthly API budget for a 15-turn coding agent.');
  assert(enEst.tokensOpenAI >= 10 && enEst.tokensOpenAI <= 25, `Unexpected EN token estimate: ${enEst.tokensOpenAI}`);
  const koEst = ENGINE.estimateTokens('인공지능 API 비용을 정확하게 계산하는 브라우저 로컬 도구입니다.');
  assert(koEst.cjkRatio > 50 && koEst.tokensOpenAI > 15, `Unexpected KO token estimate: ${JSON.stringify(koEst)}`);

  // Workload + Caching + Batch math
  const raw = ENGINE.calcModelWorkload('claude-sonnet-4', { inputTokens: 10000, outputTokens: 1000, dailyRequests: 1000, cacheHitRate: 0, useBatch: false });
  const cached = ENGINE.calcModelWorkload('claude-sonnet-4', { inputTokens: 10000, outputTokens: 1000, dailyRequests: 1000, cacheHitRate: 80, useBatch: false });
  const batched = ENGINE.calcModelWorkload('claude-sonnet-4', { inputTokens: 10000, outputTokens: 1000, dailyRequests: 1000, cacheHitRate: 0, useBatch: true });
  assert(cached.monthly < raw.monthly, 'Prompt caching must reduce monthly cost');
  assert(Math.abs(batched.monthly - raw.monthly * 0.5) < 0.01, 'Batch discount must be exact 50%');

  // Cascade savings
  const casc = ENGINE.calcCascadeSavings('claude-opus-4', 'gemini-2.5-flash', { inputTokens: 3000, outputTokens: 700, dailyRequests: 1000, cacheHitRate: 50, useBatch: false }, 70);
  assert(casc.savedPct > 60 && casc.blendedMonthly < casc.frontierMonthly, 'Cascade routing must save >60% on Opus->Flash');

  // Agent quadratic burn
  const ag = ENGINE.calcAgentBurn('claude-sonnet-4', { turns: 15, systemTokens: 3000, growthPerTurn: 1500, outputPerTurn: 400, runsPerDay: 200, cacheHitRate: 85, windowTurns: 5 });
  assert(ag.breakdown.length === 15);
  assert(ag.snowballMultiplier > 3, `Expected quadratic snowball >3x, got ${ag.snowballMultiplier}`);
  assert(ag.cachedMonthly < ag.naiveMonthly && ag.windowMonthly < ag.naiveMonthly, 'Caching & sliding window must beat naive history');

  // SaaS gross margin
  const saas = ENGINE.calcSaasMargin('gemini-2.5-flash', { price: 29, seats: 500, reqPerSeatMonth: 250, inputTokens: 2500, outputTokens: 600, cacheHitRate: 50, fixedInfraPerSeat: 0.4 });
  assert(saas.grossMarginPct > 80 && saas.health === 'healthy' && saas.breakEvenReqPerSeat > 1000);

  // RAG TCO
  const rag = ENGINE.calcRagBudget('text-embedding-3-small', 'gemini-2.5-flash', { docCount: 25000, tokensPerDoc: 1500, chunkSize: 512, overlapPct: 15, monthlyChurnPct: 10, dailyQueries: 3000, topK: 6, outputTokens: 500 });
  assert(rag.totalChunks > 50000 && rag.monthlyTotal > rag.oneTimeIngestCost);

  // Self-Hosted GPU vs Cloud API break-even
  const sh = ENGINE.calcSelfHostVsApi('claude-sonnet-4', { gpuHourly: 2.85, hoursPerDay: 24, devopsMonthly: 450, tokPerSec: 340, avgUtilPct: 35, inputTokens: 2500, outputTokens: 600, dailyRequests: 8000, cacheHitRate: 50 });
  assert(sh.selfHostMonthly > 2000 && sh.breakEvenDailyReqs > 500 && ['self-host-wins', 'hybrid-borderline', 'cloud-api-wins', 'needs-more-gpus'].includes(sh.verdict));

  // MCP Schema Tax & Tool JSON Auditor
  const mcp = ENGINE.calcMcpSchemaTax('claude-sonnet-4', { servers: 5, toolsPerServer: 14, tokensPerTool: 260, turnsPerSession: 16, sessionsPerDay: 400, cacheHitRate: 80, lazyDeferPct: 85 });
  assert(mcp.totalTools === 70 && mcp.monthlyLazy < mcp.monthlyCached && mcp.monthlyCached < mcp.monthlyUncached);
  const audit = ENGINE.auditToolJson(JSON.stringify([{ name: 'a', description: 'long desc', inputSchema: { type: 'object' } }]));
  assert(audit.count === 1 && audit.totalMinified <= audit.totalPretty);

  // Multimodal Vision / Voice / Image Gen
  const mm = ENGINE.calcMultimodalBudget({ visionModel: 'gemini-2.5-flash-vision', voiceModel: 'gemini-live-flash', imageModel: 'imagen-3', dailyImages: 1500, visionOutTok: 250, dailyVoiceMins: 600, dailyGenImages: 200 });
  assert(mm.totalMonthly > 500 && mm.voiceMonthly > mm.visionMonthly);

  // AI Runway & Prompt A/B Diff
  const rw = ENGINE.calcAiRunway({ cashOnHand: 250000, mrr: 8000, mrrGrowthPct: 12, monthlyAiSpend: 4500, monthlyCloudInfra: 1800, monthlyPayrollOps: 18000, aiScalesWithMrr: true });
  assert(rw.timeline.length === 24 && rw.runwayMonths > 0);
  const pd = ENGINE.calcPromptDiff('You are a very polite verbose helpful assistant that always writes long sentences.', 'Role: concise assistant.', 2000, 50);
  assert(pd.savedOpenAI > 0 && pd.compressionPct > 40);

  // OG PNG check
  const ogBuf = fs.readFileSync(path.join(ROOT, 'og-image.png'));
  assert(ogBuf.length > 10000 && ogBuf.slice(0, 8).toString('hex') === '89504e470d0a1a0a', 'og-image.png must be a valid PNG');

  console.log('[PASS] Unit tests: pricing-engine, 24 models parity, token estimator, agent burn, SaaS margin, RAG TCO, OG PNG');
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' };

function startServer() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const p = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
      let fp = path.join(ROOT, p.replace(/^\/+/, ''));
      if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) fp = path.join(fp, 'index.html');
      if (!fs.existsSync(fp)) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
      fs.createReadStream(fp).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, origin: `http://127.0.0.1:${srv.address().port}` }));
  });
}

async function runBrowserTests() {
  const sm = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const paths = [...sm.matchAll(/<loc>https:\/\/tokenledger-8x7\.pages\.dev([^<]+)<\/loc>/g)].map(m => m[1]);
  assert(paths.length === 52, `Expected 52 sitemap URLs, got ${paths.length}`);

  const { srv, origin } = await startServer();
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));

    // Check all 19 pages on mobile 390x844
    for (const p of paths) {
      const resp = await page.goto(`${origin}${p}`, { waitUntil: 'domcontentloaded' });
      assert.strictEqual(resp.status(), 200, `HTTP ${resp.status()} on ${p}`);
      const rep = await page.evaluate(() => ({
        overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
        title: document.title,
        h1: document.querySelector('h1')?.textContent?.trim() || '',
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
      }));
      assert(rep.overflow <= 1, `Mobile 390px overflow ${rep.overflow}px on ${p}`);
      assert(rep.h1.length > 5 && rep.canonical.startsWith('https://tokenledger-8x7.pages.dev'), `Metadata issue on ${p}`);
    }
    console.log(`[PASS] All ${paths.length} pages verified on 390x844 mobile (0px overflow, 200 OK, metadata intact)`);

    // Interactive E2E on Home Studio
    await page.goto(`${origin}/`, { waitUntil: 'domcontentloaded' });
    const beforeSonnet = await page.textContent('#kpiSonnet');
    await page.click('[data-preset="coding"]');
    const afterSonnet = await page.textContent('#kpiSonnet');
    assert(beforeSonnet !== afterSonnet, 'Coding preset did not update KPI');
    await page.click('[data-provider="Anthropic"]');
    const anthropicRows = await page.locator('#modelTableBody tr').count();
    assert.strictEqual(anthropicRows, 3, `Expected 3 Anthropic rows, got ${anthropicRows}`);
    await page.click('#tlThemeToggle');
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    assert.strictEqual(theme, 'light', 'Theme toggle failed');

    // Interactive E2E on Token Inspector (Load sample JSON -> Minify -> verify savings banner!)
    await page.goto(`${origin}/tools/token-inspector.html`, { waitUntil: 'domcontentloaded' });
    await page.click('#btnSampleJson');
    const tokBefore = Number((await page.textContent('#kpiTokOpenAI')).replace(/,/g, ''));
    await page.click('#btnMinifyJson');
    const tokAfter = Number((await page.textContent('#kpiTokOpenAI')).replace(/,/g, ''));
    const saveVisible = await page.locator('#minifySavings').isVisible();
    assert(tokAfter < tokBefore && saveVisible, `JSON minifier failed: before=${tokBefore}, after=${tokAfter}, visible=${saveVisible}`);

    // Interactive E2E on Agent Burn, SaaS Margin, RAG TCO, Self-Host GPU vs API & KO Hub
    await page.goto(`${origin}/tools/agent-budget.html`, { waitUntil: 'domcontentloaded' });
    assert.strictEqual(await page.locator('#turnChart .tl-chart-row').count(), 14);
    await page.goto(`${origin}/tools/saas-margin.html`, { waitUntil: 'domcontentloaded' });
    assert((await page.locator('#saasCompareBody tr').count()) === 7);
    await page.goto(`${origin}/tools/rag-calculator.html`, { waitUntil: 'domcontentloaded' });
    assert((await page.textContent('#kpiRagTotal')).includes('$'));
    await page.goto(`${origin}/tools/self-host-vs-api.html`, { waitUntil: 'domcontentloaded' });
    assert((await page.textContent('#kpiBreakEven')).includes('/day'));
    await page.goto(`${origin}/tools/mcp-schema-auditor.html`, { waitUntil: 'domcontentloaded' });
    await page.click('#btnMcpSample');
    assert((await page.locator('#mcpToolTableBody tr').count()) === 3);
    await page.goto(`${origin}/tools/multimodal-budget.html`, { waitUntil: 'domcontentloaded' });
    assert((await page.locator('#voiceCompareBody tr').count()) === 4);
    await page.goto(`${origin}/ko/`, { waitUntil: 'domcontentloaded' });
    assert.strictEqual(await page.evaluate(() => document.documentElement.lang), 'ko');
    assert((await page.locator('#modelTableBody tr').count()) === 24);
    await page.goto(`${origin}/es/`, { waitUntil: 'domcontentloaded' });
    assert.strictEqual(await page.evaluate(() => document.documentElement.lang), 'es');
    await page.goto(`${origin}/tools/ai-runway.html`, { waitUntil: 'domcontentloaded' });
    assert((await page.locator('#runwayTableBody tr').count()) >= 8);
    await page.goto(`${origin}/tools/prompt-diff.html`, { waitUntil: 'domcontentloaded' });
    await page.click('#btnDiffSample');
    assert((await page.textContent('#kpiDiffDelta')).startsWith('-'));
    await page.goto(`${origin}/?embed=1`, { waitUntil: 'domcontentloaded' });
    assert(await page.evaluate(() => document.documentElement.classList.contains('tl-embed-mode')));

    assert.strictEqual(errors.length, 0, `Uncaught page errors: ${errors.join(' | ')}`);
    console.log('[PASS] Interactive E2E tests passed across all 5 workspaces (presets, provider filter, theme, JSON minifier savings, agent chart, SaaS matrix, RAG TCO)');
  } finally {
    await browser.close();
    await new Promise(r => srv.close(r));
  }
}

(async () => {
  runUnitTests();
  await runBrowserTests();
  console.log('\nALL TOKENLEDGER CHECKS PASSED 100%!');
})().catch(e => { console.error(e); process.exit(1); });
